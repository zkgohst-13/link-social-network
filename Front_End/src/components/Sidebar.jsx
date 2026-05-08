import { GoHome } from 'react-icons/go'
import { MdOutlineExplore } from "react-icons/md"
import { IoIosNotificationsOutline } from "react-icons/io"
import { FaRegEnvelope } from "react-icons/fa6"
import { PiBookmarkSimpleBold } from "react-icons/pi"
import { TbDeviceAnalytics } from "react-icons/tb"
import { IoSettingsOutline } from "react-icons/io5"
import { FaAffiliatetheme } from "react-icons/fa6";
import { useLocation } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import '../css/SideBar.css'

function SideBar({ onCreatePost, profile, onPhotoUpload  }) {

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        const formData = new FormData()
        formData.append('photo', file)

        const res = await fetch('http://localhost:3000/profile/photo', {
            method: 'PUT',
            credentials: 'include',
            body: formData
        })
        const data = await res.json()
         onPhotoUpload() 
    }

    const [hovered, setHovered] = useState(null)
    const location = useLocation()
    return (
        <div className='sidebar-container'>

            {/* PROFILE */}
            <div className='profile-block'>
                <label >
                    <img
                        src={profile?.photo ? `http://localhost:3000${profile.photo}` : ''}
                        alt="profil"
                        className="avatar"
                    />

                </label>

                <div className="profile-info">
                    <p>{profile?.firstname} {profile?.lastname}</p>
                    <span>@{profile?.firstname?.toLowerCase()}</span>
                </div>
            </div>


            <div className='side-bar'>

                <ul onMouseLeave={() => setHovered(null)}>
                    <Link to="/home">
                        <li
                            className={(location.pathname === '/home' && hovered === null) || hovered === 'home' ? 'active' : ''}
                            onMouseEnter={() => setHovered('home')}>
                            <GoHome className="icon" />
                            <span>Home</span>
                        </li>
                    </Link>

                    <Link to="/explore">
                        <li
                            className={(location.pathname === '/explore' && hovered === null) || hovered === 'explore' ? 'active' : ''}
                            onMouseEnter={() => setHovered('explore')}>

                            <MdOutlineExplore className="icon" />
                            <span>Explore</span>
                        </li>
                    </Link>

                    <Link to="/notification">
                        <li className={(location.pathname === '/notifications' && hovered === null) || hovered === 'notifications' ? 'active' : ''}
                            onMouseEnter={() => setHovered('notifications')}>
                            <IoIosNotificationsOutline className="icon" />
                            <span>Notifications</span>
                        </li>
                    </Link>


                    <Link to="/messages">
                        <li className={(location.pathname === '/messages' && hovered === null) || hovered === 'messages' ? 'active' : ''}
                            onMouseEnter={() => setHovered('messages')}>
                            <FaRegEnvelope className="icon" />
                            <span>Messages</span>
                        </li>
                    </Link>

                    <Link to="/signets">
                        <li className={(location.pathname === '/signets' && hovered === null) || hovered === 'signets' ? 'active' : ''}
                            onMouseEnter={() => setHovered('signets')}>
                            <PiBookmarkSimpleBold className="icon" />
                            <span>Signets</span>
                        </li>
                    </Link>
                    <Link to="/analytique">
                        <li className={(location.pathname === '/analytique' && hovered === null) || hovered === 'analytique' ? 'active' : ''}
                            onMouseEnter={() => setHovered('analytique')}>
                            <TbDeviceAnalytics className="icon" />
                            <span>Analytique</span>
                        </li>
                    </Link>

                    <Link to="/theme">
                        <li className={(location.pathname === '/theme' && hovered === null) || hovered === 'theme' ? 'active' : ''}
                            onMouseEnter={() => setHovered('theme')}>
                            <FaAffiliatetheme className="icon" />
                            <span>Theme</span>
                        </li>
                    </Link>

                    <Link to="/options">
                        <li className={(location.pathname === '/options' && hovered === null) || hovered === 'options' ? 'active' : ''}
                            onMouseEnter={() => setHovered('options')}>
                            <IoSettingsOutline className="icon" />
                            <span>Options</span>
                        </li>
                    </Link>
                </ul>

            </div >

            <button className="create-post" onClick={onCreatePost}>
                Create Post
            </button>
        </div>
    )
}

export default SideBar