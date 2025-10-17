// main.js

document.addEventListener("DOMContentLoaded", function() {
    // Add event listener for the Explore Now button on the index.html
    const exploreButton = document.querySelector('.cta-button');
    if (exploreButton) {
        exploreButton.addEventListener('click', function() {
            window.location.href = 'videos.html';
        });
    }
});
