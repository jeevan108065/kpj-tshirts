import React, { useEffect, useState } from "react";
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, IconButton, Stack, Chip, Switch, FormControlLabel,
  useMediaQuery, useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import * as api from "../db/api";

const emptyForm = { type: "bank", label: "", bank_name: "", bank_account: "", bank_ifsc: "", bank_branch: "", upi_id: "", is_default: false };

const PaymentMethods = () => {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const load = () => api.getPaymentMethods().then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (editId) await api.updatePaymentMethod(editId, form);
    else await api.createPaymentMethod(form);
    setOpen(false); setForm(emptyForm); setEditId(null); load();
  };

  const handleEdit = (p) => {
    setForm({
      type: p.type, label: p.label || "",
      bank_name: p.bank_name || "", bank_account: p.bank_account || "",
      bank_ifsc: p.bank_ifsc || "", bank_branch: p.bank_branch || "",
      upi_id: p.upi_id || "", is_default: p.is_default,
    });
    setEditId(p.id); setOpen(true);
  };
  const handleDelete = async (id) => { await api.deletePaymentMethod(id); load(); };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#1E3A5F", fontSize: { xs: 16, md: 24 } }}>
          Payments
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} size={isMobile ? "small" : "medium"}
          onClick={() => { setForm(emptyForm); setEditId(null); setOpen(true); }}>
          Add
        </Button>
      </Stack>

      {items.length === 0 && (
        <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
          <Typography sx={{ color: "#5A6F8A" }}>No payment methods added</Typography>
        </Paper>
      )}

      {isMobile && items.length > 0 && (
        <Stack spacing={1.5}>
          {items.map((p) => (
            <Paper key={p.id} sx={{ p: 2, borderRadius: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontWeight: 600, color: "#1E3A5F", fontSize: 15 }}>
                    {p.label || p.bank_name || p.upi_id}
                  </Typography>
                  <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                    <Chip label={p.type === "upi" ? "UPI" : "Bank"} size="small"
                      color={p.type === "upi" ? "secondary" : "primary"} variant="outlined" sx={{ fontSize: 11 }} />
                    {p.is_default && <Chip label="Default" size="small" color="success" sx={{ fontSize: 11 }} />}
                  </Stack>
                </Box>
                <Stack direction="row" spacing={0.5}>
                  <IconButton size="small" onClick={() => handleEdit(p)}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(p.id)}><DeleteIcon fontSize="small" /></IconButton>
                </Stack>
              </Stack>
              <Typography variant="body2" sx={{ color: "#5A6F8A", fontSize: 12, mt: 1 }}>
                {p.type === "upi" ? p.upi_id : `${p.bank_name} — A/C: ${p.bank_account}`}
              </Typography>
            </Paper>
          ))}
        </Stack>
      )}

      {!isMobile && items.length > 0 && (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#f0f4f8" }}>
                <TableCell sx={{ fontWeight: 700 }}>Label</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Details</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Default</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell sx={{ fontWeight: 600 }}>{p.label || p.bank_name || p.upi_id}</TableCell>
                  <TableCell>
                    <Chip label={p.type === "upi" ? "UPI" : "Bank"} size="small"
                      color={p.type === "upi" ? "secondary" : "primary"} variant="outlined" />
                  </TableCell>
                  <TableCell sx={{ fontSize: 13 }}>
                    {p.type === "upi" ? p.upi_id : `${p.bank_name} — A/C: ${p.bank_account}, IFSC: ${p.bank_ifsc}`}
                  </TableCell>
                  <TableCell>{p.is_default && <Chip label="Default" size="small" color="success" />}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleEdit(p)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(p.id)}><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle sx={{ fontSize: { xs: 18, md: 20 } }}>
          {editId ? "Edit Payment Method" : "Add Payment Method"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Type" select fullWidth value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <MenuItem value="bank">Bank Transfer</MenuItem>
              <MenuItem value="upi">UPI</MenuItem>
            </TextField>
            <TextField label="Label (e.g. Primary Account)" fullWidth value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })} />
            {form.type === "bank" && (
              <>
                <TextField label="Bank Name" fullWidth value={form.bank_name}
                  onChange={(e) => setForm({ ...form, bank_name: e.target.value })} />
                <TextField label="Account Number" fullWidth value={form.bank_account}
                  onChange={(e) => setForm({ ...form, bank_account: e.target.value })} />
                <TextField label="IFSC Code" fullWidth value={form.bank_ifsc}
                  onChange={(e) => setForm({ ...form, bank_ifsc: e.target.value })} />
                <TextField label="Branch" fullWidth value={form.bank_branch}
                  onChange={(e) => setForm({ ...form, bank_branch: e.target.value })} />
              </>
            )}
            {form.type === "upi" && (
              <TextField label="UPI ID" fullWidth value={form.upi_id}
                onChange={(e) => setForm({ ...form, upi_id: e.target.value })} placeholder="e.g. name@upi" />
            )}
            <FormControlLabel
              control={<Switch checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} />}
              label="Set as default payment method" />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>{editId ? "Update" : "Add"}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PaymentMethods;
