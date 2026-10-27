import { useMemo, useRef, useState } from "react";
import { Gift, CalendarCheck, Pencil, CirclePlus, UploadCloud } from "lucide-react";
import AdminLayout from "./AdminLayout";
import DataTable from "./ui/DataTable";
import addRewardIcon from "../assets/add-reward-icon.png";
import {
  useGetRewardsQuery,
  useCreateRewardMutation,
  useUpdateRewardMutation,
} from "../services/api/rewardApi";
import { useGetRewardCategoriesQuery } from "../services/api/rewardCategoryApi";
import { useListUserRewardsQuery } from "../services/api/userRewardApi";
import { getErrorMessage } from "../lib/apiHelpers";
import { colors, alpha } from "../theme";

const EMPTY_FORM = {
  name: "",
  description: "",
  carrot: "",
  stock: "",
  reward_category_id: "",
  expires_date: "",
};

// API mein "Draft" nahi hai. Expired status stock aur expires_at se nikalta hai.
const STATUS_STYLE = {
  Active: { bg: colors.primaryBg20, color: colors.primaryBright },
  "Out of stock": { bg: colors.accentBg20, color: colors.accentSoft },
  Expired: { bg: colors.borderMuted, color: colors.textMuted },
};

function getStatus(reward) {
  if (reward.expires_at && new Date(reward.expires_at) < new Date()) return "Expired";
  if (reward.stock !== null && reward.stock !== undefined && Number(reward.stock) <= 0) {
    return "Out of stock";
  }
  return "Active";
}

function toDateInput(value) {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

function fieldStyle() {
  return {
    backgroundColor: colors.surfaceForm,
    border: `1px solid ${colors.borderMuted}`,
  };
}

const REWARD_MUTED_CELL = {
  fontFamily: "'Montserrat', sans-serif",
  fontWeight: 400,
  fontSize: "16px",
  lineHeight: "24px",
  color: colors.textSecondary,
};

export default function AdminRewards() {
  const {
    data: rewards = [],
    isLoading: rewardsLoading,
    isError: rewardsIsError,
    error: rewardsError,
    refetch: refetchRewards,
  } = useGetRewardsQuery();
  const { data: categories = [] } = useGetRewardCategoriesQuery();
  const { data: claimsData } = useListUserRewardsQuery();
  const claims = claimsData?.rewards ?? null;

  const [createReward, { isLoading: creating }] = useCreateRewardMutation();
  const [updateReward, { isLoading: updating }] = useUpdateRewardMutation();
  const saving = creating || updating;

  const [notice, setNotice] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [formError, setFormError] = useState("");

  const formRef = useRef(null);
  const nameRef = useRef(null);
  const fileInputRef = useRef(null);

  const state = {
    loading: rewardsLoading,
    error: rewardsIsError ? getErrorMessage(rewardsError, "Failed to load rewards") : "",
    rewards,
    categories,
    claims,
  };

  // ---- derived numbers ----
  const claimedByReward = {};
  (state.claims || []).forEach((c) => {
    if (c.status === 4) return; // cancelled ginti mein nahi
    claimedByReward[c.reward_id] = (claimedByReward[c.reward_id] || 0) + 1;
  });

  const now = new Date();
  const claimsThisMonth = state.claims
    ? state.claims.filter((c) => {
        if (c.status === 4) return false;
        const d = new Date(c.created_at);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      }).length
    : null;

  const activeCount = state.rewards.filter((r) => getStatus(r) === "Active").length;

  // ---- form helpers ----
  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function scrollToForm() {
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      nameRef.current?.focus();
    }, 50);
  }

  function resetForm() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setImageFile(null);
    setFormError("");
  }

  function startCreate() {
    resetForm();
    scrollToForm();
  }

  function startEdit(reward) {
    setEditingId(reward.id);
    setForm({
      name: reward.name || "",
      description: reward.description || "",
      carrot: reward.carrot ?? "",
      stock: reward.stock ?? "",
      reward_category_id: reward.reward_category_id ? String(reward.reward_category_id) : "",
      expires_date: toDateInput(reward.expires_at),
    });
    setImageFile(null);
    setFormError("");
    scrollToForm();
  }

  function pickImage(file) {
    if (file && file.type.startsWith("image/")) setImageFile(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    if (!form.name.trim()) {
      setFormError("Reward name is required.");
      return;
    }

    try {
      // khali fields toFormData khud hata deta hai
      const values = {
        name: form.name.trim(),
        description: form.description,
        carrot: form.carrot,
        stock: form.stock,
        reward_category_id: form.reward_category_id,
      };
      if (form.expires_date) values.expires_at = `${form.expires_date}T23:59:59`;
      if (imageFile) values.image = imageFile;

      if (editingId) {
        await updateReward({ id: editingId, values }).unwrap();
        setNotice(`"${values.name}" updated successfully.`);
      } else {
        await createReward(values).unwrap();
        setNotice(`"${values.name}" created successfully.`);
      }

      resetForm();
      refetchRewards();
    } catch (err) {
      setFormError(getErrorMessage(err));
    }
  }

  const statValue = (v) => (state.loading || v === null ? "-" : v);

  const rewardColumns = useMemo(
    () => [
      {
        key: "name",
        header: "Reward",
        headerClassName: "py-3 px-5",
        cellClassName: "py-4 px-5",
        cellStyle: {
          fontFamily: "'Montserrat', sans-serif",
          fontWeight: 700,
          fontSize: "16px",
          lineHeight: "24px",
          color: colors.white,
        },
        accessor: "name",
      },
      {
        key: "carrot",
        header: "Cost Carrots",
        headerClassName: "py-3 px-5",
        cellClassName: "py-4 px-5",
        cellStyle: REWARD_MUTED_CELL,
        render: (r) => Number(r.carrot || 0).toLocaleString(),
      },
      {
        key: "claimed",
        header: "Claimed",
        headerClassName: "py-3 px-5",
        cellClassName: "py-4 px-5",
        cellStyle: REWARD_MUTED_CELL,
        render: (r) => (state.claims ? claimedByReward[r.id] || 0 : "-"),
      },
      {
        key: "status",
        header: "Status",
        headerClassName: "py-3 px-5",
        cellClassName: "py-4 px-5",
        render: (r) => {
          const status = getStatus(r);
          return (
            <span
              className="rounded-full inline-block"
              style={{
                backgroundColor: STATUS_STYLE[status].bg,
                color: STATUS_STYLE[status].color,
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700,
                fontSize: "12px",
                lineHeight: "16px",
                paddingTop: "3.5px",
                paddingBottom: "3.5px",
                paddingLeft: "12px",
                paddingRight: "12px",
              }}
            >
              {status}
            </span>
          );
        },
      },
      {
        key: "actions",
        header: "Actions",
        headerClassName: "py-3 px-5 text-right",
        cellClassName: "py-4 px-5 text-right",
        render: (r) => (
          <button
            type="button"
            onClick={() => startEdit(r)}
            className="inline-flex items-center gap-1.5 rounded-lg hover:brightness-110 transition"
            style={{
              backgroundColor: colors.button,
              paddingTop: "6px",
              paddingBottom: "6px",
              paddingLeft: "16px",
              paddingRight: "16px",
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 700,
              fontSize: "16px",
              lineHeight: "24px",
              color: colors.white,
            }}
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
        ),
      },
    ],
    // claimedByReward is derived from state.claims in the same render
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.claims]
  );

  return (
    <AdminLayout>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1
            className="mb-1"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 700,
              fontSize: "32px",
              lineHeight: "40px",
              letterSpacing: "0px",
              color: colors.textPrimary,
            }}
          >
            Reward Management
          </h1>
          <p
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 400,
              fontSize: "16px",
              lineHeight: "24px",
              color: colors.textPrimary,
            }}
          >
            Configure player engagement loops and reward distribution values.
          </p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="flex items-center gap-2 rounded-full hover:brightness-95 transition"
          style={{
            backgroundColor: colors.primary,
            paddingTop: "10px",
            paddingBottom: "10px",
            paddingLeft: "24px",
            paddingRight: "24px",
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 700,
            fontSize: "16px",
            lineHeight: "24px",
            color: colors.surface,
          }}
        >
          <CirclePlus className="w-5 h-5" style={{ color: colors.surfaceChip }} />
          Add Reward
        </button>
      </div>

      {notice && (
        <div
          className="mb-4 rounded-lg px-4 py-3 text-sm"
          style={{
            fontFamily: "'Montserrat', sans-serif",
            color: colors.primaryBright,
            backgroundColor: colors.primaryBg10,
            border: `1px solid ${colors.primaryBg20}`,
          }}
        >
          {notice}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center mb-4"
            style={{ backgroundColor: alpha(colors.primary, 0.13) }}
          >
            <Gift className="w-4 h-4" style={{ color: colors.primary }} />
          </div>
          <p
            className="mb-1"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 500,
              fontSize: "12px",
              lineHeight: "16px",
              letterSpacing: "1.2px",
              textTransform: "uppercase",
              color: colors.primaryDark,
            }}
          >
            Active Reward
          </p>
          <p
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 700,
              fontSize: "48px",
              lineHeight: "56px",
              letterSpacing: "-0.96px",
              color: colors.white,
            }}
          >
            {statValue(activeCount)}
          </p>
        </div>

        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center mb-4"
            style={{ backgroundColor: colors.accentBg22 }}
          >
            <CalendarCheck className="w-4 h-4" style={{ color: colors.accent }} />
          </div>
          <p
            className="mb-1"
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 500,
              fontSize: "12px",
              lineHeight: "16px",
              letterSpacing: "1.2px",
              textTransform: "uppercase",
              color: colors.textPrimary,
            }}
          >
            Claim This Month
          </p>
          <p
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 700,
              fontSize: "48px",
              lineHeight: "56px",
              letterSpacing: "-0.96px",
              color: colors.white,
            }}
          >
            {statValue(claimsThisMonth)}
          </p>
        </div>
      </div>

      {/* Rewards table */}
      <div
        className="rounded-2xl overflow-hidden mb-6"
        style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, paddingTop: "8px" }}
      >
        <DataTable
          tableClassName="w-full text-left min-w-[560px]"
          theadRowStyle={{ backgroundColor: colors.surfaceElevated, borderBottom: `1px solid ${colors.borderOlive}` }}
          columns={rewardColumns}
          data={state.rewards}
          isLoading={state.loading}
          loadingMessage="Loading rewards..."
          isError={Boolean(state.error)}
          error={state.error}
          emptyMessage="No rewards yet. Add your first reward below."
          divided="top"
          divider={`1px solid ${colors.borderSubtle}`}
        />
      </div>

      {/* Add / Edit Reward form */}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="rounded-xl p-6"
        style={{ backgroundColor: colors.surfaceFormAlt, border: `1px solid ${colors.borderSubtle}` }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white text-sm font-semibold flex items-center gap-2">
            <img src={addRewardIcon} alt="" className="w-4 h-4" />
            {editingId ? "Edit Reward" : "Add new Reward"}
          </h2>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="text-xs font-semibold hover:underline"
              style={{ color: colors.primary }}
            >
              Cancel
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="text-white/50 text-xs font-medium block mb-1.5">Reward name</label>
            <input
              ref={nameRef}
              type="text"
              value={form.name}
              onChange={setField("name")}
              placeholder="e.g. iPhone 15"
              className="w-full text-white text-sm px-3.5 py-2.5 rounded-lg placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary-bright"
              style={fieldStyle()}
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-white/50 text-xs font-medium block mb-1.5">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={setField("description")}
              placeholder="Short game description..."
              className="w-full text-white text-sm px-3.5 py-2.5 rounded-lg placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary-bright resize-none"
              style={fieldStyle()}
            />
          </div>

          <div>
            <label className="text-white/50 text-xs font-medium block mb-1.5">Carrot cost</label>
            <input
              type="number"
              min="0"
              value={form.carrot}
              onChange={setField("carrot")}
              placeholder="e.g. 50000"
              className="w-full text-white text-sm px-3.5 py-2.5 rounded-lg placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary-bright"
              style={fieldStyle()}
            />
          </div>

          <div>
            <label className="text-white/50 text-xs font-medium block mb-1.5">Stock Quantity</label>
            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={setField("stock")}
              placeholder="e.g. 10"
              className="w-full text-white text-sm px-3.5 py-2.5 rounded-lg placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary-bright"
              style={fieldStyle()}
            />
          </div>

          <div>
            <label className="text-white/50 text-xs font-medium block mb-1.5">Category</label>
            <select
              value={form.reward_category_id}
              onChange={setField("reward_category_id")}
              className="w-full text-white text-sm px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-bright"
              style={fieldStyle()}
            >
              <option value="">Select category</option>
              {state.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-white/50 text-xs font-medium block mb-1.5">Expires on</label>
            <input
              type="date"
              value={form.expires_date}
              onChange={setField("expires_date")}
              className="w-full text-white text-sm px-3.5 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-bright"
              style={fieldStyle()}
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-white/50 text-xs font-medium block mb-1.5">Game thumbnail</label>
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
              className="flex flex-col items-center justify-center gap-2 rounded-lg py-8 cursor-pointer transition"
              style={{
                border: `1px dashed ${dragOver ? colors.primary : colors.borderWhite20}`,
                backgroundColor: dragOver ? colors.primarySoft05 : "transparent",
              }}
            >
              <UploadCloud className="w-5 h-5 text-white/40" />
              <p className="text-white/40 text-xs">
                {imageFile
                  ? imageFile.name
                  : editingId
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
          </div>
        </div>

        {formError && (
          <p className="mb-3 text-sm" style={{ color: colors.dangerSoft }}>
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full text-sm font-bold py-3 rounded-lg hover:brightness-95 transition disabled:opacity-60"
          style={{ backgroundColor: colors.primary, color: colors.surfacePanel }}
        >
          {saving ? "Saving..." : editingId ? "Save Changes" : "Upload Game"}
        </button>
      </form>
    </AdminLayout>
  );
}