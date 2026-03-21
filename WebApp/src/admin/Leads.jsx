import React, { useEffect, useState, useCallback } from "react";
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, IconButton, Chip, Stack, useMediaQuery, useTheme,
  CircularProgress, Tooltip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import DirectionsIcon from "@mui/icons-material/Directions";
import * as api from "../db/api";
import { useToast } from "./ToastContext";
import Pagination from "./Pagination";

const statusColors = { new: "info", contacted: "warning", qualified: "success", converted: "secondary", lost: "error" };
const statuses = ["new", "contacted", "qualified", "converted", "lost"];
const sources = ["website", "inperson", "marketing agency", "others"];
const emptyLead = { name: "", phone: "", email: "", product: "", quantity: "", status: "new", source: "website", latitude: "", longitude: "", comments: "" };

const Leads = () => {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyLead);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterSearch, setFilterSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [locating, setLocating] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const toast = useToast();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getLeads({ page, limit, search: filterSearch || undefined, status: filterStatus || undefined });
      setRows(res.rows); setTotal(res.total);
    } catch (err) { toast(err.message); }
    finally { setLoading(false); }
  }, [page, limit, filterSearch, filterStatus]);
  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload = {
        ...form,
        latitude: form.latitude !== "" ? parseFloat(form.latitude) : null,
        longitude: form.longitude !== "" ? parseFloat(form.longitude) : null,
      };
      if (editId) await api.updateLead(editId, payload);
      else await api.createLead(payload);
      setOpen(false); setForm(emptyLead); setEditId(null);
      toast("Lead saved", "success"); load();
    } catch (err) { toast(err.message); }
    finally { setSaving(false); }
  };

  const handleEdit = (l) => {
    setForm({
      name: l.name, phone: l.phone, email: l.email, product: l.product,
      quantity: l.quantity, status: l.status, source: l.source || "website",
      latitude: l.latitude ?? "", longitude: l.longitude ?? "", comments: l.comments || "",
    });
    setEditId(l.id); setOpen(true);
  };

  const handleDelete = async (id) => {
    try { await api.deleteLead(id); toast("Lead deleted", "success"); load(); }
    catch (err) { toast(err.message); }
  };

  const captureLocation = () => {
    if (!navigator.geolocation) { toast("Geolocation not supported by your browser"); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({ ...f, latitude: pos.coords.latitude.toFixed(6), longitude: pos.coords.longitude.toFixed(6) }));
        setLocating(false);
        toast("Location captured", "success");
      },
      (err) => { setLocating(false); toast("Could not get location: " + err.message); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const openDirections = (lat, lng) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
  };

  const hasLocation = (l) => l.latitude != null && l.longitude != null;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#1E3A5F", fontSize: { xs: 18, md: 24 } }}>Leads</Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton size="small" onClick={() => setShowFilters((v) => !v)} color={showFilters ? "primary" : "default"}><FilterListIcon fontSize="small" /></IconButton>
          <Button variant="contained" startIcon={<AddIcon />} size={isMobile ? "small" : "medium"}
            onClick={() => { setForm(emptyLead); setEditId(null); setOpen(true); }}>Add Lead</Button>
        </Stack>
      </Stack>

      {showFilters && (
        <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }}>
            <TextField label="Name" size="small" value={filterSearch} onChange={(e) => setFilterSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && setPage(1)} sx={{ minWidth: 150 }} />
            <TextField label="Status" select size="small" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} sx={{ minWidth: 130 }}>
              <MenuItem value="">All</MenuItem>
              {statuses.map((s) => <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>)}
            </TextField>
            <Button size="small" variant="outlined" onClick={() => setPage(1)}>Search</Button>
            <Button size="small" onClick={() => { setFilterSearch(""); setFilterStatus(""); setPage(1); }}>Clear</Button>
          </Stack>
        </Paper>
      )}

      {loading && <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress /></Box>}
      {!loading && rows.length === 0 && <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}><Typography sx={{ color: "#5A6F8A" }}>No leads found</Typography></Paper>}

      {/* Mobile cards */}
      {!loading && isMobile && rows.length > 0 && (
        <Stack spacing={1.5}>
          {rows.map((l) => (
            <Paper key={l.id} sx={{ p: 2, borderRadius: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ fontWeight: 600, color: "#1E3A5F", fontSize: 15 }}>{l.name}</Typography>
                  <Typography variant="body2" sx={{ color: "#5A6F8A", fontSize: 13 }}>{l.phone}</Typography>
                </Box>
                <Chip label={l.status} size="small" color={statusColors[l.status] || "default"} />
              </Stack>
              <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap", gap: 0.5 }}>
                {l.product && <Chip label={l.product} size="small" variant="outlined" sx={{ fontSize: 11 }} />}
                {l.quantity && <Chip label={`Qty: ${l.quantity}`} size="small" variant="outlined" sx={{ fontSize: 11 }} />}
                {l.source && <Chip label={l.source} size="small" variant="outlined" sx={{ fontSize: 11 }} />}
              </Stack>
              {l.comments && <Typography variant="body2" sx={{ color: "#5A6F8A", fontSize: 12, mt: 0.5 }}>{l.comments}</Typography>}
              {l.created_at && <Typography variant="caption" sx={{ color: "#9CA3AF", mt: 0.5, display: "block" }}>{new Date(l.created_at).toLocaleDateString()}</Typography>}
              <Stack direction="row" spacing={1} sx={{ mt: 1, justifyContent: "flex-end" }}>
                {hasLocation(l) && (
                  <Tooltip title="Get directions">
                    <IconButton size="small" color="primary" onClick={() => openDirections(l.latitude, l.longitude)}><DirectionsIcon fontSize="small" /></IconButton>
                  </Tooltip>
                )}
                <IconButton size="small" onClick={() => handleEdit(l)}><EditIcon fontSize="small" /></IconButton>
                <IconButton size="small" color="error" onClick={() => handleDelete(l.id)}><DeleteIcon fontSize="small" /></IconButton>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      {/* Desktop table */}
      {!loading && !isMobile && rows.length > 0 && (
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table size="small">
            <TableHead><TableRow sx={{ bgcolor: "#f0f4f8" }}>
              <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Phone</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Qty</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Source</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Location</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Comments</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {rows.map((l) => (
                <TableRow key={l.id} hover>
                  <TableCell>{l.name}</TableCell>
                  <TableCell>{l.phone}</TableCell>
                  <TableCell>{l.product}</TableCell>
                  <TableCell>{l.quantity}</TableCell>
                  <TableCell><Chip label={l.source || "website"} size="small" variant="outlined" /></TableCell>
                  <TableCell><Chip label={l.status} size="small" color={statusColors[l.status] || "default"} /></TableCell>
                  <TableCell>
                    {hasLocation(l) ? (
                      <Tooltip title={`${l.latitude}, ${l.longitude}`}>
                        <IconButton size="small" color="primary" onClick={() => openDirections(l.latitude, l.longitude)}>
                          <DirectionsIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Typography variant="caption" sx={{ color: "#9CA3AF" }}>—</Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    <Tooltip title={l.comments || ""}><span>{l.comments || "—"}</span></Tooltip>
                  </TableCell>
                  <TableCell>{l.created_at ? new Date(l.created_at).toLocaleDateString() : ""}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => handleEdit(l)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(l.id)}><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {!loading && <Pagination page={page} total={total} limit={limit} onPageChange={setPage} onLimitChange={(l) => { setLimit(l); setPage(1); }} />}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle sx={{ fontSize: { xs: 18, md: 20 } }}>{editId ? "Edit Lead" : "Add Lead"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" fullWidth value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextField label="Phone" fullWidth value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <TextField label="Email" fullWidth value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <TextField label="Product Interest" fullWidth value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} />
            <TextField label="Quantity" fullWidth value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            <TextField label="Status" select fullWidth value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {statuses.map((s) => <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>)}
            </TextField>
            <TextField label="Source" select fullWidth value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
              {sources.map((s) => <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>)}
            </TextField>
            <TextField label="Comments" fullWidth multiline minRows={2} maxRows={4} value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} />

            {/* Location section */}
            <Typography variant="subtitle2" sx={{ color: "#1E3A5F", fontWeight: 600, mt: 1 }}>Location</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField label="Latitude" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                type="number" sx={{ flex: 1 }} inputProps={{ step: "any" }} />
              <TextField label="Longitude" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                type="number" sx={{ flex: 1 }} inputProps={{ step: "any" }} />
            </Stack>
            <Button variant="outlined" startIcon={locating ? <CircularProgress size={16} /> : <MyLocationIcon />}
              onClick={captureLocation} disabled={locating} size="small" sx={{ alignSelf: "flex-start" }}>
              {locating ? "Getting location…" : "Use Current Location"}
            </Button>
            {form.latitude && form.longitude && (
              <Button variant="text" size="small" startIcon={<DirectionsIcon />} sx={{ alignSelf: "flex-start" }}
                onClick={() => openDirections(form.latitude, form.longitude)}>
                Open in Google Maps
              </Button>
            )}
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

export default Leads;
