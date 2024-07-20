document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('email')) {
        showHomePage();
    } else {
        showLoginPage();
    }
});

function showLoginPage() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <h2>Login</h2>
        <form id="loginForm">
            <input type="email" id="loginEmail" placeholder="Email" required />
            <input type="password" id="loginPassword" placeholder="Password" required />
            <label>
                <input type="checkbox" id="showLoginPassword"> Show Password
            </label>
            <button type="submit">Login</button>
            <p class="feedback" id="loginFeedback"></p>
        </form>
        <p>Don't have an account? <a href="#" id="showSignUp">Sign Up</a></p>
    `;

    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('showLoginPassword').addEventListener('change', togglePasswordVisibility);
    document.getElementById('showSignUp').addEventListener('click', showSignUpPage);
}

function showSignUpPage() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <h2>Sign Up</h2>
        <form id="signUpForm">
            <input type="email" id="signUpEmail" placeholder="Email" required />
            <input type="password" id="signUpPassword" placeholder="Password" required />
            <label>
                <input type="checkbox" id="showSignUpPassword"> Show Password
            </label>
            <button type="submit">Sign Up</button>
            <p class="feedback" id="signUpFeedback"></p>
        </form>
        <p>Already have an account? <a href="#" id="showLogin">Login</a></p>
    `;

    document.getElementById('signUpForm').addEventListener('submit', handleSignUp);
    document.getElementById('showSignUpPassword').addEventListener('change', togglePasswordVisibility);
    document.getElementById('showLogin').addEventListener('click', showLoginPage);
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const users = JSON.parse(localStorage.getItem('users')) || [];

    const user = users.find(user => user.email === email && user.password === password);

    if (user) {
        localStorage.setItem('email', email);
        showHomePage();
    } else {
        showFeedback('Invalid email or password.', 'loginFeedback');
    }
}

function handleSignUp(e) {
    e.preventDefault();
    const email = document.getElementById('signUpEmail').value;
    const password = document.getElementById('signUpPassword').value;

    if (!validatePassword(password)) {
        showFeedback('Password must be at least 8 characters long, contain a number and a special character.', 'signUpFeedback');
        return;
    }

    const users = JSON.parse(localStorage.getItem('users')) || [];

    if (users.find(user => user.email === email)) {
        showFeedback('Email already exists.', 'signUpFeedback');
        return;
    }

    users.push({ email, password });
    localStorage.setItem('users', JSON.stringify(users));
    showFeedback('Sign up successful. Please log in.', 'signUpFeedback');
}

function validatePassword(password) {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
}

function showFeedback(message, elementId) {
    const feedbackElement = document.getElementById(elementId);
    feedbackElement.textContent = message;
    setTimeout(() => {
        feedbackElement.textContent = '';
    }, 3000);
}

function togglePasswordVisibility(e) {
    const checkbox = e.target;
    const passwordField = checkbox.id === 'showLoginPassword' ? document.getElementById('loginPassword') : document.getElementById('signUpPassword');
    passwordField.type = checkbox.checked ? 'text' : 'password';
}

function showHomePage() {
    const app = document.getElementById('app');
    const isDarkMode = localStorage.getItem('darkMode') === 'true';

    app.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <h2>Notes</h2>
            <button id="profileButton">Profile</button>
            <button id="darkModeToggle">Dark Mode</button>
        </div>
        <button id="logout">Logout</button>
        <input type="text" id="search" placeholder="Search notes by title" />
        <div class="filter-container">
            <select id="categoryFilter">
                <option value="">All Categories</option>
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Ideas">Ideas</option>
            </select>
            <select id="sortNotes">
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
            </select>
        </div>
        <form id="noteForm">
            <input type="hidden" id="noteIndex" />
            <input type="text" id="noteTitle" placeholder="Note Title" required />
            <textarea id="noteContent" placeholder="Note Content" rows="4" maxlength="1000" required></textarea>
            <select id="noteCategory" required>
                <option value="">Select Category</option>
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Ideas">Ideas</option>
            </select>
            <button type="submit">Add Note</button>
            <p class="feedback" id="noteFeedback"></p>
        </form>
        <div id="notesContainer"></div>
    `;

    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }

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

    document.getElementById('search').addEventListener('input', displayNotes);

    document.getElementById('categoryFilter').addEventListener('change', displayNotes);

    document.getElementById('sortNotes').addEventListener('change', displayNotes);

    displayNotes();
}

function getCurrentUserNotes() {
    const email = localStorage.getItem('email');
    const notes = JSON.parse(localStorage.getItem('notes')) || {};
    return notes[email] || [];
}

function saveCurrentUserNotes(notes) {
    const email = localStorage.getItem('email');
    const allNotes = JSON.parse(localStorage.getItem('notes')) || {};
    allNotes[email] = notes;
    localStorage.setItem('notes', JSON.stringify(allNotes));
}

function addOrUpdateNote() {
    const notes = getCurrentUserNotes();
    const noteIndex = document.getElementById('noteIndex').value;
    const noteTitle = document.getElementById('noteTitle').value;
    const noteContent = document.getElementById('noteContent').value;
    const noteCategory = document.getElementById('noteCategory').value;

    if (noteIndex === '') {
        notes.push({ title: noteTitle, content: noteContent, category: noteCategory, created: new Date() });
    } else {
        notes[noteIndex] = { title: noteTitle, content: noteContent, category: noteCategory, created: notes[noteIndex].created, updated: new Date() };
    }

    saveCurrentUserNotes(notes);
    showFeedback('Note saved successfully.', 'noteFeedback');
    displayNotes();
    document.getElementById('noteForm').reset();
}

function displayNotes() {
    const notesContainer = document.getElementById('notesContainer');
    notesContainer.innerHTML = '';
    const notes = getCurrentUserNotes();
    const searchQuery = document.getElementById('search').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const sortOption = document.getElementById('sortNotes').value;

    let filteredNotes = notes.filter(note => {
        return (note.title.toLowerCase().includes(searchQuery) &&
            (categoryFilter === '' || note.category === categoryFilter));
    });

    filteredNotes.sort((a, b) => {
        if (sortOption === 'newest') {
            return new Date(b.created) - new Date(a.created);
        } else {
            return new Date(a.created) - new Date(b.created);
        }
    });

    filteredNotes.forEach((note, index) => {
        const noteElement = document.createElement('div');
        noteElement.classList.add('note');
        noteElement.innerHTML = `
            <h3>${note.title}</h3>
            <p>${note.content}</p>
            <p><strong>Category:</strong> ${note.category}</p>
            <button onclick="editNote(${index})">Edit</button>
            <button onclick="deleteNote(${index})">Delete</button>
        `;
        notesContainer.appendChild(noteElement);
    });
}

function editNote(index) {
    const notes = getCurrentUserNotes();
    const note = notes[index];
    document.getElementById('noteIndex').value = index;
    document.getElementById('noteTitle').value = note.title;
    document.getElementById('noteContent').value = note.content;
    document.getElementById('noteCategory').value = note.category;
}

function deleteNote(index) {
    const notes = getCurrentUserNotes();
    notes.splice(index, 1);
    saveCurrentUserNotes(notes);
    displayNotes();
}

function toggleDarkMode() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
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

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showFeedback(message, elementId) {
    const feedbackElement = document.getElementById(elementId);
    feedbackElement.innerText = message;
    feedbackElement.style.display = 'block';
    setTimeout(() => {
        feedbackElement.style.display = 'none';
    }, 3000);
}
















































