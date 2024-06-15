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
            <div class="show-password-container">
                <input type="password" id="password" placeholder="Enter your password" required />
                <input type="checkbox" id="showPassword"> Show Password
            </div>
            <label>
                <input type="checkbox" id="rememberMe"> Remember Me
            </label>
            <button type="submit">Login</button>
            <p class="feedback" id="loginFeedback"></p>
            <p class="loading" id="loadingIndicator">Logging in...</p>
        </form>
    `;

    document.getElementById('showPassword').addEventListener('change', () => {
        const passwordField = document.getElementById('password');
        passwordField.type = passwordField.type === 'password' ? 'text' : 'password';
    });

    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        if (validateEmail(email)) {
            showLoading(true);
            setTimeout(() => {
                localStorage.setItem('email', email);
                if (rememberMe) {
                    localStorage.setItem('rememberMe', 'true');
                } else {
                    localStorage.removeItem('rememberMe');
                }
                showLoading(false);
                showHomePage();
            }, 1000); // Simulate an API call
        } else {
            showFeedback('Invalid email format.', 'loginFeedback');
        }
    });
}

function showLoading(isLoading) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (isLoading) {
        loadingIndicator.style.display = 'block';
    } else {
        loadingIndicator.style.display = 'none';
    }
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
            <select id="noteCategory">
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
        if (!localStorage.getItem('rememberMe')) {
            localStorage.removeItem('email');
        }
        showLoginPage();
    });

    document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);

    document.getElementById('profileButton').addEventListener('click', showProfilePage);

    document.getElementById('search').addEventListener('input', displayNotes);

    document.getElementById('categoryFilter').addEventListener('change', displayNotes);

    document.getElementById('sortNotes').addEventListener('change', displayNotes);

    displayNotes();
}

function addOrUpdateNote() {
    const title = document.getElementById('noteTitle').value;
    const content = document.getElementById('noteContent').value;
    const category = document.getElementById('noteCategory').value;
    const noteIndex = document.getElementById('noteIndex').value;
    const timestamp = new Date().toLocaleString();

    const notes = JSON.parse(localStorage.getItem('notes')) || [];

    if (notes.some((note, index) => note.title === title && index != noteIndex)) {
        showFeedback('A note with this title already exists.', 'noteFeedback');
        return;
    }

    if (noteIndex) {
        if (confirm('Are you sure you want to update this note?')) {
            notes[noteIndex] = { title, content, category, timestamp };
            showFeedback('Note updated successfully.', 'noteFeedback');
        } else {
            return;
        }
    } else {
        notes.push({ title, content, category, timestamp });
        showFeedback('Note added successfully.', 'noteFeedback');
    }

    localStorage.setItem('notes', JSON.stringify(notes));
    document.getElementById('noteForm').reset();
    document.getElementById('noteIndex').value = '';
    document.querySelector('form button[type="submit"]').innerText = 'Add Note';
    displayNotes();
}

function displayNotes() {
    const notesContainer = document.getElementById('notesContainer');
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const searchQuery = document.getElementById('search').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const sortNotes = document.getElementById('sortNotes').value;

    notesContainer.innerHTML = '';

    let filteredNotes = notes.filter(note => 
        note.title.toLowerCase().includes(searchQuery) &&
        (categoryFilter ? note.category === categoryFilter : true)
    );

    if (sortNotes === 'newest') {
        filteredNotes = filteredNotes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } else {
        filteredNotes = filteredNotes.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    }

    filteredNotes.forEach((note, index) => {
        const noteElement = document.createElement('div');
        noteElement.className = 'note';
        noteElement.innerHTML = `
            <h3>${highlightText(note.title, searchQuery)}</h3>
            <p>${highlightText(note.content, searchQuery)}</p>
            <p><strong>Category:</strong> ${note.category}</p>
            <p><small>${note.timestamp}</small></p>
            <button class="edit-button" onclick="editNote(${index})">Edit</button>
            <button class="delete-button" onclick="confirmDeleteNote(${index})">Delete</button>
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
    showFeedback('Note deleted successfully.', 'noteFeedback');
}

function editNote(index) {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    const note = notes[index];
    document.getElementById('noteTitle').value = note.title;
    document.getElementById('noteContent').value = note.content;
    document.getElementById('noteCategory').value = note.category;
    document.getElementById('noteIndex').value = index;

    document.querySelector('form button[type="submit"]').innerText = 'Update Note';
}

function highlightText(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
}

function showProfilePage() {
    const email = localStorage.getItem('email');
    const app = document.getElementById('app');
    app.innerHTML = `
        <h2>Profile</h2>
        <form id="profileForm">
            <label>Email:</label>
            <input type="email" id="profileEmail" value="${email}" required />
            <button type="submit">Update</button>
        </form>
        <p class="feedback" id="profileFeedback"></p>
        <button id="backToNotes">Back to Notes</button>
    `;

    document.getElementById('profileForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const newEmail = document.getElementById('profileEmail').value;
        if (validateEmail(newEmail)) {
            localStorage.setItem('email', newEmail);
            showFeedback('Profile updated successfully.', 'profileFeedback');
            showHomePage();
        } else {
            showFeedback('Invalid email format.', 'profileFeedback');
        }
    });

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
