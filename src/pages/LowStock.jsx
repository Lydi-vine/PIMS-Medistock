import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import {
  Button,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  usePharmacy,
  useCategoryName,
  isExpired,
  isLowStock,
  formatDate,
  medicineStatus,
} from "../lib/pharmacy/store";
import {
  EmptyState,
  FilterBar,
  Loading,
  PageHeader,
  SearchField,
  SelectField,
  StatusChip,
  TableShell,
  WarningAlert,
} from "../components/pharmacy/ui";

export default function LowStock() {
  const { data, loading } = usePharmacy();
  const categoryName = useCategoryName();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const lowStock = useMemo(
    () => data.medicines.filter((m) => !isExpired(m) && isLowStock(m)),
    [data.medicines],
  );

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return lowStock
      .filter((m) => {
        const matchesSearch =
          !q ||
          m.name.toLowerCase().includes(q) ||
          m.supplier.toLowerCase().includes(q) ||
          m.id.toLowerCase().includes(q);
        const matchesCategory = category === "all" || m.categoryId === category;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => a.quantity - a.reorderLevel - (b.quantity - b.reorderLevel));
  }, [lowStock, search, category]);

  if (loading) return <Loading />;

  return (
    <>
      <PageHeader
        title="Low Stock"
        subtitle="Medicines where current stock is at or below the reorder level."
      />

      {rows.length > 0 ? (
        <WarningAlert severity="warning">
          {rows.length} medicine(s) need reordering. Contact suppliers before stockouts.
        </WarningAlert>
      ) : (
        <WarningAlert severity="success">All monitored medicines are above their reorder levels.</WarningAlert>
      )}

      <FilterBar>
        <SearchField value={search} onChange={setSearch} placeholder="Search medicine or supplier…" />
        <SelectField
          label="Category"
          value={category}
          onChange={setCategory}
          options={[
            { value: "all", label: "All categories" },
            ...data.categories.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />
      </FilterBar>

      <TableShell>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Medicine</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Current stock</TableCell>
              <TableCell align="right">Reorder level</TableCell>
              <TableCell align="right">Difference</TableCell>
              <TableCell>Supplier</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <EmptyState message="No low-stock medicines match your filters" />
                </TableCell>
              </TableRow>
            ) : (
              rows.map((m) => {
                const diff = m.quantity - m.reorderLevel;
                return (
                  <TableRow key={m.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {m.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {m.id} · exp {formatDate(m.expirationDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>{categoryName(m.categoryId)}</TableCell>
                    <TableCell align="right">{m.quantity}</TableCell>
                    <TableCell align="right">{m.reorderLevel}</TableCell>
                    <TableCell align="right">
                      <Chip size="small" color="error" label={diff} />
                    </TableCell>
                    <TableCell>{m.supplier}</TableCell>
                    <TableCell>
                      <StatusChip status={medicineStatus(m)} />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View details">
                        <IconButton size="small" component={Link} to={`/medicines/${m.id}`}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Button size="small" component={Link} to="/stock" sx={{ ml: 0.5 }}>
                        Restock
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableShell>
    </>
  );
}
