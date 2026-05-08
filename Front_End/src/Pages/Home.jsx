import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import SideBar from "../components/Sidebar";

import { CiHeart } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";
import { FaRegCommentDots } from "react-icons/fa6";
import { IoShareSocialOutline } from "react-icons/io5";
import { CiBookmark } from "react-icons/ci";

import "../css/Home.css";

function Home() {

    const API = "http://localhost:3000";

    const [posts, setPosts] = useState([]);
    const [profile, setProfile] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [content, setContent] = useState("");
    const [media, setMedia] = useState(null);

    const [likedPosts, setLikedPosts] = useState([]);

    const [showComments, setShowComments] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");

    const [likedComments, setLikedComments] = useState([]);

    // ---------------- PROFILE ----------------
    const fetchProfile = async () => {
        const res = await fetch(`${API}/profile`, { credentials: "include" });
        const data = await res.json();
        setProfile(data);
    };

    // ---------------- POSTS ----------------
    const fetchPosts = async () => {
        const res = await fetch(`${API}/posts`, { credentials: "include" });
        const data = await res.json();
        setPosts(data);
    };

    // ---------------- LIKES POSTS ----------------
    const fetchLikes = async () => {
        const res = await fetch(`${API}/likes`, { credentials: "include" });
        const data = await res.json();
        setLikedPosts(data.map(like => like.post_id));
    };

    const handleLike = async (postId) => {

        const isLiked = likedPosts.includes(postId);

        setLikedPosts(prev =>
            isLiked
                ? prev.filter(id => id !== postId)
                : [...prev, postId]
        );

        await fetch(`${API}/posts/${postId}/like`, {
            method: isLiked ? "DELETE" : "POST",
            credentials: "include"
        });
    };

    // ---------------- COMMENTS ----------------
    const fetchComments = async (postId) => {
        const res = await fetch(`${API}/posts/${postId}/commentaire`, {
            credentials: "include"
        });
        const data = await res.json();
        setComments(data);
    };

    useEffect(() => {
        if (showComments) fetchComments(showComments);
    }, [showComments]);

    const handleComment = async () => {

        await fetch(`${API}/posts/${showComments}/commentaire`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: newComment })
        });

        setNewComment("");
        fetchComments(showComments);
    };

    // ---------------- COMMENT LIKES ----------------
    const fetchCommentLikes = async () => {
        const res = await fetch(`${API}/commentaire/likes`, {
            credentials: "include"
        });

        const data = await res.json();
        setLikedComments(data.map(like => like.comment_id));
    };

    const handleCommentLike = async (commentId) => {

        const isLiked = likedComments.includes(commentId);

        setLikedComments(prev =>
            isLiked
                ? prev.filter(id => id !== commentId)
                : [...prev, commentId]
        );

        await fetch(`${API}/commentaire/${commentId}/like`, {
            method: isLiked ? "DELETE" : "POST",
            credentials: "include"
        });
    };

    // ---------------- INIT ----------------
    useEffect(() => {
        fetchPosts();
        fetchLikes();
        fetchProfile();
        fetchCommentLikes();
    }, []);

    // ---------------- TIME ----------------
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

            <Navbar profile={profile} onPhotoUpload={() => { fetchProfile(); fetchPosts(); }} />

            <div className="home-layout">

                <SideBar onCreatePost={() => setShowModal(true)} profile={profile} />

                <main className="feed">

                    {posts.map(post => (

                        <div key={post.id} className="post">

                            <div className="post-header">
                                <img
                                    src={post.photo ? `${API}${post.photo}` : ""}
                                    className="avatar"
                                />

                                <div>
                                    <p>{post.firstname} {post.lastname}</p>
                                    <p>{post.content}</p>
                                    <small>{timeAgo(post.create_at)}</small>
                                </div>
                            </div>

                            {/* MEDIA */}
                            {post.media_url && post.media_type === "image" && (
                                <img src={`${API}${post.media_url}`} className="post-media" />
                            )}

                            {post.media_url && post.media_type === "video" && (
                                <video controls className="post-media">
                                    <source src={`${API}${post.media_url}`} />
                                </video>
                            )}

                            {/* ACTIONS */}
                            <div className="post-actions">

                                <span onClick={() => handleLike(post.id)}>
                                    {likedPosts.includes(post.id)
                                        ? <FaHeart color="red" />
                                        : <CiHeart />
                                    }
                                </span>

                                <span onClick={() => setShowComments(post.id)}>
                                    <FaRegCommentDots />
                                </span>

                                <IoShareSocialOutline />
                                <CiBookmark />

                            </div>

                        </div>

                    ))}

                </main>
            </div>

            {/* COMMENTS */}
            {showComments && (

                <div className="modal">

                    <div className="modal-content">

                        <h2>Commentaires</h2>

                        <input
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Commentaire..."
                        />

                        <button onClick={handleComment}>Envoyer</button>

                        {comments.map(comment => (

                            <div key={comment.id} className="comment">
                                {/* AVATAR */}
        <img
            src={
                comment.photo
                    ? `${API}${comment.photo}`
                    : "/default-avatar.png"
            }
            className="avatar"
        />

                                <p>
                                    {comment.firstname} {comment.lastname}
                                </p>

                                <p>{comment.content}</p>

                                <span onClick={() => handleCommentLike(comment.id)}>
                                    {likedComments.includes(comment.id)
                                        ? <FaHeart color="red" />
                                        : <CiHeart />
                                    }
                                </span>

                            </div>

                        ))}

                        <button onClick={() => setShowComments(null)}>
                            Fermer
                        </button>

                    </div>

                </div>

            )}

        </div>
    );
}

export default Home;