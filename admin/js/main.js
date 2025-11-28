document.addEventListener('DOMContentLoaded', function() {
    const navButtons = document.querySelectorAll('.nav-button');
    const contentFrame = document.getElementById('contentFrame');
    
    // Mapeo de páginas
    const pageMapping = {
        'dashboard': '../html/dashboard.html',
        'users': '../html/users.html',
        'services': '../html/services.html',
        'reports': '../html/reports.html',
        'vehicles': '../html/vehicles.html'
    };

    // Function to update active navigation
    function updateActiveNav(activeButton) {
        navButtons.forEach(btn => btn.classList.remove('active'));
        activeButton.classList.add('active');
    }

    // Function to load page
    function loadPage(page) {
        const url = pageMapping[page];
        if (url && contentFrame) {
            contentFrame.src = url;
        }
    }

    // Add click event listeners to navigation buttons
    navButtons.forEach(button => {
        button.addEventListener('click', function() {
            const page = this.getAttribute('data-page');
            
            // Update active state
            updateActiveNav(this);
            
            // Load the corresponding page
            loadPage(page);
            
            // Store current page in sessionStorage
            sessionStorage.setItem('currentPage', page);
        });
    });

    // Load saved page on refresh or initial load
    const savedPage = sessionStorage.getItem('currentPage') || 'dashboard';
    const savedButton = document.querySelector(`[data-page="${savedPage}"]`);
    
    if (savedButton) {
        updateActiveNav(savedButton);
        loadPage(savedPage);
    }

    // Handle iframe load events
    if (contentFrame) {
        contentFrame.addEventListener('load', function() {
            console.log('Página cargada:', this.src);
        });
        
        contentFrame.addEventListener('error', function() {
            console.error('Error cargando página:', this.src);
        });
    }

    console.log('Navegación principal inicializada');
});

// Cerrar sesión
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                window.location.href = '/';
            }
        });
    }
});