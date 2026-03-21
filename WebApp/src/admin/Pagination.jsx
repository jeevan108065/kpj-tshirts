import { Stack, Button, Typography, MenuItem, TextField } from "@mui/material";

const Pagination = ({ page, total, limit, onPageChange, onLimitChange }) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  if (total <= 0) return null;
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 2 }} flexWrap="wrap" gap={1}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="body2" sx={{ color: "#5A6F8A", fontSize: 13 }}>
          {total} total · Page {page} of {totalPages}
        </Typography>
        <TextField select size="small" value={limit} onChange={(e) => onLimitChange(Number(e.target.value))}
          sx={{ minWidth: 70, "& .MuiInputBase-input": { fontSize: 13, py: 0.5 } }}>
          {[10, 25, 50].map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
        </TextField>
      </Stack>
      <Stack direction="row" spacing={0.5}>
        <Button size="small" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Prev</Button>
        <Button size="small" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>Next</Button>
      </Stack>
    </Stack>
  );
};

export default Pagination;
