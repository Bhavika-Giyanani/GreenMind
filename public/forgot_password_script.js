function validateForm(event) {
    event.preventDefault(); // Prevent form submission

    // Get form elements
    const username = document.getElementById('username');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirm_password');
    const usernameError = document.getElementById('usernameError');
    const passwordError = document.getElementById('passwordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');
    let valid = true;

    // Clear previous errors
    usernameError.textContent = '';
    passwordError.textContent = '';
    confirmPasswordError.textContent = '';

    // Username validation
    if (username.value.trim() === '') {
        username.style.borderColor = 'red';
        usernameError.textContent = 'Username cannot be empty.';
        valid = false;
    } else {
        username.style.borderColor = '';
    }

    // Password validation
    const passwordPattern = /^(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;
    if (!passwordPattern.test(password.value)) {
        password.style.borderColor = 'red';
        passwordError.textContent = 'Password must be 6 characters, 1 number, 1 special character.';
        valid = false;
    } else {
        password.style.borderColor = '';
    }

    // Confirm password validation
    if (password.value !== confirmPassword.value) {
        confirmPassword.style.borderColor = 'red';
        confirmPasswordError.textContent = 'Passwords do not match.';
        valid = false;
    } else {
        confirmPassword.style.borderColor = '';
    }

    // If valid, submit the form via AJAX
    if (valid) {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/change_password', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    alert('Password changed successfully!');
                    window.location.href = 'login.html';
                } else {
                    const response = JSON.parse(xhr.responseText);
                    response.errors.forEach(error => {
                        if (error.includes('Username')) {
                            username.style.borderColor = 'red';
                            usernameError.textContent = error;
                        } else if (error.includes('Password')) {
                            password.style.borderColor = 'red';
                            passwordError.textContent = error;
                        } else if (error.includes('Confirm Password')) {
                            confirmPassword.style.borderColor = 'red';
                            confirmPasswordError.textContent = error;
                        }
                    });
                }
            }
        };
        xhr.send(`username=${username.value}&password=${password.value}`);
    }
}