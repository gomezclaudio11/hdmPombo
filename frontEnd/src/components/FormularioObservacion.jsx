import React, { useState } from 'react';
import clienteAxios from '../api/axiosConfig';
import { jwtDecode } from "jwt-decode";
import "./Formulario.css";
import { useNavigate } from 'react-router-dom';
import { SECTORES, TURNOS, ROLES_PROFESIONALES, MOMENTOS, ACCIONES } from '../utils/constants';

const FormularioObservacion = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState(() => {
        const token = localStorage.getItem("token");
        let nombre = "Usuario";
        if (token) {
            try {
                const decoded = jwtDecode(token);
                nombre = decoded.nombre || "Usuario";
            } catch {
                // ignore
            }
        }
        return {
            observador: nombre,
            sector: '',
            turno: '',
            profesional: '',
            momento: '',
            accion: ''
        };
    });

    const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await clienteAxios.post('/observaciones', formData);
            setMensaje({ texto: "✅ Registro guardado con éxito", tipo: "success" });
            setFormData({ 
                observador: formData.observador,
                sector: '',
                turno: '',
                profesional: '',
                momento: '',
                accion: ""
            }); 
            setTimeout(() => {
                navigate("/dashboard");
            }, 1500);
        } catch {
            setMensaje({ texto: "Error al guardar", tipo: "error" });
        }
    };

    return (
       <div className="form-container">
            <form onSubmit={handleSubmit} className="hdm-form">
                <header className="form-header">
                    <h2>Higiene de Manos POMBO</h2>
                    <p>Carga de Oportunidades</p>
                </header>

                {mensaje.texto && (
                    <div className={`alert ${mensaje.tipo}`}>
                        {mensaje.texto} 
                    </div>
                )}

                <div className="form-section">
                    <label>Observador Logueado:</label>
                    <input 
                        type="text" 
                        name="observador" 
                        value={formData.observador} 
                        readOnly 
                        className="input-readonly"
                    />
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <label>Sector *</label>
                            <select name="sector" value={formData.sector} onChange={handleChange} required>
                                <option value="">Seleccione Sector...</option>
                                {SECTORES.map(sector => (
                                    <option key={sector} value={sector}>{sector}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label>Turno *</label>
                            <select name="turno" value={formData.turno} onChange={handleChange} required>
                                <option value="">Seleccione Turno...</option>
                                {TURNOS.map(turno => (
                                    <option key={turno} value={turno}>{turno}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            
                <div className="form-section highlight">
                    <label>Personal al que observó *</label>
                    <select name="profesional" value={formData.profesional} onChange={handleChange} required>
                        <option value="">Seleccione Personal...</option>
                        {ROLES_PROFESIONALES.map(rol => (
                            <option key={rol} value={rol}>{rol}</option>
                        ))}
                    </select>
                
                    <label style={{ marginTop: '20px' }}>Momento que observa *</label>
                    <div className="options-grid">
                        {MOMENTOS.map(m => (
                            <label key={m} className="radio-label">
                                <input type="radio" 
                                name="momento" 
                                value={m} 
                                checked={formData.momento === m} 
                                onChange={handleChange} 
                                required />
                                 <span>{m}</span>
                            </label>
                        ))}
                    </div>

                    <label style={{ marginTop: '20px' }}>Acción que realizó *</label>
                    <div className="options-grid">
                        {ACCIONES.map(a => (
                            <label key={a} className={`radio-label ${a === 'Ninguna' ? 'danger-hover' : ''}`}>
                                <input 
                                type="radio" 
                                name="accion" 
                                value={a} 
                                checked={formData.accion === a} 
                                onChange={handleChange} 
                                required /> 
                                <span>{a}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <button type="submit" className="btn-submit">
                    Registrar Oportunidad
                </button>
            </form>
        </div>
    );
};

export default FormularioObservacion;
