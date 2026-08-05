import React, { useState } from 'react';
import clienteAxios from '../api/axiosConfig';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import './Formulario.css';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje({ texto: '', tipo: '' });

        if (password !== confirmPassword) {
            return setMensaje({ texto: 'Las contraseñas no coinciden', tipo: 'error' });
        }

        if (!token) {
            return setMensaje({ texto: 'Token de recuperación no válido o faltante', tipo: 'error' });
        }

        setLoading(true);

        try {
            const response = await clienteAxios.post('/auth/reset-password', {
                token,
                password
            });

            setMensaje({ 
                texto: response.data.message || 'Contraseña restablecida con éxito. Redirigiendo...', 
                tipo: 'success' 
            });

            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (error) {
            setMensaje({ 
                texto: error.response?.data?.details || error.response?.data?.message || 'Error al restablecer la contraseña', 
                tipo: 'error' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <form onSubmit={handleSubmit} className="hdm-form" style={{ maxWidth: '400px' }}>
                <header className="form-header">
                    <h2>NUEVA CONTRASEÑA</h2>
                    <p>HDM POMBO</p>
                </header>

                {mensaje.texto && <div className={`alert ${mensaje.tipo}`}>{mensaje.texto}</div>}

                <div className="form-section">
                    <label>Nueva Contraseña *</label>
                    <div className="password-wrapper">
                        <input 
                            type={showPassword ? "text" : "password"} 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="Mínimo 8 caracteres, mayúscula y número"
                            required 
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

                    <label>Confirmar Nueva Contraseña *</label>
                    <div className="password-wrapper">
                        <input 
                            type={showConfirmPassword ? "text" : "password"} 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            placeholder="Repite la contraseña"
                            required 
                        />
                        <button 
                            type="button" 
                            className="password-toggle-btn"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            title={showConfirmPassword ? "Ocultar contraseña" : "Ver contraseña"}
                        >
                            {showConfirmPassword ? "👁️‍🗨️" : "👁️"}
                        </button>
                    </div>
                </div>

                <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
                </button>

                <p style={{ textAlign: 'center', marginTop: '20px' }}>
                    <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: 'bold', textDecoration: 'none' }}>
                        ← Volver al Login
                    </Link>
                </p>
            </form>
        </div>
    );
};

export default ResetPassword;
