mod config;
mod utils;
use lazy_static::lazy_static;
use std::sync::Mutex;

lazy_static! {
    pub static ref MANAGER: Mutex<utils::cp::PythonProcessManager> = Mutex::new(utils::cp::PythonProcessManager::new());
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust! ", name)
}

#[tauri::command]
fn exec_mas(name:String,args: String) -> Result<String,String> {
    println!("Executing command with name: {} and args: {}", name, args);
    let arg_vec = args.split_whitespace().collect::<Vec<&str>>();
    let config = config::read_config().map_err(|e| {
        eprintln!("Error reading configuration: {}", e);
        String::from("Failed to read configuration")
    })?;
    MANAGER
        .lock()
        .expect("Failed to lock PythonProcessManager")
        .add(&name, &config.python_path, &config.mas_path, &arg_vec)
        .map_err(|e| e.to_string())?;
    Ok(format!("Command executed with name: {} and args: {:?}", name, arg_vec))
}

#[tauri::command]
fn mas_exited(name:String) -> Result<String,String> {
    let exited=MANAGER
        .lock()
        .expect("Failed to lock PythonProcessManager")
        .is_exited(&name);
    Ok(format!("{}", exited))
}


#[tauri::command]
fn read_stdout(name: String) -> String {
    let manager = MANAGER.lock().expect("Failed to lock PythonProcessManager");
    let out=manager.read(&name);
    if out.is_err() {
        return format!("Failed to read stdout for process '{}'", name);
    }
    let output = out.unwrap();
    output.unwrap_or_else(|| String::from("No output available or process not found"))
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet,exec_mas,mas_exited,read_stdout])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
