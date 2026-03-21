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

const emptyProduct = { name: "", category: "", hsn_code: "", unit: "Pcs", price: "", stock: "" };

const Inventory = () => {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyProduct);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterSearch, setFilterSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const toast = useToast();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [res, cats] = await Promise.all([
        api.getProducts({ page, limit, search: filterSearch || undefined, category: filterCategory || undefined }),
        api.getCategories({ limit: 100 }),
      ]);
      setRows(res.rows); setTotal(res.total); setCategories(cats.rows || cats);
    } catch (err) { toast(err.message); }
    finally { setLoading(false); }
  }, [page, limit, filterSearch, filterCategory]);
  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const data = { ...form, price: Number.parseFloat(form.price) || 0, stock: Number.parseInt(form.stock) || 0 };
      if (editId) await api.updateProduct(editId, data);
      else await api.createProduct(data);
      setOpen(false); setForm(emptyProduct); setEditId(null);
      toast("Product saved", "success"); load();
    } catch (err) { toast(err.message); }
    finally { setSaving(false); }
  };
  const handleEdit = (p) => {
    setForm({ name: p.name, category: p.category, hsn_code: p.hsn_code, unit: p.unit, price: String(p.price), stock: String(p.stock) });
    setEditId(p.id); setOpen(true);
  };
  const handleDelete = async (id) => {
    try { await api.deleteProduct(id); toast("Product deleted", "success"); load(); }
    catch (err) { toast(err.message); }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#1E3A5F", fontSize: { xs: 16, md: 24 } }}>Inventory</Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton size="small" onClick={() => setShowFilters((v) => !v)} color={showFilters ? "primary" : "default"}><FilterListIcon fontSize="small" /></IconButton>
          <Button variant="contained" startIcon={<AddIcon />} size={isMobile ? "small" : "medium"}
            onClick={() => { setForm(emptyProduct); setEditId(null); setOpen(true); }}>Add Product</Button>
        </Stack>
      </Stack>

      {showFilters && (
        <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }}>
            <TextField label="Name" size="small" value={filterSearch} onChange={(e) => setFilterSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && setPage(1)} sx={{ minWidth: 150 }} />
            <TextField label="Category" select size="small" value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }} sx={{ minWidth: 150 }}>
              <MenuItem value="">All</MenuItem>
              {categories.map((c) => <MenuItem key={c.id} value={c.name}>{c.name}</MenuItem>)}
            </TextField>
            <Button size="small" variant="outlined" onClick={() => setPage(1)}>Search</Button>
            <Button size="small" onClick={() => { setFilterSearch(""); setFilterCategory(""); setPage(1); }}>Clear</Button>
          </Stack>
        </Paper>
      )}

      {loading && <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress /></Box>}
      {!loading && rows.length === 0 && <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}><Typography sx={{ color: "#5A6F8A" }}>No products found</Typography></Paper>}

      {!loading && isMobile && rows.length > 0 && (
        <Stack spacing={1.5}>
          {rows.map((p) => (
            <Paper key={p.id} sx={{ p: 2, borderRadius: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontWeight: 600, color: "#1E3A5F", fontSize: 15 }}>{p.name}</Typography>
                  <Typography variant="body2" sx={{ color: "#5A6F8A", fontSize: 13 }}>{p.category}</Typography>
                </Box>
                <Chip label={p.stock > 0 ? `Stock: ${p.stock}` : "Out"} size="small" color={p.stock > 0 ? "success" : "error"} />
              </Stack>
              <Stack direction="row" spacing={1.5} sx={{ mt: 1, flexWrap: "wrap" }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: "#1E3A5F" }}>₹{Number(p.price).toLocaleString("en-IN")}/{p.unit}</Typography>
                {p.hsn_code && <Chip label={`HSN: ${p.hsn_code}`} size="small" variant="outlined" sx={{ fontSize: 11 }} />}
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mt: 1, justifyContent: "flex-end" }}>
                <IconButton size="small" onClick={() => handleEdit(p)}><EditIcon fontSize="small" /></IconButton>
                <IconButton size="small" color="error" onClick={() => handleDelete(p.id)}><DeleteIcon fontSize="small" /></IconButton>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      {!loading && !isMobile && rows.length > 0 && (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead><TableRow sx={{ bgcolor: "#f0f4f8" }}>
              <TableCell sx={{ fontWeight: 700 }}>Name</TableCell><TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>HSN Code</TableCell><TableCell sx={{ fontWeight: 700 }}>Unit</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Price (₹)</TableCell><TableCell sx={{ fontWeight: 700 }}>Stock</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {rows.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>{p.name}</TableCell><TableCell>{p.category}</TableCell>
                  <TableCell><Chip label={p.hsn_code || "—"} size="small" variant="outlined" /></TableCell>
                  <TableCell>{p.unit}</TableCell>
                  <TableCell>₹{Number(p.price).toLocaleString("en-IN")}</TableCell>
                  <TableCell><Chip label={p.stock} size="small" color={p.stock > 0 ? "success" : "error"} /></TableCell>
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

      {!loading && <Pagination page={page} total={total} limit={limit} onPageChange={setPage} onLimitChange={(l) => { setLimit(l); setPage(1); }} />}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle sx={{ fontSize: { xs: 18, md: 20 } }}>{editId ? "Edit Product" : "Add Product"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Product Name" fullWidth value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextField label="Category" select fullWidth value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {categories.map((c) => <MenuItem key={c.id} value={c.name}>{c.name}</MenuItem>)}
            </TextField>
            <TextField label="HSN/SAC Code" fullWidth value={form.hsn_code} onChange={(e) => setForm({ ...form, hsn_code: e.target.value })} placeholder="e.g. 6109" />
            <TextField label="Unit" select fullWidth value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
              {["Pcs", "Set", "Dozen", "Kg", "Meter"].map((u) => <MenuItem key={u} value={u}>{u}</MenuItem>)}
            </TextField>
            <TextField label="Price per unit (₹)" fullWidth type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <TextField label="Stock Quantity" fullWidth type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
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

export default Inventory;
