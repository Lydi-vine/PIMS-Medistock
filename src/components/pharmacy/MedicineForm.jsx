import { useEffect, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from "@mui/material";

const emptyForm = {
  name: "",
  genericName: "",
  categoryId: "",
  manufacturer: "",
  batchNumber: "",
  unitPrice: 0,
  quantity: 0,
  reorderLevel: 0,
  expirationDate: "",
  supplier: "",
  description: "",
};

export function MedicineForm({ open, initial, categories, onClose, onSave }) {
  const [values, setValues] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setSaving(false);
    setValues(
      initial
        ? {
            name: initial.name,
            genericName: initial.genericName,
            categoryId: initial.categoryId,
            manufacturer: initial.manufacturer,
            batchNumber: initial.batchNumber,
            unitPrice: initial.unitPrice,
            quantity: initial.quantity,
            reorderLevel: initial.reorderLevel,
            expirationDate: initial.expirationDate,
            supplier: initial.supplier,
            description: initial.description,
          }
        : emptyForm,
    );
  }, [open, initial]);

  const set = (key, value) => setValues((v) => ({ ...v, [key]: value }));

  const validate = () => {
    const e = {};
    if (!values.name.trim()) e.name = "Medicine name is required";
    if (!values.genericName.trim()) e.genericName = "Generic name is required";
    if (!values.categoryId) e.categoryId = "Select a category";
    if (!values.manufacturer.trim()) e.manufacturer = "Manufacturer is required";
    if (!values.batchNumber.trim()) e.batchNumber = "Batch number is required";
    if (!values.supplier.trim()) e.supplier = "Supplier is required";
    if (!(values.unitPrice > 0)) e.unitPrice = "Unit price must be a positive number";
    if (values.quantity < 0 || Number.isNaN(values.quantity)) e.quantity = "Quantity must be 0 or more";
    if (values.reorderLevel < 0 || Number.isNaN(values.reorderLevel))
      e.reorderLevel = "Reorder level must be 0 or more";
    if (!values.expirationDate) e.expirationDate = "Expiration date is required";
    else if (Number.isNaN(new Date(values.expirationDate).getTime()))
      e.expirationDate = "Enter a valid date";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    setSaving(true);
    setTimeout(() => {
      onSave(values);
      setSaving(false);
    }, 500);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{initial ? `Edit ${initial.name}` : "Add new medicine"}</DialogTitle>
      <DialogContent dividers>
        <Box
          sx={{
            display: "grid",
            gap: 2,
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            pt: 1,
          }}
        >
          <TextField label="Medicine name" value={values.name} onChange={(e) => set("name", e.target.value)} error={!!errors.name} helperText={errors.name} required fullWidth />
          <TextField label="Generic name" value={values.genericName} onChange={(e) => set("genericName", e.target.value)} error={!!errors.genericName} helperText={errors.genericName} required fullWidth />
          <TextField select label="Category" value={values.categoryId} onChange={(e) => set("categoryId", e.target.value)} error={!!errors.categoryId} helperText={errors.categoryId} required fullWidth>
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField label="Manufacturer" value={values.manufacturer} onChange={(e) => set("manufacturer", e.target.value)} error={!!errors.manufacturer} helperText={errors.manufacturer} required fullWidth />
          <TextField label="Batch number" value={values.batchNumber} onChange={(e) => set("batchNumber", e.target.value)} error={!!errors.batchNumber} helperText={errors.batchNumber} required fullWidth />
          <TextField label="Unit price (RWF)" type="number" value={values.unitPrice} onChange={(e) => set("unitPrice", Number(e.target.value))} error={!!errors.unitPrice} helperText={errors.unitPrice} required fullWidth />
          <TextField label="Quantity" type="number" value={values.quantity} onChange={(e) => set("quantity", Number(e.target.value))} error={!!errors.quantity} helperText={errors.quantity} required fullWidth />
          <TextField label="Reorder level" type="number" value={values.reorderLevel} onChange={(e) => set("reorderLevel", Number(e.target.value))} error={!!errors.reorderLevel} helperText={errors.reorderLevel} required fullWidth />
          <TextField label="Expiration date" type="date" value={values.expirationDate} onChange={(e) => set("expirationDate", e.target.value)} error={!!errors.expirationDate} helperText={errors.expirationDate} required fullWidth InputLabelProps={{ shrink: true }} />
          <TextField label="Supplier" value={values.supplier} onChange={(e) => set("supplier", e.target.value)} error={!!errors.supplier} helperText={errors.supplier} required fullWidth />
          <Box sx={{ gridColumn: { sm: "1 / -1" } }}>
            <TextField label="Description" value={values.description} onChange={(e) => set("description", e.target.value)} multiline rows={3} fullWidth />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={submit}
          variant="contained"
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {saving ? "Saving…" : "Save medicine"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
