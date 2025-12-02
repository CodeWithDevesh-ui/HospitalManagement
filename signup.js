document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("signupBtn");

    btn.addEventListener("click", () => {
        const user = {
            name: document.getElementById("name").value.trim(),
            age: document.getElementById("age").value.trim(),
            gender: document.getElementById("gender").value,
            email: document.getElementById("email").value.trim(),
            phone: document.getElementById("phone").value.trim(),
            aadhaar: document.getElementById("aadhaar").value.trim(),
            username: document.getElementById("username").value.trim(),
            password: document.getElementById("password").value.trim()
        };

        // simple check
        if (!user.username || !user.password) {
            alert("Username and Password required!");
            return;
        }

        // save to localStorage
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("loggedIn", "true");

        alert("Signup successful!");
        window.location.href = "dashboard.html";
    });
});
