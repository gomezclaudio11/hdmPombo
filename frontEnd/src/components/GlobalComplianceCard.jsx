import React, { useState, useEffect } from 'react';
import axios from 'axios';

// La URL base de tu API de Express
const API_URL = 'https://hdmpombo.onrender.com/api/observaciones';

/**
 * Componente Tarjeta de Cumplimiento Global
 * Fetches data from /api/observaciones/global and displays the result.
 */
function GlobalComplianceCard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Función asíncrona para cargar los datos
        const fetchData = async () => {
            try {
                // Realizar la petición al endpoint de cumplimiento global
                const response = await axios.get(`${API_URL}/global-compliance`);
                
                // Guardar solo los datos relevantes (porcentaje, total, etc.)
                setData(response.data);
                
                setLoading(false); // La carga ha terminado
            } catch (err) {
                console.error("Error al obtener datos globales:", err);
                setError("No se pudo conectar con la API o la base de datos.");
                setLoading(false);
            }
        };

        fetchData();
    }, []); // El array vacío asegura que la función se ejecute solo una vez al montar el componente

    if (loading) {
        return <div className="card">Cargando datos...</div>;
    }

    if (error) {
        return <div className="card error">Error: {error}</div>;
    }

    // Desestructuración para leer el porcentaje
    const { porcentajeCumplimiento, totalObservaciones } = data;
    
    // Determinar el color de la tarjeta basado en el cumplimiento (Opcional, pero bueno para KPIs)
    const cardClass = porcentajeCumplimiento >= 80 ? 'compliance-high' : 
                     porcentajeCumplimiento >= 60 ? 'compliance-medium' : 
                     'compliance-low';

    return (
        <div className={`compliance-card ${cardClass}`}>
            <h2>Cumplimiento Global</h2>
            <div className="percentage-display">
                {porcentajeCumplimiento}%
            </div>
            <p className="subtitle">
                Basado en {totalObservaciones} observaciones.
            </p>
        </div>
    );
}

export default GlobalComplianceCard;