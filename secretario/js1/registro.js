(() => {

// Configuración de API
var API_BASE = window.API_BASE || 'http://localhost:3000/api';

window.API_BASE = API_BASE;

// Estado del formulario
let vehicleForm = {
  type: 'carro',
  plate: '',
  owner: '',
  phone: '',
  washerId: null,
  washer: '',
  services: [],
  discount: 0,
  total: 0
};

// Datos desde BD (con fallback)
let services = [];
let washers = [];

// ===== Helpers =====
const $ = id => document.getElementById(id);
const formatCurrency = n => new Intl.NumberFormat('es-CO').format(Number(n || 0));

// ===== Validaciones de Placa Colombiana =====
function validatePlate(value, type) {
  // Limpiar entrada: solo letras mayúsculas y números
  let cleanValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  if (type === 'moto') {
    // Moto: 3 letras + 2 números + 1 letra (ABC12D)
    cleanValue = cleanValue.slice(0, 6);
    const letters1 = cleanValue.replace(/[^A-Z]/g, '').slice(0, 3);
    const numbers = cleanValue.slice(letters1.length).replace(/[^0-9]/g, '').slice(0, 2);
    const letters2 = cleanValue.slice(letters1.length + numbers.length).replace(/[^A-Z]/g, '').slice(0, 1);
    return letters1 + numbers + letters2;
  } else {
    // Carro/Camioneta: 3 letras + 3 números (ABC123)
    cleanValue = cleanValue.slice(0, 6);
    const letters = cleanValue.replace(/[^A-Z]/g, '').slice(0, 3);
    const numbers = cleanValue.slice(letters.length).replace(/[^0-9]/g, '').slice(0, 3);
    return letters + numbers;
  }
}

function isValidPlate(value, type) {
  if (type === 'moto') {
    return /^[A-Z]{3}[0-9]{2}[A-Z]$/.test(value);
  } else {
    return /^[A-Z]{3}[0-9]{3}$/.test(value);
  }
}

// ===== Validaciones de Teléfono Colombiano =====
function validatePhone(value) {
  // Solo números, máximo 10 dígitos
  return value.replace(/\D/g, '').slice(0, 10);
}

function isValidColombianPhone(value) {
  // Debe ser exactamente 10 dígitos y empezar con 3
  return /^3[0-9]{9}$/.test(value);
}

// ===== Mensajes de validación visual =====
function showValidation(inputEl, isValid, successMsg, errorMsg) {
  const container = inputEl.parentElement;
  let msgEl = container.querySelector('.validation-message');
  
  // Remover mensaje anterior
  if (msgEl) msgEl.remove();
  
  // Remover clases de estado anterior
  inputEl.classList.remove('input-error', 'input-success');
  
  if (!inputEl.value) return;
  
  // Crear nuevo mensaje
  msgEl = document.createElement('div');
  msgEl.className = 'validation-message text-sm mt-1 flex items-center gap-1';
  
  if (isValid) {
    inputEl.classList.add('input-success');
    msgEl.classList.add('text-green-600');
    msgEl.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22,4 12,14.01 9,11.01"/>
      </svg>${successMsg}`;
  } else {
    inputEl.classList.add('input-error');
    msgEl.classList.add('text-red-600');
    msgEl.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>${errorMsg}`;
  }
  
  container.appendChild(msgEl);
}

// ===== Carga inicial =====
function initRegistro() {
  bindInputs();
  Promise.all([loadServices(), loadWashers()]).then(() => {
    renderServicesList();
    calculateTotal();
    validateForm();
  });
}

// Inicializar solo si los elementos existen (está en la sección correcta)
if (document.getElementById('plate')) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRegistro);
  } else {
    initRegistro();
  }
}

// ===== Carga de BD con fallback =====
async function loadServices() {
  try {
    const res = await fetch(`${API_BASE}/services`);
    if (!res.ok) throw new Error('Error al cargar servicios');
    
    const allServices = await res.json();
    // Filtrar solo los servicios activos
    services = allServices.filter(s => s.active === 1);
    
    console.log('Servicios activos cargados:', services);
  } catch (error) {
    console.warn('Error al cargar servicios desde API, usando fallback:', error);
    services = [
      { id: 1, name: 'Lavado Básico', price: 15000, duration: 30, active: 1 },
      { id: 2, name: 'Lavado Completo', price: 25000, duration: 60, active: 1 },
      { id: 3, name: 'Encerado', price: 35000, duration: 90, active: 1 },
      { id: 4, name: 'Aspirado Interior', price: 12000, duration: 20, active: 1 },
      { id: 5, name: 'Lavado de Motor', price: 20000, duration: 45, active: 1 },
      { id: 6, name: 'Polichado Especial', price: 50000, duration: 120, active: 1 }
    ];
  }
}

async function loadWashers() {
  try {
    const res = await fetch(`${API_BASE}/washers`);
    if (!res.ok) throw new Error('Error al cargar lavadores');
    washers = await res.json();
  } catch (error) {
    console.warn('Error al cargar lavadores desde API, usando fallback:', error);
    washers = [
      { id: 1, name: 'Juan Pérez' },
      { id: 2, name: 'María López' }
    ];
  }
  
  // Poblar el select de lavadores
  const sel = $('washer');
  if (sel) {
    sel.innerHTML = '<option value="">Seleccionar lavador</option>';
    washers.forEach(w => {
      const opt = document.createElement('option');
      opt.value = w.id;
      opt.textContent = w.name;
      sel.appendChild(opt);
    });
  }
}

// ===== Render servicios dinámicamente =====
function renderServicesList() {
  const container = $('servicesContainer');
  if (!container) {
    console.error('Container de servicios no encontrado');
    return;
  }

  // Limpiar contenedor
  container.innerHTML = '';

  if (services.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center py-4">No hay servicios disponibles</p>';
    return;
  }

  // Crear elementos dinámicamente
  services.forEach(service => {
    const item = document.createElement('div');
    item.className = 'service-item flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-all duration-200';
    item.setAttribute('data-service-id', service.id);
    
    item.innerHTML = `
      <div class="flex items-center gap-3">
        <input
          type="checkbox"
          id="service-${service.id}"
          class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          data-service-id="${service.id}"
          data-precio="${service.price}"
          data-duracion="${service.duration}"
        />
        <label for="service-${service.id}" class="font-medium text-gray-900 cursor-pointer">
          ${service.name}
        </label>
      </div>
      <div class="text-right">
        <p class="font-semibold text-green-600">$${formatCurrency(service.price)}</p>
        <p class="text-sm text-gray-500">${service.duration} min</p>
      </div>
    `;
    
    container.appendChild(item);
  });

  // Agregar eventos a los checkboxes y filas
  services.forEach(service => {
    const checkbox = $(`service-${service.id}`);
    const row = checkbox ? checkbox.closest('.service-item') : null;
    
    if (checkbox) {
      checkbox.addEventListener('change', () => toggleService(service.id));
      
      // Hacer toda la fila clickeable (excepto el checkbox y label)
      if (row) {
        row.addEventListener('click', (event) => {
          if (event.target !== checkbox && event.target.tagName.toLowerCase() !== 'label') {
            checkbox.checked = !checkbox.checked;
            toggleService(service.id);
          }
        });
      }
    }
  });
}

// ===== Eventos de inputs =====
function bindInputs() {
  // Ayuda visual para formato de placa
  const plateHelpId = 'plateHelpInfo';
  const plateInput = $('plate');
  if (plateInput && !$(plateHelpId)) {
    const help = document.createElement('div');
    help.id = plateHelpId;
    help.className = 'text-xs text-gray-600 mt-1';
    plateInput.parentElement.appendChild(help);
  }
  
  function updatePlateHelp() {
    const helpEl = $(plateHelpId);
    const typeEl = $('type');
    if (helpEl && typeEl) {
      helpEl.textContent = 
        typeEl.value === 'moto' 
          ? 'Formato moto: LLLNNL (3 letras, 2 números, 1 letra). Máx 6 caracteres.'
          : 'Formato carro/camioneta: LLLNNN (3 letras, 3 números). Máx 6 caracteres.';
    }
  }
  updatePlateHelp();

  // Cambio de tipo de vehículo
  const typeEl = $('type');
  if (typeEl) {
    typeEl.addEventListener('change', () => {
      vehicleForm.type = typeEl.value;
      const plateEl = $('plate');
      if (plateEl) {
        plateEl.value = '';
        vehicleForm.plate = '';
        showValidation(plateEl, false, '', '');
      }
      updatePlateHelp();
      validateForm();
    });
  }

  // Validación de placa
  if (plateInput) {
    plateInput.addEventListener('input', (e) => {
      const typeEl = $('type');
      if (typeEl) {
        const validatedPlate = validatePlate(e.target.value, typeEl.value);
        e.target.value = validatedPlate;
        vehicleForm.plate = validatedPlate;
        
        const isValid = isValidPlate(validatedPlate, typeEl.value);
        const errorMsg = typeEl.value === 'moto' 
          ? 'Moto: LLLNNL (ej: ABC12D)'
          : 'Carro/Camioneta: LLLNNN (ej: ABC123)';
        
        showValidation(e.target, isValid, 'Placa válida', errorMsg);
        validateForm();
      }
    });
  }

  const ownerEl = $('owner');
  if (ownerEl) {
    ownerEl.addEventListener('input', (e) => {
      vehicleForm.owner = e.target.value.trim();
      validateForm();
    });
  }

  // Validación de teléfono
  const phoneEl = $('phone');
  if (phoneEl) {
    phoneEl.addEventListener('input', (e) => {
      const validatedPhone = validatePhone(e.target.value);
      e.target.value = validatedPhone;
      vehicleForm.phone = validatedPhone;
      
      const isValid = isValidColombianPhone(validatedPhone);
      showValidation(
        e.target, 
        isValid, 
        'Celular válido (10 dígitos, inicia en 3)',
        'Formato: 10 dígitos y debe empezar con 3 (ej: 3001234567)'
      );
      validateForm();
    });
  }

  const washerEl = $('washer');
  if (washerEl) {
    washerEl.addEventListener('change', (e) => {
      vehicleForm.washerId = e.target.value ? Number(e.target.value) : null;
      vehicleForm.washer = e.target.value ? e.target.options[e.target.selectedIndex].text : '';
    });
  }

  const discountEl = $('discount');
  if (discountEl) {
    discountEl.addEventListener('input', (e) => {
      let v = Number(e.target.value || 0);
      if (isNaN(v) || v < 0) v = 0;
      e.target.value = v;
      vehicleForm.discount = v;
      calculateTotal();
      validateForm();
    });
  }
}

// ===== Servicios / totales =====
function toggleService(serviceId) {
  const checkbox = $(`service-${serviceId}`);
  const row = checkbox ? checkbox.closest('.service-item') : null;
  const index = vehicleForm.services.indexOf(serviceId);
  
  if (checkbox && checkbox.checked && index === -1) {
    vehicleForm.services.push(serviceId);
  }
  
  if (checkbox && !checkbox.checked && index !== -1) {
    vehicleForm.services.splice(index, 1);
  }
  
  if (row) {
    row.classList.toggle('selected', checkbox.checked);
  }
  
  calculateTotal();
  validateForm();
}

function calculateTotal() {
  const sum = vehicleForm.services.reduce((acc, serviceId) => {
    const service = services.find(s => s.id === serviceId);
    return acc + (service ? Number(service.price) : 0);
  }, 0);
  
  const discount = Math.min(Math.max(Number(vehicleForm.discount) || 0, 0), sum);
  vehicleForm.total = sum - discount;
  
  const totalEl = $('total');
  if (totalEl) {
    totalEl.textContent = `$${formatCurrency(vehicleForm.total)}`;
  }
}

// ===== Habilitar botón pago solo si todo válido =====
function validateForm() {
  const plateEl = $('plate');
  const ownerEl = $('owner');
  const phoneEl = $('phone');
  const typeEl = $('type');
  const payBtnEl = $('payBtn');
  
  if (!plateEl || !ownerEl || !phoneEl || !typeEl || !payBtnEl) return;
  
  const plateOk = isValidPlate(plateEl.value, typeEl.value);
  const ownerOk = !!ownerEl.value.trim();
  const phoneOk = isValidColombianPhone(phoneEl.value);
  const servicesOk = vehicleForm.services.length > 0;

  payBtnEl.disabled = !(plateOk && ownerOk && phoneOk && servicesOk);
}

// ===== Modal Pago =====
function openPaymentModal() {
  const selectedServices = vehicleForm.services.map(id => services.find(s => s.id === id)).filter(Boolean);
  const subtotal = selectedServices.reduce((sum, service) => sum + service.price, 0);
  const box = $('paymentSummary');
  
  if (box) {
    box.innerHTML = `
      ${selectedServices.map(s => `
        <div class="flex justify-between">
          <span>${s.name}</span>
          <span>$${formatCurrency(s.price)}</span>
        </div>
      `).join('')}
      <div class="border-t mt-2 pt-2 flex justify-between">
        <span>Subtotal</span>
        <span>$${formatCurrency(subtotal)}</span>
      </div>
      ${vehicleForm.discount > 0 ? `
        <div class="flex justify-between text-red-600">
          <span>Descuento</span>
          <span>-$${formatCurrency(vehicleForm.discount)}</span>
        </div>
      ` : ''}
      <div class="border-t mt-2 pt-2 flex justify-between font-semibold text-green-600">
        <span>Total</span>
        <span>$${formatCurrency(vehicleForm.total)}</span>
      </div>
    `;
  }
  
  const modalEl = $('paymentModal');
  if (modalEl) {
    modalEl.classList.remove('hidden');
  }
}

function closePaymentModal() {
  const modalEl = $('paymentModal');
  if (modalEl) {
    modalEl.classList.add('hidden');
  }
}

// ===== Confirmar pago → guarda en BD =====
async function confirmPayment() {
  const paymentMethodEl = $('paymentMethod');
  const plateEl = $('plate');
  const typeEl = $('type');
  const ownerEl = $('owner');
  const phoneEl = $('phone');
  const washerEl = $('washer');
  
  if (!paymentMethodEl || !plateEl || !typeEl || !ownerEl || !phoneEl || !washerEl) return;

  const payload = {
    plate: plateEl.value,
    type: typeEl.value,
    owner: ownerEl.value.trim(),
    phone: `+57${phoneEl.value}`,
    washer_id: washerEl.value || null,
    services: vehicleForm.services,
    discount: vehicleForm.discount,
    total: vehicleForm.total,
    payment_method: paymentMethodEl.value
  };

  const btn = document.querySelector('#paymentModal button[onclick="confirmPayment()"]');
  if (!btn) return;
  
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `
    <svg class="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg> Procesando...
  `;

  try {
    const response = await fetch(`${API_BASE}/vehicles/register-complete`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data?.error || 'Error al registrar vehículo');
    }

    toast('¡Vehículo y pago registrados exitosamente!', 'success');
    clearForm();
    closePaymentModal();
    
    // Actualizar vista de reportes si está disponible
    if (window.loadSection) {
      window.loadSection('reports');
    }
  } catch (error) {
    console.error('Error al confirmar pago:', error);
    toast(error.message || 'Error de conexión con el servidor', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}

// ===== Utilitarios =====
function clearForm() {
  // Limpiar campos de texto
  ['plate', 'owner', 'phone'].forEach(id => { 
    const el = $(id);
    if (el) {
      el.value = '';
    }
  });
  
 
  // Resetear selects
  const typeEl = $('type');
  const washerEl = $('washer');
  if (typeEl) typeEl.value = 'carro';
  if (washerEl) washerEl.value = '';
  
  // Resetear estado del formulario
  vehicleForm = {
    type: 'carro',
    plate: '',
    owner: '',
    phone: '',
    washerId: null,
    washer: '',
    services: [],
    discount: 0,
    total: 0
  };
  
  // Desmarcar todos los servicios
  services.forEach(service => {
    const checkbox = $(`service-${service.id}`);
    if (checkbox) {
      checkbox.checked = false;
    }
  });
  
  // Remover clase 'selected' de todas las filas de servicios
  document.querySelectorAll('.service-item').forEach(row => {
    row.classList.remove('selected');
  });
  
  // Limpiar validaciones visuales
  ['plate', 'phone'].forEach(id => {
    const el = $(id); 
    if (el) {
      el.classList.remove('input-error', 'input-success');
      const validationMsg = el.parentElement.querySelector('.validation-message'); 
      if (validationMsg) validationMsg.remove();
    }
  });
  
  calculateTotal();
  validateForm();
}

function toast(text, type = 'info') {
  const toastEl = document.createElement('div');
  toastEl.className = `fixed top-20 right-6 z-[9999] px-4 py-3 rounded-lg shadow-lg text-white ${
    type === 'success' ? 'bg-green-600' : 
    type === 'error' ? 'bg-red-600' : 
    'bg-gray-800'
  }`;
  toastEl.textContent = text; 
  document.body.appendChild(toastEl); 
  
  setTimeout(() => {
    if (toastEl.parentNode) {
      toastEl.remove();
    }
  }, 3000);
}

// ===== Modal OCR (funciones para compatibilidad con HTML) =====
function openOCRModal() {
  const modalEl = $('ocrModal');
  if (modalEl) {
    modalEl.classList.remove('hidden');
  }
}

function closeOCRModal() {
  const modalEl = $('ocrModal');
  if (modalEl) {
    modalEl.classList.add('hidden');
  }
}

function simulateOCR() {
  // Simulación básica de OCR con placas de ejemplo
  const mockPlates = ['ABC123', 'DEF456', 'GHI789', 'JKL12A', 'MNO34B', 'PQR56C'];
  const randomPlate = mockPlates[Math.floor(Math.random() * mockPlates.length)];
  
  const plateEl = $('plate');
  const typeEl = $('type');
  
  if (plateEl && typeEl) {
    plateEl.value = randomPlate;
    vehicleForm.plate = randomPlate;
    
    // Validar la placa detectada
    const isValid = isValidPlate(randomPlate, typeEl.value);
    const errorMsg = typeEl.value === 'moto' 
      ? 'Moto: LLLNNL (ej: ABC12D)'
      : 'Carro/Camioneta: LLLNNN (ej: ABC123)';
    
    showValidation(plateEl, isValid, 'Placa detectada por OCR', errorMsg);
    validateForm();
    closeOCRModal();
    
    toast('Placa detectada automáticamente', 'success');
  }
}

// ===== Exponer funciones globales para uso en HTML =====
window.openPaymentModal = openPaymentModal;
window.closePaymentModal = closePaymentModal;
window.confirmPayment = confirmPayment;
window.clearForm = clearForm;
window.toggleService = toggleService;
window.openOCRModal = openOCRModal;
window.closeOCRModal = closeOCRModal;
window.simulateOCR = simulateOCR;

})();