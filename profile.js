function getSession() {
  const session = localStorage.getItem('vtuSession') || sessionStorage.getItem('vtuSession');
  return session ? JSON.parse(session) : null;
}

function getCurrentUser() {
  const session = getSession();
  if (!session) return null;
  
  const users = JSON.parse(localStorage.getItem('vtuUsers') || '[]');
  return users.find(u => u.id === session.userId);
}

function updateUser(updatedUser) {
  const users = JSON.parse(localStorage.getItem('vtuUsers') || '[]');
  const index = users.findIndex(u => u.id === updatedUser.id);
  if (index !== -1) {
    users[index] = updatedUser;
    localStorage.setItem('vtuUsers', JSON.stringify(users));
    return true;
  }
  return false;
}

function logout() {
  localStorage.removeItem('vtuSession');
  sessionStorage.removeItem('vtuSession');
  window.location.href = 'login.html';
}

function requireAuth() {
  const session = getSession();
  if (!session) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

document.addEventListener('DOMContentLoaded', function() {
  if (!requireAuth()) return;
  
  const user = getCurrentUser();
  
  const fullNameInput = document.getElementById('fullName');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  
  if (fullNameInput) fullNameInput.value = user.fullName;
  if (emailInput) emailInput.value = user.email;
  if (phoneInput) phoneInput.value = user.phone;
  
  const logoutBtns = document.querySelectorAll('#logoutBtn');
  logoutBtns.forEach(btn => {
    if (btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
          logout();
        }
      });
    }
  });

  const profileForm = document.getElementById('profileForm');
  if (profileForm) {
    profileForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const fullName = document.getElementById('fullName').value;
      const phone = document.getElementById('phone').value;
      const profileMessage = document.getElementById('profileMessage');
      
      profileMessage.classList.remove('show', 'error-message', 'success-message');
      
      if (!fullName || !phone) {
        profileMessage.textContent = 'Please fill all fields';
        profileMessage.classList.add('show', 'error-message');
        return;
      }
      
      const phoneRegex = /^0[789][01]\d{8}$/;
      if (!phoneRegex.test(phone)) {
        profileMessage.textContent = 'Please enter a valid Nigerian phone number';
        profileMessage.classList.add('show', 'error-message');
        return;
      }
      
      const user = getCurrentUser();
      user.fullName = fullName;
      user.phone = phone;
      
      updateUser(user);
      
      profileMessage.textContent = 'Profile updated successfully!';
      profileMessage.classList.add('show', 'success-message');
    });
  }

  const passwordForm = document.getElementById('passwordForm');
  if (passwordForm) {
    passwordForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const currentPassword = document.getElementById('currentPassword').value;
      const newPassword = document.getElementById('newPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      const passwordMessage = document.getElementById('passwordMessage');
      
      passwordMessage.classList.remove('show', 'error-message', 'success-message');
      
      const user = getCurrentUser();
      
      if (currentPassword !== user.password) {
        passwordMessage.textContent = 'Current password is incorrect';
        passwordMessage.classList.add('show', 'error-message');
        return;
      }
      
      if (newPassword.length < 6) {
        passwordMessage.textContent = 'New password must be at least 6 characters';
        passwordMessage.classList.add('show', 'error-message');
        return;
      }
      
      if (newPassword !== confirmPassword) {
        passwordMessage.textContent = 'Passwords do not match';
        passwordMessage.classList.add('show', 'error-message');
        return;
      }
      
      user.password = newPassword;
      updateUser(user);
      
      passwordMessage.textContent = 'Password changed successfully!';
      passwordMessage.classList.add('show', 'success-message');
      
      passwordForm.reset();
    });
  }

  const transactions = user.transactions || [];
  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);
  
  const statCards = document.querySelectorAll('.stat-card');
  if (statCards.length >= 2) {
    statCards[0].querySelector('.stat-value').textContent = transactions.length;
    statCards[1].querySelector('.stat-value').textContent = '₦' + totalSpent.toFixed(2);
  }
});
