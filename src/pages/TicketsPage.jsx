import { useEffect, useState } from "react";
import { apiGet } from "../api.js";

function TicketsPage() {
    const [tickets, setTickets] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        apiGet("/tickets").then(setTickets).catch(e => setError(e.message));
    }, []);

    if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

    return (
        <div>
            <h2>All Tickets</h2>
            <table>
                <thead>
                    <tr>
                        <th>Reference</th>
                        <th>Type</th>
                        <th>Checked In</th>
                        <th>QR</th>
                    </tr>
                </thead>
                <tbody>
                    {tickets.map((t) => (
                        <tr key={t._id}>
                            <td style={{ fontFamily: "monospace", fontSize: 12 }}>{t.ticketReferenceNumber}</td>
                            <td>{t.ticketType}</td>
                            <td>{t.checkedIn ? "✅ Yes" : "❌ No"}</td>
                            <td>
                                {t.qrCode ? <img src={t.qrCode} alt="QR" width="64" /> : "-"}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default TicketsPage;
