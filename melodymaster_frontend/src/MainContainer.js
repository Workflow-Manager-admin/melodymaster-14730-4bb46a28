import React, { useState } from "react";

// PUBLIC_INTERFACE
/**
 * MelodyMaster MainContainer - A React component styled as an old car stereo.
 * Features: Play/Pause, Skip/Prev, Album Art, Current Song Info, Retro-style.
 */
const dummyTracks = [
  {
    title: "Time Machine Groove",
    artist: "RetroWave",
    album: "Neon Nights",
    art: "https://i.imgur.com/GVlQINJ.png",
    duration: "3:21",
  },
  {
    title: "Dashboard Dreams",
    artist: "Synth Escape",
    album: "Cruisin'",
    art: "https://i.imgur.com/ZA7AKWD.png",
    duration: "4:08",
  },
  {
    title: "FM Memories",
    artist: "Night Drive",
    album: "Afterglow",
    art: "https://i.imgur.com/9e3ldwV.png",
    duration: "2:56",
  },
];

const stereoTheme = {
  primary: "#1DB954",
  secondary: "#191414",
  accent: "#FFFFFF",
  background: "#282B28",
  digital: "#EFEA91",
};

function getNextTrackIdx(idx, dir, length) {
  let next = idx + dir;
  if (next < 0) return length - 1;
  if (next >= length) return 0;
  return next;
}

// PUBLIC_INTERFACE
function MainContainer() {
  // Simulate playback state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  const currentTrack = dummyTracks[currentIdx];

  // Handlers
  const handlePlayPause = () => setPlaying((p) => !p);
  const handleNext = () =>
    setCurrentIdx((idx) => getNextTrackIdx(idx, 1, dummyTracks.length));
  const handlePrev = () =>
    setCurrentIdx((idx) => getNextTrackIdx(idx, -1, dummyTracks.length));

  const handleTrackClick = (idx) => setCurrentIdx(idx);

  // Render function
  return (
    <div style={{ minHeight: "100vh", background: stereoTheme.secondary, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Orbitron', 'Inter', monospace", }}>
      <div className="car-stereo-shell">
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
              <span role="img" aria-label="timer" style={{filter: 'drop-shadow(1px 1px 0 #444)'}}>⏱️</span> {currentTrack.duration}
            </div>
          </div>
        </div>

        <div className="stereo-tracklist">
          <div className="tracklist-label">TRACKLIST</div>
          <ul>
            {dummyTracks.map((track, idx) => (
              <li
                key={track.title}
                className={idx === currentIdx ? "selected" : ""}
                onClick={() => handleTrackClick(idx)}
              >
                <span className="track-title">{track.title}</span>
                <span className="track-artist">{track.artist}</span>
                <span className="track-duration">{track.duration}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="stereo-controls">
          <button className="control-btn btn-prev" onClick={handlePrev} aria-label="Previous track">
            <span className="btn-knob">&#9198;</span>
          </button>
          <button className="control-btn btn-playpause" onClick={handlePlayPause} aria-label={playing ? "Pause" : "Play"}>
            <span className="btn-knob">
              {playing ? (
                <span>&#10073;&#10073;</span> // Pause symbol
              ) : (
                <span>&#9654;</span> // Play symbol
              )}
            </span>
          </button>
          <button className="control-btn btn-next" onClick={handleNext} aria-label="Next track">
            <span className="btn-knob">&#9197;</span>
          </button>
        </div>
      </div>

      {/* Inline style for retro font import */}
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700&display=swap');`}
      </style>
      {/* Retro Car Stereo Styles */}
      <style>
        {`
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
          /* Old digital display styling */
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
