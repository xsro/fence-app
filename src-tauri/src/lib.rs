mod config;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust! ", name)
}

#[tauri::command]
fn log_message(message: String) -> Result<String, String> {
    println!("Log: {}", message);
    Ok(format!("Logged: {}", message))
}

#[tauri::command]
fn get_config() -> Result<config::Config, String> {
    match config::read_config() {
        Ok(config) => Ok(config),
        Err(e) => Err(format!("Failed to read config: {}", e)),
    }
}

#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    std::fs::read_to_string(path).map_err(|e| e.to_string())
}


#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet,log_message,get_config,read_file])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
