import ThreeVisualization from "../components/ThreeVisualization";
import { simulationData } from '../client/data';
import { useState } from "react";
import { Slider } from "@mui/material";

export interface TabDisplay3dProps {
    data_id: number;
}

const TabDisplay3d = (props: TabDisplay3dProps) => {
    const [time_id,setTimeId] = useState(simulationData.data.length - 1);
    simulationData.time_id= time_id; // 设置当前时间步
    function handleSliderChange(event: Event, newValue: number | number[]) {
        if (typeof newValue === 'number') {
            setTimeId(newValue);
        }
    }
    return (
        <div className="p-6 bg-white rounded-b-lg shadow-md">
            <span className="text-lg font-semibold mb-4">t={simulationData.data[time_id].time.toFixed(2)}  时间步: {time_id} </span>
            <Slider min={0} max={simulationData.data.length - 1} value={time_id} onChange={handleSliderChange}>s</Slider>
            <ThreeVisualization width={400} height={400}/>
        </div>
    );
};

export default TabDisplay3d;