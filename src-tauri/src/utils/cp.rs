use std::collections::HashMap;
use std::io::{BufRead, BufReader, Stdout};
use std::process::{Child, Command, Stdio,ChildStderr, ChildStdout};
use std::sync::{Arc, Mutex};
use std::time::Duration;

#[derive(Debug)]
pub struct PythonProcessManager {
    processes: Mutex<HashMap<String, Arc<Mutex<ProcessInfo>>>>,
}

#[derive(Debug)]
struct ProcessInfo {
    child: Child,
    stdout_reader: Option<BufReader<ChildStdout>>,
}

impl PythonProcessManager {
    // 创建新的 Python 进程管理器
    pub fn new() -> Self {
        Self {
            processes: Mutex::new(HashMap::new()),
        }
    }

    // 添加并运行 Python 程序
    pub fn add(&self, name: &str, python_path: &str, script_path: &str, args: &[&str]) -> Result<(), String> {
        let mut processes = self.processes.lock().unwrap();
        
        // 检查名称是否已存在
        if processes.contains_key(name) {
            return Err(format!("Process with name '{}' already exists", name));
        }
        
        // 构建命令，捕获 stdout
        let mut cmd = Command::new(python_path);
        cmd.arg(script_path);
        cmd.args(args);
        cmd.stdout(Stdio::piped());
        cmd.stderr(Stdio::piped());
        
        // 启动进程
        let mut child = match cmd.spawn() {
            Ok(child) => child,
            Err(e) => return Err(format!("Failed to start process: {}", e)),
        };
        
        // 获取 stdout 句柄
        let stdout = match child.stdout.take() {
            Some(stdout) => stdout,
            None => return Err("Failed to capture stdout".to_string()),
        };
        
        // 创建带缓冲的读取器
        let stdout_reader = Some(BufReader::new(stdout));
        
        // 存储进程信息
        processes.insert(
            name.to_string(),
            Arc::new(Mutex::new(ProcessInfo {
                child,
                stdout_reader,
            })),
        );
        
        Ok(())
    }

    // 读取指定进程的标准输出
    pub fn read(&self, name: &str) -> Result<Option<String>, String> {
        let processes = self.processes.lock().unwrap();
        
        // 检查进程是否存在
        let process_info = match processes.get(name) {
            Some(info) => info,
            None => return Err(format!("Process with name '{}' not found", name)),
        };
        
        let mut process_info = process_info.lock().unwrap();
        
        // 检查 stdout reader 是否存在
        let reader = match &mut process_info.stdout_reader {
            Some(reader) => reader,
            None => return Ok(None),
        };
        
        // 尝试读取一行输出
        let mut line = String::new();
        match reader.read_line(&mut line) {
            Ok(0) => {
                // 读取到 EOF，可能进程已退出
                Ok(None)
            },
            Ok(_) => Ok(Some(line)),
            Err(e) => Err(format!("Failed to read stdout: {}", e)),
        }
    }

    // 读取指定进程的所有可用输出（非阻塞）
    pub fn read_all(&self, name: &str) -> Result<Option<String>, String> {
        let processes = self.processes.lock().unwrap();
        
        // 检查进程是否存在
        let process_info = match processes.get(name) {
            Some(info) => info,
            None => return Err(format!("Process with name '{}' not found", name)),
        };
        
        let mut process_info = process_info.lock().unwrap();
        
        // 检查 stdout reader 是否存在
        let reader = match &mut process_info.stdout_reader {
            Some(reader) => reader,
            None => return Ok(None),
        };
        
        let mut all_output = String::new();
        let mut buffer = String::new();
        
        // 非阻塞读取所有可用行
        loop {
            // 保存当前位置
            let pos = match reader.buffer().len() {
                0 => break,  // 没有更多数据
                n => n,
            };
            
            // 尝试读取一行
            match reader.read_line(&mut buffer) {
                Ok(0) => break,  // 读取到 EOF
                Ok(_) => {
                    all_output.push_str(&buffer);
                    buffer.clear();
                },
                Err(e) => return Err(format!("Failed to read stdout: {}", e)),
            }
        }
        
        if all_output.is_empty() {
            Ok(None)
        } else {
            Ok(Some(all_output))
        }
    }

    pub fn is_exited(&mut self,name:&str) -> bool {
        let processes = self.processes.lock().unwrap();
        if let Some(process_info) = processes.get(name) {
            let mut process_info = process_info.lock().unwrap();
            match process_info.child.try_wait() {
                Ok(Some(_)) => true,  // 进程已退出
                Ok(None) => false,    // 进程仍在运行
                Err(_) => false,      // 出现错误，假设进程仍在运行
            }
        } else {
            true // 如果进程不存在，视为已退出
        }
    }

    // 停止指定名称的进程
    pub fn stop(&self, name: &str) -> Result<(), String> {
        let mut processes = self.processes.lock().unwrap();
        
        // 检查进程是否存在
        // 先移除进程，避免双重可变借用
        let process_info = match processes.remove(name) {
            Some(info) => info,
            None => return Err(format!("Process with name '{}' not found", name)),
        };

        let mut process_info = process_info.lock().unwrap();

        // 尝试终止进程
        match process_info.child.kill() {
            Ok(_) => {
                // 等待进程退出
                match process_info.child.wait() {
                    Ok(_status) => Ok(()),
                    Err(e) => Err(format!("Failed to wait for process exit: {}", e)),
                }
            },
            Err(e) => Err(format!("Failed to kill process: {}", e)),
        }
    }

    // 停止所有进程
    pub fn stop_all(&self) -> Result<(), String> {
        let mut processes = self.processes.lock().unwrap();
        let mut errors = Vec::new();
        
        // 尝试终止所有进程
        for (name, process_info) in processes.iter_mut() {
            let mut process_info = process_info.lock().unwrap();
            
            if let Err(e) = process_info.child.kill() {
                errors.push(format!("Failed to kill process '{}': {}", name, e));
                continue;
            }
            
            // 等待进程退出
            if let Err(e) = process_info.child.wait() {
                errors.push(format!("Failed to wait for process '{}' exit: {}", name, e));
            }
        }
        
        // 清空进程列表
        processes.clear();
        
        // 如果有错误，返回第一个错误
        if !errors.is_empty() {
            Err(errors.join("\n"))
        } else {
            Ok(())
        }
    }

    // 获取所有正在运行的进程名称
    pub fn list_processes(&self) -> Vec<String> {
        let processes = self.processes.lock().unwrap();
        processes.keys().cloned().collect()
    }

    // 检查进程是否正在运行
    pub fn is_running(&self, name: &str) -> bool {
        let processes = self.processes.lock().unwrap();
        processes.contains_key(name)
    }
}

// 使用示例
fn main() {
    let manager = PythonProcessManager::new();
    
    // 添加并运行 Python 程序
    manager.add(
        "script1",
        "python3",
        "/path/to/script1.py",
        &["--arg1", "value1"]
    ).expect("Failed to start script1");
    
    // 读取输出
    if let Ok(Some(output)) = manager.read("script1") {
        println!("Output from script1: {}", output);
    }
    
    // 停止进程
    manager.stop("script1").expect("Failed to stop script1");
}