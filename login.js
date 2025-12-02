document.addEventListener("DOMContentLoaded", () => {
    const loginBtn = document.getElementById("loginBtn");

    loginBtn.addEventListener("click", () => {
        const savedUser = JSON.parse(localStorage.getItem("user"));
        const username = document.getElementById("loginUsername").value.trim();
        const password = document.getElementById("loginPassword").value.trim();

        if (!savedUser) {
            alert("No user found. Please sign up first.");
            return;
        }

        if (username === savedUser.username && password === savedUser.password) {
            localStorage.setItem("loggedIn", "true");
            alert("Login successful!");
            window.location.href = "dashboard.html";
        } else {
            alert("Invalid username or password");
        }
    });
});
