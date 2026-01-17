// Analytics System
class Analytics {
  constructor() {
    this.events = [];
    this.init();
  }
  
  init() {
    // Load existing analytics
    const saved = localStorage.getItem('designbrief_analytics');
    if (saved) this.events = JSON.parse(saved);
    
    // Track page views
    this.track('page_view', {
      page: window.location.href,
      timestamp: new Date().toISOString()
    });
    
    // Track button clicks
    document.addEventListener('click', (e) => {
      if (e.target.matches('button')) {
        this.track('button_click', {
          button: e.target.textContent,
          id: e.target.id
        });
      }
    });
  }
  
  track(event, data) {
    const eventData = {
      event,
      ...data,
      timestamp: new Date().toISOString(),
      user: userManager.currentUser?.email || 'anonymous'
    };
    
    this.events.push(eventData);
    localStorage.setItem('designbrief_analytics', JSON.stringify(this.events));
    
    // Send to backend (in production)
    this.sendToBackend(eventData);
  }
  
  sendToBackend(data) {
    // In production, send to your analytics server
    // fetch('https://your-backend.com/analytics', { method: 'POST', body: JSON.stringify(data) });
  }
  
  getStats() {
    const totalUsers = userManager.users.length;
    const totalGenerations = userManager.users.reduce((sum, user) => sum + user.generatedCount, 0);
    const totalDownloads = userManager.users.reduce((sum, user) => sum + user.downloadCount, 0);
    
    return {
      totalUsers,
      totalGenerations,
      totalDownloads,
      conversionRate: (totalGenerations / totalUsers * 100).toFixed(1)
    };
  }
}

// Initialize analytics
const analytics = new Analytics();