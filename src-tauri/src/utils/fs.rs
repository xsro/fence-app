use std::fs::File;
use std::io::{BufRead, BufReader, Error, ErrorKind, Read, Result, Seek, SeekFrom};
use std::path::Path;

/// Reads lines from a text file starting at line 'a' up to line 'b' (1-based indices).
/// 
/// # Arguments
/// * `path` - The path to the text file.
/// * `a` - The starting line number (inclusive, 1-based).
/// * `b` - The ending line number (inclusive, 1-based).
/// 
/// # Returns
/// A vector of strings containing the lines from 'a' to 'b', or an error if the file cannot be read.
/// 
/// # Errors
/// Returns an error if the file cannot be opened or read, or if 'a' is greater than 'b'.
/// 
/// # Example
/// ```
/// let lines = read_lines_range("example.txt", 1, 10)?;
/// ```
pub fn read_lines_range<P: AsRef<Path>>(path: P, a: u32, b: u32) -> Result<Vec<String>> {
    // Validate input parameters
    if a > b {
        return Err(Error::new(ErrorKind::InvalidInput, "Start line 'a' must be less than or equal to end line 'b'"));
    }

    let file = File::open(path)?;
    let reader = BufReader::new(file);
    let mut lines = Vec::new();

    for (i, line) in reader.lines().enumerate() {
        let line_num = i as u32 + 1; // Convert to 1-based index

        // Skip lines before 'a'
        if line_num < a {
            continue;
        }

        // Stop reading after line 'b'
        if line_num > b {
            break;
        }

        lines.push(line?);
    }

    Ok(lines)
}

/// 从文件末尾读取指定范围的行
/// 
/// # 参数
/// - `path`: 文件路径
/// - `a`: 起始行号（从文件末尾计数，1 表示最后一行）
/// - `b`: 结束行号（必须大于等于 a）
/// 
/// # 返回
/// - 成功时返回包含指定行的字符串向量
/// - 失败时返回错误
pub fn read_lines_range_from_end<P: AsRef<Path>>(path: P, a: u32, b: u32) -> Result<Vec<String>> {
    // 验证参数有效性
    if a == 0 {
        return Err(Error::new(ErrorKind::InvalidInput, "起始行号 a 不能为 0"));
    }
    if b < a {
        return Err(Error::new(ErrorKind::InvalidInput, "结束行号 b 不能小于起始行号 a"));
    }

    let file = File::open(path)?;
    let reader = BufReader::new(file);
    let mut lines: Vec<String> = Vec::new();

    // 逐行读取文件并存储
    for line in reader.lines() {
        lines.push(line?);
    }

    let total_lines = lines.len() as u32;

    // 检查范围是否超出文件总行数
    if a > total_lines {
        return Ok(Vec::new()); // 范围超出文件总行数，返回空向量
    }

    // 计算实际要提取的行的索引范围
    let start_idx = (total_lines - a) as usize;
    let end_idx = (total_lines - b) as usize;

    // 提取指定范围的行
    let result: Vec<String> = lines[end_idx..=start_idx].iter().rev().cloned().collect();

    Ok(result)
} 

#[test]
fn main() -> Result<()> {
    // Example usage
    let filename = "F:\\liuch586\\repo\\drfzh\\fence-app\\src-tauri\\src\\utils\\fs.rs";
    
    println!("Reading lines 2-4:");
    let lines = read_lines_range(filename, 2, 4)?;
    for line in lines {
        println!("{}", line);
    }

    println!("\nReading lines 2-4 from the end:");
    let lines_from_end = read_lines_range_from_end(filename, 2, 4)?;
    for line in lines_from_end {
        println!("{}", line);
    }

    Ok(())
}    