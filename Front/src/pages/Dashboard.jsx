import React, { useEffect, useState } from 'react';
import {
  Box, Grid, Typography, Card, CardContent, Paper, List, ListItem, ListItemText,
  Button, Dialog, DialogTitle, DialogContent, TextField, MenuItem, DialogActions
} from '@mui/material';
import {
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend
} from 'recharts';
import API from '../api';

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF4444',
  '#AA00FF', '#D500F9', '#F50057', '#FF4081', '#7C4DFF',
  '#18FFFF', '#00E676', '#C6FF00', '#FFEA00', '#FF9100'
];

export default function Dashboard() {
  const [totalSum, setTotalSum] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [suggestedBudgets, setSuggestedBudgets] = useState({});
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ expenseType: '', description: '', amount: '', date: '' });
  const [spenderType, setSpenderType] = useState(null);
  const [openSpender, setOpenSpender] = useState(false);

  const fetchAll = async () => {
    const [res1, res2, res3, res4, res5] = await Promise.all([
      API.get('/expenses/total_sum'),
      API.get('/expenses/all_by_id'),
      API.get('/expenses/favorite_categories'),
      API.get('/expenses/total_by_month'),
      API.get('/expenses/budget/suggestions')
    ]);

    setTotalSum(parseFloat(res1.data) || 0);
    setExpenses(res2.data);

    const pieReady = Object.entries(res3.data).map(([name, value]) => ({ name, value }));
    setPieData(pieReady);

    const totals = res4.data;
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const barReady = months.map(m => ({ month: m, total: totals[m] || 0 }));
    setBarData(barReady);

    setSuggestedBudgets(res5.data || {});
  };

  const fetchSpenderType = async () => {
    try {
      const res = await API.get('/users/spender_type');
      const data = res.data;
      setSpenderType(`${data.TIP}: ${data.EXPLICATIE}`);
      setOpenSpender(true);
    } catch (err) {
      alert('Eroare la preluarea profilului de cheltuitor');
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAdd = async () => {
    try {
      await API.post('/expenses/add', {
        expenseType: form.expenseType,
        description: form.description,
        amount: parseFloat(form.amount),
        date: form.date + 'T00:00:00'
      });
      setOpen(false);
      setForm({ expenseType: '', description: '', amount: '', date: '' });
      fetchAll();
    } catch (err) {
      alert('Eroare la salvare');
    }
  };

  return (
    <Box sx={{ p: 4, bgcolor: '#48cae4', minHeight: '100vh' }}>
      <Typography variant="h4" fontWeight={600} mb={4}>Dashboard</Typography>

      {/* SECTION 1 */}
      <Grid container spacing={2} mb={3} justifyContent="space-between">
        <Grid item xs={12} md={4} marginRight={-30}>
          <Card sx={{ bgcolor: '#E8F5E9', height: '100%' }}>
            <CardContent>
              <Typography color="#023e8a" fontWeight={1000} variant="subtitle2">Total cheltuieli</Typography>
              <Typography variant="h5">{totalSum.toFixed(2)} RON</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#FFF3E0', height: '100%', marginLeft: -15 }}>
            <CardContent>
              <Typography color="#fb8c00" variant="subtitle2">Nr. cheltuieli</Typography>
              <Typography variant="h5">{expenses.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: '#E3F2FD', height: '100%' }}>
            <CardContent>
              <Typography color="#42a5f5" variant="subtitle2">Categorii unice</Typography>
              <Typography variant="h5">{pieData.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Box textAlign="right" mt={2}>
          <Button variant="outlined" color="primary" onClick={() => setOpen(true)}>
            Adaugă cheltuială
          </Button>
        </Box>
      </Grid>

      {/* SECTION 2 */}
      <Grid container spacing={4} mb={4} justifyContent="space-between">
        <Grid item xs={12} md={6} width={"50%"}>
          <Paper sx={{ px: 5, py: 2 }}>
            <Typography variant="h6" mb={1}>Distribuție pe luni</Typography>
            <ResponsiveContainer width="101%" height={300}>
              <BarChart data={barData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total" fill="#66bb6a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6} width={"48%"}>
          <Paper sx={{ px: 5, py: 2 }}>
            <Typography variant="h6" mb={1}>Categorii cheltuite</Typography>
            <ResponsiveContainer width="101%" height={300}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={30} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* SECTION 3 - Bugete recomandate */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} width={"100%"}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>💡 Bugete lunare recomandate</Typography>
            {Object.keys(suggestedBudgets).length === 0 ? (
              <Typography variant="body2">Nu sunt suficiente date pentru recomandări.</Typography>
            ) : (
              <List>
                {Object.entries(suggestedBudgets).map(([type, value]) => (
                  <ListItem key={type} divider>
                    <ListItemText
                      primary={`${type}`}
                      secondary={`Buget recomandat: ${value.toFixed(2)} RON/lună`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* SECTION 4 - Ultimele cheltuieli */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} width={"100%"}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Ultimele cheltuieli</Typography>
            <List>
              {expenses.slice(0, 5).map((e) => (
                <ListItem key={e.id} divider>
                  <ListItemText
                    primary={`${e.expenseType} - ${e.expenseDescription}`}
                    secondary={`${e.sum} RON | ${new Date(e.expenseDate).toLocaleDateString()}`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog adăugare cheltuială */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Adaugă Cheltuială</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Tip cheltuială" fullWidth select value={form.expenseType} onChange={e => setForm({ ...form, expenseType: e.target.value })}>
            {["FOOD", "CLOTHING", "SERVICES", "ENTERTAINMENT", "UTILITIES", "RENT", "TRANSPORT", "OTHER"].map(opt => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </TextField>
          <TextField margin="dense" label="Descriere" fullWidth value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <TextField margin="dense" label="Sumă (RON)" fullWidth type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
          <TextField margin="dense" label="Dată" fullWidth type="date" InputLabelProps={{ shrink: true }} value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Anulează</Button>
          <Button onClick={handleAdd} variant="contained">Salvează</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog tip cheltuitor */}
      <Box textAlign="right" mt={2}>
        <Button variant="outlined" color="secondary" onClick={fetchSpenderType}>
          Află ce tip de cheltuitor ești
        </Button>
      </Box>

      <Dialog open={openSpender} onClose={() => setOpenSpender(false)}>
        <DialogTitle>Tipul tău de cheltuitor</DialogTitle>
        <DialogContent>
          <Typography>{spenderType ? spenderType : "Se încarcă..."}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSpender(false)}>Închide</Button>
        </DialogActions>
      </Dialog>

      {/* Footer */}
      <Box sx={{ mt: 4, textAlign: 'center', color: '#fff' }}>
        <Typography variant="body2">
          &copy; {new Date().getFullYear()} Cheltuieli Personale. Toate drepturile rezervate.
        </Typography>
      </Box>
    </Box>
  );
}
