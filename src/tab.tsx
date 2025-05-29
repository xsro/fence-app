import React, { ChangeEventHandler, useState } from 'react';
import './index.css'; // Tailwind CSS configuration
import TrajectoryVisualization from './TrajectoryVisualization';
import {SimulationManager,template_data} from "./client/tauri"
import { Button,Input } from '@mui/material';

type TabName = 'simulate' | 'status' | 'display' | 'debug';

const TabbedInterface: React.FC = () => {
  const manager = new SimulationManager();
  const [activeTab, setActiveTab] = useState<TabName>('simulate');


  const [profiles, setProfiles] = useState<string[]>([]);
  const [displayData, setDisplayData] = useState<any[]>(template_data);

  async function handleUpdateProfiles() {
    const profiles=await manager.listAllProfiles()
    setProfiles(profiles);
  }

  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  async function handleSimulate() {
    if (!selectedProfile) {
      console.error("No profile selected for simulation.");
      return;
    }
    await manager.startSimulation(selectedProfile,selectedProfile);
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
      </div>
    </div>
  )};

  const handleDisplayDataChange:ChangeEventHandler<HTMLInputElement>=async function(h) {
    const value = h.target.value;
    try {
      const parsedData = await manager.read_json1(value);
      setDisplayData(parsedData);
    } catch (error) {
      console.error("Invalid JSON data:", error);
      setDisplayData([]);
    }
  }

  const DisplayTabContent = () => (
    <div className="p-6 bg-white rounded-b-lg shadow-md">
      <Input onChange={handleDisplayDataChange}></Input>
      <div className="mt-4 bg-gray-100 h-64 rounded flex items-center justify-center">
        <TrajectoryVisualization data={displayData}/>
      </div>
    </div>
  );

  const DebugTabContent = () => {
    const [log,setLog]=useState(`[12:34:56] INFO: Simulation started
[12:34:57] DEBUG: Initializing environment...
[12:34:58] INFO: Agents loaded successfully
[12:34:59] DEBUG: Step 1 completed
[12:35:00] DEBUG: Step 2 completed`);
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
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-8">
      <div className="mb-4">
        
        {/* Tab navigation */}
        <div className="flex border-b">
          {['simulate', 'status', 'display', 'debug'].map(tab => (
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