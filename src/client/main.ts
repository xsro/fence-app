import { invoke } from "@tauri-apps/api/core";

export const template_data = [
    { "time": [0.0], "state": { "agents": [[7.0, 10.0], [3.0, 10.0], [-1.0, 10.0]], "target": [3.0, 10.0] }, "signals": [{ "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }] },
    { "time": [0.0, 0.1], "state": { "agents": [[6.61935, 10.0], [3.0, 10.0], [-0.6193500000000001, 10.0]], "target": [3.0, 10.0] }, "signals": [{ "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }] },
    { "time": [0.0, 0.1, 0.2], "state": { "agents": [[6.269183720833333, 10.0], [3.0, 10.0], [-0.26918372083333336, 10.0]], "target": [3.0, 10.0] }, "signals": [{ "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }] },
    { "time": [0.0, 0.1, 0.2, 0.30000000000000004], "state": { "agents": [[5.953332286003188, 10.0], [3.0, 10.0], [0.0466677139968123, 10.0]], "target": [3.0, 10.0] }, "signals": [{ "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }] },
    { "time": [0.0, 0.1, 0.2, 0.30000000000000004, 0.4], "state": { "agents": [[5.6812710783577, 10.0], [3.0, 10.0], [0.31872892164230043, 10.0]], "target": [3.0, 10.0] }, "signals": [{ "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }] },
    { "time": [0.0, 0.1, 0.2, 0.30000000000000004, 0.4, 0.5], "state": { "agents": [[5.453365726165287, 10.0], [3.0, 10.0], [0.5466342738347129, 10.0]], "target": [3.0, 10.0] }, "signals": [{ "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }] },
    { "time": [0.0, 0.1, 0.2, 0.30000000000000004, 0.4, 0.5, 0.6000000000000001], "state": { "agents": [[5.2670877445530175, 10.0], [3.0, 20.0], [0.7329122554469822, 1.0]], "target": [3.0, 10.0] }, "signals": [{ "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }] },
];

export type FenceDataType=typeof template_data[0];


export async function getTemplateData(url:URL|undefined): Promise<FenceDataType[]> {
    if (url==undefined) {
        return template_data;
    }
    if (url.pathname.endsWith("main.json1")) {
        const data=await invoke("read_file", { url: url.href });
        return data as FenceDataType[];
    }
    throw new Error("Unknown URL: " + url.pathname);
}

export class SimulationManager{
    public static setLog(log: string) {
        console.log("Simulation log:", log);
    }
    private static instance: SimulationManager;

    logs=""
    private setLog(log:string){
        this.logs+=log;
        SimulationManager.setLog(this.logs);
    }
    
    private constructor() {}

    public static getInstance(): SimulationManager {
        if (!SimulationManager.instance) {
            SimulationManager.instance = new SimulationManager();
        }
        return SimulationManager.instance;
    }

    public async simulate(name:string,path:string) {
        const result=await invoke("exec_mas", {name,args: "simulate "+path});
        this.setLog("Simulation started: " + name + " with path: " + path);
    }

    public async read_stdout(name:string){
        const result = await invoke("read_stdout", {name});
        if (typeof result !== "string") {
            throw undefined;
        }
        this.setLog("Read stdout: " + result);
        return result;
    }

    
    profiles={} as Record<string, { name: string, path: string }>;

    public async updateProfiles() {
        const name= "update_profiles"+Math.random().toString(36).substring(2, 15);
        await invoke("exec_mas", {name,args: "simulate list"});
        const outputPromise=new Promise<string>((resolve, reject) => {
            let output = "";
            let exited=100;
            const id=setInterval(async () => {
                output+= await this.read_stdout(name);
                const exitedMsg= await invoke("mas_exited", {name});
                if (exitedMsg==="true") {
                    exited--;
                }
                if (exited<=0) {
                    clearInterval(id);
                    resolve(output);
                }
            }
            , 100);
        });
        const result = await outputPromise;
        
        this.setLog("Profiles updated: " + JSON.stringify(this.profiles));
        if (typeof result !== "string") {
            throw new Error("Expected string result from command, got: " + typeof result);
        }
        for (const line of result.split("\n")) {
            const parts = line.split("|");
            if (parts.length < 2) continue; // Skip invalid lines
            const name = parts[0];
            const path = parts.slice(1).join(" ");
            this.profiles[path] = { name, path };
        }
    }
}
