import React, { useState } from 'react';
import './index.css'; // Tailwind CSS configuration
import TrajectoryVisualization from './components/TrajectoryVisualization';
import { SimulationManager, template_data } from "./client/main"
import { Button } from '@mui/material';
import ThreeVisualization, { RawData } from './components/ThreeVisualization';

type TabName = 'simulate' | 'status' | 'metric' | 'display' | 'display3D' | 'debug';

const TabbedInterface: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabName>('simulate');


  const [profiles, setProfiles] = useState<string[]>([]);
  const [displayData, setDisplayData] = useState<any[]>(template_data);

  function handleUpdateProfiles() {
    SimulationManager.getInstance().updateProfiles()
      .then(() => {
        console.log("Profiles updated successfully", SimulationManager.getInstance().profiles);
        setProfiles(Object.keys(SimulationManager.getInstance().profiles));
      })
      .catch((error) => {
        console.error("Error updating profiles:", error);
      });
  }

  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  async function handleSimulate() {
    if (!selectedProfile) {
      console.error("No profile selected for simulation.");
      return;
    }
    const manager = SimulationManager.getInstance();
    await manager.simulate(selectedProfile, manager.profiles[selectedProfile].path);
  }

  // Tab content components (replace with your actual content)
  const SimulateTabContent = () => (
    <div className="p-6 bg-white rounded-b-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Simulation Controls</h2>
      <p>Configure and run simulations here.</p>
      <div className="mt-4">
        <label className="block mb-2 text-sm font-medium text-gray-700">Select Profile:</label>
        <select
          className="block w-full p-2 border border-gray-300 rounded"
          onChange={(e) => {
            const selectedProfile = e.target.value;
            console.log("Selected profile:", selectedProfile);
            setSelectedProfile(selectedProfile || null);
          }}
          value={selectedProfile || ''}
        >
          <option value="">-- Select a profile --</option>
          {profiles.map((profile) => (
            <option key={profile} value={profile}>
              {profile}
            </option>
          ))}
        </select>
      </div>
      <Button onClick={handleSimulate}>Start Simulation</Button>
      <Button onClick={handleUpdateProfiles}>Update list</Button>
    </div>
  );

  const StatusTabContent = () => {
    const [status, setStatus] = useState<number>(Date.now());
    setInterval(() => {
      setStatus(Date.now());
    }, 1000);

    return (
      <div className="p-6 bg-white rounded-b-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">System Status</h2>
        <p>Monitor system health and performance metrics. {status}</p>
        {/* Add status indicators and metrics */}
        <div className="mt-4 grid grid-cols-2 gap-4">
          {
            Object.entries(SimulationManager.getInstance().simulationProcess).map(([name, output]) => (
              <div key={name} className="p-4 bg-gray-100 rounded shadow">
                <h3 className="font-semibold">{name}</h3>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">{output}</pre>
              </div>
            ))
          }
        </div>
      </div>
    )
  };

  const DisplayTabContent = () => (
    <div className="p-6 bg-white rounded-b-lg shadow-md">
      <TrajectoryVisualization data={displayData} />
    </div>
  );

  const initialData = {
    "time": 8000,
    "states": {
      "agents":
        [[-2.1311073773114517E+8, 1.2069914096762993E+11, 5.8525306454640344E+11], [-1.7278629741713E+11, 1.0560494434295116E+11, 5.1209595702648682E+11], [-1.5355789362783624E+11, 2.5599977057555887E+11, 4.5519677128198407E+11], [-3.132551533866725E+8, 2.3039503126982193E+11, 4.0967711248968274E+11]],
      "agents_v": [[-53235.672285767971, 3.0173352570964493E+7, 2.1945618334471539E+8], [-4.3196663003053263E+7, 2.6400837519144114E+7, 1.9202397764100683E+8], [-3.8390142766567037E+7, 6.4000117440146595E+7, 1.7068813551377028E+8], [-78414.687226170412, 5.7599509165378571E+7, 1.5361932425450519E+8]],
      "target": [-78.567605512173, 200.82699334313273, 1600]
    }
  };

  const [display3DData, setDisplay3DData] = useState<Array<RawData>>([initialData]);
  const [display3DDataIndex, setDisplay3DDataIndex] = useState<number>(0);
  const Display3DTabContent = () => (
    <div className="p-6 bg-white rounded-b-lg shadow-md">
      <input type="file" accept=".json" onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            try {
              const data = JSON.parse(event.target?.result as string);
              setDisplay3DData(data);
            } catch (error) {
              console.error("Error parsing JSON file:", error);
            }
          };
          reader.readAsText(file);
        }
      }} className="mb-4 p-2 border border-gray-300 rounded" />
      <input type='number' value={display3DDataIndex} className="mb-4 p-2 border border-gray-300 rounded" max={display3DData.length-1} onChange={(e)=>{
        const index = parseInt(e.target.value, 10);
        if (!isNaN(index) && index >= 0 && index < display3DData.length) {
          setDisplay3DDataIndex(index);
        }
      }}/>
      <div style={{ width: '800px', height: '600px', margin: 'auto' }}>
        <ThreeVisualization
          width={800}
          height={600}
          data={display3DData[display3DDataIndex]}
        />
      </div>
    </div>
  );

  const DebugTabContent = () => {
    const [log, setLog] = useState(`[12:34:56] INFO: Simulation started
[12:34:57] DEBUG: Initializing environment...
[12:34:58] INFO: Agents loaded successfully
[12:34:59] DEBUG: Step 1 completed
[12:35:00] DEBUG: Step 2 completed`);
    SimulationManager.setLog = setLog;
    return (
      <div className="p-6 bg-white rounded-b-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Debug Console</h2>
        <p>View system logs and debug information.</p>
        {/* Add debug console or logs */}
        <div className="mt-4 bg-gray-900 text-gray-100 p-4 rounded h-64 overflow-auto">
          <pre>
            <code>
              {log}
            </code>
          </pre>
        </div>
      </div>
    )
  };

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'simulate':
        return <SimulateTabContent />;
      case 'status':
        return <StatusTabContent />;
      case 'display':
        return <DisplayTabContent />;
      case 'debug':
        return <DebugTabContent />;
      case 'display3D':
        return <Display3DTabContent />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-8">
      <div className="mb-4">

        {/* Tab navigation */}
        <div className="flex border-b">
          {['simulate', 'status', 'display', 'display3D', 'debug'].map(tab => (
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