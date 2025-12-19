import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';

const API_URL = 'https://hdmpombo.onrender.com/api/observaciones';

// Lista de sectores (puedes agregar más según tu Excel)
const SECTORES = ["UTI ADULTO", "GUARDIA", "4to piso", "5to piso", "6to piso", "7to piso"];

function SectorDetailDashboard() {
  const [sectorSeleccionado, setSectorSeleccionado] = useState(SECTORES[0]);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDetalleData = async () => {
      setLoading(true);
      try {
        // 1. Usamos la URL dinámica que creamos en el Back-End
        // encodeURIComponent es vital porque nombres como "UTI POMBO" tienen espacios
        const response = await axios.get(`${API_URL}/stats-sector-detalle/${encodeURIComponent(sectorSeleccionado)}`);
        const data = response.data;

        setChartData({
          labels: data.map(item => item.personal),
          datasets: [
            {
              label: `% Cumplimiento en ${sectorSeleccionado}`,
              data: data.map(item => item.porcentajeCumplimiento),
              backgroundColor: 'rgba(153, 102, 255, 0.6)', // Un color violeta para diferenciar
              borderColor: 'rgba(153, 102, 255, 1)',
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        console.error("Error cargando detalle por sector:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetalleData();
  }, [sectorSeleccionado]); // <-- El efecto se dispara cada vez que cambias el sector

  const options = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: { beginAtZero: true, max: 100 } },
    plugins: {
        legend: { display: false }
    }
  };

  return (
    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginTop: '20px' }}>
      
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
        <h3 style={{ margin: 0 }}>Análisis Detallado por Sector:</h3>
        
        {/* SELECTOR DINÁMICO */}
        <select 
          value={sectorSeleccionado} 
          onChange={(e) => setSectorSeleccionado(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '16px' }}
        >
          {SECTORES.map(sec => (
            <option key={sec} value={sec}>{sec}</option>
          ))}
        </select>
      </div>

      <div style={{ height: '400px' }}>
        {loading ? (
          <p>Cargando datos de {sectorSeleccionado}...</p>
        ) : chartData ? (
          <Bar options={options} data={chartData} />
        ) : (
          <p>No hay datos para este sector.</p>
        )}
      </div>
    </div>
  );
}

export default SectorDetailDashboard;
/**
 encodeURIComponent: Como tus sectores tienen espacios (ej: "UTI adulto"), 
 el navegador no puede enviarlos así en la URL. Esta función convierte el 
 espacio en %20 para que el Back-End lo reciba correctamente.

Estado Dependiente (useEffect con [sectorSeleccionado]): Este es el "corazón"
 de la interactividad. Le decimos a React: "Cada vez que el usuario cambie el
  valor del select, vuelve a ejecutar la petición a la API".

Filtrado en el Servidor: En lugar de traer todos los datos y filtrar en React,
 le pedimos al Back-End (MongoDB) que haga el trabajo pesado. Esto es mucho 
 más eficiente cuando tienes miles de registros
 */