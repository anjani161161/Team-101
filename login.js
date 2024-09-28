document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault(); 
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const users = [
        { email: 'user@example.com', password: 'password123' }, 
        { email: 'antoniocristiano454@gmail.com', password: 'anjanisingh' },
        { email: 'sengarvikash705@gmail.com', password: 'vikashsenger' },
        { email: 'makshat983@gmail.com', password: 'akshatmishra' }  
    ];

    let loginSuccessful = false;

    users.forEach(user => {
        if (user.email === email && user.password === password) {
            loginSuccessful = true;
        }
    });

    const feedback = document.getElementById('login-feedback');
    if (loginSuccessful) {
        feedback.textContent = 'Login successful! Redirecting...';
        feedback.style.color = 'green';
        sessionStorage.setItem('loggedIn', true);
        setTimeout(() => {
            window.location.href = 'index.html'; 
        }, 1000);
    } else {
        feedback.textContent = 'Invalid email or password.';
        feedback.style.color = 'red';
    }
});
