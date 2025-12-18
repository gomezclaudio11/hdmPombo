import { useState, useEffect } from "react";
import axios from "axios";

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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// La URL base de tu API de Express
const API_URL = 'http://localhost:3001/api/observaciones';

function ProfessionalRankingChart() {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfessionalData = async () => {
            try {
                const response = await axios.get(`${API_URL}/stats-professional`);
                const data = response.data;

                setChartData({
                    labels: data.map(item => item.rol), // "Enfermeria", "Medico", etc.
                    datasets: [
                        {
                        label: '% de Cumplimiento',
                        data: data.map(item => item.porcentajeCumplimiento),
                        backgroundColor: 'rgba(75, 192, 192, 0.6)', // Un color verde agua/teal
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                        },
                    ],
                });
                setLoading(false)
            }  catch (error) {
                console.error("Error cargando ranking profesional", error);
                setLoading(false)
            } 
            };
            fetchProfessionalData();
        }, []);

const options = {
    indexAxis: 'y', // <--- ESTO LO HACE HORIZONTAL
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, // Ocultamos leyenda para que sea más limpio
      title: {
        display: true,
        text: 'Ranking de Cumplimiento por Rol Profesional (%)',
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  if (loading) return <div>Cargando ranking...</div>;
  if (!chartData) return <div>Error al cargar datos.</div>;

  return (
    <div style={{ height: '400px', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <Bar options={options} data={chartData} />
    </div>
  )
};

export default ProfessionalRankingChart;

