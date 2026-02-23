import React, { useState } from 'react';
import clienteAxios from '../api/axiosConfig';

const FormularioObservacion = () => {
    const [formData, setFormData] = useState({
        sector: '',
        turno: "",
        profesional: '',
        momento: '',
        cumple: true
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Gracias al interceptor, NO necesitamos pasar el token aquí
            await clienteAxios.post('/observaciones', formData);
            alert("Observación guardada con éxito");
            setFormData({ sector: '', turno: "", profesional: '', momento: '', cumple: true }); // Limpiar
        } catch (error) {
            console.error(error);
            alert("Error: Tal vez no tienes permisos de Observador");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-white shadow rounded">
            <h3>Nueva Observación</h3>
            <label>Sector:</label>
            <input 
                type="text" 
                value={formData.sector} 
                onChange={(e) => setFormData({...formData, sector: e.target.value})} 
                required 
            />
            
            <label>Turno:</label>
            <input 
                type="text" 
                value={formData.turno} 
                onChange={(e) => setFormData({...formData, turno: e.target.value})} 
                required 
            />
            <label>Momento:</label>
            <select value={formData.momento} onChange={(e) => setFormData({...formData, momento: e.target.value})}>
                <option value="">Seleccione...</option>
                <option value="Antes del contacto">Antes del contacto</option>
                <option value="Después del contacto">Después del contacto</option>
            </select>

            <label>
                ¿Cumple la técnica?:
                <input 
                    type="checkbox" 
                    checked={formData.cumple} 
                    onChange={(e) => setFormData({...formData, cumple: e.target.checked})} 
                />
            </label>

            <button type="submit">Enviar al Sistema</button>
        </form>
    );
};

export default FormularioObservacion;