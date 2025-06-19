import { useState } from 'react';
import API from '../api';
import { useNavigate } from 'react-router-dom';

export default function AddExpense() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    expenseType: '',
    description: '',
    amount: '',
    date: '',
  });

  const handleSubmit = async () => {
    try {
      await API.post('/expenses/add', {
        expenseType: form.expenseType,
        expenseDescription: form.description,
        amount: parseFloat(form.amount),
        date: form.date,
      });
      navigate('/dashboard');
    } catch (err) {
      alert("Eroare la salvare");
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Adaugă Cheltuială</h2>

      <select onChange={(e) => setForm({ ...form, expenseType: e.target.value })}>
        <option value="">--Selectează tipul--</option>
        <option value="CLOTHING">CLOTHING</option>
        <option value="ENTERTAINMENT">ENTERTAINMENT</option>
        <option value="FOOD">FOOD</option>
        <option value="UTILITIES">UTILITIES</option>
        {/* adaugă ce ai în enum */}
      </select>

      <input placeholder="Descriere"
             onChange={(e) => setForm({ ...form, description: e.target.value })} />

      <input type="number" placeholder="Sumă"
             onChange={(e) => setForm({ ...form, amount: e.target.value })} />

      <input type="date"
             onChange={(e) => setForm({ ...form, date: e.target.value })} />

      <button onClick={handleSubmit}>Trimite</button>
    </div>
  );
}
