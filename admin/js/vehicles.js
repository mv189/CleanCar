const API_BASE = window.API_BASE || 'http://localhost:3000/api';

let vehiclesData = [];
let filteredVehicles = [];
let currentSortField = null;
let currentSortDirection = 'asc';
let washersList = [];

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
    setupEventListeners();
    fetchVehicles();
    loadWashers();
});

// CARGAR LAVADORES

async function loadWashers() {
    try {
        const res = await fetch(`${API_BASE}/washers`);
        washersList = await res.json();

        const washerSelect = document.getElementById("editWasher");
        washerSelect.innerHTML = `
            <option value="">Sin asignar</option>
        `;

        washersList.forEach(w => {
            washerSelect.innerHTML += `
                <option value="${w.id}">${w.name}</option>
            `;
        });

    } catch (error) {
        console.error("Error cargando lavadores:", error);
    }
}


// OBTENER VEHÍCULOS
async function fetchVehicles() {
    appState.loading = true;
    try {
        const response = await fetch(`${API_BASE}/vehicles/history`);
        if (!response.ok) throw new Error('Error al cargar el historial de vehículos');
        
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

//EVENTOS

function setupEventListeners() {
    const searchInput = document.getElementById('plate-search');

    searchInput.addEventListener('input', function() {
        appState.filters.search = this.value;
        debounce(filterAndRenderVehicles, 300)();
    });

    document.addEventListener('click', function(e) {
        if (e.target.id === 'history-modal') closeHistoryModal();
        if (e.target.id === 'edit-modal') closeEditModal();
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeHistoryModal();
            closeEditModal();
        }
    });
}

//ESTADÍSTICAS

function updateStats() {
    const totalVehicles = vehiclesData.length;
    const totalServices = vehiclesData.reduce((sum, v) => sum + v.totalVisits, 0);
    const totalRevenue = vehiclesData.reduce((sum, v) => sum + v.totalSpent, 0);

    animateValue('total-vehicles', 0, totalVehicles, 1000);
    animateValue('total-services', 0, totalServices, 1200);
    animateValue('total-revenue', 0, totalRevenue, 1500, true);

    document.getElementById('vehicles-count').textContent = `${filteredVehicles.length} vehículos`;
}

function animateValue(id, start, end, duration, isCurrency = false) {
    const element = document.getElementById(id);
    if (!element) return;

    const range = end - start;
    const startTime = performance.now();

    function update(currentTime) {
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.floor(start + (range * eased));

        element.textContent = isCurrency ? value.toLocaleString() : value;

        if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
}

//RENDERIZAR TABLA


function renderVehiclesTable() {
    const tbody = document.getElementById('vehicles-tbody');
    const emptyState = document.getElementById('empty-state');

    tbody.innerHTML = '';

    if (filteredVehicles.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    filteredVehicles.forEach((vehicle, index) => {
        tbody.appendChild(createVehicleRow(vehicle, index));
    });

    document.getElementById('vehicles-count').textContent = `${filteredVehicles.length} vehículos`;
}

// FILA DE VEHÍCULO 


function createVehicleRow(vehicle, index) {
    const row = document.createElement('tr');
    row.className = 'vehicle-row border-b border-gray-100 hover:bg-gray-50 transition-all duration-200';
    row.style.animationDelay = `${index * 0.05}s`;

    let visitsBadgeClass = 'visits-badge';
    if (vehicle.totalVisits > 20) visitsBadgeClass += ' very-high-visits';
    else if (vehicle.totalVisits > 10) visitsBadgeClass += ' high-visits';

    row.innerHTML = `
        <td class="py-4 px-6">
            <div class="plate-badge">${vehicle.plate}</div>
        </td>

        <td class="py-4 px-6">
            <div>
                <div class="font-semibold text-gray-900 capitalize">${vehicle.type}</div>
                <div class="text-sm text-gray-500">ID: ${vehicle.id}</div>
            </div>
        </td>

        <td class="py-4 px-6 capitalize">${vehicle.owner}</td>

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
            <div class="flex items-center justify-center gap-2">

                <!-- VER HISTORIAL -->
                <button class="action-btn action-btn-primary" onclick="showVehicleHistory('${vehicle.plate}')" title="Ver historial">
                    <i class="fa-solid fa-clock-rotate-left text-blue-600 text-lg"></i>
                </button>

                <!-- EDITAR -->
                <button class="action-btn action-btn-secondary" onclick='editVehicle(${JSON.stringify(vehicle)})' title="Editar">
                    <i class="fa-solid fa-pen text-yellow-600 text-lg"></i>
                </button>

                <!-- ELIMINAR -->
                <button class="action-btn action-btn-danger" onclick="deleteVehicle(${vehicle.id})" title="Eliminar">
                    <i class="fa-solid fa-trash text-red-600 text-lg"></i>
                </button>

            </div>
        </td>
    `;

    return row;
}

//  HISTORIAL 

async function showVehicleHistory(plate) {
    try {
        // 1. Consultar historial REAL
        const response = await fetch(`${API_BASE}/vehicles/history/${plate}`);

        // PRIMERO validar el estado HTTP
        if (!response.ok) {
            showNotification("Vehículo no encontrado", "error");
            return;
        }

        // SOLO SI response.ok es true → procesamos JSON
        const { vehicle, history } = await response.json();

        // 2. Títulos del modal
        document.getElementById('modal-title').textContent = `Historial - ${plate}`;
        document.getElementById('modal-subtitle').textContent =
            `${vehicle.owner || 'Sin propietario'} • ${history.length} visitas`;

        // 3. Tabla del historial
        const tbody = document.getElementById('modal-history-tbody');
        tbody.innerHTML = "";

        if (history.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4">
                        No hay historial disponible para este vehículo.
                    </td>
                </tr>
            `;
        } else {
            history.forEach(item => {
                tbody.innerHTML += `
                    <tr class="hover:bg-gray-50">

                        <td class="py-3 px-4">${formatDate(item.date)}</td>

                        <td class="py-3 px-4 capitalize">${item.services || 'N/A'}</td>

                        <td class="py-3 px-4 text-right font-semibold text-green-600">
                            ${(item.total || 0).toLocaleString()}
                        </td>

                        <td class="py-3 px-4 capitalize">${item.washer || 'N/A'}</td>

                        <td class="py-3 px-4 text-center">
                            <span class="px-3 py-1 rounded-full bg-blue-100 text-blue-600">
                                ${item.status || 'completado'}
                            </span>
                        </td>

                        <td class="py-3 px-4 text-center">
                            <i class="fa-solid fa-file-invoice text-gray-600"></i>
                        </td>

                    </tr>
                `;
            });
        }

        // 4. Mostrar modal
        document.getElementById('history-modal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';

    } catch (error) {
        console.error("Error cargando historial:", error);
        showNotification("Error cargando historial", "error");
    }
}

function closeHistoryModal() {
    document.getElementById('history-modal').classList.add('hidden');
    document.body.style.overflow = '';
}

// VALIDACIONES

function setupValidations() {
    const editPlate = document.getElementById("editPlate");
    const editType = document.getElementById("editType");
    const editPhone = document.getElementById("editPhone");

    const plateError = document.getElementById("editPlateError");
    const phoneError = document.getElementById("editPhoneError");

    const saveBtn = document.getElementById("saveEditBtn");

// VALIDACIÓN DE PLACA (IGUAL AL SECRETARIO)
    function validatePlate() {
        let plate = editPlate.value.toUpperCase().trim();
        let type = editType.value;

        editPlate.value = plate; // Forzar mayúsculas

        let regexCarro = /^[A-Z]{3}[0-9]{3}$/;  // Carro
        let regexMoto = /^[A-Z]{3}[0-9]{2}[A-Z]{1}$/;  // Moto ABC12A

        let valid = false;

        if (type === "moto") {
            valid = regexMoto.test(plate);
            if (!valid) {
                plateError.textContent = "Formato para moto: LLLNNL (Ej: ABC12A)";
                editPlate.classList.add("invalid");
            } else {
                plateError.textContent = "";
                editPlate.classList.remove("invalid");
            }
        } else {
            valid = regexCarro.test(plate);
            if (!valid) {
                plateError.textContent = "Carro/Camioneta: LLLNNN (Ej: ABC123)";
                editPlate.classList.add("invalid");
            } else {
                plateError.textContent = "";
                editPlate.classList.remove("invalid");
            }
        }

        return valid;
    }


    // VALIDACIÓN DE TELÉFONO (IGUAL AL SECRETARIO)

    function validatePhone() {
        let phone = editPhone.value.trim();

        let regex = /^3[0-9]{9}$/; // 10 dígitos, empieza por 3

        if (!regex.test(phone)) {
            phoneError.textContent = "Formato: 10 dígitos y debe empezar con 3 (Ej: 3001234567)";
            editPhone.classList.add("invalid");
            return false;
        } else {
            phoneError.textContent = "";
            editPhone.classList.remove("invalid");
            return true;
        }
    }


// DESACTIVAR EL BOTÓN "GUARDAR CAMBIOS"
    function validateForm() {
        let valid =
            validatePlate() &&
            validatePhone();

        saveBtn.disabled = !valid;
        return valid;
    }


    // EVENTOS IGUALES AL de SECRETARIO
 
    editPlate.addEventListener("input", validateForm);
    editType.addEventListener("change", validateForm);
    editPhone.addEventListener("input", validateForm);


// VALIDAR ANTES DE GUARDAR

    saveBtn.addEventListener("click", (e) => {
        if (!validateForm()) {
            e.preventDefault();
            return;
        }
    });

    validateForm();
}


//EDITAR

window.editVehicle = function (vehicle) {
    document.getElementById("editId").value = vehicle.id;
    document.getElementById("editPlate").value = (vehicle.plate || "").toUpperCase();
    document.getElementById("editOwner").value = vehicle.owner || '';
    document.getElementById("editType").value = vehicle.type || 'carro';
     document.getElementById("editPhone").value = (vehicle.phone || '').replace('+57', '');
    document.getElementById("editWasher").value = vehicle.washer_id || '';

    document.getElementById("edit-modal").classList.remove("hidden");
    document.body.style.overflow = 'hidden';

    setupValidations(); 
};

window.saveVehicleEdit = async function () {

    // DETENER SI HAY ERRORES
    if (document.getElementById("saveEditBtn").disabled) {
        showNotification("Corrige los campos antes de guardar", "error");
        return;
    }

    const id = document.getElementById("editId").value;

    const body = {
        plate: document.getElementById("editPlate").value.toUpperCase(),
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

        if (!res.ok) {
            showNotification(data.error || "Error al actualizar", "error");
            return;
        }

        showNotification("Cambios guardados correctamente", "success");
        closeEditModal();
        fetchVehicles();

    } catch (error) {
        console.error(error);
        showNotification("Error al guardar", "error");
    }
};

function closeEditModal() {
    document.getElementById("edit-modal").classList.add("hidden");
    document.body.style.overflow = '';
}

// ELIMINAR 

let vehicleToDelete = null;

window.deleteVehicle = function(id) {
    vehicleToDelete = id;
    document.getElementById("delete-modal").classList.remove("hidden");
    document.body.style.overflow = "hidden";
};

// Botón cancelar
document.getElementById("cancelDeleteBtn").addEventListener("click", () => {
    vehicleToDelete = null;
    document.getElementById("delete-modal").classList.add("hidden");
    document.body.style.overflow = "";
});

// Botón eliminar
document.getElementById("confirmDeleteBtn").addEventListener("click", async () => {

    if (!vehicleToDelete) return;

    try {
        const res = await fetch(`${API_BASE}/vehicles/${vehicleToDelete}`, {
            method: "DELETE"
        });

        const data = await res.json();

        showNotification(data.message || "Vehículo eliminado", "success");

        fetchVehicles(); // actualizar tabla

    } catch (error) {
        console.error(error);
        showNotification("Error al eliminar", "error");
    }

    // Cerrar modal
    document.getElementById("delete-modal").classList.add("hidden");
    document.body.style.overflow = "";
});

// FILTRO Y ORDEN

function filterAndRenderVehicles() {
    const searchTerm = appState.filters.search.toLowerCase();

    filteredVehicles = vehiclesData.filter(v => {
        return (
            v.plate.toLowerCase().includes(searchTerm) ||
            v.owner.toLowerCase().includes(searchTerm)
        );
    });

    renderVehiclesTable();
}

//UTILIDADES

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    return d.toLocaleDateString('es-ES');
}

function getTimeAgo(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const diff = (Date.now() - date) / (1000 * 3600 * 24);

    if (diff < 1) return "hace hoy";
    if (diff < 2) return "hace 1 día";
    if (diff < 7) return `hace ${Math.floor(diff)} días`;
    if (diff < 30) return `hace ${Math.floor(diff / 7)} semanas`;
    return `hace ${Math.floor(diff / 30)} meses`;
}

//NOTIFICACIONES (CON FONT AWESOME)

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `toast-notification toast-${type}`;

    const icon =
        type === 'success' ? 'fa-circle-check' :
        type === 'error'   ? 'fa-circle-xmark' :
        type === 'warning' ? 'fa-triangle-exclamation' :
                             'fa-circle-info';

    notification.innerHTML = `
        <div class="flex items-center gap-3">
            <i class="fa-solid ${icon} text-lg"></i>
            <span class="font-medium">${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add('show'), 50);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Función de debounce
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// Exportar funciones
window.showVehicleHistory = showVehicleHistory;
window.closeHistoryModal = closeHistoryModal;