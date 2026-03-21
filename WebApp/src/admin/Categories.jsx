import React, { useEffect, useState } from "react";
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, IconButton, Stack, Chip, useMediaQuery, useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SubdirectoryArrowRightIcon from "@mui/icons-material/SubdirectoryArrowRight";
import * as api from "../db/api";

const emptyCategory = { name: "", description: "", parent_id: "" };

const Categories = () => {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyCategory);
  const [editId, setEditId] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const load = () => api.getCategories().then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);

  const parents = items.filter((c) => !c.parent_id);

  const handleSave = async () => {
    const data = { ...form, parent_id: form.parent_id || null };
    if (editId) await api.updateCategory(editId, data);
    else await api.createCategory(data);
    setOpen(false); setForm(emptyCategory); setEditId(null); load();
  };

  const handleEdit = (c) => {
    setForm({ name: c.name, description: c.description || "", parent_id: c.parent_id || "" });
    setEditId(c.id); setOpen(true);
  };
  const handleDelete = async (id) => { await api.deleteCategory(id); load(); };

  // Build tree
  const tree = [];
  for (const p of parents) {
    tree.push({ ...p, level: 0 });
    for (const c of items.filter((x) => x.parent_id === p.id)) {
      tree.push({ ...c, level: 1 });
    }
  }
  const orphans = items.filter((c) => c.parent_id && !parents.find((p) => p.id === c.parent_id));
  for (const o of orphans) tree.push({ ...o, level: 1 });

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#1E3A5F", fontSize: { xs: 16, md: 24 } }}>Categories</Typography>
        <Button variant="contained" startIcon={<AddIcon />} size={isMobile ? "small" : "medium"}
          onClick={() => { setForm(emptyCategory); setEditId(null); setOpen(true); }}>
          Add
        </Button>
      </Stack>

      {tree.length === 0 && (
        <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
          <Typography sx={{ color: "#5A6F8A" }}>No categories</Typography>
        </Paper>
      )}

      {/* Mobile: Card list */}
      {isMobile && tree.length > 0 && (
        <Stack spacing={1}>
          {tree.map((c) => (
            <Paper key={c.id} sx={{ p: 2, borderRadius: 2, ml: c.level * 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 0, flex: 1 }}>
                  {c.level > 0 && <SubdirectoryArrowRightIcon sx={{ fontSize: 16, color: "#9CA3AF" }} />}
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600, color: "#1E3A5F", fontSize: 15 }}>{c.name}</Typography>
                    {c.description && <Typography variant="body2" sx={{ color: "#5A6F8A", fontSize: 12 }}>{c.description}</Typography>}
                  </Box>
                </Box>
                <Stack direction="row" spacing={0.5}>
                  <IconButton size="small" onClick={() => handleEdit(c)}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(c.id)}><DeleteIcon fontSize="small" /></IconButton>
                </Stack>
              </Stack>
              {c.parent_id && (
                <Chip label={parents.find((p) => p.id === c.parent_id)?.name || "—"} size="small" variant="outlined" sx={{ mt: 0.5, fontSize: 11 }} />
              )}
            </Paper>
          ))}
        </Stack>
      )}

      {/* Desktop: Table */}
      {!isMobile && tree.length > 0 && (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#f0f4f8" }}>
                <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Parent</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tree.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", pl: c.level * 3 }}>
                      {c.level > 0 && <SubdirectoryArrowRightIcon sx={{ fontSize: 16, color: "#9CA3AF", mr: 0.5 }} />}
                      {c.name}
                    </Box>
                  </TableCell>
                  <TableCell>{c.parent_id ? <Chip label={parents.find((p) => p.id === c.parent_id)?.name || "—"} size="small" variant="outlined" /> : "—"}</TableCell>
                  <TableCell>{c.description}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleEdit(c)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(c.id)}><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle sx={{ fontSize: { xs: 18, md: 20 } }}>{editId ? "Edit Category" : "Add Category"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Category Name" fullWidth value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextField label="Parent Category" select fullWidth value={form.parent_id} onChange={(e) => setForm({ ...form, parent_id: e.target.value })}>
              <MenuItem value="">None (Top-level)</MenuItem>
              {parents.filter((p) => p.id !== editId).map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
            </TextField>
            <TextField label="Description" fullWidth multiline rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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

export default Categories;
