// Firebase Imports
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
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCxn2fnSd9KSfE_cWv0xB6CXjU9Q15l78Y",
  authDomain: "team-link-sharing.firebaseapp.com",
  projectId: "team-link-sharing",
  storageBucket: "team-link-sharing.firebasestorage.app",
  messagingSenderId: "1032525205790",
  appId: "1:1032525205790:web:dcbe2aa98a6d7e2d62790f"
};

// Init
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM
const linksContainer = document.getElementById("linksContainer");
const addBtn = document.getElementById("addBtn");

// Add Link
addBtn.addEventListener("click", async () => {

  const title = document.getElementById("title").value.trim();
  const url = document.getElementById("url").value.trim();
  const category = document.getElementById("category").value.trim();
  const description = document.getElementById("description").value.trim();

  if (!title || !url) {
    alert("Title and URL required!");
    return;
  }

  await addDoc(collection(db, "links"), {
    title,
    url,
    category,
    description,
    votes: 0,
    createdAt: new Date()
  });

  document.getElementById("title").value = "";
  document.getElementById("url").value = "";
  document.getElementById("category").value = "";
  document.getElementById("description").value = "";
});

// Real-time listener (Order by votes DESC)
const q = query(collection(db, "links"), orderBy("votes", "desc"));

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
        <p>👍 Votes: ${link.votes || 0}</p>
        <button class="upvote-btn" onclick="upvote('${docSnap.id}')">
          👍 Upvote
        </button>
      </div>
    `;

    linksContainer.innerHTML += card;
  });

});

// Upvote function
window.upvote = async function(id) {
  const linkRef = doc(db, "links", id);

  await updateDoc(linkRef, {
    votes: increment(1)
  });
};
