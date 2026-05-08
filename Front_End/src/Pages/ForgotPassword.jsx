import { useState } from "react";
import { useNavigate } from "react-router-dom";
import '../css/ForgotPass.css'

function ForgotPassword() {

    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [message, setMessage] = useState({
        text: "",
        type: ""
    })

    const handleSubmit = async (e) => {
        e.preventDefault()

        setMessage({ text: "", type: "" })

        const res = await fetch('http://localhost:3000/forgot-password', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        })

        const data = await res.json()

        if (res.ok) {
            setMessage({
                text: "Un lien a été envoyé dans votre boîte mail",
                type: "success"
            })


        } else {
            setMessage({
                text: data.message || "Erreur",
                type: "error"
            })
        }
    }

    return (
        <div className="forgot-form">

            {message.text && (
                <div className={`toast ${message.type}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit}>

                <label>Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <button type="submit">Envoyer</button>

            </form>
        </div>
    )
}

export default ForgotPassword