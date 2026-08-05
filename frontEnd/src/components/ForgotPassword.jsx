import React, { useState } from 'react';
import clienteAxios from '../api/axiosConfig';
import { Link } from 'react-router-dom';
import './Formulario.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje({ texto: '', tipo: '' });
        setLoading(true);

        try {
            const response = await clienteAxios.post('/auth/forgot-password', { email });
            setMensaje({ 
                texto: response.data.message || 'Se han enviado las instrucciones a tu correo.', 
                tipo: 'success' 
            });
        } catch (error) {
            setMensaje({ 
                texto: error.response?.data?.details || error.response?.data?.message || 'Error al procesar la solicitud', 
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
                    <h2>RECUPERAR CONTRASEÑA</h2>
                    <p>HDM POMBO</p>
                </header>

                {mensaje.texto && <div className={`alert ${mensaje.tipo}`}>{mensaje.texto}</div>}

                <div className="form-section">
                    <label>Correo Electrónico *</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="usuario@hospitlapombo.com"
                        required 
                    />
                </div>

                <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? 'Enviando...' : 'Enviar Instrucciones'}
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

export default ForgotPassword;
