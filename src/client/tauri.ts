import { Child, Command } from '@tauri-apps/plugin-shell'
import { invoke } from "@tauri-apps/api/core";
import { stat,readTextFileLines } from '@tauri-apps/plugin-fs'

export interface ManagerAPI{
    log:(message:string) => void;
    listAllProfiles: () => Promise<string[]>;
    startSimulation: (id:string,profile_path:string) => Promise<void>;
}

export class SimulationManager implements ManagerAPI {
    mas_cmds:string[]=[];
    childProcess:Record<string,Child>={};
    childProcessStatus:Record<string,string>={};

    constructor() {
        invoke('get_config').then((config: any) => {
            this.mas_cmds = [config.python_path, config.mas_path];
        });
    }

    public async log(message: string): Promise<void> {
        invoke('log_message', { message })
    }

    public async listAllProfiles (): Promise<string[]> {
        const cmd = Command.create(this.mas_cmds[0], [...this.mas_cmds.slice(1), 'simulate','list'], { encoding: 'utf-8' });
        const output = await cmd.execute();
        if (output.code !== 0) {
            throw new Error(`Error listing profiles: ${output.stderr}`);
        }
        return output.stdout.split('\n').filter(profile => profile.trim() !== '');
    }


    public async startSimulation (id: string, profile_path: string){
        const cmd= Command.create(this.mas_cmds[0], [...this.mas_cmds.slice(1), 'simulate', profile_path],{encoding: 'utf-8'});
        const child=await cmd.spawn();
        cmd.stdout.on('data', (data) => {
            this.log(`Simulation ${id} output: ${data}`);
        });
        this.childProcess[id]=child;
    }

    public async read_json1(path: string) {
        try {
            const lines = await readTextFileLines(path);
            const data=[]
            for await (const line of lines) {
                data.push(JSON.parse(line));
            }  
            return data;
        } catch (error) {
            console.error(`Error reading JSON from ${path}:`, error);
            throw error;
        }
    }
}


export const template_data = [
    { "time": 0.0, "state": { "agents": [[7.0, 10.0], [3.0, 10.0], [-1.0, 10.0]], "target": [3.0, 10.0] }, "signals": [{ "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }] },
    { "time": 0.1, "state": { "agents": [[6.61935, 10.0], [3.0, 10.0], [-0.6193500000000001, 10.0]], "target": [3.0, 10.0] }, "signals": [{ "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }] },
    { "time": 0.2, "state": { "agents": [[6.269183720833333, 10.0], [3.0, 10.0], [-0.26918372083333336, 10.0]], "target": [3.0, 10.0] }, "signals": [{ "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }] },
    { "time": 0.3, "state": { "agents": [[5.953332286003188, 10.0], [3.0, 10.0], [0.0466677139968123, 10.0]], "target": [3.0, 10.0] }, "signals": [{ "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }] },
    { "time": 0.4, "state": { "agents": [[5.6812710783577, 10.0], [3.0, 10.0], [0.31872892164230043, 10.0]], "target": [3.0, 10.0] }, "signals": [{ "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }] },
    { "time": 0.5, "state": { "agents": [[5.453365726165287, 10.0], [3.0, 10.0], [0.5466342738347129, 10.0]], "target": [3.0, 10.0] }, "signals": [{ "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }] },
    { "time": 0.6, "state": { "agents": [[5.2670877445530175, 10.0], [3.0, 20.0], [0.7329122554469822, 1.0]], "target": [3.0, 10.0] }, "signals": [{ "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }] },
];