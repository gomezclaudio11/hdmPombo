import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Registrar los componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const API_URL = 'http://localhost:3001/api/observaciones';

function SectorComplianceChart() {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSectorData = async () => {
      try {
        const response = await axios.get(`${API_URL}/stats-sector`);
        const data = response.data;

        // Preparamos los datos para Chart.js
        setChartData({
          labels: data.map(item => item.sector), // Nombres de los sectores
          datasets: [
            {
              label: '% de Cumplimiento',
              data: data.map(item => item.porcentajeCumplimiento),
              backgroundColor: 'rgba(54, 162, 235, 0.6)', // Color azul con transparencia
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
            },
          ],
        });
        setLoading(false);
      } catch (error) {
        console.error("Error cargando datos por sector:", error);
        setLoading(false);
      }
    };

    fetchSectorData();
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: 'Cumplimiento de Higiene por Sector (%)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100, // Los porcentajes no superan el 100
      },
    },
  };

  if (loading) return <div>Cargando gráfico...</div>;
  if (!chartData) return <div>No hay datos disponibles</div>;

  return (
    <div style={{ height: '400px', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <Bar options={options} data={chartData} />
    </div>
  );
}

export default SectorComplianceChart;