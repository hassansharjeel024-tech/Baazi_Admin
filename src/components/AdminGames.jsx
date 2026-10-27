import { useCallback, useEffect, useMemo, useState } from "react";
import { Gamepad2, Trophy, Pencil, X } from "lucide-react";
import AdminLayout from "./AdminLayout";
import DataTable from "./ui/DataTable";
import { useLazyGetGamesQuery, useUpdateGameMutation } from "../services/api/gameApi";
import { getErrorMessage } from "../lib/apiHelpers";
import { colors, alpha } from "../theme";

const FONT = "'Montserrat', sans-serif";

const SPARK_BARS = [
  { height: 19.19, opacity: 0.2 },
  { height: 28.8, opacity: 0.2 },
  { height: 38.39, opacity: 0.4 },
  { height: 32, opacity: 0.3 },
  { height: 51.19, opacity: 0.6 },
  { height: 64, opacity: 1 },
];

const EMPTY_FORM = {
  name: "",
  url: "",
  description: "",
  carrot: "",
  minimum_score: "",
  entry_coin: "",
  total_level: "",
  category_id: "",
};

const labelStyle = {
  fontFamily: FONT,
  fontWeight: 500,
  fontSize: "12px",
  lineHeight: "16px",
  letterSpacing: "1.2px",
  textTransform: "uppercase",
  color: colors.textSecondary,
};

const inputStyle = {
  fontFamily: FONT,
  fontWeight: 400,
  fontSize: "14px",
  color: colors.textPrimary,
  backgroundColor: colors.surfaceElevated,
  border: `1px solid ${colors.border}`,
  borderRadius: "8px",
  padding: "10px 12px",
  width: "100%",
  outline: "none",
};

const bodyCellStyle = {
  fontFamily: FONT,
  fontWeight: 400,
  fontSize: "16px",
  lineHeight: "24px",
  color: colors.textSecondary,
};

function Field({ label, children, full }) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? "sm:col-span-2" : ""}`}>
      <span style={labelStyle}>{label}</span>
      {children}
    </label>
  );
}

export default function AdminGames() {
  const [fetchGames] = useLazyGetGamesQuery();
  const [updateGame, { isLoading: saving }] = useUpdateGameMutation();

  const [state, setState] = useState({ loading: true, error: "", games: [], categories: [] });
  const [notice, setNotice] = useState("");

  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [formError, setFormError] = useState("");

  const loadGames = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: "" }));
    try {
      // 1) saari games + categories ki list
      const base = await fetchGames().unwrap();
      const categories = (base?.category || []).filter((c) => c.id !== 0);

      // 2) list mein game ki category nahi aati, is liye har category ke filter se match karte hain
      const results = await Promise.allSettled(
        categories.map((c) => fetchGames({ category_id: c.id }).unwrap())
      );
      const categoryByGame = {};
      results.forEach((res, i) => {
        if (res.status === "fulfilled") {
          (res.value?.games || []).forEach((g) => {
            categoryByGame[g.id] = categories[i];
          });
        }
      });

      const games = (base?.games || []).map((g) => ({
        ...g,
        categoryId: categoryByGame[g.id]?.id ?? "",
        categoryName: categoryByGame[g.id]?.name || "-",
      }));

      setState({ loading: false, error: "", games, categories });
    } catch (err) {
      setState({
        loading: false,
        error: getErrorMessage(err, "Failed to load games"),
        games: [],
        categories: [],
      });
    }
  }, [fetchGames]);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  function openEdit(game) {
    setEditing(game);
    setForm({
      ...EMPTY_FORM,
      name: game.name || "",
      url: game.url || "",
      category_id: game.categoryId === "" ? "" : String(game.categoryId),
    });
    setImageFile(null);
    setFormError("");
  }

  function closeEdit() {
    if (saving) return;
    setEditing(null);
  }

  const setField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function handleSave(e) {
    e.preventDefault();
    setFormError("");
    try {
      // khali fields toFormData khud hata deta hai, is liye sirf bhare hue fields jaate hain
      const values = { ...form };
      if (imageFile) values.image = imageFile;

      await updateGame({ id: editing.id, values }).unwrap();
      setEditing(null);
      setNotice(`"${form.name || editing.name}" updated successfully.`);
      await loadGames();
    } catch (err) {
      setFormError(getErrorMessage(err, "Failed to update game"));
    }
  }

  const gamesColumns = useMemo(
    () => [
      {
        key: "name",
        header: "Game",
        headerClassName: "py-3 px-5",
        cellClassName: "py-4 px-5",
        cellStyle: {
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: "16px",
          lineHeight: "24px",
          color: colors.white,
        },
        accessor: "name",
      },
      {
        key: "category",
        header: "Category",
        headerClassName: "py-3 px-5",
        cellClassName: "py-4 px-5",
        cellStyle: bodyCellStyle,
        accessor: "categoryName",
      },
      {
        key: "players",
        header: "Players",
        headerClassName: "py-3 px-5",
        cellClassName: "py-4 px-5",
        cellStyle: bodyCellStyle,
        render: () => "—",
      },
      {
        key: "status",
        header: "Status",
        headerClassName: "py-3 px-5",
        cellClassName: "py-4 px-5",
        cellStyle: bodyCellStyle,
        render: () => "—",
      },
      {
        key: "actions",
        header: "Actions",
        headerClassName: "py-3 px-5 text-right",
        cellClassName: "py-4 px-5 text-right",
        render: (g) => (
          <button
            type="button"
            onClick={() => openEdit(g)}
            className="inline-flex items-center gap-1.5 rounded-lg hover:brightness-110 transition"
            style={{
              backgroundColor: colors.button,
              paddingTop: "6px",
              paddingBottom: "6px",
              paddingLeft: "16px",
              paddingRight: "16px",
              fontFamily: FONT,
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
    []
  );

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1
          style={{
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: "32px",
            lineHeight: "40px",
            letterSpacing: "0px",
            color: colors.textPrimary,
          }}
          className="mb-1"
        >
          Games Management
        </h1>
        <p
          style={{
            fontFamily: FONT,
            fontWeight: 400,
            fontSize: "16px",
            lineHeight: "24px",
            letterSpacing: "0px",
            color: colors.textPrimary,
          }}
        >
          Configure active tournaments, difficulty tiers, and prize allocations.
        </p>
      </div>

      {notice && (
        <div
          className="mb-4 rounded-lg px-4 py-3 text-sm"
          style={{
            fontFamily: FONT,
            color: colors.primaryBright,
            backgroundColor: colors.primaryBg10,
            border: `1px solid ${colors.primaryBg20}`,
          }}
        >
          {notice}
        </div>
      )}

      {/* Active Players aur Prize Pool: in ki API abhi nahi hai, static hain */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center mb-4"
            style={{ backgroundColor: colors.accentBg22 }}
          >
            <Gamepad2 className="w-4 h-4" style={{ color: colors.accent }} />
          </div>
          <p
            className="mb-1"
            style={{
              fontFamily: FONT,
              fontWeight: 500,
              fontSize: "12px",
              lineHeight: "16px",
              letterSpacing: "1.2px",
              textTransform: "uppercase",
              color: colors.primaryDark,
            }}
          >
            Active Players
          </p>
          <div className="flex items-baseline gap-2">
            <p
              style={{
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: "48px",
                lineHeight: "56px",
                letterSpacing: "-0.96px",
                color: colors.white,
              }}
            >
              12.4k
            </p>
            <span
              style={{
                fontFamily: FONT,
                fontWeight: 700,
                fontSize: "14px",
                lineHeight: "20px",
                color: colors.primaryDark,
              }}
            >
              +18% ↑
            </span>
          </div>
        </div>

        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center mb-4"
            style={{ backgroundColor: alpha(colors.primary, 0.13) }}
          >
            <Trophy className="w-4 h-4" style={{ color: colors.primary }} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p
                className="mb-1"
                style={{
                  fontFamily: FONT,
                  fontWeight: 500,
                  fontSize: "12px",
                  lineHeight: "16px",
                  letterSpacing: "1.2px",
                  textTransform: "uppercase",
                  color: colors.textPrimary,
                }}
              >
                Total Prize Pool Distributed
              </p>
              <p
                style={{
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: "48px",
                  lineHeight: "56px",
                  letterSpacing: "-0.96px",
                  color: colors.white,
                }}
              >
                $1,45,20,000
              </p>
            </div>
            <div className="flex items-end gap-3" style={{ height: "64px" }}>
              {SPARK_BARS.map((bar, i) => (
                <div
                  key={i}
                  style={{
                    width: "27.5px",
                    height: `${bar.height}px`,
                    borderTopLeftRadius: "2px",
                    borderTopRightRadius: "2px",
                    backgroundColor:
                      bar.opacity === 1 ? colors.primary : alpha(colors.primaryBright, bar.opacity),
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{
          backgroundColor: colors.surface,
          border: `1px solid ${colors.border}`,
          paddingTop: "8px",
        }}
      >
        <DataTable
          tableClassName="w-full text-left min-w-[560px]"
          theadRowStyle={{
            backgroundColor: colors.surfaceElevated,
            borderBottom: `1px solid ${colors.borderOlive}`,
          }}
          columns={gamesColumns}
          data={state.games}
          isLoading={state.loading}
          loadingMessage="Loading games..."
          isError={Boolean(state.error)}
          error={state.error}
          emptyMessage="No games found."
          divided="top"
          divider={`1px solid ${colors.borderSubtle}`}
        />
      </div>

      {/* Edit modal: Figma mein is ka design nahi tha, theme ke mutabiq banaya hai */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: colors.overlay }}
          onClick={closeEdit}
        >
          <form
            onSubmit={handleSave}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[560px] max-h-[90vh] overflow-y-auto rounded-2xl p-6"
            style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2
                  style={{
                    fontFamily: FONT,
                    fontWeight: 700,
                    fontSize: "20px",
                    lineHeight: "28px",
                    color: colors.textPrimary,
                  }}
                >
                  Edit {editing.name}
                </h2>
                <p style={{ fontFamily: FONT, fontSize: "13px", color: colors.textSecondary }}>
                  Khali chhori hui fields update mein shamil nahi hongi.
                </p>
              </div>
              <button type="button" onClick={closeEdit} aria-label="Close" style={{ color: colors.textSecondary }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Name" full>
                <input style={inputStyle} value={form.name} onChange={setField("name")} />
              </Field>
              <Field label="Game URL" full>
                <input style={inputStyle} value={form.url} onChange={setField("url")} />
              </Field>
              <Field label="Description" full>
                <textarea
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical" }}
                  value={form.description}
                  onChange={setField("description")}
                />
              </Field>
              <Field label="Carrot">
                <input type="number" min="0" style={inputStyle} value={form.carrot} onChange={setField("carrot")} />
              </Field>
              <Field label="Minimum Score">
                <input
                  type="number"
                  min="0"
                  style={inputStyle}
                  value={form.minimum_score}
                  onChange={setField("minimum_score")}
                />
              </Field>
              <Field label="Entry Coin">
                <input
                  type="number"
                  min="0"
                  style={inputStyle}
                  value={form.entry_coin}
                  onChange={setField("entry_coin")}
                />
              </Field>
              <Field label="Total Levels">
                <input
                  type="number"
                  min="0"
                  style={inputStyle}
                  value={form.total_level}
                  onChange={setField("total_level")}
                />
              </Field>
              <Field label="Category">
                <select style={inputStyle} value={form.category_id} onChange={setField("category_id")}>
                  <option value="">Select category</option>
                  {state.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Image">
                <input
                  type="file"
                  accept="image/*"
                  style={{ ...inputStyle, padding: "8px 12px" }}
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
              </Field>
            </div>

            {formError && (
              <p className="mt-4 text-sm" style={{ fontFamily: FONT, color: colors.dangerSoft }}>
                {formError}
              </p>
            )}

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={closeEdit}
                disabled={saving}
                className="rounded-lg hover:brightness-110 transition"
                style={{
                  backgroundColor: colors.button,
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: "14px",
                  color: colors.white,
                  padding: "10px 20px",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg hover:brightness-95 transition disabled:opacity-60"
                style={{
                  backgroundColor: colors.primary,
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: "14px",
                  color: colors.surfacePanel,
                  padding: "10px 20px",
                }}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </AdminLayout>
  );
}