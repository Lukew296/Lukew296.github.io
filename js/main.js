document.addEventListener('DOMContentLoaded', function () {
    const mobileMenu = document.querySelector('.mobile-menu');
    const navMenu = document.querySelector('nav ul');

    if (mobileMenu && navMenu) {
        mobileMenu.addEventListener('click', function() {
            navMenu.style.display = navMenu.style.display === 'flex' ? 'none' : 'flex';
        });

        // Close mobile menu when clicking on a link
        document.querySelectorAll('nav ul li a').forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    navMenu.style.display = 'none';
                }
            });
        });
    }
});
document.getElementById('loginBtn').addEventListener('click', () => {
    window.location.href = 'login.html';
});
document.getElementById('signupBtn').addEventListener('click', () => {
    window.location.href = 'signup.html';
});

// Check for saved auth state on page load
auth.onAuthStateChanged(user => {
    if (user) {
        // User is signed in
        document.querySelectorAll('.auth-btn').forEach(btn => btn.style.display = 'none');
        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'auth-btn';
        logoutBtn.textContent = 'Logout';
        logoutBtn.onclick = () => auth.signOut();
        document.querySelector('.auth-buttons').appendChild(logoutBtn);

        // Add dashboard link
        const dashboardLink = document.createElement('li');
        dashboardLink.innerHTML = '<a href="dashboard.html">Dashboard</a>';
        document.querySelector('nav ul').appendChild(dashboardLink);
    }
});

// Update the signup functionality to create user record
signupSubmit.addEventListener('click', () => {
    const username = signupUsername.value;
    const email = signupEmail.value;
    const password = signupPassword.value;

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            // Create user record in database
            return database.ref('users/' + user.uid).set({
                username: username,
                email: email,
                role: 'user',
                createdAt: firebase.database.ServerValue.TIMESTAMP
            });
        })
        .then(() => {
            hideAuthModal();
            window.location.href = 'dashboard.html';
        })
        .catch(error => {
            signupError.textContent = error.message;
        });
});
