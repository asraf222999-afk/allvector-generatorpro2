// User Management System
class UserManager {
  constructor() {
    this.currentUser = null;
    this.storageKey = 'designbrief_users';
    this.init();
  }
  
  init() {
    // Load existing users
    this.users = JSON.parse(localStorage.getItem(this.storageKey)) || [];
    
    // Check if user is logged in
    const savedUser = localStorage.getItem('designbrief_current_user');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
      this.showDashboard();
    }
  }
  
  signup(email, password) {
    // Check if user exists
    if (this.users.find(u => u.email === email)) {
      return { success: false, message: 'User already exists' };
    }
    
    // Create new user
    const newUser = {
      id: Date.now(),
      email: email,
      password: password, // In production, hash this!
      createdAt: new Date().toISOString(),
      generatedCount: 0,
      downloadCount: 0,
      subscription: 'free',
      assets: []
    };
    
    this.users.push(newUser);
    localStorage.setItem(this.storageKey, JSON.stringify(this.users));
    
    // Auto login
    this.login(email, password);
    
    return { success: true, user: newUser };
  }
  
  login(email, password) {
    const user = this.users.find(u => 
      u.email === email && u.password === password
    );
    
    if (user) {
      this.currentUser = user;
      localStorage.setItem('designbrief_current_user', JSON.stringify(user));
      this.showDashboard();
      showToast(`Welcome back, ${email.split('@')[0]}!`);
      return true;
    }
    
    return false;
  }
  
  logout() {
    this.currentUser = null;
    localStorage.removeItem('designbrief_current_user');
    this.hideDashboard();
    showToast('Logged out successfully');
  }
  
  showDashboard() {
    const dashboard = document.getElementById('userDashboard');
    const userEmail = document.getElementById('userEmail');
    const userInitial = document.getElementById('userInitial');
    const generatedCount = document.getElementById('generatedCount');
    const downloadCount = document.getElementById('downloadCount');
    
    if (this.currentUser) {
      dashboard.classList.remove('hidden');
      userEmail.textContent = this.currentUser.email;
      userInitial.textContent = this.currentUser.email[0].toUpperCase();
      generatedCount.textContent = this.currentUser.generatedCount;
      downloadCount.textContent = this.currentUser.downloadCount;
      
      // Hide signup buttons
      document.querySelectorAll('[onclick*="showSignup"]').forEach(btn => {
        btn.style.display = 'none';
      });
    }
  }
  
  hideDashboard() {
    document.getElementById('userDashboard').classList.add('hidden');
    document.querySelectorAll('[onclick*="showSignup"]').forEach(btn => {
      btn.style.display = 'block';
    });
  }
  
  trackGeneration() {
    if (this.currentUser) {
      this.currentUser.generatedCount++;
      this.updateUser();
    }
  }
  
  trackDownload() {
    if (this.currentUser) {
      this.currentUser.downloadCount++;
      this.updateUser();
    }
  }
  
  updateUser() {
    const index = this.users.findIndex(u => u.id === this.currentUser.id);
    if (index !== -1) {
      this.users[index] = this.currentUser;
      localStorage.setItem(this.storageKey, JSON.stringify(this.users));
      localStorage.setItem('designbrief_current_user', JSON.stringify(this.currentUser));
    }
  }
  
  saveAsset(assetData) {
    if (this.currentUser) {
      this.currentUser.assets.push({
        id: Date.now(),
        ...assetData,
        createdAt: new Date().toISOString()
      });
      this.updateUser();
    }
  }
}

// Initialize user manager
const userManager = new UserManager();

// Signup modal functions
function showSignupModal() {
  document.getElementById('signupModal').classList.remove('hidden');
}

function closeSignupModal() {
  document.getElementById('signupModal').classList.add('hidden');
}

function signupUser() {
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;
  const terms = document.getElementById('terms').checked;
  
  if (!email || !password) {
    showToast('Please fill all fields', 'error');
    return;
  }
  
  if (!terms) {
    showToast('Please agree to terms', 'error');
    return;
  }
  
  const result = userManager.signup(email, password);
  if (result.success) {
    showToast('Account created successfully!', 'success');
    closeSignupModal();
    
    // Show welcome bonus
    setTimeout(() => {
      showToast('🎉 Welcome bonus: 50 free premium assets!', 'success');
    }, 1000);
  } else {
    showToast(result.message, 'error');
  }
}

function logout() {
  userManager.logout();
}