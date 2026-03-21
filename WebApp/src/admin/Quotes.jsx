import React, { useEffect, useState, useCallback } from "react";
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, IconButton, Stack, Chip, Grid, Divider, Tabs, Tab,
  Checkbox, FormControlLabel, useMediaQuery, useTheme, CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import PrintIcon from "@mui/icons-material/Print";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import FilterListIcon from "@mui/icons-material/FilterList";
import * as api from "../db/api";
import { useToast } from "./ToastContext";
import Pagination from "./Pagination";

const COMPANY = {
  name: "KPJ Garments",
  gstin: "37HMJPP2436M1ZD",
  address: "IT Sez Rushikonda, Visakhapatnam, Andhra Pradesh, PIN 530045",
  phone: "+91 80741 75884 / 85559 09245",
  email: "support@kpj.app",
  state: "Andhra Pradesh (37)",
};

const statusColors = { draft: "default", sent: "info", accepted: "success", rejected: "error" };
const emptyItem = { description: "", hsnCode: "", qty: "", unit: "Pcs", price: "", amount: 0 };
const emptyForm = {
  quote_type: "tax_invoice", billing_name: "", billing_address: "", billing_gstin: "",
  billing_phone: "", billing_email: "", shipping_name: "", shipping_address: "", shipping_phone: "",
  same_as_billing: true, items: [{ ...emptyItem }], payment_method_id: "",
  cgst_rate: 0, sgst_rate: 0, discount: 0, status: "draft",
};
const tabTypes = ["tax_invoice", "sample_quotation"];

const Quotes = () => {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [products, setProducts] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [viewQuote, setViewQuote] = useState(null);
  const [tab, setTab] = useState(0);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filterSearch, setFilterSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const toast = useToast();

  const loadQuotes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getQuotes({ page, limit, search: filterSearch || undefined, status: filterStatus || undefined, type: tabTypes[tab] });
      setRows(res.rows || []); setTotal(res.total || 0);
    } catch (err) { toast(err.message); }
    finally { setLoading(false); }
  }, [page, limit, filterSearch, filterStatus, tab]);

  const loadDropdowns = async () => {
    try {
      const [p, pm] = await Promise.all([api.getProducts({ limit: 200 }), api.getPaymentMethods({ limit: 100 })]);
      setProducts(p.rows || p); setPaymentMethods(pm.rows || pm);
    } catch (err) { toast(err.message); }
  };

  useEffect(() => { loadDropdowns(); }, []);
  useEffect(() => { loadQuotes(); }, [loadQuotes]);

  const handleTabChange = (_, v) => { setTab(v); setPage(1); };

  const openNew = async (type = "tax_invoice") => {
    setEditId(null);
    try {
      const { quoteNumber } = await api.getNextQuoteNumber(type);
      setForm({ ...emptyForm, quote_type: type, quote_number: quoteNumber, items: [{ ...emptyItem }] });
      setOpen(true);
    } catch (err) {
      toast(err.message);
      setForm({ ...emptyForm, quote_type: type, items: [{ ...emptyItem }] }); setOpen(true);
    }
  };

  const handleEdit = (q) => {
    const items = (Array.isArray(q.items) ? q.items : []).map((i) => ({
      ...i, amount: (Number.parseFloat(i.qty) || 0) * (Number.parseFloat(i.price) || 0),
    }));
    const sameShipping = (!q.shipping_name || q.shipping_name === q.billing_name) &&
      (!q.shipping_address || q.shipping_address === q.billing_address);
    setForm({
      quote_type: q.quote_type || "tax_invoice", quote_number: q.quote_number,
      billing_name: q.billing_name || "", billing_address: q.billing_address || "",
      billing_gstin: q.billing_gstin || "", billing_phone: q.billing_phone || "",
      billing_email: q.billing_email || "",
      shipping_name: q.shipping_name || "", shipping_address: q.shipping_address || "",
      shipping_phone: q.shipping_phone || "", same_as_billing: sameShipping,
      items: items.length ? items : [{ ...emptyItem }],
      payment_method_id: q.payment_method_id || "",
      cgst_rate: q.cgst_rate || 0, sgst_rate: q.sgst_rate || 0,
      discount: q.discount || 0, status: q.status || "draft",
    });
    setEditId(q.id);
    setOpen(true);
  };

  const updateItem = (idx, field, value) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [field]: value };
    if (field === "qty" || field === "price") {
      items[idx].amount = (Number.parseFloat(items[idx].qty) || 0) * (Number.parseFloat(items[idx].price) || 0);
    }
    setForm({ ...form, items });
  };

  const selectProduct = (idx, productId) => {
    const p = products.find((pr) => pr.id === Number.parseInt(productId));
    if (!p) return;
    const items = [...form.items];
    items[idx] = { ...items[idx], description: p.name, hsnCode: p.hsn_code || "", unit: p.unit || "Pcs", price: String(p.price || "") };
    items[idx].amount = (Number.parseFloat(items[idx].qty) || 0) * (Number.parseFloat(items[idx].price) || 0);
    setForm({ ...form, items });
  };

  const addItem = () => setForm({ ...form, items: [...form.items, { ...emptyItem }] });
  const removeItem = (idx) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) });

  const calcTotals = () => {
    const subtotal = form.items.reduce((s, i) => s + (i.amount || 0), 0);
    const totalQty = form.items.reduce((s, i) => s + (Number.parseFloat(i.qty) || 0), 0);
    const cgstAmt = subtotal * (Number.parseFloat(form.cgst_rate) || 0) / 100;
    const sgstAmt = subtotal * (Number.parseFloat(form.sgst_rate) || 0) / 100;
    const disc = Number.parseFloat(form.discount) || 0;
    return { subtotal, totalQty, cgstAmt, sgstAmt, grandTotal: subtotal + cgstAmt + sgstAmt - disc };
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { subtotal, totalQty, cgstAmt, sgstAmt, grandTotal } = calcTotals();
      const data = {
        ...form, subtotal, total_qty: totalQty,
        cgst_rate: Number.parseFloat(form.cgst_rate) || 0, sgst_rate: Number.parseFloat(form.sgst_rate) || 0,
        cgst_amount: cgstAmt, sgst_amount: sgstAmt,
        discount: Number.parseFloat(form.discount) || 0, grand_total: grandTotal,
        payment_method_id: form.payment_method_id || null,
      };
      if (form.same_as_billing) {
        data.shipping_name = data.billing_name;
        data.shipping_address = data.billing_address;
        data.shipping_phone = data.billing_phone;
      }
      if (editId) await api.updateQuote(editId, data);
      else await api.createQuote(data);
      setOpen(false); setEditId(null);
      toast("Saved", "success"); loadQuotes();
    } catch (err) { toast(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    try { await api.deleteQuote(id); toast("Deleted", "success"); loadQuotes(); }
    catch (err) { toast(err.message); }
  };
  const handleView = (q) => { setViewQuote(q); setViewOpen(true); };
  const handlePrint = (q) => { setViewQuote(q); setViewOpen(true); setTimeout(() => globalThis.print(), 500); };

  const handleConvert = async (q) => {
    if (!globalThis.confirm("Convert this sample quotation to a Tax Invoice?")) return;
    try {
      await api.convertQuote(q.id, {
        billing_name: q.billing_name, billing_address: q.billing_address,
        billing_gstin: q.billing_gstin, billing_phone: q.billing_phone, billing_email: q.billing_email,
        shipping_name: q.shipping_name, shipping_address: q.shipping_address, shipping_phone: q.shipping_phone,
        items: q.items, payment_method_id: q.payment_method_id,
        subtotal: q.subtotal, cgst_rate: q.cgst_rate, sgst_rate: q.sgst_rate,
        cgst_amount: q.cgst_amount, sgst_amount: q.sgst_amount,
        discount: q.discount, grand_total: q.grand_total, total_qty: q.total_qty, status: "draft",
      });
      toast("Converted to Tax Invoice", "success"); loadQuotes();
    } catch (err) { toast(err.message); }
  };

  const { subtotal, totalQty, cgstAmt, sgstAmt, grandTotal } = calcTotals();
  const clearFilters = () => { setFilterSearch(""); setFilterStatus(""); setPage(1); };

  const renderMobileList = (list) => (
    <Stack spacing={1.5}>
      {list.length === 0 && (
        <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
          <Typography sx={{ color: "#5A6F8A" }}>No records found</Typography>
        </Paper>
      )}
      {list.map((q) => (
        <Paper key={q.id} sx={{ p: 2, borderRadius: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ fontWeight: 600, color: "#1E3A5F", fontSize: 14 }}>{q.quote_number}</Typography>
              <Typography variant="body2" sx={{ color: "#5A6F8A", fontSize: 13 }}>{q.billing_name}</Typography>
            </Box>
            <Chip label={q.status} size="small" color={statusColors[q.status] || "default"} />
          </Stack>
          <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#1E3A5F" }}>
              ₹{Number(q.grand_total).toLocaleString("en-IN")}
            </Typography>
            <Typography variant="body2" sx={{ color: "#5A6F8A" }}>
              {Array.isArray(q.items) ? q.items.length : 0} items
            </Typography>
          </Stack>
          {q.created_at && (
            <Typography variant="caption" sx={{ color: "#9CA3AF", mt: 0.5, display: "block" }}>
              {new Date(q.created_at).toLocaleDateString()}
            </Typography>
          )}
          <Stack direction="row" spacing={0.5} sx={{ mt: 1, justifyContent: "flex-end", flexWrap: "wrap" }}>
            <IconButton size="small" onClick={() => handleView(q)}><VisibilityIcon fontSize="small" /></IconButton>
            <IconButton size="small" onClick={() => handleEdit(q)}><EditIcon fontSize="small" /></IconButton>
            <IconButton size="small" onClick={() => handlePrint(q)}><PrintIcon fontSize="small" /></IconButton>
            {q.quote_type !== "tax_invoice" && (
              <IconButton size="small" color="primary" onClick={() => handleConvert(q)}><ReceiptLongIcon fontSize="small" /></IconButton>
            )}
            <IconButton size="small" color="error" onClick={() => handleDelete(q.id)}><DeleteIcon fontSize="small" /></IconButton>
          </Stack>
        </Paper>
      ))}
    </Stack>
  );

  const renderTable = (list) => (
    <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: "#f0f4f8" }}>
            <TableCell sx={{ fontWeight: 700 }}>Number</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Client</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Items</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Total (₹)</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
            <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {list.length === 0 && <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: "#5A6F8A" }}>No records found</TableCell></TableRow>}
          {list.map((q) => (
            <TableRow key={q.id} hover>
              <TableCell sx={{ fontWeight: 600 }}>{q.quote_number}</TableCell>
              <TableCell>{q.billing_name}</TableCell>
              <TableCell>{Array.isArray(q.items) ? q.items.length : 0} items</TableCell>
              <TableCell>₹{Number(q.grand_total).toLocaleString("en-IN")}</TableCell>
              <TableCell><Chip label={q.status} size="small" color={statusColors[q.status] || "default"} /></TableCell>
              <TableCell>{q.created_at ? new Date(q.created_at).toLocaleDateString() : ""}</TableCell>
              <TableCell align="right">
                <IconButton size="small" onClick={() => handleView(q)} title="View"><VisibilityIcon fontSize="small" /></IconButton>
                <IconButton size="small" onClick={() => handleEdit(q)} title="Edit"><EditIcon fontSize="small" /></IconButton>
                <IconButton size="small" onClick={() => handlePrint(q)} title="Print"><PrintIcon fontSize="small" /></IconButton>
                {q.quote_type !== "tax_invoice" && (
                  <IconButton size="small" color="primary" onClick={() => handleConvert(q)} title="Convert"><ReceiptLongIcon fontSize="small" /></IconButton>
                )}
                <IconButton size="small" color="error" onClick={() => handleDelete(q.id)} title="Delete"><DeleteIcon fontSize="small" /></IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={1} sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#1E3A5F", fontSize: { xs: 16, md: 24 } }}>
          Quotations & Invoices
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton size="small" onClick={() => setShowFilters((v) => !v)} color={showFilters ? "primary" : "default"}>
            <FilterListIcon fontSize="small" />
          </IconButton>
          <Button variant="contained" startIcon={<AddIcon />} size={isMobile ? "small" : "medium"} onClick={() => openNew("tax_invoice")}>
            Tax Invoice
          </Button>
          <Button variant="outlined" startIcon={<AddIcon />} size={isMobile ? "small" : "medium"} onClick={() => openNew("sample_quotation")}>
            Sample Quote
          </Button>
        </Stack>
      </Stack>

      {showFilters && (
        <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }}>
            <TextField label="Client" size="small" value={filterSearch} onChange={(e) => setFilterSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && setPage(1)} sx={{ minWidth: 180 }} />
            <TextField label="Status" select size="small" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} sx={{ minWidth: 130 }}>
              <MenuItem value="">All</MenuItem>
              {["draft", "sent", "accepted", "rejected"].map((s) => <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>)}
            </TextField>
            <Button size="small" variant="outlined" onClick={() => setPage(1)}>Search</Button>
            <Button size="small" onClick={clearFilters}>Clear</Button>
          </Stack>
        </Paper>
      )}

      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 2 }}
        variant={isMobile ? "fullWidth" : "standard"}>
        <Tab label={`Invoices${!loading ? ` (${tab === 0 ? total : ""})` : ""}`} sx={{ fontSize: { xs: 12, md: 14 } }} />
        <Tab label={`Quotes${!loading ? ` (${tab === 1 ? total : ""})` : ""}`} sx={{ fontSize: { xs: 12, md: 14 } }} />
      </Tabs>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress /></Box>
      ) : isMobile ? renderMobileList(rows) : renderTable(rows)}

      {!loading && <Pagination page={page} total={total} limit={limit} onPageChange={setPage} onLimitChange={(l) => { setLimit(l); setPage(1); }} />}

      {/* Create/Edit Dialog */}
      <Dialog open={open} onClose={() => { setOpen(false); setEditId(null); }} maxWidth="md" fullWidth fullScreen={isMobile}>
        <DialogTitle sx={{ fontSize: { xs: 16, md: 20 }, pb: 1 }}>
          {editId ? "Edit" : "Create"} {form.quote_type === "tax_invoice" ? "Tax Invoice" : "Sample Quotation"}
          {form.quote_number && ` — ${form.quote_number}`}
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, md: 3 } }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography variant="subtitle2" sx={{ color: "#3393E0" }}>Billing Details</Typography>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Client Name" fullWidth size="small" value={form.billing_name} onChange={(e) => setForm({ ...form, billing_name: e.target.value })} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Phone" fullWidth size="small" value={form.billing_phone} onChange={(e) => setForm({ ...form, billing_phone: e.target.value })} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Email" fullWidth size="small" value={form.billing_email} onChange={(e) => setForm({ ...form, billing_email: e.target.value })} /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="GSTIN" fullWidth size="small" value={form.billing_gstin} onChange={(e) => setForm({ ...form, billing_gstin: e.target.value })} /></Grid>
              <Grid size={{ xs: 12 }}><TextField label="Billing Address" fullWidth size="small" value={form.billing_address} onChange={(e) => setForm({ ...form, billing_address: e.target.value })} /></Grid>
            </Grid>
            <FormControlLabel control={<Checkbox checked={form.same_as_billing} onChange={(e) => setForm({ ...form, same_as_billing: e.target.checked })} />} label="Shipping same as billing" />
            {!form.same_as_billing && (
              <>
                <Typography variant="subtitle2" sx={{ color: "#3393E0" }}>Shipping Details</Typography>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, sm: 6 }}><TextField label="Shipping Name" fullWidth size="small" value={form.shipping_name} onChange={(e) => setForm({ ...form, shipping_name: e.target.value })} /></Grid>
                  <Grid size={{ xs: 12, sm: 6 }}><TextField label="Shipping Phone" fullWidth size="small" value={form.shipping_phone} onChange={(e) => setForm({ ...form, shipping_phone: e.target.value })} /></Grid>
                  <Grid size={{ xs: 12 }}><TextField label="Shipping Address" fullWidth size="small" value={form.shipping_address} onChange={(e) => setForm({ ...form, shipping_address: e.target.value })} /></Grid>
                </Grid>
              </>
            )}
            <Divider />
            <Typography variant="subtitle2" sx={{ color: "#3393E0" }}>Line Items</Typography>
            {form.items.map((item, idx) => (
              <Paper key={`item-${idx}`} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                <Grid container spacing={1} alignItems="center">
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <TextField label="Product" select fullWidth size="small" value="" onChange={(e) => selectProduct(idx, e.target.value)}>
                      <MenuItem value="">— Select —</MenuItem>
                      {products.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }}><TextField label="Description" fullWidth size="small" value={item.description} onChange={(e) => updateItem(idx, "description", e.target.value)} /></Grid>
                  <Grid size={{ xs: 4, sm: 1 }}><TextField label="HSN" fullWidth size="small" value={item.hsnCode} onChange={(e) => updateItem(idx, "hsnCode", e.target.value)} /></Grid>
                  <Grid size={{ xs: 4, sm: 1 }}><TextField label="Qty" fullWidth size="small" type="number" value={item.qty} onChange={(e) => updateItem(idx, "qty", e.target.value)} /></Grid>
                  <Grid size={{ xs: 4, sm: 1 }}><TextField label="Unit" fullWidth size="small" value={item.unit} onChange={(e) => updateItem(idx, "unit", e.target.value)} /></Grid>
                  <Grid size={{ xs: 5, sm: 1.5 }}><TextField label="Price" fullWidth size="small" type="number" value={item.price} onChange={(e) => updateItem(idx, "price", e.target.value)} /></Grid>
                  <Grid size={{ xs: 5, sm: 1 }}>
                    <Typography sx={{ fontWeight: 600, textAlign: "right", fontSize: 14 }}>₹{(item.amount || 0).toLocaleString("en-IN")}</Typography>
                  </Grid>
                  <Grid size={{ xs: 2, sm: 0.5 }}>
                    {form.items.length > 1 && <IconButton size="small" color="error" onClick={() => removeItem(idx)}><DeleteIcon fontSize="small" /></IconButton>}
                  </Grid>
                </Grid>
              </Paper>
            ))}
            <Button size="small" startIcon={<AddIcon />} onClick={addItem}>Add Item</Button>
            <Divider />
            <Typography variant="subtitle2" sx={{ color: "#3393E0" }}>Tax & Discount</Typography>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 4 }}><TextField label="CGST %" fullWidth size="small" type="number" value={form.cgst_rate} onChange={(e) => setForm({ ...form, cgst_rate: e.target.value })} /></Grid>
              <Grid size={{ xs: 4 }}><TextField label="SGST %" fullWidth size="small" type="number" value={form.sgst_rate} onChange={(e) => setForm({ ...form, sgst_rate: e.target.value })} /></Grid>
              <Grid size={{ xs: 4 }}><TextField label="Discount (₹)" fullWidth size="small" type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} /></Grid>
            </Grid>
            <Paper sx={{ p: 2, bgcolor: "#f0f4f8", borderRadius: 2 }}>
              <Stack spacing={0.5}>
                <Stack direction="row" justifyContent="space-between"><Typography variant="body2">Subtotal:</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>₹{subtotal.toLocaleString("en-IN")}</Typography></Stack>
                <Stack direction="row" justifyContent="space-between"><Typography variant="body2">CGST ({form.cgst_rate}%):</Typography><Typography variant="body2">₹{cgstAmt.toLocaleString("en-IN")}</Typography></Stack>
                <Stack direction="row" justifyContent="space-between"><Typography variant="body2">SGST ({form.sgst_rate}%):</Typography><Typography variant="body2">₹{sgstAmt.toLocaleString("en-IN")}</Typography></Stack>
                {Number.parseFloat(form.discount) > 0 && <Stack direction="row" justifyContent="space-between"><Typography variant="body2">Discount:</Typography><Typography variant="body2">-₹{Number.parseFloat(form.discount).toLocaleString("en-IN")}</Typography></Stack>}
                <Divider sx={{ my: 0.5 }} />
                <Stack direction="row" justifyContent="space-between">
                  <Typography sx={{ fontWeight: 700, fontSize: { xs: 14, md: 18 } }}>Grand Total ({totalQty} items):</Typography>
                  <Typography sx={{ fontWeight: 700, color: "#3393E0", fontSize: { xs: 14, md: 18 } }}>₹{grandTotal.toLocaleString("en-IN")}</Typography>
                </Stack>
              </Stack>
            </Paper>
            <Divider />
            <Typography variant="subtitle2" sx={{ color: "#3393E0" }}>Payment Method & Status</Typography>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField label="Payment Method" select fullWidth size="small" value={form.payment_method_id} onChange={(e) => setForm({ ...form, payment_method_id: e.target.value })}>
                  <MenuItem value="">— None —</MenuItem>
                  {paymentMethods.map((pm) => (
                    <MenuItem key={pm.id} value={pm.id}>
                      {pm.label || pm.bank_name}{pm.is_default ? " (Default)" : ""}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField label="Status" select fullWidth size="small" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {["draft", "sent", "accepted", "rejected"].map((s) => <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>)}
                </TextField>
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, md: 3 }, pb: 2 }}>
          <Button onClick={() => { setOpen(false); setEditId(null); }}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? "Saving…" : editId ? "Update" : "Save"}</Button>
        </DialogActions>
      </Dialog>

      {/* View/Print Dialog */}
      <Dialog open={viewOpen} onClose={() => setViewOpen(false)} maxWidth="md" fullWidth fullScreen={isMobile}>
        <DialogContent sx={{ p: 0 }}>{viewQuote && <QuotePrintView quote={viewQuote} paymentMethods={paymentMethods} />}</DialogContent>
        <DialogActions className="no-print" sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setViewOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<PrintIcon />} onClick={() => globalThis.print()}>Print</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};


function QuotePrintView({ quote: q, paymentMethods }) {
  const items = Array.isArray(q.items) ? q.items : [];
  const isTax = q.quote_type === "tax_invoice";
  const title = isTax ? "TAX INVOICE" : "SAMPLE QUOTATION";

  const pm = q.payment_method_id ? paymentMethods.find((p) => p.id === q.payment_method_id) : null;
  const bankName = pm?.bank_name || q.pm_bank_name;
  const bankAccount = pm?.bank_account || q.pm_bank_account;
  const bankIfsc = pm?.bank_ifsc || q.pm_bank_ifsc;
  const bankBranch = pm?.bank_branch || q.pm_bank_branch;
  const upiId = pm?.upi_id || q.pm_upi_id;

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 }, fontFamily: "Arial, sans-serif", fontSize: { xs: 11, md: 13 }, color: "#000", bgcolor: "#fff" }} className="print-area">
      <style>{`@media print { .no-print { display: none !important; } .print-area { margin: 0; padding: 20px; } }`}</style>
      <Box sx={{ border: "2px solid #000", p: { xs: 1, md: 2 } }}>
        <Grid container>
          <Grid size={6}><Typography sx={{ fontSize: { xs: 9, md: 11 } }}>GSTIN: {COMPANY.gstin}</Typography></Grid>
          <Grid size={6} sx={{ textAlign: "right" }}><Typography sx={{ fontSize: { xs: 9, md: 11 } }}>Original Copy</Typography></Grid>
        </Grid>
        <Box sx={{ textAlign: "center", my: 1 }}>
          <Typography sx={{ fontSize: { xs: 10, md: 12 }, fontWeight: 600 }}>{title}</Typography>
          <Typography sx={{ fontSize: { xs: 14, md: 18 }, fontWeight: 700 }}>{COMPANY.name}</Typography>
          <Typography sx={{ fontSize: { xs: 9, md: 11 } }}>{COMPANY.address}</Typography>
          <Typography sx={{ fontSize: { xs: 9, md: 11 } }}>Email: {COMPANY.email} | Ph: {COMPANY.phone}</Typography>
        </Box>
        <Divider sx={{ borderColor: "#000" }} />
        <Grid container sx={{ mt: 1 }}>
          <Grid size={6} sx={{ borderRight: "1px solid #000", pr: 1 }}>
            <Typography sx={{ fontSize: { xs: 9, md: 11 } }}>{isTax ? "Invoice" : "Quote"} No: <strong>{q.quote_number}</strong></Typography>
            <Typography sx={{ fontSize: { xs: 9, md: 11 } }}>Date: <strong>{q.created_at ? new Date(q.created_at).toLocaleDateString("en-IN") : ""}</strong></Typography>
          </Grid>
          <Grid size={6} sx={{ pl: 1 }}>
            <Typography sx={{ fontSize: { xs: 9, md: 11 } }}>Place of Supply: <strong>{COMPANY.state}</strong></Typography>
            <Typography sx={{ fontSize: { xs: 9, md: 11 } }}>Reverse Charge: <strong>N</strong></Typography>
          </Grid>
        </Grid>
        <Divider sx={{ borderColor: "#000", my: 1 }} />
        <Grid container>
          <Grid size={6} sx={{ borderRight: "1px solid #000", pr: 1 }}>
            <Typography sx={{ fontSize: { xs: 9, md: 11 }, fontWeight: 600 }}>Billed to:</Typography>
            <Typography sx={{ fontSize: { xs: 9, md: 11 } }}>{q.billing_name}</Typography>
            <Typography sx={{ fontSize: { xs: 9, md: 11 } }}>{q.billing_address}</Typography>
            {q.billing_gstin && <Typography sx={{ fontSize: { xs: 9, md: 11 } }}>GSTIN: {q.billing_gstin}</Typography>}
            {q.billing_phone && <Typography sx={{ fontSize: { xs: 9, md: 11 } }}>Phone: {q.billing_phone}</Typography>}
            {q.billing_email && <Typography sx={{ fontSize: { xs: 9, md: 11 } }}>Email: {q.billing_email}</Typography>}
          </Grid>
          <Grid size={6} sx={{ pl: 1 }}>
            <Typography sx={{ fontSize: { xs: 9, md: 11 }, fontWeight: 600 }}>Shipped to:</Typography>
            <Typography sx={{ fontSize: { xs: 9, md: 11 } }}>{q.shipping_name || q.billing_name}</Typography>
            <Typography sx={{ fontSize: { xs: 9, md: 11 } }}>{q.shipping_address || q.billing_address}</Typography>
            {(q.shipping_phone || q.billing_phone) && <Typography sx={{ fontSize: { xs: 9, md: 11 } }}>Phone: {q.shipping_phone || q.billing_phone}</Typography>}
          </Grid>
        </Grid>
        <Divider sx={{ borderColor: "#000", my: 1 }} />
        <Box sx={{ overflowX: "auto" }}>
          <Table size="small" sx={{ "& td, & th": { border: "1px solid #000", fontSize: { xs: 9, md: 11 }, py: 0.5, px: { xs: 0.5, md: 1 } } }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>S.N.</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>HSN</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Qty</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Unit</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Price</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item, idx) => (
                <TableRow key={`print-${idx}`}>
                  <TableCell>{idx + 1}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.hsnCode}</TableCell>
                  <TableCell align="right">{item.qty}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell align="right">{Number(item.price).toLocaleString("en-IN")}</TableCell>
                  <TableCell align="right">{(item.amount || 0).toLocaleString("en-IN")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
        <Box sx={{ mt: 1 }}>
          <Grid container>
            <Grid size={{ xs: 4, md: 7 }} />
            <Grid size={{ xs: 8, md: 5 }}>
              <Stack spacing={0.3}>
                <Stack direction="row" justifyContent="space-between"><Typography sx={{ fontSize: { xs: 9, md: 11 } }}>Subtotal:</Typography><Typography sx={{ fontSize: { xs: 9, md: 11 }, fontWeight: 600 }}>₹{Number(q.subtotal).toLocaleString("en-IN")}</Typography></Stack>
                <Stack direction="row" justifyContent="space-between"><Typography sx={{ fontSize: { xs: 9, md: 11 } }}>CGST @ {q.cgst_rate}%:</Typography><Typography sx={{ fontSize: { xs: 9, md: 11 } }}>₹{Number(q.cgst_amount).toLocaleString("en-IN")}</Typography></Stack>
                <Stack direction="row" justifyContent="space-between"><Typography sx={{ fontSize: { xs: 9, md: 11 } }}>SGST @ {q.sgst_rate}%:</Typography><Typography sx={{ fontSize: { xs: 9, md: 11 } }}>₹{Number(q.sgst_amount).toLocaleString("en-IN")}</Typography></Stack>
                {Number(q.discount) > 0 && <Stack direction="row" justifyContent="space-between"><Typography sx={{ fontSize: { xs: 9, md: 11 } }}>Discount:</Typography><Typography sx={{ fontSize: { xs: 9, md: 11 } }}>-₹{Number(q.discount).toLocaleString("en-IN")}</Typography></Stack>}
                <Divider sx={{ borderColor: "#000" }} />
                <Stack direction="row" justifyContent="space-between"><Typography sx={{ fontSize: { xs: 10, md: 12 }, fontWeight: 700 }}>Total ({q.total_qty}):</Typography><Typography sx={{ fontSize: { xs: 10, md: 12 }, fontWeight: 700 }}>₹{Number(q.grand_total).toLocaleString("en-IN")}</Typography></Stack>
              </Stack>
            </Grid>
          </Grid>
        </Box>
        <Divider sx={{ borderColor: "#000", my: 1 }} />
        <Box sx={{ overflowX: "auto" }}>
          <Table size="small" sx={{ "& td, & th": { border: "1px solid #000", fontSize: { xs: 8, md: 10 }, py: 0.3, px: { xs: 0.5, md: 1 } } }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>HSN/SAC</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Tax Rate</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Taxable</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">CGST</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">SGST</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Total Tax</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[...new Set(items.map((i) => i.hsnCode))].map((hsn) => {
                const hsnItems = items.filter((i) => i.hsnCode === hsn);
                const taxable = hsnItems.reduce((s, i) => s + (i.amount || 0), 0);
                const cg = taxable * (Number(q.cgst_rate) || 0) / 100;
                const sg = taxable * (Number(q.sgst_rate) || 0) / 100;
                return (
                  <TableRow key={hsn || "none"}>
                    <TableCell>{hsn || "—"}</TableCell>
                    <TableCell>{(Number(q.cgst_rate) || 0) + (Number(q.sgst_rate) || 0)}%</TableCell>
                    <TableCell align="right">₹{taxable.toLocaleString("en-IN")}</TableCell>
                    <TableCell align="right">₹{cg.toLocaleString("en-IN")}</TableCell>
                    <TableCell align="right">₹{sg.toLocaleString("en-IN")}</TableCell>
                    <TableCell align="right">₹{(taxable + cg + sg).toLocaleString("en-IN")}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
        {bankName && (
          <>
            <Divider sx={{ borderColor: "#000", my: 1 }} />
            <Typography sx={{ fontSize: { xs: 9, md: 11 }, fontWeight: 600 }}>Bank Details:</Typography>
            <Typography sx={{ fontSize: { xs: 9, md: 11 } }}>{bankName}, A/C: {bankAccount}</Typography>
            <Typography sx={{ fontSize: { xs: 9, md: 11 } }}>IFSC: {bankIfsc}, Branch: {bankBranch}</Typography>
          </>
        )}
        {upiId && <Typography sx={{ fontSize: { xs: 9, md: 11 } }}>UPI: {upiId}</Typography>}
        <Divider sx={{ borderColor: "#000", my: 1 }} />
        <Grid container>
          <Grid size={6}>
            <Typography sx={{ fontSize: { xs: 8, md: 10 }, fontWeight: 600 }}>Terms & Conditions:</Typography>
            <Typography sx={{ fontSize: { xs: 8, md: 10 } }}>1. Goods once sold will not be taken back.</Typography>
            <Typography sx={{ fontSize: { xs: 8, md: 10 } }}>2. Interest @ 18% p.a. if payment is delayed.</Typography>
            <Typography sx={{ fontSize: { xs: 8, md: 10 } }}>3. Subject to Visakhapatnam jurisdiction.</Typography>
          </Grid>
          <Grid size={6} sx={{ textAlign: "right", pt: 3 }}>
            <Typography sx={{ fontSize: { xs: 9, md: 11 }, fontWeight: 600 }}>for {COMPANY.name}</Typography>
            <Box sx={{ mt: 3 }} />
            <Typography sx={{ fontSize: { xs: 9, md: 11 }, fontWeight: 600 }}>Authorized Signatory</Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default Quotes;
