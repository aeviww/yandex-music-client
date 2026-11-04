use super::*;

fn host_of(href: &str) -> String {
    let without_scheme = href
        .split_once("://")
        .map(|(_, rest)| rest)
        .unwrap_or(href);
    let host = without_scheme
        .split('/')
        .next()
        .unwrap_or(without_scheme)
        .trim_start_matches("www.");
    host.to_string()
}

fn network_from_href(href: &str) -> Option<String> {
    let host = host_of(href).to_lowercase();
    let known = [
        ("vk.com", "vk"),
        ("vkontakte.ru", "vk"),
        ("t.me", "telegram"),
        ("telegram.me", "telegram"),
        ("instagram.com", "instagram"),
        ("youtube.com", "youtube"),
        ("youtu.be", "youtube"),
        ("twitter.com", "twitter"),
        ("x.com", "twitter"),
        ("tiktok.com", "tiktok"),
        ("facebook.com", "facebook"),
        ("soundcloud.com", "soundcloud"),
        ("spotify.com", "spotify"),
        ("apple.com", "apple"),
        ("bandcamp.com", "bandcamp"),
        ("twitch.tv", "twitch"),
        ("dzen.ru", "dzen"),
        ("ok.ru", "ok"),
    ];
    known
        .iter()
        .find(|(domain, _)| host == *domain || host.ends_with(&format!(".{domain}")))
        .map(|(_, name)| (*name).to_string())
}

fn network_title(network: &str) -> String {
    match network {
        "vk" => "ВКонтакте",
        "telegram" => "Telegram",
        "instagram" => "Instagram",
        "youtube" => "YouTube",
        "twitter" => "X",
        "tiktok" => "TikTok",
        "facebook" => "Facebook",
        "soundcloud" => "SoundCloud",
        "spotify" => "Spotify",
        "apple" => "Apple Music",
        "bandcamp" => "Bandcamp",
        "twitch" => "Twitch",
        "dzen" => "Дзен",
        "ok" => "Одноклассники",
        other => other,
    }
    .to_string()
}

impl Yandex {
    pub async fn artist_tracks(&self, artist_id: &str) -> Result<Vec<TrackDto>, String> {
        let mut tracks = Vec::new();
        for page in 0..10 {
            let result = self
                .get_result(&format!(
                    "/artists/{artist_id}/tracks?page={page}&page-size=100"
                ))
                .await?;
            let items = result
                .get("tracks")
                .and_then(|value| value.as_array())
                .or_else(|| result.as_array())
                .cloned()
                .unwrap_or_default();
            let count = items.len();
            for raw in items {
                if let Ok(track) = serde_json::from_value::<YTrack>(raw) {
                    tracks.push(map_track(&track));
                }
            }
            if count < 100 {
                break;
            }
        }
        Ok(tracks)
    }

    pub async fn new_releases(&self) -> Result<Vec<AlbumBriefDto>, String> {
        let resp = self
            .http
            .get(format!("{BASE}/landing-blocks/new-releases"))
            .header("Authorization", self.auth())
            .send()
            .await
            .map_err(|e| e.to_string())?;
        let status = resp.status();
        if status.as_u16() == 401 {
            return Err("Невалидный токен Яндекс Музыки".to_string());
        }
        let val: serde_json::Value = resp.json().await.map_err(|e| e.to_string())?;
        if !status.is_success() {
            return Err(format!("Ошибка API Яндекса: {status}"));
        }
        let top = val
            .get("result")
            .or_else(|| val.get("payload"))
            .unwrap_or(&val);
        let empty = Vec::new();
        let arr = top
            .get("newReleases")
            .and_then(|v| v.as_array())
            .or_else(|| top.as_array())
            .unwrap_or(&empty);
        Ok(arr
            .iter()
            .take(40)
            .map(|item| {
                let album = item.get("album").cloned().unwrap_or_default();
                let missing = serde_json::Value::Null;
                let id = val_to_id(album.get("id").unwrap_or(&missing));
                let title = album
                    .get("title")
                    .and_then(|v| v.as_str())
                    .unwrap_or("Альбом")
                    .to_string();
                let cover_uri = str_at(&album, &["cover", "uri"]);
                let artist = item
                    .get("artists")
                    .and_then(|a| a.as_array())
                    .and_then(|a| a.first())
                    .and_then(|a| a.get("name"))
                    .and_then(|v| v.as_str())
                    .unwrap_or("")
                    .to_string();
                let year = item
                    .get("releaseDate")
                    .and_then(|v| v.as_str())
                    .and_then(|s| s.get(0..4))
                    .and_then(|y| y.parse::<i64>().ok());
                AlbumBriefDto {
                    id,
                    title,
                    artist,
                    cover_url: img(cover_uri.as_deref(), "300x300"),
                    year,
                }
            })
            .filter(|a| !a.id.is_empty())
            .collect())
    }

    pub async fn neuro_items(&self) -> Result<Vec<NeuroItemDto>, String> {
        let resp = self
            .http
            .get(format!("{BASE}/landing/block/neuromusic_mobile/neuromusic"))
            .header("Authorization", self.auth())
            .send()
            .await
            .map_err(|e| e.to_string())?;
        let status = resp.status();
        if status.as_u16() == 401 {
            return Err("Невалидный токен Яндекс Музыки".to_string());
        }
        let val: serde_json::Value = resp.json().await.map_err(|e| e.to_string())?;
        if !status.is_success() {
            return Err(format!("Ошибка API Яндекса: {status}"));
        }
        let top = val
            .get("result")
            .or_else(|| val.get("payload"))
            .unwrap_or(&val);
        let items = top.get("items").and_then(|v| v.as_array()).cloned();
        Ok(items
            .unwrap_or_default()
            .iter()
            .filter_map(|item| {
                let station = item.get("stationId").and_then(|v| v.as_str())?;
                if item
                    .get("type")
                    .and_then(|v| v.as_str())
                    .map(|t| !t.eq_ignore_ascii_case("generative_station_item"))
                    .unwrap_or(false)
                {
                    return None;
                }
                Some(NeuroItemDto {
                    id: station.to_string(),
                    title: item
                        .get("title")
                        .and_then(|v| v.as_str())
                        .unwrap_or("Нейростанция")
                        .to_string(),
                    cover_url: img(
                        item.get("imageUrl").and_then(|v| v.as_str()),
                        "300x300",
                    ),
                    color: str_at(&item.clone(), &["style", "backgroundColor"]),
                    text_color: str_at(&item.clone(), &["style", "titleColor"]),
                })
            })
            .collect())
    }

    pub async fn neuro_stream(&self, station: &str) -> Result<NeuroStreamDto, String> {
        let station = station.trim();
        let result = self
            .get_result(&format!("/rotor/station/{station}/stream"))
            .await?;
        let data = result.get("data").cloned().unwrap_or_default();
        let stream_url = str_at(&result, &["stream", "url"]).unwrap_or_default();
        if stream_url.is_empty() {
            return Err("Стрим недоступен".to_string());
        }
        Ok(NeuroStreamDto {
            title: data
                .get("title")
                .and_then(|v| v.as_str())
                .unwrap_or("Нейромузыка")
                .to_string(),
            subtitle: data
                .get("explanations")
                .and_then(|v| v.as_str())
                .or_else(|| data.get("subtitle").and_then(|v| v.as_str()))
                .unwrap_or("")
                .to_string(),
            cover_url: img(
                str_at(&data, &["imageUrl"]).as_deref(),
                "400x400",
            ),
            color: str_at(&data, &["backgroundColor"]),
            stream_url,
        })
    }

    pub async fn artist(&self, artist_id: &str) -> Result<ArtistPageDto, String> {
        let result = self
            .get_result(&format!("/artists/{artist_id}/brief-info"))
            .await?;

        let artist = result.get("artist").cloned().unwrap_or_default();
        let name = artist
            .get("name")
            .and_then(|v| v.as_str())
            .unwrap_or("Артист")
            .to_string();
        let cover = str_at(&artist, &["cover", "uri"]);
        let description = str_at(&artist, &["description", "text"]);
        let counts = |key: &str| {
            artist
                .get("counts")
                .and_then(|c| c.get(key))
                .and_then(|v| v.as_i64())
        };
        let listeners = result
            .get("stats")
            .and_then(|s| s.get("lastMonthListeners"))
            .and_then(|v| v.as_i64())
            .or_else(|| {
                artist
                    .get("ratings")
                    .and_then(|r| r.get("month"))
                    .and_then(|v| v.as_i64())
            });
        let likes = artist
            .get("likesCount")
            .and_then(|v| v.as_i64())
            .or_else(|| {
                result
                    .get("stats")
                    .and_then(|s| s.get("likesCount"))
                    .and_then(|v| v.as_i64())
            });
        let tracks_count = counts("tracks");
        let albums_count = counts("directAlbums");
        let links = artist
            .get("links")
            .and_then(|l| l.as_array())
            .map(|arr| {
                arr.iter()
                    .filter_map(|raw| {
                        let href = raw.get("href").and_then(|v| v.as_str())?;
                        let network = raw
                            .get("socialNetwork")
                            .and_then(|v| v.as_str())
                            .map(|s| s.trim().to_lowercase())
                            .filter(|s| !s.is_empty())
                            .or_else(|| network_from_href(href));
                        let kind = raw
                            .get("type")
                            .and_then(|v| v.as_str())
                            .map(|s| s.trim().to_lowercase())
                            .filter(|s| !s.is_empty())
                            .unwrap_or_else(|| {
                                if network.is_some() {
                                    "social".to_string()
                                } else {
                                    "official".to_string()
                                }
                            });
                        let raw_title = raw
                            .get("title")
                            .and_then(|v| v.as_str())
                            .map(|s| s.trim())
                            .filter(|s| !s.is_empty());
                        let title = raw_title
                            .map(|s| s.to_string())
                            .or_else(|| network.as_deref().map(network_title))
                            .unwrap_or_else(|| host_of(href));
                        Some(ArtistLinkDto {
                            title,
                            href: href.to_string(),
                            kind,
                            network,
                        })
                    })
                    .collect()
            })
            .unwrap_or_default();
        let genres = artist
            .get("genres")
            .and_then(|g| g.as_array())
            .map(|arr| {
                arr.iter()
                    .filter_map(|v| v.as_str().map(|s| s.to_string()))
                    .collect()
            })
            .unwrap_or_default();

        let mut covers: Vec<String> = result
            .get("allCovers")
            .and_then(|c| c.as_array())
            .map(|arr| {
                arr.iter()
                    .filter_map(|c| c.get("uri").and_then(|u| u.as_str()))
                    .filter_map(|u| img(Some(u), "1000x1000"))
                    .collect()
            })
            .unwrap_or_default();
        if let Some(main) = img(cover.as_deref(), "1000x1000") {
            if !covers.iter().any(|c| c == &main) {
                covers.insert(0, main);
            }
        }

        let mut tracks = Vec::new();
        if let Some(arr) = result.get("popularTracks").and_then(|t| t.as_array()) {
            for raw in arr.iter().take(30) {
                if let Ok(t) = serde_json::from_value::<YTrack>(raw.clone()) {
                    tracks.push(map_track(&t));
                }
            }
        }

        let mut albums = Vec::new();
        for key in ["albums", "alsoAlbums"] {
            if let Some(arr) = result.get(key).and_then(|a| a.as_array()) {
                for raw in arr {
                    if let Ok(a) = serde_json::from_value::<YAlbum>(raw.clone()) {
                        albums.push(map_album_brief(&a));
                    }
                }
            }
        }

        Ok(ArtistPageDto {
            id: artist_id.to_string(),
            name,
            cover_url: img(cover.as_deref(), "400x400"),
            description,
            listeners,
            likes,
            tracks_count,
            albums_count,
            links,
            genres,
            tracks,
            albums,
            covers,
        })
    }

    pub async fn album(&self, album_id: &str) -> Result<AlbumPageDto, String> {
        let result = self
            .get_result(&format!("/albums/{album_id}/with-tracks"))
            .await?;

        let title = result
            .get("title")
            .and_then(|v| v.as_str())
            .unwrap_or("Альбом")
            .to_string();
        let cover = result
            .get("coverUri")
            .and_then(|v| v.as_str())
            .map(|s| s.to_string())
            .or_else(|| str_at(&result, &["cover", "uri"]));
        let color = str_at(&result, &["cover", "color"]);

        let artists = result
            .get("artists")
            .and_then(|a| a.as_array())
            .map(|arr| {
                arr.iter()
                    .filter_map(|raw| serde_json::from_value::<YArtist>(raw.clone()).ok())
                    .map(|a| map_artist(&a))
                    .collect()
            })
            .unwrap_or_default();

        let mut tracks = Vec::new();
        if let Some(volumes) = result.get("volumes").and_then(|v| v.as_array()) {
            for volume in volumes {
                if let Some(arr) = volume.as_array() {
                    for raw in arr {
                        if let Ok(t) = serde_json::from_value::<YTrack>(raw.clone()) {
                            tracks.push(map_track(&t));
                        }
                    }
                }
            }
        }

        Ok(AlbumPageDto {
            id: album_id.to_string(),
            title,
            cover_url: img(cover.as_deref(), "400x400"),
            color,
            year: result.get("year").and_then(|v| v.as_i64()),
            genre: result
                .get("genre")
                .and_then(|v| v.as_str())
                .map(|s| s.to_string()),
            artists,
            tracks,
        })
    }

    pub async fn search(&self, text: &str) -> Result<SearchDto, String> {
        let encoded = urlencode(text);
        let result = self
            .get_result(&format!(
                "/search?text={encoded}&type=all&page=0&nocorrect=false"
            ))
            .await?;

        let mut tracks = Vec::new();
        if let Some(arr) = result
            .get("tracks")
            .and_then(|t| t.get("results"))
            .and_then(|r| r.as_array())
        {
            for item in arr {
                if let Ok(t) = serde_json::from_value::<YTrack>(item.clone()) {
                    tracks.push(map_track(&t));
                }
            }
        }

        let mut artists = Vec::new();
        if let Some(arr) = result
            .get("artists")
            .and_then(|t| t.get("results"))
            .and_then(|r| r.as_array())
        {
            for item in arr.iter().take(12) {
                if let Ok(a) = serde_json::from_value::<YArtist>(item.clone()) {
                    artists.push(map_artist(&a));
                }
            }
        }

        let mut albums = Vec::new();
        if let Some(arr) = result
            .get("albums")
            .and_then(|t| t.get("results"))
            .and_then(|r| r.as_array())
        {
            for item in arr.iter().take(12) {
                if let Ok(a) = serde_json::from_value::<YAlbum>(item.clone()) {
                    albums.push(map_album_brief(&a));
                }
            }
        }

        Ok(SearchDto {
            tracks,
            artists,
            albums,
        })
    }

    pub async fn search_suggest(&self, part: &str) -> Result<Vec<String>, String> {
        let part = part.trim();
        if part.is_empty() {
            return Ok(Vec::new());
        }
        let result = self
            .get_result(&format!("/search/suggest?part={}", urlencode(part)))
            .await?;

        let mut out: Vec<String> = Vec::new();
        if let Some(best) = result
            .get("best")
            .and_then(|b| b.get("text"))
            .and_then(|v| v.as_str())
        {
            out.push(best.to_string());
        }
        if let Some(arr) = result.get("suggestions").and_then(|v| v.as_array()) {
            for item in arr {
                let text = match item {
                    serde_json::Value::String(value) => Some(value.clone()),
                    other => other
                        .get("text")
                        .and_then(|v| v.as_str())
                        .map(|s| s.to_string()),
                };
                if let Some(text) = text {
                    out.push(text);
                }
            }
        }

        let mut seen = std::collections::HashSet::new();
        out.retain(|item| !item.trim().is_empty() && seen.insert(item.to_lowercase()));
        out.truncate(10);
        Ok(out)
    }

    pub async fn similar_tracks(&self, track_id: &str) -> Result<Vec<TrackDto>, String> {
        let result = self
            .get_result(&format!("/tracks/{track_id}/similar"))
            .await?;
        let items = result
            .get("similarTracks")
            .and_then(|v| v.as_array())
            .cloned()
            .unwrap_or_default();
        Ok(items
            .into_iter()
            .filter_map(|raw| serde_json::from_value::<YTrack>(raw).ok())
            .map(|track| map_track(&track))
            .collect())
    }

    pub async fn track_info(&self, track_id: &str) -> Result<TrackInfoDto, String> {
        let result = self
            .get_result(&format!("/tracks?track-ids={track_id}"))
            .await?;
        let item = result
            .get(0)
            .cloned()
            .ok_or_else(|| "Трек не найден".to_string())?;

        let text = |value: Option<&serde_json::Value>| -> Option<String> {
            value
                .and_then(|v| v.as_str())
                .map(|s| s.trim().to_string())
                .filter(|s| !s.is_empty())
        };

        let names = |value: Option<&serde_json::Value>| -> Vec<String> {
            value
                .and_then(|v| v.as_array())
                .map(|arr| {
                    arr.iter()
                        .filter_map(|x| match x {
                            serde_json::Value::String(s) => Some(s.trim().to_string()),
                            other => other
                                .get("name")
                                .and_then(|n| n.as_str())
                                .map(|s| s.trim().to_string()),
                        })
                        .filter(|s| !s.is_empty())
                        .collect::<Vec<String>>()
                })
                .unwrap_or_default()
        };

        let split = |value: Option<String>| -> Vec<String> {
            value
                .map(|s| {
                    s.split(|c| c == ',' || c == ';')
                        .map(|p| p.trim().to_string())
                        .filter(|p| !p.is_empty())
                        .collect::<Vec<String>>()
                })
                .unwrap_or_default()
        };

        let meta = item.get("metaData");
        let album = item.get("albums").and_then(|a| a.get(0)).cloned();

        let mut release_date = text(item.get("releaseDate")).or_else(|| {
            album
                .as_ref()
                .and_then(|a| text(a.get("releaseDate")))
                .or_else(|| album.as_ref().and_then(|a| text(a.get("originalReleaseDate"))))
        });

        let mut source = major_name(item.get("major"))
            .or_else(|| major_name(album.as_ref().and_then(|a| a.get("major"))));

        let mut labels = names(item.get("labels"));
        if labels.is_empty() {
            labels = names(album.as_ref().and_then(|a| a.get("labels")));
        }
        if labels.is_empty() || release_date.is_none() || source.is_none() {
            let album_id = album
                .as_ref()
                .and_then(|a| a.get("id"))
                .and_then(|id| match id {
                    serde_json::Value::Number(n) => Some(n.to_string()),
                    serde_json::Value::String(s) => Some(s.clone()),
                    _ => None,
                });
            if let Some(album_id) = album_id {
                if let Ok(full) = self.get_result(&format!("/albums/{album_id}")).await {
                    if labels.is_empty() {
                        labels = names(full.get("labels"));
                    }
                    if release_date.is_none() {
                        release_date = text(full.get("releaseDate"))
                            .or_else(|| text(full.get("originalReleaseDate")));
                    }
                    if source.is_none() {
                        source = major_name(full.get("major"))
                            .or_else(|| distributor(full.get("labels")));
                    }
                }
            }
        }

        if source.is_none() {
            source = distributor(item.get("labels"))
                .or_else(|| distributor(album.as_ref().and_then(|a| a.get("labels"))));
        }

        Ok(TrackInfoDto {
            track_id: track_id.to_string(),
            title: text(item.get("title")).unwrap_or_default(),
            version: text(item.get("version")),
            label: if labels.is_empty() {
                None
            } else {
                Some(labels.join(", "))
            },
            source,
            artists: names(item.get("artists")),
            composers: split(text(meta.and_then(|m| m.get("composer")))),
            lyricists: split(text(meta.and_then(|m| m.get("lyricist")))),
            album: album
                .as_ref()
                .and_then(|a| text(a.get("title")))
                .or_else(|| text(meta.and_then(|m| m.get("album")))),
            year: album
                .as_ref()
                .and_then(|a| a.get("year"))
                .and_then(|y| y.as_i64()),
            release_date,
            genre: album.as_ref().and_then(|a| text(a.get("genre"))),
            duration_ms: item.get("durationMs").and_then(|d| d.as_i64()),
            explicit: text(item.get("contentWarning")).is_some(),
        })
    }

    pub async fn track(&self, track_id: &str) -> Result<TrackDto, String> {
        let result = self
            .get_result(&format!("/tracks?track-ids={track_id}"))
            .await?;
        let list: Vec<YTrack> = serde_json::from_value(result).map_err(|e| e.to_string())?;
        list.first()
            .map(map_track)
            .ok_or_else(|| "Трек не найден".to_string())
    }

    async fn trailer(&self, path: &str) -> Result<TrailerDto, String> {
        let result = match self.get_result(path).await {
            Ok(value) => value,
            Err(err) if err.contains("404") => return Err("Трейлер не найден".to_string()),
            Err(err) => return Err(err),
        };

        let title = result
            .get("trailer")
            .and_then(|trailer| trailer.get("title"))
            .and_then(|value| value.as_str())
            .or_else(|| result.get("title").and_then(|value| value.as_str()))
            .unwrap_or("Трейлер")
            .to_string();

        let mut tracks = Vec::new();
        if let Some(single) = result.get("track") {
            if let Ok(track) = serde_json::from_value::<YTrack>(single.clone()) {
                tracks.push(map_track(&track));
            }
        }
        if let Some(list) = result
            .get("trailer")
            .and_then(|trailer| trailer.get("tracks"))
            .and_then(|tracks| tracks.as_array())
        {
            for raw in list {
                if let Ok(track) = serde_json::from_value::<YTrack>(raw.clone()) {
                    tracks.push(map_track(&track));
                }
            }
        }

        if tracks.is_empty() {
            return Err("Трейлер не найден".to_string());
        }

        Ok(TrailerDto { title, tracks })
    }

    pub async fn track_trailer(&self, track_id: &str) -> Result<TrailerDto, String> {
        self.trailer(&format!("/tracks/{track_id}/trailer")).await
    }

    pub async fn album_trailer(&self, album_id: &str) -> Result<TrailerDto, String> {
        self.trailer(&format!("/albums/{album_id}/trailer")).await
    }

    pub async fn artist_trailer(&self, artist_id: &str) -> Result<TrailerDto, String> {
        self.trailer(&format!("/artists/{artist_id}/trailer")).await
    }

    pub async fn playlist_trailer(&self, uid: i64, kind: &str) -> Result<TrailerDto, String> {
        self.trailer(&format!("/users/{uid}/playlists/{kind}/trailer"))
            .await
    }


    pub async fn concert_locations(&self) -> Result<Vec<ConcertLocationDto>, String> {
        let res = self.get_json("/concerts/locations").await?;
        let mut list = Vec::new();
        let items = res
            .as_array()
            .or_else(|| res.get("locations").and_then(|l| l.as_array()));
        if let Some(arr) = items {
            for item in arr {
                let id = item.get("id").and_then(|v| v.as_i64()).unwrap_or(0);
                let name = item
                    .get("name")
                    .and_then(|v| v.as_str())
                    .unwrap_or_default()
                    .to_string();
                if id > 0 && !name.is_empty() {
                    list.push(ConcertLocationDto { id, name });
                }
            }
        }
        Ok(list)
    }

    pub async fn concerts_feed(
        &self,
        uid: i64,
        locations: Option<Vec<i64>>,
    ) -> Result<Vec<ConcertBriefDto>, String> {
        let mut all_concerts = Vec::new();

        // 1. Fetch from official /concerts/feed (with optional locations parameter)
        let feed_path = match &locations {
            Some(locs) if !locs.is_empty() => {
                let ids = locs
                    .iter()
                    .map(|id| id.to_string())
                    .collect::<Vec<_>>()
                    .join(",");
                format!("/concerts/feed?locations={ids}")
            }
            _ => "/concerts/feed".to_string(),
        };

        if let Ok(res) = self.get_json(&feed_path).await {
            if let Some(items) = res.get("items").and_then(|i| i.as_array()) {
                for item in items {
                    let c = item
                        .get("data")
                        .and_then(|d| d.get("concert"))
                        .unwrap_or(item);
                    let mut mapped = map_concert_brief(c);
                    if mapped.min_price.is_none() {
                        if let Some(mp) = item.get("data").and_then(|d| d.get("minPrice")) {
                            mapped.min_price = map_concert_min_price(Some(mp));
                        }
                    }
                    if !mapped.id.is_empty()
                        && !all_concerts
                            .iter()
                            .any(|existing: &ConcertBriefDto| existing.id == mapped.id)
                    {
                        all_concerts.push(mapped);
                    }
                }
            }
        }

        // 2. If no specific location filter was requested, merge with tour dates
        // of user's favorite artists + popular Russian touring artists to cover
        // all regions across Russia (Veliky Novgorod, Perm, Ekaterinburg, etc.)
        if locations.as_ref().map(|l| l.is_empty()).unwrap_or(true) {
            let mut artist_ids: Vec<String> = Vec::new();

            if uid > 0 {
                // Liked artists
                if let Ok(res) = self.get_result(&format!("/users/{uid}/likes/artists")).await {
                    let items = res
                        .as_array()
                        .or_else(|| res.get("artists").and_then(|a| a.as_array()));
                    if let Some(arr) = items {
                        for item in arr {
                            let id = item
                                .get("id")
                                .map(val_to_id)
                                .or_else(|| item.get("artist").and_then(|a| a.get("id")).map(val_to_id));
                            if let Some(id) = id {
                                if !id.is_empty() && !artist_ids.contains(&id) {
                                    artist_ids.push(id);
                                    if artist_ids.len() >= 18 {
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }

                // If not enough liked artists, supplement from liked tracks
                if artist_ids.len() < 12 {
                    if let Ok(tracks) = self.liked_tracks(uid).await {
                        for t in tracks {
                            for a in t.artists {
                                if !a.id.is_empty() && !artist_ids.contains(&a.id) {
                                    artist_ids.push(a.id);
                                    if artist_ids.len() >= 20 {
                                        break;
                                    }
                                }
                            }
                            if artist_ids.len() >= 20 {
                                break;
                            }
                        }
                    }
                }
            }

            // Popular touring artists in Russia (guarantees wide geographic coverage across Russian regions)
            let popular_tour_artists = [
                "41191",   // Баста
                "8095900", // Три дня дождя
                "5349983", // polnalyubvi
                "5007577", // Zivert
                "161247",  // Руки Вверх!
                "419284",  // Леонид Агутин
                "7578336", // MACAN
                "5851412", // Mary Gu
                "181977",  // Моя Мишель
                "4621184", // The Hatters
                "13575916",// ANNA ASTI
                "4899532", // GAYAZOV$ BROTHER$
                "257461",  // Хаски
                "2636411", // Dabro
                "3448404", // PHARAOH
                "4851214", // Miyagi & Эндшпиль
                "168661",  // КняZz / Король и Шут
                "3121",    // Земфира
                "11142",   // Би-2
            ];
            for pid in popular_tour_artists {
                let s = pid.to_string();
                if !artist_ids.contains(&s) {
                    artist_ids.push(s);
                }
            }

            let futures: Vec<_> = artist_ids
                .iter()
                .take(30)
                .map(|aid| self.artist_concerts(aid))
                .collect();

            let results = futures_util::future::join_all(futures).await;
            for c_list in results.into_iter().flatten() {
                for c in c_list {
                    if !all_concerts
                        .iter()
                        .any(|existing: &ConcertBriefDto| existing.id == c.id)
                    {
                        all_concerts.push(c);
                    }
                }
            }
        }

        all_concerts.sort_by(|a, b| {
            let da = a.datetime.as_deref().unwrap_or("");
            let db = b.datetime.as_deref().unwrap_or("");
            da.cmp(db)
        });

        Ok(all_concerts)
    }

    pub async fn artist_concerts(&self, artist_id: &str) -> Result<Vec<ConcertBriefDto>, String> {
        let result = self
            .get_json(&format!("/artists/{artist_id}/concerts"))
            .await?;
        let items = result
            .get("concerts")
            .and_then(|v| v.as_array())
            .cloned()
            .unwrap_or_default();
        let list = items.iter().map(map_concert_brief).collect();
        Ok(list)
    }

    pub async fn concert(
        &self,
        concert_id: &str,
        artist_id_hint: Option<&str>,
    ) -> Result<ConcertPageDto, String> {
        let base_res = self.get_json(&format!("/concerts/{concert_id}")).await.ok();
        let info_res = self.get_json(&format!("/concerts/{concert_id}/info")).await.ok();

        if base_res.is_none() && info_res.is_none() {
            return Err("Не удалось загрузить данные концерта".to_string());
        }

        let base = base_res.unwrap_or_default();
        let info = info_res.unwrap_or_default();
        let info_concert = info.get("concert").cloned().unwrap_or_default();

        let id = str_at(&base, &["id"])
            .or_else(|| str_at(&info_concert, &["id"]))
            .unwrap_or_else(|| concert_id.to_string());

        let title = str_at(&base, &["concertTitle"])
            .or_else(|| str_at(&info_concert, &["concertTitle"]))
            .or_else(|| str_at(&base, &["title"]))
            .unwrap_or_else(|| "Концерт".to_string());

        let city = str_at(&base, &["city"])
            .or_else(|| str_at(&info_concert, &["city"]));
        let place = str_at(&base, &["place"])
            .or_else(|| str_at(&info_concert, &["place"]));
        let address = str_at(&base, &["address"])
            .or_else(|| str_at(&info_concert, &["address"]));
        let datetime = str_at(&base, &["datetime"])
            .or_else(|| str_at(&info_concert, &["datetime"]));
        let content_rating = str_at(&base, &["contentRating"])
            .or_else(|| str_at(&info_concert, &["contentRating"]));
        let afisha_url = str_at(&base, &["afishaUrl"]);
        let data_session_id = str_at(&base, &["data-session-id"])
            .or_else(|| str_at(&base, &["dataSessionId"]))
            .or_else(|| str_at(&info_concert, &["dataSessionId"]));

        let mut image_url = str_at(&base, &["imageUrl"]).or_else(|| {
            base.get("images")
                .and_then(|a| a.as_array())
                .and_then(|arr| arr.first())
                .and_then(|s| s.as_str())
                .map(|s| s.to_string())
        });

        let cover_uri = str_at(&info_concert, &["cover", "uri"]);
        if image_url.is_none() {
            image_url = img(cover_uri.as_deref(), "1000x1000");
        }

        let color = str_at(&info_concert, &["cover", "color"])
            .or_else(|| str_at(&info_concert, &["cover", "derivedColors", "average"]));

        let mut covers = Vec::new();
        if let Some(arr) = info.get("covers").and_then(|c| c.as_array()) {
            for c in arr {
                if let Some(u) = str_at(c, &["uri"]) {
                    if let Some(formatted) = img(Some(&u), "1000x1000") {
                        if !covers.contains(&formatted) {
                            covers.push(formatted);
                        }
                    }
                }
            }
        }
        if let Some(arr) = base.get("images").and_then(|a| a.as_array()) {
            for s in arr {
                if let Some(u) = s.as_str() {
                    let formatted = u.to_string();
                    if !covers.contains(&formatted) {
                        covers.push(formatted);
                    }
                }
            }
        }
        if let Some(ref main) = image_url {
            if !covers.contains(main) {
                covers.insert(0, main.clone());
            }
        }

        let description = str_at(&info, &["description", "text"]);
        let description_source = str_at(&info, &["description", "source"]);

        let min_price = map_concert_min_price(base.get("minPrice"))
            .or_else(|| map_concert_min_price(info.get("minPrice")));

        let metro_stations: Vec<MetroStationDto> = base
            .get("metro-stations")
            .and_then(|m| m.as_array())
            .map(|arr| {
                arr.iter()
                    .filter_map(|raw| {
                        let title = raw.get("title").and_then(|v| v.as_str())?.to_string();
                        let line_color = raw
                            .get("line-color")
                            .and_then(|v| v.as_str())
                            .map(|s| s.to_string());
                        Some(MetroStationDto { title, line_color })
                    })
                    .collect()
            })
            .unwrap_or_default();

        let map_image_url = str_at(&base, &["map"]).map(|u| u.replace("%%", "700,320"));
        let map_url = str_at(&base, &["mapUrl"]);

        let venue = if place.is_some() || address.is_some() || map_url.is_some() {
            Some(ConcertPlaceDto {
                place: place.clone(),
                city: city.clone(),
                address: address.clone(),
                metro_stations,
                map_image_url,
                map_url,
            })
        } else {
            None
        };

        // Resolve artist_id
        let mut artist_id = artist_id_hint.map(|s| s.to_string());
        if artist_id.is_none() {
            if let Ok(sk) = self
                .get_json(&format!("/concerts/{concert_id}/skeletons/concert_page"))
                .await
            {
                if let Some(blocks) = sk
                    .get("blocks")
                    .and_then(|b| b.as_array())
                    .and_then(|arr| arr.first())
                    .and_then(|b| b.get("data"))
                    .and_then(|d| d.get("tabs"))
                    .and_then(|t| t.as_array())
                    .and_then(|tabs| tabs.first())
                    .and_then(|tab| tab.get("blocks"))
                    .and_then(|b| b.as_array())
                {
                    for blk in blocks {
                        if let Some(uri) = str_at(blk, &["data", "source", "uri"]) {
                            if uri.contains("/artists/") {
                                let parts: Vec<&str> = uri.split('/').collect();
                                for (i, part) in parts.iter().enumerate() {
                                    if *part == "artists" && i + 1 < parts.len() {
                                        let cand = parts[i + 1];
                                        if cand.chars().all(|c| c.is_ascii_digit()) && !cand.is_empty() {
                                            artist_id = Some(cand.to_string());
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                        if artist_id.is_some() {
                            break;
                        }
                    }
                }
            }
        }

        if artist_id.is_none() && !title.is_empty() {
            if let Ok(sr) = self.search(&title).await {
                if let Some(first_artist) = sr.artists.first() {
                    let title_lower = title.to_lowercase();
                    let name_lower = first_artist.name.to_lowercase();
                    if title_lower.contains(&name_lower) || name_lower.contains(&title_lower) {
                        artist_id = Some(first_artist.id.clone());
                    }
                }
            }
        }

        let mut artist_name = None;
        let mut artist_cover_url = None;
        let mut artist_tracks = Vec::new();
        let mut artist_concerts = Vec::new();

        if let Some(ref aid) = artist_id {
            if let Ok(artist_page) = self.artist(aid).await {
                artist_name = Some(artist_page.name);
                artist_cover_url = artist_page.cover_url;
                artist_tracks = artist_page.tracks.into_iter().take(10).collect();
            }

            if let Ok(all_c) = self.artist_concerts(aid).await {
                artist_concerts = all_c.into_iter().filter(|c| c.id != id).collect();
            }
        }

        Ok(ConcertPageDto {
            id,
            title,
            artist_id,
            artist_name,
            artist_cover_url,
            city,
            place,
            address,
            datetime,
            content_rating,
            image_url,
            afisha_url,
            data_session_id,
            color,
            covers,
            description,
            description_source,
            min_price,
            venue,
            artist_tracks,
            artist_concerts,
        })
    }

}

fn major_name(value: Option<&serde_json::Value>) -> Option<String> {
    let raw = value
        .and_then(|m| m.get("name"))
        .and_then(|v| v.as_str())
        .map(|s| s.trim())
        .filter(|s| !s.is_empty())?;

    let upper = raw.to_uppercase();
    if matches!(
        upper.as_str(),
        "UNKNOWN" | "NO_MAJOR" | "NOMAJOR" | "NONE" | "OTHER" | "-"
    ) {
        return None;
    }

    let pretty = match upper.as_str() {
        "WARNER" => "Warner Music",
        "UNIVERSAL" => "Universal Music",
        "SONY" => "Sony Music",
        "BELIEVE" => "Believe",
        "MERLIN" => "Merlin",
        "ORCHARD" => "The Orchard",
        "FRESHTUNES" => "FreshTunes",
        "DISTROKID" => "DistroKid",
        "NATIONAL" => "Национальное музыкальное издательство",
        _ => raw,
    };
    Some(pretty.to_string())
}

fn distributor(value: Option<&serde_json::Value>) -> Option<String> {
    let items = value.and_then(|v| v.as_array())?;
    let names: Vec<String> = items
        .iter()
        .filter(|item| {
            item.get("type")
                .and_then(|t| t.as_str())
                .map(|t| t.eq_ignore_ascii_case("distributor"))
                .unwrap_or(false)
        })
        .filter_map(|item| item.get("name").and_then(|n| n.as_str()))
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
        .collect();

    if names.is_empty() {
        None
    } else {
        Some(names.join(", "))
    }
}

fn map_concert_min_price(val: Option<&serde_json::Value>) -> Option<ConcertMinPriceDto> {
    let obj = val?;
    let value = obj.get("value").and_then(|v| v.as_i64());
    let currency = obj
        .get("currency")
        .and_then(|v| v.as_str())
        .map(|s| s.to_string());
    let currency_symbol = obj
        .get("currencySymbol")
        .and_then(|v| v.as_str())
        .map(|s| s.to_string());
    if value.is_none() && currency.is_none() {
        return None;
    }
    Some(ConcertMinPriceDto {
        value,
        currency,
        currency_symbol,
    })
}

fn map_concert_brief(v: &serde_json::Value) -> ConcertBriefDto {
    let id = str_at(v, &["id"]).unwrap_or_default();
    let title = str_at(v, &["concertTitle"])
        .or_else(|| str_at(v, &["title"]))
        .unwrap_or_default();
    let city = str_at(v, &["city"]);
    let place = str_at(v, &["place"]);
    let address = str_at(v, &["address"]);
    let datetime = str_at(v, &["datetime"]);
    let content_rating = str_at(v, &["contentRating"]);
    let image_url = str_at(v, &["imageUrl"])
        .or_else(|| {
            v.get("images")
                .and_then(|a| a.as_array())
                .and_then(|arr| arr.first())
                .and_then(|s| s.as_str())
                .map(|s| s.to_string())
        })
        .or_else(|| {
            let uri = str_at(v, &["cover", "uri"]);
            img(uri.as_deref(), "600x600")
        });
    let afisha_url = str_at(v, &["afishaUrl"]);
    let data_session_id = str_at(v, &["data-session-id"])
        .or_else(|| str_at(v, &["dataSessionId"]));
    let min_price = map_concert_min_price(v.get("minPrice"));
    let event_type = str_at(v, &["eventInfo", "type"]);

    ConcertBriefDto {
        id,
        title,
        city,
        place,
        address,
        datetime,
        content_rating,
        image_url,
        afisha_url,
        data_session_id,
        min_price,
        event_type,
    }
}
