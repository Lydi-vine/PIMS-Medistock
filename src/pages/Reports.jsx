import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import DownloadIcon from "@mui/icons-material/Download";
import {
  usePharmacy,
  useCategoryName,
  useMedicineName,
  isExpired,
  isLowStock,
  isNearExpiry,
  medicineStatus,
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
  SectionCard,
  SelectField,
  StatusChip,
  SummaryCard,
  TableShell,
} from "../components/pharmacy/ui";
import {
  ExpiredVsActiveChart,
  MonthlySalesChart,
  StockByCategoryChart,
} from "../components/pharmacy/charts";
import InventoryIcon from "@mui/icons-material/Inventory2";
import WarningIcon from "@mui/icons-material/ReportProblem";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

export default function Reports() {
  const { data, loading } = usePharmacy();
  const categoryName = useCategoryName();
  const medicineName = useMedicineName();
  const [report, setReport] = useState("stock");
  const [category, setCategory] = useState("all");
  const [medicine, setMedicine] = useState("all");
  const [stockStatus, setStockStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [toast, setToast] = useState(null);

  const filteredMedicines = useMemo(() => {
    return data.medicines.filter((m) => {
      const status = medicineStatus(m);
      const matchesCategory = category === "all" || m.categoryId === category;
      const matchesMedicine = medicine === "all" || m.id === medicine;
      const matchesStatus =
        stockStatus === "all" ||
        (stockStatus === "low" && isLowStock(m) && !isExpired(m)) ||
        (stockStatus === "expired" && isExpired(m)) ||
        (stockStatus === "near" && isNearExpiry(m)) ||
        (stockStatus === "active" && status === "Active");
      return matchesCategory && matchesMedicine && matchesStatus;
    });
  }, [data.medicines, category, medicine, stockStatus]);

  const filteredSales = useMemo(() => {
    return data.sales.filter((s) => {
      const matchesMedicine = medicine === "all" || s.medicineId === medicine;
      const matchesCategory =
        category === "all" || data.medicines.find((m) => m.id === s.medicineId)?.categoryId === category;
      const matchesFrom = !dateFrom || s.date >= dateFrom;
      const matchesTo = !dateTo || s.date <= dateTo;
      return matchesMedicine && matchesCategory && matchesFrom && matchesTo;
    });
  }, [data.sales, data.medicines, medicine, category, dateFrom, dateTo]);

  const lowStock = filteredMedicines.filter((m) => !isExpired(m) && isLowStock(m));
  const expired = filteredMedicines.filter(isExpired);
  const salesTotal = filteredSales.reduce((sum, s) => sum + s.total, 0);

  const categoryReport = useMemo(
    () =>
      data.categories.map((c) => {
        const meds = filteredMedicines.filter((m) => m.categoryId === c.id);
        return {
          id: c.id,
          name: c.name,
          medicines: meds.length,
          stock: meds.reduce((s, m) => s + m.quantity, 0),
          value: meds.reduce((s, m) => s + m.quantity * m.unitPrice, 0),
        };
      }),
    [data.categories, filteredMedicines],
  );

  const stockByCategory = useMemo(
    () =>
      data.categories.map((c) => ({
        name: c.name,
        value: data.medicines.filter((m) => m.categoryId === c.id).reduce((s, m) => s + m.quantity, 0),
      })),
    [data.categories, data.medicines],
  );

  const monthlySales = useMemo(() => {
    const map = new Map();
    filteredSales.forEach((s) => map.set(s.date.slice(0, 7), (map.get(s.date.slice(0, 7)) ?? 0) + s.total));
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, total]) => ({
        month: new Date(`${month}-01`).toLocaleDateString("en-GB", { month: "short", year: "2-digit" }),
        total,
      }));
  }, [filteredSales]);

  const expiredVsActive = useMemo(
    () => [
      { name: "Active", value: data.medicines.filter((m) => medicineStatus(m) === "Active").length },
      { name: "Expired", value: data.medicines.filter(isExpired).length },
      { name: "Near expiry", value: data.medicines.filter(isNearExpiry).length },
    ],
    [data.medicines],
  );

  const exportCsv = () => {
    let headers = [];
    let lines = [];

    if (report === "stock" || report === "low" || report === "expired") {
      const source = report === "low" ? lowStock : report === "expired" ? expired : filteredMedicines;
      headers = ["ID", "Name", "Category", "Quantity", "Reorder", "Expiration", "Status", "UnitPrice"];
      lines = source.map((m) => [
        m.id,
        m.name,
        categoryName(m.categoryId),
        String(m.quantity),
        String(m.reorderLevel),
        m.expirationDate,
        medicineStatus(m),
        String(m.unitPrice),
      ]);
    } else if (report === "category") {
      headers = ["Category", "Medicines", "Stock", "ValueRWF"];
      lines = categoryReport.map((c) => [c.name, String(c.medicines), String(c.stock), String(c.value)]);
    } else {
      headers = ["SaleID", "Date", "Medicine", "Qty", "Total", "Payment", "Customer"];
      lines = filteredSales.map((s) => [
        s.id,
        s.date,
        medicineName(s.medicineId),
        String(s.quantity),
        String(s.total),
        s.paymentMethod,
        s.customer,
      ]);
    }

    const csv = [headers, ...lines].map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `medistock-${report}-report.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setToast("Report downloaded as CSV");
  };

  if (loading) return <Loading />;

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Inventory and sales summaries with filters, print and CSV export."
        action={
          <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()}>
              Print report
            </Button>
            <Button variant="contained" startIcon={<DownloadIcon />} onClick={exportCsv}>
              Export CSV
            </Button>
          </Stack>
        }
      />

      <Box sx={{ mb: 2 }}>
        <Grid min={200}>
          <SummaryCard label="Stock items" value={filteredMedicines.length} icon={<InventoryIcon />} />
          <SummaryCard label="Low stock" value={lowStock.length} icon={<WarningIcon />} tone="warning" />
          <SummaryCard label="Expired" value={expired.length} icon={<EventBusyIcon />} tone="error" />
          <SummaryCard label="Sales total" value={formatRWF(salesTotal)} icon={<TrendingUpIcon />} tone="success" />
        </Grid>
      </Box>

      <FilterBar>
        <SelectField
          label="Report"
          value={report}
          onChange={(v) => setReport(v)}
          options={[
            { value: "stock", label: "Current stock" },
            { value: "low", label: "Low-stock report" },
            { value: "expired", label: "Expired medicines" },
            { value: "category", label: "Category report" },
            { value: "sales", label: "Sales report" },
          ]}
        />
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
          label="Medicine"
          value={medicine}
          onChange={setMedicine}
          options={[
            { value: "all", label: "All medicines" },
            ...data.medicines.map((m) => ({ value: m.id, label: m.name })),
          ]}
        />
        <SelectField
          label="Stock status"
          value={stockStatus}
          onChange={setStockStatus}
          options={[
            { value: "all", label: "All statuses" },
            { value: "active", label: "Active" },
            { value: "low", label: "Low stock" },
            { value: "near", label: "Near expiry" },
            { value: "expired", label: "Expired" },
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
      </FilterBar>

      <Box sx={{ mb: 3 }}>
        <Grid min={320}>
          <SectionCard title="Stock by category">
            <StockByCategoryChart data={stockByCategory} />
          </SectionCard>
          <SectionCard title="Monthly sales summary">
            <MonthlySalesChart data={monthlySales} />
          </SectionCard>
          <SectionCard title="Expired vs active">
            <ExpiredVsActiveChart data={expiredVsActive} />
          </SectionCard>
        </Grid>
      </Box>

      {(report === "stock" || report === "low" || report === "expired") && (
        <ReportTable
          title={report === "low" ? "Low-stock report" : report === "expired" ? "Expired medicine report" : "Current stock report"}
          empty="No medicines match this report"
          headers={["ID", "Medicine", "Category", "Qty", "Reorder", "Expiration", "Status", "Value"]}
          rows={(report === "low" ? lowStock : report === "expired" ? expired : filteredMedicines).map((m) => [
            m.id,
            m.name,
            categoryName(m.categoryId),
            String(m.quantity),
            String(m.reorderLevel),
            formatDate(m.expirationDate),
            <StatusChip key={m.id} status={medicineStatus(m)} />,
            formatRWF(m.quantity * m.unitPrice),
          ])}
        />
      )}

      {report === "category" && (
        <ReportTable
          title="Medicine category report"
          empty="No category data"
          headers={["Category", "Medicines", "Total stock", "Stock value"]}
          rows={categoryReport.map((c) => [c.name, String(c.medicines), String(c.stock), formatRWF(c.value)])}
        />
      )}

      {report === "sales" && (
        <ReportTable
          title="Sales report"
          empty="No sales in this date range"
          headers={["Sale ID", "Date", "Medicine", "Qty", "Total", "Payment", "Customer"]}
          rows={filteredSales.map((s) => [
            s.id,
            formatDate(s.date),
            medicineName(s.medicineId),
            String(s.quantity),
            formatRWF(s.total),
            s.paymentMethod,
            s.customer,
          ])}
        />
      )}

      <NotifySnackbar message={toast} onClose={() => setToast(null)} />
    </>
  );
}

function ReportTable({ title, headers, rows, empty }) {
  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
        {title}
      </Typography>
      <TableShell>
        <Table size="small">
          <TableHead>
            <TableRow>
              {headers.map((h) => (
                <TableCell key={h}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={headers.length}>
                  <EmptyState message={empty} />
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, i) => (
                <TableRow key={i} hover>
                  {row.map((cell, j) => (
                    <TableCell key={j}>{cell}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableShell>
    </Box>
  );
}
