import React from 'react';
import './App.css';
import MainContainer from './MainContainer';

// PUBLIC_INTERFACE
function App() {
  return (
    <div className="app" style={{background: "#191414", minHeight: "100vh", minWidth: 0, margin: 0}}>
      {/* Top navbar (optional, can be removed if not needed) */}
      <nav className="navbar" style={{borderBottom: "1.5px solid #333"}}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <div className="logo">
              <span className="logo-symbol" style={{color:'#1DB954', fontWeight:800}}>*</span> <span style={{color:"#1DB954"}}>MelodyMaster</span>
            </div>
            <button className="btn" style={{background:"#1DB954", color:"#fff"}}>Now Playing</button>
          </div>
        </div>
      </nav>

      <main style={{display:"flex", flexDirection:"column", alignItems:"center", marginTop:"88px"}}>
        <MainContainer />
      </main>
    </div>
  );
}

export default App;