import React, { useRef, useEffect, useState } from 'react';

// 定义数据类型
type Position = [number, number];

interface Data {
  time: number[];
  state: {
    agents: Position[];
    target: Position;
  };
  signals: {
    distance: Record<string, never>;
    rotations: Position[];
  }[];
}

interface AgentVisualizerProps {
  data: Data;
  agentRadius?: number;
  agentColors?: string[];
  targetRadius?: number;
  targetColor?: string;
  showLabels?: boolean;
  backgroundColor?: string;
  gridSize?: number;
  gridColor?: string;
}

const AgentVisualizer: React.FC<AgentVisualizerProps> = ({
  data,
  agentRadius = 8,
  agentColors = ['#3498db', '#e74c3c', '#2ecc71', '#f39c12', '#9b59b6'],
  targetRadius = 12,
  targetColor = '#f1c40f',
  showLabels = true,
  backgroundColor = '#f9f9f9',
  gridSize = 50,
  gridColor = '#eee',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  // 初始化和重绘
  useEffect(() => {
    resizeCanvas();
    draw();
  }, [data, zoom, offsetX, offsetY]);

  // 响应窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      resizeCanvas();
      draw();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 调整Canvas尺寸
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  };

  // 绘制场景
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas || !data || !data.state) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    
    // 设置背景色
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, rect.width, rect.height);

    // 应用变换
    ctx.save();
    ctx.translate(offsetX + rect.width / 2, offsetY + rect.height / 2);
    ctx.scale(zoom, zoom);

    // 绘制网格背景（可选）
    drawGrid(ctx, rect);

    // 绘制target
    if (data.state.target && data.state.target.length >= 2) {
      const [tx, ty] = data.state.target;
      
      // 绘制目标圆
      ctx.beginPath();
      ctx.arc(tx, ty, targetRadius, 0, Math.PI * 2);
      ctx.fillStyle = targetColor;
      ctx.fill();
      
      // 绘制目标十字
      ctx.beginPath();
      ctx.moveTo(tx - targetRadius / 2, ty);
      ctx.lineTo(tx + targetRadius / 2, ty);
      ctx.moveTo(tx, ty - targetRadius / 2);
      ctx.lineTo(tx, ty + targetRadius / 2);
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // 绘制目标标签
      if (showLabels) {
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText('Target', tx, ty + targetRadius + 5);
      }
    }

    // 绘制agents
    if (data.state.agents && Array.isArray(data.state.agents)) {
      data.state.agents.forEach((agent, index) => {
        if (agent.length >= 2) {
          const [ax, ay] = agent;
          const color = agentColors[index % agentColors.length];
          
          // 绘制agent圆
          ctx.beginPath();
          ctx.arc(ax, ay, agentRadius, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
          
          // 绘制agent方向
          if (data.signals && data.signals.length > 0 && 
              data.signals[0].rotations && data.signals[0].rotations.length > index) {
            const [rotX, rotY] = data.signals[0].rotations[index];
            const directionLength = agentRadius * 1.5;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(ax + rotX * directionLength, ay + rotY * directionLength);
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
          
          // 绘制agent标签
          if (showLabels) {
            ctx.fillStyle = '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.fillText(`Agent ${index}`, ax, ay - agentRadius - 5);
          }
        }
      });
    }

    ctx.restore();
  };

  // 绘制网格背景
  const drawGrid = (ctx: CanvasRenderingContext2D, rect: DOMRect) => {
    if (gridSize <= 0) return;
    
    const scaleFactor = 1 / zoom;
    const effectiveGridSize = gridSize * scaleFactor;
    
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 0.5;
    
    // 计算网格起点
    const startX = Math.floor((-offsetX - rect.width / 2) / effectiveGridSize) * effectiveGridSize;
    const startY = Math.floor((-offsetY - rect.height / 2) / effectiveGridSize) * effectiveGridSize;
    
    // 绘制垂直线
    for (let x = startX; x < rect.width; x += effectiveGridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, rect.height);
      ctx.stroke();
    }
    
    // 绘制水平线
    for (let y = startY; y < rect.height; y += effectiveGridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(rect.width, y);
      ctx.stroke();
    }
  };

  // 处理鼠标按下事件
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setLastMousePos({ x: e.clientX, y: e.clientY });
    canvasRef.current?.focus();
  };

  // 处理鼠标移动事件
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
    setOffsetX(prev => prev + dx);
    setOffsetY(prev => prev + dy);
    setDragStart({ x: e.clientX, y: e.clientY });
    
    draw();
  };

  // 处理鼠标释放事件
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 处理鼠标滚轮事件（缩放）
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // 计算鼠标在世界坐标中的位置
    const worldX = (mouseX - offsetX - rect.width / 2) / zoom;
    const worldY = (mouseY - offsetY - rect.height / 2) / zoom;
    
    // 缩放因子
    const scaleFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.max(0.2, Math.min(10, zoom * scaleFactor));
    
    // 调整偏移量以保持鼠标位置指向相同的世界坐标
    const newOffsetX = mouseX - worldX * newZoom - rect.width / 2;
    const newOffsetY = mouseY - worldY * newZoom - rect.height / 2;
    
    setZoom(newZoom);
    setOffsetX(newOffsetX);
    setOffsetY(newOffsetY);
    
    draw();
  };

  // 重置视图
  const resetView = () => {
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
  };

  return (
    <div className="agent-visualizer-container" style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        tabIndex={0}
        style={{
          width: '100%',
          height: '100%',
          border: '1px solid #ddd',
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none' // 防止移动端触摸事件干扰
        }}
      />
      <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
        <button 
          onClick={resetView} 
          style={{ 
            padding: '5px 10px', 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Reset View
        </button>
        <span style={{ marginRight: '10px', backgroundColor: 'rgba(255,255,255,0.8)', padding: '5px', borderRadius: '4px' }}>
          Zoom: {zoom.toFixed(2)}x
        </span>
      </div>
    </div>
  );
};

export default AgentVisualizer;