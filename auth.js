document.addEventListener('DOMContentLoaded', function() {
  const signupForm = document.getElementById('signupForm');
  const loginForm = document.getElementById('loginForm');

  if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const fullName = document.getElementById('fullName').value;
      const email = document.getElementById('email').value;
      const phone = document.getElementById('phone').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const terms = document.getElementById('terms').checked;
      
      const errorMessage = document.getElementById('errorMessage');
      const successMessage = document.getElementById('successMessage');
      
      errorMessage.classList.remove('show');
      successMessage.classList.remove('show');
      
      if (password.length < 6) {
        errorMessage.textContent = 'Password must be at least 6 characters long';
        errorMessage.classList.add('show');
        return;
      }
      
      if (password !== confirmPassword) {
        errorMessage.textContent = 'Passwords do not match';
        errorMessage.classList.add('show');
        return;
      }
      
      if (!terms) {
        errorMessage.textContent = 'Please agree to the terms and conditions';
        errorMessage.classList.add('show');
        return;
      }
      
      const phoneRegex = /^0[789][01]\d{8}$/;
      if (!phoneRegex.test(phone)) {
        errorMessage.textContent = 'Please enter a valid Nigerian phone number';
        errorMessage.classList.add('show');
        return;
      }
      
      const users = JSON.parse(localStorage.getItem('vtuUsers') || '[]');
      
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        errorMessage.textContent = 'Email already registered';
        errorMessage.classList.add('show');
        return;
      }
      
      const newUser = {
        id: Date.now(),
        fullName,
        email,
        phone,
        password,
        balance: 0,
        transactions: [],
        createdAt: new Date().toISOString()
      };
      
      users.push(newUser);
      localStorage.setItem('vtuUsers', JSON.stringify(users));
      
      successMessage.textContent = 'Account created successfully! Redirecting to login...';
      successMessage.classList.add('show');
      
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const remember = document.getElementById('remember').checked;
      
      const errorMessage = document.getElementById('errorMessage');
      const successMessage = document.getElementById('successMessage');
      
      errorMessage.classList.remove('show');
      successMessage.classList.remove('show');
      
      const users = JSON.parse(localStorage.getItem('vtuUsers') || '[]');
      const user = users.find(u => u.email === email && u.password === password);
      
      if (!user) {
        errorMessage.textContent = 'Invalid email or password';
        errorMessage.classList.add('show');
        return;
      }
      
      const session = {
        userId: user.id,
        email: user.email,
        fullName: user.fullName,
        loginTime: new Date().toISOString()
      };
      
      if (remember) {
        localStorage.setItem('vtuSession', JSON.stringify(session));
      } else {
        sessionStorage.setItem('vtuSession', JSON.stringify(session));
      }
      
      successMessage.textContent = 'Login successful! Redirecting...';
      successMessage.classList.add('show');
      
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1000);
    });
  }
});
