use std::fs::{self, File};
use std::io::{self, Write};
use std::path::{Path, PathBuf};
use serde::{Deserialize, Serialize};
use serde_json;

// 定义结构体，derive 自动实现序列化/反序列化 trait
#[derive(Debug, Deserialize, Serialize)]
pub struct Config {
    pub python_path: String,
    pub mas_path: String,
}


// Resolve the path containing ~ to the user's home directory
fn get_config_path() -> io::Result<PathBuf> {
    let mut path = PathBuf::new();
    
    // Get the user's home directory
    let home = dirs::home_dir().ok_or_else(|| {
        io::Error::new(io::ErrorKind::NotFound, "Failed to determine home directory")
    })?;
    
    // Build the full path: ~/.config/fence/config.json
    path.push(home);
    path.push(".config");
    path.push("fence");
    path.push("config.json");
    
    Ok(path)
}

pub fn read_config() -> io::Result<Config> {
    // Get the configuration file path (resolving ~ to home directory)
    let config_path = get_config_path()?;
    
    // Ensure the configuration directory exists
    if let Some(dir) = config_path.parent() {
        fs::create_dir_all(dir)?;
    }
    
    let mut result= String::new();
    // Check if the file exists and handle accordingly
    if !config_path.exists() {
        // File doesn't exist, create and write {}
        let mut file = File::create(&config_path)?;
        file.write_all(b"{}")?;
        result = String::from("{}");
    } else {
        // File exists, read its contents
        let contents = fs::read_to_string(&config_path)?;
        result = contents;
    }
    // Parse the JSON content into the Config struct
    let config: Config = serde_json::from_str(&result).unwrap_or_else(|_| Config {
        python_path: String::new(),
        mas_path: String::new(),
    });
    Ok(config)
}