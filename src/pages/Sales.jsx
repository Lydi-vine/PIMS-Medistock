import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  usePharmacy,
  useMedicineName,
  formatRWF,
  formatDate,
} from "../lib/pharmacy/store";
import { Grid } from "../components/pharmacy/Layout";
import {
  EmptyState,
  FilterBar,
  Loading,
  NotifySnackbar,
  PageHeader,
  SearchField,
  SelectField,
  SummaryCard,
  TableShell,
} from "../components/pharmacy/ui";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import PaymentsIcon from "@mui/icons-material/Payments";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

const PAYMENTS = ["Cash", "Mobile Money", "Insurance", "Card"];

export default function Sales() {
  const { data, loading, recordSale } = usePharmacy();
  const medicineName = useMedicineName();
  const [search, setSearch] = useState("");
  const [medicineFilter, setMedicineFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [detail, setDetail] = useState(null);
  const [toast, setToast] = useState(null);
  const [errorToast, setErrorToast] = useState(null);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...data.sales]
      .filter((s) => {
        const name = medicineName(s.medicineId).toLowerCase();
        const matchesSearch =
          !q ||
          s.id.toLowerCase().includes(q) ||
          name.includes(q) ||
          s.customer.toLowerCase().includes(q) ||
          s.staff.toLowerCase().includes(q);
        const matchesMed = medicineFilter === "all" || s.medicineId === medicineFilter;
        const matchesPay = paymentFilter === "all" || s.paymentMethod === paymentFilter;
        const matchesFrom = !dateFrom || s.date >= dateFrom;
        const matchesTo = !dateTo || s.date <= dateTo;
        return matchesSearch && matchesMed && matchesPay && matchesFrom && matchesTo;
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  }, [data.sales, search, medicineFilter, paymentFilter, dateFrom, dateTo, medicineName]);

  const totalSales = rows.reduce((sum, s) => sum + s.total, 0);

  if (loading) return <Loading />;

  return (
    <>
      <PageHeader
        title="Sales"
        subtitle="Record dispensary sales. Stock is reduced automatically when a sale is saved."
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
            Record sale
          </Button>
        }
      />

      <Box sx={{ mb: 2 }}>
        <Grid min={220}>
          <SummaryCard label="Filtered sales" value={rows.length} icon={<ReceiptLongIcon />} />
          <SummaryCard label="Total amount" value={formatRWF(totalSales)} icon={<PaymentsIcon />} tone="success" />
          <SummaryCard label="All-time sales" value={data.sales.length} icon={<PointOfSaleIcon />} tone="info" />
        </Grid>
      </Box>

      <FilterBar>
        <SearchField value={search} onChange={setSearch} placeholder="Search sale, customer, medicine…" />
        <SelectField
          label="Medicine"
          value={medicineFilter}
          onChange={setMedicineFilter}
          options={[
            { value: "all", label: "All medicines" },
            ...data.medicines.map((m) => ({ value: m.id, label: m.name })),
          ]}
        />
        <SelectField
          label="Payment"
          value={paymentFilter}
          onChange={setPaymentFilter}
          options={[
            { value: "all", label: "All methods" },
            ...PAYMENTS.map((p) => ({ value: p, label: p })),
          ]}
        />
        <TextField
          size="small"
          type="date"
          label="From"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          fullWidth
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          size="small"
          type="date"
          label="To"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          fullWidth
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <Button
          onClick={() => {
            setSearch("");
            setMedicineFilter("all");
            setPaymentFilter("all");
            setDateFrom("");
            setDateTo("");
          }}
        >
          Clear
        </Button>
      </FilterBar>

      <TableShell>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Sale ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Medicine</TableCell>
              <TableCell align="right">Qty</TableCell>
              <TableCell align="right">Unit price</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Staff</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell align="right">Details</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10}>
                  <EmptyState message="No sales match your filters" />
                </TableCell>
              </TableRow>
            ) : (
              rows.map((s) => (
                <TableRow key={s.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {s.id}
                    </Typography>
                  </TableCell>
                  <TableCell>{formatDate(s.date)}</TableCell>
                  <TableCell>{medicineName(s.medicineId)}</TableCell>
                  <TableCell align="right">{s.quantity}</TableCell>
                  <TableCell align="right">{formatRWF(s.unitPrice)}</TableCell>
                  <TableCell align="right">{formatRWF(s.total)}</TableCell>
                  <TableCell>{s.customer}</TableCell>
                  <TableCell>{s.staff}</TableCell>
                  <TableCell>
                    <Chip size="small" label={s.paymentMethod} variant="outlined" />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View sale details">
                      <IconButton size="small" onClick={() => setDetail(s)}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableShell>

      <SaleForm
        open={formOpen}
        medicines={data.medicines}
        onClose={() => setFormOpen(false)}
        onSave={(input) => {
          const result = recordSale(input);
          if (!result.ok) {
            setErrorToast(result.error);
            return;
          }
          setFormOpen(false);
          setToast("Sale recorded and stock updated");
        }}
      />

      <Dialog open={!!detail} onClose={() => setDetail(null)} fullWidth maxWidth="sm">
        <DialogTitle>Sale {detail?.id}</DialogTitle>
        <DialogContent dividers>
          {detail && (
            <Box sx={{ display: "grid", gap: 1.25 }}>
              <DetailRow label="Date" value={formatDate(detail.date)} />
              <DetailRow label="Medicine" value={medicineName(detail.medicineId)} />
              <DetailRow label="Quantity" value={String(detail.quantity)} />
              <DetailRow label="Unit price" value={formatRWF(detail.unitPrice)} />
              <DetailRow label="Total (qty × price)" value={formatRWF(detail.total)} />
              <DetailRow label="Customer" value={detail.customer} />
              <DetailRow label="Staff" value={detail.staff} />
              <DetailRow label="Payment method" value={detail.paymentMethod} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetail(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <NotifySnackbar message={toast} onClose={() => setToast(null)} />
      <NotifySnackbar message={errorToast} severity="error" onClose={() => setErrorToast(null)} />
    </>
  );
}

function DetailRow({ label, value }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.5, borderBottom: 1, borderColor: "divider" }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {value}
      </Typography>
    </Box>
  );
}

function SaleForm({ open, medicines, onClose, onSave }) {
  const available = medicines.filter((m) => m.quantity > 0);
  const [medicineId, setMedicineId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [customer, setCustomer] = useState("Walk-in Customer");
  const [staff, setStaff] = useState("J. Uwase");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    const first = medicines.find((m) => m.quantity > 0);
    setMedicineId(first?.id ?? "");
    setQuantity(1);
    setCustomer("Walk-in Customer");
    setStaff("J. Uwase");
    setPaymentMethod("Cash");
    setDate(new Date().toISOString().slice(0, 10));
    setErrors({});
    setSaving(false);
  }, [open, medicines]);

  const selected = medicines.find((m) => m.id === medicineId);
  const previewTotal = selected ? quantity * selected.unitPrice : 0;

  const submit = () => {
    const e = {};
    if (!medicineId) e.medicineId = "Select a medicine";
    if (!(quantity > 0)) e.quantity = "Quantity must be greater than zero";
    if (selected && quantity > selected.quantity) e.quantity = `Only ${selected.quantity} units available`;
    if (!customer.trim()) e.customer = "Customer is required";
    if (!staff.trim()) e.staff = "Staff is required";
    if (!date) e.date = "Date is required";
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    setTimeout(() => {
      onSave({
        medicineId,
        quantity,
        customer: customer.trim(),
        staff: staff.trim(),
        paymentMethod,
        date,
      });
      setSaving(false);
    }, 400);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Record sale</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "grid", gap: 2, pt: 1 }}>
          <TextField
            select
            label="Medicine"
            value={medicineId}
            onChange={(e) => setMedicineId(e.target.value)}
            error={!!errors.medicineId}
            helperText={
              errors.medicineId ||
              (selected ? `In stock: ${selected.quantity} · ${formatRWF(selected.unitPrice)} each` : "No stocked medicines")
            }
            required
            fullWidth
          >
            {available.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {m.name} ({m.quantity} left)
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            error={!!errors.quantity}
            helperText={errors.quantity || `Total = ${formatRWF(previewTotal)}`}
            required
            fullWidth
          />
          <TextField
            label="Customer"
            value={customer}
            onChange={(e) => setCustomer(e.target.value)}
            error={!!errors.customer}
            helperText={errors.customer}
            required
            fullWidth
          />
          <TextField
            label="Staff"
            value={staff}
            onChange={(e) => setStaff(e.target.value)}
            error={!!errors.staff}
            helperText={errors.staff}
            required
            fullWidth
          />
          <TextField
            select
            label="Payment method"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            fullWidth
          >
            {PAYMENTS.map((p) => (
              <MenuItem key={p} value={p}>
                {p}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            error={!!errors.date}
            helperText={errors.date}
            required
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={submit}
          disabled={saving || available.length === 0}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {saving ? "Saving…" : "Save sale"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
