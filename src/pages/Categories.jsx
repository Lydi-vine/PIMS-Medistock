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
  Stack,
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
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { usePharmacy } from "../lib/pharmacy/store.jsx";
import {
  ConfirmDialog,
  EmptyState,
  FilterBar,
  Loading,
  NotifySnackbar,
  PageHeader,
  SearchField,
  TableShell,
} from "../components/pharmacy/ui.jsx";

export default function Categories() {
  const { data, loading, saveCategory, deleteCategory } = usePharmacy();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const [errorToast, setErrorToast] = useState(null);

  const counts = useMemo(() => {
    const map = new Map();
    data.medicines.forEach((m) => map.set(m.categoryId, (map.get(m.categoryId) ?? 0) + 1));
    return map;
  }, [data.medicines]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.categories.filter(
      (c) => !q || c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.id.toLowerCase().includes(q),
    );
  }, [data.categories, search]);

  if (loading) return <Loading />;

  return (
    <>
      <PageHeader
        title="Categories"
        subtitle="Group medicines by therapeutic class for easier stock monitoring."
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            Add category
          </Button>
        }
      />

      <FilterBar>
        <SearchField value={search} onChange={setSearch} placeholder="Search categories…" />
      </FilterBar>

      <TableShell>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Medicines</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <EmptyState message="No categories found" />
                </TableCell>
              </TableRow>
            ) : (
              rows.map((c) => (
                <TableRow key={c.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {c.id}
                    </Typography>
                  </TableCell>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.description}</TableCell>
                  <TableCell align="right">{counts.get(c.id) ?? 0}</TableCell>
                  <TableCell>
                    <Chip size="small" label={c.status} color={c.status === "Active" ? "success" : "default"} />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setEditing(c);
                            setFormOpen(true);
                          }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => setPendingDelete(c)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableShell>

      <CategoryForm
        open={formOpen}
        initial={editing}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        onSave={(values) => {
          saveCategory(values, editing?.id);
          setFormOpen(false);
          setEditing(null);
          setToast(editing ? "Category updated" : "Category added");
        }}
      />

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete category?"
        message={`Remove category “${pendingDelete?.name ?? ""}”? Categories with medicines cannot be deleted.`}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          const medCount = counts.get(pendingDelete.id) ?? 0;
          if (medCount > 0) {
            setErrorToast(`Cannot delete — ${medCount} medicine(s) still use this category`);
            setPendingDelete(null);
            return;
          }
          deleteCategory(pendingDelete.id);
          setToast("Category deleted");
          setPendingDelete(null);
        }}
      />

      <NotifySnackbar message={toast} onClose={() => setToast(null)} />
      <NotifySnackbar message={errorToast} severity="error" onClose={() => setErrorToast(null)} />
    </>
  );
}

function CategoryForm({ open, initial, onClose, onSave }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Active");
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(initial?.name ?? "");
    setDescription(initial?.description ?? "");
    setStatus(initial?.status ?? "Active");
    setErrors({});
    setSaving(false);
  }, [open, initial]);

  const submit = () => {
    const e = {};
    if (!name.trim()) e.name = "Category name is required";
    if (!description.trim()) e.description = "Description is required";
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    setTimeout(() => {
      onSave({ name: name.trim(), description: description.trim(), status });
      setSaving(false);
    }, 400);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initial ? `Edit ${initial.name}` : "Add category"}</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: "grid", gap: 2, pt: 1 }}>
          <TextField
            label="Category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!errors.name}
            helperText={errors.name}
            required
            fullWidth
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={!!errors.description}
            helperText={errors.description}
            required
            multiline
            rows={3}
            fullWidth
          />
          <TextField select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} fullWidth>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </TextField>
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
          {saving ? "Saving…" : "Save category"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
