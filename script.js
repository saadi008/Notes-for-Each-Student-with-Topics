// script.js
document.addEventListener('DOMContentLoaded', () => {
    checkUserLogin();
});

function checkUserLogin() {
    const userEmail = localStorage.getItem('email');
    if (userEmail) {
        showHomePage();
    } else {
        showLoginPage();
    }
}

function showLoginPage() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <h2>Login</h2>
        <form id="loginForm">
            <input type="email" id="email" placeholder="Enter your email" required />
            <button type="submit">Login</button>
        </form>
    `;

    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        localStorage.setItem('email', email);
        showHomePage();
    });
}

function showHomePage() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <h2>Notes</h2>
            <button id="profileButton">Profile</button>
            <button id="darkModeToggle">Dark Mode</button>
        </div>
        <button id="logout">Logout</button>
        <input type="text" id="search" placeholder="Search notes by title" />
        <form id="noteForm">
            <input type="hidden" id="noteIndex" />
            <input type="text" id="noteTitle" placeholder="Note Title" required />
            <textarea id="noteContent" placeholder="Note Content" rows="4" required></textarea>
            <select id="noteCategory">
                <option value="">Select Category</option>
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Ideas">Ideas</option>
            </select>
            <button type="submit">Add Note</button>
        </form>
        <div id="notesContainer"></div>
    `;

    document.getElementById('noteForm').addEventListener('submit', (e) => {
        e.preventDefault();
        addOrUpdateNote();
    });

    document.getElementById('logout').addEventListener('click', () => {
        localStorage.removeItem('email');
        showLoginPage();
    });

    document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);

    document.getElementById('profileButton').addEventListener('click', showProfilePage);

    document.getElementById('search').addEventListener('input', filterNotes);

    displayNotes();
}

function addOrUpdateNote() {
    const title = document.getElementById('noteTitle').value;
    const content = document.getElementById('noteContent').value;
    const category = document.getElementById('noteCategory').value;
    const noteIndex = document.getElementById('noteIndex').value;
    const timestamp = new Date().toLocaleString();

    const notes = JSON.parse(localStorage.getItem('notes')) || [];

    if (noteIndex) {
        notes[noteIndex] = { title, content, category, timestamp };
    } else {
        notes.push({ title, content, category, timestamp });
    }

    localStorage.setItem('notes', JSON.stringify(notes));
    document.getElementById('noteForm').reset();
    document.getElementById('noteIndex').value = '';
    displayNotes();
}

function displayNotes() {
    const notesContainer = document.getElementById('notesContainer');
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const searchQuery = document.getElementById('search').value.toLowerCase();
    notesContainer.innerHTML = '';

    notes.filter(note => note.title.toLowerCase().includes(searchQuery)).forEach((note, index) => {
        const noteElement = document.createElement('div');
        noteElement.className = 'note';
        noteElement.innerHTML = `
            <h3>${note.title}</h3>
            <p>${note.content}</p>
            <p><strong>Category:</strong> ${note.category}</p>
            <p><small>${note.timestamp}</small></p>
            <button onclick="editNote(${index})">Edit</button>
            <button onclick="confirmDeleteNote(${index})">Delete</button>
        `;
        notesContainer.appendChild(noteElement);
    });
}

function confirmDeleteNote(index) {
    if (confirm('Are you sure you want to delete this note?')) {
        deleteNote(index);
    }
}

function deleteNote(index) {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    notes.splice(index, 1);
    localStorage.setItem('notes', JSON.stringify(notes));
    displayNotes();
}

function editNote(index) {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const note = notes[index];
    document.getElementById('noteTitle').value = note.title;
    document.getElementById('noteContent').value = note.content;
    document.getElementById('noteCategory').value = note.category;
    document.getElementById('noteIndex').value = index;

    // Change the button text to 'Update Note' when editing
    document.querySelector('form button[type="submit"]').innerText = 'Update Note';
    document.getElementById('noteForm').addEventListener('submit', updateNote);
}

function updateNote(e) {
    e.preventDefault();
    const index = document.getElementById('noteIndex').value;
    addOrUpdateNote();
    // Reset the form and change button text back to 'Add Note' after update
    document.getElementById('noteForm').reset();
    document.querySelector('form button[type="submit"]').innerText = 'Add Note';
    // Remove the event listener to prevent adding another listener
    document.getElementById('noteForm').removeEventListener('submit', updateNote);
}

function filterNotes() {
    displayNotes();
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

function showProfilePage() {
    const email = localStorage.getItem('email');
    const app = document.getElementById('app');
    app.innerHTML = `
        <h2>Profile</h2>
        <p>Email: ${email}</p>
        <button id="backToNotes">Back to Notes</button>
    `;

    document.getElementById('backToNotes').addEventListener('click', showHomePage);
}
