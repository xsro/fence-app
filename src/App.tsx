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

import TabbedInterface from './tabs/main';

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


// 应用主组件
const App = () => {
  // const theme = useTheme();

  return (
    <TabbedInterface></TabbedInterface>
  );
};

export default App;