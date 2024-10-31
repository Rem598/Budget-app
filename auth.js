// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function() {
    // List of protected pages that require authentication
    const protectedPages = ['index.html', 'account.html'];

    // Function to check if the user is logged in
    function checkAuth() {
        const loggedInUser = localStorage.getItem("loggedInUser");
        
        if (!loggedInUser && protectedPages.some(page => window.location.href.includes(page))) {
            // Redirect to login page if not logged in and trying to access a protected page
            window.location.href = "login.html";
        } else if (loggedInUser && document.getElementById('welcomeMessage')) {
            // If logged in, display a personalized greeting if on the homepage
            document.getElementById('welcomeMessage').textContent = `Hello, ${loggedInUser}!`;
        }
    }

    // Function to handle user registration
    function handleRegister(event) {
        event.preventDefault(); // Prevent form submission

        const username = document.getElementById("registerUsername").value;
        const password = document.getElementById("registerPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (password === confirmPassword) {
            // Store user info in localStorage
            const userData = { username, password };
            localStorage.setItem(username, JSON.stringify(userData)); // Store user data
            localStorage.setItem("loggedInUser", username); // Store logged-in username
            alert("Registration successful! You can now log in.");
            window.location.href = "login.html"; // Redirect to login page
        } else {
            alert("Passwords do not match. Please try again.");
        }
    }

    // Function to handle user login
    function handleLogin(event) {
        event.preventDefault(); // Prevent form submission

        const username = document.getElementById("loginUsername").value;
        const password = document.getElementById("loginPassword").value;

        const storedUser = JSON.parse(localStorage.getItem(username));
        if (storedUser && storedUser.password === password) {
            alert(`Hello, ${username}!`);
            localStorage.setItem("loggedInUser", username); // Store logged-in username
            window.location.href = "index.html"; // Redirect to homepage
        } else {
            alert("Invalid credentials. Please try again.");
        }
    }

    // Function to display user information on the account page
    function displayAccountInfo() {
        const loggedInUser = localStorage.getItem("loggedInUser");
        const storedUser = JSON.parse(localStorage.getItem(loggedInUser)); // Retrieve user data

        if (storedUser) {
            document.getElementById("accountUsername").textContent = storedUser.username;
            document.getElementById("accountEmail").textContent = storedUser.email || "N/A"; // Default to "N/A" if email not provided
        }
    }

    // Function to handle logout
    function logout() {
        localStorage.removeItem("loggedInUser");
        window.location.href = "login.html";
    }
    // Make logout function globally accessible
    window.logout = logout;

    // Event listeners for register and login forms
    const registerForm = document.getElementById("registerForm");
    if (registerForm) {
        registerForm.addEventListener("submit", handleRegister);
    }

    const loginForm = document.getElementById("loginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", handleLogin);
    }

    // Run authentication check on protected pages
    checkAuth();

    // Display account info if on account page
    if (document.getElementById('accountUsername')) {
        displayAccountInfo();
    }
});
