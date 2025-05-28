use mas::version;
use tauri::http::version;
mod config;
mod utils;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    let version = version();
    format!("Hello, {}! You've been greeted from Rust! with {}", name,version)
}

#[tauri::command]
fn read_config() -> String {
    config::read_config()
        .unwrap_or_else(|_| String::from("Failed to read config"))
}

#[tauri::command]
fn read_file(name: &str) -> String {
    utils::fs::readfile(name)
        .unwrap_or_else(|_| String::from("Failed to read file"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
