import React, { useState } from "react";
import clienteAxios from "../api/axiosConfig";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        try {
            //1. peticion al backEnd
            const response = await clienteAxios.post("/auth/login", {
                email,
                password
            });

            //2. extraer el token
            const { token } = response.data;

            //3. guardar en localStorage 
            localStorage.setItem("token", token);

            navigate('/dashboard');
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
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                        <input 
                            type={showPassword ? "text" : "password"} 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            placeholder="********"
                            style={{ width: '100%', padding: '0.7rem', paddingRight: '40px', boxSizing: 'border-box' }}
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ 
                                position: 'absolute', 
                                right: '10px', 
                                background: 'transparent', 
                                border: 'none', 
                                cursor: 'pointer', 
                                fontSize: '1.2rem',
                                padding: '0'
                            }}
                            title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                        >
                            {showPassword ? "👁️‍🗨️" : "👁️"}
                        </button>
                    </div>
                </div>

                <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
                    <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: '#007bff', textDecoration: 'none' }}>¿Olvidaste tu contraseña?</Link>
                </div>

                <button type="submit" style={styles.button}>Entrar</button>

                {/* Agregamos el link de registro */}
                <div style={styles.registerLink}>
                    <p>¿No tienes cuenta?</p>
                    <Link to="/register" style={styles.link}>Crear cuenta aquí</Link>
                </div>
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
    error: { color: 'red', fontSize: '0.9rem', marginBottom: '1rem' },
    registerLink: {
        marginTop: '1.5rem',
        textAlign: 'center',
        fontSize: '0.9rem',
        color: '#666'
    },
    link: {
        color: '#007bff',
        textDecoration: 'none',
        fontWeight: 'bold',
        display: 'block',
        marginTop: '0.3rem'
    }
};

export default Login;
