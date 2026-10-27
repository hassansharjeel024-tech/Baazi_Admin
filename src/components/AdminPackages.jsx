import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CirclePlus,
  LayoutGrid,
  Coins,
  Pencil,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  X,
} from "lucide-react";
import AdminLayout from "./AdminLayout";
import totalSalesIcon from "../assets/packages-total-sales-icon.png";
import carrotsIssuedIcon from "../assets/packages-carrots-issued-icon.png";
import {
  getCoinPackages,
  createCoinPackage,
  updateCoinPackage,
} from "../services/coinPackageService";
import { listPayments } from "../services/paymentService";

const FONT = "'Montserrat', sans-serif";
const PAGE_SIZE = 5;
const DAY_MS = 24 * 60 * 60 * 1000;

// Figma se andaze se liye gaye colors: inspect se verify karein
const C = {
  card: "#091E46",
  border: "rgba(59,130,246,0.22)",
  bar: "#120D2A",
  field: "#0B1330",
  imageBg: "#0A1738",
  rowLine: "rgba(59,130,246,0.12)",
  pageBorder: "#303443",
  primary: "#D0D0D0",
  text: "#DEE2F5",
  grey: "#6B7280",
  lime: "#DBEE2A",
  yellow: "#DBE21C",
  navy: "#091E46",
  btn: "#252A38",
  danger: "#FF6161",
};

const EMPTY_FORM = {
  title: "",
  key: "",
  currency: "usd",
  total_coin: "",
  price: "",
  bonus_percentage: "",
};

function formatPrice(price, currency = "usd") {
  const n = Number(price || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return String(currency).toLowerCase() === "usd" ? `$${n}` : `${String(currency).toUpperCase()} ${n}`;
}

const padId = (id) => String(id).padStart(3, "0");

function formFrom(pkg) {
  return {
    title: pkg.title || "",
    key: pkg.key || "",
    currency: pkg.currency || "usd",
    total_coin: String(pkg.total_coin ?? ""),
    price: String(pkg.price ?? ""),
    bonus_percentage: String(pkg.bonus_percentage ?? ""),
  };
}

const inputStyle = {
  fontFamily: FONT,
  fontSize: "14px",
  color: C.primary,
  backgroundColor: C.field,
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: "8px",
  padding: "10px 14px",
  width: "100%",
  outline: "none",
};

const labelStyle = {
  fontFamily: FONT,
  fontWeight: 500,
  fontSize: "12px",
  lineHeight: "16px",
  letterSpacing: "1.2px",
  textTransform: "uppercase",
  color: C.grey,
};

function Field({ label, children, full }) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <span style={labelStyle}>{label}</span>
      {children}
    </label>
  );
}

function StatCard({ icon, tag, tagBg, tagColor, label, value }) {
  return (
    <div
       className="rounded-xl p-6 flex flex-col justify-between h-[192px]"
      style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
    >
      <div className="flex items-center justify-between">
         <img src={icon} alt="" className="w-6 h-6" />
        <span
                  className="px-2 py-1 rounded text-xs leading-4 font-medium uppercase tracking-[0.6px]"
          style={{ backgroundColor: tagBg, color: tagColor, fontFamily: FONT }}
        >
          {tag}
        </span>
      </div>
      <div>
        <p
          className="uppercase"
          style={{
            fontFamily: FONT,
            fontWeight: 500,
            fontSize: "16px",
             lineHeight: "24px",
             letterSpacing: "1.6px",
            color: C.primary,
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontFamily: FONT,
            fontWeight: 800,
            fontSize: "48px",
            letterSpacing: "-0.96px",
            color: "#FFFFFF",
          }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function PackCard({ pkg, onEdit }) {
  return (
    <div
      className="rounded-xl overflow-hidden flex flex-col"
      style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
    >
      <div
        className="h-[200px] flex items-center justify-center"
        style={{ backgroundColor: C.imageBg }}
      >
        {pkg.image_url ? (
          <img src={pkg.image_url} alt={pkg.title} className="h-full w-full object-contain p-4" />
        ) : (
          <Coins className="w-12 h-12" style={{ color: C.yellow }} />
        )}
      </div>

      <div className="p-5 flex flex-col gap-4" style={{ fontFamily: FONT }}>
        <div className="flex items-start justify-between gap-3">
          <p className="font-bold text-base leading-6 text-white">{pkg.title}</p>
          <span className="text-[10px] leading-[15px] shrink-0" style={{ color: C.grey }}>
            ID: {padId(pkg.id)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.6px]" style={{ color: C.grey }}>
            Carrots
          </span>
          <span className="text-sm font-bold text-white">
            {Number(pkg.total_coin || 0).toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.6px]" style={{ color: C.grey }}>
            Price
          </span>
          <span className="text-base font-bold" style={{ color: C.lime }}>
            {formatPrice(pkg.price, pkg.currency)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="flex-1 h-9 rounded-lg inline-flex items-center justify-center gap-1.5 text-[13px] font-bold text-white transition hover:brightness-95"
            style={{ backgroundColor: C.btn, border: `1px solid ${C.border}` }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = C.yellow;
              e.currentTarget.style.color = C.navy;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = C.btn;
              e.currentTarget.style.color = "#FFFFFF";
            }}
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
          {/* Delete ka endpoint Swagger mein nahi hai */}
          <button
            type="button"
            disabled
            title="Delete is not available yet (no API endpoint)"
            className="w-9 h-9 rounded-lg inline-flex items-center justify-center opacity-50 cursor-not-allowed"
            style={{ border: `1px solid ${C.border}`, color: C.danger }}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPackages() {
  const [state, setState] = useState({ loading: true, error: "", packages: [] });
  const [sales, setSales] = useState({ loading: true, error: false, revenue: 0, coins: 0 });
  const [notice, setNotice] = useState("");
  const [page, setPage] = useState(1);

  const [modal, setModal] = useState(null); // { mode: "create" | "edit" | "view", pkg }
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const fileInputRef = useRef(null);

  const loadAll = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: "" }));
    const [pkgRes, payRes] = await Promise.allSettled([getCoinPackages(), listPayments()]);

    if (pkgRes.status === "fulfilled") {
      setState({ loading: false, error: "", packages: pkgRes.value });
    } else {
      setState({
        loading: false,
        error: pkgRes.reason?.message || "Failed to load packages",
        packages: [],
      });
    }

    if (payRes.status === "fulfilled") {
      const since = Date.now() - DAY_MS;
      const recent = payRes.value.filter(
        (p) => p.status === 2 && new Date(p.created_at).getTime() >= since
      );
      setSales({
        loading: false,
        error: false,
        revenue: recent.reduce((sum, p) => sum + Number(p.amount || 0), 0),
        coins: recent.reduce((sum, p) => sum + Number(p.total_coin || 0), 0),
      });
    } else {
      setSales({ loading: false, error: true, revenue: 0, coins: 0 });
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ---- modal helpers ----
  function openModal(mode, pkg = null) {
    setModal({ mode, pkg });
    setForm(pkg ? formFrom(pkg) : EMPTY_FORM);
    setImageFile(null);
    setFormError("");
  }

  function closeModal() {
    if (saving) return;
    setModal(null);
  }

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function pickImage(file) {
    if (file && file.type.startsWith("image/")) setImageFile(file);
  }

  async function handleSave(e) {
    e.preventDefault();
    setFormError("");

    if (!form.title.trim() || !form.key.trim() || form.total_coin === "" || form.price === "") {
      setFormError("Title, SKU key, amount and price are required.");
      return;
    }
    if (modal.mode === "create" && !imageFile) {
      setFormError("Package image is required.");
      return;
    }

    setSaving(true);
    try {
      const values = {
        title: form.title.trim(),
        key: form.key.trim(),
        currency: form.currency.trim() || "usd",
        total_coin: form.total_coin,
        price: form.price,
        bonus_percentage: form.bonus_percentage,
      };
      if (imageFile) values.image = imageFile;

      if (modal.mode === "create") {
        await createCoinPackage(values);
        setNotice(`"${values.title}" created successfully.`);
      } else {
        await updateCoinPackage(modal.pkg.id, values);
        setNotice(`"${values.title}" updated successfully.`);
      }

      setModal(null);
      await loadAll();
    } catch (err) {
      setFormError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // ---- table pagination ----
  const { packages } = state;
  const totalPages = Math.max(1, Math.ceil(packages.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const pageItems = useMemo(
    () => packages.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [packages, safePage]
  );

  const from = packages.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const to = Math.min(safePage * PAGE_SIZE, packages.length);
  const startNum = Math.max(1, Math.min(safePage - 1, totalPages - 2));
  const pageNumbers = Array.from({ length: Math.min(3, totalPages) }, (_, i) => startNum + i);

  const salesValue = sales.loading ? "-" : sales.error ? "--" : formatPrice(sales.revenue);
  const coinsValue = sales.loading ? "-" : sales.error ? "--" : sales.coins.toLocaleString();

  const isView = modal?.mode === "view";

  return (
    <AdminLayout>
      <div style={{ fontFamily: FONT }}>
        {/* Header */}
        <div className="flex items-start justify-between mb-10 flex-wrap gap-3">
          <div>
            <h1 className="text-[32px] leading-10 font-bold" style={{ color: C.primary }}>
              Packages
            </h1>
            <p className="text-base leading-6" style={{ color: C.primary }}>
              Review and process prize claims from the gaming ecosystem.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openModal("create")}
            className="inline-flex items-center justify-center gap-2 w-[206px] py-2.5 rounded-full text-base font-bold transition hover:brightness-95"
            style={{
              backgroundColor: C.yellow,
              color: C.navy,
              boxShadow: "0 0 15px rgba(221,238,42,0.15)",
            }}
          >
            <CirclePlus className="w-5 h-5" style={{ color: "#1A1E00" }} />
            Create New Pack
          </button>
        </div>

        {notice && (
          <div
            className="mb-6 rounded-lg px-4 py-3 text-sm"
            style={{
              color: C.lime,
              backgroundColor: "rgba(219,238,42,0.1)",
              border: "1px solid rgba(219,238,42,0.2)",
            }}
          >
            {notice}
          </div>
        )}

        {/* Stat cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <StatCard
            icon={totalSalesIcon}
            iconColor={C.yellow}
            tag="Daily volume"
            tagBg="rgba(219,238,42,0.1)"
            tagColor={C.yellow}
            label="Total Sales (24H)"
            value={salesValue}
          />
          <StatCard
            icon={carrotsIssuedIcon}
            iconColor="#B4C5FF"
            tag="Circulation"
            tagBg="rgba(180,197,255,0.1)"
            tagColor="#B4C5FF"
            label="Carrots Issued (24H)"
            value={coinsValue}
          />
        </div>

        {/* Active Coin Packs */}
        <div className="flex items-center gap-2 mb-4">
          <LayoutGrid className="w-4 h-4" style={{ color: C.yellow }} />
          <h2 className="text-lg leading-6 font-semibold" style={{ color: "#FFFFFF" }}>
            Active Coin Packs
          </h2>
        </div>

        {state.loading && (
          <p className="text-sm mb-10" style={{ color: C.grey }}>
            Loading packages...
          </p>
        )}
        {!state.loading && state.error && (
          <p className="text-sm mb-10" style={{ color: C.danger }}>
            {state.error}
          </p>
        )}

        {!state.loading && !state.error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
            {packages.map((p) => (
              <PackCard key={p.id} pkg={p} onEdit={() => openModal("edit", p)} />
            ))}

            <div
              className="rounded-xl p-6 flex flex-col items-center justify-center text-center gap-3 min-h-[360px]"
              style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
            >
              <span
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: C.yellow }}
              >
                <CirclePlus className="w-6 h-6" style={{ color: C.navy }} />
              </span>
              <p className="font-bold text-base text-white">Add Custom Pack</p>
              <p className="text-xs leading-5 max-w-[190px]" style={{ color: C.grey }}>
                Create a new carrot coin bundle with custom pricing.
              </p>
              <button
                type="button"
                onClick={() => openModal("create")}
                className="px-6 h-10 rounded-lg text-[13px] font-bold transition hover:brightness-125"
                style={{ border: `1px solid ${C.yellow}`, color: C.yellow }}
              >
                Start Creation
              </button>
            </div>
          </div>
        )}

        {/* Inventory Management */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
        >
          <div className="p-6">
            <h2 className="text-base font-semibold text-white">Inventory Management</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[760px]">
              <thead>
                <tr
                  className="h-14"
                  style={{ backgroundColor: C.bar, borderBottom: `1px solid ${C.border}` }}
                >
                  {["Package Name", "Amount", "SKU Code", "Status", "Price"].map((h) => (
                    <th
                      key={h}
                      className="px-3 first:pl-6 text-[11px] leading-4 font-medium uppercase tracking-[0.6px] whitespace-nowrap"
                      style={{ color: C.primary }}
                    >
                      {h}
                    </th>
                  ))}
                  <th
                    className="px-3 pr-6 text-right text-[11px] leading-4 font-medium uppercase tracking-[0.6px]"
                    style={{ color: C.primary }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {state.loading && (
                  <tr className="h-[72px]">
                    <td colSpan={6} className="pl-6 text-sm" style={{ color: C.grey }}>
                      Loading packages...
                    </td>
                  </tr>
                )}

                {!state.loading && state.error && (
                  <tr className="h-[72px]">
                    <td colSpan={6} className="pl-6 text-sm" style={{ color: C.danger }}>
                      {state.error}
                    </td>
                  </tr>
                )}

                {!state.loading && !state.error && packages.length === 0 && (
                  <tr className="h-[72px]">
                    <td colSpan={6} className="pl-6 text-sm" style={{ color: C.grey }}>
                      No packages yet. Create your first pack.
                    </td>
                  </tr>
                )}

                {pageItems.map((p, i) => (
                  <tr
                    key={p.id}
                    className="h-[72px]"
                    style={i > 0 ? { borderTop: `1px solid ${C.rowLine}` } : undefined}
                  >
                    <td className="px-3 pl-6 text-sm font-bold text-white whitespace-nowrap">
                      {p.title}
                    </td>
                    <td className="px-3 whitespace-nowrap">
                      <span
                        className="inline-block px-2.5 py-1 rounded text-xs"
                        style={{
                          backgroundColor: C.field,
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: C.text,
                        }}
                      >
                        {Number(p.total_coin || 0).toLocaleString()} Carrots
                      </span>
                    </td>
                    <td className="px-3 text-xs font-bold text-white whitespace-nowrap">{p.key}</td>
                    <td className="px-3 whitespace-nowrap">
                      {/* List mein status field nahi hai: sab ACTIVE dikhate hain */}
                      <span
                        className="inline-block px-2 py-[3px] rounded text-[10px] leading-[14px] font-bold tracking-[0.5px]"
                        style={{ backgroundColor: "rgba(219,238,42,0.2)", color: C.lime }}
                      >
                        ACTIVE
                      </span>
                    </td>
                    <td className="px-3 text-sm font-bold whitespace-nowrap" style={{ color: C.lime }}>
                      {formatPrice(p.price, p.currency)}
                    </td>
                    <td className="px-3 pr-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-3" style={{ color: C.grey }}>
                        <button
                          type="button"
                          aria-label="View"
                          onClick={() => openModal("view", p)}
                          className="hover:text-white transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          aria-label="Edit"
                          onClick={() => openModal("edit", p)}
                          className="hover:text-white transition"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            className="flex items-center justify-between flex-wrap gap-3 p-6"
            style={{ borderTop: `1px solid ${C.border}` }}
          >
            <span className="text-xs font-medium" style={{ color: C.grey }}>
              Showing {from}-{to} of {packages.length} packages
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage(Math.max(1, safePage - 1))}
                disabled={safePage === 1}
                className="w-8 h-8 rounded flex items-center justify-center transition hover:brightness-125 disabled:opacity-40"
                style={{ backgroundColor: C.card, border: `1px solid ${C.pageBorder}`, color: C.grey }}
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              {pageNumbers.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className="w-8 h-8 rounded text-xs font-medium transition hover:brightness-125"
                  style={
                    n === safePage
                      ? { backgroundColor: C.lime, border: `1px solid ${C.lime}`, color: C.navy, fontWeight: 700 }
                      : { backgroundColor: C.card, border: `1px solid ${C.pageBorder}`, color: C.grey }
                  }
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage(Math.min(totalPages, safePage + 1))}
                disabled={safePage === totalPages}
                className="w-8 h-8 rounded flex items-center justify-center transition hover:brightness-125 disabled:opacity-40"
                style={{ backgroundColor: C.card, border: `1px solid ${C.pageBorder}`, color: C.grey }}
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create / Edit / View modal: Figma mein design nahi tha, theme ke mutabiq banaya hai */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.6)", fontFamily: FONT }}
          onClick={closeModal}
        >
          <form
            onSubmit={handleSave}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[560px] max-h-[90vh] overflow-y-auto rounded-2xl p-6"
            style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
          >
            <div className="flex items-start justify-between mb-5">
              <h2 className="text-xl font-bold" style={{ color: C.primary }}>
                {modal.mode === "create"
                  ? "Create New Pack"
                  : modal.mode === "edit"
                  ? `Edit ${modal.pkg.title}`
                  : modal.pkg.title}
              </h2>
              <button type="button" onClick={closeModal} aria-label="Close" style={{ color: C.grey }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Package name" full>
                <input style={inputStyle} value={form.title} onChange={setField("title")} disabled={isView} />
              </Field>
              <Field label="SKU key">
                <input
                  style={inputStyle}
                  value={form.key}
                  onChange={setField("key")}
                  placeholder="e.g. starter_pack"
                  disabled={isView}
                />
              </Field>
              <Field label="Currency">
                <input style={inputStyle} value={form.currency} onChange={setField("currency")} disabled={isView} />
              </Field>
              <Field label="Amount (carrots)">
                <input
                  type="number"
                  min="0"
                  style={inputStyle}
                  value={form.total_coin}
                  onChange={setField("total_coin")}
                  disabled={isView}
                />
              </Field>
              <Field label="Price">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  style={inputStyle}
                  value={form.price}
                  onChange={setField("price")}
                  disabled={isView}
                />
              </Field>
              <Field label="Bonus %" full>
                <input
                  type="number"
                  min="0"
                  style={inputStyle}
                  value={form.bonus_percentage}
                  onChange={setField("bonus_percentage")}
                  disabled={isView}
                />
              </Field>

              <div className="sm:col-span-2 flex flex-col gap-1.5">
                <span style={labelStyle}>Package image</span>
                {isView ? (
                  modal.pkg.image_url && (
                    <img
                      src={modal.pkg.image_url}
                      alt={modal.pkg.title}
                      className="h-40 object-contain rounded-lg"
                      style={{ backgroundColor: C.imageBg }}
                    />
                  )
                ) : (
                  <>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                      }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        pickImage(e.dataTransfer.files?.[0]);
                      }}
                      className="flex flex-col items-center justify-center gap-2 rounded-lg py-6 cursor-pointer transition"
                      style={{
                        border: `1px dashed ${dragOver ? C.yellow : "rgba(255,255,255,0.2)"}`,
                        backgroundColor: dragOver ? "rgba(219,226,28,0.05)" : "transparent",
                      }}
                    >
                      <UploadCloud className="w-5 h-5 text-white/40" />
                      <p className="text-white/40 text-xs">
                        {imageFile
                          ? imageFile.name
                          : modal.mode === "edit"
                          ? "Current image is kept. Drop a new image to replace it."
                          : "Drop image or click to browse"}
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => pickImage(e.target.files?.[0])}
                    />
                  </>
                )}
              </div>
            </div>

            {formError && (
              <p className="mt-4 text-sm" style={{ color: "#FFB4AB" }}>
                {formError}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
                style={{ backgroundColor: "#1F2D63" }}
              >
                {isView ? "Close" : "Cancel"}
              </button>
              {!isView && (
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg px-5 py-2.5 text-sm font-bold transition hover:brightness-95 disabled:opacity-60"
                  style={{ backgroundColor: C.yellow, color: "#1F2544" }}
                >
                  {saving ? "Saving..." : modal.mode === "create" ? "Create Pack" : "Save Changes"}
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}