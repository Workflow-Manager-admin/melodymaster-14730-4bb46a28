import React, { useRef, useState, useEffect } from "react";

// PUBLIC_INTERFACE
/**
 * MelodyMaster MainContainer - A React component styled as an old car stereo.
 * Features: Real Play/Pause, Skip/Prev, Album Art, Current Song Info, Progress Bar, Shuffle, Repeat, EQ, Retro-style.
 */

/*
 * --- Sample music files (royalty free and short for demo) ---
 * If you want to use your own audio files:
 *  1. Add mp3/wav files to the project's `public` folder (e.g., public/my_song.mp3)
 *  2. Add local sources here as: src: process.env.PUBLIC_URL + '/my_song.mp3'
 * The code below will auto-detect working sources, and always fallback to a known-good demo track.
 */
const TESTED_MP3 = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

const audioTracks = [
  // Add your own valid tracks here as needed, e.g.:
  // {
  //   title: "My Local Song",
  //   artist: "You",
  //   album: "Your Album",
  //   art: "local-artwork.png",
  //   src: process.env.PUBLIC_URL + '/my_song.mp3',
  //   duration: 180,
  // },
  {
    title: "Time Machine Groove",
    artist: "RetroWave",
    album: "Neon Nights",
    art: "https://i.imgur.com/GVlQINJ.png",
    src: "https://cdn.pixabay.com/audio/2022/10/16/audio_12c716b9ba.mp3",
    duration: 201,
  },
  {
    title: "Dashboard Dreams",
    artist: "Synth Escape",
    album: "Cruisin'",
    art: "https://i.imgur.com/ZA7AKWD.png",
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

// Fallback single test track: always uses a known working MP3 clip
const fallbackTrack = {
  title: "Sample Track (Add your own music!)",
  artist: "MelodyMaster",
  album: "Demo Album",
  art: "https://i.imgur.com/IJQZRlm.png",
  src: TESTED_MP3,
  duration: 347, // (seconds, approx)
};

const stereoTheme = {
  primary: "#1DB954",
  secondary: "#191414",
  accent: "#FFFFFF",
  background: "#282B28",
  digital: "#EFEA91",
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

/**
 * Checks if the browser can play the track's source (by file extension, basic test).
 * @param {string} src
 * @returns {boolean}
 */
function canPlayAudioSrc(src) {
  if (!src) return false;
  const testAudio = document.createElement('audio');
  const ext = src.split(".").pop().toLowerCase();
  if (ext === "mp3") return !!testAudio.canPlayType("audio/mpeg");
  if (ext === "wav") return !!testAudio.canPlayType("audio/wav");
  if (ext === "ogg") return !!testAudio.canPlayType("audio/ogg");
  // fallback guess for other schemes
  return true;
}

// PUBLIC_INTERFACE
function MainContainer() {
  // Playback state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // seconds
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [showEQ, setShowEQ] = useState(false);
  const [audioError, setAudioError] = useState('');

  const audioRef = useRef(null);
  const progressRef = useRef(null);

  // Check for a supported/working track
  const availableTracks = audioTracks.filter(t => canPlayAudioSrc(t.src));
  const hasValidTracks = availableTracks.length > 0;
  const currentTrack =
    hasValidTracks
      ? availableTracks[currentIdx % availableTracks.length]
      : fallbackTrack;

  // If not even the fallback works (network down or source missing)
  const cannotPlayAny = !canPlayAudioSrc(currentTrack.src);

  // Enhanced error handler for the audio element
  useEffect(() => {
    if (!audioRef.current) return;
    const handleAudioError = () => {
      setAudioError(
        "Audio format or source is not supported or not reachable. Please check your internet connection or try a different track. " +
        "If you're developing, update the audioTracks array in MainContainer.js with valid mp3 or wav sources!"
      );
      setPlaying(false);
    };
    audioRef.current.addEventListener("error", handleAudioError);
    return () => {
      audioRef.current && audioRef.current.removeEventListener("error", handleAudioError);
    };
  }, [currentTrack.src]);

  // Play/Pause logic
  useEffect(() => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [playing, currentIdx]);

  // Sync progress bar
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
    // eslint-disable-next-line
  }, [currentIdx, repeat, shuffle]);

  // If the user clicks track, start playing
  const handleTrackClick = (idx) => {
    setCurrentIdx(idx);
    setProgress(0);
    setPlaying(true);
  };

  // Play/Pause
  const handlePlayPause = () => setPlaying((p) => !p);

  // Next/Prev logic (with shuffle)
  function getRandomIdx(excl) {
    if (audioTracks.length < 2) return excl;
    let next;
    do {
      next = Math.floor(Math.random() * audioTracks.length);
    } while (next === excl);
    return next;
  }

  const handleNext = () => {
    setProgress(0);
    if (shuffle) {
      setCurrentIdx((idx) => getRandomIdx(idx));
    } else {
      setCurrentIdx((idx) => getNextTrackIdx(idx, 1, audioTracks.length));
    }
    setPlaying(true);
  };
  const handlePrev = () => {
    setProgress(0);
    if (shuffle) {
      setCurrentIdx((idx) => getRandomIdx(idx));
    } else {
      setCurrentIdx((idx) => getNextTrackIdx(idx, -1, audioTracks.length));
    }
    setPlaying(true);
  };

  // Progress Bar - Seeking
  const handleBarChange = (e) => {
    const val = Number(e.target.value);
    setProgress(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  // When audio ends
  function handleTrackEnd() {
    if (repeat) {
      setProgress(0);
      if (audioRef.current) audioRef.current.currentTime = 0;
      setPlaying(true);
      audioRef.current?.play();
    } else {
      handleNext();
    }
  }

  // Extra controls for demonstration: EQ and Eject
  const handleEQ = () => setShowEQ((e) => !e);
  const handleEject = () => {
    setPlaying(false);
    setProgress(0);
    if (audioRef.current) audioRef.current.currentTime = 0;
  };

  // active button highlight
  const btnActive = (on) => (on ? { filter: `drop-shadow(0 0 6px ${stereoTheme.primary}) brightness(1.3)` } : {});

  // Render
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
      {!hasValidTracks || cannotPlayAny ? (
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
                <b>How to fix:</b> Add one or more working music files (mp3, wav, etc) to the <code>audioTracks</code> array<br />
                in <code>MainContainer.js</code>. Example fallback used:<br />
                <code>https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3</code><br />
                <br />
                Or, check your internet connection/network. <br />
                <br />
                <b>Developer note:</b> The player will automatically use a tested MP3 if none of your tracks are playable.
              </span>
            )}
          </div>
        </div>
      ) : null}
      <div className="car-stereo-shell" style={(!hasValidTracks || cannotPlayAny) ? { opacity: 0.45, pointerEvents: 'none' } : {}}>
        <div className="stereo-header">
          <div className="stereo-dial"></div>
          <div className="stereo-brand">MelodyMaster</div>
          <div className="stereo-lights">
            <span className={`stereo-light ${playing ? "on" : ""}`}></span>
            <span className={`stereo-light ${playing ? "on" : ""}`}></span>
          </div>
        </div>

        <div className="stereo-center">
          <div className="stereo-artwork">
            <img src={currentTrack.art} alt="Album Art" />
            <div className={playing ? "spinning-vinyl vinyl-on" : "spinning-vinyl"}></div>
          </div>
          <div className="stereo-display">
            <div className="digital-display retro-screen">
              <span className="display-track">{currentTrack.title}</span>
              <span className="display-artist">{currentTrack.artist}</span>
              <span className="display-album">{currentTrack.album}</span>
            </div>
            <div className="display-duration">
              <span role="img" aria-label="timer" style={{ filter: "drop-shadow(1px 1px 0 #444)" }}>
                ⏱️
              </span>{" "}
              {formatTime(progress)} / {formatTime(currentTrack.duration)}
            </div>
            <div className="progress-bar-row" style={{ width: "86%", margin: "0.75em 0 0.25em 0" }}>
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
          </div>
        </div>

        <audio
          ref={audioRef}
          src={currentTrack && currentTrack.src ? currentTrack.src : ""}
          preload="auto"
          style={{ display: "none" }}
          tabIndex={-1}
        />

        <div className="stereo-controls plus-extra-controls">
          <button className="control-btn btn-prev" onClick={handlePrev} aria-label="Previous track">
            <span className="btn-knob">&#9198;</span>
          </button>
          <button className="control-btn btn-playpause" onClick={handlePlayPause} aria-label={playing ? "Pause" : "Play"}>
            <span className="btn-knob">
              {playing ? (
                <span>&#10073;&#10073;</span>
              ) : (
                <span>&#9654;</span>
              )}
            </span>
          </button>
          <button className="control-btn btn-next" onClick={handleNext} aria-label="Next track">
            <span className="btn-knob">&#9197;</span>
          </button>
          <button
            className="control-btn btn-shuffle"
            aria-label="Shuffle"
            style={btnActive(shuffle)}
            onClick={() => setShuffle((s) => !s)}
          >
            <span className="btn-knob">&#128256;</span>
            {/* Unicode: 🔀 */}
          </button>
          <button
            className="control-btn btn-repeat"
            aria-label="Repeat"
            style={btnActive(repeat)}
            onClick={() => setRepeat((r) => !r)}
          >
            <span className="btn-knob">&#128257;</span>
            {/* Unicode: 🔁 */}
          </button>
          <button
            className="control-btn btn-eject"
            aria-label="Eject"
            style={btnActive(false)}
            onClick={handleEject}
          >
            <span className="btn-knob">&#9167;</span>
            {/* Unicode: ⏏️ */}
          </button>
          <button
            className="control-btn btn-eq"
            aria-label="Equalizer"
            style={btnActive(showEQ)}
            onClick={handleEQ}
          >
            <span className="btn-knob">&#119070;</span>
            {/* Unicode: 𝅗𝅥 (musical symbol as faux EQ toggle) */}
          </button>
        </div>

        <div className="stereo-tracklist">
          <div className="tracklist-label">TRACKLIST</div>
          <ul>
            {audioTracks.map((track, idx) => (
              <li
                key={track.title}
                className={idx === currentIdx ? "selected" : ""}
                onClick={() => handleTrackClick(idx)}
                style={idx === currentIdx ? { fontWeight: 700, textShadow: "0 0 7px #1DB95450" } : undefined}
              >
                <span className="track-title">{track.title}</span>
                <span className="track-artist">{track.artist}</span>
                <span className="track-duration">{formatTime(track.duration)}</span>
              </li>
            ))}
          </ul>
        </div>

        {showEQ && (
          <div
            className="eq-popup"
            style={{
              color: stereoTheme.primary,
              background: "#101310f7",
              border: `2.5px solid #4f6c47`,
              borderRadius: 12,
              position: "absolute",
              right: "7px",
              bottom: "92px",
              fontSize: "1rem",
              padding: "16px 14px 11px 14px",
              boxShadow: "0 1.5px 12px #060c",
              zIndex: 10,
              width: "160px",
            }}
          >
            <div style={{ fontFamily: "Orbitron", fontWeight: 900, fontSize: "1.1em", letterSpacing: 2, color: "#c6ffcd" }}>
              EQ Settings
            </div>
            <div style={{ marginTop: 11, color: "#b2e38f", fontFamily: "inherit", letterSpacing: "1.3px", fontSize: "0.98em" }}>
              Bass: <span style={{ color: "#fff", fontWeight: 600 }}>+2</span>
              <br />
              Treble: <span style={{ color: "#fff", fontWeight: 600 }}>-1</span>
              <br />
              Loudness: <span style={{ color: "#fff", fontWeight: 600 }}>ON</span>
              <div style={{ marginTop: 7, color: "#aee", fontFamily: "monospace", fontSize: "0.91em" }}>Vintage simulated</div>
            </div>
            <button
              onClick={() => setShowEQ(false)}
              style={{
                marginTop: 13,
                background: "#1DB954",
                color: "#191414",
                border: "none",
                borderRadius: 7,
                fontWeight: 600,
                padding: "4.2px 13px",
                fontFamily: "Orbitron, monospace",
                cursor: "pointer",
                fontSize: "0.98em",
              }}
            >
              Close
            </button>
          </div>
        )}
      </div>

      {/* Inline style for retro font import */}
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700&display=swap');`}
      </style>
      {/* Retro Car Stereo Styles */}
      <style>
        {`
        .progress-bar-row {
          display: flex;
          align-items: center;
          margin: 7px 0 0 0;
        }
        .progressbar[type="range"]::-webkit-slider-thumb {
          background: ${stereoTheme.primary};
        }
        .progressbar {
          margin-top: 1px;
        }
        /* Extra stereo controls */
        .plus-extra-controls {
          flex-wrap: wrap;
          gap: 18px !important;
          justify-content: flex-start;
          min-width: 200px;
        }
        .btn-shuffle, .btn-repeat, .btn-eject, .btn-eq {
          font-size: 1.16rem;
          color: #b0d2ad;
          border: 3px solid #267643;
          background: radial-gradient(circle, #071808 60%, #1DB95422 100%);
          box-shadow: 0 1px 8px #13240e;
          width: 43px; height: 43px;
          margin-left: 5px;
          margin-right: 0px;
        }
        .btn-shuffle:active,
        .btn-repeat:active,
        .btn-eject:active,
        .btn-eq:active {
          color: ${stereoTheme.primary};
          background: #11471d44;
          border-color: ${stereoTheme.primary};
        }
        .eq-popup {
          animation: popfade .42s cubic-bezier(.46,-0.38,.68,1.6);
        }
        @keyframes popfade {
          from { opacity: 0; transform: scale(.72) translateY(30px);}
          to { opacity: 1; transform: scale(1) translateY(0);}
        }

        /* Original stereo CSS preserved below */
        .car-stereo-shell {
          background: linear-gradient(160deg, #222 60%, #444 100%);
          border-radius: 28px;
          box-shadow: 0 4px 44px #111c, 0 0px 0 7px #090909 inset;
          border: 4px solid #111;
          min-width: 375px;
          max-width: 410px;
          margin: 36px 0 26px 0;
          padding: 24px 16px 24px 16px;
          position: relative;
        }
        .stereo-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 16px;
        }
        .stereo-brand {
          font-family: 'Orbitron', monospace;
          font-weight: 700;
          font-size: 1.6rem;
          color: ${stereoTheme.primary};
          letter-spacing: 0.095em;
          text-shadow: 0px 1px 2px #000, 0px 0px 10px ${
            stereoTheme.primary
          }44;
        }
        .stereo-dial {
          width: 22px; height: 22px; background: #222;
          border-radius: 50%; box-shadow: 2px 2px 6px #0e0e0e;
          border: 2px solid #686868;
        }
        .stereo-lights { display: flex; gap:5px;}
        .stereo-light {
          display: inline-block;
          width: 10px; height: 10px;
          border-radius: 50%;
          background: #333;
          border: 1.5px solid #111;
          box-shadow: 0px 1px 2px #000;
        }
        .stereo-light.on {
          background: ${stereoTheme.primary};
          box-shadow: 0 0 10px ${stereoTheme.primary}, 0 1px 2px #000;
        }

        .stereo-center {
          display: flex; gap: 18px;
          justify-content: center; align-items: center;
          margin-bottom: 8px;
        }
        .stereo-artwork {
          width: 92px; height: 92px;
          border-radius: 11px;
          overflow: hidden;
          border: 2.5px solid ${stereoTheme.primary};
          background: #181818;
          display: flex; align-items: center; justify-content: center;
          position: relative;
        }
        .stereo-artwork img {
          width: 100%; height: 100%; object-fit: cover;
          display: block;
          z-index: 1;
        }
        .spinning-vinyl {
          position: absolute;
          left: 50%; top: 50%;
          width: 92px; height: 92px;
          transform: translate(-50%, -50%);
          border-radius: 100%;
          box-shadow: 0 0 10px #1db95444 inset, 0 0 24px #000 inset;
          border: 3px dashed #bbb2;
          pointer-events: none;
          mix-blend-mode: color-dodge;
          opacity: 0.23;
          transition: opacity 0.7s;
        }
        .spinning-vinyl.vinyl-on {
          opacity: 0.50;
          animation: spinning 2.3s linear infinite;
        }
        @keyframes spinning {
          to { transform: translate(-50%, -50%) rotate(360deg);}
        }
        .stereo-display {
          flex: 1 1 180px;
          min-width: 164px;
          display: flex; flex-direction: column; align-items: flex-start;
        }
        .digital-display {
          background: repeating-linear-gradient(
            135deg,
            #353822,
            #2a2912 3px,
            #353822 6px,
            #36351f 9px
          );
          color: ${stereoTheme.digital};
          border-radius: 7px;
          font-family: 'Orbitron', monospace;
          font-size: 1.03rem;
          font-weight: bold;
          padding: 13px 14px;
          width: 100%;
          margin-bottom: 4px;
          box-shadow: 0 1px 7px #000a;
          border: 1px solid #393723;
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 2px;
          letter-spacing: 0.04em;
        }
        .retro-screen span {
          display: block;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .display-track {
          font-size: 1.05rem; color: ${stereoTheme.primary};
        }
        .display-artist {
          font-size: 0.98rem; font-weight: 400; color: #eee;
        }
        .display-album {
          font-size: 0.92rem; color: #b9da7d;
          font-style: italic;
        }
        .display-duration {
          margin-left: 5px;
          margin-top: 2px;
          color: ${stereoTheme.digital};
          font-size: 0.99rem;
          letter-spacing: 0.035em;
          font-family: 'Orbitron', monospace;
        }

        .stereo-tracklist {
          margin: 16px auto 10px auto;
          background: linear-gradient(90deg, #191919 60%, #323332 100%);
          border-radius: 8px;
          padding: 8px 13px 6px 13px;
          min-width: 260px;
          border: 1.5px solid #232323;
          box-shadow: 0 0.5px 2.5px #111a inset;
        }
        .tracklist-label {
          font-size: 0.90rem;
          letter-spacing: 0.13em;
          font-weight: 600;
          color: ${stereoTheme.primary};
          margin-bottom: 6px;
        }
        .stereo-tracklist ul {
          list-style: none;
          margin: 0; padding: 0;
        }
        .stereo-tracklist li {
          display: flex; justify-content: space-between; align-items: center;
          color: ${stereoTheme.accent};
          padding: 5px 0;
          border-radius: 6px;
          cursor: pointer;
          transition: background 0.13s;
          font-size: 1.01rem;
        }
        .stereo-tracklist li.selected {
          background: ${stereoTheme.primary}22;
          color: ${stereoTheme.primary};
          font-weight: 700;
        }
        .stereo-tracklist li:hover:not(.selected) {
          background: #272727;
        }
        .track-title {
          flex: 2 2 130px;
        }
        .track-artist {
          flex: 1 1 60px; font-size: 0.91rem; color: #b7f39d
        }
        .track-duration {
          min-width: 44px;
          text-align: right;
          color: #cfcdb2;
          font-size: 0.92rem;
        }

        .stereo-controls {
          margin: 0 auto;
          margin-top: 18px;
          padding: 9px 25px 8px 25px;
          background: linear-gradient(90deg, #141414 60%, #28332e 120%);
          border-radius: 14px 14px 26px 26px;
          border: 2px solid #353822;
          min-width: 180px;
          max-width: 265px;
          display: flex; justify-content: center; gap: 32px;
          box-shadow: 0 1.7px 20px #0007 inset;
        }
        .control-btn {
          background: radial-gradient(circle, #272827 60%, ${stereoTheme.primary}15 100%);
          border: 4px solid #686868;
          width: 54px; height: 54px;
          border-radius: 50%;
          box-shadow: 0 2px 8px #181818;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          margin: 0;
          transition: box-shadow 0.16s, background 0.16s;
          font-size: 1.63rem;
          color: ${stereoTheme.digital};
          position: relative;
        }
        .control-btn:active {
          box-shadow: 0 1px 12px #1db95444 inset;
          background: ${stereoTheme.primary}22;
          color: ${stereoTheme.primary};
        }
        .btn-knob {
          font-size: 1.3em;
          filter: drop-shadow(1px 2px 0 #fff1);
          padding-bottom: 3px;
        }
        .btn-playpause {
          border: 4px solid ${stereoTheme.primary};
          color: ${stereoTheme.primary};
          background: radial-gradient(circle, #232723 50%, ${stereoTheme.primary}25 100%);
          width: 62px; height: 62px;
        }
        .btn-playpause:active {
          filter: brightness(1.22);
        }

        /* Responsive adjustments for narrow screens */
        @media (max-width: 500px) {
          .car-stereo-shell { min-width: 98vw; max-width: 99vw; padding: 7vw 2vw; border-radius: 7vw; }
          .stereo-center { flex-direction: column; gap:5vw; align-items: stretch;}
          .stereo-tracklist { min-width: 70vw; }
        }
        `}
      </style>
    </div>
  );
}

export default MainContainer;
