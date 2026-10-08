import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { DEMO_USERS, useAuth } from "../lib/pharmacy/auth.jsx";

export default function Login() {
  const theme = useTheme();
  const { user, ready, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (ready && user) navigate("/");
  }, [ready, user, navigate]);

  const submit = (e) => {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password) {
      setError("Enter both username and password");
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      const result = login(username, password);
      setSubmitting(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      navigate("/");
    }, 400);
  };

  if (!ready || user) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ minHeight: "100vh" }}>
        <CircularProgress />
      </Stack>
    );
  }

  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        px: 2,
        py: 4,
        background: isDark
          ? "linear-gradient(160deg, #0f1419 0%, #1a222c 45%, #0f172a 100%)"
          : "linear-gradient(160deg, #f0fdfa 0%, #f6f8f9 45%, #ecfeff 100%)",
      }}
    >
      <Card
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 420,
          border: 1,
          borderColor: "divider",
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={2.5} alignItems="center" sx={{ mb: 1 }}>
            <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
              <LocalPharmacyIcon fontSize="large" />
            </Avatar>
            <Box textAlign="center">
              <Typography variant="h5" fontWeight={800}>
                MediStock
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to manage pharmacy inventory
              </Typography>
            </Box>
          </Stack>

          <Box component="form" onSubmit={submit} noValidate>
            <Stack spacing={2}>
              {error && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {error}
                </Alert>
              )}
              <TextField
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                fullWidth
                required
                autoFocus
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                fullWidth
                required
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <LockOutlinedIcon />}
              >
                {submitting ? "Signing in…" : "Sign in"}
              </Button>
            </Stack>
          </Box>

          <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
            <Typography variant="caption" component="div" fontWeight={700} sx={{ mb: 0.5 }}>
              Demo credentials
            </Typography>
            {DEMO_USERS.map((u) => (
              <Typography key={u.username} variant="caption" component="div">
                {u.username} / {u.password}
              </Typography>
            ))}
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
}
