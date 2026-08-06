import { useState, useEffect } from "react";
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
import { useFilters } from "../context/FilterContext";
import clienteAxios from '../api/axiosConfig';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function ProfessionalRankingChart() {
    const { mes, anio } = useFilters();
    const [chartData, setChartData] = useState(null); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfessionalData = async () => {
            try {
                const response = await clienteAxios.get(`/observaciones/stats-professional?anio=${anio}${mes ? `&mes=${mes}` : ''}`);
                const data = response.data;

                setChartData({
                    labels: data.map(item => item.profesional),
                    datasets: [
                        {
                            label: '% de Cumplimiento',
                            data: data.map(item => item.porcentajeCumplimiento),
                            backgroundColor: 'rgba(6, 182, 212, 0.75)',
                            borderColor: 'rgba(6, 182, 212, 1)',
                            borderWidth: 1.5,
                            borderRadius: 6,
                        },
                    ],
                });
                setLoading(false);
            } catch (error) {
                console.error("Error cargando ranking profesional", error);
                setLoading(false);
            } 
        };
        fetchProfessionalData();
    }, [mes, anio]);

    const options = {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: {
                display: true,
                text: 'Ranking de Cumplimiento por Rol Profesional (%)',
                font: {
                  size: 15,
                  family: "'Plus Jakarta Sans', sans-serif",
                  weight: '700'
                },
                color: '#0F172A',
                padding: { bottom: 20 }
            },
            tooltip: {
                backgroundColor: '#0F172A',
                titleFont: { size: 13, family: "'Plus Jakarta Sans', sans-serif" },
                bodyFont: { size: 13, family: "'Plus Jakarta Sans', sans-serif" },
                padding: 12,
                cornerRadius: 8,
            }
        },
        scales: {
            x: {
                beginAtZero: true,
                max: 100,
                grid: { color: '#F1F5F9' },
                ticks: { font: { family: "'Plus Jakarta Sans', sans-serif" } }
            },
            y: {
                grid: { display: false },
                ticks: {
                    autoSkip: false,
                    maxRotation: 0,
                    minRotation: 0,
                    font: {
                      size: 11,
                      family: "'Plus Jakarta Sans', sans-serif",
                      weight: '500'
                    }
                }
            }
        },
    };

    if (loading) return <div className="chart-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p>Cargando ranking profesional...</p></div>;
    if (!chartData) return <div className="chart-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p>No hay datos disponibles.</p></div>;

    return (
        <div className="chart-container">
            <Bar options={options} data={chartData} />
        </div>
    );
}

export default ProfessionalRankingChart;
