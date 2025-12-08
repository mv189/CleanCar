// ============================
// 🌙 Sistema de Modo Oscuro - SOLO MENÚ
// ============================
function applyTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    document.body.classList.toggle('dark-menu', theme === 'dark');

    const icon = document.querySelector('#themeToggle i');
    if (icon) {
        icon.classList = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    applyTheme();

    const toggleBtn = document.getElementById('themeToggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const current = localStorage.getItem('theme') || 'light';
            const newTheme = current === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            applyTheme();
        });
    }
});

class Dashboard {
    constructor() {
        this.activeSection = 'register';
        this.contentWrapper = document.getElementById('contentWrapper');
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadSection('register');
    }

    bindEvents() {
        // Navigation buttons
        document.querySelectorAll('.nav-button').forEach(button => {
            button.addEventListener('click', (e) => {
                const section = e.currentTarget.getAttribute('data-section');
                this.setActiveSection(section);
                this.loadSection(section);
            });
        });
    }

    setActiveSection(section) {
        // Remove active class from all buttons
        document.querySelectorAll('.nav-button').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to clicked button
        document.querySelector(`[data-section="${section}"]`).classList.add('active');
        
        this.activeSection = section;
    }

    async loadSection(section) {
        try {
            let content = '';
            
            switch(section) {
                case 'register':
                    content = await this.loadHTML('../html1/registro.html');
                    break;
                case 'search':
                    content = await this.loadHTML('../html1/historial.html');
                    break;
                case 'reports':
                    content = await this.loadHTML('../html1/cierre.html');
                    break;
                default:
                    content = await this.loadHTML('../html1/registro.html');
            }
            
            this.contentWrapper.innerHTML = content;
            
            // Load specific JavaScript for the section
            this.loadSectionScript(section);
            
        } catch (error) {
            console.error('Error loading section:', error);
            this.contentWrapper.innerHTML = '<div class="text-center"><h2>Error al cargar la sección</h2></div>';
        }
    }

    async loadHTML(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.text();
        } catch (error) {
            console.error('Error fetching HTML:', error);
            return '<div class="text-center"><h2>Error al cargar el contenido</h2></div>';
        }
    }

    loadSectionScript(section) {
        // Remove existing section scripts
        const existingScript = document.querySelector('#sectionScript');
        if (existingScript) {
            existingScript.remove();
        }

        // Load new section script
        const script = document.createElement('script');
        script.id = 'sectionScript';
        
        switch(section) {
            case 'register':
                script.src = '../js1/registro.js';
                break;
            case 'search':
                script.src = '../js1/historial.js';
                break;
            case 'reports':
                script.src = '../js1/cierre.js';
                break;
        }
        
        document.body.appendChild(script);
    }
}

// Global data that can be shared across sections
window.AppData = {
    services: [
        { id: 1, name: 'Lavado Básico', price: 15000, duration: 30 },
        { id: 2, name: 'Lavado Completo', price: 25000, duration: 60 },
        { id: 3, name: 'Encerado', price: 35000, duration: 90 },
        { id: 4, name: 'Aspirado Interior', price: 12000, duration: 20 },
        { id: 5, name: 'Lavado de Motor', price: 20000, duration: 45 }
    ],

    washers: [
        'Juan Pérez', 'Carlos Rodríguez', 'Ana García', 'Luis Martínez'
    ],

    todaysTransactions: [
        { id: 1, plate: 'ABC-123', owner: 'María López', services: ['Lavado Completo'], total: 25000, time: '08:30', status: 'Completado', payment: 'Efectivo' },
        { id: 2, plate: 'XYZ-789', owner: 'Pedro Silva', services: ['Lavado Básico', 'Aspirado'], total: 27000, time: '09:15', status: 'En proceso', payment: 'Tarjeta' },
        { id: 3, plate: 'DEF-456', owner: 'Ana Gómez', services: ['Encerado'], total: 35000, time: '10:00', status: 'Completado', payment: 'Transferencia' }
    ],

    vehicleHistory: [
        { plate: 'ABC-123', owner: 'María López', lastVisit: '2024-09-01', totalVisits: 8, services: ['Lavado Completo', 'Aspirado'] },
        { plate: 'XYZ-789', owner: 'Pedro Silva', lastVisit: '2024-08-28', totalVisits: 15, services: ['Lavado Básico'] },
        { plate: 'DEF-456', owner: 'Ana Gómez', lastVisit: '2024-09-03', totalVisits: 3, services: ['Encerado', 'Lavado Completo'] }
    ],

    formatCurrency: function(amount) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount).replace('COP', '$');
    },

    getCurrentDate: function() {
        return new Date().toLocaleDateString('es-CO');
    }
};

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new Dashboard();
    
    // Evitar que el navegador vuelva a la página anterior
    history.pushState(null, "", window.location.href);
    
    // Configurar modal de logout
    const logoutModal = document.getElementById("logoutModal");
    const confirmLogout = document.getElementById("confirmLogout");
    const cancelLogout = document.getElementById("cancelLogout");
    const logoutBtn = document.getElementById("logoutBtn");

    // Abrir modal desde botón principal
    logoutBtn.addEventListener("click", () => {
        logoutModal.classList.remove("hidden");
    });

    // Cerrar sesión confirmada
    confirmLogout.addEventListener("click", () => {
        window.location.href = "/";
    });

    // Cancelar cierre
    cancelLogout.addEventListener("click", () => {
        logoutModal.classList.add("hidden");
    });

    // Cerrar si hace click fuera de la caja
    logoutModal.addEventListener("click", (e) => {
        if (e.target === logoutModal) {
            logoutModal.classList.add("hidden");
        }
    });
    
    // Detectar botón atrás del navegador
    window.onpopstate = function () {
        // En vez de volver, mostramos el modal para cerra sesión
        logoutModal.classList.remove("hidden");

        // Volvemos a empujar el estado para que no retroceda realmente
        history.pushState(null, "", window.location.href);
    };
});