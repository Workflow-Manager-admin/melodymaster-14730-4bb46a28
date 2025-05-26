import React, { useRef, useState, useEffect } from "react";

// PUBLIC_INTERFACE
/**
 * MelodyMaster MainContainer - Car Stereo Look
 * Enhanced: Tracklist with mock album art, wide retro car stereo theme, animated visualizer when playing.
 */

/**
 * Demo music files and album art.
 */
const TESTED_MP3 = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

// All tracks must have art. Art here uses illustrative mock album covers (unsplash, imgur, placeholder.com)
const defaultTracks = [
  {
    title: "Sample Track (Add your own music!)",
    artist: "MelodyMaster",
    album: "Demo Album",
    art: "https://i.imgur.com/IJQZRlm.png",
    src: TESTED_MP3,
    duration: 347,
  },
  {
    title: "Time Machine Groove",
    artist: "RetroWave",
    album: "Neon Nights",
    art: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80",
    src: "https://cdn.pixabay.com/audio/2022/10/16/audio_12c716b9ba.mp3",
    duration: 201,
  },
  {
    title: "Dashboard Dreams",
    artist: "Synth Escape",
    album: "Cruisin'",
    art: "https://placehold.co/120x120/orange/FFFFFF.png?text=Synth+Wave",
    src: "https://cdn.pixabay.com/audio/2023/05/30/audio_1418e61dbb.mp3",
    duration: 248,
  },
  {
    title: "FM Memories",
    artist: "Night Drive",
    album: "Afterglow",
    art: "https://i.imgur.com/9e3ldwV.png",
    src: "https://cdn.pixabay.com/audio/2023/04/24/audio_146a14c1ce.mp3",
    duration: 176,
  },
];

const fallbackTrack = {
  title: "Sample Track (Add your own music!)",
  artist: "MelodyMaster",
  album: "Demo Album",
  art: "https://i.imgur.com/IJQZRlm.png",
  src: TESTED_MP3,
  duration: 347,
};

const stereoTheme = {
  primary: "#1DB954",
  secondary: "#191414",
  accent: "#FFFFFF",
  background: "#282B28",
  digital: "#EFEA91",
  chrome: "#B4B4B4"
};

function formatTime(secs) {
  if (isNaN(secs)) return "--:--";
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function getNextTrackIdx(idx, dir, length) {
  let next = idx + dir;
  if (next < 0) return length - 1;
  if (next >= length) return 0;
  return next;
}

function canPlayAudioSrc(src) {
  if (!src) return false;
  const testAudio = document.createElement('audio');
  const ext = src.split(".").pop().toLowerCase();
  if (ext === "mp3") return !!testAudio.canPlayType("audio/mpeg");
  if (ext === "wav") return !!testAudio.canPlayType("audio/wav");
  if (ext === "ogg") return !!testAudio.canPlayType("audio/ogg");
  // fallback guess
  return true;
}

/**
 * Simple animated visualizer: 7 bars that animate heights when playing
 */
function Visualizer({ active }) {
  // Array of time-varying values so animation looks dynamic, but random per tick.
  const [levels, setLevels] = useState([0, 0, 0, 0, 0, 0, 0]);
  useEffect(() => {
    let anim;
    if (active) {
      anim = setInterval(() => {
        // Each bar gets a different random height, cycling so it waves
        setLevels(lvls =>
          lvls.map((l, idx) =>
            Math.max(30, Math.floor(25 + 38 * Math.abs(Math.sin(Date.now()/210 + idx*1.8 + Math.random()*0.45))) +
              Math.floor(Math.random() * 5)
            )
          )
        );
      }, 125);
    } else {
      setLevels([8, 11, 16, 22, 17, 12, 9]);
    }
    return () => anim && clearInterval(anim);
  }, [active]);
  return (
    <div className="visualizer-bars">
      {levels.map((lvl, idx) => (
        <div
          key={idx}
          className="visualizer-bar"
          style={{
            height: `${active ? lvl : 10 + (idx * 5)}px`,
            transition: "height 0.16s cubic-bezier(.48,.39,.1,1.2)",
            background: active
              ? `linear-gradient(180deg, #fff, ${stereoTheme.primary} 55%, #095529)`
              : "linear-gradient(180deg, #b6e9c7, #5de16d 60%, #96bfb1)",
            opacity: active ? 0.93 : 0.45,
            filter: active
              ? "drop-shadow(0 0 4px #1DB95433)"
              : "blur(1px)",
          }}
        />
      ))}
      <style>
        {`
        .visualizer-bars {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          height: 52px;
          width: 133px;
          margin: 9px auto 0 5px;
          gap: 7px;
        }
        .visualizer-bar {
          width: 11px;
          min-width: 8px;
          border-radius: 4px 4px 2px 2px;
          background: linear-gradient(180deg, #fff, #1DB954 70%, #095529);
          box-shadow: 0 4px 7px #171f18aa;
        }
        `}
      </style>
    </div>
  );
}

/**
 * Allows user to upload MP3 files, appends to track list, and enables playback.
 * 
 * Handles .mp3-only enforcement and file validation.
 */
function MainContainer() {
  // No Now Playing button present; any Now Playing related rendering or handlers have been removed.
  const [currentIdx, setCurrentIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audioError, setAudioError] = useState("");
  const [fileError, setFileError] = useState(""); // UI for upload errors
  const [userTracks, setUserTracks] = useState([]); // Uploaded tracks: {title, src, art, ...}

  const audioRef = useRef(null);
  const progressRef = useRef(null);
  const fileInputRef = useRef();

  // Merge uploaded tracks with default
  const allTracks = [...defaultTracks, ...userTracks];

  // Only tracks with supported source, fallback guarantee
  const availableTracks = allTracks.filter(t => canPlayAudioSrc(t.src));
  const hasValidTracks = availableTracks.length > 0;
  const currentTrack = hasValidTracks ? availableTracks[currentIdx % availableTracks.length] : fallbackTrack;
  const cannotPlayAny = !canPlayAudioSrc(currentTrack.src);

  // Attempt to get duration for uploaded audio (best effort for local files)
  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    const setFakeDurationIfMissing = () => {
      if (
        userTracks.length > 0 &&
        currentTrack.src &&
        currentTrack.duration == null &&
        !isNaN(audio.duration) &&
        isFinite(audio.duration)
      ) {
        setUserTracks((prev) =>
          prev.map(ut =>
            ut.src === currentTrack.src && (ut.duration == null)
              ? { ...ut, duration: Math.round(audio.duration) }
              : ut
          )
        );
      }
    };
    audio.addEventListener("loadedmetadata", setFakeDurationIfMissing);
    return () => audio.removeEventListener("loadedmetadata", setFakeDurationIfMissing);
    // eslint-disable-next-line
  }, [currentTrack.src, userTracks.length]);

  useEffect(() => {
    if (!audioRef.current) return;
    const handleAudioError = () => {
      setAudioError(
        "Audio format/source not supported or not reachable. Try another track or check connection."
      );
      setPlaying(false);
    };
    audioRef.current.addEventListener("error", handleAudioError);
    return () => {
      audioRef.current && audioRef.current.removeEventListener("error", handleAudioError);
    };
  }, [currentTrack.src]);

  useEffect(() => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.play().catch(() => setPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [playing, currentIdx]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const update = () => setProgress(audio.currentTime);
    audio.addEventListener("timeupdate", update);
    audio.addEventListener("ended", handleTrackEnd);
    return () => {
      audio.removeEventListener("timeupdate", update);
      audio.removeEventListener("ended", handleTrackEnd);
    };
  }, [currentIdx]);

  const handleTrackClick = (idx) => {
    setCurrentIdx(idx);
    setProgress(0);
    setPlaying(true);
  };
  const handlePlayPause = () => setPlaying((p) => !p);

  const handleNext = () => {
    setProgress(0);
    setCurrentIdx((idx) => getNextTrackIdx(idx, 1, availableTracks.length));
    setPlaying(true);
  };
  const handlePrev = () => {
    setProgress(0);
    setCurrentIdx((idx) => getNextTrackIdx(idx, -1, availableTracks.length));
    setPlaying(true);
  };
  const handleBarChange = (e) => {
    const val = Number(e.target.value);
    setProgress(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };
  function handleTrackEnd() {
    handleNext();
  }

  function handleFileChange(e) {
    setFileError(""); // Reset UI error
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const mp3Files = files.filter(
      f =>
        f.type === "audio/mpeg" ||
        (f.name && f.name.toLowerCase().endsWith(".mp3"))
    );

    const rejected = files.length !== mp3Files.length;

    if (!mp3Files.length) {
      setFileError("Please upload only .mp3 audio files.");
      fileInputRef.current.value = ""; // reset for re-upload
      return;
    }

    if (rejected) {
      setFileError("Some selected files were not .mp3 and were ignored.");
    }

    const newTracks = mp3Files.map((file, idx) => {
      const mockArts = [
        "https://placehold.co/120x120/2ecc40/ffffff.png?text=Your+Song",
        "https://placehold.co/120x120/ff8b4d/fff.png?text=MP3",
        "https://placehold.co/120x120/8888FF/fff.png?text=Music",
        "https://placehold.co/120x120/E87A41/fff.png?text=Upload",
      ];
      const name = file.name.replace(/\.mp3$/i, "");
      return {
        title: name,
        artist: "You",
        album: "Uploaded",
        art: mockArts[(userTracks.length + idx) % mockArts.length],
        src: URL.createObjectURL(file),
        duration: null,
        isUploaded: true,
      };
    });

    setUserTracks(prev => {
      const prevSources = prev.map(t => t.src);
      const uniqueNew = newTracks.filter(t => !prevSources.includes(t.src));
      return [...prev, ...uniqueNew];
    });
    setCurrentIdx(availableTracks.length + newTracks.length - 1);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: stereoTheme.secondary,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Orbitron', 'Inter', monospace",
      }}
    >
      {/* ========== MP3 FILE INPUT UI ========== */}
      <div style={{
          width: "100%", maxWidth: 825, marginBottom: 7, display: "flex", flexDirection: "row",
          alignItems: "center", gap: "18px", justifyContent: "flex-end", marginTop: 4
        }}
      >
        <label htmlFor="mp3-upload" style={{
          fontFamily: "'Inter','monospace'",
          fontWeight: 600, fontSize: "1.03em", color: "#1DB954", marginRight: 7,
        }}>
          Add your MP3:
        </label>
        <input
          ref={fileInputRef}
          type="file"
          id="mp3-upload"
          accept=".mp3,audio/mpeg"
          onChange={handleFileChange}
          multiple
          style={{
            padding: "6px 6px", borderRadius: "6px", background: "#212721", color: "#fff", border: "1px solid #444",
          }}
          aria-label="Upload mp3 file"
        />
      </div>
      {fileError && (
        <div style={{
            color: "#b9374b", background: "#211116e0", padding: "5px 13px", borderRadius: 7, fontFamily: "Inter, monospace",
            fontWeight: 500, marginBottom: 9, maxWidth: 420, textAlign: "center"
          }}>
          {fileError}
        </div>
      )}

      {( !hasValidTracks || cannotPlayAny ) && (
        <div style={{
          color: "#ff5252",
          background: "#210f0fcd",
          border: "2px solid #b81e1e",
          borderRadius: "15px",
          padding: "22px 30px",
          maxWidth: 460,
          fontFamily: "Inter, Arial, sans-serif",
          marginBottom: 32,
          textAlign: "center",
          marginTop: 32
        }}>
          <h2 style={{ margin: "0 0 8px 0" }}>No supported audio sources found!</h2>
          <div>
            {audioError ? (
              <span>{audioError}</span>
            ) : (
              <span>
                <b>How to fix:</b> Add one or more working music files with <b>art</b> (mp3, wav, etc) to the <code>audioTracks</code> array<br />
                in <code>MainContainer.js</code>. Example fallback used:
                <code>{TESTED_MP3}</code>
                <br /><br />
                Or check your internet connection/network.<br /><br />
                <b>Developer note:</b> The player always falls back to a tested MP3 if none of your tracks are playable.
              </span>
            )}
          </div>
        </div>
      )}

      <div className="wide-stereo-shell" style={(!hasValidTracks || cannotPlayAny) ? { opacity: 0.45, pointerEvents: 'none' } : {}}>
        {/* Chrome and retro corner screws */}
        <div className="chrome-decoration">
          <span className="chrome-screw chrome-screw-1"></span>
          <span className="chrome-screw chrome-screw-2"></span>
          <span className="chrome-screw chrome-screw-3"></span>
          <span className="chrome-screw chrome-screw-4"></span>
        </div>
        {/* Top info bar: Brand + Lights */}
        <div className="stereo-header-wide">
          <div className="stereo-brand-wide">MelodyMaster</div>
          <div className="stereo-lights-wide">
            <span className={`stereo-light-wide ${playing ? "on" : ""}`}></span>
            <span className={`stereo-light-wide ${playing ? "on" : ""}`}></span>
          </div>
        </div>

        <div className="stereo-flex">
          {/* Current Album Art Area */}
          <div className="current-albumart-wrap">
            <div className="current-albumart-glow" />
            <img
              src={currentTrack.art}
              alt="Album Art"
              className={`album-art-img ${playing ? "playing" : ""}`}
            />
            <div className={playing ? "spinning-vinyl vinyl-on" : "spinning-vinyl"} />
          </div>
          {/* Center block: digital, controls, visualizer */}
          <div className="stereo-mainstack">
            <div className="digital-display-wide retro-screen-wide">
              <span className="display-track">{currentTrack.title}</span>
              <span className="display-artist">{currentTrack.artist}</span>
              <span className="display-album">{currentTrack.album}</span>
              <span className="display-duration">
                ⏱️ {formatTime(progress)} / {formatTime(currentTrack.duration)}
              </span>
            </div>
            <div className="progress-bar-row-wide">
              <input
                type="range"
                min="0"
                max={currentTrack.duration}
                step="1"
                value={progress}
                ref={progressRef}
                onChange={handleBarChange}
                style={{
                  width: "100%",
                  accentColor: stereoTheme.primary,
                  background: "linear-gradient(90deg, #22cf71, #056634 95%)",
                }}
                className="progressbar"
                aria-label="Seek position"
              />
            </div>
            {/* --- Animated visualizer below controls --- */}
            <Visualizer active={playing} />
            {/* Controls */}
            <div
              className="stereo-controls-wide"
              style={{
                display: "flex",
                justifyContent: "center", // center the group as a whole
                alignItems: "center",
                gap: "38px", // more evident gap for even spacing
                width: "100%",
              }}
            >
              <button
                className="control-btn-wide btn-prev"
                onClick={handlePrev}
                aria-label="Previous track"
                style={{
                  flex: "0 1 60px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <span className="btn-knob-wide">&#9198;</span>
              </button>
              <button
                className="control-btn-wide btn-playpause"
                onClick={handlePlayPause}
                aria-label={playing ? "Pause" : "Play"}
                style={{
                  flex: "0 1 65px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <span className="btn-knob-wide">
                  {playing ? <span>&#10073;&#10073;</span> : <span>&#9654;</span>}
                </span>
              </button>
              <button
                className="control-btn-wide btn-next"
                onClick={handleNext}
                aria-label="Next track"
                style={{
                  flex: "0 1 60px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <span className="btn-knob-wide">&#9197;</span>
              </button>
            </div>
          </div>
          {/* Track List: thumb+meta */}
          <div className="tracklist-stack">
            <div className="tracklist-label-wide">TRACKLIST</div>
            <ul className="tracklist-ul-wide">
              {(hasValidTracks ? availableTracks : [fallbackTrack]).map((track, idx) => (
                <li
                  key={`${track.title}-${track.artist}-${track.src}`}
                  className={idx === currentIdx ? "selected-wide" : ""}
                  onClick={() => handleTrackClick(idx)}
                  style={idx === currentIdx ? { fontWeight: 700, textShadow: "0 0 6px #1DB95490" } : undefined}
                >
                  <img
                    src={track.art}
                    alt="track art"
                    className="tracklist-thumb"
                    style={{
                      border: idx === currentIdx ? `2.5px solid ${stereoTheme.primary}` : "2px solid #313",
                      boxShadow: idx === currentIdx ? "0 1px 9px #4fdc7e44" : "0px 1px 3.5px #2229"
                    }}
                  />
                  <div className="track-meta">
                    <div className="track-title" title={track.title}>
                      {track.title}
                    </div>
                    <div className="track-artist">
                      {track.artist}
                      {track.isUploaded && <span style={{
                          color: "#9aef67",
                          marginLeft: 5,
                          fontWeight: 500,
                          fontSize: "0.86em"}}>(Uploaded)</span>}
                    </div>
                  </div>
                  <span className="tracklist-dur">{formatTime(track.duration)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Hidden audio element */}
        <audio
          ref={audioRef}
          src={currentTrack && currentTrack.src ? currentTrack.src : ""}
          preload="auto"
          style={{ display: "none" }}
          tabIndex={-1}
          /* Controls would be provided by UI, not native audio. */
        />
      </div>

      {/* Fonts and main styles */}
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700&display=swap');`}
      </style>
      <style>
        {`
          /* Wide car stereo look */
          .wide-stereo-shell {
            background: linear-gradient(150deg, #262629 50%, #1b1d18 100%);
            border-radius: 38px;
            box-shadow:
              0 9px 75px #171c2c88,
              0 0 0 13px #242425,
              0 0 0 21px #65666888,
              0 0 0 30px #191b1992 inset;
            border: 6px solid #111;
            min-width: 612px;
            max-width: 860px;
            min-height: 282px;
            margin: 54px 0 40px 0;
            padding: 26px 38px 30px 38px;
            position: relative;
            z-index: 2;
            display: flex;
            flex-direction: column;
            align-items: stretch;
          }
          .chrome-decoration {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            z-index: 5;
            pointer-events: none;
          }
          .chrome-screw {
            position: absolute;
            width: 16px; height: 16px;
            background: radial-gradient(circle, #d5d8d7 60%, #595d69 100%);
            border-radius: 100%;
            box-shadow: 0 1.5px 7px #b4b4b465, 0 0.5px 1.5px #2228;
            border: 1.5px solid #a7b5b8;
            z-index: 9;
          }
          .chrome-screw-1 { left: 11px; top: 9px;}
          .chrome-screw-2 { right: 11px; top: 9px;}
          .chrome-screw-3 { left: 11px; bottom: 15px;}
          .chrome-screw-4 { right: 11px; bottom: 15px;}
          .stereo-header-wide {
            display: flex; align-items: center; justify-content: space-between;
            margin-bottom: 15px;
            margin-left: 14px;
            margin-right: 14px;
          }
          .stereo-brand-wide {
            font-family: 'Orbitron', monospace;
            font-weight: 700;
            font-size: 2.2rem;
            color: ${stereoTheme.primary};
            letter-spacing: 0.13em;
            text-shadow: 0px 2px 10px #000, 0 0 13px ${stereoTheme.primary}77;
            filter: brightness(1.22) drop-shadow(0 0 1.5px #fff6);
          }
          .stereo-lights-wide {
            display: flex; gap:8px;
          }
          .stereo-light-wide {
            display: inline-block;
            width: 15px; height: 15px;
            border-radius: 50%;
            background: #393e39;
            border: 2.5px solid #181b12;
            box-shadow: 0 1px 3px #000a;
            transition: background 120ms;
          }
          .stereo-light-wide.on {
            background: ${stereoTheme.primary};
            box-shadow: 0 0 12px ${stereoTheme.primary}, 0 1px 3px #000;
          }
          .stereo-flex {
            display: flex;
            flex-direction: row;
            gap: 36px;
            justify-content: space-between;
            align-items: flex-start;
            width: 100%;
          }
          .current-albumart-wrap {
            margin-top: 2px;
            width: 137px;
            height: 137px;
            border-radius: 17px;
            border: 4px solid #393e35;
            background: linear-gradient(120deg, #112, #242727 99%);
            box-shadow: 0 2px 22px #71985e26, 0 0.5px 6.5px #282a269b;
            position: relative;
            z-index: 2;
            display: flex; align-items: center; justify-content: center;
            overflow: visible;
          }
          .current-albumart-glow {
            position: absolute; z-index: 2;
            top: 5px; left: 10px; right: 10px; bottom: 5px;
            border-radius: 13px;
            box-shadow: 0 0 38px 17px #60da8a39, 0 0 15px 4px #0008;
            pointer-events: none;
            background: transparent;
            opacity: 0.34;
          }
          .album-art-img {
            width: 116px; height: 116px;
            object-fit: cover;
            border-radius: 13px;
            position: relative;
            box-shadow: 0 3px 18px #132b17a5, 0 0.5px 2.9px #334833;
            border: 1.5px solid #a1a7a7;
            z-index: 5;
            will-change: filter, transform;
            transition: filter .45s, box-shadow .45s, border-color .22s;
          }
          .album-art-img.playing {
            filter: brightness(1.13) drop-shadow(0 0 14px #4bac6c25);
            border-color: ${stereoTheme.primary};
            box-shadow: 0 7px 38px #1DB95444;
          }
          .spinning-vinyl {
            position: absolute;
            left: 50%; top: 50%;
            width: 116px; height: 116px;
            transform: translate(-50%, -50%);
            border-radius: 100%;
            box-shadow: 0 0 13px #146A4C55 inset, 0 0 22px #000 inset;
            border: 3px dashed #eee4;
            pointer-events: none;
            opacity: 0.15;
            z-index: 4;
            transition: opacity 0.6s;
            mix-blend-mode: multiply;
          }
          .spinning-vinyl.vinyl-on {
            opacity: 0.26;
            animation: spinning 2.2s linear infinite;
          }

          .stereo-mainstack {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            flex: 3 3 295px;
            min-width: 240px;
            margin-top: 7px;
          }
          .digital-display-wide {
            background: repeating-linear-gradient(135deg, #275c27, #122212 4px, #274327 8px, #2d4627 13px);
            color: ${stereoTheme.digital};
            border-radius: 10px;
            font-family: 'Orbitron', monospace;
            font-size: 1.09rem;
            font-weight: bold;
            padding: 15px 17px;
            min-width: 173px;
            margin-bottom: 8px;
            box-shadow: 0 1.5px 10px #000c;
            border: 2px solid #3ca671;
            text-align: left;
            display: flex;
            flex-direction: column;
            gap: 2.5px;
            letter-spacing: 0.045em;
          }
          .retro-screen-wide span {
            display: block;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
          .display-track {
            font-size: 1.15rem;
            color: ${stereoTheme.primary};
          }
          .display-artist {
            font-size: 1.03rem;
            font-weight: 400;
            color: #eee;
          }
          .display-album {
            font-size: 0.98rem; color: #ecec86;
            font-style: italic;
          }
          .display-duration {
            margin-left: 2.8px;
            margin-top: 5px;
            color: ${stereoTheme.digital};
            font-size: 1.01rem;
            letter-spacing: 0.045em;
          }

          .progress-bar-row-wide {
            width: 100%;
            margin: 1.2em 0 0.33em 0.2em;
            display: flex;
            align-items: center;
          }

          /* Controls - wide, chrome effect */
          .stereo-controls-wide {
            margin-top: 11px;
            padding: 11px 25px 8px 25px;
            background: linear-gradient(90deg, #363636 65%, #212c26 120%);
            border-radius: 18px 18px 30px 30px;
            border: 3px solid #353822;
            display: flex;
            justify-content: center; /* centers all controls horizontally */
            align-items: center;
            gap: 38px; /* larger, even spacing */
            min-width: 294px;
            max-width: 360px;
            width: 100%;
            box-shadow: 0 1.7px 20px #0008 inset, 0 1.3px 14px #2227;
          }
          .control-btn-wide {
            background: radial-gradient(circle, #272827 55%, #3a3a40 100%);
            border: 3.5px solid #aaa8a8;
            width: 50px; height: 50px;
            border-radius: 50%;
            box-shadow: 0 1.3px 6.7px #3333;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer;
            margin: 0;
            transition: box-shadow 0.14s, background 0.14s, border 0.14s;
            font-size: 1.29rem;
            color: ${stereoTheme.digital};
            position: relative;
          }
          .control-btn-wide:active {
            box-shadow: 0 1px 13px #1db95444 inset;
            background: ${stereoTheme.primary}22;
            color: ${stereoTheme.primary};
            border-color: ${stereoTheme.primary};
          }
          .btn-knob-wide {
            font-size: 1.23em;
            filter: drop-shadow(1px 2px 0 #fff1);
            padding-bottom: 3px;
          }
          .btn-playpause {
            border: 3.5px solid ${stereoTheme.primary};
            color: ${stereoTheme.primary};
            background: radial-gradient(circle, #232723 55%, ${stereoTheme.primary}20 100%);
            width: 61px; height: 61px;
          }

          /* Visualizer is styled inline in Visualizer component */

          /* Tracklist wide */
          .tracklist-stack {
            flex: 1 1 194px;
            min-width: 178px;
            max-width: 233px;
            margin-left: 6px;
            margin-top: 1px;
            background: linear-gradient(99deg, #171c19 65%, #262828 100%);
            border-radius: 15px;
            border: 2.5px solid #393822;
            box-shadow: 0 1.5px 11px #212a1a42;
            padding: 11px 7px 11px 7px;
            z-index: 1;
            display: flex;
            flex-direction: column;
          }
          .tracklist-label-wide {
            font-size: 0.93rem;
            letter-spacing: 0.11em;
            font-weight: 650;
            color: ${stereoTheme.primary};
            margin-bottom: 11px;
            margin-left: 5px;
          }
          .tracklist-ul-wide {
            list-style: none;
            margin: 0; padding: 0;
            display: flex; flex-direction: column; gap: 1.5px;
            width: 99%;
          }
          .tracklist-ul-wide li {
            display: flex;
            align-items: center;
            min-height: 45px;
            gap: 8px;
            color: ${stereoTheme.accent};
            padding: 5.5px 0 5.5px 5px;
            border-radius: 7px;
            cursor: pointer;
            font-size: 1.02rem;
            transition: background 0.13s, color 0.11s;
            border: 1.6px solid transparent;
            position: relative;
          }
          .tracklist-ul-wide li.selected-wide {
            background: ${stereoTheme.primary}22;
            color: ${stereoTheme.primary};
            font-weight: 700;
            border: 1.6px solid ${stereoTheme.primary};
          }
          .tracklist-ul-wide li:hover:not(.selected-wide) {
            background: #181f18;
          }
          .tracklist-thumb {
            width: 36px; height: 36px;
            border-radius: 8px;
            object-fit: cover;
            margin-right: 6px;
            margin-left: 2px;
            background: #2d2f34;
            box-shadow: 0 1px 7px #2adba633;
          }
          .track-meta {
            flex: 3 3 120px;
            line-height: 1.19;
            display: flex;
            flex-direction: column;
            gap: 0.5px;
          }
          .track-title {
            font-size: 1.01rem;
            font-weight: 680;
            color: #fff;
          }
          .selected-wide .track-title { color: ${stereoTheme.primary}; }
          .track-artist {
            font-size: 0.89rem;
            color: #b7f39d;
            font-weight: 500;
          }
          .tracklist-dur {
            min-width: 42px;
            text-align: right;
            font-size: 0.89rem;
            margin-left: auto;
            color: #c4eacf;
            font-family: 'Orbitron', monospace;
          }
          /* EQ Popup */
          .eq-popup-wide {
            color: ${stereoTheme.primary};
            background: #101310f7;
            border: 2.5px solid #4f6c47;
            border-radius: 12px;
            position: absolute;
            right: 43px;
            bottom: 64px;
            font-size: 1rem;
            padding: 16px 14px 11px 14px;
            box-shadow: 0 1.5px 17px #060c;
            z-index: 10;
            width: 174px;
            animation: popfade .42s cubic-bezier(.46,-0.38,.68,1.6);
          }
          @keyframes popfade {
            from { opacity: 0; transform: scale(.85) translateY(34px);}
            to { opacity: 1; transform: scale(1) translateY(0);}
          }
          @keyframes spinning {
            to { transform: translate(-50%, -50%) rotate(360deg);}
          }
          /* Responsive: narrower but still wide feeling on phones */
          @media (max-width: 870px) {
            .wide-stereo-shell { min-width: 97vw; max-width: 99vw; padding: 3.3vw 0.5vw 7vw 2.4vw; border-radius: 8vw;}
            .stereo-flex { flex-direction: column; align-items: stretch; gap:3vw;}
            .current-albumart-wrap { width: 90vw; height: 37vw; max-width: 340px; max-height: 155px;}
            .album-art-img, .spinning-vinyl { width: 85vw; height: 85vw; max-width: 98px; max-height: 98px; }
            .tracklist-stack { min-width: 70vw; margin: 2vw !important;}
            .stereo-mainstack { min-width: unset;}
            .eq-popup-wide { right: 19vw; }
          }
        `}
      </style>
    </div>
  );
}

export default MainContainer;
