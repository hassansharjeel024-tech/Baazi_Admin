import { Link, useLocation } from "react-router-dom";
import adminAvatar from "../assets/admin-avatar.png";
import navDashboard from "../assets/nav-dashboard.png";
import navUsers from "../assets/nav-users.png";
import navGames from "../assets/nav-games.png";
import navRewards from "../assets/nav-rewards.png";
import navRedemptions from "../assets/nav-redemptions.png";
import navWallet from "../assets/nav-wallet.png";
import navPackages from "../assets/nav-packages.png";
import navReferrals from "../assets/nav-referrals.png";
import navSettings from "../assets/nav-settings.png";
import navLogout from "../assets/nav-logout.png";
import navDashboardActive from "../assets/nav-dashboard-active.png";
import navUsersActive from "../assets/nav-users-active.png";
import navGamesActive from "../assets/nav-games-active.png";
import navRewardsActive from "../assets/nav-rewards-active.png";
import navRedemptionsActive from "../assets/nav-redemptions-active.png";
import navWalletActive from "../assets/nav-wallet-active.png";
import navReferralsActive from "../assets/nav-referrals-active.png";
import { Search, Bell, HelpCircle } from "lucide-react";
import logo from "../assets/logo.png";
import { colors } from "../theme";

const NAV_ITEMS = [
  { label: "Dashboard", icon: navDashboard, iconActive: navDashboardActive, path: "/admin/dashboard" },
  { label: "Users", icon: navUsers, iconActive: navUsersActive, path: "/admin/users" },
  { label: "Games", icon: navGames, iconActive: navGamesActive, path: "/admin/games" },
  { label: "Rewards", icon: navRewards, iconActive: navRewardsActive, path: "/admin/rewards" },
  { label: "Redemptions", icon: navRedemptions, iconActive: navRedemptionsActive, path: "/admin/redemptions" },
  { label: "Wallet", icon: navWallet, iconActive: navWalletActive, path: "/admin/wallet" },
  { label: "Packages", icon: navPackages, path: "/admin/packages" },
  { label: "Referrals", icon: navReferrals, iconActive: navReferralsActive, path: "/admin/referrals" },
  { label: "Settings", icon: navSettings, path: "/admin/settings" },
];

function Sidebar() {
  const { pathname } = useLocation();

  return (
    <aside
      className="w-[280px] shrink-0 flex flex-col justify-between pt-4 pb-4 h-screen sticky top-0 overflow-y-auto"
      style={{ backgroundColor: colors.surface, borderRight: `1px solid ${colors.border}` }}
    >
      <div>
        <div className="px-5 pt-6 pb-8 flex items-center gap-2">
          <img src={logo} alt="Baazi" className="h-7 w-auto" />
          <span
            className="uppercase mt-1"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 500,
              fontSize: "12px",
              lineHeight: "16px",
              letterSpacing: "1.2px",
              color: colors.textPrimary,
            }}
          >
            Admin Portal
          </span>
        </div>

        <nav className="pl-3 pr-0 flex flex-col gap-1">
          {NAV_ITEMS.map(({ label, icon, iconActive, path }) => {
            const active = pathname === path;
            const iconSrc = active && iconActive ? iconActive : icon;
            return (
              <Link
                key={path}
                to={path}
                className="relative flex items-center gap-3 px-3 py-2.5 rounded-l-lg transition-colors"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 400,
                  fontSize: "16px",
                  lineHeight: "24px",
                  backgroundColor: active ? colors.primaryBg18 : "transparent",
                  color: active ? colors.primary : colors.textSecondary,
                }}
              >
                <img src={iconSrc} alt="" className="w-4 h-4 object-contain" />
                {label}
                {active && (
                  <span
                    className="absolute right-0 top-0 bottom-0 w-[3px]"
                    style={{ backgroundColor: colors.primary }}
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div
        className="px-5 pt-4 pb-2 flex items-center justify-between"
        style={{ borderTop: `1px solid ${colors.borderOlive}` }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={adminAvatar}
            alt="Admin Root"
            className="w-8 h-8 rounded-full object-cover shrink-0"
            style={{ border: `2px solid ${colors.primary}` }}
          />
          <div className="min-w-0">
            <p
              className="truncate"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 500,
                fontSize: "16px",
                lineHeight: "24px",
                color: colors.textPrimary,
              }}
            >
              Admin Root
            </p>
            <p
              className="truncate"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 400,
                fontSize: "16px",
                lineHeight: "24px",
                color: colors.textSecondary,
              }}
            >
              Super Admin
            </p>
          </div>
        </div>
        <img src={navLogout} alt="Log out" className="w-4 h-4 object-contain shrink-0" />
      </div>
    </aside>
  );
}

function Topbar() {
  return (
    <header
      className="h-16 shrink-0 flex items-center justify-between gap-4 px-6 relative z-10"
      style={{ backgroundColor: colors.surface, borderBottom: `1px solid ${colors.border}` }}
    >
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search"
          className="w-full text-white text-sm rounded-lg placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary-bright"
          style={{
            backgroundColor: colors.accentNav,
            border: `1px solid ${colors.border}`,
            paddingTop: "9px",
            paddingBottom: "10px",
            paddingLeft: "44px",
            paddingRight: "16px",
          }}
        />
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <button className="relative text-white/60 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-success" />
        </button>
        <button className="text-white/60 hover:text-white transition-colors">
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}

export default function AdminLayout({ children }) {
  return (
    <div className="h-screen flex overflow-hidden" style={{ backgroundColor: colors.surface }}>
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Topbar />
        <main
          className="flex-1 overflow-y-auto relative"
          style={{
            backgroundColor: colors.background,
            backgroundImage: `linear-gradient(180deg, ${colors.background} 0%, ${colors.accent} 100%)`,
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(${colors.loginDot} 1.5px, transparent 1.5px)`,
              backgroundSize: "27px 27px",
              WebkitMaskImage:
                "linear-gradient(to bottom, black 0%, black 10%, transparent 55%)",
              maskImage:
                "linear-gradient(to bottom, black 0%, black 10%, transparent 55%)",
            }}
          />

          <div className="relative z-10 p-10 max-w-[1440px] mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
