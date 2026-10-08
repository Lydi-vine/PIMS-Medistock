import { useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  ThemeProvider,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/SpaceDashboard";
import MedicationIcon from "@mui/icons-material/Medication";
import CategoryIcon from "@mui/icons-material/Category";
import InventoryIcon from "@mui/icons-material/Inventory2";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import WarningIcon from "@mui/icons-material/ReportProblem";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import AssessmentIcon from "@mui/icons-material/Assessment";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { PharmacyProvider, usePharmacy, isExpired, isLowStock } from "../../lib/pharmacy/store.jsx";
import { AuthProvider, useAuth } from "../../lib/pharmacy/auth.jsx";
import { ThemeModeProvider, useThemeMode, buildAppTheme } from "../../lib/pharmacy/theme.jsx";
import { Loading } from "./ui.jsx";

const drawerWidth = 248;

const navItems = [
  { to: "/", label: "Dashboard", icon: <DashboardIcon /> },
  { to: "/medicines", label: "Medicines", icon: <MedicationIcon /> },
  { to: "/categories", label: "Categories", icon: <CategoryIcon /> },
  { to: "/stock", label: "Stock Management", icon: <InventoryIcon /> },
  { to: "/expired", label: "Expired Medicines", icon: <EventBusyIcon /> },
  { to: "/low-stock", label: "Low Stock", icon: <WarningIcon /> },
  { to: "/sales", label: "Sales", icon: <PointOfSaleIcon /> },
  { to: "/reports", label: "Reports", icon: <AssessmentIcon /> },
];

function NavList({ onNavigate }) {
  const { pathname } = useLocation();
  const { data, resetData } = usePharmacy();
  const alerts = data.medicines.filter((m) => isExpired(m) || isLowStock(m)).length;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Toolbar sx={{ gap: 1.5 }}>
        <Avatar sx={{ bgcolor: "primary.main" }}>
          <LocalPharmacyIcon />
        </Avatar>
        <Box>
          <Typography fontWeight={800} lineHeight={1.1}>
            MediStock
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Pharmacy Inventory
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1, py: 1.5, flexGrow: 1 }}>
        {navItems.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          return (
            <ListItemButton key={item.to} component={Link} to={item.to} onClick={onNavigate} selected={active} sx={{
                borderRadius: 2, mb: 0.5,
                "&.Mui-selected": { bgcolor: "primary.light", color: "primary.dark" },
                "&.Mui-selected .MuiListItemIcon-root": { color: "primary.dark" },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 700 : 500 }}/>
              {item.label === "Dashboard" && alerts > 0 && <Badge color="error" badgeContent={alerts} />}
            </ListItemButton>
          );
        })}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Tooltip title="Restore the original mock data in localStorage">
          <ListItemButton onClick={resetData} sx={{ borderRadius: 2 }}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <RestartAltIcon />
            </ListItemIcon>
            <ListItemText primary="Reset demo data" primaryTypographyProps={{ fontSize: 13 }} />
          </ListItemButton>
        </Tooltip>
      </Box>
    </Box>
  );
}

function Shell({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { mode, toggleMode } = useThemeMode();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default", overflowX: "hidden" }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: "background.paper",
          color: "text.primary",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Toolbar sx={{ gap: 1, minWidth: 0 }}>
          <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ display: { md: "none" }, flexShrink: 0 }}>
            <MenuIcon />
          </IconButton>
          <Typography
            variant="subtitle1"
            fontWeight={700}
            sx={{
              flexGrow: 1,
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: { xs: "0.9rem", sm: "1rem" },
            }}
          >
            Pharmacy Inventory Management System
          </Typography>
          <Stack direction="row" spacing={{ xs: 0.75, sm: 1.5 }} alignItems="center" sx={{ flexShrink: 0 }}>
            <Box sx={{ display: { xs: "none", sm: "block" }, textAlign: "right" }}>
              <Typography variant="body2" fontWeight={600} lineHeight={1.2}>
                {user?.displayName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.role}
              </Typography>
            </Box>
            <Avatar sx={{ width: 34, height: 34, bgcolor: "secondary.main", fontSize: 14 }}>
              {user?.initials ?? "?"}
            </Avatar>
            <Tooltip title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
              <IconButton onClick={toggleMode} size="small" aria-label="Toggle color theme">
                {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              size="small"
              color="inherit"
              component={Link}
              to="/settings"
              startIcon={<SettingsIcon />}
              sx={{
                borderColor: "divider",
                textTransform: "none",
                minWidth: { xs: 40, sm: "auto" },
                px: { xs: 1, sm: 1.5 },
                "& .MuiButton-startIcon": { mr: { xs: 0, sm: 1 } },
              }}
            >
              <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                Settings
              </Box>
            </Button>
            <Button
              variant="outlined"
              size="small"
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                borderColor: "divider",
                textTransform: "none",
                minWidth: { xs: 40, sm: "auto" },
                px: { xs: 1, sm: 1.5 },
                "& .MuiButton-startIcon": { mr: { xs: 0, sm: 1 } },
              }}
            >
              <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                Logout
              </Box>
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
          }}
        >
          <NavList onNavigate={() => setMobileOpen(false)} />
        </Drawer>
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
              borderRight: "1px solid",
              borderColor: "divider",
            },
          }}
        >
          <NavList />
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: { xs: "100%", md: `calc(100% - ${drawerWidth}px)` },
          maxWidth: "100%",
        }}
      >
        <Toolbar />
        <Container maxWidth="xl" sx={{ py: 3, px: { xs: 2, sm: 3 }, maxWidth: "100%", boxSizing: "border-box" }}>
          {children}
        </Container>
      </Box>
    </Box>
  );
}

function AuthGate({ children }) {
  const { user, ready } = useAuth();
  const { pathname } = useLocation();
  const isLogin = pathname === "/login";

  if (!ready) return <Loading label="Checking session…" />;

  if (!user && !isLogin) return <Navigate to="/login" replace />;
  if (user && isLogin) return <Navigate to="/" replace />;

  if (isLogin) return <>{children}</>;
  return <Shell>{children}</Shell>;
}

export function PharmacyLayout({ children }) {
  return (
    <ThemeModeProvider>
      <ThemedApp>{children}</ThemedApp>
    </ThemeModeProvider>
  );
}

function ThemedApp({ children }) {
  const { mode } = useThemeMode();
  const theme = useMemo(() => buildAppTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <PharmacyProvider>
          <AuthGate>{children}</AuthGate>
        </PharmacyProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export function Grid({ children, min = 240 }) {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${min}px), 1fr))`,
      }}
    >
      {children}
    </Box>
  );
}
