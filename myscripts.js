window.onload = function() {
    loadComments("post1"); // Înlocuiește "post1" cu ID-ul postării tale
  };

  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDmswBEHLBJI2uHkJek3Gk3YKGbgue3jCs",
  authDomain: "bloguri-muzeu-miorita.firebaseapp.com",
  projectId: "bloguri-muzeu-miorita",
  storageBucket: "bloguri-muzeu-miorita.appspot.com",
  messagingSenderId: "676493451718",
  appId: "1:676493451718:web:91d4daf1016ae8222d52c7",
  measurementId: "G-XGG7EBWH3Z"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.submitPost = async function () {
  const title = document.getElementById("post-title").value;
  const content = document.getElementById("post-content").value;

  if (!title || !content) {
    alert("Completează toate câmpurile!");
    return;
  }

  await addDoc(collection(db, "posts"), {
    title,
    content,
    timestamp: new Date()
  });

  alert("Postare adăugată!");
  document.getElementById("post-title").value = "";
  document.getElementById("post-content").value = "";
  loadPosts();
};

async function addComment(postId, username, comment) {
  await addDoc(collection(db, "comments"), {
    postId,
    username,
    comment,
    timestamp: new Date()
  });
  loadPosts();
}

async function getCommentsForPost(postId) {
  const commentQuery = query(collection(db, "comments"), orderBy("timestamp"));
  const querySnapshot = await getDocs(commentQuery);
  const comments = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.postId === postId) {
      comments.push(data);
    }
  });
  return comments;
}

window.loadPosts = async function () {
  const postsContainer = document.getElementById("posts-list");
  postsContainer.innerHTML = "";

  const postQuery = query(collection(db, "posts"), orderBy("timestamp", "desc"));
  const querySnapshot = await getDocs(postQuery);

  for (const doc of querySnapshot.docs) {
    const data = doc.data();
    const postId = doc.id;

    const postDiv = document.createElement("div");
    postDiv.classList.add("post");
    postDiv.innerHTML = `
      <h4>${data.title}</h4>
      <p>${data.content}</p>
      <div class="comment-section">
        <input type="text" id="username-${postId}" placeholder="Numele tău">
        <textarea id="comment-${postId}" placeholder="Scrie un comentariu..."></textarea>
        <button onclick="submitComment('${postId}')">Adaugă comentariu</button>
        <div id="comments-list-${postId}">Se încarcă comentariile...</div>
      </div>
    `;

    postsContainer.appendChild(postDiv);

    const comments = await getCommentsForPost(postId);
    const commentList = document.getElementById(`comments-list-${postId}`);
    commentList.innerHTML = "";

    comments.forEach((c) => {
      const commentItem = document.createElement("p");
      commentItem.innerHTML = `<strong>${c.username}:</strong> ${c.comment}`;
      commentList.appendChild(commentItem);
    });
  }
};

window.submitComment = async function (postId) {
  const username = document.getElementById(`username-${postId}`).value;
  const comment = document.getElementById(`comment-${postId}`).value;

  if (username && comment) {
    await addComment(postId, username, comment);
  } else {
    alert("Completează toate câmpurile!");
  }
};

window.addEventListener("load", loadPosts);

