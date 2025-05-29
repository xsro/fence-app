import { invoke } from "@tauri-apps/api/core";

export const template_data = [
    { "time": 0.0, "state": { "agents": [[7.0, 10.0], [3.0, 10.0], [-1.0, 10.0]], "target": [3.0, 10.0] }, "signals": [{ "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }] },
    { "time": 0.1, "state": { "agents": [[6.61935, 10.0], [3.0, 10.0], [-0.6193500000000001, 10.0]], "target": [3.0, 10.0] }, "signals": [{ "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }] },
    { "time": 0.2, "state": { "agents": [[6.269183720833333, 10.0], [3.0, 10.0], [-0.26918372083333336, 10.0]], "target": [3.0, 10.0] }, "signals": [{ "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }] },
    { "time": 0.3, "state": { "agents": [[5.953332286003188, 10.0], [3.0, 10.0], [0.0466677139968123, 10.0]], "target": [3.0, 10.0] }, "signals": [{ "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }] },
    { "time": 0.4, "state": { "agents": [[5.6812710783577, 10.0], [3.0, 10.0], [0.31872892164230043, 10.0]], "target": [3.0, 10.0] }, "signals": [{ "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }] },
    { "time": 0.5, "state": { "agents": [[5.453365726165287, 10.0], [3.0, 10.0], [0.5466342738347129, 10.0]], "target": [3.0, 10.0] }, "signals": [{ "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }] },
    { "time": 0.6, "state": { "agents": [[5.2670877445530175, 10.0], [3.0, 20.0], [0.7329122554469822, 1.0]], "target": [3.0, 10.0] }, "signals": [{ "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }, { "distance": {}, "rotations": [[0.0, 0.0], [0.0, 0.0], [0.0, 0.0]] }] },
];

export type FenceDataType = typeof template_data[0];

const a = "/Users/apple/repo/drfzh/fencer/tmp/pyfence/大量飞行器围捕匀速目标，但是编队会跟随目标旋转/realtime.json1"
export async function getTemplateData(path: string | undefined): Promise<FenceDataType[]> {
    if (path === undefined) {
        path = a;
    }
    const data_ = await invoke("read_file", { path });
    const data = (data_ as string).split(",\n").map(line => {
        let a = undefined
        try {
            a = JSON.parse(line.trim())
        }
        catch (e) {
            console.error("Error parsing line:", line, e);
        }
        return a;
    }).filter(line => line !== undefined);
    return data as FenceDataType[];
}

export class SimulationManager {
    public static setLog(log: string) {
        console.log("Simulation log:", log);
    }
    private static instance: SimulationManager;

    logs = ""
    private setLog(log: string) {
        this.logs += log;
        SimulationManager.setLog(this.logs);
    }

    private constructor() {
        setInterval(async () => {
            for (const name in this.simulationProcess) {
                const exited = await invoke("mas_exited", { name })
                if (exited === "true") {
                    continue
                }

                const result = await invoke("read_stdout", { name });
                if (typeof result !== "string") {
                    this.setLog("Error reading stdout for " + name + ": Expected string, got " + typeof result);
                    continue;
                }
                this.simulationProcess[name] += result;
            }
        }, 1000);
    }


    public static getInstance(): SimulationManager {
        if (!SimulationManager.instance) {
            SimulationManager.instance = new SimulationManager();
        }
        return SimulationManager.instance;
    }

    public simulationProcess: Record<string, string> = {};
    public async simulate(name: string, path: string) {
        const result = await invoke("exec_mas", { name, args: "simulate " + path });
        this.setLog("Simulation started: " + name + " with path: " + path);
        this.simulationProcess[name] = "";
    }

    public async read_stdout(name: string) {
        const result = await invoke("read_stdout", { name });
        if (typeof result !== "string") {
            throw undefined;
        }
        this.setLog("Read stdout: " + result);
        return result;
    }

    public async read_file(path: string) {
        const result = await invoke("read_file", { path });
        if (typeof result !== "string") {
            throw new Error("Expected string result from read_file, got: " + typeof result);
        }
        this.setLog("Read file: " + path);
        return result;
    }


    profiles = {} as Record<string, { name: string, path: string }>;

    public async updateProfiles() {
        const name = "update_profiles" + Math.random().toString(36).substring(2, 15);
        await invoke("exec_mas", { name, args: "simulate list" });
        const outputPromise = new Promise<string>((resolve, reject) => {
            setTimeout(() => {
                invoke("read_stdout", { name })
                    .then((result) => {
                        if (typeof result !== "string") {
                            reject(new Error("Expected string result from command, got: " + typeof result));
                        } else {
                            resolve(result);
                        }
                    })
                    .catch(reject);
            }, 10000);
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
