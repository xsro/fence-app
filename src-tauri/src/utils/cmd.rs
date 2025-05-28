use std::process::Command;
use anyhow::{Result, Context};

/// Executes a Python script with specified arguments.
/// 
/// # Arguments
/// * `python_path` - Path to the Python interpreter
/// * `script_path` - Path to the Python script to execute
/// * `arguments` - List of command-line arguments to pass to the script
/// 
/// # Returns
/// * `Ok(())` if the command executes successfully
/// * `Err` with detailed error information if execution fails
pub fn execute_python_script(
    python_path: &str,
    script_path: &str,
    arguments: Vec<String>,
) -> Result<String> {
    // Validate input paths
    if !std::path::Path::new(python_path).exists() {
        return Err(anyhow::anyhow!("Python interpreter not found at path: {}", python_path));
    }
    
    if !std::path::Path::new(script_path).exists() {
        return Err(anyhow::anyhow!("Python script not found at path: {}", script_path));
    }

    // Build the command
    let mut command = Command::new(python_path);
    command.arg(script_path);
    
    // Add all arguments
    for arg in &arguments {
        command.arg(arg);
    }

    // Execute the command and capture output
    let output = command
        .output()
        .with_context(|| format!("Failed to execute command: {:?}", command))?;

    // Handle command execution results
    if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout);
        println!("Command executed successfully:\n{}", stdout);
        Ok(stdout.to_string())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        let exit_code = output.status.code().unwrap_or(-1);
        Err(anyhow::anyhow!("Command failed with exit code {}:\n{}", exit_code, stderr))
    }
}