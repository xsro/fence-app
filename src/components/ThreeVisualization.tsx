import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { simulationData } from '../client/data';

interface Point {
  x: number;
  y: number;
  z: number;
}

interface NormalizedData {
  target: Point;
  agents: Point[];
}

export interface RawData {
  time: number;
  states: {
    agents: number[][];
    target: number[];
  };
}

interface ThreeVisualizationProps {
  width: number;
  height: number;
}

// 处理非常大的坐标值
  const normalizeData = (data: RawData): NormalizedData => {
    const target = data.states.target;
    const agents = data.states.agents;

    // 提取坐标范围
    const allPoints = [...agents, target];
    const min = [Infinity, Infinity, Infinity];
    const max = [-Infinity, -Infinity, -Infinity];

    allPoints.forEach(point => {
      for (let i = 0; i < 3; i++) {
        min[i] = Math.min(min[i], point[i]);
        max[i] = Math.max(max[i], point[i]);
      }
    });

    // 计算范围和中心
    const range = [max[0] - min[0], max[1] - min[1], max[2] - min[2]];
    const center = [
      (max[0] + min[0]) / 2,
      (max[1] + min[1]) / 2,
      (max[2] + min[2]) / 2
    ];

    // 归一化函数
    const scale = 1000 / Math.max(...range); // 缩放因子，使场景适合显示

    return {
      target: {
        x: (target[0] - center[0]) * scale,
        y: (target[1] - center[1]) * scale,
        z: (target[2] - center[2]) * scale
      },
      agents: agents.map(agent => ({
        x: (agent[0] - center[0]) * scale,
        y: (agent[1] - center[1]) * scale,
        z: (agent[2] - center[2]) * scale
      }))
    };
  };

const ThreeVisualization: React.FC<ThreeVisualizationProps> = ({
  width,
  height,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scene = useRef<THREE.Scene | null>(null);
  const camera = useRef<THREE.PerspectiveCamera | null>(null);
  const renderer = useRef<THREE.WebGLRenderer | null>(null);
  const controls = useRef<OrbitControls | null>(null);
  const animationFrameId = useRef<number | null>(null);

  

  const transformData= (data: RawData): NormalizedData => {
    const target = data.states.target;
    const agents = data.states.agents;
    return {
      target: {
        x: target[0],
        y: target[1],
        z: target[2],
      },
      agents: agents.map(agent => ({
        x: agent[0],
        y: agent[1],
        z: agent[2]
      }))
    };
  };



  const normalizedData = transformData(simulationData.data[simulationData.time_id]); // 获取最新数据进行归一化
  useEffect(() => {

    // 清理之前的场景
    if (renderer.current && containerRef.current) {
      containerRef.current.removeChild(renderer.current.domElement);
    }

    // 初始化场景
    scene.current = new THREE.Scene();
    scene.current.background = new THREE.Color(0xf0f0f0);

    // 添加坐标轴帮助器
    const axesHelper = new THREE.AxesHelper(1000);
    scene.current.add(axesHelper);

    // 添加网格帮助器
    const gridHelper = new THREE.GridHelper(2000, 20, 0xcccccc, 0xcccccc);
    scene.current.add(gridHelper);

    // 初始化相机
    camera.current = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000);
    camera.current.position.z = 1000;

    // 初始化渲染器
    renderer.current = new THREE.WebGLRenderer({ antialias: true });
    renderer.current.setSize(width, height);
    if (containerRef.current) {
      containerRef.current.appendChild(renderer.current.domElement);
    }

    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.current.add(ambientLight);

    // 添加方向光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.current.add(directionalLight);

    // 添加目标点（使用正方体）
    const targetGeometry = new THREE.BoxGeometry(40, 40, 40);
    const targetMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const targetMesh = new THREE.Mesh(targetGeometry, targetMaterial);
    const target = normalizedData.target;
    targetMesh.position.set(target.x, target.y, target.z);
    scene.current.add(targetMesh);

    // 添加代理点（使用球体）
    const agentGeometry = new THREE.SphereGeometry(20, 32, 32);
    const agentMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });

    const agentMeshs = normalizedData.agents.map(agentPos => {
      const agentMesh = new THREE.Mesh(agentGeometry, agentMaterial);
      agentMesh.position.set(agentPos.x, agentPos.y, agentPos.z);
      scene.current && scene.current.add(agentMesh);
      return agentMesh;
    });

    // 设置控制器，支持鼠标拖动和缩放
    if (camera.current && renderer.current) {
      controls.current = new OrbitControls(camera.current, renderer.current.domElement);
      controls.current.target.set(target.x, target.y, target.z); // 设置目标为中心点
      controls.current.update();
    }

    // 动画循环
    const animate = () => {
      
      const normalizedData = transformData(simulationData.data[simulationData.time_id]);
      const target = normalizedData.target;
      targetMesh.position.set(target.x, target.y, target.z);
      normalizedData.agents.forEach((agentPos, idx) => {
        agentMeshs[idx].position.set(agentPos.x, agentPos.y, agentPos.z);
      });
      animationFrameId.current = requestAnimationFrame(animate);
      if (controls.current) controls.current.update();
      if (scene.current && camera.current && renderer.current) {
        renderer.current.render(scene.current, camera.current);
      }
    };

    animate();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }

      if (renderer.current) {
        renderer.current.dispose();
      }

      if (containerRef.current && renderer.current) {
        containerRef.current.removeChild(renderer.current.domElement);
      }
    };
  }, [width, height]);

  return (
    <div ref={containerRef} style={{ width, height, overflow: 'hidden' }} />
  );
};

export default ThreeVisualization;    