// js/vehicles.js - Conectado al Backend
var API_BASE = window.API_BASE || 'http://localhost:3000/api';

let vehiclesData = [];
let filteredVehicles = [];
let currentSortField = null;
let currentSortDirection = 'asc';

// Estado de la aplicación
const appState = {
    loading: false,
    selectedVehicle: null,
    filters: {
        search: '',
        minVisits: null,
        maxVisits: null,
        dateFrom: null,
        dateTo: null,
        model: ''
    }
};

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar iconos de Lucide
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Event listeners
    setupEventListeners();
    
    // Cargar y renderizar datos iniciales
    fetchVehicles();
});

async function fetchVehicles() {
    appState.loading = true;
    try {
        const response = await fetch(`${API_BASE}/vehicles/history`);
        if (!response.ok) {
            throw new Error('Error al cargar el historial de vehículos');
        }
        vehiclesData = await response.json();
        filteredVehicles = [...vehiclesData];
        updateStats();
        renderVehiclesTable();
    } catch (error) {
        console.error(error);
        showNotification(error.message, 'error');
    } finally {
        appState.loading = false;
    }
}

function setupEventListeners() {
    const searchInput = document.getElementById('plate-search');

    // Búsqueda en tiempo real
    searchInput.addEventListener('input', function() {
        appState.filters.search = this.value;
        debounce(filterAndRenderVehicles, 300)();
    });
    document.addEventListener('click', function(e) {
        if (e.target.id === 'history-modal') {
            closeHistoryModal();
        }
        if (e.target.id === 'edit-modal') {
            closeEditModal();
        }
    });

    // Atajos de teclado
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeHistoryModal();
            closeEditModal();
        }
        if (e.key === '/' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            searchInput.focus();
        }
    });
}

function updateStats() {
    const totalVehicles = vehiclesData.length;
    const totalServices = vehiclesData.reduce((sum, vehicle) => sum + vehicle.totalVisits, 0);
    const totalRevenue = vehiclesData.reduce((sum, vehicle) => sum + vehicle.totalSpent, 0);
    
    // Servicios de este mes (simulado)
    const monthServices = Math.floor(totalServices * 0.3);

    // Actualizar elementos DOM con animación
    animateValue('total-vehicles', 0, totalVehicles, 1000);
    animateValue('total-services', 0, totalServices, 1200);
    animateValue('month-services', 0, monthServices, 800);
    animateValue('total-revenue', 0, totalRevenue, 1500, true);

    // Actualizar contador de vehículos
    document.getElementById('vehicles-count').textContent = `${filteredVehicles.length} vehículos`;
}

function animateValue(elementId, start, end, duration, isCurrency = false) {
    const element = document.getElementById(elementId);
    if (!element) return;
    const range = end - start;
    const startTime = performance.now();
    
    function updateValue(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeProgress = easeOutCubic(progress);
        const current = Math.floor(start + (range * easeProgress));
        
        if (isCurrency) {
            element.textContent = `${current.toLocaleString()}`;
        } else {
            element.textContent = current.toLocaleString();
        }
        
        if (progress < 1) {
            requestAnimationFrame(updateValue);
        }
    }
    
    requestAnimationFrame(updateValue);
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function renderVehiclesTable() {
    const tbody = document.getElementById('vehicles-tbody');
    const emptyState = document.getElementById('empty-state');
    
    if (!tbody || !emptyState) return;

    if (filteredVehicles.length === 0) {
        tbody.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    tbody.innerHTML = '';

    filteredVehicles.forEach((vehicle, index) => {
        const row = createVehicleRow(vehicle, index);
        tbody.appendChild(row);
    });

    // Reinicializar iconos de Lucide
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Actualizar contador
    document.getElementById('vehicles-count').textContent = `${filteredVehicles.length} vehículos`;
}

function createVehicleRow(vehicle, index) {
    const row = document.createElement('tr');
    row.className = 'vehicle-row border-b border-gray-100 hover:bg-gray-50 transition-all duration-200';
    row.style.animationDelay = `${index * 0.05}s`;

    // Determinar clase del badge de visitas
    let visitsBadgeClass = 'visits-badge';
    if (vehicle.totalVisits > 20) visitsBadgeClass += ' very-high-visits';
    else if (vehicle.totalVisits > 10) visitsBadgeClass += ' high-visits';

    row.innerHTML = `
        <td class="py-4 px-6">
            <div class="plate-badge">${vehicle.plate}</div>
        </td>
        <td class="py-4 px-6">
            <div class="flex items-center gap-3">
                <div class="vehicle-avatar">
                    <i data-lucide="car" class="w-4 h-4 text-blue-600"></i>
                </div>
                <div>
                    <div class="font-semibold text-gray-900">${vehicle.type}</div>
                    <div class="text-sm text-gray-500">ID: ${vehicle.id}</div>
                </div>
            </div>
        </td>
        <td class="py-4 px-6">
            <div class="font-medium text-gray-900">${vehicle.owner}</div>
        </td>
        <td class="py-4 px-6 text-center">
            <span class="${visitsBadgeClass}">${vehicle.totalVisits}</span>
        </td>
        <td class="py-4 px-6">
            <div class="text-gray-900">${formatDate(vehicle.lastVisit)}</div>
            <div class="text-sm text-gray-500">${getTimeAgo(vehicle.lastVisit)}</div>
        </td>
        <td class="py-4 px-6 text-right">
            <div class="font-bold text-green-600">${vehicle.totalSpent.toLocaleString()}</div>
            <div class="text-sm text-gray-500">Total gastado</div>
        </td>
        <td class="py-4 px-6">
            <div class="flex items-center justify-center gap-1">
                <button class="action-btn action-btn-primary" onclick="showVehicleHistory('${vehicle.plate}')" title="Ver historial completo">
                    <i data-lucide="history" class="w-4 h-4"></i>
                </button>
                <button class="action-btn action-btn-secondary" onclick='editVehicle(${JSON.stringify(vehicle)})' title="Editar vehículo">
                    <i data-lucide="edit-3" class="w-4 h-4"></i>
                </button>
                <button class="action-btn action-btn-danger" onclick="deleteVehicle(${vehicle.id})" title="Anular vehículo">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>
        </td>
    `;

    return row;
}

function showVehicleHistory(plate) {
    const vehicle = vehiclesData.find(v => v.plate === plate);
    if (!vehicle) return;

    appState.selectedVehicle = vehicle;
    
    const modal = document.getElementById('history-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalSubtitle = document.getElementById('modal-subtitle');
    const modalTbody = document.getElementById('modal-history-tbody');

    // Actualizar información del modal
    modalTitle.textContent = `Historial Completo - ${vehicle.plate}`;
    modalSubtitle.textContent = `${vehicle.type} • ${vehicle.owner} • ${vehicle.totalVisits} visitas • ${vehicle.totalSpent.toLocaleString()} gastado`;

    // Limpiar y llenar tabla del modal
    modalTbody.innerHTML = '';
    // NOTE: The detailed history is not available in the main vehicle list from the backend.
    // This would require a separate API call to fetch the history for a specific vehicle.
    // For now, we will show a message.
    modalTbody.innerHTML = '<tr><td colspan="6" class="text-center py-4">Historial detallado no disponible en esta vista.</td></tr>';

    // Mostrar modal
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Reinicializar iconos
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    showNotification(`Mostrando historial de ${vehicle.plate}`, 'info');
}

function closeHistoryModal() {
    const modal = document.getElementById('history-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        appState.selectedVehicle = null;
    }
}

function closeEditModal() {
    const modal = document.getElementById('edit-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

// =============================
// FUNCIÓN EDITAR REAL
// =============================
window.editVehicle = function (vehicle) {
    // Abrimos modal
    document.getElementById("editId").value = vehicle.id;
    document.getElementById("editPlate").value = vehicle.plate;
    document.getElementById("editOwner").value = vehicle.owner;
    document.getElementById("editType").value = vehicle.type;
    document.getElementById("editPhone").value = vehicle.phone || '';
    document.getElementById("editWasher").value = vehicle.washer_id || '';

    document.getElementById("edit-modal").classList.remove("hidden");
    document.body.style.overflow = 'hidden';
    
    // Reinicializar iconos
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
};

// =============================
// FUNCIÓN GUARDAR EDICIÓN
// =============================
window.saveVehicleEdit = async function () {
    const id = document.getElementById("editId").value;

    const body = {
        plate: document.getElementById("editPlate").value,
        type: document.getElementById("editType").value,
        owner: document.getElementById("editOwner").value,
        phone: document.getElementById("editPhone").value,
        washer_id: document.getElementById("editWasher").value
    };

    try {
        const res = await fetch(`${API_BASE}/vehicles/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const data = await res.json();

        showNotification(data.message || 'Vehículo actualizado correctamente', "success");
        closeEditModal();

        fetchVehicles();
    } catch (error) {
        console.error(error);
        showNotification("Error al guardar cambios", "error");
    }
}

// =============================
// FUNCIÓN ELIMINAR REAL
// =============================
window.deleteVehicle = async function (id) {
    if (!confirm("¿Seguro que deseas eliminar este vehículo?")) return;

    try {
        const res = await fetch(`${API_BASE}/vehicles/${id}`, {
            method: "DELETE",
        });

        const data = await res.json();

        showNotification(data.message || "Vehículo eliminado", "success");

        fetchVehicles(); // recargar tabla
    } catch (error) {
        console.error(error);
        showNotification("Error al eliminar", "error");
    }
}



function filterAndRenderVehicles() {
    const searchTerm = appState.filters.search.toLowerCase();
    
    filteredVehicles = vehiclesData.filter(vehicle => {
        const matchesSearch = !searchTerm || 
            vehicle.plate.toLowerCase().includes(searchTerm) ||
            vehicle.owner.toLowerCase().includes(searchTerm);
            
        // Aquí se pueden agregar más filtros
        return matchesSearch;
    });
    
    renderVehiclesTable();
}

function sortTable(field) {
    if (currentSortField === field) {
        currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortField = field;
        currentSortDirection = 'asc';
    }
    
    filteredVehicles.sort((a, b) => {
        let aValue = a[field];
        let bValue = b[field];
        
        if (field === 'lastVisit') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        }
        
        if (currentSortDirection === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });
    
    renderVehiclesTable();
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

function getTimeAgo(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'hace 1 día';
    if (diffDays < 7) return `hace ${diffDays} días`;
    if (diffDays < 30) return `hace ${Math.floor(diffDays / 7)} semanas`;
    if (diffDays < 365) return `hace ${Math.floor(diffDays / 30)} meses`;
    return `hace ${Math.floor(diffDays / 365)} años`;
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `toast-notification toast-${type}`;
    
    const icon = type === 'success' ? 'check-circle' : 
                 type === 'error' ? 'x-circle' : 
                 type === 'warning' ? 'alert-triangle' : 'info';
    
    notification.innerHTML = `
        <div class="flex items-center gap-3">
            <i data-lucide="${icon}" class="w-5 h-5 ${
                type === 'success' ? 'text-green-500' :
                type === 'error' ? 'text-red-500' :
                type === 'warning' ? 'text-yellow-500' :
                'text-blue-500'
            }"></i>
            <span class="font-medium">${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    setTimeout(() => notification.classList.add('show'), 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 400);
    }, 3000);
}

function animatePageLoad() {
    const elements = document.querySelectorAll('.stats-card, .vehicle-row');
    elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 50);
    });
}

// Función de debounce mejorada
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Exportar funciones globalmente
window.showVehicleHistory = showVehicleHistory;
window.closeHistoryModal = closeHistoryModal;
window.sortTable = sortTable;