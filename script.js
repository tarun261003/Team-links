// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  deleteDoc, 
  doc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 🔥 Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCxn2fnSd9KSfE_cWv0xB6CXjU9Q15l78Y",
  authDomain: "team-link-sharing.firebaseapp.com",
  projectId: "team-link-sharing",
  storageBucket: "team-link-sharing.firebasestorage.app",
  messagingSenderId: "1032525205790",
  appId: "1:1032525205790:web:dcbe2aa98a6d7e2d62790f",
  measurementId: "G-JM1HFJFB6P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
getAnalytics(app);
const db = getFirestore(app);

// DOM
const linksContainer = document.getElementById("linksContainer");
const addBtn = document.getElementById("addBtn");

// ➕ Add Link
addBtn.addEventListener("click", async () => {

  const title = document.getElementById("title").value.trim();
  const url = document.getElementById("url").value.trim();
  const category = document.getElementById("category").value.trim();
  const description = document.getElementById("description").value.trim();

  if (!title || !url) {
    alert("Title and URL are required!");
    return;
  }

  try {
    await addDoc(collection(db, "links"), {
      title,
      url,
      category,
      description,
      createdAt: new Date()
    });

    // Clear fields
    document.getElementById("title").value = "";
    document.getElementById("url").value = "";
    document.getElementById("category").value = "";
    document.getElementById("description").value = "";

  } catch (error) {
    console.error("Error adding link: ", error);
  }
});

// 👀 Real-Time Fetch (Latest First)
const q = query(collection(db, "links"), orderBy("createdAt", "desc"));

onSnapshot(q, (snapshot) => {

  linksContainer.innerHTML = "";

  snapshot.forEach((docSnap) => {

    const link = docSnap.data();

    const card = `
      <div class="card">
        <h3>${link.title}</h3>
        <p>${link.description || ""}</p>
        <a href="${link.url}" target="_blank">${link.url}</a>
        <p><strong>Category:</strong> ${link.category || "N/A"}</p>
        <button onclick="deleteLink('${docSnap.id}')">Delete</button>
      </div>
    `;

    linksContainer.innerHTML += card;
  });

});

// ❌ Delete Link
window.deleteLink = async function(id) {
  try {
    await deleteDoc(doc(db, "links", id));
  } catch (error) {
    console.error("Error deleting link: ", error);
  }
};
