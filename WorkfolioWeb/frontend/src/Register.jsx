import React, { useRef, useState } from 'react';

export default function Register() {
  const videoRef = useRef();
  const canvasRef = useRef();
  const [form, setForm] = useState({ fullName: '', employeeId: '', department: '' });
  const [captured, setCaptured] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
        videoRef.current.srcObject = stream;
      });
    }
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, 320, 240);
    canvasRef.current.toBlob(blob => {
      setCaptured(blob);
    }, 'image/jpeg');
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!captured) {
      setStatus('Please capture your face photo.');
      return;
    }
    setLoading(true);
    setStatus('');
    const data = new FormData();
    data.append('fullName', form.fullName);
    data.append('employeeId', form.employeeId);
    data.append('department', form.department);
    data.append('image', captured, `${form.employeeId}.jpg`);
    try {
      const res = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        body: data
      });
      const result = await res.json();
      setStatus(result.message);
      if (result.success) setCaptured(null);
    } catch (err) {
      setStatus('Registration failed.');
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <label>Full Name</label>
        <input name="fullName" value={form.fullName} onChange={handleChange} required />
        <label>Employee ID</label>
        <input name="employeeId" value={form.employeeId} onChange={handleChange} required />
        <label>Department</label>
        <input name="department" value={form.department} onChange={handleChange} required />
        <div style={{display:'flex',alignItems:'center',marginBottom:18}}>
          <video ref={videoRef} width={160} height={120} autoPlay style={{borderRadius:8,marginRight:16,background:'#222'}} />
          <canvas ref={canvasRef} width={320} height={240} style={{display:'none'}} />
          {captured && <img src={URL.createObjectURL(captured)} alt="Captured" width={80} style={{borderRadius:8}} />}
        </div>
        <button type="button" className="capture" onClick={handleCapture} disabled={loading}>Capture</button>
        <button type="submit" className="start" disabled={loading}>Register</button>
      </form>
      {status && <div style={{marginTop:16,color:status.includes('success')?'#2ecc40':'#e74c3c'}}>{status}</div>}
    </div>
  );
}
