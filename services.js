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

function addTransaction(user, transaction) {
  if (!user.transactions) {
    user.transactions = [];
  }
  user.transactions.unshift(transaction);
  return updateUser(user);
}

const dataPlans = {
  mtn: [
    { name: '1GB - 1 Day', price: 300 },
    { name: '2GB - 1 Day', price: 500 },
    { name: '1GB - 7 Days', price: 450 },
    { name: '2GB - 30 Days', price: 1000 },
    { name: '5GB - 30 Days', price: 2000 },
    { name: '10GB - 30 Days', price: 3500 }
  ],
  glo: [
    { name: '1.6GB - 1 Day', price: 350 },
    { name: '3.9GB - 1 Day', price: 500 },
    { name: '5.8GB - 7 Days', price: 1500 },
    { name: '7.7GB - 30 Days', price: 2000 },
    { name: '10GB - 30 Days', price: 2500 }
  ],
  airtel: [
    { name: '1GB - 1 Day', price: 300 },
    { name: '2GB - 1 Day', price: 500 },
    { name: '1.5GB - 30 Days', price: 1000 },
    { name: '4.5GB - 30 Days', price: 2000 },
    { name: '10GB - 30 Days', price: 3000 }
  ],
  '9mobile': [
    { name: '1GB - 1 Day', price: 300 },
    { name: '1.5GB - 30 Days', price: 1000 },
    { name: '4.5GB - 30 Days', price: 2000 },
    { name: '11GB - 30 Days', price: 3000 }
  ]
};

const cableTVPackages = {
  dstv: [
    { name: 'DStv Padi', price: 2500 },
    { name: 'DStv Yanga', price: 3500 },
    { name: 'DStv Confam', price: 6200 },
    { name: 'DStv Compact', price: 10500 },
    { name: 'DStv Compact Plus', price: 16600 },
    { name: 'DStv Premium', price: 24500 }
  ],
  gotv: [
    { name: 'GOtv Smallie', price: 1100 },
    { name: 'GOtv Jinja', price: 2250 },
    { name: 'GOtv Jolli', price: 3300 },
    { name: 'GOtv Max', price: 4850 }
  ],
  startimes: [
    { name: 'Startimes Nova', price: 900 },
    { name: 'Startimes Basic', price: 1850 },
    { name: 'Startimes Smart', price: 2600 },
    { name: 'Startimes Classic', price: 3200 }
  ]
};

document.addEventListener('DOMContentLoaded', function() {
  if (!requireAuth()) return;
  
  const user = getCurrentUser();
  
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

  const airtimeForm = document.getElementById('airtimeForm');
  if (airtimeForm) {
    const amountInput = document.getElementById('amount');
    const summaryAmount = document.getElementById('summaryAmount');
    
    const quickAmountBtns = document.querySelectorAll('.quick-amount-btn');
    quickAmountBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const amount = this.getAttribute('data-amount');
        amountInput.value = amount;
        summaryAmount.textContent = '₦' + amount;
        
        quickAmountBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
      });
    });
    
    amountInput.addEventListener('input', function() {
      summaryAmount.textContent = '₦' + (this.value || '0');
    });
    
    airtimeForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const network = document.getElementById('network').value;
      const phone = document.getElementById('phone').value;
      const amount = parseFloat(document.getElementById('amount').value);
      const formMessage = document.getElementById('formMessage');
      
      formMessage.classList.remove('show', 'error-message', 'success-message');
      
      if (!network || !phone || !amount) {
        formMessage.textContent = 'Please fill all fields';
        formMessage.classList.add('show', 'error-message');
        return;
      }
      
      if (amount < 50) {
        formMessage.textContent = 'Minimum amount is ₦50';
        formMessage.classList.add('show', 'error-message');
        return;
      }
      
      const user = getCurrentUser();
      if (user.balance < amount) {
        formMessage.textContent = 'Insufficient balance. Please fund your wallet.';
        formMessage.classList.add('show', 'error-message');
        return;
      }
      
      user.balance -= amount;
      
      const transaction = {
        id: Date.now(),
        type: 'airtime',
        network: network.toUpperCase(),
        phone,
        amount,
        status: 'successful',
        date: new Date().toISOString()
      };
      
      addTransaction(user, transaction);
      
      formMessage.textContent = 'Airtime purchase successful! Redirecting...';
      formMessage.classList.add('show', 'success-message');
      
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 2000);
    });
  }

  const dataForm = document.getElementById('dataForm');
  if (dataForm) {
    const networkSelect = document.getElementById('network');
    const dataplanSelect = document.getElementById('dataplan');
    const summaryAmount = document.getElementById('summaryAmount');
    
    networkSelect.addEventListener('change', function() {
      const network = this.value;
      dataplanSelect.innerHTML = '<option value="">Choose data plan</option>';
      
      if (network && dataPlans[network]) {
        dataPlans[network].forEach(plan => {
          const option = document.createElement('option');
          option.value = JSON.stringify(plan);
          option.textContent = `${plan.name} - ₦${plan.price}`;
          dataplanSelect.appendChild(option);
        });
      }
    });
    
    dataplanSelect.addEventListener('change', function() {
      if (this.value) {
        const plan = JSON.parse(this.value);
        summaryAmount.textContent = '₦' + plan.price;
      } else {
        summaryAmount.textContent = '₦0';
      }
    });
    
    dataForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const network = networkSelect.value;
      const dataplanValue = dataplanSelect.value;
      const phone = document.getElementById('phone').value;
      const formMessage = document.getElementById('formMessage');
      
      formMessage.classList.remove('show', 'error-message', 'success-message');
      
      if (!network || !dataplanValue || !phone) {
        formMessage.textContent = 'Please fill all fields';
        formMessage.classList.add('show', 'error-message');
        return;
      }
      
      const plan = JSON.parse(dataplanValue);
      const user = getCurrentUser();
      
      if (user.balance < plan.price) {
        formMessage.textContent = 'Insufficient balance. Please fund your wallet.';
        formMessage.classList.add('show', 'error-message');
        return;
      }
      
      user.balance -= plan.price;
      
      const transaction = {
        id: Date.now(),
        type: 'data',
        network: network.toUpperCase(),
        plan: plan.name,
        phone,
        amount: plan.price,
        status: 'successful',
        date: new Date().toISOString()
      };
      
      addTransaction(user, transaction);
      
      formMessage.textContent = 'Data purchase successful! Redirecting...';
      formMessage.classList.add('show', 'success-message');
      
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 2000);
    });
  }

  const electricityForm = document.getElementById('electricityForm');
  if (electricityForm) {
    const amountInput = document.getElementById('amount');
    const summaryAmount = document.getElementById('summaryAmount');
    
    amountInput.addEventListener('input', function() {
      summaryAmount.textContent = '₦' + (this.value || '0');
    });
    
    electricityForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const disco = document.getElementById('disco').value;
      const meterType = document.getElementById('meterType').value;
      const meterNumber = document.getElementById('meterNumber').value;
      const amount = parseFloat(document.getElementById('amount').value);
      const formMessage = document.getElementById('formMessage');
      
      formMessage.classList.remove('show', 'error-message', 'success-message');
      
      if (!disco || !meterType || !meterNumber || !amount) {
        formMessage.textContent = 'Please fill all fields';
        formMessage.classList.add('show', 'error-message');
        return;
      }
      
      if (amount < 500) {
        formMessage.textContent = 'Minimum amount is ₦500';
        formMessage.classList.add('show', 'error-message');
        return;
      }
      
      const user = getCurrentUser();
      if (user.balance < amount) {
        formMessage.textContent = 'Insufficient balance. Please fund your wallet.';
        formMessage.classList.add('show', 'error-message');
        return;
      }
      
      user.balance -= amount;
      
      const transaction = {
        id: Date.now(),
        type: 'electricity',
        disco: disco.toUpperCase(),
        meterType,
        meterNumber,
        amount,
        status: 'successful',
        date: new Date().toISOString()
      };
      
      addTransaction(user, transaction);
      
      formMessage.textContent = 'Electricity bill payment successful! Redirecting...';
      formMessage.classList.add('show', 'success-message');
      
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 2000);
    });
  }

  const cableTVForm = document.getElementById('cableTVForm');
  if (cableTVForm) {
    const providerSelect = document.getElementById('provider');
    const packageSelect = document.getElementById('package');
    const summaryAmount = document.getElementById('summaryAmount');
    
    providerSelect.addEventListener('change', function() {
      const provider = this.value;
      packageSelect.innerHTML = '<option value="">Choose package</option>';
      
      if (provider && cableTVPackages[provider]) {
        cableTVPackages[provider].forEach(pkg => {
          const option = document.createElement('option');
          option.value = JSON.stringify(pkg);
          option.textContent = `${pkg.name} - ₦${pkg.price}`;
          packageSelect.appendChild(option);
        });
      }
    });
    
    packageSelect.addEventListener('change', function() {
      if (this.value) {
        const pkg = JSON.parse(this.value);
        summaryAmount.textContent = '₦' + pkg.price;
      } else {
        summaryAmount.textContent = '₦0';
      }
    });
    
    cableTVForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const provider = providerSelect.value;
      const packageValue = packageSelect.value;
      const smartcard = document.getElementById('smartcard').value;
      const formMessage = document.getElementById('formMessage');
      
      formMessage.classList.remove('show', 'error-message', 'success-message');
      
      if (!provider || !packageValue || !smartcard) {
        formMessage.textContent = 'Please fill all fields';
        formMessage.classList.add('show', 'error-message');
        return;
      }
      
      const pkg = JSON.parse(packageValue);
      const user = getCurrentUser();
      
      if (user.balance < pkg.price) {
        formMessage.textContent = 'Insufficient balance. Please fund your wallet.';
        formMessage.classList.add('show', 'error-message');
        return;
      }
      
      user.balance -= pkg.price;
      
      const transaction = {
        id: Date.now(),
        type: 'cabletv',
        provider: provider.toUpperCase(),
        package: pkg.name,
        smartcard,
        amount: pkg.price,
        status: 'successful',
        date: new Date().toISOString()
      };
      
      addTransaction(user, transaction);
      
      formMessage.textContent = 'Cable TV subscription successful! Redirecting...';
      formMessage.classList.add('show', 'success-message');
      
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 2000);
    });
  }
});
