import { FaHome, FaBell, FaSearch, FaUserCircle } from 'react-icons/fa'

import '../css/Navbar.css'

function Navbar({ profile, onPhotoUpload }) {

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
    return (
        <div className='nav'>
            <nav>

                <div className='nav-left'>
                    {/* logo plus tard */}
                </div>

                <div className="nav-center">
                    <form className="search-box">
                        <FaSearch className='loupe' />
                        <input
                            type="search"
                            id="search"
                            placeholder="Recherche de création, inspiration, et projets"
                        />
                    </form>
                </div>

                <div className="nav-right">
                    <label style={{ cursor: 'pointer' }}>
                        <img
                            src={profile?.photo ? `http://localhost:3000${profile.photo}` : ''}
                            alt="profil"
                        />
                        
                        <input onChange={handlePhotoUpload}
                            type="file"
                            accept="image/*"
                            hidden

                        />
                    </label>
                </div>

            </nav>
        </div>
    )
}

export default Navbar