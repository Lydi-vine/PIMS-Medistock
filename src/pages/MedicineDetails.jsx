import { Link, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import {
  usePharmacy,
  useCategoryName,
  medicineStatus,
  formatRWF,
  formatDate,
} from "../lib/pharmacy/store.jsx";
import { MedicineForm } from "../components/pharmacy/MedicineForm.jsx";
import {
  EmptyState,
  Loading,
  NotifySnackbar,
  PageHeader,
  SectionCard,
  StatusChip,
  TableShell,
  WarningAlert,
} from "../components/pharmacy/ui.jsx";
import { Grid } from "../components/pharmacy/Layout.jsx";

export default function MedicineDetails() {
  const { medicineId } = useParams();
  const { data, loading, saveMedicine } = usePharmacy();
  const categoryName = useCategoryName();
  const [tab, setTab] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const medicine = data.medicines.find((m) => m.id === medicineId);
  const movements = useMemo(
    () => data.movements.filter((m) => m.medicineId === medicineId).sort((a, b) => b.date.localeCompare(a.date)),
    [data.movements, medicineId],
  );
  const sales = useMemo(
    () => data.sales.filter((s) => s.medicineId === medicineId).sort((a, b) => b.date.localeCompare(a.date)),
    [data.sales, medicineId],
  );

  if (loading) return <Loading />;

  if (!medicine) {
    return (
      <Box>
        <WarningAlert severity="error">Medicine {medicineId} was not found.</WarningAlert>
        <Button component={Link} to="/medicines" startIcon={<ArrowBackIcon />}>
          Back to medicines
        </Button>
      </Box>
    );
  }

  const status = medicineStatus(medicine);

  const onSave = (values) => {
    saveMedicine(values, medicine.id);
    setEditOpen(false);
    setToast("Medicine updated successfully");
  };

  return (
    <>
      <PageHeader
        title={medicine.name}
        subtitle={`${medicine.id} · ${medicine.genericName}`}
        action={
          <Stack direction="row" spacing={1}>
            <Button component={Link} to="/medicines" startIcon={<ArrowBackIcon />}>
              Back
            </Button>
            <Button variant="contained" startIcon={<EditIcon />} onClick={() => setEditOpen(true)}>
              Edit
            </Button>
          </Stack>
        }
      />

      <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
        <StatusChip status={status} size="medium" />
        <Chip label={categoryName(medicine.categoryId)} variant="outlined" />
        <Chip label={`Batch ${medicine.batchNumber}`} variant="outlined" />
      </Stack>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Overview" />
        <Tab label={`Stock History (${movements.length})`} />
        <Tab label={`Sales History (${sales.length})`} />
      </Tabs>

      {tab === 0 && (
        <Grid min={280}>
          <SectionCard title="Medicine information">
            <InfoRow label="Manufacturer" value={medicine.manufacturer} />
            <InfoRow label="Supplier" value={medicine.supplier} />
            <InfoRow label="Batch number" value={medicine.batchNumber} />
            <InfoRow label="Description" value={medicine.description || "—"} />
            <InfoRow label="Added" value={formatDate(medicine.createdAt)} />
          </SectionCard>
          <SectionCard title="Stock & pricing">
            <InfoRow label="Current stock" value={`${medicine.quantity} units`} />
            <InfoRow label="Reorder level" value={String(medicine.reorderLevel)} />
            <InfoRow label="Unit price" value={formatRWF(medicine.unitPrice)} />
            <InfoRow label="Stock value" value={formatRWF(medicine.quantity * medicine.unitPrice)} />
            <InfoRow label="Expiration date" value={formatDate(medicine.expirationDate)} />
            <InfoRow label="Stock status" value={<StatusChip status={status} />} />
          </SectionCard>
        </Grid>
      )}

      {tab === 1 && (
        <TableShell>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Movement ID</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Qty</TableCell>
                <TableCell align="right">Previous</TableCell>
                <TableCell align="right">New</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Staff</TableCell>
                <TableCell>Reason</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {movements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <EmptyState message="No stock movements for this medicine" />
                  </TableCell>
                </TableRow>
              ) : (
                movements.map((mv) => (
                  <TableRow key={mv.id} hover>
                    <TableCell>{mv.id}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={mv.type}
                        color={mv.type === "Stock Out" ? "error" : "success"}
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
      )}

      {tab === 2 && (
        <TableShell>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Sale ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell align="right">Qty</TableCell>
                <TableCell align="right">Unit price</TableCell>
                <TableCell align="right">Total</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Staff</TableCell>
                <TableCell>Payment</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <EmptyState message="No sales recorded for this medicine" />
                  </TableCell>
                </TableRow>
              ) : (
                sales.map((s) => (
                  <TableRow key={s.id} hover>
                    <TableCell>{s.id}</TableCell>
                    <TableCell>{formatDate(s.date)}</TableCell>
                    <TableCell align="right">{s.quantity}</TableCell>
                    <TableCell align="right">{formatRWF(s.unitPrice)}</TableCell>
                    <TableCell align="right">{formatRWF(s.total)}</TableCell>
                    <TableCell>{s.customer}</TableCell>
                    <TableCell>{s.staff}</TableCell>
                    <TableCell>{s.paymentMethod}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableShell>
      )}

      <MedicineForm
        open={editOpen}
        initial={medicine}
        categories={data.categories}
        onClose={() => setEditOpen(false)}
        onSave={onSave}
      />
      <NotifySnackbar message={toast} onClose={() => setToast(null)} />
    </>
  );
}

function InfoRow({ label, value }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ py: 0.75, borderBottom: 1, borderColor: "divider" }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} textAlign="right">
        {value}
      </Typography>
    </Stack>
  );
}
