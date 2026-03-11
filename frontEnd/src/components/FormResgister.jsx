import React, { useState } from 'react';
import clienteAxios from '../api/axiosConfig';
import { useNavigate, Link } from 'react-router-dom';
import './Formulario.css'; // Reutilizamos los estilos que ya creamos

const RegistroUsuario = () => {
    const [userData, setUserData] = useState({
        nombre: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validación básica de contraseñas
        if (userData.password !== userData.confirmPassword) {
            return setMensaje({ texto: "Las contraseñas no coinciden", tipo: "error" });
        }

        try {
            await clienteAxios.post('/auth/register', {
                nombre: userData.nombre,
                email: userData.email,
                password: userData.password
            });

            setMensaje({ texto: "✅ Usuario creado con éxito. Redirigiendo...", tipo: "success" });
            
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            setMensaje({ 
                texto: error.response?.data?.message || "Error al registrar usuario", 
                tipo: "error" 
            });
        }
    };

    return (
        <div className="form-container">
            <form onSubmit={handleSubmit} className="hdm-form">
                <header className="form-header">
                    <h2>CREAR CUENTA</h2>
                    <p>HDM POMBO - Sistema de Vigilancia</p>
                </header>

                {mensaje.texto && <div className={`alert ${mensaje.tipo}`}>{mensaje.texto}</div>}

                <div className="form-section">
                    <label>Nombre Completo (Apellido y Nombre) *</label>
                    <input 
                        type="text" 
                        name="nombre" 
                        placeholder="Ej: Pérez Juan"
                        value={userData.nombre} 
                        onChange={handleChange} 
                        required 
                    />

                    <label>Correo Electrónico *</label>
                    <input 
                        type="email" 
                        name="email" 
                        placeholder="usuario@hospitlapombo.com"
                        value={userData.email} 
                        onChange={handleChange} 
                        required 
                    />

                    <label>Contraseña *</label>
                    <input 
                        type="password" 
                        name="password" 
                        value={userData.password} 
                        onChange={handleChange} 
                        required 
                    />

                    <label>Confirmar Contraseña *</label>
                    <input 
                        type="password" 
                        name="confirmPassword" 
                        value={userData.confirmPassword} 
                        onChange={handleChange} 
                        required 
                    />
                </div>

                <button type="submit" className="btn-submit">Registrar Usuario</button>
                
                <p style={{textAlign: 'center', marginTop: '20px'}}>
                    ¿Ya tienes cuenta? <Link to="/login" style={{color: 'var(--primary-color)', fontWeight: 'bold'}}>Inicia sesión aquí</Link>
                </p>
            </form>
        </div>
    );
};

export default RegistroUsuario;