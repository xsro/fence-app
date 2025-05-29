use std::io::{self, Read, Write};
use std::process::{Command, Stdio, Child, ChildStdin, ChildStdout, ChildStderr, ExitStatus};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;
use threadpool::ThreadPool; // Requires `threadpool` crate in Cargo.toml

// Child process control structure
struct ChildController {
    child_id: u32,
    stdin: Option<ChildStdin>,
    stdout: Option<ChildStdout>,
    stderr: Option<ChildStderr>,
    child: Option<Child>, // Option to own the Child process handle
}

impl ChildController {
    // Start a child process and return a controller
    fn new(command: &str, args: &[&str], id: u32) -> io::Result<Self> {
        println!(
            "ChildController {}: Spawning command '{}' with args: {:?}",
            id, command, args
        );
        let mut child_process_handle = Command::new(command)
            .args(args)
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()?; // Spawn the child process

        Ok(Self {
            child_id: id,
            stdin: child_process_handle.stdin.take(),
            stdout: child_process_handle.stdout.take(),
            stderr: child_process_handle.stderr.take(),
            child: Some(child_process_handle),
        })
    }

    // Send a command string to the child process's stdin
    fn send_command(&mut self, command_text: &str) -> io::Result<()> {
        if let Some(ref mut stdin_pipe) = self.stdin {
            stdin_pipe.write_all(command_text.as_bytes())?;
            stdin_pipe.write_all(b"\n")?; // Append newline, common for command-line tools
            stdin_pipe.flush()?; // Ensure the command is sent immediately
            println!(
                "ChildController {}: Sent command: {}",
                self.child_id, command_text
            );
        } else {
            return Err(io::Error::new(
                io::ErrorKind::NotConnected,
                "Stdin is not available for this child process.",
            ));
        }
        Ok(())
    }

    // Read output from the child process's stdout
    // Note: read_to_string blocks until EOF. For continuous output, line-by-line reading might be better.
    fn read_output(&mut self) -> io::Result<String> {
        let mut output_buffer = String::new();
        if let Some(ref mut stdout_pipe) = self.stdout {
            // This will block until the stdout pipe is closed by the child process (e.g., on exit)
            // or until an error occurs.
            stdout_pipe.read_to_string(&mut output_buffer)?;
            if !output_buffer.is_empty() {
                println!(
                    "ChildController {}: Read {} bytes from stdout.",
                    self.child_id,
                    output_buffer.len()
                );
            }
        } else {
            return Err(io::Error::new(
                io::ErrorKind::NotConnected,
                "Stdout is not available for this child process.",
            ));
        }
        Ok(output_buffer)
    }
    
    // Read error output from the child process's stderr
    fn read_error_output(&mut self) -> io::Result<String> {
        let mut error_buffer = String::new();
        if let Some(ref mut stderr_pipe) = self.stderr {
            // Non-blocking read attempt for stderr, as it might not always have data
            // For simplicity, we'll use read_to_string which can block if stderr isn't closed.
            // A more robust solution might use non-blocking reads or select.
            stderr_pipe.read_to_string(&mut error_buffer)?;
             if !error_buffer.is_empty() {
                println!(
                    "ChildController {}: Read {} bytes from stderr.",
                    self.child_id,
                    error_buffer.len()
                );
            }
        } else {
            return Err(io::Error::new(
                io::ErrorKind::NotConnected,
                "Stderr is not available for this child process.",
            ));
        }
        Ok(error_buffer)
    }


    // Wait for the child process to exit
    fn wait(&mut self) -> io::Result<ExitStatus> {
        if let Some(ref mut child_handle) = self.child {
            println!("ChildController {}: Waiting for process to exit...", self.child_id);
            child_handle.wait()
        } else {
            Err(io::Error::new(
                io::ErrorKind::NotFound, // Changed from Other for clarity
                "Child process handle does not exist or was already taken.",
            ))
        }
    }
}

fn main() {
    // Create a thread pool (max 4 concurrent tasks)
    let pool = ThreadPool::new(4);
    // Store controllers in Arc<Mutex<...>> for shared, mutable access across threads
    let mut controllers: Vec<Arc<Mutex<ChildController>>> = Vec::new();

    // --- IMPORTANT NOTE ON THE `ping` COMMAND INTERACTION ---
    // The `ping` command (especially with `-c 10` or `-n 10`) is generally NOT interactive via stdin.
    // It takes its parameters as command-line arguments, runs for a fixed duration (10 pings),
    // prints its output, and then exits.
    //
    // The `send_command` calls in this program will write to `ping`'s stdin, but `ping` will likely ignore this input.
    // The `read_output` calls will read the standard output of the `ping` command.
    // If `read_output` is called while `ping` is still running, it will block until `ping` finishes and closes its stdout.
    // If called after `ping` has exited, it might get buffered output or an empty string/error.
    //
    // This interaction model (repeatedly sending commands and reading output for a single `ping -c 10` instance)
    // might not yield the expected results. A command that actively reads from stdin and produces
    // corresponding output would be a better fit for this kind of interactive control loop.
    // ---

    // Start multiple child processes (using ping as an example)
    let num_processes = 3;
    for i in 0..num_processes {
        let child_id = i as u32;
        // For Unix-like systems: ping -c 10 (sends 10 packets)
        // For Windows: ping -n 10 www.rust-lang.org
        // Ensure the command is appropriate for your OS.
        match ChildController::new("ping", &["-c", "5", "www.rust-lang.org"], child_id) {
            Ok(controller) => {
                controllers.push(Arc::new(Mutex::new(controller)));
                println!("Main: Created controller for child ID {}", child_id);
            }
            Err(e) => {
                eprintln!("Main: Failed to create controller for child ID {}: {}", child_id, e);
            }
        }
    }

    // Control child processes and attempt to collect output over several "queries"
    let num_queries = 5; // Reduced for quicker testing
    for query_idx in 0..num_queries {
        println!("\nMain: Starting query cycle #{}", query_idx);

        // For each controller, submit a task to the thread pool
        for controller_arc in &controllers {
            let controller_clone = Arc::clone(controller_arc); // Clone Arc for the thread
            let current_query_index = query_idx; // Capture query_idx for the closure

            pool.execute(move || {
                // Lock the mutex to get mutable access to the ChildController
                let mut controller_guard = match controller_clone.lock() {
                    Ok(guard) => guard,
                    Err(poisoned) => {
                        // Attempt to get child_id even if poisoned for logging, may not always work
                        let id_for_log = poisoned.get_ref().child_id;
                        eprintln!(
                            "Task (Query {}): Critical - Mutex poisoned for controller (child {}). Task cannot proceed. Error: {}",
                            current_query_index, id_for_log, poisoned
                        );
                        return;
                    }
                };

                let child_id = controller_guard.child_id; // Get child_id for logging

                // Attempt to send a "command" (ping will likely ignore this)
                let command_to_send = format!("This is query #{} for child {}", current_query_index, child_id);
                if let Err(e) = controller_guard.send_command(&command_to_send) {
                    eprintln!(
                        "Task (Child {}, Query {}): Error sending command: {}",
                        child_id, current_query_index, e
                    );
                    // Decide if to continue if sending command fails
                }

                // Attempt to read output
                // This will block if ping is still running and hasn't closed stdout.
                // If ping has finished, this might read remaining buffer or get EOF.
                match controller_guard.read_output() {
                    Ok(output) => {
                        if !output.is_empty() {
                            println!(
                                "Task (Child {}, Query {}): Received Stdout:\n---\n{}\n---",
                                child_id, current_query_index, output.trim()
                            );
                        } else {
                            println!(
                                "Task (Child {}, Query {}): No new stdout output.",
                                child_id, current_query_index
                            );
                        }
                    }
                    Err(e) => {
                        // Non-EOF errors are more concerning. EOF is expected when process ends.
                        if e.kind() != io::ErrorKind::UnexpectedEof && e.kind() != io::ErrorKind::BrokenPipe {
                             eprintln!(
                                "Task (Child {}, Query {}): Error reading stdout: {} (Kind: {:?})",
                                child_id, current_query_index, e, e.kind()
                            );
                        } else {
                             println!(
                                "Task (Child {}, Query {}): Stdout pipe closed or EOF (expected if process ended).",
                                child_id, current_query_index
                            );
                        }
                    }
                }
                
                // Attempt to read error output
                match controller_guard.read_error_output() {
                    Ok(error_output) => {
                        if !error_output.is_empty() {
                            println!(
                                "Task (Child {}, Query {}): Received Stderr:\n---\n{}\n---",
                                child_id, current_query_index, error_output.trim()
                            );
                        }
                    }
                    Err(e) => {
                         if e.kind() != io::ErrorKind::UnexpectedEof && e.kind() != io::ErrorKind::BrokenPipe {
                            eprintln!(
                                "Task (Child {}, Query {}): Error reading stderr: {} (Kind: {:?})",
                                child_id, current_query_index, e, e.kind()
                            );
                        }
                    }
                }
                // MutexGuard is dropped here, releasing the lock
            });
        }
        
        // Pause in the main thread before submitting the next batch of tasks
        println!("Main: Query cycle #{} tasks submitted. Sleeping for 2 seconds...", query_idx);
        thread::sleep(Duration::from_secs(2));
    }

    println!("\nMain: All query cycles complete. Waiting for child processes to exit...");
    // Wait for all child processes to exit
    for controller_arc in controllers {
        // Lock the mutex to access the controller for waiting
        let mut controller_guard = match controller_arc.lock() {
            Ok(guard) => guard,
            Err(poisoned) => {
                let id_for_log = poisoned.get_ref().child_id;
                eprintln!(
                    "Main: Mutex poisoned when trying to wait for child {}. Error: {}",
                    id_for_log, poisoned
                );
                continue; // Skip this controller
            }
        };
        
        let child_id = controller_guard.child_id;
        match controller_guard.wait() {
            Ok(status) => println!(
                "Main: Child process {} (controller {}) exited with status: {}",
                child_id, child_id, status
            ),
            Err(e) => eprintln!(
                "Main: Error waiting for child process {} (controller {}): {}",
                child_id, child_id, e
            ),
        }
    }

    println!("Main: Waiting for thread pool to join...");
    pool.join(); // Wait for all tasks in the pool to complete
    println!("Main: Program finished.");
}

