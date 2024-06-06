// Function to validate email format
function validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}

// Function to analyze password strength
function analyzePasswordStrength(password) {
    // Simple strength assessment (can be improved)
    if (password.length < 6) {
        return 'Weak';
    } else if (password.length < 10) {
        return 'Medium';
    } else {
        return 'Strong';
    }
}

// Function to auto logout after a period of inactivity
var timeout;
function startTimer() {
    timeout = setTimeout(function () {
        logout();
    }, 300000); // Auto logout after 5 minutes (adjust as needed)
}

function resetTimer() {
    clearTimeout(timeout);
    startTimer();
}

// Function to confirm note deletion
function confirmNoteDeletion(index) {
    var confirmation = confirm('Are you sure you want to delete this note?');
    if (confirmation) {
        deleteNote(index);
    }
}

// Function to update character counter for notes
document.getElementById('noteText').addEventListener('input', function () {
    var maxLength = 200; // Maximum characters allowed
    var currentLength = this.value.length;
    var remaining = maxLength - currentLength;
    document.getElementById('charCount').textContent = remaining + ' characters remaining';
});

// Function to persist login
function persistLogin(email) {
    localStorage.setItem('email', email);
    resetTimer(); // Reset timer on user activity
}

// Check user login status when the page loads
window.onload = function () {
    checkUserLogin();
    startTimer(); // Start timer on page load
};

// Login form submission
document.getElementById('loginForm').addEventListener('submit', function (event) {
    event.preventDefault();

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    if (validateEmail(username) && password) {
        persistLogin(username);
        document.getElementById('message').textContent = 'Login successful!';
        document.getElementById('loginForm').reset();
        // Call displayNotes() after login
        displayNotes();
    } else {
        document.getElementById('message').textContent = 'Invalid email or password';
    }
});

// Submit note form submission
document.getElementById('noteForm').addEventListener('submit', function (event) {
    event.preventDefault();

    var noteText = document.getElementById('noteText').value;
    if (noteText) {
        saveNoteToLocalStorage(noteText);
        document.getElementById('noteText').value = ''; // Clear the input field after submitting
        document.getElementById('charCount').textContent = '200 characters remaining'; // Reset character counter
    }
});

// Logout button click event
document.getElementById('logoutBtn').addEventListener('click', function () {
    logout();
});

// Function to save note to localStorage
function saveNoteToLocalStorage(note) {
    var notes = [];
    if (localStorage.getItem('notes')) {
        notes = JSON.parse(localStorage.getItem('notes'));
    }
    notes.push(note);
    localStorage.setItem('notes', JSON.stringify(notes));
    displayNotes();
}

// Function to delete note from localStorage
function deleteNote(index) {
    var notes = JSON.parse(localStorage.getItem('notes'));
    notes.splice(index, 1);
    localStorage.setItem('notes', JSON.stringify(notes));
    displayNotes();
}

// Function to display notes from localStorage
function displayNotes() {
    var notes = JSON.parse(localStorage.getItem('notes'));
    var notesList = document.getElementById('notesList');
    if (notes && notes.length > 0) {
        notesList.innerHTML = '';
        notes.forEach(function (note, index) {
            var noteElement = document.createElement('div');
            noteElement.classList.add('note');
            noteElement.textContent = note;
            noteElement.setAttribute('onclick', 'confirmNoteDeletion(' + index + ')');
            notesList.appendChild(noteElement);
        });
    } else {
        notesList.innerHTML = 'No notes available';
    }
}

// Function to check user login status
function checkUserLogin() {
    var email = localStorage.getItem('email');
    if (email) {
        document.getElementById('loginContainer').style.display = 'none';
        document.getElementById('homePage').style.display = 'block';
        document.getElementById('userName').textContent = email;
    } else {
        document.getElementById('loginContainer').style.display = 'block';
        document.getElementById('homePage').style.display = 'none';
    }
}

// Function to logout
function logout() {
    localStorage.removeItem('email');
    clearTimeout(timeout); // Clear timer on logout
    checkUserLogin();
}

// Function to search notes
document.getElementById('searchNote').addEventListener('input', function () {
    var searchTerm = this.value.toLowerCase();
    var notes = JSON.parse(localStorage.getItem('notes'));
    var filteredNotes = notes.filter(function (note) {
        return note.toLowerCase().includes(searchTerm);
    });
    displayFilteredNotes(filteredNotes);
});

// Function to display filtered notes
function displayFilteredNotes(filteredNotes) {
    var notesList = document.getElementById('notesList');
    if (filteredNotes && filteredNotes.length > 0) {
        notesList.innerHTML = '';
        filteredNotes.forEach(function (note, index) {
            var noteElement = document.createElement('div');
            noteElement.classList.add('note');
            noteElement.textContent = note;
            noteElement.setAttribute('onclick', 'confirmNoteDeletion(' + index + ')');
            notesList.appendChild(noteElement);
        });
    } else {
        notesList.innerHTML = 'No matching notes found';
    }
}
