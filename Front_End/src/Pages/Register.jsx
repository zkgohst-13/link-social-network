import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../css/Register.css'

function Register() {
    const navigate = useNavigate()

    const [firstname, setFirstname] = useState("")
    const [lastname, setLastname] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const [message, setMessage] = useState({
        text: "",
        type: ""
    })

    const isValidEmail = (email) => {
        return /\S+@\S+\.\S+/.test(email)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        setMessage({ text: "", type: "" })

        if (!firstname || !lastname || !email || !password) {
            setMessage({
                text: "Veuillez remplir tous les champs",
                type: "error"
            })
            return
        }

        if (!isValidEmail(email)) {
            setMessage({
                text: "Email invalide",
                type: "error"
            })
            return
        }

        try {
            const res = await fetch('http://localhost:3000/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstname, lastname, email, password })
            })

            const data = await res.json()

            if (!res.ok) {
                setMessage({
                    text: data.message,
                    type: "error"
                })
                return
            }

            setMessage({
                text: data.message,
                type: "success"
            })

            setTimeout(() => {
                navigate('/login')
            }, 1200)

        } catch (err) {
            setMessage({
                text: "Erreur serveur",
                type: "error"
            })
        }
    }

    return (
        <div className="register-page">

            {message.text && (
                <div className={`toast ${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="register-card">

                <form onSubmit={handleSubmit}>

                    <label>Prénom</label>
                    <input
                        value={firstname}
                        onChange={(e) => setFirstname(e.target.value)}
                    />

                    <label>Nom</label>
                    <input
                        value={lastname}
                        onChange={(e) => setLastname(e.target.value)}
                    />

                    <label>Email</label>
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <label>Mot de passe</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <button type="submit">Créer un compte</button>

                    <p className="login-link">
                        Vous avez déjà un compte ?
                        <a href="/login"> Se connecter</a>
                    </p>

                </form>

            </div>
        </div>
    )
}

export default Register