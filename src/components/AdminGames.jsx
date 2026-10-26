import { useCallback, useEffect, useState } from "react";
import { Gamepad2, Trophy, Pencil, X } from "lucide-react";
import AdminLayout from "./AdminLayout";
import { useLazyGetGamesQuery, useUpdateGameMutation } from "../services/api/gameApi";
import { getErrorMessage } from "../lib/apiHelpers";

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
  color: "#6B7280",
};

const inputStyle = {
  fontFamily: FONT,
  fontWeight: 400,
  fontSize: "14px",
  color: "#D0D0D0",
  backgroundColor: "#120D2A",
  border: "1px solid rgba(59,130,246,0.22)",
  borderRadius: "8px",
  padding: "10px 12px",
  width: "100%",
  outline: "none",
};

const headCellStyle = {
  fontFamily: FONT,
  fontWeight: 500,
  fontSize: "12px",
  lineHeight: "16px",
  letterSpacing: "1.2px",
  textTransform: "uppercase",
  color: "#6B7280",
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
            color: "#D0D0D0",
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
            color: "#D0D0D0",
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
            color: "#DBEE2A",
            backgroundColor: "rgba(219,238,42,0.1)",
            border: "1px solid rgba(219,238,42,0.2)",
          }}
        >
          {notice}
        </div>
      )}

      {/* Active Players aur Prize Pool: in ki API abhi nahi hai, static hain */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: "#091E46", border: "1px solid rgba(59,130,246,0.22)" }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center mb-4"
            style={{ backgroundColor: "#3B82F622" }}
          >
            <Gamepad2 className="w-4 h-4" style={{ color: "#3B82F6" }} />
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
              color: "#BFD100",
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
                color: "#FFFFFF",
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
                color: "#BFD100",
              }}
            >
              +18% ↑
            </span>
          </div>
        </div>

        <div
          className="rounded-2xl p-6"
          style={{ backgroundColor: "#091E46", border: "1px solid rgba(59,130,246,0.22)" }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center mb-4"
            style={{ backgroundColor: "#DBE21C22" }}
          >
            <Trophy className="w-4 h-4" style={{ color: "#DBE21C" }} />
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
                  color: "#D0D0D0",
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
                  color: "#FFFFFF",
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
                      bar.opacity === 1 ? "#DBE21C" : `rgba(219,238,42,${bar.opacity})`,
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
          backgroundColor: "#091E46",
          border: "1px solid rgba(59,130,246,0.22)",
          paddingTop: "8px",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[560px]">
            <thead>
              <tr
                style={{
                  backgroundColor: "#120D2A",
                  borderBottom: "1px solid rgba(70,72,51,0.30)",
                }}
              >
                {["Game", "Category", "Players", "Status"].map((label) => (
                  <th key={label} className="py-3 px-5" style={headCellStyle}>
                    {label}
                  </th>
                ))}
                <th className="py-3 px-5 text-right" style={headCellStyle}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {state.loading && (
                <tr>
                  <td colSpan={5} className="py-6 px-5 text-sm" style={{ fontFamily: FONT, color: "#6B7280" }}>
                    Loading games...
                  </td>
                </tr>
              )}

              {!state.loading && state.error && (
                <tr>
                  <td colSpan={5} className="py-6 px-5 text-sm" style={{ fontFamily: FONT, color: "#FFB4AB" }}>
                    {state.error}
                  </td>
                </tr>
              )}

              {!state.loading && !state.error && state.games.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 px-5 text-sm" style={{ fontFamily: FONT, color: "#6B7280" }}>
                    No games found.
                  </td>
                </tr>
              )}

              {state.games.map((g) => (
                <tr key={g.id} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <td
                    className="py-4 px-5"
                    style={{
                      fontFamily: FONT,
                      fontWeight: 700,
                      fontSize: "16px",
                      lineHeight: "24px",
                      color: "#FFFFFF",
                    }}
                  >
                    {g.name}
                  </td>
                  <td
                    className="py-4 px-5"
                    style={{
                      fontFamily: FONT,
                      fontWeight: 400,
                      fontSize: "16px",
                      lineHeight: "24px",
                      color: "#6B7280",
                    }}
                  >
                    {g.categoryName}
                  </td>
                  {/* Players aur Status: API mein field nahi hai */}
                  <td
                    className="py-4 px-5"
                    style={{
                      fontFamily: FONT,
                      fontWeight: 400,
                      fontSize: "16px",
                      lineHeight: "24px",
                      color: "#6B7280",
                    }}
                  >
                    —
                  </td>
                  <td
                    className="py-4 px-5"
                    style={{
                      fontFamily: FONT,
                      fontWeight: 400,
                      fontSize: "16px",
                      lineHeight: "24px",
                      color: "#6B7280",
                    }}
                  >
                    —
                  </td>
                  <td className="py-4 px-5 text-right">
                    <button
                      type="button"
                      onClick={() => openEdit(g)}
                      className="inline-flex items-center gap-1.5 rounded-lg hover:brightness-110 transition"
                      style={{
                        backgroundColor: "#1F2D63",
                        paddingTop: "6px",
                        paddingBottom: "6px",
                        paddingLeft: "16px",
                        paddingRight: "16px",
                        fontFamily: FONT,
                        fontWeight: 700,
                        fontSize: "16px",
                        lineHeight: "24px",
                        color: "#FFFFFF",
                      }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit modal: Figma mein is ka design nahi tha, theme ke mutabiq banaya hai */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onClick={closeEdit}
        >
          <form
            onSubmit={handleSave}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[560px] max-h-[90vh] overflow-y-auto rounded-2xl p-6"
            style={{ backgroundColor: "#091E46", border: "1px solid rgba(59,130,246,0.22)" }}
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2
                  style={{
                    fontFamily: FONT,
                    fontWeight: 700,
                    fontSize: "20px",
                    lineHeight: "28px",
                    color: "#D0D0D0",
                  }}
                >
                  Edit {editing.name}
                </h2>
                <p style={{ fontFamily: FONT, fontSize: "13px", color: "#6B7280" }}>
                  Khali chhori hui fields update mein shamil nahi hongi.
                </p>
              </div>
              <button type="button" onClick={closeEdit} aria-label="Close" style={{ color: "#6B7280" }}>
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
              <p className="mt-4 text-sm" style={{ fontFamily: FONT, color: "#FFB4AB" }}>
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
                  backgroundColor: "#1F2D63",
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: "14px",
                  color: "#FFFFFF",
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
                  backgroundColor: "#DBE21C",
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: "14px",
                  color: "#1F2544",
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