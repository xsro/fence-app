import React, { useState } from 'react';
import { Scatter } from "react-chartjs-2";
import { simulationData } from '../client/data';
import { Slider } from '@mui/material';


interface TabDisplay2dProps {
    data_id: number;
}
const TabDisplay2d = (props: TabDisplay2dProps) => {
    const [time_id,setTimeId] = useState(simulationData.data.length - 1);
    
    const data = {
        datasets: [{
            label: '智能体',
            data: simulationData.data[time_id].state.agents.map((item) => ({ x: item[0], y: item[1] })),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
        },
        {
            label: '目标点',
            data: [simulationData.data[time_id].state.target].map((item) => ({ x: item[0], y: item[1] })),
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
        }
    
    ]
    };
    const options={
        responsive: false, // 响应式调整
        // maintainAspectRatio: true, // 保持宽高比
        aspectRatio: 1, // 设置宽高比为1:1
    }

    function handleSliderChange(event: Event, newValue: number | number[]) {
        if (typeof newValue === 'number') {
            setTimeId(newValue);
        }
    }
    return (
        <div>
            <span className="text-lg font-semibold mb-4">t={simulationData.data[time_id].time.toFixed(2)}  时间步: {time_id} </span>
            <Slider min={0} max={simulationData.data.length - 1} value={time_id} onChange={handleSliderChange}>s</Slider>
            <Scatter options={options} data={data} height={400} width={400}/>
        </div>
    );
}
export default TabDisplay2d;