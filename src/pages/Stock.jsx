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
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { usePharmacy, useMedicineName, formatDate } from "../lib/pharmacy/store.jsx";
import {
  EmptyState,
  FilterBar,
  Loading,
  NotifySnackbar,
  PageHeader,
  SearchField,
  SelectField,
  TableShell,
} from "../components/pharmacy/ui.jsx";

const MOVEMENT_TYPES = ["Stock In", "Stock Out", "Adjustment", "Return"];

export default function Stock() {
  const { data, loading, recordMovement } = usePharmacy();
  const medicineName = useMedicineName();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [formOpen, setFormOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [errorToast, setErrorToast] = useState(null);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...data.movements]
      .filter((mv) => {
        const name = medicineName(mv.medicineId).toLowerCase();
        const matchesSearch =
          !q ||
          mv.id.toLowerCase().includes(q) ||
          name.includes(q) ||
          mv.batchNumber.toLowerCase().includes(q) ||
          mv.reason.toLowerCase().includes(q) ||
          mv.user.toLowerCase().includes(q);
        const matchesType = typeFilter === "all" || mv.type === typeFilter;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [data.movements, search, typeFilter, medicineName]);

  if (loading) return <Loading />;

  return (
    <>
      <PageHeader
        title="Stock Management"
        subtitle="Record stock in, stock out, adjustments and returns. Quantities update live."
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
            Record movement
          </Button>
        }
      />

      <FilterBar>
        <SearchField value={search} onChange={setSearch} placeholder="Search movement, medicine, reason…" />
        <SelectField
          label="Movement type"
          value={typeFilter}
          onChange={setTypeFilter}
          options={[
            { value: "all", label: "All types" },
            ...MOVEMENT_TYPES.map((t) => ({ value: t, label: t })),
          ]}
        />
      </FilterBar>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        {rows.length} movement(s)
      </Typography>

      <TableShell>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Movement ID</TableCell>
              <TableCell>Medicine</TableCell>
              <TableCell>Batch</TableCell>
              <TableCell>Type</TableCell>
              <TableCell align="right">Qty</TableCell>
              <TableCell align="right">Previous</TableCell>
              <TableCell align="right">New stock</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Staff</TableCell>
              <TableCell>Reason</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10}>
                  <EmptyState message="No stock movements found" />
                </TableCell>
              </TableRow>
            ) : (
              rows.map((mv) => (
                <TableRow key={mv.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {mv.id}
                    </Typography>
                  </TableCell>
                  <TableCell>{medicineName(mv.medicineId)}</TableCell>
                  <TableCell>{mv.batchNumber}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={mv.type}
                      color={mv.type === "Stock Out" || mv.type === "Adjustment" ? "warning" : "success"}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">{mv.quantity}</TableCell>
                  <TableCell align="right">{mv.previousStock}</TableCell>
                  <TableCell align="right">{mv.newStock}</TableCell>
                  <TableCell>{formatDate(mv.date)}</TableCell>
                  <TableCell>{mv.user}</TableCell>
                  <TableCell>{mv.reason}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableShell>

      <MovementForm
        open={formOpen}
        medicines={data.medicines}
        onClose={() => setFormOpen(false)}
        onSave={(input) => {
          const result = recordMovement(input);
          if (!result.ok) {
            setErrorToast(result.error);
            return;
          }
          setFormOpen(false);
          setToast("Stock movement recorded");
        }}
      />

      <NotifySnackbar message={toast} onClose={() => setToast(null)} />
      <NotifySnackbar message={errorToast} severity="error" onClose={() => setErrorToast(null)} />
    </>
  );
}

function MovementForm({ open, medicines, onClose, onSave }) {
  const [medicineId, setMedicineId] = useState("");
  const [type, setType] = useState("Stock In");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [user, setUser] = useState("J. Uwase");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMedicineId(medicines[0]?.id ?? "");
    setType("Stock In");
    setQuantity(1);
    setReason("");
    setUser("J. Uwase");
    setErrors({});
    setSaving(false);
  }, [open, medicines]);

  const selected = medicines.find((m) => m.id === medicineId);

  const submit = () => {
    const e = {};
    if (!medicineId) e.medicineId = "Select a medicine";
    if (!(quantity > 0)) e.quantity = "Quantity must be greater than zero";
    if (!reason.trim()) e.reason = "Reason is required";
    if (!user.trim()) e.user = "Staff name is required";
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    setTimeout(() => {
      onSave({ medicineId, type, quantity, reason: reason.trim(), user: user.trim() });
      setSaving(false);
    }, 400);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Record stock movement</DialogTitle>
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
              (selected ? `Current stock: ${selected.quantity} · Batch ${selected.batchNumber}` : "")
            }
            required
            fullWidth
          >
            {medicines.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {m.name} ({m.id})
              </MenuItem>
            ))}
          </TextField>
          <TextField select label="Movement type" value={type} onChange={(e) => setType(e.target.value)} fullWidth>
            {MOVEMENT_TYPES.map((t) => (
              <MenuItem key={t} value={t}>
                {t}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            error={!!errors.quantity}
            helperText={errors.quantity}
            required
            fullWidth
          />
          <TextField
            label="Staff / user"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            error={!!errors.user}
            helperText={errors.user}
            required
            fullWidth
          />
          <TextField
            label="Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            error={!!errors.reason}
            helperText={errors.reason}
            required
            fullWidth
            multiline
            rows={2}
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
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {saving ? "Saving…" : "Save movement"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
