import React, { useRef, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import './StockChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
);

const StockChart = ({ 
  data, 
  height = 400, 
  showVolume = false, 
  comparison = false,
  title = "Stock Price Chart",
  period = "1M"
}) => {
  const chartRef = useRef(null);

  // Color palette for multiple stocks
  const colors = [
    { border: '#3B82F6', background: 'rgba(59, 130, 246, 0.1)' }, // Blue
    { border: '#EF4444', background: 'rgba(239, 68, 68, 0.1)' },   // Red
    { border: '#10B981', background: 'rgba(16, 185, 129, 0.1)' },  // Green
    { border: '#F59E0B', background: 'rgba(245, 158, 11, 0.1)' },  // Amber
    { border: '#8B5CF6', background: 'rgba(139, 92, 246, 0.1)' },  // Violet
  ];

  const formatData = () => {
    console.log('StockChart formatData called with:', data);
    
    if (!data || (Array.isArray(data) && data.length === 0)) {
      console.log('No data available, returning empty datasets');
      return { datasets: [] };
    }

    if (comparison && Array.isArray(data)) {
      // Multiple stocks comparison
      const datasets = data.map((stock, index) => {
        const color = colors[index % colors.length];
        const stockHistory = stock.history || stock.data || [];
        
        console.log(`Processing stock ${stock.symbol} with ${stockHistory.length} data points`);
        
        return {
          label: `${stock.symbol} - ${stock.name || stock.symbol}`,
          data: stockHistory.map(point => ({
            x: new Date(point.date || point.time),
            y: point.close || point.price || point.y || 0
          })),
          borderColor: color.border,
          backgroundColor: color.background,
          borderWidth: 2,
          fill: false,
          tension: 0.1,
          pointRadius: 0,
          pointHoverRadius: 4,
        };
      });

      return { datasets };
    } else {
      // Single stock
      const stockData = Array.isArray(data) ? data : (data.data || data.history || []);
      const color = colors[0];
      
      console.log(`Processing single stock with ${stockData.length} data points`);
      
      return {
        datasets: [
          {
            label: 'Price',
            data: stockData.map(point => ({
              x: new Date(point.date || point.time),
              y: point.close || point.price || point.y || 0
            })),
            borderColor: color.border,
            backgroundColor: color.background,
            borderWidth: 2,
            fill: true,
            tension: 0.1,
            pointRadius: 0,
            pointHoverRadius: 4,
          }
        ]
      };
    }
  };

  const getPeriodUnit = (period) => {
    switch (period) {
      case '1D': return 'hour';
      case '1W': return 'day';
      case '1M': case '3M': return 'day';
      case '6M': case '1Y': return 'week';
      case '5Y': return 'month';
      default: return 'day';
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold'
        },
        color: '#374151'
      },
      legend: {
        display: comparison,
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#374151',
        bodyColor: '#6B7280',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        displayColors: true,
        callbacks: {
          title: (tooltipItems) => {
            const date = new Date(tooltipItems[0].parsed.x);
            return date.toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
          },
          label: (context) => {
            const value = context.parsed.y;
            const label = context.dataset.label || 'Price';
            return `${label}: $${value.toFixed(2)}`;
          },
          afterBody: (tooltipItems) => {
            if (!comparison && tooltipItems.length > 0) {
              const dataIndex = tooltipItems[0].dataIndex;
              const stockData = Array.isArray(data) ? data : (data.data || []);
              const point = stockData[dataIndex];
              
              if (point && point.volume) {
                return [
                  '',
                  `Open: $${point.open.toFixed(2)}`,
                  `High: $${point.high.toFixed(2)}`,
                  `Low: $${point.low.toFixed(2)}`,
                  `Volume: ${point.volume.toLocaleString()}`
                ];
              }
            }
            return [];
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: getPeriodUnit(period),
          displayFormats: {
            hour: 'MMM dd, HH:mm',
            day: 'MMM dd',
            week: 'MMM dd',
            month: 'MMM yyyy',
            year: 'yyyy'
          }
        },
        grid: {
          display: true,
          color: '#F3F4F6'
        },
        ticks: {
          color: '#6B7280',
          maxTicksLimit: 8
        }
      },
      y: {
        position: 'right',
        grid: {
          display: true,
          color: '#F3F4F6'
        },
        ticks: {
          color: '#6B7280',
          callback: function(value) {
            return '$' + value.toFixed(2);
          }
        }
      }
    },
    elements: {
      point: {
        hoverRadius: 6,
        hoverBorderWidth: 2
      }
    }
  };

  const chartData = formatData();

  if (!chartData.datasets.length || !chartData.datasets[0].data.length) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <svg className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No chart data</h3>
          <p className="mt-1 text-sm text-gray-500">No historical data available for the selected period.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div style={{ height: `${height}px` }}>
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    </div>
  );
};

export default StockChart;