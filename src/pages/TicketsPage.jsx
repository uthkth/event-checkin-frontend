import { useEffect, useMemo, useState } from "react";
import QRCode from "react-qr-code";
import { apiGet } from "../api.js";

export default function TicketsPage() {
    const [tickets, setTickets] = useState([]);
    const [q, setQ] = useState("");

    async function load() {
        const data = await apiGet("/tickets");
        setTickets(data || []);
    }
    useEffect(() => { load(); }, []);

    const filtered = useMemo(() => {
        const s = q.trim().toLowerCase();
        if (!s) return tickets;
        return tickets.filter(t =>
            (t.customerName || "").toLowerCase().includes(s) ||
            (t.ticketReferenceNumber || "").toLowerCase().includes(s) ||
            (t.ticketType || "").toLowerCase().includes(s)
        );
    }, [tickets, q]);

    return (
        <div style={{ padding: 16, display: "grid", gap: 12 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                    className="input"
                    placeholder="Search by name, reference or type"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    style={{ maxWidth: 420 }}
                />
                <button onClick={load}>Refresh</button>
            </div>

            <div className="card" style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ textAlign: "left", color: "#6b7280", fontSize: 12 }}>
                            <th style={{ padding: "8px 6px" }}>#</th>
                            <th style={{ padding: "8px 6px" }}>Customer Name</th>
                            <th style={{ padding: "8px 6px" }}>Reference Number</th>
                            <th style={{ padding: "8px 6px" }}>Ticket Type</th>
                            <th style={{ padding: "8px 6px" }}>Checked In</th>
                            <th style={{ padding: "8px 6px" }}>Checked-In At</th>
                            <th style={{ padding: "8px 6px" }}>QR</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((t, idx) => (
                            <tr key={t.ticketReferenceNumber} style={{ borderTop: "1px solid #f0f0f0" }}>
                                <td style={{ padding: "8px 6px" }}>{idx + 1}</td>
                                <td style={{ padding: "8px 6px" }}>{t.customerName || "-"}</td>
                                <td style={{ padding: "8px 6px", fontFamily: "ui-monospace,Menlo,Consolas,monospace" }}>
                                    {t.ticketReferenceNumber}
                                </td>
                                <td style={{ padding: "8px 6px" }}>{t.ticketType}</td>
                                <td style={{ padding: "8px 6px" }}>{t.checkedIn ? "Yes" : "No"}</td>
                                <td style={{ padding: "8px 6px" }}>
                                    {t.checkedInAt ? new Date(t.checkedInAt).toLocaleString() : "-"}
                                </td>
                                <td style={{ padding: "8px 6px" }}>
                                    <div style={{ width: 48, height: 48, background: "#fff", padding: 2, borderRadius: 6, border: "1px solid #e5e7eb" }}>
                                        <QRCode value={t.ticketReferenceNumber} size={44} viewBox={`0 0 44 44`} />
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={7} style={{ padding: 16, color: "#6b7280" }}>No tickets</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
