import { useEffect, useState } from "react";
import { apiGet } from "../api.js";

function Donut({ pct = 0, color = "#10b981", label, sub }) {
    const r = 22;
    const c = 2 * Math.PI * r;
    const dash = (pct / 100) * c;
    return (
        <div style={{
            display: "flex", alignItems: "center", gap: 12,
            border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, minWidth: 220,
            background: "#fff"
        }}>
            <svg width="56" height="56" viewBox="0 0 56 56">
                <circle cx="28" cy="28" r={r} fill="none" stroke="#f3f4f6" strokeWidth="8" />
                <circle
                    cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="8"
                    strokeDasharray={`${dash} ${c - dash}`} strokeLinecap="round"
                    transform="rotate(-90 28 28)"
                />
                <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="12" fill="#111827">{pct}%</text>
            </svg>
            <div>
                <div style={{ fontWeight: 700 }}>{label}</div>
                <div style={{ color: "#6b7280", fontSize: 12 }}>{sub}</div>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    async function load() {
        setLoading(true);
        try { setStats(await apiGet("/admin/stats")); }
        finally { setLoading(false); }
    }
    useEffect(() => { load(); }, []);

    const total = stats?.total ?? 0;
    const checked = stats?.checkedIn ?? 0;
    const pctTotal = total ? Math.round((checked / total) * 100) : 0;
    const per = stats?.perType ?? {};

    function pctFor(type) { const t = per[type]?.total ?? 0; const c = per[type]?.checkedIn ?? 0; return t ? Math.round((c / t) * 100) : 0; }

    return (
        <div style={{ padding: 16, display: "grid", gap: 16 }}>
            <div className="card">
                <div className="card-title">Total Attendance</div>
                <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
                    {checked} of {total}
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 12 }}>
                    <Donut pct={pctTotal} color="#10b981" label="Overall" sub={`${checked}/${total} Checked`} />
                    <Donut pct={pctFor("Standard")} color="#fb923c" label="Standard" sub={`${per.Standard?.checkedIn ?? 0}/${per.Standard?.total ?? 0} Claimed`} />
                    <Donut pct={pctFor("VIP")} color="#22c55e" label="VIP" sub={`${per.VIP?.checkedIn ?? 0}/${per.VIP?.total ?? 0} Claimed`} />
                    <Donut pct={pctFor("Student")} color="#60a5fa" label="Student" sub={`${per.Student?.checkedIn ?? 0}/${per.Student?.total ?? 0} Claimed`} />
                </div>
            </div>

            <div className="card">
                <div className="card-title">Recent check-ins</div>
                {loading && <div className="muted">Loading…</div>}
                {!loading && (stats?.recent?.length ?? 0) === 0 && <div className="muted">None yet</div>}
                {!loading && (stats?.recent?.length ?? 0) > 0 && (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ textAlign: "left", color: "#6b7280", fontSize: 12 }}>
                                <th style={{ padding: "8px 6px" }}>Reference</th>
                                <th style={{ padding: "8px 6px" }}>Name</th>
                                <th style={{ padding: "8px 6px" }}>Type</th>
                                <th style={{ padding: "8px 6px" }}>Checked-In At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recent.map((t) => (
                                <tr key={t.ticketReferenceNumber} style={{ borderTop: "1px solid #f0f0f0" }}>
                                    <td style={{ padding: "8px 6px", fontFamily: "ui-monospace,Menlo,Consolas,monospace" }}>{t.ticketReferenceNumber}</td>
                                    <td style={{ padding: "8px 6px" }}>{t.customerName || "-"}</td>
                                    <td style={{ padding: "8px 6px" }}>{t.ticketType}</td>
                                    <td style={{ padding: "8px 6px" }}>{t.checkedInAt ? new Date(t.checkedInAt).toLocaleString() : "-"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
