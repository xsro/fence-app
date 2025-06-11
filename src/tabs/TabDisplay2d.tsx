import React, { useState } from 'react';
import { Scatter, Line } from "react-chartjs-2";
import { simulationData } from '../client/data';
import { Slider } from '@mui/material';
import { faStepBackward, faPlay, faStepForward, faPause } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const colors_list = [
    'rgba(75, 192, 192, 0.9)',
    'rgba(255, 99, 132, 0.9)',
    'rgba(255, 159, 64, 0.9)',
    'rgba(153, 102, 255, 0.9)',
    'rgba(54, 162, 235, 0.9)',
    'rgba(201, 203, 207, 0.9)',
];

interface TabDisplay2dProps {
    data_id: number;
}
const TabDisplay2d = (props: TabDisplay2dProps) => {
    const [time_id, setTimeId] = useState(simulationData.data.length - 1);
    const [isPlaying, setIsPlaying] = useState(false);
    const agents = simulationData.data[time_id].states.agents.map((item, agent_index) => {
        return {
            label: `智能体 ${agent_index + 1} 轨迹`,
            data: simulationData.data.map((d) => {
                const item=d.states.agents[agent_index]
                if (Array.isArray(item)){
                    return { x: item[0], y: item[1] }
                }
                else {
                    return undefined; 
                }
            }),
            backgroundColor: colors_list[agent_index % colors_list.length],
            borderColor: colors_list[agent_index % colors_list.length],
            pointRadius: 1,
            pointBorderWidth: 1,
            pointHoverRadius: 5,
        };
    }
    );

    const agents2 = simulationData.data[time_id].states.agents.map((item, agent_index) => {
        return {
            label: `智能体 ${agent_index + 1}`,
            data: [{ x: item[0], y: item[1] }],
            backgroundColor: colors_list[agent_index % colors_list.length],
            borderColor: 'rgba(16, 15, 16, 0.86)',
            pointStyle: 'circle',
            pointRadius: 6,
            pointBorderWidth: 2,
            pointHoverRadius: 5,
        };
    }
    );
    const xmin = Math.min(...simulationData.data.map(d => d.states.agents.map(item => item[0])).flat());
    const xmax = Math.max(...simulationData.data.map(d => d.states.agents.map(item => item[0])).flat());
    const ymin = Math.min(...simulationData.data.map(d => d.states.agents.map(item => item[1])).flat());
    const ymax = Math.max(...simulationData.data.map(d => d.states.agents.map(item => item[1])).flat());
    const xRange = xmax - xmin;
    const yRange = ymax - ymin;
    const maxRange = Math.max(xRange, yRange);
    const xCenter = (xmin + xmax) / 2;
    const yCenter = (ymin + ymax) / 2;


    const data = {
        datasets: [
            ...agents2, // 添加智能体当前位置数据集
            {
                label: '目标点',
                data: [simulationData.data[time_id].states.target].map((item) => ({ x: item[0], y: item[1] })),
                backgroundColor: 'rgba(221, 33, 33, 0.83)',
                borderColor: 'rgba(16, 15, 16, 0.86)',
                pointStyle: 'rect',
                pointRadius: 8,
                pointBorderWidth: 2,
            },
            ...agents // 添加智能体数据集

        ]
    };
    const options = {
        animation: false, // 禁用动画
        responsive: false, // 响应式调整
        maintainAspectRatio: true, // 保持宽高比
        aspectRatio: 1, // 设置宽高比为1:1
        scales: {
            x: {
                type: 'linear',
                position: 'bottom',
                min: xCenter - maxRange / 2,
                max: xCenter + maxRange / 2,
                grid: {
                    display: true,
                    color: 'rgba(0, 0, 0, 0.1)'
                },
                title: {
                    display: true,
                    text: 'X 轴'
                }
            },
            y: {
                type: 'linear',
                position: 'left',
                min: yCenter - maxRange / 2,
                max: yCenter + maxRange / 2,
                grid: {
                    display: true,
                    color: 'rgba(0, 0, 0, 0.1)'
                },
                title: {
                    display: true,
                    text: 'Y 轴'
                }
            }
        },
    }

    function handleSliderChange(event: Event, newValue: number | number[]) {
        if (typeof newValue === 'number') {
            setTimeId(newValue);
        }
    }

    function togglePlay() {
        setIsPlaying(!isPlaying);
        if (!isPlaying) {
            const interval = setInterval(() => {
                setTimeId((prevTimeId) => {
                    const nextTimeId = (prevTimeId + 1) % simulationData.data.length;
                    simulationData.time_id = nextTimeId; // 更新全局时间步
                    return nextTimeId;
                });
            }, 1000); // 每秒更新一次
            return () => clearInterval(interval); // 清除定时器
        }
    }
    return (
        <div>
            <span className="text-lg font-semibold mb-4">t={simulationData.data[time_id].time.toFixed(2)}  时间步: {time_id} </span>
            <button onClick={togglePlay} className="control-button play-button">
                <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
            </button>
            <Slider min={0} max={simulationData.data.length - 1} value={time_id} onChange={handleSliderChange}>s</Slider>
            <Scatter options={options} data={data} height={400} width={400} />
        </div>
    );
}
export default TabDisplay2d;