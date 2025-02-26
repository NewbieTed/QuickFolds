"use strict";
/**
 * Script handling the signup form.
 * It sends a POST request to the server with the username and password.
 * If the signup is successful, it redirects the user to the login page.
 * Possible errors:
 * 409: Username already exists
 * 500: Internal server error
 */
document.querySelector('form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const username = usernameInput.value;
    const password = passwordInput.value;
    try {
        const response = await fetch('http://localhost:8080/user/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });
        if (!response.ok) {
            if (response.status === 409) { // 409: Username already exists
                alert('Username already exists');
            }
            else { // 500: Internal server error
                alert('Failed to sign up');
            }
            return;
        }
        // Sign up successful
        const result = await response.json();
        console.log('Sign up successful:', result);
        // Redirect to login page
        alert('Sign up successful!');
        redirectTo('login.html');
    }
    catch (error) {
        console.error(error);
    }
});
