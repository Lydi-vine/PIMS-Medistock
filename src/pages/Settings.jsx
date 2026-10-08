import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { useAuth, initialsFromName } from "../lib/pharmacy/auth.jsx";
import { useThemeMode } from "../lib/pharmacy/theme.jsx";
import { NotifySnackbar, PageHeader } from "../components/pharmacy/ui.jsx";

export default function Settings() {
  const { user, updateDisplayName } = useAuth();
  const { mode, setMode } = useThemeMode();
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    setDisplayName(user?.displayName ?? "");
  }, [user?.displayName]);

  const previewInitials = initialsFromName(displayName, user?.initials ?? "?");

  const submit = (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    setTimeout(() => {
      const result = updateDisplayName(displayName);
      setSaving(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setToast("Display name saved locally");
    }, 300);
  };

  const onThemeChange = (event) => {
    setMode(event.target.value);
    setToast(event.target.value === "dark" ? "Dark theme saved" : "Light theme saved");
  };

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Update your profile and appearance. Preferences are stored in this browser’s localStorage."
      />

      <Stack spacing={2} sx={{ maxWidth: 480 }}>
        <Card elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 3 }}>
          <CardContent>
            <Box component="form" onSubmit={submit} noValidate>
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>
                    Profile
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Account
                  </Typography>
                  <Typography fontWeight={600}>{user?.username}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user?.role}
                  </Typography>
                </Box>

                <TextField
                  label="Display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  error={!!error}
                  helperText={error || `Avatar initials preview: ${previewInitials}`}
                  fullWidth
                  required
                  autoFocus
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                  sx={{ alignSelf: "flex-start" }}
                >
                  {saving ? "Saving…" : "Save name"}
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>

        <Card elevation={0} sx={{ border: 1, borderColor: "divider", borderRadius: 3 }}>
          <CardContent>
            <FormControl>
              <FormLabel id="theme-mode-label" sx={{ typography: "subtitle1", fontWeight: 700, color: "text.primary", mb: 1 }}>
                Appearance
              </FormLabel>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Choose light or dark mode. Falls back to light if nothing is saved.
              </Typography>
              <RadioGroup
                aria-labelledby="theme-mode-label"
                name="theme-mode"
                value={mode}
                onChange={onThemeChange}
              >
                <FormControlLabel value="light" control={<Radio />} label="Light" />
                <FormControlLabel value="dark" control={<Radio />} label="Dark" />
              </RadioGroup>
            </FormControl>
          </CardContent>
        </Card>
      </Stack>

      <NotifySnackbar message={toast} onClose={() => setToast(null)} />
    </>
  );
}
