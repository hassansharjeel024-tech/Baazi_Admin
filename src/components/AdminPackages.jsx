import { useMemo, useRef, useState } from "react";
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
import packCoinImage from "../assets/pack-coin.png";
import {
  useGetCoinPackagesQuery,
  useCreateCoinPackageMutation,
  useUpdateCoinPackageMutation,
} from "../services/api/coinPackageApi";
import { useListPaymentsQuery } from "../services/api/paymentApi";

const FONT = "'Montserrat', sans-serif";
const JAKARTA = "'Plus Jakarta Sans', sans-serif";
const PAGE_SIZE = 3;
const DAY_MS = 24 * 60 * 60 * 1000;
const EMPTY_LIST = [];
const MAX_PACK_CARDS = 3;

// Figma ki coin image: teenon pack cards mein yehi dikhegi
const PACK_IMAGE = packCoinImage;

const C = {
  card: "#091E46",
  border: "rgba(59,130,246,0.22)",
  bar: "#120D2A",
  field: "#0B1330",
  imageBg: "#252A38",
  rowLine: "rgba(59,130,246,0.12)",
  pageBorder: "#303443",
  primary: "#D0D0D0",
  text: "#DEE2F5",
  grey: "#6B7280",
  muted: "#C7C8AD", // Figma: ID / CARROTS / PRICE labels
  lime: "#DBEE2A",
  yellow: "#DBE21C",
  navy: "#091E46",
  btn: "#303443", // Figma: pack card Edit button fill
  danger: "#FF6161",
  dangerSoft: "#FFB4AB", // Figma: delete button border/icon
};

const EMPTY_FORM = {
  title: "",
  key: "",
  currency: "usd",
  total_coin: "",
  price: "",
  bonus_percentage: "",
};

// RTK Query ke error se readable message nikalne ke liye
function getErrMsg(err, fallback = "Something went wrong. Please try again.") {
  return (
    err?.data?.message ||
    err?.data?.error ||
    err?.message ||
    (typeof err?.error === "string" ? err.error : "") ||
    fallback
  );
}

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

// Label style (Figma): Montserrat 500, 12/16, tracking 0.6px, uppercase
const labelStyle = {
  fontFamily: FONT,
  fontWeight: 500,
  fontSize: "12px",
  lineHeight: "16px",
  letterSpacing: "0.6px",
  textTransform: "uppercase",
  color: C.grey,
};

// Pack card ke labels (Figma): Montserrat 500, 16/24, uppercase, #C7C8AD
const packLabelStyle = {
  fontFamily: FONT,
  fontWeight: 500,
  fontSize: "16px",
  lineHeight: "24px",
  letterSpacing: "0px",
  textTransform: "uppercase",
  color: C.muted,
};

// Table header (Figma): Montserrat 500, 16/24, uppercase, #D0D0D0
const thStyle = {
  fontFamily: FONT,
  fontWeight: 500,
  fontSize: "16px",
  lineHeight: "24px",
  letterSpacing: "0px",
  textTransform: "uppercase",
  color: C.primary,
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
            lineHeight: "48px",
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

function PackCard({ pkg, onEdit, index = 0 }) {
  // PACK_IMAGE set ho to wohi sab cards mein, warna backend ki image
  const imageSrc = PACK_IMAGE || pkg.image_url;

  return (
    <div
      className="rounded-xl overflow-hidden flex flex-col h-[433px]"
      style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
    >
      {/* Image area */}
      <div
        className="h-[160px] shrink-0 flex items-center justify-center"
        style={{ backgroundColor: C.imageBg }}
      >
        {imageSrc ? (
                    <img
            src={imageSrc}
            alt={pkg.title}
            className={PACK_IMAGE ? "h-full w-full object-contain" : "h-full w-full object-contain p-3"}
          />
        ) : (
          <Coins className="w-12 h-12" style={{ color: C.yellow }} />
        )}
      </div>

      {/* Body (padding 24: Figma se andaza) */}
      <div className="p-6 flex flex-col flex-1" style={{ fontFamily: FONT }}>
        {/* Name + ID */}
        <div className="flex items-start justify-between gap-2 min-h-[48px]">
          <p
            className="max-w-[100px]"
            style={{
              fontFamily: FONT,
              fontWeight: 600,
              fontSize: "18px",
              lineHeight: "24px",
              color: "#FFFFFF",
            }}
          >
            {pkg.title}
          </p>
          <span
            className="shrink-0"
            style={{
              fontFamily: FONT,
              fontWeight: 400,
              fontSize: "16px",
              lineHeight: "24px",
              color: C.muted,
            }}
          >
            ID:
            <br />
            {padId(pkg.id)}
          </span>
        </div>

        {/* Carrots */}
        <div className="flex items-center justify-between mt-4">
          <span style={packLabelStyle}>Carrots</span>
          <span
            style={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: "18px",
              lineHeight: "28px",
              color: "#FFFFFF",
            }}
          >
            {Number(pkg.total_coin || 0).toLocaleString()}
          </span>
        </div>

        {/* Price (divider ka colour: andaza) */}
        <div
          className="flex items-center justify-between mt-4 pt-4"
          style={{ borderTop: `1px solid ${C.rowLine}` }}
        >
          <span style={packLabelStyle}>Price</span>
          <span
            style={{
              fontFamily: FONT,
              fontWeight: 800,
              fontSize: "24px",
              lineHeight: "32px",
              color: C.lime,
            }}
          >
            {formatPrice(pkg.price, pkg.currency)}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2 mt-auto">
          <button
            type="button"
            onClick={onEdit}
            className="flex-1 h-10 rounded-lg inline-flex items-center justify-center gap-2 text-base leading-6 font-bold text-white transition"
            style={{ backgroundColor: C.btn, fontFamily: FONT }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = C.lime;
                            e.currentTarget.style.color = "#1A1E00";
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
            className="w-12 h-10 rounded-lg inline-flex items-center justify-center cursor-not-allowed shrink-0"
                                               style={{
              border: "1px solid rgba(255,180,171,0.3)",
              color: index === 0 ? C.yellow : C.dangerSoft,
            }}
          >
                        <Trash2 className="w-4 h-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPackages() {
  // ---- API (RTK Query) ----
  const {
    data: packagesData,
    isLoading: packagesLoading,
    error: packagesError,
  } = useGetCoinPackagesQuery();
  const {
    data: paymentsData,
    isLoading: paymentsLoading,
    isError: paymentsError,
  } = useListPaymentsQuery();
  const [createCoinPackage] = useCreateCoinPackageMutation();
  const [updateCoinPackage] = useUpdateCoinPackageMutation();

  const packages = packagesData ?? EMPTY_LIST;
  const loading = packagesLoading;
  const error = packagesError ? getErrMsg(packagesError, "Failed to load packages") : "";

  // Pichhle 24 ghante ki succeeded payments ka total
  const sales = useMemo(() => {
    const since = Date.now() - DAY_MS;
    const recent = (paymentsData ?? EMPTY_LIST).filter(
      (p) => p.status === 2 && new Date(p.created_at).getTime() >= since
    );
    return {
      revenue: recent.reduce((sum, p) => sum + Number(p.amount || 0), 0),
      coins: recent.reduce((sum, p) => sum + Number(p.total_coin || 0), 0),
    };
  }, [paymentsData]);

  const [notice, setNotice] = useState("");
  const [page, setPage] = useState(1);

  const [modal, setModal] = useState(null); // { mode: "create" | "edit" | "view", pkg }
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const fileInputRef = useRef(null);

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
        await createCoinPackage(values).unwrap();
        setNotice(`"${values.title}" created successfully.`);
      } else {
        await updateCoinPackage({ id: modal.pkg.id, values }).unwrap();
        setNotice(`"${values.title}" updated successfully.`);
      }

      // List khud refresh hoti hai (invalidatesTags)
      setModal(null);
    } catch (err) {
      setFormError(getErrMsg(err));
    } finally {
      setSaving(false);
    }
  }

  // ---- table pagination ----
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

  const salesValue = paymentsLoading ? "-" : paymentsError ? "--" : formatPrice(sales.revenue);
  const coinsValue = paymentsLoading ? "-" : paymentsError ? "--" : sales.coins.toLocaleString();

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <StatCard
            icon={totalSalesIcon}
            tag="Daily volume"
            tagBg="rgba(219,238,42,0.1)"
            tagColor={C.yellow}
            label="Total Sales (24H)"
            value={salesValue}
          />
          <StatCard
            icon={carrotsIssuedIcon}
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

        {loading && (
          <p className="text-sm mb-10" style={{ color: C.grey }}>
            Loading packages...
          </p>
        )}
        {!loading && error && (
          <p className="text-sm mb-10" style={{ color: C.danger }}>
            {error}
          </p>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10 items-stretch">
                        {packages.slice(0, MAX_PACK_CARDS).map((p, i) => (
              <PackCard key={p.id} pkg={p} index={i} onEdit={() => openModal("edit", p)} />
            ))}

            {/* Add Custom Pack (Figma: Pack 4: Custom) */}
            <div
              className="rounded-xl flex flex-col items-center justify-center text-center h-[440px] min-h-[440px]"
              style={{ backgroundColor: C.card, border: `1px dashed ${C.border}`, padding: "47px 32px 78px" }}
            >
              <span
                className="w-20 h-20 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: C.yellow, border: `1px solid ${C.yellow}` }}
              >
                                <CirclePlus className="w-[30px] h-[30px]" style={{ color: "#000000" }} />
              </span>
              <p
                className="mt-4 max-w-[116px]"
                style={{
                  fontFamily: FONT,
                  fontWeight: 600,
                  fontSize: "18px",
                  lineHeight: "24px",
                  color: "#FFFFFF",
                }}
              >
                Add Custom Pack
              </p>
              <p
                className="mt-2 max-w-[123px]"
                style={{
                  fontFamily: FONT,
                  fontWeight: 500,
                  fontSize: "16px",
                  lineHeight: "24px",
                  color: C.grey,
                }}
              >
                Create a new carrot coin bundle with custom pricing.
              </p>
              <button
                type="button"
                onClick={() => openModal("create")}
                className="mt-6 rounded-lg text-center transition hover:brightness-125"
                style={{
                  border: `1px solid ${C.lime}`,
                  color: C.lime,
                  paddingTop: "8px",
                  paddingBottom: "8px",
                  paddingLeft: "38.09px",
                  paddingRight: "38.09px",
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: "16px",
                  lineHeight: "24px",
                }}
              >
                {/* Figma: text do lines mein wrap hota hai */}
                <span className="block max-w-[72px]">Start Creation</span>
              </button>
            </div>
          </div>
        )}

        {/* Inventory Management */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ backgroundColor: C.card, border: `1px solid ${C.border}` }}
        >
          <div className="p-6" style={{ borderBottom: `1px solid ${C.border}` }}>
            <h2 className="text-[18px] leading-6 font-semibold text-white">Inventory Management</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left table-fixed min-w-[918px]">
              <colgroup>
                <col style={{ width: "190px" }} />
                <col style={{ width: "158px" }} />
                <col style={{ width: "122px" }} />
                <col style={{ width: "106px" }} />
                <col style={{ width: "174px" }} />
                <col style={{ width: "168px" }} />
              </colgroup>
              <thead>
                <tr
                  className="h-[86px]"
                  style={{ backgroundColor: C.bar, borderBottom: `1px solid ${C.border}` }}
                >
                  <th className="px-6" style={thStyle}>
                    Package
                    <br />
                    Name
                  </th>
                  <th className="px-6 whitespace-nowrap" style={thStyle}>
                    Amount
                  </th>
                  <th className="px-6 whitespace-nowrap" style={thStyle}>
                    SKU Code
                  </th>
                  <th className="px-6 whitespace-nowrap" style={thStyle}>
                    Status
                  </th>
                  <th className="px-6 text-center whitespace-nowrap" style={thStyle}>
                    Price
                  </th>
                  <th className="px-6 text-center whitespace-nowrap" style={thStyle}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr className="h-20">
                    <td colSpan={6} className="pl-6 text-sm" style={{ color: C.grey }}>
                      Loading packages...
                    </td>
                  </tr>
                )}

                {!loading && error && (
                  <tr className="h-20">
                    <td colSpan={6} className="pl-6 text-sm" style={{ color: C.danger }}>
                      {error}
                    </td>
                  </tr>
                )}

                {!loading && !error && packages.length === 0 && (
                  <tr className="h-20">
                    <td colSpan={6} className="pl-6 text-sm" style={{ color: C.grey }}>
                      No packages yet. Create your first pack.
                    </td>
                  </tr>
                )}

                {pageItems.map((p, i) => (
                  <tr
                    key={p.id}
                    className="h-20"
                    style={i > 0 ? { borderTop: `1px solid ${C.rowLine}` } : undefined}
                  >
                    {/* Package name: Plus Jakarta Sans 700 16/24 white */}
                    <td
                      className="px-6 truncate"
                      style={{
                        fontFamily: JAKARTA,
                        fontWeight: 700,
                        fontSize: "16px",
                        lineHeight: "24px",
                        color: "#FFFFFF",
                      }}
                    >
                      {p.title}
                    </td>

                    {/* Amount pill: Plus Jakarta Sans 400 16/24, bg #090E1B, border 1px, radius 4, padding 2.5/12 */}
                    <td className="pl-6 pr-0 whitespace-nowrap">
                      <span
                        className="inline-block"
                        style={{
                          fontFamily: JAKARTA,
                          fontWeight: 400,
                          fontSize: "16px",
                          lineHeight: "24px",
                          color: C.text,
                          backgroundColor: "#090E1B",
                          border: `1px solid ${C.border}`,
                          borderRadius: "4px",
                          padding: "2.5px 12px",
                        }}
                      >
                        {Number(p.total_coin || 0).toLocaleString()} Carrots
                      </span>
                    </td>

                    {/* SKU: Montserrat 700 16/24 #DEE2F5 */}
                    <td
                      className="pl-7 pr-0 whitespace-nowrap"
                      style={{
                        fontFamily: FONT,
                        fontWeight: 700,
                        fontSize: "16px",
                        lineHeight: "24px",
                        color: C.text,
                      }}
                    >
                      {p.key}
                    </td>

                    {/* Status badge: padding 2.5/8, radius 4, bg #DBEE2A 20%, text Montserrat 700 10/15 #DBE21C */}
                    <td className="pl-6 pr-0 whitespace-nowrap">
                      {/* List mein status field nahi hai: sab ACTIVE dikhate hain */}
                      <span
                        className="inline-block uppercase"
                        style={{
                          fontFamily: FONT,
                          fontWeight: 700,
                          fontSize: "10px",
                          lineHeight: "15px",
                          letterSpacing: "0px",
                          color: C.yellow,
                          backgroundColor: "rgba(219,238,42,0.2)",
                          borderRadius: "4px",
                          padding: "2.5px 8px",
                        }}
                      >
                        Active
                      </span>
                    </td>

                    {/* Price: Montserrat 500 16/24 #DBEE2A, center */}
                    <td
                      className="px-6 text-center whitespace-nowrap"
                      style={{
                        fontFamily: FONT,
                        fontWeight: 500,
                        fontSize: "16px",
                        lineHeight: "24px",
                        color: C.lime,
                      }}
                    >
                      {formatPrice(p.price, p.currency)}
                    </td>

                    {/* Actions: grey #6B7280 icons, center */}
                    <td className="px-6 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-3" style={{ color: C.grey }}>
                        <button
                          type="button"
                          aria-label="View"
                          onClick={() => openModal("view", p)}
                          className="hover:text-white transition"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          aria-label="Edit"
                          onClick={() => openModal("edit", p)}
                          className="hover:text-white transition"
                        >
                          <Pencil className="w-[18px] h-[18px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between flex-wrap gap-3 px-6 py-4"
            style={{ borderTop: `1px solid ${C.border}` }}
          >
            <span className="text-base leading-6 font-medium" style={{ color: C.grey }}>
              Showing {from}-{to} of {packages.length} packages
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage(Math.max(1, safePage - 1))}
                disabled={safePage === 1}
                className="w-[34px] h-[34px] rounded flex items-center justify-center transition hover:brightness-125 disabled:opacity-40"
                style={{ backgroundColor: C.card, border: `1px solid ${C.pageBorder}`, color: C.grey }}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              {pageNumbers.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className="w-[34px] h-[34px] rounded text-xs font-medium transition hover:brightness-125"
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
                className="w-[34px] h-[34px] rounded flex items-center justify-center transition hover:brightness-125 disabled:opacity-40"
                style={{ backgroundColor: C.card, border: `1px solid ${C.pageBorder}`, color: C.grey }}
              >
                <ChevronRight className="w-3.5 h-3.5" />
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