import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  Button,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  usePharmacy,
  useCategoryName,
  medicineStatus,
  formatRWF,
  formatDate,
} from "../lib/pharmacy/store";
import { MedicineForm } from "../components/pharmacy/MedicineForm";
import {
  ConfirmDialog,
  EmptyState,
  FilterBar,
  Loading,
  NotifySnackbar,
  PageHeader,
  SearchField,
  SelectField,
  StatusChip,
  TableShell,
} from "../components/pharmacy/ui";

export default function Medicines() {
  const { data, loading, saveMedicine, deleteMedicine } = usePharmacy();
  const categoryName = useCategoryName();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [stockStatus, setStockStatus] = useState("all");
  const [expiryStatus, setExpiryStatus] = useState("all");
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [toast, setToast] = useState(null);

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setStockStatus("all");
    setExpiryStatus("all");
    setSortKey("name");
    setSortDir("asc");
  };

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = data.medicines.filter((m) => {
      const status = medicineStatus(m);
      const matchesSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.genericName.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        m.batchNumber.toLowerCase().includes(q) ||
        m.manufacturer.toLowerCase().includes(q);
      const matchesCategory = category === "all" || m.categoryId === category;
      const matchesStock =
        stockStatus === "all" ||
        (stockStatus === "low" && (status === "Low Stock" || status === "Out of Stock")) ||
        (stockStatus === "ok" && status !== "Low Stock" && status !== "Out of Stock");
      const matchesExpiry =
        expiryStatus === "all" ||
        (expiryStatus === "expired" && status === "Expired") ||
        (expiryStatus === "near" && status === "Near Expiry") ||
        (expiryStatus === "ok" && status !== "Expired" && status !== "Near Expiry");
      return matchesSearch && matchesCategory && matchesStock && matchesExpiry;
    });

    list = [...list].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return list;
  }, [data.medicines, search, category, stockStatus, expiryStatus, sortKey, sortDir]);

  const onSave = (values) => {
    saveMedicine(values, editing?.id);
    setFormOpen(false);
    setEditing(null);
    setToast(editing ? "Medicine updated successfully" : "Medicine added successfully");
  };

  if (loading) return <Loading />;

  return (
    <>
      <PageHeader
        title="Medicines"
        subtitle="Manage the pharmacy catalogue — add, edit, search and filter stock."
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            Add medicine
          </Button>
        }
      />

      <FilterBar>
        <SearchField value={search} onChange={setSearch} placeholder="Search name, ID, batch…" />
        <SelectField
          label="Category"
          value={category}
          onChange={setCategory}
          options={[
            { value: "all", label: "All categories" },
            ...data.categories.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />
        <SelectField
          label="Stock status"
          value={stockStatus}
          onChange={setStockStatus}
          options={[
            { value: "all", label: "All stock" },
            { value: "low", label: "Low / out of stock" },
            { value: "ok", label: "Healthy stock" },
          ]}
        />
        <SelectField
          label="Expiration"
          value={expiryStatus}
          onChange={setExpiryStatus}
          options={[
            { value: "all", label: "All expiry" },
            { value: "expired", label: "Expired" },
            { value: "near", label: "Near expiry" },
            { value: "ok", label: "Not expiring soon" },
          ]}
        />
        <SelectField
          label="Sort by"
          value={sortKey}
          onChange={(v) => setSortKey(v)}
          options={[
            { value: "name", label: "Name" },
            { value: "quantity", label: "Quantity" },
            { value: "unitPrice", label: "Unit price" },
            { value: "expirationDate", label: "Expiration" },
          ]}
        />
        <SelectField
          label="Order"
          value={sortDir}
          onChange={(v) => setSortDir(v)}
          options={[
            { value: "asc", label: "Ascending" },
            { value: "desc", label: "Descending" },
          ]}
        />
        <Button onClick={clearFilters} sx={{ whiteSpace: "nowrap" }}>
          Clear filters
        </Button>
      </FilterBar>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Showing {rows.length} of {data.medicines.length} medicines
      </Typography>

      <TableShell>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Medicine</TableCell>
              <TableCell>Generic</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Manufacturer</TableCell>
              <TableCell>Batch</TableCell>
              <TableCell align="right">Unit price</TableCell>
              <TableCell align="right">Qty</TableCell>
              <TableCell>Expiration</TableCell>
              <TableCell align="right">Reorder</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12}>
                  <EmptyState message="No medicines match your filters" hint="Try clearing filters or add a new medicine." />
                </TableCell>
              </TableRow>
            ) : (
              rows.map((m) => {
                const status = medicineStatus(m);
                return (
                  <TableRow key={m.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {m.id}
                      </Typography>
                    </TableCell>
                    <TableCell>{m.name}</TableCell>
                    <TableCell>{m.genericName}</TableCell>
                    <TableCell>{categoryName(m.categoryId)}</TableCell>
                    <TableCell>{m.manufacturer}</TableCell>
                    <TableCell>{m.batchNumber}</TableCell>
                    <TableCell align="right">{formatRWF(m.unitPrice)}</TableCell>
                    <TableCell align="right">{m.quantity}</TableCell>
                    <TableCell>{formatDate(m.expirationDate)}</TableCell>
                    <TableCell align="right">{m.reorderLevel}</TableCell>
                    <TableCell>
                      <StatusChip status={status} />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="View details">
                          <IconButton size="small" component={Link} to={`/medicines/${m.id}`}>
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditing(m);
                              setFormOpen(true);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => setPendingDelete(m)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableShell>

      <MedicineForm
        open={formOpen}
        initial={editing}
        categories={data.categories}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSave={onSave}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete medicine?"
        message={`Remove ${pendingDelete?.name ?? ""} from the catalogue? This cannot be undone.`}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            deleteMedicine(pendingDelete.id);
            setToast("Medicine deleted");
          }
          setPendingDelete(null);
        }}
      />

      <NotifySnackbar message={toast} onClose={() => setToast(null)} />
    </>
  );
}
