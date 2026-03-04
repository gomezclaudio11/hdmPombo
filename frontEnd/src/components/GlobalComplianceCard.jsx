import React, { useState, useEffect } from 'react';
//es una librería de JavaScript que sirve para hacer peticiones 
// HTTP desde la aplicación (el Frontend) hacia un servidor (el Backend).
import clienteAxios from '../api/axiosConfig';

// La URL base de tu API de Express
//const API_URL = 'https://hdmpombo.onrender.com/api/observaciones';

/**
 * Componente Tarjeta de Cumplimiento Global
 * Fetches data from /api/observaciones/global and displays the result.
 */
function GlobalComplianceCard({ mes, anio }) {
    const [data, setData] = useState(null);// cuando la aplicacion arranca no hay datos
    //xq la peticion todavia no se hizo al poner null decimos todavia no tengo info
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [ anio, setAnio ] = useState("2025")

    useEffect(() => {
        // Función asíncrona para cargar los datos
        const fetchData = async () => {
            try {
                // Realizar la petición al endpoint de cumplimiento global
                const response = await clienteAxios.get(`/observaciones/global-compliance${mes ? `?mes=${mes}` : ''}&anio=${anio}`); //ordenador ternario / query parameter
                
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
    }, [mes]); 

    if (loading) {
        return <div className="card">Cargando datos...</div>;
    }

    if (error) {
        return <div className="card error">Error: {error}</div>;
    }

    //  Usamos valores por defecto para que NUNCA sea undefined
    const porcentajeCumplimiento = data?.porcentajeCumplimiento || 0;
    const totalObservaciones = data?.totalObservaciones || 0;
    
    // Determinar el color de la tarjeta basado en el cumplimiento (Opcional, pero bueno para KPIs)
    const cardClass = porcentajeCumplimiento >= 80 ? 'compliance-high' : 
                     porcentajeCumplimiento >= 60 ? 'compliance-medium' : 
                     'compliance-low';

    return (
        <div className={`compliance-card ${cardClass}`}>
            <h2>Cumplimiento Global</h2>
            <div className="percentage-display">
                {Number(porcentajeCumplimiento).toFixed(2)}%
            </div>
            <p className="subtitle">
                Basado en {totalObservaciones} observaciones.
            </p>
        </div>
        
    );
}

export default GlobalComplianceCard;