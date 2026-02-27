import React, { useEffect, useState } from 'react';
import clienteAxios from '../api/axiosConfig';
import jwtDecode from "jwt-decode"
import { Form } from 'react-router-dom';

const FormularioObservacion = () => {
    const [formData, setFormData] = useState({
        observador: "",
        sector: '',
        turno: "",
        profesional: '',
        momento: '',
        accion: ""
    });

    const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

    // Al cargar el componente extraemos el nombre del token
    useEffect (() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setFormData(prev => ({ ...prev, observador: decoded.nombre || "Ususario"}))
            } catch (error) {
                console.error("Error al decodificar el token", error)
            }
        }
    }, [])

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Gracias al interceptor, NO necesitamos pasar el token aquí
            await clienteAxios.post('/observaciones', formData);
            setMensaje({ texto: "Registro existoso", tipo: "success" })

            setFormData( prev => ({ 
                ...prev,
                profesional: '', 
                momento: '', 
                accion: ""
            })); 
            setTimeout(() => setMensaje({ texto: "", tipo: "" }), 3000)
        } catch (error) {
            setMensaje({ texto: "Error al guardar", tipo: "error" })
        }
    };

    return (
       <div className="form-container">
            <form onSubmit={handleSubmit} className="hdm-form">
                <header className="form-header">
                    <h2>HDM POMBO - REGISTRO SEGURO</h2>
                    <p>Carga de Oportunidades - Marzo 2026</p>
                </header>

                {mensaje.texto && <div className={`alert ${mensaje.tipo}`}>{mensaje.texto}</div>}

                <div className="form-section">
                    <label>Observador Logueado:</label>
                    <input 
                        type="text" 
                        name="observador" 
                        value={formData.observador} 
                        readOnly 
                        className="input-readonly"
                    />
                    <small>El nombre se asigna automáticamente por seguridad.</small>

                    <label>Sector *</label>
                    <select name="sector" value={formData.sector} onChange={handleChange} required>
                        <option value="">Seleccione Sector...</option>
                        <option value="7mo piso">7mo piso</option>
                        <option value="6to piso">6to piso</option>
                        <option value="5to piso">5to piso</option>
                        <option value="4to piso">4to piso</option>
                        <option value="UTI ADULTO">UTI ADULTO</option>
                        <option value="GUARDIA">GUARDIA</option>
                    </select>

                    <label>Turno *</label>
                    <select name="turno" value={formData.turno} onChange={handleChange} required>
                        <option value="">Seleccione Turno...</option>
                        <option value="Mañana">Mañana</option>
                        <option value="Tarde">Tarde</option>
                        <option value="Noche A">Noche A</option>
                        <option value="Noche B">Noche B</option>
                        <option value="SADOFE">SADOFE</option>
                        <option value="SADOFE NOCHE">SADOFE NOCHE</option>
                    </select>
                </div>

                {/* --- SECCIÓN OBSERVACIÓN --- */}
                <div className="form-section highlight">
                    <label>Personal al que observó *</label>
                    <select name="profesional" value={formData.profesional} onChange={handleChange} required>
                        <option value="">Seleccione Personal...</option>
                        <option value="Medico Clinico">Medico Clinico</option>
                        <option value="Residente de Clinica">Residente de Clinica</option>
                        <option value="Medico de UTI adultos">Medico de UTI adultos</option>
                        <option value="Medico Cirujano (Staff y Residente)">Medico Cirujano (Staff y Residente)</option>
                        <option value="Medico Urologo (Staff y Residente)">Medico Urologo (Staff y Residente)</option>
                        <option value="Medico Traumatologo (Staff y Residente)">Medico Traumatologo (Staff y Residente)</option>
                        <option value="Medico Infectologo (Staff y Residente)">Medico Infectologo (Staff y Residente)</option>
                        <option value="Medico Nefrologo (Staff y Residente)">Medico Nefrologo (Staff y Residente)</option>
                        <option value="Medico Ginecologo (Staff y Residente)">Medico Ginecologo (Staff y Residente)</option>
                        <option value="Medico Oncologo (Staff y Residente)">Medico Oncologo (Staff y Residente)</option>
                        <option value="Enfermeria">Enfermeria</option>
                        <option value="Tec. Hemoterapia">Tec. Hemoterapia</option>
                        <option value="Tec. Hemodialisis">Tec. Hemodialisis</option>
                        <option value="Tec. Laboratorio">Tec. Laboratorio</option>
                        <option value="Imagenes (ecografista y RX)">Imagenes (ecografista y RX)</option>
                        <option value="Kinesiologo">Kinesiologo</option>
                        <option value="Mucama">Mucama</option>
                        <option value="Auxiliar de alimentación">Auxiliar de alimentación</option>
                        <option value="Nutricionista">Nutricionista</option>
                        <option value="Camillero">Camillero</option>
                    </select>
                
                <label>Momento que observa *</label>
                    <div className="options-grid">
                        {[
                            'Antes de tocar al paciente',
                            'Antes de realizar técnica Aseptica',
                            'Despues de tocar fluidos',
                            'Despues de tocar al paciente',
                            'Despues de tocar entorno'
                        ].map(m => (
                            <label key={m} className="radio-label">
                                <input type="radio" name="momento" value={m} checked={formData.momento === m} onChange={handleChange} required /> {m}
                            </label>
                        ))}
                    </div>

                    <label>Acción que realizó *</label>
                    <div className="options-grid">
                        {[
                            'Higiene con solución alcoholica',
                            'Ninguna',
                            'Agua y Jabón (solo en Guardia)'
                        ].map(a => (
                            <label key={a} className="radio-label">
                                <input type="radio" name="accion" value={a} checked={formData.accion === a} onChange={handleChange} required /> {a}
                            </label>
                        ))}
                    </div>
                </div>
                <button type="submit" className="btn-submit">Registrar Oportunidad</button>
            </form>
        </div>
    );
};

export default FormularioObservacion;