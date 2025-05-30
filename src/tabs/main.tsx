import React, { useState } from 'react';
import TabMetric from './TabMetric';
import { simulationData } from '../client/data';
import TabDisplay2d from './TabDisplay2d';


type TabName = 'simulate' | 'status' | 'metric' | 'display' | 'display3D' | 'debug';
const TabbedInterface: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabName>('simulate');
    const [dataid, setDataId] = useState<number>(0);
    simulationData.update_id_event.push(() => {
        setDataId(simulationData.id);
    })

    // Render tab content based on active tab
    const renderTabContent = () => {
        switch (activeTab) {
            case 'simulate':
                return <div className="p-6 bg-white rounded-b-lg shadow-md">1</div>;
            case 'status':
                return <div className="p-6 bg-white rounded-b-lg shadow-md">2</div>;
            case 'metric':
                return <TabMetric data_id={dataid}/>;
            case 'display':
                return <TabDisplay2d data_id={dataid}/>;
            case 'display3D':
                return <div className="p-6 bg-white rounded-b-lg shadow-md">5</div>;
            case 'debug':
                return <div className="p-6 bg-white rounded-b-lg shadow-md">6</div>;
        }
    };

    return (
        <div className="max-w-6xl mx-auto mt-8">
            <div className="mb-4">

                {/* Tab navigation */}
                <div className="flex border-b">
                    {['simulate', 'status','metric','display', 'display3D', 'debug'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as TabName)}
                            className={`py-2 px-4 font-medium border-b-2 ${activeTab === tab
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } transition-colors`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab content */}
            {renderTabContent()}
        </div>
    );
};

export default TabbedInterface;