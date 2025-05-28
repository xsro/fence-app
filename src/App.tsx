// src/App.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line,Scatter } from 'react-chartjs-2';
import { Menu, MenuItem, Button, Divider } from '@mui/material';
import styled from '@emotion/styled';
// import { useTheme } from '@mui/material/styles';
import TrajectoryVisualization from './TrajectoryVisualization';
import * as client from './client/main';
import TabbedInterface from './tab';

// 注册Chart.js组件
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// 自定义样式组件
const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
`;

const MenuBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background-color: #1e293b;
  color: white;
  height: 3rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ContentArea = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const LeftPanel = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  padding: 1rem;
  background-color: #0f172a;
  @media (max-width: 768px) {
    display: none;
  }
`;

const RightPanel = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 1rem;
  gap: 1rem;
  background-color: #0f172a;
`;

const ChartContainer = styled.div`
  flex: 1;
  background-color: #1e293b;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

// 应用主组件
const App = () => {
  // const theme = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isMenuOpen = Boolean(anchorEl);

  // 生成随机数据
  const generateData = () => {
    const labels = Array.from({ length: 12 }, (_, i) => `Data ${i + 1}`);
    const data = Array.from({ length: 12 }, () => Math.floor(Math.random() * 100));
    return { labels, datasets: [{ data, borderColor: '#3b82f6', tension: 0.4 }] };
  };

  // Canvas初始化
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置Canvas尺寸为正方形并适应容器
    const container = canvas.parentElement;
    if (!container) return;
    
    const size = Math.min(container.clientWidth, container.clientHeight);
    canvas.width = size;
    canvas.height = size;

    // 绘制示例图形
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 4, 0, Math.PI * 2);
    ctx.fill();

    // 添加响应式调整
    const handleResize = () => {
      const newSize = Math.min(container.clientWidth, container.clientHeight);
      canvas.width = newSize;
      canvas.height = newSize;
      
      // 重新绘制
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#3b82f6';
      ctx.beginPath();
      ctx.arc(newSize / 2, newSize / 2, newSize / 4, 0, Math.PI * 2);
      ctx.fill();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 菜单处理
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const sampleData = {
    "time": [0.0],
    "state": {
      "agents": [[7.0, 10.0], [3.0, 10.0], [-1.0, 10.0]],
      "target": [3.0, 10.0]
    },
    "signals": [
      {
        "distance": {},
        "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]]
      }
    ]
  };

  return (
    <TabbedInterface></TabbedInterface>
  );
};

export default App;