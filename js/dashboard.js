// filepath: /workspaces/lukew296.github.io/dashboard.js
// Initialize Firebase (use your config)
const firebaseConfig = {
    // Your Firebase config here
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// DOM Elements
const displayUsername = document.getElementById('displayUsername');
const displayEmail = document.getElementById('displayEmail');
const displayRole = document.getElementById('displayRole');
const displayJoinDate = document.getElementById('displayJoinDate');
const messageCount = document.getElementById('messageCount');
const lastActive = document.getElementById('lastActive');
const adminPanel = document.getElementById('adminPanel');

// Check authentication state
auth.onAuthStateChanged(user => {
    if (user) {
        loadUserData(user);
        updateLastActive(user.uid);
        countUserMessages(user.uid);
    } else {
        window.location.href = 'login.html';
    }
});

function loadUserData(user) {
    const userRef = database.ref('users/' + user.uid);
    
    userRef.once('value').then(snapshot => {
        const userData = snapshot.val() || {};
        
        // Display basic user info
        displayUsername.textContent = userData.username || user.displayName || user.email.split('@')[0];
        displayEmail.textContent = user.email;
        displayRole.textContent = userData.role || 'User';
        
        // Format and display join date
        const joinDate = userData.createdAt ? new Date(userData.createdAt) : new Date();
        displayJoinDate.textContent = joinDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Show admin panel if user is admin
        if (userData.role === 'admin') {
            adminPanel.style.display = 'block';
            loadAllMessages();
        }
    });
}

function updateLastActive(uid) {
    const userRef = database.ref('users/' + uid);
    userRef.update({
        lastActive: firebase.database.ServerValue.TIMESTAMP
    });
    
    // Update last active display
    const now = new Date();
    lastActive.textContent = now.toLocaleTimeString();
}

function countUserMessages(uid) {
    const messagesRef = database.ref('messages');
    messagesRef.orderByChild('userId').equalTo(uid).once('value', snapshot => {
        messageCount.textContent = snapshot.numChildren();
    });
}

function loadAllMessages() {
    const messagesRef = database.ref('messages');
    const messageList = document.getElementById('messageList');

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

function toggleFlag(messageId, flagged) {
    database.ref('messages/' + messageId).update({ flagged: flagged });
}

// Logout handler
document.getElementById('logoutBtn').addEventListener('click', () => {
    auth.signOut().then(() => {
        window.location.href = 'index.html';
    }).catch(error => {
        console.error('Logout error:', error);
    });
});