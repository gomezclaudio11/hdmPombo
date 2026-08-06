import React, { useState } from "react";
import clienteAxios from "../api/axiosConfig";
import { useNavigate, Link } from "react-router-dom";
import './Formulario.css';

const Login = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        
        try {
            const response = await clienteAxios.post("/auth/login", {
                email,
                password
            });

            const { token } = response.data;
            localStorage.setItem("token", token);
            navigate('/dashboard');
        } catch (error) {
            setError(error.response?.data?.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <form onSubmit={handleSubmit} className="hdm-form" style={{ maxWidth: '420px' }}>
                <header className="form-header">
                    <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🏥</div>
                    <h2>Hospital Pombo</h2>
                    <p>Sistema de Vigilancia de Higiene</p>
                </header>
                
                {error && <div className="alert error">{error}</div>}

                <div className="form-section">
                    <label>Correo Electrónico *</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                        placeholder="usuario@hospitalpombo.com"
                    />

                    <label>Contraseña *</label>
                    <div className="password-wrapper">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                            placeholder="********"
                        />
                        <button 
                            type="button" 
                            className="password-toggle-btn"
                            onClick={() => setShowPassword(!showPassword)}
                            title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                        >
                            {showPassword ? "👁️‍🗨️" : "👁️"}
                        </button>
                    </div>

                    <div style={{ textAlign: 'right', marginTop: '-10px', marginBottom: '20px' }}>
                        <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}>
                            ¿Olvidaste tu contraseña?
                        </Link>
                    </div>
                </div>

                <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? 'Iniciando sesión...' : 'Entrar al Sistema'}
                </button>

                <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    <p style={{ margin: 0 }}>¿No tienes cuenta de observador?</p>
                    <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '700', display: 'inline-block', marginTop: '4px' }}>
                        Solicitar registro aquí
                    </Link>
                </div>
            </form>
        </div>
    );
};

export default Login;
