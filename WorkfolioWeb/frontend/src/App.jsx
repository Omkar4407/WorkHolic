import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Register from './Register';
import Track from './Track';

export default function App() {
  return (
    <Router>
      <nav style={{background:'#1a2956',padding:'12px 0',marginBottom:24}}>
        <div style={{maxWidth:480,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span style={{color:'#fff',fontWeight:700,fontSize:22,letterSpacing:1}}>Workfolio</span>
          <div>
            <Link to="/register" style={{color:'#fff',marginRight:18,textDecoration:'none'}}>Register</Link>
            <Link to="/track" style={{color:'#fff',textDecoration:'none'}}>Track</Link>
          </div>
        </div>
      </nav>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/track" element={<Track />} />
        <Route path="*" element={<Navigate to="/register" />} />
      </Routes>
    </Router>
  );
}
