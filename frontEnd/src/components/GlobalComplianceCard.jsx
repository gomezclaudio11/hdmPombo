import React, { useState, useEffect } from 'react';
import clienteAxios from '../api/axiosConfig';
import { useFilters } from '../context/FilterContext';

function GlobalComplianceCard() {
    const { mes, anio } = useFilters();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await clienteAxios.get(`/observaciones/global-compliance?anio=${anio}${mes ? `&mes=${mes}` : ''}`);
                setData(response.data);
                setLoading(false);
            } catch (err) {
                console.error("Error al obtener datos globales:", err);
                setError("No se pudo conectar con la API o la base de datos.");
                setLoading(false);
            }
        };

        fetchData();
    }, [mes, anio]); 

    if (loading) {
        return (
            <div className="compliance-card" style={{ minHeight: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="subtitle">Calculando cumplimiento global...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="compliance-card compliance-low" style={{ minHeight: '180px' }}>
                <h2>Cumplimiento Global</h2>
                <div style={{ fontSize: '1.1rem', margin: '15px 0', color: '#FEE2E2' }}>{error}</div>
            </div>
        );
    }

    const porcentajeCumplimiento = data?.porcentajeCumplimiento || 0;
    const totalObservaciones = data?.totalObservaciones || 0;
    
    const cardClass = porcentajeCumplimiento >= 80 ? 'compliance-high' : 
                     porcentajeCumplimiento >= 60 ? 'compliance-medium' : 
                     'compliance-low';

    return (
        <div className={`compliance-card ${cardClass}`}>
            <h2>Cumplimiento Global de Higiene</h2>
            <div className="percentage-display">
                {Number(porcentajeCumplimiento).toFixed(2)}%
            </div>
            <p className="subtitle">
                Basado en <strong>{totalObservaciones}</strong> observaciones registradas según los estándares OMS.
            </p>
        </div>
    );
}

export default GlobalComplianceCard;
