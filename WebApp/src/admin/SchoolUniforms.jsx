import React, { useEffect, useState, useCallback } from "react";
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, IconButton, Stack, Chip, Tabs, Tab, Divider,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SchoolIcon from "@mui/icons-material/School";
import DownloadIcon from "@mui/icons-material/Download";
import * as api from "../db/api";
import { useToast } from "./ToastContext";
import Pagination from "./Pagination";

const emptySchool = { name: "", code: "", address: "", gst_percent: "", razorpay_key_id: "", razorpay_key_secret: "" };
const emptyUniform = { school_id: "", name: "", description: "", mrp: "", price: "", sizes: "XS,S,M,L,XL,XXL", image_url: "", image_data: "", stock: "" };
const emptyCoupon = { school_id: "", code: "", discount_type: "percent", discount_value: "", max_uses: "10" };
const orderStatuses = ["pending", "confirmed", "processing", "delivered", "cancelled"];
const statusColors = { pending: "warning", confirmed: "info", processing: "info", paid: "success", delivered: "success", cancelled: "error", failed: "error" };

const SchoolUniforms = () => {
  const [tab, setTab] = useState(0);
  const [schools, setSchools] = useState([]);
  const [uniforms, setUniforms] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ordersTotal, setOrdersTotal] = useState(0);
  const [ordersPage, setOrdersPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [schoolOpen, setSchoolOpen] = useState(false);
  const [schoolForm, setSchoolForm] = useState(emptySchool);
  const [schoolEditId, setSchoolEditId] = useState(null);
  const [uniformOpen, setUniformOpen] = useState(false);
  const [uniformForm, setUniformForm] = useState(emptyUniform);
  const [uniformEditId, setUniformEditId] = useState(null);
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponForm, setCouponForm] = useState(emptyCoupon);
  const [couponEditId, setCouponEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const loadSchools = useCallback(async () => { try { setSchools(await api.getSchools() || []); } catch (err) { toast(err.message); } }, []);
  const loadUniforms = useCallback(async () => { try { setUniforms(await api.getSchoolUniforms({}) || []); } catch (err) { toast(err.message); } }, []);
  const loadCoupons = useCallback(async () => { try { setCoupons(await api.getSchoolCoupons({}) || []); } catch (err) { toast(err.message); } }, []);
  const loadOrders = useCallback(async () => {
    try { const res = await api.getUniformOrders({ page: ordersPage, limit: 10 }); setOrders(res.rows || []); setOrdersTotal(res.total || 0); } catch (err) { toast(err.message); }
  }, [ordersPage]);

  useEffect(() => { Promise.all([loadSchools(), loadUniforms(), loadCoupons(), loadOrders()]).finally(() => setLoading(false)); }, []);
  useEffect(() => { loadOrders(); }, [loadOrders]);

  // School CRUD
  const saveSchool = async () => {
    try { setSaving(true); if (schoolEditId) await api.updateSchool(schoolEditId, schoolForm); else await api.createSchool(schoolForm);
      setSchoolOpen(false); setSchoolForm(emptySchool); setSchoolEditId(null); toast("School saved", "success"); loadSchools();
    } catch (err) { toast(err.message); } finally { setSaving(false); }
  };
  const editSchool = (s) => { setSchoolForm({ name: s.name, code: s.code || "", address: s.address || "", gst_percent: String(s.gst_percent || ""), razorpay_key_id: s.razorpay_key_id || "", razorpay_key_secret: "" }); setSchoolEditId(s.id); setSchoolOpen(true); };
  const deleteSchool = async (id) => { try { await api.deleteSchool(id); toast("Deleted", "success"); loadSchools(); loadUniforms(); loadCoupons(); } catch (err) { toast(err.message); } };

  // Uniform CRUD with image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1024 * 1024) { toast("Image must be under 1MB"); return; }
    const reader = new FileReader();
    reader.onload = () => setUniformForm((f) => ({ ...f, image_data: reader.result }));
    reader.readAsDataURL(file);
  };
  const saveUniform = async () => {
    try { setSaving(true);
      const data = { ...uniformForm, mrp: Number.parseFloat(uniformForm.mrp) || 0, price: Number.parseFloat(uniformForm.price) || 0, stock: Number.parseInt(uniformForm.stock) || 0 };
      if (uniformEditId) await api.updateSchoolUniform(uniformEditId, data); else await api.createSchoolUniform(data);
      setUniformOpen(false); setUniformForm(emptyUniform); setUniformEditId(null); toast("Uniform saved", "success"); loadUniforms();
    } catch (err) { toast(err.message); } finally { setSaving(false); }
  };
  const editUniform = (u) => { setUniformForm({ school_id: String(u.school_id), name: u.name, description: u.description || "", mrp: String(u.mrp || ""), price: String(u.price), sizes: u.sizes || "", image_url: u.image_url || "", image_data: u.image_data || "", stock: String(u.stock) }); setUniformEditId(u.id); setUniformOpen(true); };
  const deleteUniform = async (id) => { try { await api.deleteSchoolUniform(id); toast("Deleted", "success"); loadUniforms(); } catch (err) { toast(err.message); } };

  // Coupon CRUD
  const saveCoupon = async () => {
    try { setSaving(true);
      const data = { ...couponForm, discount_value: Number.parseFloat(couponForm.discount_value) || 0, max_uses: Number.parseInt(couponForm.max_uses) || 10 };
      if (couponEditId) await api.updateSchoolCoupon(couponEditId, data); else await api.createSchoolCoupon(data);
      setCouponOpen(false); setCouponForm(emptyCoupon); setCouponEditId(null); toast("Coupon saved", "success"); loadCoupons();
    } catch (err) { toast(err.message); } finally { setSaving(false); }
  };
  const editCoupon = (c) => { setCouponForm({ school_id: String(c.school_id), code: c.code, discount_type: c.discount_type, discount_value: String(c.discount_value), max_uses: String(c.max_uses) }); setCouponEditId(c.id); setCouponOpen(true); };
  const deleteCoupon = async (id) => { try { await api.deleteSchoolCoupon(id); toast("Deleted", "success"); loadCoupons(); } catch (err) { toast(err.message); } };

  const updateOrderStatus = async (id, order_status) => { try { await api.updateUniformOrder(id, { order_status }); toast("Updated", "success"); loadOrders(); } catch (err) { toast(err.message); } };

  const parseItems = (items) => {
    try { return typeof items === "string" ? JSON.parse(items) : (items || []); } catch { return []; }
  };

  const exportToExcel = () => {
    if (!orders.length) return;
    const rows = [];
    for (const o of orders) {
      const items = parseItems(o.items);
      const itemsSummary = items.map((i) => `${i.name} (${i.size}) x${i.qty}`).join("; ");
      rows.push({
        "Order ID": o.id,
        "Date": new Date(o.created_at).toLocaleDateString(),
        "Student Name": o.student_name,
        "Class": o.student_class,
        "Parent Name": o.parent_name,
        "Phone": o.parent_phone,
        "Email": o.parent_email || "",
        "School": o.school_name,
        "Items": itemsSummary,
        "Subtotal": Number(o.subtotal || 0),
        "Discount": Number(o.discount_amount || 0),
        "Coupon": o.coupon_code || "",
        "GST %": Number(o.gst_percent || 0),
        "GST Amount": Number(o.gst_amount || 0),
        "Total": Number(o.total_amount || 0),
        "Payment Status": o.payment_status,
        "Order Status": o.order_status,
        "Payment ID": o.razorpay_payment_id || "",
      });
    }
    // Build CSV
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","),
      ...rows.map((r) => headers.map((h) => { const v = String(r[h] ?? ""); return v.includes(",") || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v; }).join(","))
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `uniform-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#1E3A5F", fontSize: { xs: 18, md: 24 } }}>
          <SchoolIcon sx={{ mr: 1, verticalAlign: "middle" }} />School Uniforms
        </Typography>
      </Stack>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }} variant="scrollable" scrollButtons="auto">
        <Tab label={`Schools (${schools.length})`} />
        <Tab label={`Uniforms (${uniforms.length})`} />
        <Tab label={`Coupons (${coupons.length})`} />
        <Tab label={`Orders (${ordersTotal})`} />
      </Tabs>

      {/* Schools Tab */}
      {tab === 0 && (<Box>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ mb: 2 }} onClick={() => { setSchoolForm(emptySchool); setSchoolEditId(null); setSchoolOpen(true); }}>Add School</Button>
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}><Table size="small">
          <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Code</TableCell><TableCell>GST</TableCell><TableCell>Razorpay</TableCell><TableCell>Status</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
          <TableBody>
            {schools.map((s) => (<TableRow key={s.id}>
              <TableCell>{s.name}</TableCell><TableCell>{s.code}</TableCell>
              <TableCell>{Number(s.gst_percent) > 0 ? `${s.gst_percent}%` : "—"}</TableCell>
              <TableCell><Chip label={s.razorpay_key_id ? "Configured" : "Not Set"} size="small" color={s.razorpay_key_id ? "success" : "default"} /></TableCell>
              <TableCell><Chip label={s.active ? "Active" : "Inactive"} size="small" color={s.active ? "success" : "default"} /></TableCell>
              <TableCell align="right">
                <IconButton size="small" onClick={() => editSchool(s)}><EditIcon fontSize="small" /></IconButton>
                <IconButton size="small" color="error" onClick={() => deleteSchool(s.id)}><DeleteIcon fontSize="small" /></IconButton>
              </TableCell>
            </TableRow>))}
            {schools.length === 0 && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: "#5A6F8A" }}>No schools yet</TableCell></TableRow>}
          </TableBody>
        </Table></TableContainer>
      </Box>)}

      {/* Uniforms Tab */}
      {tab === 1 && (<Box>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ mb: 2 }} onClick={() => { setUniformForm(emptyUniform); setUniformEditId(null); setUniformOpen(true); }}>Add Uniform</Button>
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}><Table size="small">
          <TableHead><TableRow><TableCell>Image</TableCell><TableCell>Name</TableCell><TableCell>School</TableCell><TableCell>MRP</TableCell><TableCell>Price</TableCell><TableCell>Stock</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
          <TableBody>
            {uniforms.map((u) => (<TableRow key={u.id}>
              <TableCell>{(u.image_data || u.image_url) ? <img src={u.image_data || u.image_url} alt="" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }} /> : "—"}</TableCell>
              <TableCell>{u.name}</TableCell><TableCell>{u.school_name}</TableCell>
              <TableCell sx={{ textDecoration: "line-through", color: "#999" }}>₹{Number(u.mrp || 0).toLocaleString()}</TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#10B981" }}>₹{Number(u.price).toLocaleString()}</TableCell>
              <TableCell>{u.stock}</TableCell>
              <TableCell align="right">
                <IconButton size="small" onClick={() => editUniform(u)}><EditIcon fontSize="small" /></IconButton>
                <IconButton size="small" color="error" onClick={() => deleteUniform(u.id)}><DeleteIcon fontSize="small" /></IconButton>
              </TableCell>
            </TableRow>))}
            {uniforms.length === 0 && <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: "#5A6F8A" }}>No uniforms yet</TableCell></TableRow>}
          </TableBody>
        </Table></TableContainer>
      </Box>)}

      {/* Coupons Tab */}
      {tab === 2 && (<Box>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ mb: 2 }} onClick={() => { setCouponForm(emptyCoupon); setCouponEditId(null); setCouponOpen(true); }}>Add Coupon</Button>
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}><Table size="small">
          <TableHead><TableRow><TableCell>Code</TableCell><TableCell>School</TableCell><TableCell>Discount</TableCell><TableCell>Usage</TableCell><TableCell>Status</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
          <TableBody>
            {coupons.map((c) => (<TableRow key={c.id}>
              <TableCell sx={{ fontWeight: 700, fontFamily: "monospace" }}>{c.code}</TableCell>
              <TableCell>{c.school_name}</TableCell>
              <TableCell>{c.discount_type === "percent" ? `${c.discount_value}%` : `₹${Number(c.discount_value).toLocaleString()}`}</TableCell>
              <TableCell><Chip label={`${c.used_count}/${c.max_uses}`} size="small" color={c.used_count >= c.max_uses ? "error" : "success"} /></TableCell>
              <TableCell><Chip label={c.active && c.used_count < c.max_uses ? "Active" : "Expired"} size="small" color={c.active && c.used_count < c.max_uses ? "success" : "error"} /></TableCell>
              <TableCell align="right">
                <IconButton size="small" onClick={() => editCoupon(c)}><EditIcon fontSize="small" /></IconButton>
                <IconButton size="small" color="error" onClick={() => deleteCoupon(c.id)}><DeleteIcon fontSize="small" /></IconButton>
              </TableCell>
            </TableRow>))}
            {coupons.length === 0 && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: "#5A6F8A" }}>No coupons yet</TableCell></TableRow>}
          </TableBody>
        </Table></TableContainer>
      </Box>)}

      {/* Orders Tab */}
      {tab === 3 && (<Box>
        <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={exportToExcel} disabled={orders.length === 0}>Export to Excel</Button>
        </Stack>
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}><Table size="small">
          <TableHead><TableRow><TableCell>ID</TableCell><TableCell>Student</TableCell><TableCell>Class</TableCell><TableCell>School</TableCell><TableCell>Items</TableCell><TableCell>Amount</TableCell><TableCell>Coupon</TableCell><TableCell>Payment</TableCell><TableCell>Status</TableCell><TableCell>Date</TableCell></TableRow></TableHead>
          <TableBody>
            {orders.map((o) => {
              const items = parseItems(o.items);
              return (<TableRow key={o.id}>
                <TableCell>#{o.id}</TableCell>
                <TableCell>{o.student_name}<br /><Typography variant="caption" color="text.secondary">{o.parent_name} • {o.parent_phone}</Typography>{o.parent_email && <><br /><Typography variant="caption" color="text.secondary">{o.parent_email}</Typography></>}</TableCell>
                <TableCell>{o.student_class}</TableCell>
                <TableCell>{o.school_name}</TableCell>
                <TableCell sx={{ minWidth: 180 }}>
                  {items.map((i, idx) => (
                    <Typography key={idx} variant="caption" display="block" sx={{ lineHeight: 1.6 }}>
                      {i.name} — <strong>{i.size}</strong> × {i.qty} <span style={{ color: "#5A6F8A" }}>(₹{(Number(i.price) * Number(i.qty)).toLocaleString()})</span>
                    </Typography>
                  ))}
                </TableCell>
                <TableCell>₹{Number(o.total_amount).toLocaleString()}{Number(o.discount_amount) > 0 && <Typography variant="caption" color="success.main"><br />-₹{Number(o.discount_amount).toLocaleString()}</Typography>}{Number(o.gst_amount) > 0 && <Typography variant="caption" color="text.secondary"><br />GST: ₹{Number(o.gst_amount).toLocaleString()}</Typography>}</TableCell>
                <TableCell>{o.coupon_code || "—"}</TableCell>
                <TableCell><Chip label={o.payment_status} size="small" color={statusColors[o.payment_status] || "default"} /></TableCell>
                <TableCell>
                  <TextField select size="small" value={o.order_status} onChange={(e) => updateOrderStatus(o.id, e.target.value)} sx={{ minWidth: 120 }}>
                    {orderStatuses.map((s) => <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>)}
                  </TextField>
                </TableCell>
                <TableCell><Typography variant="caption">{new Date(o.created_at).toLocaleDateString()}</Typography></TableCell>
              </TableRow>);
            })}
            {orders.length === 0 && <TableRow><TableCell colSpan={10} align="center" sx={{ py: 4, color: "#5A6F8A" }}>No orders yet</TableCell></TableRow>}
          </TableBody>
        </Table></TableContainer>
        {ordersTotal > 10 && <Pagination total={ordersTotal} page={ordersPage} limit={10} onPageChange={setOrdersPage} />}
      </Box>)}

      {/* School Dialog */}
      <Dialog open={schoolOpen} onClose={() => setSchoolOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{schoolEditId ? "Edit School" : "Add School"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
          <TextField label="School Name" value={schoolForm.name} onChange={(e) => setSchoolForm({ ...schoolForm, name: e.target.value })} required />
          <TextField label="School Code" value={schoolForm.code} onChange={(e) => setSchoolForm({ ...schoolForm, code: e.target.value })} helperText="Unique code for URL (e.g. dav-vizag)" />
          <TextField label="Address" value={schoolForm.address} onChange={(e) => setSchoolForm({ ...schoolForm, address: e.target.value })} multiline rows={2} />
          <TextField label="GST Percentage" type="number" value={schoolForm.gst_percent} onChange={(e) => setSchoolForm({ ...schoolForm, gst_percent: e.target.value })} placeholder="e.g. 18" helperText="GST % to add on top of uniform price (0 = no GST)" />
          <Divider><Typography variant="caption" color="text.secondary">Razorpay Configuration</Typography></Divider>
          <TextField label="Razorpay Key ID" value={schoolForm.razorpay_key_id} onChange={(e) => setSchoolForm({ ...schoolForm, razorpay_key_id: e.target.value })} placeholder="rzp_live_..." />
          <TextField label="Razorpay Key Secret" type="password" value={schoolForm.razorpay_key_secret} onChange={(e) => setSchoolForm({ ...schoolForm, razorpay_key_secret: e.target.value })} placeholder={schoolEditId ? "Leave blank to keep existing" : "Enter secret"} />
        </DialogContent>
        <DialogActions><Button onClick={() => setSchoolOpen(false)}>Cancel</Button><Button variant="contained" onClick={saveSchool} disabled={saving || !schoolForm.name}>{saving ? <CircularProgress size={20} /> : "Save"}</Button></DialogActions>
      </Dialog>

      {/* Uniform Dialog */}
      <Dialog open={uniformOpen} onClose={() => setUniformOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{uniformEditId ? "Edit Uniform" : "Add Uniform"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
          <TextField label="School" select value={uniformForm.school_id} onChange={(e) => setUniformForm({ ...uniformForm, school_id: e.target.value })} required>
            {schools.map((s) => <MenuItem key={s.id} value={String(s.id)}>{s.name}</MenuItem>)}
          </TextField>
          <TextField label="Uniform Name" value={uniformForm.name} onChange={(e) => setUniformForm({ ...uniformForm, name: e.target.value })} required placeholder="e.g. White Shirt, Grey Trousers" />
          <TextField label="Description" value={uniformForm.description} onChange={(e) => setUniformForm({ ...uniformForm, description: e.target.value })} multiline rows={2} />
          <Stack direction="row" spacing={2}>
            <TextField label="MRP (₹)" type="number" value={uniformForm.mrp} onChange={(e) => setUniformForm({ ...uniformForm, mrp: e.target.value })} sx={{ flex: 1 }} />
            <TextField label="Selling Price (₹)" type="number" value={uniformForm.price} onChange={(e) => setUniformForm({ ...uniformForm, price: e.target.value })} sx={{ flex: 1 }} />
            <TextField label="Stock" type="number" value={uniformForm.stock} onChange={(e) => setUniformForm({ ...uniformForm, stock: e.target.value })} sx={{ flex: 1 }} />
          </Stack>
          <TextField label="Sizes (comma separated)" value={uniformForm.sizes} onChange={(e) => setUniformForm({ ...uniformForm, sizes: e.target.value })} placeholder="XS,S,M,L,XL,XXL" />
          <Divider><Typography variant="caption" color="text.secondary">Image (max 1MB)</Typography></Divider>
          <Button variant="outlined" component="label">Upload Image<input type="file" hidden accept="image/*" onChange={handleImageUpload} /></Button>
          {uniformForm.image_data && <Box sx={{ mt: 1 }}><img src={uniformForm.image_data} alt="preview" style={{ maxWidth: 200, maxHeight: 150, borderRadius: 8, objectFit: "cover" }} /><Button size="small" color="error" onClick={() => setUniformForm({ ...uniformForm, image_data: "" })} sx={{ ml: 1 }}>Remove</Button></Box>}
          <TextField label="Or Image URL" value={uniformForm.image_url} onChange={(e) => setUniformForm({ ...uniformForm, image_url: e.target.value })} placeholder="https://..." helperText="Used if no uploaded image" />
        </DialogContent>
        <DialogActions><Button onClick={() => setUniformOpen(false)}>Cancel</Button><Button variant="contained" onClick={saveUniform} disabled={saving || !uniformForm.name || !uniformForm.school_id}>{saving ? <CircularProgress size={20} /> : "Save"}</Button></DialogActions>
      </Dialog>

      {/* Coupon Dialog */}
      <Dialog open={couponOpen} onClose={() => setCouponOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{couponEditId ? "Edit Coupon" : "Create Coupon"}</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
          <TextField label="School" select value={couponForm.school_id} onChange={(e) => setCouponForm({ ...couponForm, school_id: e.target.value })} required>
            {schools.map((s) => <MenuItem key={s.id} value={String(s.id)}>{s.name}</MenuItem>)}
          </TextField>
          <TextField label="Coupon Code" value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} required placeholder="e.g. WELCOME10" />
          <Stack direction="row" spacing={2}>
            <TextField label="Discount Type" select value={couponForm.discount_type} onChange={(e) => setCouponForm({ ...couponForm, discount_type: e.target.value })} sx={{ flex: 1 }}>
              <MenuItem value="percent">Percentage (%)</MenuItem>
              <MenuItem value="flat">Flat (₹)</MenuItem>
            </TextField>
            <TextField label="Discount Value" type="number" value={couponForm.discount_value} onChange={(e) => setCouponForm({ ...couponForm, discount_value: e.target.value })} sx={{ flex: 1 }} />
          </Stack>
          <TextField label="Max Uses (orders)" type="number" value={couponForm.max_uses} onChange={(e) => setCouponForm({ ...couponForm, max_uses: e.target.value })} helperText="Coupon expires after this many orders" />
        </DialogContent>
        <DialogActions><Button onClick={() => setCouponOpen(false)}>Cancel</Button><Button variant="contained" onClick={saveCoupon} disabled={saving || !couponForm.code || !couponForm.school_id}>{saving ? <CircularProgress size={20} /> : "Save"}</Button></DialogActions>
      </Dialog>
    </Box>
  );
};

export default SchoolUniforms;
