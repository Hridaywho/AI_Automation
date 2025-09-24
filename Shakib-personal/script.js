// Global application state and functionality
class AudiBookApp {
  constructor() {
    this.init();
  }

  init() {
    this.setupSidebar();
    this.setupThemeToggle();
    this.loadSavedTheme();
    this.setupNotificationToggles();
    this.addPageAnimations();
  }

  // Sidebar functionality
  setupSidebar() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const closeSidebar = document.getElementById('closeSidebar');

    // Toggle sidebar on hamburger click
    hamburgerBtn?.addEventListener('click', () => {
      this.toggleSidebar(true);
    });

    // Close sidebar on overlay click
    sidebarOverlay?.addEventListener('click', () => {
      this.toggleSidebar(false);
    });

    // Close sidebar on close button click
    closeSidebar?.addEventListener('click', () => {
      this.toggleSidebar(false);
    });

    // Handle window resize
    window.addEventListener('resize', () => {
      if (window.innerWidth >= 1024) {
        this.closeMobileSidebar();
      }
    });

    // Close sidebar on navigation link click (mobile)
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
      item.addEventListener('click', () => {
        if (window.innerWidth < 1024) {
          this.toggleSidebar(false);
        }
      });
    });
  }

  toggleSidebar(open) {
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    const mainContent = document.querySelector('.main-content');

    if (open) {
      sidebar?.classList.add('open');
      sidebarOverlay?.classList.add('active');
      
      // Add class for desktop sidebar open state
      if (window.innerWidth >= 1024) {
        mainContent?.classList.add('sidebar-open');
      }
    } else {
      sidebar?.classList.remove('open');
      sidebarOverlay?.classList.remove('active');
      mainContent?.classList.remove('sidebar-open');
    }
  }

  closeMobileSidebar() {
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    sidebar?.classList.remove('open');
    sidebarOverlay?.classList.remove('active');
  }

  // Theme functionality
  setupThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    
    themeToggle?.addEventListener('change', (e) => {
      const theme = e.target.checked ? 'dark' : 'light';
      this.setTheme(theme);
      this.saveThemePreference(theme);
    });
  }

  setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    
    // Update theme toggle state
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.checked = theme === 'dark';
    }
    
    // Smooth transition for theme change
    document.body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    setTimeout(() => {
      document.body.style.transition = '';
    }, 300);
  }

  saveThemePreference(theme) {
    try {
      localStorage.setItem('audibook-theme', theme);
    } catch (error) {
      console.warn('Could not save theme preference:', error);
    }
  }

  loadSavedTheme() {
    try {
      const savedTheme = localStorage.getItem('audibook-theme');
      
      if (savedTheme) {
        this.setTheme(savedTheme);
      } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.setTheme(prefersDark ? 'dark' : 'light');
      }
    } catch (error) {
      console.warn('Could not load saved theme:', error);
      this.setTheme('light'); // Fallback to light theme
    }
  }

  // Notification toggles
  setupNotificationToggles() {
    const toggles = document.querySelectorAll('.notification-checkbox');
    
    toggles.forEach(toggle => {
      // Load saved state
      const savedState = localStorage.getItem(`audibook-${toggle.id}`);
      if (savedState !== null) {
        toggle.checked = savedState === 'true';
      }

      // Save state on change
      toggle.addEventListener('change', (e) => {
        try {
          localStorage.setItem(`audibook-${e.target.id}`, e.target.checked);
        } catch (error) {
          console.warn('Could not save notification preference:', error);
        }
      });
    });
  }

  // Page animations
  addPageAnimations() {
    // Add fade-in animation to main content
    const content = document.querySelector('.content');
    if (content) {
      content.classList.add('fade-in');
    }

    // Animate cards on scroll (intersection observer)
    this.setupScrollAnimations();
  }

  setupScrollAnimations() {
    if ('IntersectionObserver' in window) {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }
        });
      }, observerOptions);

      // Observe cards and other animatable elements
      const animatableElements = document.querySelectorAll(
        '.feature-card, .stat-card, .booking-card, .settings-card'
      );

      animatableElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(el);
      });
    }
  }

  // Utility methods for external use
  showNotification(message, type = 'info') {
    // Simple notification system (could be enhanced)
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 24px;
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      box-shadow: 0 4px 12px var(--shadow);
      z-index: 1001;
      transition: all 0.3s ease;
      transform: translateX(100%);
    `;

    document.body.appendChild(notification);

    // Animate in
    requestAnimationFrame(() => {
      notification.style.transform = 'translateX(0)';
    });

    // Auto remove
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
}

// Initialize the application
const audiBookApp = new AudiBookApp();

// Global functions for button interactions
function bookAuditorium(type) {
  const auditoriumType = type === 'main' ? 'Main Auditorium' : 'Mini Auditorium';
  audiBookApp.showNotification(`Booking ${auditoriumType}...`, 'info');
  
  // Simulate booking process
  setTimeout(() => {
    audiBookApp.showNotification(`${auditoriumType} booking initiated! Check your dashboard for updates.`, 'success');
  }, 1500);
}

// Dashboard-specific functionality
if (window.location.pathname.includes('dashboard.html')) {
  // Enhanced filter animations
  document.addEventListener('DOMContentLoaded', () => {
    const filterTabs = document.querySelectorAll('.filter-tab');
    const bookingsGrid = document.getElementById('bookingsGrid');

    // Add smooth transition to bookings grid
    if (bookingsGrid) {
      bookingsGrid.style.transition = 'opacity 0.3s ease';
    }

    // Override the existing filter functionality with animations
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Fade out current content
        if (bookingsGrid) {
          bookingsGrid.style.opacity = '0.3';
          
          setTimeout(() => {
            bookingsGrid.style.opacity = '1';
          }, 300);
        }
      });
    });
  });
}

// Settings page specific functionality
if (window.location.pathname.includes('settings.html')) {
  document.addEventListener('DOMContentLoaded', () => {
    // Add click handlers for settings buttons
    const settingButtons = document.querySelectorAll('.setting-btn');
    
    settingButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const action = e.target.textContent.trim();
        audiBookApp.showNotification(`${action} feature coming soon!`, 'info');
      });
    });
  });
}

// Keyboard navigation support
document.addEventListener('keydown', (e) => {
  // ESC to close sidebar
  if (e.key === 'Escape') {
    audiBookApp.toggleSidebar(false);
  }
  
  // Ctrl/Cmd + K for quick search (future feature)
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    audiBookApp.showNotification('Quick search coming soon!', 'info');
  }
});

// Handle offline/online status
window.addEventListener('online', () => {
  audiBookApp.showNotification('Connection restored!', 'success');
});

window.addEventListener('offline', () => {
  audiBookApp.showNotification('You are now offline. Some features may be limited.', 'warning');
});

// Performance monitoring
if ('performance' in window) {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      if (loadTime > 3000) {
        console.warn('Page load time is high:', loadTime + 'ms');
      }
    }, 0);
  });
}

// Error handling
window.addEventListener('error', (e) => {
  console.error('Application error:', e.error);
  // In production, you might want to send this to an error reporting service
});

// Export for testing purposes (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AudiBookApp };
};