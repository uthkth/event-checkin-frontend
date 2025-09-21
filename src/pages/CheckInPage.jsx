import { Scanner } from "@yudiel/react-qr-scanner";
import { useEffect, useRef, useState } from "react";
import { apiGet, apiPost } from "../api.js";
import "/src/App.css";

export default function CheckInPage() {
    // Lock page scroll ONLY while this page is mounted
    useEffect(() => {
        const prevBody = document.body.style.overflow;
        const prevHtml = document.documentElement.style.overflow;
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = prevBody;
            document.documentElement.style.overflow = prevHtml;
        };
    }, []);

    // state
    const [recent, setRecent] = useState([]);
    const [status, setStatus] = useState("idle"); // idle | success | error
    const [message, setMessage] = useState("");
    const [refValue, setRefValue] = useState("");

    // guards
    const busy = useRef(false);
    const lastScan = useRef({ value: null, time: 0 });

    // data
    async function loadRecent() {
        const all = await apiGet("/tickets");
        const list = (all || [])
            .filter((t) => t.checkedIn && t.checkedInAt)
            .sort((a, b) => new Date(b.checkedInAt) - new Date(a.checkedInAt))
            .slice(0, 6);
        setRecent(list);
    }
    useEffect(() => { loadRecent(); }, []);

    // helpers
    function clearToast() { setStatus("idle"); setMessage(""); }
    function ok(msg) { setStatus("success"); setMessage(msg); }
    function err(msg) { setStatus("error"); setMessage(msg); if (navigator.vibrate) navigator.vibrate(150); }

    async function doCheck(reference, method) {
        try {
            const data = await apiPost("/checkin", { ticketReferenceNumber: reference, method });
            ok(`Checked in: ${data.ticketReferenceNumber} (${data.ticketType})`);
            await loadRecent();
        } catch (e) {
            if (e.status === 409) err("This ticket is already checked in.");
            else if (e.status === 404) err("Ticket not found. Please verify the code.");
            else err(e.message || "Check-in failed. Please try again.");
        }
    }

    // manual entry
    async function onManual() {
        const v = refValue.trim();
        if (!v) return;
        await doCheck(v, "manual");
        setRefValue("");
    }

    // scanner
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    async function onScan(result) {
        if (!result) return;
        const value =
            typeof result === "string"
                ? result
                : result?.rawValue || result?.text || result?.getText?.();
        if (!value) return;
        if (!uuid.test(value)) { err("Invalid QR (not a ticket reference)."); return; }

        const now = Date.now();
        if (lastScan.current.value === value && now - lastScan.current.time < 5000) return;
        lastScan.current = { value, time: now };

        if (busy.current) return;
        busy.current = true;
        try { await doCheck(value, "qr"); }
        finally { setTimeout(() => (busy.current = false), 1200); }
    }

    return (
        <>
            {/* fixed toast at top center with a neat × button on the right */}
            {status !== "idle" && (
                <div className={`toast ${status}`}>
                    <span>{message}</span>
                    <button
                        onClick={clearToast}
                        className="toast-x"
                        aria-label="Close"
                        title="Close"
                    >
                        <span aria-hidden="true">×</span>
                    </button>
                </div>
            )}

            <div className="checkin-shell">
                {/* LEFT: scanner */}
                <section className="left-col">
                    <div className="card">
                        <div className="card-title">Scan QR</div>
                        <div className="scanner-box">
                            <Scanner
                                onScan={(results) => {
                                    const first = Array.isArray(results) ? results[0] : results;
                                    onScan(first);
                                }}
                                allowMultiple={false}
                                components={{ audio: true, finder: true }}
                            />
                        </div>
                    </div>
                </section>

                {/* RIGHT: manual entry (top) + recent check-ins (below) */}
                <aside className="right-col">
                    <div className="card manual">
                        <div className="card-title">Manual reference</div>
                        <div className="row">
                            <input
                                className="input"
                                placeholder="Paste ticket reference"
                                value={refValue}
                                onChange={(e) => setRefValue(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter" && refValue.trim()) onManual(); }}
                            />
                            <button onClick={onManual} disabled={!refValue.trim()}>Check In</button>
                        </div>
                    </div>

                    <div className="card recent">
                        <div className="card-title">Recent check-ins</div>
                        <ul className="recent-list">
                            {recent.length === 0 && <li className="muted">None yet</li>}
                            {recent.map((t) => (
                                <li className="recent-item" key={t.ticketReferenceNumber}>
                                    <span className="mono">{t.ticketReferenceNumber.slice(0, 8)}…</span>
                                    <span className="pill">{t.ticketType}</span>
                                    <span className="muted small">{new Date(t.checkedInAt).toLocaleTimeString()}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>
            </div>
        </>
    );
}
