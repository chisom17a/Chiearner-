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
  
  const balanceElements = document.querySelectorAll('#balance');
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

  const fundWalletForm = document.getElementById('fundWalletForm');
  if (fundWalletForm) {
    const amountInput = document.getElementById('amount');
    
    const quickAmountBtns = document.querySelectorAll('.quick-amount-btn');
    quickAmountBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const amount = this.getAttribute('data-amount');
        amountInput.value = amount;
        
        quickAmountBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
      });
    });
    
    fundWalletForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const amount = parseFloat(document.getElementById('amount').value);
      const paymentMethod = document.getElementById('paymentMethod').value;
      const formMessage = document.getElementById('formMessage');
      
      formMessage.classList.remove('show', 'error-message', 'success-message');
      
      if (!amount || !paymentMethod) {
        formMessage.textContent = 'Please fill all fields';
        formMessage.classList.add('show', 'error-message');
        return;
      }
      
      if (amount < 100) {
        formMessage.textContent = 'Minimum funding amount is ₦100';
        formMessage.classList.add('show', 'error-message');
        return;
      }
      
      formMessage.textContent = 'Processing payment...';
      formMessage.classList.add('show', 'success-message');
      
      setTimeout(() => {
        const user = getCurrentUser();
        user.balance += amount;
        updateUser(user);
        
        formMessage.textContent = 'Wallet funded successfully! Redirecting...';
        
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1500);
      }, 2000);
    });
  }
});
