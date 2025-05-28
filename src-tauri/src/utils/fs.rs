use std::fs::File;
use std::io::{self, Read};

pub fn readfile(filename:&str) -> io::Result<String> {

    // 打开文件
    let mut file = File::open(filename)?;
    
    // 创建一个可变的String来存储内容
    let mut contents = String::new();
    
    // 从文件读取内容到字符串
    file.read_to_string(&mut contents)?;
    
    Ok(contents)
}