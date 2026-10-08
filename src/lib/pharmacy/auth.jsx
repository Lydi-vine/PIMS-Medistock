import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const SESSION_KEY = "pharmacy-auth-v1";
const PROFILES_KEY = "pharmacy-profiles-v1";

/** Demo accounts for the localStorage-only login (no backend). */
export const DEMO_USERS = [
  {
    username: "Lydiie",
    password: "Lydiie@007",
    displayName: "I. Lydivine",
    role: "Pharmacist on duty",
    initials: "IL",
  },
  {
    username: "admin",
    password: "admin123",
    displayName: "M. Hussein",
    role: "Pharmacy admin",
    initials: "MH",
  },
];

const AuthContext = createContext(null);

export function initialsFromName(name, fallback = "?") {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p.replace(/[^a-zA-Z0-9]/g, ""))
    .filter(Boolean);
  if (parts.length === 0) return fallback;
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function readJson(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
}

function readProfiles() {
  const data = readJson(PROFILES_KEY);
  return data && typeof data === "object" ? data : {};
}

/** Saved display name for a username, or the demo account fallback. */
export function getStoredDisplayName(username) {
  const demo = DEMO_USERS.find((u) => u.username === username);
  const fallback = demo?.displayName ?? "Pharmacy staff";
  const saved = readProfiles()[username]?.displayName;
  const name = typeof saved === "string" ? saved.trim() : "";
  return name || fallback;
}

function buildUser(username) {
  const demo = DEMO_USERS.find((u) => u.username === username);
  if (!demo) return null;
  const displayName = getStoredDisplayName(username);
  return {
    username: demo.username,
    displayName,
    role: demo.role,
    initials: initialsFromName(displayName, demo.initials),
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const session = readJson(SESSION_KEY);
    if (session?.username) {
      setUser(buildUser(session.username));
    }
    setReady(true);
  }, []);

  const login = useCallback((username, password) => {
    const match = DEMO_USERS.find(
      (u) => u.username === username.trim() && u.password === password,
    );
    if (!match) return { ok: false, error: "Invalid username or password" };

    const nextUser = buildUser(match.username);
    writeJson(SESSION_KEY, {
      username: nextUser.username,
      displayName: nextUser.displayName,
      role: nextUser.role,
      initials: nextUser.initials,
      loggedInAt: new Date().toISOString(),
    });
    setUser(nextUser);
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
    setUser(null);
  }, []);

  const updateDisplayName = useCallback((displayName) => {
    const trimmed = String(displayName || "").trim();
    if (!trimmed) return { ok: false, error: "Display name is required" };
    if (trimmed.length > 60) return { ok: false, error: "Name must be 60 characters or fewer" };

    const current = readJson(SESSION_KEY);
    if (!current?.username) return { ok: false, error: "Not signed in" };

    const demo = DEMO_USERS.find((u) => u.username === current.username);
    const initials = initialsFromName(trimmed, demo?.initials ?? "?");
    const nextUser = {
      username: current.username,
      displayName: trimmed,
      role: demo?.role ?? current.role,
      initials,
    };

    const profiles = readProfiles();
    profiles[nextUser.username] = {
      ...(profiles[nextUser.username] || {}),
      displayName: trimmed,
    };
    writeJson(PROFILES_KEY, profiles);
    writeJson(SESSION_KEY, {
      ...nextUser,
      loggedInAt: current.loggedInAt ?? new Date().toISOString(),
    });
    setUser(nextUser);
    return { ok: true };
  }, []);

  const value = useMemo(
    () => ({ user, ready, login, logout, updateDisplayName }),
    [user, ready, login, logout, updateDisplayName],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
