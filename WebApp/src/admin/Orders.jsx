import React, { useEffect, useState, useCallback } from "react";
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, IconButton, Stack, Chip, useMediaQuery, useTheme,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import * as api from "../db/api";
import { useToast } from "./ToastContext";
import Pagination from "./Pagination";

const statusColors = { pending: "warning", processing: "info", delivered: "success", cancelled: "error" };
const statuses = ["pending", "processing", "delivered", "cancelled"];
const todayStr = () => new Date().toISOString().slice(0, 10);
const emptyOrder = { client_name: "", items: "", total_amount: "", total_qty: "", status: "pending", delivered_at: todayStr() };

const Orders = () => {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyOrder);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterClient, setFilterClient] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const toast = useToast();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getOrders({ page, limit, search: filterClient || undefined, status: filterStatus || undefined, date_from: filterDateFrom || undefined, date_to: filterDateTo || undefined });
      setRows(res.rows || []); setTotal(res.total || 0);
    } catch (err) { toast(err.message); }
    finally { setLoading(false); }
  }, [page, limit, filterClient, filterStatus, filterDateFrom, filterDateTo]);
  useEffect(() => { load(); }, [load]);

  const totalSum = rows.reduce((s, o) => s + Number(o.total_amount || 0), 0);

  const handleSave = async () => {
    try {
      setSaving(true);
      const data = { ...form, total_amount: Number.parseFloat(form.total_amount) || 0, total_qty: Number.parseInt(form.total_qty) || 0 };
      if (editId) await api.updateOrder(editId, data);
      else await api.createOrder(data);
      setOpen(false); setForm(emptyOrder); setEditId(null);
      toast("Order saved", "success"); load();
    } catch (err) { toast(err.message); }
    finally { setSaving(false); }
  };

  const handleEdit = (o) => {
    setForm({ client_name: o.client_name, items: o.items, total_amount: String(o.total_amount), total_qty: String(o.total_qty), status: o.status, delivered_at: o.delivered_at ? o.delivered_at.slice(0, 10) : todayStr() });
    setEditId(o.id); setOpen(true);
  };
  const handleDelete = async (id) => {
    try { await api.deleteOrder(id); toast("Order deleted", "success"); load(); }
    catch (err) { toast(err.message); }
  };
  const applyFilter = () => { setPage(1); };
  const clearFilters = () => { setFilterStatus(""); setFilterClient(""); setFilterDateFrom(""); setFilterDateTo(""); setPage(1); };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }} flexWrap="wrap" gap={1}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#1E3A5F", fontSize: { xs: 18, md: 24 } }}>Orders</Typography>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Typography variant="body2" sx={{ color: "#5A6F8A", fontSize: { xs: 12, md: 14 }, whiteSpace: "nowrap" }}>
            {total} orders · ₹{totalSum.toLocaleString("en-IN")}
          </Typography>
          <IconButton size="small" onClick={() => setShowFilters((v) => !v)} color={showFilters ? "primary" : "default"}>
            <FilterListIcon fontSize="small" />
          </IconButton>
          <Button variant="contained" startIcon={<AddIcon />} size={isMobile ? "small" : "medium"}
            onClick={() => { setForm(emptyOrder); setEditId(null); setOpen(true); }}>
            Add Order
          </Button>
        </Stack>
      </Stack>

      {showFilters && (
        <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }}>
            <TextField label="Client" size="small" value={filterClient} onChange={(e) => setFilterClient(e.target.value)} onKeyDown={(e) => e.key === "Enter" && applyFilter()} sx={{ minWidth: 150 }} />
            <TextField label="Status" select size="small" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} sx={{ minWidth: 130 }}>
              <MenuItem value="">All</MenuItem>
              {statuses.map((s) => <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>)}
            </TextField>
            <TextField label="From" type="date" size="small" value={filterDateFrom} onChange={(e) => { setFilterDateFrom(e.target.value); setPage(1); }} slotProps={{ inputLabel: { shrink: true } }} sx={{ minWidth: 140 }} />
            <TextField label="To" type="date" size="small" value={filterDateTo} onChange={(e) => { setFilterDateTo(e.target.value); setPage(1); }} slotProps={{ inputLabel: { shrink: true } }} sx={{ minWidth: 140 }} />
            <Button size="small" variant="outlined" onClick={applyFilter}>Search</Button>
            <Button size="small" onClick={clearFilters}>Clear</Button>
          </Stack>
        </Paper>
      )}

      {loading && <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress /></Box>}

      {!loading && rows.length === 0 && (
        <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
          <Typography sx={{ color: "#5A6F8A" }}>No orders found</Typography>
        </Paper>
      )}

      {!loading && isMobile && rows.length > 0 && (
        <Stack spacing={1.5}>
          {rows.map((o) => (
            <Paper key={o.id} sx={{ p: 2, borderRadius: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontWeight: 600, color: "#1E3A5F", fontSize: 15 }}>#{o.id} — {o.client_name}</Typography>
                  <Typography variant="body2" sx={{ color: "#5A6F8A", fontSize: 13, mt: 0.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.items}</Typography>
                </Box>
                <Chip label={o.status} size="small" color={statusColors[o.status] || "default"} sx={{ ml: 1 }} />
              </Stack>
              <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#1E3A5F" }}>₹{Number(o.total_amount).toLocaleString("en-IN")}</Typography>
                <Typography variant="body2" sx={{ color: "#5A6F8A" }}>Qty: {o.total_qty}</Typography>
              </Stack>
              {(o.delivered_at || o.created_at) && (
                <Typography variant="caption" sx={{ color: "#9CA3AF", mt: 0.5, display: "block" }}>{new Date(o.delivered_at || o.created_at).toLocaleDateString()}</Typography>
              )}
              <Stack direction="row" spacing={1} sx={{ mt: 1, justifyContent: "flex-end" }}>
                <IconButton size="small" onClick={() => handleEdit(o)}><EditIcon fontSize="small" /></IconButton>
                <IconButton size="small" color="error" onClick={() => handleDelete(o.id)}><DeleteIcon fontSize="small" /></IconButton>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      {!loading && !isMobile && rows.length > 0 && (
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
              {rows.map((o) => (
                <TableRow key={o.id} hover>
                  <TableCell>#{o.id}</TableCell>
                  <TableCell>{o.client_name}</TableCell>
                  <TableCell sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{o.items}</TableCell>
                  <TableCell>{o.total_qty}</TableCell>
                  <TableCell>₹{Number(o.total_amount).toLocaleString("en-IN")}</TableCell>
                  <TableCell><Chip label={o.status} size="small" color={statusColors[o.status] || "default"} /></TableCell>
                  <TableCell>{(o.delivered_at || o.created_at) ? new Date(o.delivered_at || o.created_at).toLocaleDateString() : ""}</TableCell>
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

      {!loading && <Pagination page={page} total={total} limit={limit} onPageChange={setPage} onLimitChange={(l) => { setLimit(l); setPage(1); }} />}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle sx={{ fontSize: { xs: 18, md: 20 } }}>{editId ? "Edit Order" : "Add Order"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Client Name" fullWidth value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} />
            <TextField label="Items Description" fullWidth multiline rows={2} value={form.items} onChange={(e) => setForm({ ...form, items: e.target.value })} placeholder="e.g. 100x Round Neck Cotton, 50x Polo" />
            <TextField label="Total Quantity" fullWidth type="number" value={form.total_qty} onChange={(e) => setForm({ ...form, total_qty: e.target.value })} />
            <TextField label="Total Amount (₹)" fullWidth type="number" value={form.total_amount} onChange={(e) => setForm({ ...form, total_amount: e.target.value })} />
            <TextField label="Order Date" fullWidth type="date" value={form.delivered_at} onChange={(e) => setForm({ ...form, delivered_at: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} />
            <TextField label="Status" select fullWidth value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {statuses.map((s) => <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>)}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : editId ? "Update" : "Add"}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Orders;
