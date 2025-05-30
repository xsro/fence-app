import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chart, registerables } from 'chart.js';
import './TrajectoryVisualization.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStepBackward, faPlay, faStepForward, faPause } from '@fortawesome/free-solid-svg-icons';

// 注册Chart.js组件
Chart.register(...registerables);

// 数据类型定义
interface AgentDataPoint {
  time: number[];
  state: {
    agents: [number, number][];
    target: [number, number];
  };
  signals: {
    distance: Record<string, never>;
    rotations: [number, number][];
  }[];
}

// 组件属性定义
interface TrajectoryVisualizationProps {
  data: AgentDataPoint[];
  width?: number;
  height?: number;
  showAgents?: boolean;
  showTarget?: boolean;
  showTrails?: boolean;
  zoomLevel?: number;
  autoPlay?: boolean;
  playSpeed?: number; // 毫秒/帧
}

// 轨迹可视化组件
const TrajectoryVisualization: React.FC<TrajectoryVisualizationProps> = ({
  data,
  width = 800,
  height = 600,
  showAgents = true,
  showTarget = true,
  showTrails = true,
  zoomLevel = 1,
  autoPlay = false,
  playSpeed = 500
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const animationFrame = useRef<number | null>(null);
  const [currentDataIndex, setCurrentDataIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  
  // 格式化时间显示
  const formatTime = (time: number) => time.toFixed(1);
  
  // 创建或更新图表
  const updateChart = useCallback(() => {
    if (!chartRef.current || !data.length) return;
    
    const currentData = data[currentDataIndex];
    if (!currentData) return;
    
    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;
    
    // 销毁现有图表
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    
    // 准备数据集
    const datasets: any[] = [];
    
    // 添加 Agents
    if (showAgents && currentData.state.agents.length > 0) {
      const agentCount = currentData.state.agents.length;
      
      for (let i = 0; i < agentCount; i++) {
        const agentPositions = currentData.state.agents;
        
        // 轨迹线
        if (showTrails) {
          datasets.push({
            label: `Agent ${i+1} 轨迹`,
            data: agentPositions.map(pos => ({ x: pos[0], y: pos[1] })),
            borderColor: getAgentColor(i).border,
            borderWidth: 2,
            pointRadius: 0,
            showLine: true,
            fill: false,
            order: 1
          });
        }
        
        // 当前位置
        datasets.push({
          label: `Agent ${i+1}`,
          data: [{ x: agentPositions[i][0], y: agentPositions[i][1] }],
          backgroundColor: getAgentColor(i).fill,
          borderColor: getAgentColor(i).border,
          borderWidth: 2,
          pointRadius: 8,
          pointHoverRadius: 10,
          order: 3
        });
      }
    }
    
    // 添加 Target
    if (showTarget) {
      const targetPositions = currentData.state.target;
      
      // 轨迹线
      if (showTrails) {
        datasets.push({
          label: 'Target 轨迹',
          data: [{ x: targetPositions[0], y: targetPositions[1] }],
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 2,
          pointRadius: 0,
          showLine: true,
          fill: false,
          order: 1
        });
      }
      
      // 当前位置
      datasets.push({
        label: 'Target',
        data: [{ x: targetPositions[0], y: targetPositions[1] }],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(185, 28, 28, 1)',
        borderWidth: 2,
        pointRadius: 10,
        pointHoverRadius: 12,
        pointStyle: 'star',
        order: 3
      });
    }
    
    // 创建新图表
    chartInstance.current = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 0,
          easing: 'easeOutQuart'
        },
        scales: {
          x: {
            type: 'linear',
            position: 'center',
            title: {
              display: false,
              text: 'X 坐标',
              font: {
                weight: 'bold'
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          y: {
            type: 'linear',
            position: 'center',
            title: {
              display: false,
              text: 'Y 坐标',
              font: {
                weight: 'bold'
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            reverse: true // Y轴方向朝上
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.x !== null) {
                  label += `(${context.parsed.x.toFixed(2)}, ${context.parsed.y.toFixed(2)})`;
                }
                return label;
              }
            }
          }
        }
      }
    });
    
    // 调整坐标轴范围
    adjustChartScale();
  }, [data, currentDataIndex, showAgents, showTarget, showTrails, zoomLevel]);
  
  // 调整图表缩放和范围
  const adjustChartScale = useCallback(() => {
    if (!chartInstance.current) return;
    
    const xValues: number[] = [];
    const yValues: number[] = [];
    
    // 收集所有点的坐标
    chartInstance.current.data.datasets.forEach(dataset => {
      dataset.data.forEach((point: { x: number; y: number }) => {
        xValues.push(point.x);
        yValues.push(point.y);
      });
    });
    
    if (!xValues.length || !yValues.length) return;
    
    const xMin = Math.min(...xValues) - 2;
    const xMax = Math.max(...xValues) + 2;
    const yMin = Math.min(...yValues) - 2;
    const yMax = Math.max(...yValues) + 2;
    
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;
    
    // 应用缩放
    chartInstance.current.options.scales.x.min = xMin - xRange * (zoomLevel - 1) / 2;
    chartInstance.current.options.scales.x.max = xMax + xRange * (zoomLevel - 1) / 2;
    chartInstance.current.options.scales.y.min = yMin - yRange * (zoomLevel - 1) / 2;
    chartInstance.current.options.scales.y.max = yMax + yRange * (zoomLevel - 1) / 2;
     chartInstance.current.options.scales.x.position = 'bottom';
    chartInstance.current.options.scales.y.position = 'left';
    
    chartInstance.current.update();
  }, [zoomLevel]);
  
  // 获取 Agent 颜色
  const getAgentColor = useCallback((index: number) => {
    const colors = [
      { fill: 'rgba(59, 130, 246, 0.8)', border: 'rgba(37, 99, 235, 1)' }, // 蓝色
      { fill: 'rgba(16, 185, 129, 0.8)', border: 'rgba(5, 150, 105, 1)' }, // 绿色
      { fill: 'rgba(249, 115, 22, 0.8)', border: 'rgba(217, 119, 6, 1)' }, // 橙色
      { fill: 'rgba(236, 72, 153, 0.8)', border: 'rgba(190, 24, 93, 1)' }, // 粉色
      { fill: 'rgba(124, 58, 237, 0.8)', border: 'rgba(91, 33, 182, 1)' }  // 紫色
    ];
    return colors[index % colors.length];
  }, []);
  
  // 播放/暂停动画
  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);
  
  // 跳转到上一帧
  const prevFrame = useCallback(() => {
    setCurrentDataIndex(prev => Math.max(0, prev - 1));
  }, []);
  
  // 跳转到下一帧
  const nextFrame = useCallback(() => {
    setCurrentDataIndex(prev => Math.min(data.length - 1, prev + 1));
  }, [data.length]);
  
  // 生命周期钩子
  useEffect(() => {
    updateChart();
  }, [updateChart]);
  
  useEffect(() => {
    if (chartInstance.current) {
      adjustChartScale();
    }
  }, [adjustChartScale]);
  
  // 自动播放动画
  useEffect(() => {
    if (isPlaying && data.length > 1) {
      const play = () => {
        animationFrame.current = window.setTimeout(() => {
          setCurrentDataIndex(prev => (prev + 1) % data.length);
          play();
        }, playSpeed);
      };
      
      play();
    }
    
    return () => {
      if (animationFrame.current) {
        window.clearTimeout(animationFrame.current);
      }
    };
  }, [isPlaying, data.length, playSpeed]);
  
  // 清理函数
  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      if (animationFrame.current) {
        window.clearTimeout(animationFrame.current);
      }
    };
  }, []);
  
  return (
    <div className="trajectory-visualization">
      
      {/* 控制面板 */}
      <div className="control-panel">
        <div className="time-display">
          {data.length > 0 && (
            <span>
              时间: {formatTime(data[currentDataIndex].time)}s
              &nbsp;&nbsp;({currentDataIndex + 1}/{data.length})
            </span>
          )}
        </div>
        
        <div className="buttons">
          <button onClick={prevFrame} disabled={currentDataIndex === 0} className="control-button">
            <FontAwesomeIcon icon={faStepBackward} /> 
          </button>
          
          <button onClick={togglePlay} className="control-button play-button">
            <FontAwesomeIcon icon={isPlaying?faPause:faPlay} /> 
          </button>
          
          <button onClick={nextFrame} disabled={currentDataIndex === data.length - 1} className="control-button">
            <FontAwesomeIcon icon={faStepForward} /> 
          </button>
        </div>
      </div>
      <div className="chart-container">
        <canvas ref={chartRef} />
      </div>
    </div>
  );
};

export default TrajectoryVisualization;