import { invoke } from "@tauri-apps/api/core";

export type FenceDataType = {
    time: number;
    state: {
        agents: number[][];
        target: number[];
    };
    signals: {
        distance: Record<string, any>;
        rotations: number[][];
    }[];
};

export const template_data = [
    { "time": 0.0, "state": { "agents": [[7.0, 10.0], [3.0, 10.0], [-1.0, 10.0]], "target": [3.0, 10.0] }, "signals": [{ "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }] },
    { "time": 0.1, "state": { "agents": [[6.61935, 10.0], [3.0, 10.0], [-0.6193500000000001, 10.0]], "target": [3.0, 10.0] }, "signals": [{ "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }] },
    { "time": 0.2, "state": { "agents": [[6.269183720833333, 10.0], [3.0, 10.0], [-0.26918372083333336, 10.0]], "target": [3.0, 10.0] }, "signals": [{ "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }] },
    { "time": 0.3, "state": { "agents": [[5.953332286003188, 10.0], [3.0, 10.0], [0.0466677139968123, 10.0]], "target": [3.0, 10.0] }, "signals": [{ "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }] },
    { "time": 0.4, "state": { "agents": [[5.6812710783577, 10.0], [3.0, 10.0], [0.31872892164230043, 10.0]], "target": [3.0, 10.0] }, "signals": [{ "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }] },
    { "time": 0.5, "state": { "agents": [[5.453365726165287, 10.0], [3.0, 10.0], [0.5466342738347129, 10.0]], "target": [3.0, 10.0] }, "signals": [{ "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }] },
    { "time": 0.6, "state": { "agents": [[5.2670877445530175, 10.0], [3.0, 20.0], [0.7329122554469822, 1.0]], "target": [3.0, 10.0] }, "signals": [{ "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }] },
];

export class SimulationData {
  data: Array<FenceDataType> = [];
  source_path: string = "";
  id=0;
  update_id_event:Array<()=>void>=[];

  constructor() {
    this.data = template_data;
  }

  public get is_2d(): boolean {
    return this.data.every(item => item.state.agents.every(agent => agent.length === 2));
  }

  public get is_3d(): boolean {
    return this.data.every(item => item.state.agents.every(agent => agent.length === 3));
  }

  public async update_data(){
    const data_ = await invoke("read_file", { path: this.source_path });
    const data=[]
    for (const line of (data_ as string).split(",\n")) {
      let a = undefined;
      try {
        a = JSON.parse(line.trim());
      } catch (e) {
        console.warn("Error parsing line:", line, e);
      }
      if (a !== undefined) {
        //rename states to state
        if (a.states) {
          a.state = a.states;
          delete a.states;
        }
        //remove empty data
        if (typeof a.time === "number") {
          data.push(a);
        }
      }
    }
    
    this.data = data as Array<FenceDataType>;
    this.id++;
    this.update_id_event.forEach(callback => callback());
    return true;
  }

  public get_time(): Array<number> {
    return this.data.map(item => item.time);
  }

  public compute_p1(){
    if (this.data.length === 0) {
      return [];
    }
    const average_positions = this.data.map(item => {
        const agents = item.state.agents;
        if (agents.length === 0) {
            return [];
        }
        // Calculate the average position of agents
        const avgPosition = agents.reduce((acc, agent) => {
            acc[0] += agent[0];
            acc[1] += agent[1];
            if (agent.length === 3) {
            acc[2] += agent[2];
            }
            return acc;
        }, [0, 0, 0]);
        const count = agents.length;
        return avgPosition.map(coord => coord / count);
    });
    const offset:Array<Array<number>>=[[],[],[]];
    for (const time_idx in average_positions) {
      const average_position = average_positions[time_idx];
      for (let i = 0; i < average_position.length; i++) {
        offset[i].push(average_position[i]- this.data[time_idx].state.target[i]);
      }
    }
    return offset;
  }
}

export const simulationData = new SimulationData();