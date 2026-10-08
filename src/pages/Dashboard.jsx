import { Link } from "react-router-dom";
import { useMemo } from "react";
import {
  Box,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import MedicationIcon from "@mui/icons-material/Medication";
import CategoryIcon from "@mui/icons-material/Category";
import InventoryIcon from "@mui/icons-material/Inventory2";
import WarningIcon from "@mui/icons-material/ReportProblem";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import TodayIcon from "@mui/icons-material/Today";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import {
  usePharmacy,
  isExpired,
  isLowStock,
  isNearExpiry,
  medicineStatus,
  formatRWF,
  formatDate,
  daysUntilExpiry,
} from "../lib/pharmacy/store.jsx";
import { Grid } from "../components/pharmacy/Layout.jsx";
import {
  EmptyState,
  Loading,
  PageHeader,
  SectionCard,
  StatusChip,
  SummaryCard,
  WarningAlert,
} from "../components/pharmacy/ui.jsx";
import {
  ExpiredVsActiveChart,
  MonthlySalesChart,
  StockByCategoryChart,
} from "../components/pharmacy/charts.jsx";

export default function Dashboard() {
  const { data, loading } = usePharmacy();
  const { medicines, categories, sales, movements } = data;

  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const monthStr = todayStr.slice(0, 7);
    const totalStock = medicines.reduce((sum, m) => sum + m.quantity, 0);
    const expired = medicines.filter(isExpired);
    const low = medicines.filter((m) => !isExpired(m) && isLowStock(m));
    const near = medicines.filter(isNearExpiry);
    const todaySales = sales.filter((s) => s.date === todayStr);
    const monthSales = sales.filter((s) => s.date.startsWith(monthStr));
    return {
      totalStock,
      expired,
      low,
      near,
      active: medicines.filter((m) => medicineStatus(m) === "Active").length,
      todayTotal: todaySales.reduce((s, x) => s + x.total, 0),
      monthTotal: monthSales.reduce((s, x) => s + x.total, 0),
    };
  }, [medicines, sales]);

  const stockByCategory = useMemo(
    () =>
      categories.map((c) => ({
        name: c.name,
        value: medicines.filter((m) => m.categoryId === c.id).reduce((s, m) => s + m.quantity, 0),
      })),
    [categories, medicines],
  );

  const monthlySales = useMemo(() => {
    const map = new Map();
    sales.forEach((s) => map.set(s.date.slice(0, 7), (map.get(s.date.slice(0, 7)) ?? 0) + s.total));
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, total]) => ({
        month: new Date(`${month}-01`).toLocaleDateString("en-GB", { month: "short", year: "2-digit" }),
        total,
      }));
  }, [sales]);

  const expiredVsActive = useMemo(
    () => [
      { name: "Active", value: medicines.filter((m) => !isExpired(m) && !isNearExpiry(m)).length },
      { name: "Expired", value: stats.expired.length },
      { name: "Near expiry", value: stats.near.length },
    ],
    [medicines, stats],
  );

  const medName = (id) => medicines.find((m) => m.id === id)?.name ?? "Unknown";

  if (loading) return <Loading label="Loading pharmacy data…" />;

  return (
    <Box>
      <PageHeader
        title="Dashboard"
        subtitle={`Pharmacy overview for ${formatDate(new Date().toISOString().slice(0, 10))}`}
      />

      {stats.expired.length > 0 && (
        <WarningAlert severity="error">
          {stats.expired.length} medicine(s) have expired and must be removed from the shelves.{" "}
          <Link to="/expired">Review expired medicines</Link>
        </WarningAlert>
      )}
      {stats.low.length > 0 && (
        <WarningAlert severity="warning">
          {stats.low.length} medicine(s) reached the reorder level. <Link to="/low-stock">View low stock</Link>
        </WarningAlert>
      )}

      <Grid min={230}>
        <SummaryCard label="Total medicines" value={medicines.length} icon={<MedicationIcon />} />
        <SummaryCard label="Categories" value={categories.length} icon={<CategoryIcon />} tone="info" />
        <SummaryCard label="Total stock quantity" value={stats.totalStock.toLocaleString()} icon={<InventoryIcon />} tone="secondary" />
        <SummaryCard label="Low-stock medicines" value={stats.low.length} icon={<WarningIcon />} tone="warning" />
        <SummaryCard label="Expired medicines" value={stats.expired.length} icon={<EventBusyIcon />} tone="error" />
        <SummaryCard label="Active medicines" value={stats.active} icon={<CheckCircleIcon />} tone="success" />
        <SummaryCard label="Today's sales" value={formatRWF(stats.todayTotal)} icon={<TodayIcon />} tone="primary" />
        <SummaryCard label="Monthly sales" value={formatRWF(stats.monthTotal)} icon={<TrendingUpIcon />} tone="success" />
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Grid min={340}>
          <SectionCard title="Stock by category">
            <StockByCategoryChart data={stockByCategory} />
          </SectionCard>
          <SectionCard title="Monthly sales">
            <MonthlySalesChart data={monthlySales} />
          </SectionCard>
          <SectionCard title="Expired vs active medicines">
            <ExpiredVsActiveChart data={expiredVsActive} />
          </SectionCard>
        </Grid>
      </Box>

      <Box sx={{ mt: 3 }}>
        <Grid min={320}>
          <SectionCard title="Recently added medicines">
            <CompactList
              items={[...medicines]
                .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                .slice(0, 5)
                .map((m) => ({
                  key: m.id,
                  primary: m.name,
                  secondary: `${m.quantity} units · added ${formatDate(m.createdAt)}`,
                  end: <StatusChip status={medicineStatus(m)} />,
                }))}
              empty="No medicines recorded yet"
            />
          </SectionCard>

          <SectionCard title="Recent sales">
            <CompactList
              items={[...sales]
                .sort((a, b) => b.date.localeCompare(a.date))
                .slice(0, 5)
                .map((s) => ({
                  key: s.id,
                  primary: `${medName(s.medicineId)} × ${s.quantity}`,
                  secondary: `${formatDate(s.date)} · ${s.customer}`,
                  end: <Chip size="small" label={formatRWF(s.total)} color="success" variant="outlined" />,
                }))}
              empty="No sales recorded yet"
            />
          </SectionCard>

          <SectionCard title="Close to expiration (30 days)">
            <CompactList
              items={stats.near.slice(0, 5).map((m) => ({
                key: m.id,
                primary: m.name,
                secondary: `Batch ${m.batchNumber} · expires ${formatDate(m.expirationDate)}`,
                end: <Chip size="small" color="warning" label={`${daysUntilExpiry(m)} d`} />,
              }))}
              empty="No medicine is expiring soon"
            />
          </SectionCard>

          <SectionCard title="Low-stock alerts">
            <CompactList
              items={stats.low.slice(0, 5).map((m) => ({
                key: m.id,
                primary: m.name,
                secondary: `Stock ${m.quantity} · reorder at ${m.reorderLevel}`,
                end: <Chip size="small" color="error" label={`-${m.reorderLevel - m.quantity}`} />,
              }))}
              empty="All medicines are above their reorder level"
            />
          </SectionCard>

          <SectionCard title="Recent stock movements">
            <CompactList
              items={[...movements]
                .sort((a, b) => b.date.localeCompare(a.date))
                .slice(0, 5)
                .map((mv) => ({
                  key: mv.id,
                  primary: `${mv.type}: ${medName(mv.medicineId)}`,
                  secondary: `${formatDate(mv.date)} · ${mv.user} · ${mv.reason}`,
                  end: (
                    <Chip
                      size="small"
                      variant="outlined"
                      color={mv.type === "Stock Out" ? "error" : "success"}
                      label={`${mv.previousStock} → ${mv.newStock}`}
                    />
                  ),
                }))}
              empty="No stock movements recorded"
            />
          </SectionCard>
        </Grid>
      </Box>
    </Box>
  );
}

function CompactList({ items, empty }) {
  if (items.length === 0) return <EmptyState message={empty} />;
  return (
    <List dense disablePadding>
      {items.map((item, i) => (
        <Box key={item.key}>
          {i > 0 && <Divider component="li" />}
          <ListItem disableGutters secondaryAction={item.end}>
            <ListItemText
              primary={<Typography variant="body2" fontWeight={600}>{item.primary}</Typography>}
              secondary={<Typography variant="caption" color="text.secondary">{item.secondary}</Typography>}
            />
          </ListItem>
        </Box>
      ))}
    </List>
  );
}
