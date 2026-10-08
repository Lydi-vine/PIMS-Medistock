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
  isNearExpiry,
  daysUntilExpiry,
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

export default function Expired() {
  const { data, loading } = usePharmacy();
  const categoryName = useCategoryName();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const expired = useMemo(() => data.medicines.filter(isExpired), [data.medicines]);
  const near = useMemo(() => data.medicines.filter(isNearExpiry), [data.medicines]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    const base =
      filter === "expired" ? expired : filter === "near" ? near : [...expired, ...near];
    return base
      .filter(
        (m) =>
          !q ||
          m.name.toLowerCase().includes(q) ||
          m.batchNumber.toLowerCase().includes(q) ||
          categoryName(m.categoryId).toLowerCase().includes(q),
      )
      .sort((a, b) => daysUntilExpiry(a) - daysUntilExpiry(b));
  }, [expired, near, filter, search, categoryName]);

  if (loading) return <Loading />;

  return (
    <>
      <PageHeader
        title="Expired Medicines"
        subtitle="Automatically flags stock past its expiration date and items within 30 days."
      />

      {expired.length > 0 && (
        <WarningAlert severity="error">
          {expired.length} medicine(s) have expired and should be removed from sale shelves.
        </WarningAlert>
      )}
      {near.length > 0 && (
        <WarningAlert severity="warning">
          {near.length} medicine(s) will expire within the next 30 days.
        </WarningAlert>
      )}

      <FilterBar>
        <SearchField value={search} onChange={setSearch} placeholder="Search medicine or batch…" />
        <SelectField
          label="Status"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "Expired + near expiry" },
            { value: "expired", label: "Expired only" },
            { value: "near", label: "Near expiry only" },
          ]}
        />
      </FilterBar>

      <TableShell>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Medicine</TableCell>
              <TableCell>Batch</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Quantity</TableCell>
              <TableCell>Expiration</TableCell>
              <TableCell align="right">Days</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <EmptyState message="No expired or near-expiry medicines" hint="All stock is within a safe shelf life." />
                </TableCell>
              </TableRow>
            ) : (
              rows.map((m) => {
                const days = daysUntilExpiry(m);
                return (
                  <TableRow key={m.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {m.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {m.id}
                      </Typography>
                    </TableCell>
                    <TableCell>{m.batchNumber}</TableCell>
                    <TableCell>{categoryName(m.categoryId)}</TableCell>
                    <TableCell align="right">{m.quantity}</TableCell>
                    <TableCell>{formatDate(m.expirationDate)}</TableCell>
                    <TableCell align="right">
                      <Chip
                        size="small"
                        color={days < 0 ? "error" : "warning"}
                        label={days < 0 ? `${Math.abs(days)} d overdue` : `${days} d left`}
                      />
                    </TableCell>
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
                        Adjust stock
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
