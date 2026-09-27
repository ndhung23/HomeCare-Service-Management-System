import React, { useState, useEffect } from 'react';
import './App.css';
import axiosClient from './api/axiosClient';

function App() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Gọi thử nghiệm API test từ backend
    const fetchApiTest = async () => {
      try {
        const response = await axiosClient.get('/test');
        setMessage(response.data.message);
      } catch (err) {
        console.error('Lỗi khi gọi API:', err);
        setError(err.message || 'Không thể kết nối đến máy chủ backend');
      } finally {
        setLoading(false);
      }
    };

    fetchApiTest();
  }, []);

  return (
    <div className="App" style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'Arial, sans-serif' }}>
      <h1>MERN Stack Starter</h1>
      
      <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', display: 'inline-block', borderRadius: '8px' }}>
        <h3>Trạng thái kết nối Backend:</h3>
        {loading && <p>Đang tải dữ liệu từ API...</p>}
        {error && <p style={{ color: 'red' }}>Lỗi: {error}</p>}
        {message && <p style={{ color: 'green', fontWeight: 'bold' }}>{message}</p>}
      </div>
    </div>
  );
}

export default App;