import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../css/Login.css'

function Login() {
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const [message, setMessage] = useState({
        text: "",
        type: ""
    })

    const handleSubmit = async (e) => {
        e.preventDefault()

        setMessage({ text: "", type: "" })

        if (!email || !password) {
            setMessage({
                text: "Veuillez remplir tous les champs",
                type: "error"
            })
            return
        }

        try {
            const res = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password })
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
                text: "Connexion réussie",
                type: "success"
            })

            setTimeout(() => {
                navigate('/home')
            }, 1000)

        } catch (err) {
            setMessage({
                text: "Erreur serveur",
                type: "error"
            })
        }
    }

    return (
        <div className='login-form'>

            {message.text && (
                <div className={`toast ${message.type}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit}>

                <label>Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} />

                <label>Password</label>
                <input type='password' value={password} onChange={(e) => setPassword(e.target.value)} />

                <a href="/ForgotPassword">Mot de passe oublié</a>

                <button type='submit'>Connexion</button>

                <p>
                    Pas encore de compte ?
                    <a href="/register"> Inscrivez-vous</a>
                </p>
            </form>

        </div>
    )
}

export default Login