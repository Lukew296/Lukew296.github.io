// Message loading with flag checking
function loadMessages() {
    const messagesRef = database.ref('messages').orderByChild('timestamp');
    
    messagesRef.on('value', snapshot => {
        chatMessages.innerHTML = '';
        snapshot.forEach(childSnapshot => {
            const message = childSnapshot.val();
            const messageKey = childSnapshot.key;
            
            // Check if message is flagged before displaying
            if (!message.flagged || isAdmin()) {
                displayMessage(message, messageKey);
            }
        });
    });
}

// Enhanced message display with admin controls
function displayMessage(message, messageKey) {
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.dataset.messageId = messageKey;

    const header = document.createElement('div');
    header.className = 'message-header';

    const userSpan = document.createElement('span');
    userSpan.className = 'username';
    userSpan.textContent = message.username || 'Anonymous';

    const timestampSpan = document.createElement('span');
    timestampSpan.className = 'timestamp';
    const timeString = message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : '';
    timestampSpan.textContent = timeString;

    header.appendChild(userSpan);
    header.appendChild(timestampSpan);

    // Add admin controls if user is admin
    if (isAdmin()) {
        const adminControls = document.createElement('div');
        adminControls.className = 'admin-controls';
        
        const flagButton = document.createElement('button');
        flagButton.className = `flag-button ${message.flagged ? 'flagged' : ''}`;
        flagButton.textContent = message.flagged ? 'Unflag' : 'Flag';
        flagButton.onclick = () => toggleMessageFlag(messageKey, !message.flagged);
        
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteMessage(messageKey);

        adminControls.appendChild(flagButton);
        adminControls.appendChild(deleteButton);
        header.appendChild(adminControls);
    }

    const content = document.createElement('div');
    content.className = 'message-content';
    content.textContent = message.text;

    if (message.flagged && isAdmin()) {
        messageElement.classList.add('flagged-message');
    }

    messageElement.appendChild(header);
    messageElement.appendChild(content);
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Admin functions
function isAdmin() {
    const user = auth.currentUser;
    if (!user) return false;
    
    return new Promise((resolve) => {
        database.ref(`users/${user.uid}/role`).once('value')
            .then(snapshot => {
                resolve(snapshot.val() === 'admin');
            })
            .catch(() => resolve(false));
    });
}

function toggleMessageFlag(messageId, flagged) {
    if (!isAdmin()) return;
    
    database.ref(`messages/${messageId}`).update({
        flagged: flagged
    }).catch(error => {
        console.error('Error toggling message flag:', error);
    });
}

function deleteMessage(messageId) {
    if (!isAdmin()) return;
    
    if (confirm('Are you sure you want to delete this message?')) {
        database.ref(`messages/${messageId}`).remove()
            .catch(error => {
                console.error('Error deleting message:', error);
            });
    }
}

// Enhanced message sending with flag initialization
function sendMessage() {
    const message = messageInput.value.trim();
    if (!message || !auth.currentUser) return;

    const messageData = {
        text: message,
        username: auth.currentUser.displayName || auth.currentUser.email.split('@')[0],
        userId: auth.currentUser.uid,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        flagged: false
    };

    database.ref('messages').push(messageData)
        .then(() => {
            messageInput.value = '';
        })
        .catch(error => {
            console.error('Error sending message:', error);
            alert('Failed to send message. Please try again.');
        });
}