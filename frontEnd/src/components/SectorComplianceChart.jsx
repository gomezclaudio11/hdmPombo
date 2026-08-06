import React, { useState, useEffect } from 'react';
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
import { useFilters } from '../context/FilterContext';
import clienteAxios from '../api/axiosConfig';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function SectorComplianceChart() {
  const { mes, anio } = useFilters();
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSectorData = async () => {
      try {
        const response = await clienteAxios.get(`/observaciones/stats-sector?anio=${anio}${mes ? `&mes=${mes}` : ''}`);
        const data = response.data;

        setChartData({
          labels: data.map(item => item.sector),
          datasets: [
            {
              label: '% de Cumplimiento',
              data: data.map(item => item.porcentajeCumplimiento),
              backgroundColor: 'rgba(30, 58, 138, 0.75)',
              borderColor: 'rgba(30, 58, 138, 1)',
              borderWidth: 1.5,
              borderRadius: 6,
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
  }, [mes, anio]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: 'Cumplimiento de Higiene por Sector (%)',
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
      y: {
        beginAtZero: true,
        max: 100,
        grid: { color: '#F1F5F9' },
        ticks: { font: { family: "'Plus Jakarta Sans', sans-serif" } }
      },
      x: {
        grid: { display: false },
        ticks: { font: { family: "'Plus Jakarta Sans', sans-serif", weight: '500' } }
      }
    },
  };

  if (loading) return <div className="chart-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p>Cargando gráfico por sector...</p></div>;
  if (!chartData) return <div className="chart-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><p>No hay datos disponibles.</p></div>;

  return (
    <div className="chart-container">
      <Bar options={options} data={chartData} />
    </div>
  );
}

export default SectorComplianceChart;
