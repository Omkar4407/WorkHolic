import React, { useEffect, useRef, useState } from 'react';

export default function Track() {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState('');
  const [tracking, setTracking] = useState(false);
  const [status, setStatus] = useState('');
  const [sessionTime, setSessionTime] = useState(0);
  const [activeTime, setActiveTime] = useState(0);
  const [breakTime, setBreakTime] = useState(0);
  const [onBreak, setOnBreak] = useState(false);
  const videoRef = useRef();
  const intervalRef = useRef();
  const timerRef = useRef();

  useEffect(() => {
    fetch('http://localhost:5000/api/users')
      .then(res => res.json())
      .then(setUsers);
  }, []);

  useEffect(() => {
    if (tracking) {
      timerRef.current = setInterval(() => setSessionTime(t => t + 1), 1000);
      if (!onBreak) intervalRef.current = setInterval(() => setActiveTime(t => t + 1), 1000);
      else intervalRef.current = setInterval(() => setBreakTime(t => t + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      clearInterval(intervalRef.current);
    }
    return () => {
      clearInterval(timerRef.current);
      clearInterval(intervalRef.current);
    };
  }, [tracking, onBreak]);

  const startTracking = async () => {
    setTracking(true);
    setSessionTime(0);
    setActiveTime(0);
    setBreakTime(0);
    setOnBreak(false);
    setStatus('');
    if (videoRef.current) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      detectLoop();
    }
  };

  const stopTracking = async () => {
    setTracking(false);
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    await fetch('http://localhost:5000/api/end_session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId: selected })
    });
    setStatus('Session ended.');
  };

  const detectLoop = async () => {
    if (!tracking) return;
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, 320, 240);
    canvas.toBlob(async blob => {
      const data = new FormData();
      data.append('employeeId', selected);
      data.append('frame', blob, 'frame.jpg');
      try {
        const res = await fetch('http://localhost:5000/api/process_frame', {
          method: 'POST',
          body: data
        });
        const result = await res.json();
        if (result.match) {
          if (onBreak) {
            setOnBreak(false);
            setStatus('Resumed.');
          }
        } else {
          if (!onBreak) {
            setOnBreak(true);
            setStatus('On break.');
          }
        }
      } catch {
        setStatus('Error processing frame.');
      }
      setTimeout(detectLoop, 2000);
    }, 'image/jpeg');
  };

  return (
    <div className="container">
      <h2>Track Work Session</h2>
      <label>Employee ID</label>
      <select value={selected} onChange={e => setSelected(e.target.value)} disabled={tracking} required>
        <option value="">Select...</option>
        {users.map(u => (
          <option key={u.employeeId} value={u.employeeId}>{u.employeeId} - {u.name}</option>
        ))}
      </select>
      <div style={{display:'flex',alignItems:'center',marginBottom:18}}>
        <video ref={videoRef} width={160} height={120} autoPlay style={{borderRadius:8,background:'#222'}} />
        <div style={{marginLeft:24}}>
          <div>Session: {formatTime(sessionTime)}</div>
          <div>Active: {formatTime(activeTime)}</div>
          <div>Break: {formatTime(breakTime)}</div>
        </div>
      </div>
      {!tracking ? (
        <button className="start" onClick={startTracking} disabled={!selected}>Start</button>
      ) : (
        <button className="stop" onClick={stopTracking}>Stop</button>
      )}
      {status && <div style={{marginTop:16,color:onBreak?'#e67e22':'#2ecc40'}}>{status}</div>}
    </div>
  );
}

function formatTime(sec) {
  const m = Math.floor(sec/60);
  const s = sec%60;
  return `${m}:${s.toString().padStart(2,'0')}`;
}
