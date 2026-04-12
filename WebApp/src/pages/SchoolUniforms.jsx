import React, { useEffect, useState } from "react";
import {
  Box, Container, Typography, Grid, Card, CardContent, CardMedia, Button, Chip,
  TextField, MenuItem, IconButton, Badge, Drawer, Divider, Stack, Alert,
  CircularProgress, Paper,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SchoolIcon from "@mui/icons-material/School";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { getSchools, getSchoolUniforms, createUniformOrder, verifyUniformPayment, validateCoupon } from "../db/api";
import SEO from "../components/SEO";

const UniformCard = ({ uniform: u, onAddToCart }) => {
  const sizes = (u.sizes || "").split(",").map((s) => s.trim()).filter(Boolean);
  const [selectedSize, setSelectedSize] = useState(sizes[0] || "");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    if (!selectedSize) return;
    onAddToCart(u, selectedSize, qty);
    setAdded(true);
    setQty(1);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <Card sx={{ borderRadius: 3, height: "100%", display: "flex", flexDirection: "column" }}>
      {(u.image_data || u.image_url) && <CardMedia component="img" height="200" image={u.image_data || u.image_url} alt={u.name} sx={{ objectFit: "cover" }} />}
      <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Typography variant="h6" fontWeight={700} color="#1E3A5F">{u.name}</Typography>
        {u.description && <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{u.description}</Typography>}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
          {Number(u.mrp) > Number(u.price) && (
            <Typography variant="body1" sx={{ textDecoration: "line-through", color: "#999" }}>₹{Number(u.mrp).toLocaleString()}</Typography>
          )}
          <Typography variant="h5" fontWeight={700} color="#3393E0">₹{Number(u.price).toLocaleString()}</Typography>
          {Number(u.mrp) > Number(u.price) && (
            <Chip label={`${Math.round((1 - Number(u.price) / Number(u.mrp)) * 100)}% OFF`} size="small" color="success" />
          )}
        </Stack>
        <Stack spacing={1.5} sx={{ mt: "auto" }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField select size="small" label="Size" value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)} sx={{ minWidth: 90 }}>
              {sizes.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
            <Stack direction="row" alignItems="center" sx={{ border: "1px solid #ddd", borderRadius: 1 }}>
              <IconButton size="small" onClick={() => setQty((q) => Math.max(1, q - 1))}><RemoveIcon fontSize="small" /></IconButton>
              <Typography sx={{ minWidth: 28, textAlign: "center", fontWeight: 600 }}>{qty}</Typography>
              <IconButton size="small" onClick={() => setQty((q) => q + 1)}><AddIcon fontSize="small" /></IconButton>
            </Stack>
          </Stack>
          <Button variant="contained" fullWidth startIcon={<AddShoppingCartIcon />} onClick={handleAdd} disabled={!selectedSize}
            sx={{ background: added ? "linear-gradient(135deg, #10B981, #059669)" : "linear-gradient(135deg, #3393E0, #2578B5)", fontWeight: 700, transition: "background 0.3s" }}>
            {added ? "Added ✓" : "Add to Cart"}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

const SchoolUniforms = () => {
  const [schools, setSchools] = useState([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [uniforms, setUniforms] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkoutStep, setCheckoutStep] = useState(0);
  const [studentForm, setStudentForm] = useState({ student_name: "", student_class: "", parent_name: "", parent_phone: "", parent_email: "" });
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState(null); // { valid, discount_type, discount_value, remaining }
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    getSchools().then((s) => {
      const active = (s || []).filter((x) => x.active);
      setSchools(active);
      if (active.length === 1) setSelectedSchool(String(active[0].id));
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedSchool) { setUniforms([]); return; }
    getSchoolUniforms({ school_id: selectedSchool, active: "true" }).then((u) => setUniforms(u || []));
    setCart([]); setCouponCode(""); setCouponResult(null); setCouponError("");
  }, [selectedSchool]);

  const addToCart = (uniform, size, addQty = 1) => {
    setCart((prev) => {
      const key = `${uniform.id}-${size}`;
      const existing = prev.find((c) => c.key === key);
      if (existing) return prev.map((c) => c.key === key ? { ...c, qty: c.qty + addQty } : c);
      return [...prev, { key, id: uniform.id, name: uniform.name, size, price: Number(uniform.price), qty: addQty }];
    });
  };
  const updateQty = (key, delta) => setCart((prev) => prev.map((c) => c.key === key ? { ...c, qty: Math.max(1, c.qty + delta) } : c));
  const removeFromCart = (key) => setCart((prev) => prev.filter((c) => c.key !== key));
  const cartSubtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const cartCount = cart.reduce((s, c) => s + c.qty, 0);

  const discountAmount = couponResult ? (couponResult.discount_type === "percent"
    ? Math.round(cartSubtotal * couponResult.discount_value / 100 * 100) / 100
    : Math.min(couponResult.discount_value, cartSubtotal)) : 0;
  const afterDiscount = Math.max(0, cartSubtotal - discountAmount);
  const selectedSchoolObj = schools.find((s) => String(s.id) === selectedSchool);
  const gstPercent = Number(selectedSchoolObj?.gst_percent) || 0;
  const gstAmount = Math.round(afterDiscount * gstPercent / 100 * 100) / 100;
  const cartTotal = Math.round((afterDiscount + gstAmount) * 100) / 100;

  const applyCoupon = async () => {
    setCouponError(""); setCouponResult(null);
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const res = await validateCoupon({ school_id: Number(selectedSchool), code: couponCode });
      setCouponResult(res);
    } catch (err) { setCouponError(err.message); }
    finally { setCouponLoading(false); }
  };

  const handleCheckout = async () => {
    setError("");
    const { student_name, student_class, parent_name, parent_phone, parent_email } = studentForm;
    if (!student_name || !student_class || !parent_name || !parent_phone || !parent_email) { setError("All fields including email are required"); return; }
    setPaying(true);
    try {
      const { razorpay_order_id, razorpay_key_id, amount } = await createUniformOrder({
        school_id: Number(selectedSchool), ...studentForm,
        items: cart.map((c) => ({ uniform_id: c.id, name: c.name, size: c.size, price: c.price, qty: c.qty })),
        coupon_code: couponResult ? couponCode : undefined,
      });
      const options = {
        key: razorpay_key_id, amount, currency: "INR", name: "KPJ Garments", description: "School Uniform Order",
        order_id: razorpay_order_id,
        prefill: { name: parent_name, contact: parent_phone, email: studentForm.parent_email || "" },
        handler: async (response) => {
          try {
            await verifyUniformPayment({ razorpay_order_id: response.razorpay_order_id, razorpay_payment_id: response.razorpay_payment_id, razorpay_signature: response.razorpay_signature });
            setCheckoutStep(2); setCart([]); setCartOpen(false);
          } catch (err) { setError("Payment verification failed. Contact support."); }
          setPaying(false);
        },
        modal: { ondismiss: () => setPaying(false) },
        theme: { color: "#3393E0" },
      };
      new window.Razorpay(options).open();
    } catch (err) { setError(err.message); setPaying(false); }
  };

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}><CircularProgress /></Box>;

  if (checkoutStep === 2) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: "center" }}>
        <SEO title="Order Confirmed — School Uniforms" path="/school-uniforms" />
        <CheckCircleIcon sx={{ fontSize: 80, color: "#10B981", mb: 2 }} />
        <Typography variant="h4" fontWeight={700} color="#1E3A5F" sx={{ mb: 2 }}>Order Confirmed</Typography>
        <Paper sx={{ p: 3, borderRadius: 3, mb: 3 }}>
          <Typography variant="body1" sx={{ color: "#5A6F8A", lineHeight: 1.8 }}>
            Thank you for your order. The uniform will be delivered to the student on school opening day.
            If the school has already opened, please allow up to 1 week for delivery.
          </Typography>
        </Paper>
        <Button variant="contained" onClick={() => { setCheckoutStep(0); setStudentForm({ student_name: "", student_class: "", parent_name: "", parent_phone: "", parent_email: "" }); setCouponCode(""); setCouponResult(null); }}>
          Place Another Order
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <SEO title="School Uniforms — Buy Online" description="Order school uniforms online with Razorpay payment." path="/school-uniforms" />
      <Box sx={{ background: "linear-gradient(135deg, #1E3A5F, #3393E0)", py: { xs: 5, md: 8 }, textAlign: "center", color: "#fff" }}>
        <Container>
          <SchoolIcon sx={{ fontSize: 56, mb: 1, opacity: 0.9 }} />
          <Typography variant="h3" fontWeight={800} sx={{ fontSize: { xs: "1.8rem", md: "2.8rem" }, mb: 1 }}>School Uniforms</Typography>
          <Typography variant="h6" sx={{ opacity: 0.85, fontWeight: 400, fontSize: { xs: 14, md: 18 } }}>Select your school, pick uniforms, and pay online</Typography>
        </Container>
      </Box>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }} justifyContent="space-between" sx={{ mb: 4 }}>
          <TextField select label="Select School" value={selectedSchool} onChange={(e) => setSelectedSchool(e.target.value)} sx={{ minWidth: 280 }} size="medium">
            <MenuItem value="">-- Choose School --</MenuItem>
            {schools.map((s) => <MenuItem key={s.id} value={String(s.id)}>{s.name}</MenuItem>)}
          </TextField>
          <Button variant="outlined" startIcon={<Badge badgeContent={cartCount} color="secondary"><ShoppingCartIcon /></Badge>}
            onClick={() => setCartOpen(true)} disabled={cart.length === 0}>Cart — ₹{cartTotal.toLocaleString()}</Button>
        </Stack>
        {!selectedSchool && <Typography color="text.secondary" textAlign="center" sx={{ py: 6 }}>Please select a school to view available uniforms.</Typography>}
        <Grid container spacing={3}>
          {uniforms.map((u) => (
            <Grid key={u.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <UniformCard uniform={u} onAddToCart={addToCart} />
            </Grid>
          ))}
        </Grid>
        {selectedSchool && uniforms.length === 0 && <Typography color="text.secondary" textAlign="center" sx={{ py: 6 }}>No uniforms available for this school yet.</Typography>}
      </Container>

      {/* Cart Drawer */}
      <Drawer anchor="right" open={cartOpen} onClose={() => setCartOpen(false)} slotProps={{ paper: { sx: { width: { xs: "100%", sm: 420 }, p: 3 } } }}>
        <Typography variant="h6" fontWeight={700} color="#1E3A5F" sx={{ mb: 2 }}>Your Cart</Typography>
        {checkoutStep === 0 && (<>
          {cart.map((c) => (
            <Paper key={c.key} sx={{ p: 2, mb: 1.5, borderRadius: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ flex: 1 }}><Typography fontWeight={600} fontSize={14}>{c.name}</Typography><Typography variant="caption" color="text.secondary">Size: {c.size} · ₹{c.price}</Typography></Box>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <IconButton size="small" onClick={() => updateQty(c.key, -1)}><RemoveIcon fontSize="small" /></IconButton>
                <Typography fontWeight={600} sx={{ minWidth: 24, textAlign: "center" }}>{c.qty}</Typography>
                <IconButton size="small" onClick={() => updateQty(c.key, 1)}><AddIcon fontSize="small" /></IconButton>
              </Stack>
              <Typography fontWeight={700} sx={{ minWidth: 60, textAlign: "right" }}>₹{(c.price * c.qty).toLocaleString()}</Typography>
              <IconButton size="small" color="error" onClick={() => removeFromCart(c.key)}><DeleteIcon fontSize="small" /></IconButton>
            </Paper>
          ))}
          {/* Coupon */}
          <Paper sx={{ p: 2, mb: 2, borderRadius: 2, bgcolor: "#f8fbff" }}>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}><LocalOfferIcon fontSize="small" sx={{ verticalAlign: "middle", mr: 0.5 }} />Have a coupon?</Typography>
            <Stack direction="row" spacing={1}>
              <TextField size="small" placeholder="Enter code" value={couponCode} onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponResult(null); setCouponError(""); }} sx={{ flex: 1 }} />
              <Button variant="outlined" size="small" onClick={applyCoupon} disabled={couponLoading || !couponCode.trim()}>
                {couponLoading ? <CircularProgress size={18} /> : "Apply"}
              </Button>
            </Stack>
            {couponError && <Alert severity="error" sx={{ mt: 1, py: 0 }}>{couponError}</Alert>}
            {couponResult && <Alert severity="success" sx={{ mt: 1, py: 0 }}>
              {couponResult.discount_type === "percent" ? `${couponResult.discount_value}% off` : `₹${couponResult.discount_value} off`} applied — {couponResult.remaining} uses left
            </Alert>}
          </Paper>
          <Divider sx={{ my: 1 }} />
          <Stack spacing={0.5} sx={{ mb: 2 }}>
            <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">Subtotal</Typography><Typography>₹{cartSubtotal.toLocaleString()}</Typography></Stack>
            {discountAmount > 0 && <Stack direction="row" justifyContent="space-between"><Typography color="success.main">Discount</Typography><Typography color="success.main">-₹{discountAmount.toLocaleString()}</Typography></Stack>}
            {gstPercent > 0 && <Stack direction="row" justifyContent="space-between"><Typography color="text.secondary">GST ({gstPercent}%)</Typography><Typography>₹{gstAmount.toLocaleString()}</Typography></Stack>}
            <Stack direction="row" justifyContent="space-between"><Typography fontWeight={700}>Total</Typography><Typography fontWeight={700} color="#3393E0">₹{cartTotal.toLocaleString()}</Typography></Stack>
          </Stack>
          <Button variant="contained" fullWidth size="large" onClick={() => setCheckoutStep(1)}
            sx={{ background: "linear-gradient(135deg, #3393E0, #2578B5)", fontWeight: 700, py: 1.5 }}>Proceed to Checkout</Button>
        </>)}
        {checkoutStep === 1 && (<>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Enter student and parent details</Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Stack spacing={2}>
            <TextField label="Student Name" value={studentForm.student_name} onChange={(e) => setStudentForm({ ...studentForm, student_name: e.target.value })} required />
            <TextField label="Class / Section" value={studentForm.student_class} onChange={(e) => setStudentForm({ ...studentForm, student_class: e.target.value })} required placeholder="e.g. 5th A" />
            <TextField label="Parent / Guardian Name" value={studentForm.parent_name} onChange={(e) => setStudentForm({ ...studentForm, parent_name: e.target.value })} required />
            <TextField label="Mobile Number" value={studentForm.parent_phone} onChange={(e) => setStudentForm({ ...studentForm, parent_phone: e.target.value })} required />
            <TextField label="Email" type="email" value={studentForm.parent_email} onChange={(e) => setStudentForm({ ...studentForm, parent_email: e.target.value })} required />
          </Stack>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2" sx={{ mb: 1 }}>Total: <strong>₹{cartTotal.toLocaleString()}</strong>{discountAmount > 0 && <span style={{ color: "#10B981" }}> (saved ₹{discountAmount.toLocaleString()})</span>}{gstPercent > 0 && <span style={{ color: "#5A6F8A" }}> incl. GST ₹{gstAmount.toLocaleString()}</span>} · {cartCount} items</Typography>
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => { setCheckoutStep(0); setError(""); }} sx={{ flex: 1 }}>Back</Button>
            <Button variant="contained" onClick={handleCheckout} disabled={paying} sx={{ flex: 2, background: "linear-gradient(135deg, #10B981, #059669)", fontWeight: 700 }}>
              {paying ? <CircularProgress size={24} color="inherit" /> : "Pay with Razorpay"}
            </Button>
          </Stack>
        </>)}
      </Drawer>
    </Box>
  );
};

export default SchoolUniforms;
