console.log("BACKEND EN MARCHE")

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const multer = require('multer');

require('dotenv').config();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
    }
})


const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser())
app.use('/uploads', express.static('uploads'));

const db = mysql.createConnection({
    host: process.env.HOTE,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database');
});

app.post('/register', async (req, res) => {
    const { firstname, lastname, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query(
        'INSERT INTO users (firstname, lastname, email, password) VALUES (?, ?, ?, ?)',
        [firstname, lastname, email, hashedPassword],
        (err, result) => {

            if (err && err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({
                    message: "Email déjà utilisé"
                });
            }

            if (err) {
                console.error(err)
                return res.status(500).json({
                    message: "Impossible de créer le compte"
                });
            }

            return res.status(201).json({
                message: "Inscription réussie Tu peux maintenant te connecter"
            });
        }
    );
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.query('SELECT * FROM users WHERE email = ? ', [email,], async (err, results) => {
        if (err) {
            console.error('Error logging in:', err);
            res.status(500).send('Error logging in');
            return;
        }
        if (results.length === 0) {
            res.status(400).json({ message: "Email ou mot de passe incorrect" });
            return;
        }
        const users = results[0];
        const isPasswordValid = await bcrypt.compare(password, users.password);
        if (!isPasswordValid) {
            res.status(400).json({ message: "Email ou mot de passe incorrect" });
            return;
        }

        jwt.sign({ id: users.id }, process.env.JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) {
                console.error('Error generating token:', err);
                res.status(500).send('Error logging in');
                return;
            }
            res.cookie('token', token, { httpOnly: true, sameSite: 'lax' })
            res.json({ message: 'Login successful' });
        });
    });
});

const authenticateToken = (req, res, next) => {
    const token = req.cookies.token
    if (!token) return res.status(401).send('Access denied');
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).send('Invalid token');
        req.user = user;
        next();
    });
};


app.post('/forgot-password', (req, res) => {
    console.log("🔥 HIT FORGOT PASSWORD")
    const { email } = req.body
    db.query('SELECT * FROM users WHERE email = ? ', [email], async (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Erreur serveur' })
        }
        if (results.length === 0) {
            return res.status(404).json('Email non trouvé')
        }
        const resetToken = crypto.randomBytes(32).toString('hex')
        const expires = new Date(Date.now() + 3600000)
        db.query('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE email = ?', [resetToken, expires, email], (err, result) => {
            if (err) {
    return res.status(500).json({ message: 'Erreur update DB' })
}
            transporter.sendMail({
                from: process.env.GMAIL_USER,
                to: email,
                subject: 'Réinitialisation de mot de passe',
                html: `
<div style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
  <div style="max-width:500px; margin:auto; background:white; padding:25px; border-radius:10px;">

    <h2 style="color:#111;">Réinitialisation de mot de passe</h2>

    <p>Tu as demandé à réinitialiser ton mot de passe.</p>

    <p>Clique sur le bouton ci-dessous :</p>

    <a href="http://localhost:5173/reset-password?token=${resetToken}"
       style="
        display:inline-block;
        margin-top:10px;
        padding:12px 20px;
        background:#4f46e5;
        color:#fff;
        text-decoration:none;
        border-radius:6px;
        font-weight:bold;
       ">
       Réinitialiser mon mot de passe
    </a>

    <p style="margin-top:20px; font-size:12px; color:gray;">
      ⚠️ Ce lien expire dans 1 heure.
    </p>

  </div>
</div>
`
            })
                .then(() =>
                    res.json({ message: 'Email envoyé' }))
                .catch(() => res.status(500).json({ message: 'Erreur envoi email' }))
        })

    })
})

app.post('/reset-password', (req, res) => {
    const { token, password } = req.body

    db.query(
        'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > ?',
        [token, new Date()],
        async (err, results) => {

            if (err) {      
                return res.status(500).json({ message: 'Erreur serveur' })
            }

            if (results.length === 0) {
                return res.status(400).json({ message: 'Token invalide ou expiré' })
            }

            try {
                const hashedPassword = await bcrypt.hash(password, 10)
                const userId = results[0].id

                db.query(
                    'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
                    [hashedPassword, userId],
                    (err2) => {

                        if (err2) {
                            return res.status(500).json({ message: 'Erreur mise à jour mot de passe' })
                        }

                        return res.json({ message: 'Mot de passe mis à jour avec succès' })
                    }
                )

            } catch (error) {
                return res.status(500).json({ message: 'Erreur hashing mot de passe' })
            }
        }
    )
})


app.put('/profile/photo', authenticateToken, upload.single('photo'), (req, res) => {
    const photoUrl = `/uploads/${req.file.filename}`
    db.query('UPDATE users SET photo = ? WHERE id = ?', [photoUrl, req.user.id], (err) => {
        if (err) return res.status(500).json({ message: 'Erreur' })
        res.json({ photo: photoUrl })
    })
})

app.get('/profile', authenticateToken, (req, res) => {
    db.query('SELECT firstname, lastname, photo FROM users WHERE id = ?', [req.user.id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur' })
        res.json(results[0])
    })
})
app.post('/posts', authenticateToken, upload.single('media'), (req, res) => {
    const { content } = req.body;
    const mediaUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const mediaType = req.file ? req.file.mimetype.split('/')[0] : null;
    db.query('INSERT INTO posts (user_id, content, media_url, media_type) VALUES (?, ?, ?, ?)', [req.user.id, content, mediaUrl, mediaType], (err, result) => {
        if (err) {
            console.error('Error creating post:', err);
            res.status(500).send('Error creating post');
            return;
        }
        res.status(201).send('Post created successfully');
    });
});

app.get('/posts', authenticateToken, (req, res) => {
    db.query('SELECT posts.id, posts.content, users.photo, users.firstname, users.lastname, posts.media_url, posts.media_type, posts.create_at FROM posts JOIN users ON posts.user_id = users.id', (err, results) => {
        if (err) {
            console.error('Error fetching posts:', err);
            res.status(500).send('Error fetching posts');
            return;
        }
        res.json(results);
    });
});

app.put('/posts/:id', authenticateToken, (req, res) => {
    const { content } = req.body;
    const postId = req.params.id;
    db.query('UPDATE posts SET content = ? WHERE id = ? AND user_id = ?', [content, postId, req.user.id], (err, result) => {
        if (err) {
            console.error('Error updating post:', err);
            res.status(500).send('Error updating post');
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).send('Post not found or unauthorized');
            return;
        }
        res.send('Post updated successfully');
    });
});

app.delete('/posts/:id', authenticateToken, (req, res) => {
    const postId = req.params.id;
    db.query('DELETE FROM posts WHERE id = ? AND user_id = ?', [postId, req.user.id], (err, result) => {
        if (err) {
            console.error('Error deleting post:', err);
            res.status(500).send('Error deleting post');
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).send('Post not found or unauthorized');
            return;
        }
        res.send('Post deleted successfully');
    });
});

app.post('/posts/:id/like', authenticateToken, (req, res) => {
    const postId = req.params.id;
    db.query('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [req.user.id, postId], (err, result) => {
        if (err) {
            console.error('Error liking post:', err);
            res.status(500).send('Error liking post');
            return;
        }
        res.send('Post liked successfully');
    });
});

app.get('/likes', authenticateToken, (req, res) => {
    db.query('SELECT post_id FROM likes WHERE user_id = ?', [req.user.id], (err, results) => {
        if (err) return res.status(500).json({ message: 'Erreur' })
        res.json(results)
    })
})

app.delete('/posts/:id/like', authenticateToken, (req, res) => {
    const postId = req.params.id;
    db.query('DELETE FROM likes WHERE user_id = ? AND post_id = ?', [req.user.id, postId], (err, result) => {
        if (err) {
            console.error('Error unliking post:', err);
            res.status(500).send('Error unliking post');
            return;
        }
        res.send('Post unliked successfully');
    });
});

app.post('/posts/:id/commentaire', authenticateToken, (req, res) => {
    const postId = req.params.id;
    const { content } = req.body;
    db.query('INSERT INTO commentaire (user_id, post_id, content) VALUES (?, ?, ?)', [req.user.id, postId, content], (err, result) => {
        if (err) {
            console.error('Error adding comment:', err);
            res.status(500).send('Error adding comment');
            return;
        }
        res.status(201).send('Comment added successfully');
    });
});

app.get('/posts/:id/commentaire', authenticateToken, (req, res) => {
    const postId = req.params.id;
    db.query('SELECT commentaire.id, commentaire.content, users.photo, users.firstname, users.lastname FROM commentaire JOIN users ON commentaire.user_id = users.id WHERE commentaire.post_id = ?', [postId], (err, results) => {
        if (err) {
            console.error('Error fetching commentaire :', err);
            res.status(500).send('Error fetching commentaire ');
            return;
        }
        res.json(results);
    });
});

app.put('/commentaire/:id', authenticateToken, (req, res) => {
    const commentId = req.params.id;
    const { content } = req.body;
    db.query('UPDATE commentaire SET content = ? WHERE id = ? AND user_id = ?', [content, commentId, req.user.id], (err, result) => {
        if (err) {
            console.error('Error updating comment:', err);
            res.status(500).send('Error updating comment');
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).send('Comment not found or unauthorized');
            return;
        }
        res.send('Comment updated successfully');
    });
});

app.delete('/commentaire/:id', authenticateToken, (req, res) => {
    const commentId = req.params.id;
    db.query('DELETE FROM commentaire WHERE id = ? AND user_id = ?', [commentId, req.user.id], (err, result) => {
        if (err) {
            console.error('Error deleting comment:', err);
            res.status(500).send('Error deleting comment');
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).send('Comment not found or unauthorized');
            return;
        }
        res.send('Comment deleted successfully');
    });
});

app.post('/commentaire/:id/like', authenticateToken, (req, res) => {

    const commentId = req.params.id;

    db.query(
        'INSERT INTO comment_likes (user_id, comment_id) VALUES (?, ?)',
        [req.user.id, commentId],
        (err) => {

            if (err) {
                console.error(err);
                return res.status(500).send('Error liking comment');
            }

            res.send('Comment liked');
        }
    );
});

app.get('/commentaire/likes', authenticateToken, (req, res) => {

    db.query(
        'SELECT comment_id FROM comment_likes WHERE user_id = ?',
        [req.user.id],
        (err, results) => {

            if (err) {
                return res.status(500).json({ message: 'Erreur' });
            }

            res.json(results);
        }
    );
});

app.delete('/commentaire/:id/like', authenticateToken, (req, res) => {

    const commentId = req.params.id;

    db.query(
        'DELETE FROM comment_likes WHERE user_id = ? AND comment_id = ?',
        [req.user.id, commentId],
        (err) => {

            if (err) {
                console.error(err);
                return res.status(500).send('Error unliking comment');
            }

            res.send('Comment unliked');
        }
    );
});


app.post('/follows', authenticateToken, (req, res) => {
    const { following_id } = req.body
    db.query('INSERT INTO follows (follower_id, following_id) VALUES (?,?)', [req.user.id, following_id], (err, result) => {
        if (err) {
            console.error("Error following :", err);
            res.status(500).send('Error following');
            return;
        }
        res.status(201).send('Following successfully');

    });
});

app.delete('/follows', authenticateToken, (req, res) => {
    const { following_id } = req.body
    db.query('DELETE FROM follows WHERE follower_id = ? AND following_id = ?', [req.user.id, following_id,], (err, result) => {
        if (err) {
            console.error('Error unfollow post:', err);
            res.status(500).send('Error unfollowing post');
            return;
        }
        res.send(' unfollowing successfully');
    });
});

app.post('/message', authenticateToken, (req, res) => {
    const { receive_id, content } = req.body
    const sender_id = req.user.id
    db.query('INSERT INTO message (sender_id, receive_id , content) VALUES (?,?,?)', [sender_id, receive_id, content], (err, result) => {
        if (err) {
            console.error('Error sending message:', err)
            res.status(500).send('Error receiving message')
            return;
        }
        res.send('Message sent successfuly')

    });
});

app.get('/message', authenticateToken, (req, res) => {
    const receiver_id = req.user.id;
    db.query('SELECT message.id, message.content, sender_id FROM message JOIN users ON message.sender_id = users.id WHERE receive_id = ? ', [receiver_id], (err, results) => {
        if (err) {
            console.error('Error receive message:', err)
            res.status(500).send('Error receive message ')
            return;
        }
        res.json(results)
    });
});

app.put('/message/:id', authenticateToken, (req, res) => {
    const { content } = req.body;
    const messageId = req.params.id;
    db.query('UPDATE message SET content = ? WHERE id = ? AND sender_id = ?', [content, messageId, req.user.id], (err, result) => {
        if (err) {
            console.error('Error update message:', err)
            res.status(500).send('Error update message')
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).send('Message not found or unauthorized')
            return;
        }
        res.send('Message update successfully')
    });
});

app.delete('/message/:id', authenticateToken, (req, res) => {
    const messageId = req.params.id;
    db.query('DELETE FROM message WHERE id = ? AND sender_id = ?', [messageId, req.user.id], (err, result) => {
        if (err) {
            console.error('Error delete message:', err)
            res.status(500).send('Error delete message')
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).send('Message not found or unauthorized')
            return;
        }
        res.send('Message delete successfully')

    });

});

app.get('/notification', authenticateToken, (req, res) => {
    db.query('SELECT notification.id, notification.type, notification.is_read, notification.create_at FROM notification WHERE user_id = ? ', [req.user.id], (err, results) => {
        if (err) {
            console.error('Error notification', err)
            res.status(500).send('Error notification')
            return;
        }
        res.json(results)
    });
});

app.put('/notification/:id', authenticateToken, (req, res) => {
    db.query('UPDATE notification SET is_read = true WHERE id = ? AND user_id = ? ', [req.params.id, req.user.id], (err, result) => {
        if (err) {
            console.error('Error update notification', err)
            res.status(500).send('Error update notification')
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).send('Notification not found or unauthorized')
            return;
        }
        res.send('Notification update successfully')
    });
});


app.delete('/notification/:id', authenticateToken, (req, res) => {
    db.query('DELETE FROM notification WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], (err, result) => {
        if (err) {
            console.error('Error delete notification', err);
            res.status(500).send('Error delete notification')
            return;
        }
        if (result.affectedRows === 0) {
            res.status(404).send('Notification not found or unauthorized')
            return;
        }
        res.send('Notification update successfully')

    });
});


app.listen(3000, () => {
    console.log('Server is running on port http://localhost:3000');
});