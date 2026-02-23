import React, { useState } from "react";
import axios from "axios";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        try {
            //1. peticion al backEnd en Render
            const response = await axios.post("https://hdmpombo.onrender.com/api/auth/login", {
                email,
                password
            });

            //2. extraer el token
            const { token } = response.data;

            //3. guardar en localStorage 
            localStorage.setItem("token", token);

            // Opcional: Forzar un refresh si necesitas que el App.js detecte el cambio
            window.location.href = "/dashboard"; 
        } catch (error) {
            // Manejo de errores (Credenciales incorrectas, etc.)
            setError(error.response?.data?.message || 'Error al iniciar sesión');
        }
    };

    return (
        <div style={styles.container}>
            <form onSubmit={handleSubmit} style={styles.form}>
                <h2>Hospital Pombo - Login</h2>
                
                {error && <p style={styles.error}>{error}</p>}

                <div style={styles.inputGroup}>
                    <label>Email:</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        placeholder="email"
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label>Contraseña:</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                        placeholder="********"
                    />
                </div>

                <button type="submit" style={styles.button}>Entrar</button>
            </form>
        </div>
    );
};

// Estilos 
const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f7f6' },
    form: { padding: '2rem', background: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '300px' },
    inputGroup: { marginBottom: '1rem', display: 'flex', flexDirection: 'column' },
    button: { width: '100%', padding: '0.7rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
    error: { color: 'red', fontSize: '0.9rem', marginBottom: '1rem' }
};

export default Login;
