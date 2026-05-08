import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import SideBar from "../components/Sidebar";
import { CiHeart } from "react-icons/ci";
import { FaHeart } from "react-icons/fa"
import { FaRegCommentDots } from "react-icons/fa6";
import { IoShareSocialOutline } from "react-icons/io5";
import { CiBookmark } from "react-icons/ci";

import "../css/Home.css";

function Home() {
    const [posts, setPosts] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [content, setContent] = useState("");
    const [media, setMedia] = useState(null);
    const [likedPosts, setLikedPosts] = useState([])
    const [showComments, setShowComments] = useState(null)
    const [comments, setComments] = useState([])
    const [newComment, setNewComment] = useState("")
    const [profile, setProfile] = useState(null)

const fetchProfile = async () => {
    const res = await fetch('http://localhost:3000/profile', {
        credentials: 'include'
    })
    const data = await res.json()
    setProfile(data)
}

    const fetchPosts = async () => {
        const res = await fetch("http://localhost:3000/posts", {
            credentials: "include",
        });
        const data = await res.json();
        setPosts(data);
    };

    useEffect(() => {
        fetchPosts();
        fetchLikes()
        fetchProfile()

    }, []);

    const handleLike = async (postId) => {
        if (likedPosts.includes(postId)) {
            await fetch(`http://localhost:3000/posts/${postId}/like`, {
                method: "DELETE",
                credentials: 'include'
            })
            setLikedPosts(likedPosts.filter(id => id !== postId))
        } else {
            await fetch(`http://localhost:3000/posts/${postId}/like`, {
                method: "POST",
                credentials: 'include'
            })
            setLikedPosts([...likedPosts, postId])
        }

    }

    const fetchComments = async () => {
        const res = await fetch(`http://localhost:3000/posts/${showComments}/commentaire`, {
            method: 'GET',
            credentials: "include",
        });
        const data = await res.json();
        setComments(data);
    };

    const fetchLikes = async () => {
        const res = await fetch('http://localhost:3000/likes', {
            credentials: 'include'
        })
        const data = await res.json()
        setLikedPosts(data.map(like => like.post_id))
    }


    useEffect(() => {
        if (showComments) fetchComments()
    }, [showComments])

    const handleComment = async () => {
        await fetch(`http://localhost:3000/posts/${showComments}/commentaire`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: newComment })
        })
        setNewComment("")
        fetchComments()
    }

    const handleCreatePost = async () => {
        const formData = new FormData();
        formData.append("content", content);
        if (media) formData.append("media", media);

        await fetch("http://localhost:3000/posts", {
            method: "POST",
            credentials: "include",
            body: formData,
        });

        setContent("");
        setMedia(null);
        setShowModal(false);
        fetchPosts();
    };

    function timeAgo(dateString) {
        const now = new Date();
        const past = new Date(dateString);
        const diff = Math.floor((now - past) / 1000);

        if (diff < 60) return "à l'instant";
        const min = Math.floor(diff / 60);
        if (min < 60) return `il y a ${min} min`;
        const h = Math.floor(min / 60);
        if (h < 24) return `il y a ${h} h`;
        const d = Math.floor(h / 24);
        return `il y a ${d} j`;
    }

    return (
        <div>
            <Navbar profile={profile} onPhotoUpload={fetchProfile} />

            <div className="home-layout">
                <SideBar onCreatePost={() => setShowModal(true)} profile={profile} onPhotoUpload={fetchProfile} />

                <main className="feed">
                    {posts.map((post) => (
                        <div key={post.id} className="post">

                            {/* HEADER */}
                            <div className="post-header">
                                <img 
    src={post.photo ? `http://localhost:3000${post.photo}` : ''}
    className="avatar"
/>
                                <div className="post-user">
                                    <p className="name">
                                        {post.firstname} {post.lastname}
                                    </p>

                                    <div className="meta">
                                        <p className="post-text">
                                            {post.content},
                                        </p>
                                        <p className="date">
                                            {timeAgo(post.create_at)}
                                        </p>

                                    </div>
                                </div>

                                <div className="dots">⋯</div>
                            </div>

                            {/* MEDIA */}
                            {post.media_url && post.media_type === "image" && (
                                <img
                                    src={`http://localhost:3000${post.media_url}`}
                                    className="post-media"
                                />
                            )}

                            {post.media_url && post.media_type === "video" && (
                                <video controls className="post-media">
                                    <source src={`http://localhost:3000${post.media_url}`} />
                                </video>
                            )}

                            {/* ACTIONS */}
                            <div className="post-actions">
                                <span onClick={() => handleLike(post.id)}>
                                    {likedPosts.includes(post.id)
                                        ? <FaHeart style={{ color: 'red' }} />
                                        : <CiHeart />
                                    }
                                </span>
                                <span onClick={() => setShowComments(post.id)}><FaRegCommentDots /></span>
                                <span><IoShareSocialOutline /></span>
                                <span className="bookmark"><CiBookmark /></span>
                            </div>

                        </div>
                    ))}
                </main>

                <aside className="right-sidebar" />
            </div>

            {/* MODAL */}
            {showModal && (
                <div className="modal">
                    <div className="modal-content">

                        <h2>Créer un post</h2>

                        <input
                            type="file"
                            accept="image/*,video/*"
                            onChange={(e) => setMedia(e.target.files[0])}
                        />

                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Quoi de neuf ?"
                        />

                        <button onClick={handleCreatePost}>
                            Publier
                        </button>

                        <button onClick={() => setShowModal(false)}>
                            Fermer
                        </button>

                    </div>
                </div>
            )}

            {showComments && (

                <div className="modal">
                    <div className="modal-content">
                        <h2>Commentaires</h2>
                        <div className="comment-input">
                            <input
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Écrire un commentaire..."
                            />
                            <button onClick={handleComment}>Envoyer</button>
                        </div>

                        {comments.map((comment) => (
                            
                            <div key={comment.id} className="comment">
                                <p className="comment-author">{comment.firstname} {comment.lastname}</p>
                                <p className="comment-text">{comment.content}</p>
                                <img 
    src={comment.photo ? `http://localhost:3000${comment.photo}` : ''}
    className="avatar"
/>
                            </div>
                        ))}
                        <button onClick={() => setShowComments(null)}>Fermer</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;