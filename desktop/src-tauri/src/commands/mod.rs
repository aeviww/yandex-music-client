mod ai;
mod auth;
mod catalog;
mod library;
mod playback;
mod radio;
mod system;

pub use ai::*;
pub use auth::*;
pub use catalog::*;
pub use library::*;
pub use playback::*;
pub use radio::*;
pub use system::*;

pub(crate) const DEFAULT_STATION: &str = "user:onyourwave";

#[derive(serde::Serialize)]
pub struct Ok_ {
    pub ok: bool,
}
