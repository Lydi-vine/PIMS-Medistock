import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TableContainer,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import InboxIcon from "@mui/icons-material/Inbox";

export function PageHeader({ title, subtitle, action }) {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={2}
      alignItems={{ xs: "stretch", md: "center" }}
      justifyContent="space-between"
      sx={{ mb: 3, width: "100%", maxWidth: "100%", minWidth: 0 }}
    >
      <Box sx={{ minWidth: 0, flex: "1 1 auto" }}>
        <Typography variant="h5" fontWeight={700}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && (
        <Box
          sx={{
            flexShrink: 0,
            width: { xs: "100%", md: "auto" },
            ml: { md: "auto" },
            "& .MuiButton-root": { width: { xs: "100%", md: "auto" } },
            "& .MuiStack-root": { width: { xs: "100%", md: "auto" }, flexWrap: "wrap" },
          }}
        >
          {action}
        </Box>
      )}
    </Stack>
  );
}

export function SummaryCard({ label, value, icon, tone = "primary", hint }) {
  return (
    <Card elevation={0} sx={{ height: "100%", border: 1, borderColor: "divider", borderRadius: 3 }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              bgcolor: `${tone}.light`,
              color: `${tone}.dark`,
            }}
          >
            {icon}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary" noWrap>
              {label}
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {value}
            </Typography>
            {hint && (
              <Typography variant="caption" color="text.secondary">
                {hint}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

const statusColor = {
  Active: "success",
  "Near Expiry": "warning",
  "Low Stock": "warning",
  "Out of Stock": "error",
  Expired: "error",
};

export function StatusChip({ status, size = "small" }) {
  return <Chip label={status} color={statusColor[status] || "default"} size={size} variant="filled" />;
}

export function SearchField({ value, onChange, placeholder = "Search…" }) {
  return (
    <TextField
      size="small"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      fullWidth
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" />
          </InputAdornment>
        ),
      }}
    />
  );
}

export function SelectField({ label, value, onChange, options }) {
  return (
    <TextField select size="small" label={label} value={value} onChange={(e) => onChange(e.target.value)} fullWidth>
      {options.map((o) => (
        <MenuItem key={o.value} value={o.value}>
          {o.label}
        </MenuItem>
      ))}
    </TextField>
  );
}

export function FilterBar({ children }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 2,
        border: 1,
        borderColor: "divider",
        borderRadius: 3,
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "grid",
          gap: 2,
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(auto-fit, minmax(160px, 1fr))",
          },
          alignItems: "center",
          "& > *": { minWidth: 0, width: "100%" },
        }}
      >
        {children}
      </Box>
    </Paper>
  );
}

export function EmptyState({ message, hint }) {
  return (
    <Box sx={{ py: 6, textAlign: "center", color: "text.secondary" }}>
      <InboxIcon sx={{ fontSize: 48, opacity: 0.4 }} />
      <Typography variant="subtitle1" sx={{ mt: 1 }}>
        {message}
      </Typography>
      {hint && <Typography variant="body2">{hint}</Typography>}
    </Box>
  );
}

export function Loading({ label = "Loading data…" }) {
  return (
    <Stack alignItems="center" spacing={2} sx={{ py: 8 }}>
      <CircularProgress />
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Stack>
  );
}

export function ConfirmDialog({ open, title, message, onCancel, onConfirm }) {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function SectionCard({ title, action, children }) {
  return (
    <Card elevation={0} sx={{ height: "100%", border: 1, borderColor: "divider", borderRadius: 3 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {title}
          </Typography>
          {action}
        </Stack>
        {children}
      </CardContent>
    </Card>
  );
}

export function WarningAlert({ severity = "warning", children }) {
  return (
    <Alert severity={severity} sx={{ mb: 2, borderRadius: 2 }}>
      {children}
    </Alert>
  );
}

export function TableShell({ children }) {
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 3,
        overflowX: "auto",
        maxWidth: "100%",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {children}
    </TableContainer>
  );
}

export function NotifySnackbar({ message, severity = "success", onClose }) {
  return (
    <Snackbar open={!!message} autoHideDuration={3200} onClose={onClose} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
      <Alert onClose={onClose} severity={severity} variant="filled" sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
}
