"use client";
import { useEffect, useRef, useState } from 'react';
import { createChart, CrosshairMode, LineStyle } from 'lightweight-charts';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  Filler,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

// Register Chart.js elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
  Filler
);

interface ChartData {
  labels: string[];
  data: number[];
}

const Dashboard = () => {
  const [candlestickData, setCandlestickData] = useState<any[]>([]);
  const [lineData, setLineData] = useState<ChartData>({ labels: [], data: [] });
  const [barData, setBarData] = useState<ChartData>({ labels: [], data: [] });
  const [pieData, setPieData] = useState<ChartData>({ labels: [], data: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const chartContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const candlestickResponse = await fetch('http://127.0.0.1:8000/api/candlestick-data/');
        const lineResponse = await fetch('http://127.0.0.1:8000/api/line-chart-data/');
        const barResponse = await fetch('http://127.0.0.1:8000/api/bar-chart-data/');
        const pieResponse = await fetch('http://127.0.0.1:8000/api/pie-chart-data/');

        const candlestickResult = await candlestickResponse.json();
        const lineResult = await lineResponse.json();
        const barResult = await barResponse.json();
        const pieResult = await pieResponse.json();

        const formattedCandlestickData = candlestickResult.data.map((item: any) => ({
          time: item.x,
          open: item.open,
          high: item.high,
          low: item.low,
          close: item.close,
        }));

        setCandlestickData(formattedCandlestickData);
        setLineData(lineResult);
        setBarData(barResult);
        setPieData(pieResult);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (candlestickData.length && chartContainerRef.current) {
      const chart = createChart(chartContainerRef.current, {
        layout: {
          background: {
            color: 'rgb(206, 240, 240)',
          },
          textColor: '#000',
        },
        crosshair: {
          mode: CrosshairMode.Normal,
        },
        grid: {
          vertLines: {
            color: '#e1e1e1',
            style: LineStyle.Solid,
          },
          horzLines: {
            color: '#e1e1e1',
            style: LineStyle.Solid,
          },
        },
      });

      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#4caf50',
        downColor: '#f44336',
        borderDownColor: '#f44336',
        borderUpColor: '#4caf50',
        wickDownColor: '#f44336',
        wickUpColor: '#4caf50',
      });

      candlestickSeries.setData(candlestickData);

      return () => {
        chart.remove();
      };
    }
  }, [candlestickData]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="chart-container">
        <div className="chart-box">
          <h2>Candlestick Chart</h2>
          <div className="candle-chart" ref={chartContainerRef}></div>
        </div>
        <div className="chart-box">
          <h2>Line Chart</h2>
          <Line
            className="line-chart"
            data={{
              labels: lineData.labels,
              datasets: [
                {
                  label: 'Line Data',
                  data: lineData.data,
                  fill: true,
                  backgroundColor: 'rgba(75,192,192,0.4)',
                  borderColor: 'rgba(75,192,192,1)',
                },
              ],
            }}
          />
        </div>
        <div className="chart-box">
          <h2>Bar Chart</h2>
          <Bar
            className="bar-chart"
            data={{
              labels: barData.labels,
              datasets: [
                {
                  label: 'Bar Data',
                  data: barData.data,
                  backgroundColor: 'rgba(75,192,192,0.4)',
                },
              ],
            }}
          />
        </div>
        <div className="chart-box">
          <h2>Pie Chart</h2>
          <Pie
            className="pie-chart"
            data={{
              labels: pieData.labels,
              datasets: [
                {
                  label: 'Pie Data',
                  data: pieData.data,
                  backgroundColor: ['rgb(255, 99, 71)', 'lightblue', 'yellow'],
                },
              ],
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;