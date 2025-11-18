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

function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function renderTransactions(transactions) {
  const tbody = document.getElementById('transactionsBody');
  
  if (!transactions || transactions.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="no-data">No transactions found</td></tr>';
    return;
  }
  
  tbody.innerHTML = '';
  
  transactions.forEach(t => {
    const row = document.createElement('tr');
    
    let details = '';
    if (t.type === 'airtime') {
      details = `${t.network} - ${t.phone}`;
    } else if (t.type === 'data') {
      details = `${t.network} ${t.plan} - ${t.phone}`;
    } else if (t.type === 'electricity') {
      details = `${t.disco} ${t.meterType} - ${t.meterNumber}`;
    } else if (t.type === 'cabletv') {
      details = `${t.provider} ${t.package} - ${t.smartcard}`;
    }
    
    row.innerHTML = `
      <td>${formatDate(t.date)}</td>
      <td><span style="text-transform: capitalize">${t.type}</span></td>
      <td>${details}</td>
      <td>₦${t.amount.toFixed(2)}</td>
      <td><span style="color: var(--success-color); font-weight: 600">${t.status}</span></td>
    `;
    
    tbody.appendChild(row);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  if (!requireAuth()) return;
  
  const user = getCurrentUser();
  const transactions = user.transactions || [];
  
  renderTransactions(transactions);
  
  const filterType = document.getElementById('filterType');
  if (filterType) {
    filterType.addEventListener('change', function() {
      const type = this.value;
      
      if (type === 'all') {
        renderTransactions(transactions);
      } else {
        const filtered = transactions.filter(t => t.type === type);
        renderTransactions(filtered);
      }
    });
  }
  
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
