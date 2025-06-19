import { Box, Typography, Divider } from '@mui/material';

export default function ReceiptCard({ expense }) {
  if (!expense) return null;

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  return (
    <Box
      sx={{
        width: 300,
        bgcolor: 'white',
        p: 2,
        ml: 4,
        fontFamily: 'monospace',
        border: '1px dashed grey',
        boxShadow: 3,
        whiteSpace: 'pre-wrap',
        mt: 3
      }}
    >
      <Typography variant="h6" align="center" gutterBottom>
       Detalii Cheltuială
      </Typography>
      <Divider />
      <Typography mt={1}>ID: {expense.id}</Typography>
      <Typography>Tip: {expense.expenseType}</Typography>
      <Typography>Descriere: {expense.expenseDescription}</Typography>
      <Typography>Sumă: {expense.sum} RON</Typography>
      <Typography>Data: {formatDate(expense.expenseDate)}</Typography>
      <Divider sx={{ mt: 2 }} />
      <Typography align="center" mt={1}>
      </Typography>
    </Box>
  );
}
