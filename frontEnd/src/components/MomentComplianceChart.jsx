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

const API_URL = 'https://hdmpombo.onrender.com/api/observaciones';

function MomentComplianceChart() {
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMomentData = async () => {
            try{
                const response = await axios.get(`${API_URL}/stats-moment`);
                const data = response.data;

                setChartData({
                    labels: data.map(item => item.momento),
                    datasets: [
                     {
                        label: '% de Cumplimiento',
                        data: data.map(item => item.porcentajeCumplimiento),
                        backgroundColor: 'rgba(255, 159, 64, 0.6)', // Color naranja
                        borderColor: 'rgba(255, 159, 64, 1)',
                        borderWidth: 1,
                    },
                    ],
                });
                setLoading(false);
            } catch (error) {
                console.error("Error cargando datos por momento:", error);
                setLoading(false);
            }
        };
        fetchMomentData()
        }, []);
        const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: 'Cumplimiento por Momentos de la OMS (%)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  if (loading) return <div>Cargando gráfico de momentos...</div>;
  if (!chartData) return <div>No hay datos de momentos disponibles.</div>;

  return (
    <div style={{ height: '400px', backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <Bar options={options} data={chartData} />
    </div>
  );
}

export default MomentComplianceChart;