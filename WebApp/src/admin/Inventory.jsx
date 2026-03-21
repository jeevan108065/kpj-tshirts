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

const emptyProduct = { name: "", category: "", hsn_code: "", unit: "Pcs", price: "", stock: "" };

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyProduct);
  const [editId, setEditId] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const load = async () => {
    api.getProducts().then(setItems).catch(() => {});
    api.getCategories().then(setCategories).catch(() => {});
  };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    const data = { ...form, price: Number.parseFloat(form.price) || 0, stock: Number.parseInt(form.stock) || 0 };
    if (editId) await api.updateProduct(editId, data);
    else await api.createProduct(data);
    setOpen(false); setForm(emptyProduct); setEditId(null); load();
  };

  const handleEdit = (p) => {
    setForm({ name: p.name, category: p.category, hsn_code: p.hsn_code, unit: p.unit, price: String(p.price), stock: String(p.stock) });
    setEditId(p.id); setOpen(true);
  };
  const handleDelete = async (id) => { await api.deleteProduct(id); load(); };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#1E3A5F", fontSize: { xs: 16, md: 24 } }}>Inventory</Typography>
        <Button variant="contained" startIcon={<AddIcon />} size={isMobile ? "small" : "medium"}
          onClick={() => { setForm(emptyProduct); setEditId(null); setOpen(true); }}>
          Add Product
        </Button>
      </Stack>

      {items.length === 0 && (
        <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
          <Typography sx={{ color: "#5A6F8A" }}>No products in inventory</Typography>
        </Paper>
      )}

      {/* Mobile: Card list */}
      {isMobile && items.length > 0 && (
        <Stack spacing={1.5}>
          {items.map((p) => (
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

      {/* Desktop: Table */}
      {!isMobile && items.length > 0 && (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#f0f4f8" }}>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>HSN Code</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Unit</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Price (₹)</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Stock</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.category}</TableCell>
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
          <Button variant="contained" onClick={handleSave}>{editId ? "Update" : "Add"}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Inventory;
