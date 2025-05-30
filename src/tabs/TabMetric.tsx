import React from 'react';
import { Line } from "react-chartjs-2";
import { simulationData } from '../client/data';

interface TabMetricProps {
    data_id: number;
}

const TabMetric = (props: TabMetricProps) => {
    const p1data = simulationData.compute_p1();
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: true,
                text: 'Chart.js Line Chart',
            },
        },
    };


    const data = {
        labels: simulationData.get_time(),
        datasets: [
            {
                label: 'x',
                data: p1data[0],
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
            {
                label: 'y',
                data: p1data[1],
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
        ],
    };
    if (simulationData.is_3d){
        data.datasets.push({
            label: 'z',
            data: p1data[2],
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
        });
    }

    function updateButtonHandler() {
        const path=document.getElementById("json-source-path") as HTMLInputElement;
        if (path === null) {
            console.error("Path input element not found");
            return;
        }
        simulationData.source_path = path.value;
        simulationData.update_data()
    }
    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Metric Visualization {simulationData.id}</h2>
            <input type="text" id="json-source-path"></input>
            <button onClick={updateButtonHandler}>update</button>
            <Line data={data} options={options} />
            {/* 这里是组件内容 */}
        </div>
    );
};

export default TabMetric;    