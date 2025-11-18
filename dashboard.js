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
  
  const session = getSession();
  const user = getCurrentUser();
  
  const userNameElements = document.querySelectorAll('#userName');
  userNameElements.forEach(el => {
    if (el) el.textContent = user.fullName;
  });
  
  const balanceElements = document.querySelectorAll('#balance, #walletBalance');
  balanceElements.forEach(el => {
    if (el) el.textContent = user.balance.toFixed(2);
  });
  
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
});
