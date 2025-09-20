import { useEffect, useState } from "react";
import { apiGet } from "../api.js";

function DashboardPage() {
    const [stats, setStats] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        apiGet("/admin/stats").then(setStats).catch(e => setError(e.message));
    }, []);

    if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
    if (!stats) return <p>Loading...</p>;

    return (
        <div>
            <h2>Admin Dashboard</h2>

            <div style={{
                display: "grid",
                gap: "12px",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                marginBottom: 16
            }}>
                <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
                    <div>Total Tickets</div>
                    <div style={{ fontSize: 24, fontWeight: "bold" }}>{stats.total}</div>
                </div>
                <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
                    <div>Checked-in (all)</div>
                    <div style={{ fontSize: 24, fontWeight: "bold" }}>{stats.checkedIn}</div>
                </div>
            </div>

            <h3>By Ticket Type</h3>
            <ul>
                {Object.keys(stats.perType || {}).map((type) => (
                    <li key={type}>
                        {type}: {stats.perType[type].checkedIn} / {stats.perType[type].total}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default DashboardPage;
