// filepath: /workspaces/lukew296.github.io/dashboard.js
// Initialize Firebase (use your config)
const firebaseConfig = {
    // Your Firebase config here
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// Check authentication state
auth.onAuthStateChanged(user => {
    if (user) {
        // Load user data
        loadUserData(user);
    } else {
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
    }
});

// Load user data and check role
function loadUserData(user) {
    const userRef = database.ref('users/' + user.uid);
    userRef.once('value').then(snapshot => {
        const userData = snapshot.val() || {};
        
        // Display user info
        document.getElementById('userDisplayName').textContent = user.displayName || user.email.split('@')[0];
        document.getElementById('userEmail').textContent = user.email;
        document.getElementById('userRole').textContent = userData.role || 'user';

        // Show admin panel if user is admin
        if (userData.role === 'admin') {
            document.getElementById('adminPanel').style.display = 'block';
            loadMessages();
        }
    });
}

// Load all messages for admin
function loadMessages() {
    const messageList = document.getElementById('messageList');
    const messagesRef = database.ref('messages');

    messagesRef.on('value', snapshot => {
        messageList.innerHTML = '';
        snapshot.forEach(childSnapshot => {
            const message = childSnapshot.val();
            const messageKey = childSnapshot.key;

            const messageElement = document.createElement('div');
            messageElement.className = 'message-item';
            messageElement.innerHTML = `
                <div>
                    <strong>${message.username}</strong>: ${message.text}
                    <small>(${new Date(message.timestamp).toLocaleString()})</small>
                </div>
                <button class="flag-button ${message.flagged ? 'flagged' : ''}" 
                        onclick="toggleFlag('${messageKey}', ${!message.flagged})">
                    ${message.flagged ? 'Unflag' : 'Flag'}
                </button>
            `;
            messageList.appendChild(messageElement);
        });
    });
}

// Toggle message flag
function toggleFlag(messageId, flagged) {
    const messageRef = database.ref('messages/' + messageId);
    messageRef.update({ flagged: flagged });
}

// Logout functionality
document.getElementById('logoutBtn').addEventListener('click', () => {
    auth.signOut().then(() => {
        window.location.href = 'index.html';
    });
});