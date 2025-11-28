(() => {
// CONECTADO AL BACKEND
var API_BASE = window.API_BASE || 'http://localhost:3000/api';
window.API_BASE = API_BASE;

let todaysData = {
    metrics: {},
    transactions: [],
    paymentSummary: [],
    popularServices: []
};
let filteredTransactions = [];
let currentFilter = 'all';

// Inicialización
function initCierre() {
    setCurrentDate();
    loadTodaysDataFromBackend();
    
    // Actualizar cada 5 minutos
    setInterval(loadTodaysDataFromBackend, 300000);
}

// Inicializar solo si los elementos existen (está en la sección correcta)
if (document.getElementById('currentDate')) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCierre);
    } else {
        initCierre();
    }
}

function setCurrentDate() {
    const currentDateEl = document.getElementById('currentDate');
    if (currentDateEl) {
        const today = new Date();
        const dateStr = today.toLocaleDateString('es-CO', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        currentDateEl.textContent = dateStr;
    }
}

// CARGAR DATOS REALES DESDE BACKEND
async function loadTodaysDataFromBackend() {
    showLoadingState();
    
    try {
        // Cargar métricas y transacciones del día
        const [transactionsResponse, servicesResponse] = await Promise.all([
            fetch(`${API_BASE}/transactions/today`),
            fetch(`${API_BASE}/transactions/popular-services`)
        ]);
        
        if (!transactionsResponse.ok) {
            throw new Error('Error al cargar datos del día');
        }
        
        const transactionsData = await transactionsResponse.json();
        const servicesData = servicesResponse.ok ? await servicesResponse.json() : [];
        
        // Actualizar datos globales
        todaysData = {
            metrics: transactionsData.metrics || {},
            transactions: transactionsData.transactions || [],
            paymentSummary: transactionsData.paymentSummary || [],
            popularServices: servicesData
        };
        
        filteredTransactions = [...todaysData.transactions];
        
        // Actualizar UI
        updateMetricsDisplay();
        renderTransactions();
        updatePaymentMethodSummary();
        displayPopularServices();
        
        hideLoadingState();
        
    } catch (error) {
        console.error('Error cargando datos del día:', error);
        showErrorState('Error cargando datos del servidor');
    }
}

function showLoadingState() {
    // Mostrar loading en métricas
    ['totalRevenue', 'totalVehicles', 'completedServices', 'averageService'].forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.innerHTML = '<div class="animate-pulse bg-gray-200 h-6 rounded"></div>';
        }
    });
    
    // Mostrar loading en transacciones
    const transactionsBodyEl = document.getElementById('transactionsBody');
    if (transactionsBodyEl) {
        transactionsBodyEl.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-8">
                    <svg class="animate-spin h-6 w-6 text-blue-600 mx-auto mb-2" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p class="text-gray-600">Cargando transacciones del día...</p>
                </td>
            </tr>
        `;
    }
}

function hideLoadingState() {
    // La función updateMetricsDisplay y renderTransactions limpiarán el loading
}

function showErrorState(message) {
    const transactionsBodyEl = document.getElementById('transactionsBody');
    if (transactionsBodyEl) {
        transactionsBodyEl.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-8">
                    <svg class="text-red-400 mx-auto mb-3" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                    <p class="text-red-600 mb-2">${message}</p>
                    <button onclick="loadTodaysDataFromBackend()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Reintentar
                    </button>
                </td>
            </tr>
        `;
    }
}

function updateMetricsDisplay() {
    const metrics = todaysData.metrics;
    
    // Animar actualización de métricas
    animateNumber('totalRevenue', metrics.totalRevenue || 0, true);
    animateNumber('totalVehicles', metrics.totalVehicles || 0, false);
    animateNumber('completedServices', metrics.completedServices || 0, false);
    animateNumber('averageService', metrics.averageService || 0, true);
}

function animateNumber(elementId, targetValue, isCurrency) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const startValue = 0;
    const duration = 1000;
    const steps = 60;
    const stepValue = (targetValue - startValue) / steps;
    let currentValue = startValue;
    
    element.classList.add('transition-all', 'duration-300');
    
    const interval = setInterval(() => {
        currentValue += stepValue;
        if (currentValue >= targetValue) {
            currentValue = targetValue;
            clearInterval(interval);
        }
        
        const displayValue = Math.round(currentValue);
        element.textContent = isCurrency ? `$${formatCurrency(displayValue)}` : displayValue.toString();
    }, duration / steps);
}

function formatCurrency(value) {
    return new Intl.NumberFormat('es-CO').format(Number(value || 0));
}

function renderTransactions() {
    const tbody = document.getElementById('transactionsBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    let transactionsToShow = [...filteredTransactions];
    
    // Aplicar filtro
    if (currentFilter === 'completed') {
        transactionsToShow = transactionsToShow.filter(t => t.status === 'Completado');
    } else if (currentFilter === 'pending') {
        transactionsToShow = transactionsToShow.filter(t => t.status === 'En proceso');
    }
    
    if (transactionsToShow.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-8 text-gray-500">
                    <svg class="text-gray-300 mx-auto mb-3" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M12 1v6m0 6v6"/>
                        <path d="M1 12h6m6 0h6"/>
                    </svg>
                    <p>No hay transacciones para mostrar</p>
                </td>
            </tr>
        `;
        return;
    }
    
    transactionsToShow.forEach((transaction, index) => {
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200';
        row.style.animationDelay = `${index * 0.05}s`;
        
        const statusClass = transaction.status === 'Completado' 
            ? 'inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full' 
            : 'inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full';
        
        const servicesDisplay = transaction.services && transaction.services.length > 0
            ? transaction.services.map(service => 
                `<span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-1">${service}</span>`
              ).join('')
            : '<span class="text-gray-400 text-xs">Sin servicios</span>';
        
        row.innerHTML = `
            <td class="py-4 px-6 text-gray-700 font-medium">${transaction.time || 'N/A'}</td>
            <td class="py-4 px-6 font-medium">${transaction.plate}</td>
            <td class="py-4 px-6 text-gray-700">${transaction.owner}</td>
            <td class="py-4 px-6">
                <div class="flex flex-wrap gap-1">
                    ${servicesDisplay}
                </div>
            </td>
            <td class="py-4 px-6 text-gray-700">${getPaymentMethodIcon(transaction.payment)} ${transaction.payment}</td>
            <td class="py-4 px-6 font-semibold text-green-600">$${formatCurrency(transaction.total)}</td>
            <td class="py-4 px-6">
                <div class="flex justify-center">
                    <span class="${statusClass}">
                        ${transaction.status}
                    </span>
                </div>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    // Actualizar contadores de filtros
    updateFilterCounts();
}

function updateFilterCounts() {
    const allCount = filteredTransactions.length;
    const completedCount = filteredTransactions.filter(t => t.status === 'Completado').length;
    const pendingCount = filteredTransactions.filter(t => t.status === 'En proceso').length;
    
}

function getPaymentMethodIcon(paymentMethod) {
    const icons = {
        'Efectivo': '💵',
        'Tarjeta': '💳',
        'Transferencia': '🏦'
    };
    return icons[paymentMethod] || '💰';
}

function filterTransactions(filter) {
    currentFilter = filter;
    
    // Actualizar botones de filtro
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('bg-blue-600', 'text-white');
        btn.classList.add('border-gray-300', 'hover:bg-gray-50');
    });
    
    const activeBtn = document.getElementById(`filter-${filter}`);
    if (activeBtn) {
        activeBtn.classList.remove('border-gray-300', 'hover:bg-gray-50');
        activeBtn.classList.add('bg-blue-600', 'text-white');
    }
    
    // Animar salida y entrada
    const tbody = document.getElementById('transactionsBody');
    if (tbody) {
        tbody.style.opacity = '0.5';
        
        setTimeout(() => {
            renderTransactions();
            tbody.style.opacity = '1';
        }, 150);
    }
}

function updatePaymentMethodSummary() {
    const container = document.getElementById('paymentMethodSummary');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (todaysData.paymentSummary.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4 text-gray-500">
                <p>No hay datos de métodos de pago</p>
            </div>
        `;
        return;
    }
    
    const totalRevenue = todaysData.paymentSummary.reduce((sum, p) => sum + p.total, 0);
    
    todaysData.paymentSummary.forEach(payment => {
        const percentage = totalRevenue > 0 ? Math.round((payment.total / totalRevenue) * 100) : 0;
        const item = document.createElement('div');
        item.className = 'flex items-center justify-between p-3 border border-gray-200 rounded-lg';
        
        item.innerHTML = `
            <div class="flex items-center gap-3">
                <span class="text-2xl">${getPaymentMethodIcon(payment.method)}</span>
                <div>
                    <div class="font-medium text-gray-900">${payment.method}</div>
                    <div class="text-sm text-gray-600">${payment.count} transacciones</div>
                </div>
            </div>
            <div class="text-right">
                <div class="font-semibold text-gray-900">${formatCurrency(payment.total)}</div>
                <div class="text-sm text-gray-600">${percentage}%</div>
            </div>
        `;
        
        container.appendChild(item);
    });
    
    // Actualizar resumen de efectivo
    const cashPayment = todaysData.paymentSummary.find(p => p.method === 'Efectivo');
    const cashTotalEl = document.getElementById('cashTotal');
    const cashTransactionsEl = document.getElementById('cashTransactions');
    
    if (cashPayment) {
        if (cashTotalEl) cashTotalEl.textContent = `${formatCurrency(cashPayment.total)}`;
        if (cashTransactionsEl) cashTransactionsEl.textContent = `${cashPayment.count} transacciones`;
        simulateCashBreakdown(cashPayment.total);
    } else {
        if (cashTotalEl) cashTotalEl.textContent = '$0';
        if (cashTransactionsEl) cashTransactionsEl.textContent = '0 transacciones';
        simulateCashBreakdown(0);
    }
}

function displayPopularServices() {
    const container = document.getElementById('popularServices');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (todaysData.popularServices.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <svg class="text-gray-300 mx-auto mb-3" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 1v6m0 6v6"/>
                    <path d="M1 12h6m6 0h6"/>
                </svg>
                <p>No hay servicios registrados para hoy</p>
            </div>
        `;
        return;
    }
    
    const maxCount = Math.max(...todaysData.popularServices.map(s => s.count));
    
    todaysData.popularServices.forEach((service, index) => {
        const percentage = maxCount > 0 ? (service.count / maxCount) * 100 : 0;
        const item = document.createElement('div');
        item.className = 'mb-4';
        
        item.innerHTML = `
            <div class="flex justify-between items-center mb-2">
                <span class="font-medium text-gray-900">${service.name}</span>
                <div class="text-right">
                    <span class="font-semibold text-gray-700">${service.count} servicios</span>
                    <div class="text-sm text-green-600">${formatCurrency(service.totalRevenue || service.count * service.price)}</div>
                </div>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                <div class="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-1000 ease-out" 
                     style="width: ${percentage}%; animation-delay: ${index * 0.1}s;"></div>
            </div>
        `;
        
        container.appendChild(item);
    });
}

function simulateCashBreakdown(totalAmount) {
    const breakdown = calculateBillBreakdown(totalAmount);
    
    const bill50000El = document.getElementById('bill-50000');
    const bill20000El = document.getElementById('bill-20000');
    const bill10000El = document.getElementById('bill-10000');
    const bill5000El = document.getElementById('bill-5000');
    
    if (bill50000El) bill50000El.textContent = breakdown['50000'];
    if (bill20000El) bill20000El.textContent = breakdown['20000'];
    if (bill10000El) bill10000El.textContent = breakdown['10000'];
    if (bill5000El) bill5000El.textContent = breakdown['5000'];
}

function calculateBillBreakdown(totalAmount) {
    let remaining = totalAmount;
    const breakdown = {
        '50000': Math.floor(remaining / 50000),
        '20000': 0,
        '10000': 0,
        '5000': 0
    };
    
    remaining = remaining % 50000;
    breakdown['20000'] = Math.floor(remaining / 20000);
    
    remaining = remaining % 20000;
    breakdown['10000'] = Math.floor(remaining / 10000);
    
    remaining = remaining % 10000;
    breakdown['5000'] = Math.floor(remaining / 5000);
    
    return breakdown;
}

function printReport() {
    const printWindow = window.open('', '_blank');
    const currentDateEl = document.getElementById('currentDate');
    const currentDate = currentDateEl ? currentDateEl.textContent : 'No disponible';
    const metrics = todaysData.metrics;
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Reporte de Cierre - Quili Wash</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
                .summary { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; }
                .summary-item { padding: 15px; border: 1px solid #ddd; border-radius: 8px; background: #f9f9f9; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 12px; }
                th, td { padding: 8px; border: 1px solid #ddd; text-align: left; }
                th { background: #f5f5f5; font-weight: bold; }
                .total { font-weight: bold; color: #059669; font-size: 24px; }
                .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ddd; padding-top: 10px; }
                @media print { .no-print { display: none; } }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Quili Wash - Reporte de Cierre</h1>
                <p>${currentDate}</p>
            </div>
            
            <div class="summary">
                <div class="summary-item">
                    <h3>Total Recaudado</h3>
                    <p class="total">${formatCurrency(metrics.totalRevenue || 0)}</p>
                </div>
                <div class="summary-item">
                    <h3>Vehículos Atendidos</h3>
                    <p>${metrics.totalVehicles || 0}</p>
                </div>
                <div class="summary-item">
                    <h3>Servicios Completados</h3>
                    <p>${metrics.completedServices || 0}</p>
                </div>
                <div class="summary-item">
                    <h3>Promedio por Servicio</h3>
                    <p>${formatCurrency(metrics.averageService || 0)}</p>
                </div>
            </div>
            
            <h2>Detalle de Transacciones</h2>
            ${document.getElementById('transactionsTable') ? document.getElementById('transactionsTable').outerHTML : '<p>No hay transacciones disponibles</p>'}
            
            <div class="footer">
                <p>Reporte generado automáticamente el ${new Date().toLocaleString('es-CO')}</p>
                <p>Sistema de Gestión Quili Wash</p>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
        printWindow.print();
    }, 500);
}

// Exponer funciones globales para HTML
window.loadTodaysDataFromBackend = loadTodaysDataFromBackend;
window.filterTransactions = filterTransactions;
window.printReport = printReport;

})();