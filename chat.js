// Add to chat.js or relevant script
function loadMessages() {
    const messagesRef = database.ref('messages').orderByChild('timestamp');
    
    messagesRef.on('value', snapshot => {
        chatMessages.innerHTML = '';
        snapshot.forEach(childSnapshot => {
            const message = childSnapshot.val();
            // Only display non-flagged messages
            if (!message.flagged) {
                displayMessage(message);
            }
        });
    });
}

function sendMessage() {
    const message = messageInput.value.trim();
    if (!message || !auth.currentUser) return;

    const messageData = {
        text: message,
        username: auth.currentUser.displayName || auth.currentUser.email.split('@')[0],
        userId: auth.currentUser.uid,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        flagged: false // Initialize as not flagged
    };

    database.ref('messages').push(messageData);
    messageInput.value = '';
}