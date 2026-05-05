use std::env;

#[cfg(not(target_os = "android"))]
fn get_os_username_impl() -> String {
    env::var("USER")
        .or_else(|_| env::var("USERNAME"))
        .or_else(|_| env::var("LOGNAME"))
        .unwrap_or_else(|_| "unknown".to_string())
}

#[cfg(target_os = "android")]
fn get_os_username_impl() -> String {
    "unknown".to_string()
}

#[cfg(not(target_os = "android"))]
fn get_hostname_impl() -> String {
    env::var("HOSTNAME")
        .or_else(|_| env::var("COMPUTERNAME"))
        .unwrap_or_else(|_| "unknown".to_string())
}

#[cfg(target_os = "android")]
fn get_hostname_impl() -> String {
    hostname::get()
        .map(|h| h.to_string_lossy().to_string())
        .unwrap_or_else(|_| "unknown".to_string())
}

#[tauri::command]
fn get_os_username() -> String {
    get_os_username_impl()
}

#[tauri::command]
fn get_hostname() -> String {
    get_hostname_impl()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_sql::Builder::new().build())
        .invoke_handler(tauri::generate_handler![get_os_username, get_hostname])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
