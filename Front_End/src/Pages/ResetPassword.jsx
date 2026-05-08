import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import '../css/ResetPass.css'

function ResetPassword() {

    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token')

    const [pass, setPass] = useState("")
    const [confirmPass, setConfirmPass] = useState("")

    const [message, setMessage] = useState({
        text: "",
        type: ""
    })

    const handleSubmit = async (e) => {
        e.preventDefault()

        setMessage({ text: "", type: "" })

        if (!pass || !confirmPass) {
            setMessage({
                text: "Veuillez remplir tous les champs",
                type: "error"
            })
            return
        }

        if (pass !== confirmPass) {
            setMessage({
                text: "Les mots de passe ne correspondent pas",
                type: "error"
            })
            return
        }

        try {
            const res = await fetch('http://localhost:3000/reset-password', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password: pass })
            })

            const data = await res.json()

            if (!res.ok) {

                let errorText = data.message || "Erreur"

                // 🔥 TRADUCTION UX
                if (errorText.includes("Token")) {
                    errorText =
                        "Ce lien a expiré ou n'est plus valide."
                }

                setMessage({
                    text: errorText,
                    type: "error"
                })

                return
            }

            setMessage({
                text: "Mot de passe mis à jour avec succès",
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
        <div className="reset-form">

            {message.text && (
                <div className={`toast ${message.type}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit}>

                <label>Nouveau mot de passe</label>
                <input
                    type="password"
                    value={pass}
                    onChange={(e) => setPass(e.target.value)}
                />

                <label>Confirmer mot de passe</label>
                <input
                    type="password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                />

                <button type="submit">Envoyer</button>

            </form>
        </div>
    )
}

export default ResetPassword