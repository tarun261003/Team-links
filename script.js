// Firebase imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  increment,
  query,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Import config from gitignored file
import { firebaseConfig } from "./config.js";

// ─── Init Firebase ───────────────────────────────────
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ─── DOM References ──────────────────────────────────
const linksContainer = document.getElementById("linksContainer");
const addBtn = document.getElementById("addBtn");
const searchInput = document.getElementById("searchInput");
const clearSearchBtn = document.getElementById("clearSearch");
const resultsCount = document.getElementById("resultsCount");
const emptyState = document.getElementById("emptyState");
const loadingSpinner = document.getElementById("loadingSpinner");
const toastContainer = document.getElementById("toastContainer");

// ─── State ───────────────────────────────────────────
let allLinks = [];

// ─── Utility: Sanitize HTML to prevent XSS ───────────
function sanitize(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

// ─── Utility: Truncate URL for display ───────────────
function truncateUrl(url, max = 60) {
  return url.length > max ? url.slice(0, max) + "…" : url;
}

// ─── Toast Notifications ─────────────────────────────
function showToast(message, type = "info") {
  const icons = { success: "✅", error: "❌", info: "ℹ️" };
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || ""}</span><span>${sanitize(message)}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("removing");
    toast.addEventListener("animationend", () => toast.remove());
  }, 3000);
}

// ─── Render Cards ────────────────────────────────────
function renderCards(links) {
  linksContainer.innerHTML = "";

  if (links.length === 0) {
    linksContainer.style.display = "none";
    emptyState.style.display = searchInput.value.trim() ? "none" : "block";

    if (searchInput.value.trim()) {
      resultsCount.textContent = "No results found";
    }
    return;
  }

  emptyState.style.display = "none";
  linksContainer.style.display = "flex";

  links.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-header">
        <h3 class="card-title">${sanitize(item.title)}</h3>
        ${item.category ? `<span class="card-badge">${sanitize(item.category)}</span>` : ""}
      </div>
      ${item.description ? `<p class="card-description">${sanitize(item.description)}</p>` : ""}
      <a class="card-url" href="${sanitize(item.url)}" target="_blank" rel="noopener noreferrer">
        🔗 ${sanitize(truncateUrl(item.url))}
      </a>
      <div class="card-footer">
        <span class="vote-count">👍 <span>${item.votes || 0}</span> votes</span>
        <button class="upvote-btn" data-id="${sanitize(item.id)}">
          ▲ Upvote
        </button>
      </div>
    `;
    linksContainer.appendChild(card);
  });

  // Attach upvote handlers via event delegation
  linksContainer.querySelectorAll(".upvote-btn").forEach((btn) => {
    btn.addEventListener("click", () => upvote(btn.dataset.id));
  });
}

// ─── Search / Filter ─────────────────────────────────
function filterLinks() {
  const q = searchInput.value.trim().toLowerCase();
  clearSearchBtn.style.display = q ? "block" : "none";

  if (!q) {
    resultsCount.textContent = allLinks.length
      ? `${allLinks.length} resource${allLinks.length !== 1 ? "s" : ""}`
      : "";
    renderCards(allLinks);
    return;
  }

  const filtered = allLinks.filter(
    (link) =>
      (link.title || "").toLowerCase().includes(q) ||
      (link.category || "").toLowerCase().includes(q) ||
      (link.description || "").toLowerCase().includes(q),
  );

  resultsCount.textContent = `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${q}"`;
  renderCards(filtered);
}

searchInput.addEventListener("input", filterLinks);
clearSearchBtn.addEventListener("click", () => {
  searchInput.value = "";
  filterLinks();
  searchInput.focus();
});

// ─── Add Link ────────────────────────────────────────
addBtn.addEventListener("click", async () => {
  const titleEl = document.getElementById("title");
  const urlEl = document.getElementById("url");
  const categoryEl = document.getElementById("category");
  const descEl = document.getElementById("description");

  const title = titleEl.value.trim();
  const url = urlEl.value.trim();
  const category = categoryEl.value.trim();
  const description = descEl.value.trim();

  if (!title || !url) {
    showToast("Title and URL are required!", "error");
    return;
  }

  // Basic URL validation
  try {
    new URL(url);
  } catch {
    showToast("Please enter a valid URL.", "error");
    return;
  }

  addBtn.disabled = true;
  addBtn.innerHTML = '<span class="btn-icon">⏳</span> Adding...';

  try {
    await addDoc(collection(db, "links"), {
      title,
      url,
      category,
      description,
      votes: 0,
      createdAt: new Date(),
    });

    titleEl.value = "";
    urlEl.value = "";
    categoryEl.value = "";
    descEl.value = "";

    showToast("Link added successfully!", "success");
  } catch (err) {
    console.error("Error adding link:", err);
    showToast("Failed to add link. Please try again.", "error");
  } finally {
    addBtn.disabled = false;
    addBtn.innerHTML = '<span class="btn-icon">🚀</span> Add Link';
  }
});

// ─── Upvote ──────────────────────────────────────────
async function upvote(id) {
  try {
    const linkRef = doc(db, "links", id);
    await updateDoc(linkRef, { votes: increment(1) });
    showToast("Upvoted!", "success");
  } catch (err) {
    console.error("Error upvoting:", err);
    showToast("Failed to upvote.", "error");
  }
}

// ─── Real-time Listener ─────────────────────────────
const q = query(collection(db, "links"), orderBy("votes", "desc"));

onSnapshot(
  q,
  (snapshot) => {
    loadingSpinner.style.display = "none";

    allLinks = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    filterLinks();
  },
  (err) => {
    loadingSpinner.style.display = "none";
    console.error("Firestore listener error:", err);
    showToast("Could not load links. Check your config.", "error");
    emptyState.style.display = "block";
  },
);
