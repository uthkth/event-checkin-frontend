import { Scanner } from "@yudiel/react-qr-scanner";
import { useRef, useState } from "react";
import { apiPost } from "../api.js";

export default function CheckInPage() {
    const [ref, setRef] = useState("");
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState("idle"); // idle | success | error
    const lastScannedRef = useRef(null);          // to prevent rapid duplicate calls
    const busy = useRef(false);

    async function doCheckIn(reference, method) {
        try {
            setStatus("idle"); setMessage("");
            const data = await apiPost("/checkin", {
                ticketReferenceNumber: reference,
                method,
            });
            setStatus("success");
            setMessage(`✅ Checked in: ${data.ticketType} – ${data.ticketReferenceNumber}`);
        } catch (e) {
            setStatus("error");
            setMessage("❌ " + (e?.message || "Failed to check in"));
        } finally {
            busy.current = false;
            // let the same code be scanned again after a short delay
            setTimeout(() => { lastScannedRef.current = null; }, 800);
        }
    }

    function extractValue(result) {
        // Handles: string | { rawValue/text } | [{ rawValue/text }, ...]
        if (!result) return "";
        if (Array.isArray(result)) {
            const first = result[0];
            return (
                String(first?.rawValue ?? first?.text ?? first?.value ?? first ?? "")
                    .trim()
            );
        }
        if (typeof result === "object") {
            return String(result.rawValue ?? result.text ?? result.value ?? "")
                .trim();
        }
        return String(result).trim();
    }

    async function handleScan(result) {
        const value = extractValue(result);
        console.log("Decoded QR value:", result, "→", value);
        if (!value) return;

        // avoid firing multiple requests for the same value quickly
        if (busy.current) return;
        if (lastScannedRef.current === value) return;

        busy.current = true;
        lastScannedRef.current = value;
        await doCheckIn(value, "qr");
    }

    async function handleManual() {
        const value = ref.trim();
        if (!value) return;
        await doCheckIn(value, "manual");
        setRef("");
    }

    return (
        <div>
            <h2>Check-In</h2>

            <div style={{ width: 320, height: 320, border: "1px solid #ddd", borderRadius: 8, overflow: "hidden", marginBottom: 16 }}>
                <Scanner
                    onDecode={handleScan}
                    onError={(err) => console.error("Scanner error:", err)}
                    constraints={{ facingMode: "environment" }}
                />
            </div>

            <div>
                <input
                    type="text"
                    placeholder="Enter Ticket Reference"
                    value={ref}
                    onChange={(e) => setRef(e.target.value)}
                />
                <button onClick={handleManual} disabled={!ref.trim()}>
                    Check In
                </button>
            </div>

            {message && (
                <p style={{ marginTop: 8, color: status === "success" ? "green" : "red" }}>
                    {message}
                </p>
            )}
        </div>
    );
}
