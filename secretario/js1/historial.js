(() => {
// JavaScript para el módulo de consulta de historial - CONECTADO AL BACKEND
var API_BASE = window.API_BASE || 'http://localhost:3000/api';

window.API_BASE = API_BASE;

let vehicleHistory = [];
let filteredResults = [];
let searchTimeout;

// Inicialización
function initHistorial() {
  setupEventListeners();
  loadHistoryFromBackend();
}

// Inicializar solo si los elementos existen (está en la sección correcta)
if (document.getElementById('searchPlate')) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHistorial);
  } else {
    initHistorial();
  }
}

// CARGAR HISTORIAL REAL DESDE BACKEND
async function loadHistoryFromBackend() {
  showLoadingState();
  
  try {
    const response = await fetch(`${API_BASE}/vehicles/history`);
    if (!response.ok) {
      throw new Error('Error al cargar historial');
    }
    
    vehicleHistory = await response.json();
    filteredResults = [...vehicleHistory];
    
    renderSearchResults();
    updateQuickStats();
    hideLoadingState();
    
  } catch (error) {
    console.error('Error cargando historial:', error);
    showErrorMessage('Error cargando el historial del servidor');
    hideLoadingState();
  }
}

function showLoadingState() {
  const container = document.getElementById('searchResults');
  if (container) {
    container.innerHTML = `
      <div class="text-center py-8">
        <svg class="animate-spin h-8 w-8 text-blue-600 mx-auto mb-3" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-gray-600">Cargando historial...</p>
      </div>
    `;
  }
}

function hideLoadingState() {
  // La función renderSearchResults limpiará el loading
}

function showErrorMessage(message) {
  const container = document.getElementById('searchResults');
  if (container) {
    container.innerHTML = `
      <div class="text-center py-8">
        <svg class="text-red-400 mx-auto mb-3" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        <p class="text-red-600 mb-2">${message}</p>
        <button onclick="loadHistoryFromBackend()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Intentar de nuevo
        </button>
      </div>
    `;
  }
}

function setupEventListeners() {
  // Búsqueda en tiempo real
  const searchPlate = document.getElementById('searchPlate');
  const searchOwner = document.getElementById('searchOwner');
  const dateFrom = document.getElementById('dateFrom');
  const dateTo = document.getElementById('dateTo');

  if (searchPlate) {
    searchPlate.addEventListener('input', function(e) {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        searchVehicles();
      }, 300);
    });
  }
  
  if (searchOwner) {
    searchOwner.addEventListener('input', function(e) {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        searchVehicles();
      }, 300);
    });
  }
  
  // Filtros de fecha
  if (dateFrom) {
    dateFrom.addEventListener('change', searchVehicles);
  }
  if (dateTo) {
    dateTo.addEventListener('change', searchVehicles);
  }
  
  // Cerrar modal al hacer clic fuera
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('bg-opacity-50')) {
      closeVehicleModal();
    }
  });
  
  // Enter key para buscar
  if (searchPlate) {
    searchPlate.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        searchVehicles();
      }
    });
  }
}

function searchVehicles() {
  const plateSearchEl = document.getElementById('searchPlate');
  const ownerSearchEl = document.getElementById('searchOwner');
  const dateFromEl = document.getElementById('dateFrom');
  const dateToEl = document.getElementById('dateTo');
  
  const plateSearch = plateSearchEl ? plateSearchEl.value.trim().toUpperCase() : '';
  const ownerSearch = ownerSearchEl ? ownerSearchEl.value.trim().toLowerCase() : '';
  const dateFrom = dateFromEl ? dateFromEl.value : '';
  const dateTo = dateToEl ? dateToEl.value : '';
  
  filteredResults = vehicleHistory.filter(vehicle => {
    // Filtro por placa
    const plateMatch = !plateSearch || vehicle.plate.toUpperCase().includes(plateSearch);
    
    // Filtro por propietario
    const ownerMatch = !ownerSearch || vehicle.owner.toLowerCase().includes(ownerSearch);
    
    // Filtros por fecha
    let dateMatch = true;
    if (dateFrom || dateTo) {
      const vehicleDate = new Date(vehicle.lastVisit || vehicle.createdAt);
      if (dateFrom) {
        dateMatch = dateMatch && vehicleDate >= new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999); // Incluir todo el día
        dateMatch = dateMatch && vehicleDate <= endDate;
      }
    }
    
    return plateMatch && ownerMatch && dateMatch;
  });
  
  renderSearchResults();
  updateQuickStats();
}

function renderSearchResults() {
  const container = document.getElementById('searchResults');
  const noResults = document.getElementById('noResults');
  
  if (!container) return;
  
  if (filteredResults.length === 0) {
    container.innerHTML = '';
    if (noResults) {
      noResults.classList.remove('hidden');
    }
    
    const searchPlateEl = document.getElementById('searchPlate');
    const searchOwnerEl = document.getElementById('searchOwner');
    const dateFromEl = document.getElementById('dateFrom');
    const dateToEl = document.getElementById('dateTo');
    
    const hasFilters = (searchPlateEl && searchPlateEl.value) || 
                      (searchOwnerEl && searchOwnerEl.value) ||
                      (dateFromEl && dateFromEl.value) ||
                      (dateToEl && dateToEl.value);
    
    const noResultsMessageEl = document.getElementById('noResultsMessage');
    if (noResultsMessageEl) {
      noResultsMessageEl.textContent = hasFilters 
        ? 'No se encontraron vehículos que coincidan con los criterios de búsqueda'
        : 'No hay vehículos registrados en el historial';
    }
    return;
  }
  
  if (noResults) {
    noResults.classList.add('hidden');
  }
  container.innerHTML = '';
  
  filteredResults.forEach((vehicle, index) => {
    const vehicleCard = document.createElement('div');
    vehicleCard.className = 'vehicle-card border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-all duration-200';
    vehicleCard.style.animationDelay = `${index * 0.1}s`;
    vehicleCard.onclick = () => showVehicleDetails(vehicle);
    
    const servicesDisplay = vehicle.services && vehicle.services.length > 0 
      ? vehicle.services.slice(0, 3).map(service => 
          `<span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-1 mb-1">${service}</span>`
        ).join('')
      : '<span class="text-gray-400 text-sm">Sin servicios registrados</span>';
    
    vehicleCard.innerHTML = `
      <div class="flex justify-between items-start">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <svg class="text-blue-600" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 21h8a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2Z"/>
              <path d="M16 3.5H8"/>
              <path d="M12 16v-1"/>
            </svg>
            <h3 class="font-semibold text-lg">${vehicle.plate}</h3>
            <span class="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="inline mr-1">
                <polyline points="9,11 12,14 22,4"/>
                <path d="M21,12v7a2,2 0 0,1 -2,2H5a2,2 0 0,1 -2,-2V5a2,2 0 0,1 2,-2h11"/>
              </svg>
              ${vehicle.totalVisits || 0} visitas
            </span>
          </div>
          <p class="text-gray-700 mb-1"><strong>Propietario:</strong> ${vehicle.owner}</p>
          <p class="text-gray-600 mb-2"><strong>Última visita:</strong> ${formatDate(vehicle.lastVisit || vehicle.createdAt)}</p>
          ${vehicle.totalSpent ? `<p class="text-gray-600 mb-2"><strong>Total gastado:</strong> ${AppData.formatCurrency(vehicle.totalSpent)}</p>` : ''}
          <div class="flex flex-wrap">
            ${servicesDisplay}
          </div>
        </div>
        <button class="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center gap-2 transition-all duration-200" onclick="event.stopPropagation(); showVehicleDetailsById(${index})">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          Ver Detalles
        </button>
      </div>
    `;
    
    container.appendChild(vehicleCard);
  });
}

function updateQuickStats() {
  const totalVehicles = filteredResults.length;
  const totalVehiclesEl = document.getElementById('totalVehicles');
  if (totalVehiclesEl) {
    totalVehiclesEl.textContent = totalVehicles;
  }
  
  // Cliente más frecuente
  if (filteredResults.length > 0) {
    const frequentClient = filteredResults.reduce((prev, current) => 
      (prev.totalVisits || 0) > (current.totalVisits || 0) ? prev : current
    );
    const frequentClientEl = document.getElementById('frequentClient');
    const frequentClientVisitsEl = document.getElementById('frequentClientVisits');
    
    if (frequentClientEl) {
      frequentClientEl.textContent = frequentClient.owner;
    }
    if (frequentClientVisitsEl) {
      frequentClientVisitsEl.textContent = `${frequentClient.totalVisits || 0} visitas`;
    }
    
    // Última visita más reciente
    const mostRecent = filteredResults.reduce((prev, current) => {
      const prevDate = new Date(prev.lastVisit || prev.createdAt);
      const currentDate = new Date(current.lastVisit || current.createdAt);
      return prevDate > currentDate ? prev : current;
    });
    const lastVisitDateEl = document.getElementById('lastVisitDate');
    if (lastVisitDateEl) {
      lastVisitDateEl.textContent = formatDate(mostRecent.lastVisit || mostRecent.createdAt);
    }
  } else {
    const frequentClientEl = document.getElementById('frequentClient');
    const frequentClientVisitsEl = document.getElementById('frequentClientVisits');
    const lastVisitDateEl = document.getElementById('lastVisitDate');
    
    if (frequentClientEl) frequentClientEl.textContent = '-';
    if (frequentClientVisitsEl) frequentClientVisitsEl.textContent = '0 visitas';
    if (lastVisitDateEl) lastVisitDateEl.textContent = '-';
  }
}

// ✅ FUNCIÓN CORREGIDA: Ahora es async
async function showVehicleDetails(vehicle) {
  const modalEl = document.getElementById('vehicleModal');
  if (modalEl) {
    modalEl.classList.remove('hidden');
  }
  
  // Cargar historial detallado del vehículo
  try {
    const detailedHistory = await loadVehicleDetailedHistory(vehicle.id);
    displayVehicleDetails(vehicle, detailedHistory);
  } catch (error) {
    console.error('Error cargando detalles:', error);
    displayVehicleDetails(vehicle, []);
  }
}

async function loadVehicleDetailedHistory(vehicleId) {
  try {
    // TODO: Implementar endpoint en backend
    // const response = await fetch(`${API_BASE}/vehicles/${vehicleId}/transactions`);
    // if (response.ok) {
    //   return await response.json();
    // }
    
    // Datos simulados mientras se implementa el backend
    return [];
  } catch (error) {
    console.error('Error cargando historial detallado:', error);
    return [];
  }
}

function displayVehicleDetails(vehicle, detailedHistory) {
  const detailsEl = document.getElementById('vehicleDetails');
  if (!detailsEl) return;
  
  detailsEl.innerHTML = `
    <!-- Información básica -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div class="p-3 bg-gray-50 rounded-lg">
        <div class="text-sm text-gray-600">Placa</div>
        <div class="font-semibold text-gray-900">${vehicle.plate}</div>
      </div>
      <div class="p-3 bg-gray-50 rounded-lg">
        <div class="text-sm text-gray-600">Propietario</div>
        <div class="font-semibold text-gray-900">${vehicle.owner}</div>
      </div>
      <div class="p-3 bg-gray-50 rounded-lg">
        <div class="text-sm text-gray-600">Tipo de Vehículo</div>
        <div class="font-semibold text-gray-900">${vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)}</div>
      </div>
      <div class="p-3 bg-gray-50 rounded-lg">
        <div class="text-sm text-gray-600">Total de Visitas</div>
        <div class="font-semibold text-gray-900">${vehicle.totalVisits || 0}</div>
      </div>
      <div class="p-3 bg-gray-50 rounded-lg">
        <div class="text-sm text-gray-600">Última Visita</div>
        <div class="font-semibold text-gray-900">${formatDate(vehicle.lastVisit || vehicle.createdAt)}</div>
      </div>
      <div class="p-3 bg-gray-50 rounded-lg">
        <div class="text-sm text-gray-600">Total Gastado</div>
        <div class="font-semibold text-green-600">${AppData.formatCurrency(vehicle.totalSpent || 0)}</div>
      </div>
    </div>
    
    <!-- Servicios frecuentes -->
    <div class="mb-6">
      <h4 class="font-semibold text-gray-800 mb-3">Servicios Más Solicitados</h4>
      <div class="flex flex-wrap gap-2">
        ${vehicle.services && vehicle.services.length > 0 
          ? vehicle.services.map(service => 
              `<span class="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">${service}</span>`
            ).join('')
          : '<span class="text-gray-400">No hay servicios registrados</span>'
        }
      </div>
    </div>
    
    <!-- Historial detallado -->
    <div>
      <h4 class="font-semibold text-gray-800 mb-4">Historial de Transacciones</h4>
      ${detailedHistory.length > 0 ? `
        <div class="space-y-4 max-h-64 overflow-y-auto">
          ${detailedHistory.map(transaction => `
            <div class="border border-gray-200 rounded-lg p-4">
              <div class="flex justify-between items-start mb-2">
                <h5 class="font-medium text-gray-900">${formatDate(transaction.created_at)}</h5>
                <span class="text-sm text-gray-500">${formatTime(transaction.created_at)}</span>
              </div>
              <div class="flex flex-wrap gap-1 mb-2">
                ${transaction.services ? transaction.services.map(service => 
                  `<span class="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">${service}</span>`
                ).join('') : ''}
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Estado: ${transaction.status}</span>
                <span class="font-semibold text-green-600">${AppData.formatCurrency(transaction.total)}</span>
              </div>
            </div>
          `).join('')}
        </div>
      ` : `
        <div class="text-center py-8 text-gray-500">
          <svg class="text-gray-300 mx-auto mb-3" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6m0 6v6"/>
            <path d="M1 12h6m6 0h6"/>
          </svg>
          <p>No hay transacciones registradas para este vehículo</p>
        </div>
      `}
    </div>
    
    <!-- Estadísticas del vehículo -->
    ${vehicle.totalVisits > 0 ? `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div class="p-4 bg-blue-50 rounded-lg">
          <h5 class="font-medium text-blue-800 mb-1">Total Gastado</h5>
          <p class="text-2xl font-bold text-blue-900">${AppData.formatCurrency(vehicle.totalSpent || 0)}</p>
        </div>
        <div class="p-4 bg-green-50 rounded-lg">
          <h5 class="font-medium text-green-800 mb-1">Promedio por Visita</h5>
          <p class="text-2xl font-bold text-green-900">${AppData.formatCurrency(vehicle.totalVisits > 0 ? Math.round((vehicle.totalSpent || 0) / vehicle.totalVisits) : 0)}</p>
        </div>
      </div>
    ` : ''}
  `;
}

function closeVehicleModal() {
  const modalEl = document.getElementById('vehicleModal');
  if (modalEl) {
    modalEl.classList.add('hidden');
  }
}

function clearFilters() {
  const searchPlateEl = document.getElementById('searchPlate');
  const searchOwnerEl = document.getElementById('searchOwner');
  const dateFromEl = document.getElementById('dateFrom');
  const dateToEl = document.getElementById('dateTo');
  
  if (searchPlateEl) searchPlateEl.value = '';
  if (searchOwnerEl) searchOwnerEl.value = '';
  if (dateFromEl) dateFromEl.value = '';
  if (dateToEl) dateToEl.value = '';
  
  filteredResults = [...vehicleHistory];
  renderSearchResults();
  updateQuickStats();
}

function formatDate(dateString) {
  if (!dateString) return 'No disponible';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// ✅ FUNCIÓN AUXILIAR AGREGADA
function showVehicleDetailsById(index) {
  const vehicle = filteredResults[index];
  if (vehicle) {
    showVehicleDetails(vehicle);
  }
}

// Exponer funciones para HTML
window.showVehicleDetails = showVehicleDetails;
window.showVehicleDetailsById = showVehicleDetailsById;
window.closeVehicleModal = closeVehicleModal;
window.clearFilters = clearFilters;

})();