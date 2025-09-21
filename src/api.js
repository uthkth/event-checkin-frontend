// src/api.js
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const ADMIN_KEY = import.meta.env.VITE_ADMIN_KEY || ""; // optional

if (!window.__printedApiBase) {
  console.log("[API] Base URL:", API_URL);
  window.__printedApiBase = true;
}

export async function apiGet(path) {
  const r = await fetch(`${API_URL}${path}`);
  const text = await r.text();
  let data = {};
  try {
    data = JSON.parse(text || "{}");
  } catch {}
  if (!r.ok) {
    const err = new Error(data?.message || `GET ${path} failed`);
    err.status = r.status;
    err.body = data;
    throw err;
  }
  return data;
}

export async function apiPost(path, body, admin = false) {
  const headers = { "Content-Type": "application/json" };
  if (admin && ADMIN_KEY) headers["x-admin-key"] = ADMIN_KEY;

  const r = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body || {}),
  });

  const text = await r.text();
  let data = {};
  try {
    data = JSON.parse(text || "{}");
  } catch {}
  if (!r.ok) {
    const err = new Error(data?.message || `POST ${path} failed`);
    err.status = r.status;
    err.body = data;
    throw err;
  }
  return data;
}

export async function apiDelete(path, admin = false) {
  const headers = {};
  if (admin && ADMIN_KEY) headers["x-admin-key"] = ADMIN_KEY;

  const r = await fetch(`${API_URL}${path}`, { method: "DELETE", headers });
  const text = await r.text();
  let data = {};
  try {
    data = JSON.parse(text || "{}");
  } catch {}
  if (!r.ok) {
    const err = new Error(data?.message || `DELETE ${path} failed`);
    err.status = r.status;
    err.body = data;
    throw err;
  }
  return data;
}
