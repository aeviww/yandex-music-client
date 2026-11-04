#[cfg(windows)]
use std::collections::BTreeSet;

#[cfg(windows)]
fn collect_fonts(root: winreg::HKEY, out: &mut BTreeSet<String>) {
    let Ok(key) = winreg::RegKey::predef(root)
        .open_subkey("SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts")
    else {
        return;
    };

    for (name, _) in key.enum_values().flatten() {
        let family = match name.rsplit_once(" (") {
            Some((left, right)) if right.ends_with(')') => left,
            _ => name.as_str(),
        }
        .trim();

        if !family.is_empty() {
            out.insert(family.to_string());
        }
    }
}

/// List font families installed for the current user and for all users.
#[tauri::command]
pub fn list_system_fonts() -> Vec<String> {
    #[cfg(windows)]
    {
        let mut out = BTreeSet::new();
        collect_fonts(winreg::enums::HKEY_LOCAL_MACHINE, &mut out);
        collect_fonts(winreg::enums::HKEY_CURRENT_USER, &mut out);
        out.into_iter().collect()
    }

    #[cfg(not(windows))]
    {
        Vec::new()
    }
}
