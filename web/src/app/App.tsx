import type { ReactNode } from "react";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router";
import { AlertTriangle, Home, Leaf, Map, UserRound, Users } from "lucide-react";
import { AuthProvider, useAuth } from "../lib/auth";
import { HomeScreen } from "./components/HomeScreen";
import { MapScreen } from "./components/MapScreen";
import { ReportsScreen } from "./components/ReportsScreen";
import { OngsScreen } from "./components/OngsScreen";
import { EducationScreen } from "./components/EducationScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { AdminScreen } from "./components/AdminScreen";
import { LoginScreen } from "./components/LoginScreen";
import { RegisterScreen } from "./components/RegisterScreen";

function Splash() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-3 bg-primary py-5 px-8 rounded-3xl text-primary-content">
        <Leaf size={22} strokeWidth={2} />
        <span className="text-sm font-medium">+Verde</span>
      </div>
    </div>
  );
}

function RequireAuth() {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <Splash />;
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />;
  return <Outlet />;
}

function PublicOnly({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <Splash />;
  if (user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AdminGate() {
  const { user, loading, tipo } = useAuth();
  if (loading) return <Splash />;
  if (!user) return <Navigate to="/login" replace />;
  if (tipo !== "admin") return <Navigate to="/" replace />;
  return <AdminScreen />;
}

function AppShell() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const go = (p: string) => navigate(p);

  const tab = (paths: string[]) => paths.some((p) => pathname === p || pathname.startsWith(p + "/"));

  return (
    <div className="flex h-full w-full items-center justify-center md:p-6">
      <div
        className="flex h-full w-full max-w-[430px] flex-col overflow-hidden bg-[var(--background)] md:h-[min(880px,calc(100dvh-48px))] md:rounded-[30px] md:shadow-[0_0_0_1px_rgba(255,255,255,0.07),0_40px_90px_rgba(0,0,0,0.55)]"
      >
        <main className="relative min-h-0 flex-1 overflow-hidden">
          <Outlet />
        </main>

        {/* ── Tab bar ── */}
        <nav className="shrink-0 border-t border-black/[0.06] bg-white/95 pb-[max(env(safe-area-inset-bottom),10px)] backdrop-blur-xl">
          <div className="flex items-end gap-0.5 px-1.5 pt-1.5">
            <TabButton label="Início" active={tab(["/"])} onClick={() => go("/")}>
              <Home size={22} strokeWidth={tab(["/"]) ? 2.4 : 1.8} />
            </TabButton>

            <TabButton label="Mapa" active={tab(["/mapa"])} onClick={() => go("/mapa")}>
              <Map size={22} strokeWidth={tab(["/mapa"]) ? 2.4 : 1.8} />
            </TabButton>

            <button
              onClick={() => go("/denunciar")}
              className="flex flex-1 flex-col items-center pb-0.5"
              aria-label="Denunciar"
            >
              <span
                className={`-mt-5 flex size-13 items-center justify-center rounded-full text-white shadow-[0_6px_18px_rgba(22,107,68,0.4)] transition-colors ${
                  tab(["/denunciar"]) ? "bg-secondary" : "bg-primary"
                }`}
              >
                <AlertTriangle size={22} strokeWidth={2} />
              </span>
              <span
                className={`mt-1 text-[10px] tracking-tight ${
                  tab(["/denunciar"]) ? "font-bold text-primary" : "text-muted-foreground"
                }`}
              >
                Denunciar
              </span>
            </button>

            <TabButton label="ONGs" active={tab(["/ongs"])} onClick={() => go("/ongs")}>
              <Users size={22} strokeWidth={tab(["/ongs"]) ? 2.4 : 1.8} />
            </TabButton>

            <TabButton label="Perfil" active={tab(["/perfil"])} onClick={() => go("/perfil")}>
              <UserRound size={22} strokeWidth={tab(["/perfil"]) ? 2.4 : 1.8} />
            </TabButton>
          </div>
        </nav>
      </div>
    </div>
  );
}

function TabButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-1 cursor-pointer flex-col items-center gap-1 py-2"
    >
      <span
        className={`flex size-9 items-center justify-center rounded-xl transition-colors ${
          active ? "bg-primary/10 text-primary" : "text-muted-foreground"
        }`}
      >
        {children}
      </span>
      <span
        className={`text-[10px] tracking-tight ${
          active ? "font-bold text-primary" : "text-muted-foreground"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <PublicOnly>
                <LoginScreen />
              </PublicOnly>
            }
          />
          <Route
            path="/cadastro"
            element={
              <PublicOnly>
                <RegisterScreen />
              </PublicOnly>
            }
          />

          <Route element={<RequireAuth />}>
            <Route path="/admin" element={<AdminGate />} />

            <Route element={<AppShell />}>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/mapa" element={<MapScreen />} />
              <Route path="/denunciar" element={<ReportsScreen />} />
              <Route path="/ongs" element={<OngsScreen />} />
              <Route path="/educacao" element={<EducationScreen />} />
              <Route path="/perfil" element={<ProfileScreen />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}