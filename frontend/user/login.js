"use strict";
// login.ts
document.querySelector('form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const rememberMeCheckbox = document.getElementById('rememberMe');
    const username = usernameInput.value;
    const password = passwordInput.value;
    const rememberMe = rememberMeCheckbox.checked;
    // If "Remember me" is checked, store the username in localStorage.
    if (rememberMe) {
        localStorage.setItem('rememberedUsername', username);
    }
    else {
        localStorage.removeItem('rememberedUsername');
    }
    doLogin(username, password).then(() => console.log('Login successful, user: ', username));
});
// Automatically fill the username field if found in localStorage
window.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.getElementById('username');
    const storedUsername = localStorage.getItem('rememberedUsername');
    if (usernameInput && storedUsername) {
        usernameInput.value = storedUsername;
    }
});
// Helper function for redirection using an anchor click workaround
const redirectTo = (url) => {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
};
const doLogin = async (username, password) => {
    const url = 'http://localhost:8080/user/login';
    const data = { username, password };
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            if (response.status === 401) {
                alert('Invalid username or password');
                return;
            }
            else {
                alert('Failed to fetch data');
                return;
            }
        }
        const result = await response.json();
        console.log('Login response:', result);
        // Save token in localStorage for future bearer authorization
        const token = result.token;
        if (token) {
            localStorage.setItem('userToken', token);
        }
        else {
            console.error('No token received in response');
        }
        alert('Login successful');
        redirectTo('http://localhost:5173/frontend/community/communityboard.html'); // Redirect using anchor click workaround
    }
    catch (error) {
        console.error('Login error:', error);
        alert('An error occurred during login');
    }
};
