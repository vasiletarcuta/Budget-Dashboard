import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function Register() {
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' });
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await API.post('/auth/register', {
        ...form,
      });
      alert("Cont creat cu succes!");
      navigate('/');
    } catch (err) {
      console.error("Eroare înregistrare:", err.response || err.message || err);
      alert("Înregistrare eșuată: " + (err.response?.data || "vezi consola"));
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Înregistrare</h2>
        <input
          style={styles.input}
          placeholder="Prenume"
          value={form.firstName}
          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
        />
        <input
          style={styles.input}
          placeholder="Nume"
          value={form.lastName}
          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
        />
        <input
          style={styles.input}
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          style={styles.input}
          placeholder="Parolă"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button style={styles.button} onClick={handleRegister}>Creează cont</button>
        <p style={styles.text}>
          Ai deja cont?{' '}
          <span style={styles.link} onClick={() => navigate('/login')}>Autentifică-te</span>
        </p>
      </div>
    </div>
  );
}
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f0f4f8',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  title: {
    textAlign: 'center',
    color: '#333',
    fontFamily: 'Poppins, sans-serif',
  },
  input: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '16px',
    outline: 'none',
  },
  button: {
    padding: '12px 16px',
    backgroundColor: '#007bff',
    color: 'white',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  text: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#666',
  },
  link: {
    color: '#007bff',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};
