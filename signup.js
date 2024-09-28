// signup.js

document.getElementById('signup-form').addEventListener('submit', function(e) {
    e.preventDefault(); 

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const data = `${username},${email},${password}\n`; 

    const blob = new Blob([data], { type: 'text/plain' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'userdata.txt'; 

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    
    document.getElementById('signup-form').reset();
});
