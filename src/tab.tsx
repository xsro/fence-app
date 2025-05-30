import React, { useState } from 'react';
import './index.css'; // Tailwind CSS configuration
import TrajectoryVisualization from './components/TrajectoryVisualization';
import {SimulationManager,template_data} from "./client/main"
import { Button } from '@mui/material';
import ThreeVisualization from './components/ThreeVisualization';

type TabName = 'simulate' | 'status' | 'display' |'display3D' | 'debug';

const TabbedInterface: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabName>('simulate');


  const [profiles, setProfiles] = useState<string[]>([]);
  const [displayData, setDisplayData] = useState<any[]>(template_data);

  function handleUpdateProfiles() {
    SimulationManager.getInstance().updateProfiles()
      .then(() => {
        console.log("Profiles updated successfully",SimulationManager.getInstance().profiles);
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
    const manager= SimulationManager.getInstance();
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
    
    return(
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
  )};

  const DisplayTabContent = () => (
    <div className="p-6 bg-white rounded-b-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Data Visualization</h2>
      <div className="mt-4 bg-gray-100 h-64 rounded flex items-center justify-center">
        <TrajectoryVisualization data={displayData}/>
      </div>
    </div>
  );

  const initialData = {
  "time": 1224,
  "states": {
    "agents": [
      [-5.3037484976478536E+6, 2.8271055703376069E+9, 2.0983113824583027E+9],
      [-4.0448892187886987E+9, 2.4726725177355709E+9, 1.8360161405891685E+9],
      [-3.5941442888785629E+9, 5.9926459368107319E+9, 1.632011291665508E+9],
      [-7.4180197256643418E+6, 5.3926538702144041E+9, 1.4688129670446687E+9]
    ],
    "agents_v": [
      [-8528.7737910265823, 4.6181165613174811E+6, 5.140807596450951E+6],
      [-6.6093145683105942E+6, 4.0399985492269853E+6, 4.4981996090753432E+6],
      [-5.8733916735937158E+6, 9.7921626108197141E+6, 3.9983988206763035E+6],
      [-12155.490295826894, 8.8123517858602181E+6, 3.598561230720913E+6]
    ],
    "target": [-78.2725160192479, 200.56129357027316, 244.8]
  }
};

  const Display3DTabContent = () => (
    <div className="p-6 bg-white rounded-b-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Data Visualization</h2>
      <div style={{ width: '800px', height: '600px', margin: 'auto' }}>
        <ThreeVisualization 
        width={800} 
        height={600} 
        data={initialData} 
      />
      </div>
    </div>
  );

  const DebugTabContent = () => {
    const [log,setLog]=useState(`[12:34:56] INFO: Simulation started
[12:34:57] DEBUG: Initializing environment...
[12:34:58] INFO: Agents loaded successfully
[12:34:59] DEBUG: Step 1 completed
[12:35:00] DEBUG: Step 2 completed`);
      SimulationManager.setLog=setLog;
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
  )};

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
              className={`py-2 px-4 font-medium border-b-2 ${
                activeTab === tab
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