// Shared Navigation Component
class Navigation {
  constructor() {
    this.init();
  }

  init() {
    this.createSidebar();
    this.attachEventListeners();
    this.handleResponsiveMenu();
  }

  createSidebar() {
    // Clean up any stray text nodes in body that contain only whitespace or single characters
    Array.from(document.body.childNodes).forEach(node => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length <= 1) {
        node.remove();
      }
    });
    
    // Create sidebar elements using DOM methods instead of innerHTML
    const sidebar = document.createElement('div');
    sidebar.className = 'sidebar';
    sidebar.id = 'sidebar';
    
    // Create sidebar header
    const sidebarHeader = document.createElement('div');
    sidebarHeader.className = 'sidebar-header';
    
    const logoLink = document.createElement('a');
    logoLink.href = 'index.html';
    logoLink.className = 'logo-link';
    
    const logo = document.createElement('img');
    logo.src = 'images/logo.png';
    logo.alt = 'Strivyr Logo';
    logo.className = 'logo';
    
    logoLink.appendChild(logo);
    
    const sidebarToggle = document.createElement('button');
    sidebarToggle.className = 'sidebar-toggle';
    sidebarToggle.id = 'sidebar-toggle';
    
    for (let i = 0; i < 3; i++) {
      const span = document.createElement('span');
      sidebarToggle.appendChild(span);
    }
    
    sidebarHeader.appendChild(logoLink);
    sidebarHeader.appendChild(sidebarToggle);
    
    // Create navigation
    const nav = document.createElement('nav');
    nav.className = 'sidebar-nav';
    
    const ul = document.createElement('ul');
    
    // Home link
    const homeLi = document.createElement('li');
    const homeLink = document.createElement('a');
    homeLink.href = 'index.html';
    homeLink.className = 'nav-link';
    homeLink.textContent = 'Home';
    if (this.isCurrentPage('index.html')) {
      homeLink.classList.add('active');
    }
    homeLi.appendChild(homeLink);
    ul.appendChild(homeLi);
    
    // About link
    const aboutLi = document.createElement('li');
    const aboutLink = document.createElement('a');
    aboutLink.href = 'about.html';
    aboutLink.className = 'nav-link';
    aboutLink.textContent = 'About';
    if (this.isCurrentPage('about.html')) {
      aboutLink.classList.add('active');
    }
    aboutLi.appendChild(aboutLink);
    ul.appendChild(aboutLi);
    
    
    // Projects dropdown
    const projectsLi = document.createElement('li');
    projectsLi.className = 'has-dropdown';
    
    const projectsToggle = document.createElement('a');
    projectsToggle.href = '#';
    projectsToggle.className = 'nav-link dropdown-toggle';
    projectsToggle.id = 'projects-toggle';
    projectsToggle.textContent = 'Projects';
    
    const dropdownArrow = document.createElement('span');
    dropdownArrow.className = 'dropdown-arrow';
    dropdownArrow.textContent = '▼';
    projectsToggle.appendChild(dropdownArrow);
    
    const dropdownMenu = document.createElement('ul');
    dropdownMenu.className = 'dropdown-menu';
    dropdownMenu.id = 'projects-menu';

    const tipLi = document.createElement('li');
    const tipLink = document.createElement('a');
    tipLink.href = 'tip-calculator.html';
    tipLink.className = 'nav-link';
    tipLink.textContent = 'Tip Calculator';
    if (this.isCurrentPage('tip-calculator.html')) {
      tipLink.classList.add('active');
    }
    tipLi.appendChild(tipLink);
    dropdownMenu.appendChild(tipLi);
    
    const f1Li = document.createElement('li');
    const f1Link = document.createElement('a');
    f1Link.href = 'f1.html';
    f1Link.className = 'nav-link';
    f1Link.textContent = 'F1 Countdown';
    if (this.isCurrentPage('f1.html')) {
      f1Link.classList.add('active');
    }
    f1Li.appendChild(f1Link);
    dropdownMenu.appendChild(f1Li);
    
    projectsLi.appendChild(projectsToggle);
    projectsLi.appendChild(dropdownMenu);
    ul.appendChild(projectsLi);
    
    nav.appendChild(ul);
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.id = 'sidebar-overlay';
    
    // Assemble sidebar
    sidebar.appendChild(sidebarHeader);
    sidebar.appendChild(nav);
    
    // Insert into DOM - ensure clean insertion
    const firstChild = document.body.firstElementChild || document.body.firstChild;
    document.body.insertBefore(sidebar, firstChild);
    document.body.appendChild(overlay);
    
    // Add body class for layout
    document.body.classList.add('has-sidebar');
    
    // Auto-expand dropdown if current page is a sub-item
    this.autoExpandForCurrentPage();
  }

  isCurrentPage(pageName) {
    const currentPath = window.location.pathname.toLowerCase();
    const pageNameLower = pageName.toLowerCase();
    
    // Handle index page
    if (pageNameLower === 'index.html') {
      return currentPath === '/' || 
             currentPath === '/index' ||
             currentPath === '/index.html' ||
             currentPath.endsWith('/') ||
             currentPath.endsWith('/index') ||
             currentPath.endsWith('/index.html');
    }
    
    // For other pages, check with and without .html extension
    const baseName = pageNameLower.replace('.html', '');
    return currentPath === '/' + pageNameLower ||
           currentPath === '/' + baseName ||
           currentPath.endsWith('/' + pageNameLower) ||
           currentPath.endsWith('/' + baseName);
  }

  autoExpandForCurrentPage() {
    // Check if current page is a project sub-page
    if (this.isOnProjectPage()) {
      const projectsMenu = document.getElementById('projects-menu');
      const projectsToggle = document.getElementById('projects-toggle');

      if (projectsMenu && projectsToggle) {
        // Expand the dropdown
        projectsMenu.classList.add('open');
        projectsToggle.classList.add('active');
        projectsToggle.querySelector('.dropdown-arrow').textContent = '▲';
      }
    }
  }

  isOnProjectPage() {
    // Check if current page is any project sub-page
    return this.isCurrentPage('tip-calculator.html') || this.isCurrentPage('f1.html');
  }

  attachEventListeners() {
    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    sidebarToggle?.addEventListener('click', () => this.toggleSidebar());
    overlay?.addEventListener('click', () => this.closeSidebar());

    // Projects dropdown
    const projectsToggle = document.getElementById('projects-toggle');
    const projectsMenu = document.getElementById('projects-menu');

    projectsToggle?.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleDropdown(projectsMenu, projectsToggle);
    });

    // Handle dropdown hover states to prevent parent hover when hovering child
    // Only add this logic for devices that support hover
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      const dropdownContainer = document.querySelector('.has-dropdown');
      if (dropdownContainer) {
        const toggle = dropdownContainer.querySelector('.dropdown-toggle');
        const menu = dropdownContainer.querySelector('.dropdown-menu');
        
        // When hovering over dropdown menu, remove hover from toggle
        menu?.addEventListener('mouseenter', () => {
          toggle?.classList.add('child-hovered');
        });
        
        menu?.addEventListener('mouseleave', () => {
          toggle?.classList.remove('child-hovered');
        });
      }
    }

    // Close dropdown when clicking outside (but not if we're on a project page)
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.has-dropdown') && !this.isOnProjectPage()) {
        this.closeAllDropdowns();
      }
    });

    // Handle escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeSidebar();
        // Only close dropdowns if not on a project page
        if (!this.isOnProjectPage()) {
          this.closeAllDropdowns();
        }
      }
    });
  }

  toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const toggle = document.getElementById('sidebar-toggle');
    
    const isOpen = sidebar?.classList.contains('open');
    
    if (isOpen) {
      // Close sidebar
      sidebar?.classList.remove('open');
      overlay?.classList.remove('active');
      toggle?.classList.remove('active');
      document.body.classList.remove('sidebar-open');
    } else {
      // Open sidebar
      sidebar?.classList.add('open');
      overlay?.classList.add('active');
      toggle?.classList.add('active');
      document.body.classList.add('sidebar-open');
    }
  }

  closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const toggle = document.getElementById('sidebar-toggle');
    
    sidebar?.classList.remove('open');
    overlay?.classList.remove('active');
    toggle?.classList.remove('active');
    document.body.classList.remove('sidebar-open');
  }

  toggleDropdown(menu, toggle) {
    const isOpen = menu.classList.contains('open');
    
    // Close all dropdowns first
    this.closeAllDropdowns();
    
    if (!isOpen) {
      menu.classList.add('open');
      toggle.classList.add('active');
      toggle.querySelector('.dropdown-arrow').textContent = '▲';
    }
  }

  closeAllDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown-menu');
    const toggles = document.querySelectorAll('.dropdown-toggle');
    
    dropdowns.forEach(dropdown => dropdown.classList.remove('open'));
    toggles.forEach(toggle => {
      toggle.classList.remove('active');
      const arrow = toggle.querySelector('.dropdown-arrow');
      if (arrow) arrow.textContent = '▼';
    });
  }

  handleResponsiveMenu() {
    // Handle window resize
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        this.closeSidebar();
      }
    });
  }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new Navigation();
});