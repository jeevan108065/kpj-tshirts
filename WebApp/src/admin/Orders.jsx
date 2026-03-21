import React, { useEffect, useState } from "react";
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, IconButton, Stack, Chip, useMediaQuery, useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import * as api from "../db/api";

const statusColors = { pending: "warning", processing: "info", delivered: "success", cancelled: "error" };
const statuses = ["pending", "processing", "delivered", "cancelled"];
const emptyOrder = { client_name: "", items: "", total_amount: "", total_qty: "", status: "pending" };

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyOrder);
  const [editId, setEditId] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const load = () => api.getOrders().then(setOrders).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    const data = { ...form, total_amount: Number.parseFloat(form.total_amount) || 0, total_qty: Number.parseInt(form.total_qty) || 0 };
    if (editId) await api.updateOrder(editId, data);
    else await api.createOrder(data);
    setOpen(false); setForm(emptyOrder); setEditId(null); load();
  };

  const handleEdit = (o) => {
    setForm({ client_name: o.client_name, items: o.items, total_amount: String(o.total_amount), total_qty: String(o.total_qty), status: o.status });
    setEditId(o.id); setOpen(true);
  };
  const handleDelete = async (id) => { await api.deleteOrder(id); load(); };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#1E3A5F", fontSize: { xs: 18, md: 24 } }}>Orders</Typography>
        <Button variant="contained" startIcon={<AddIcon />} size={isMobile ? "small" : "medium"}
          onClick={() => { setForm(emptyOrder); setEditId(null); setOpen(true); }}>
          Add Order
        </Button>
      </Stack>

      {orders.length === 0 && (
        <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
          <Typography sx={{ color: "#5A6F8A" }}>No orders yet</Typography>
        </Paper>
      )}

      {/* Mobile: Card list */}
      {isMobile && orders.length > 0 && (
        <Stack spacing={1.5}>
          {orders.map((o) => (
            <Paper key={o.id} sx={{ p: 2, borderRadius: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontWeight: 600, color: "#1E3A5F", fontSize: 15 }}>#{o.id} — {o.client_name}</Typography>
                  <Typography variant="body2" sx={{ color: "#5A6F8A", fontSize: 13, mt: 0.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {o.items}
                  </Typography>
                </Box>
                <Chip label={o.status} size="small" color={statusColors[o.status] || "default"} sx={{ ml: 1 }} />
              </Stack>
              <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#1E3A5F" }}>₹{Number(o.total_amount).toLocaleString("en-IN")}</Typography>
                <Typography variant="body2" sx={{ color: "#5A6F8A" }}>Qty: {o.total_qty}</Typography>
              </Stack>
              {o.created_at && (
                <Typography variant="caption" sx={{ color: "#9CA3AF", mt: 0.5, display: "block" }}>
                  {new Date(o.created_at).toLocaleDateString()}
                </Typography>
              )}
              <Stack direction="row" spacing={1} sx={{ mt: 1, justifyContent: "flex-end" }}>
                <IconButton size="small" onClick={() => handleEdit(o)}><EditIcon fontSize="small" /></IconButton>
                <IconButton size="small" color="error" onClick={() => handleDelete(o.id)}><DeleteIcon fontSize="small" /></IconButton>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      {/* Desktop: Table */}
      {!isMobile && orders.length > 0 && (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#f0f4f8" }}>
                <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Client</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Items</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Qty</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Amount (₹)</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id} hover>
                  <TableCell>#{o.id}</TableCell>
                  <TableCell>{o.client_name}</TableCell>
                  <TableCell sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.items}</TableCell>
                  <TableCell>{o.total_qty}</TableCell>
                  <TableCell>₹{Number(o.total_amount).toLocaleString("en-IN")}</TableCell>
                  <TableCell><Chip label={o.status} size="small" color={statusColors[o.status] || "default"} /></TableCell>
                  <TableCell>{o.created_at ? new Date(o.created_at).toLocaleDateString() : ""}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleEdit(o)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(o.id)}><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle sx={{ fontSize: { xs: 18, md: 20 } }}>{editId ? "Edit Order" : "Add Order"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Client Name" fullWidth value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} />
            <TextField label="Items Description" fullWidth multiline rows={2} value={form.items} onChange={(e) => setForm({ ...form, items: e.target.value })} placeholder="e.g. 100x Round Neck Cotton, 50x Polo" />
            <TextField label="Total Quantity" fullWidth type="number" value={form.total_qty} onChange={(e) => setForm({ ...form, total_qty: e.target.value })} />
            <TextField label="Total Amount (₹)" fullWidth type="number" value={form.total_amount} onChange={(e) => setForm({ ...form, total_amount: e.target.value })} />
            <TextField label="Status" select fullWidth value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {statuses.map((s) => <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>)}
            </TextField>
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

export default Orders;
