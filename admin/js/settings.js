// js/configuracion.js

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar iconos de Lucide
    lucide.createIcons();

    // Configuración de métodos de pago
    const paymentToggles = document.querySelectorAll('.payment-toggle');
    
    paymentToggles.forEach(toggle => {
        toggle.addEventListener('change', function() {
            const method = this.closest('.flex').querySelector('span').textContent;
            console.log(`Método de pago "${method}" ${this.checked ? 'activado' : 'desactivado'}`);
            
            // Mostrar notificación visual
            showNotification(
                `${method} ${this.checked ? 'activado' : 'desactivado'}`,
                this.checked ? 'success' : 'info'
            );
        });
    });

    // Botones de backup
    const manualBackupBtn = document.getElementById('manual-backup');
    const configBackupBtn = document.getElementById('config-backup');

    manualBackupBtn.addEventListener('click', function() {
        this.disabled = true;
        this.textContent = 'Creando backup...';
        
        // Simular proceso de backup
        setTimeout(() => {
            this.disabled = false;
            this.textContent = 'Crear Backup Manual';
            showNotification('Backup manual creado exitosamente', 'success');
            updateBackupStatus();
        }, 3000);
    });

    configBackupBtn.addEventListener('click', function() {
        showBackupConfigModal();
    });

    // Botones de edición de horarios
    const editButtons = document.querySelectorAll('[data-lucide="edit-3"]');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const scheduleText = this.closest('.flex').querySelector('span');
            editSchedule(scheduleText);
        });
    });

    // Validación de formularios
    const inputs = document.querySelectorAll('input[type="text"], input[type="tel"]');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateInput(this);
        });
        
        input.addEventListener('input', function() {
            clearValidation(this);
        });
    });
});

// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animación de entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
    }, 100);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Función para editar horarios
function editSchedule(scheduleElement) {
    const currentText = scheduleElement.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.className = 'px-2 py-1 border border-gray-300 rounded text-sm';
    
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Guardar';
    saveBtn.className = 'ml-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.className = 'ml-1 px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400';
    
    const container = scheduleElement.parentNode;
    container.innerHTML = '';
    container.appendChild(input);
    container.appendChild(saveBtn);
    container.appendChild(cancelBtn);
    
    input.focus();
    input.select();
    
    saveBtn.addEventListener('click', () => {
        scheduleElement.textContent = input.value;
        restoreScheduleDisplay(container, scheduleElement);
        showNotification('Horario actualizado correctamente', 'success');
    });
    
    cancelBtn.addEventListener('click', () => {
        scheduleElement.textContent = currentText;
        restoreScheduleDisplay(container, scheduleElement);
    });
    
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveBtn.click();
        } else if (e.key === 'Escape') {
            cancelBtn.click();
        }
    });
}

// Función para restaurar display de horario
function restoreScheduleDisplay(container, scheduleElement) {
    container.innerHTML = '';
    container.appendChild(scheduleElement);
    
    const editBtn = document.createElement('button');
    editBtn.className = 'text-blue-600 hover:text-blue-800';
    editBtn.innerHTML = '<i data-lucide="edit-3" class="w-4 h-4"></i>';
    editBtn.addEventListener('click', () => editSchedule(scheduleElement));
    
    container.appendChild(editBtn);
    lucide.createIcons();
}

// Función para mostrar modal de configuración de backup
function showBackupConfigModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    
    modal.innerHTML = `
        <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 class="text-lg font-semibold mb-4">Configurar Auto-backup</h3>
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Frecuencia</label>
                    <select class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                        <option value="daily">Diario</option>
                        <option value="weekly" selected>Semanal</option>
                        <option value="monthly">Mensual</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Hora</label>
                    <input type="time" value="03:00" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
                </div>
                <div class="flex items-center">
                    <input type="checkbox" id="email-notifications" checked class="mr-2">
                    <label for="email-notifications" class="text-sm text-gray-700">Enviar notificaciones por email</label>
                </div>
            </div>
            <div class="flex gap-3 mt-6">
                <button class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onclick="saveBackupConfig()">
                    Guardar
                </button>
                <button class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50" onclick="closeBackupModal()">
                    Cancelar
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    window.currentModal = modal;
    
    // Cerrar modal al hacer click fuera
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeBackupModal();
        }
    });
}

// Función para cerrar modal de backup
function closeBackupModal() {
    if (window.currentModal) {
        document.body.removeChild(window.currentModal);
        window.currentModal = null;
    }
}

// Función para guardar configuración de backup
function saveBackupConfig() {
    showNotification('Configuración de auto-backup guardada', 'success');
    closeBackupModal();
}

// Función para actualizar estado de backup
function updateBackupStatus() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    const statusElement = document.querySelector('.backup-status .font-medium');
    if (statusElement) {
        statusElement.textContent = `Último backup: Hoy ${timeString}`;
    }
}

// Función para validar inputs
function validateInput(input) {
    const value = input.value.trim();
    
    if (input.type === 'tel') {
        const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
        if (!phoneRegex.test(value)) {
            showInputError(input, 'Por favor ingrese un número de teléfono válido');
            return false;
        }
    }
    
    if (input.type === 'text' && value.length < 3) {
        showInputError(input, 'Este campo debe tener al menos 3 caracteres');
        return false;
    }
    
    clearValidation(input);
    return true;
}

// Función para mostrar error en input
function showInputError(input, message) {
    clearValidation(input);
    
    input.classList.add('border-red-500');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'text-red-500 text-sm mt-1 input-error';
    errorDiv.textContent = message;
    
    input.parentNode.appendChild(errorDiv);
}

// Función para limpiar validación
function clearValidation(input) {
    input.classList.remove('border-red-500');
    
    const errorElement = input.parentNode.querySelector('.input-error');
    if (errorElement) {
        errorElement.remove();
    }
}

// Función para guardar configuración general
function saveGeneralConfig() {
    const businessName = document.querySelector('input[value="AutoLavado Premium"]').value;
    const address = document.querySelector('input[value*="Calle"]').value;
    const phone = document.querySelector('input[type="tel"]').value;
    
    // Validar todos los inputs
    const inputs = document.querySelectorAll('input[type="text"], input[type="tel"]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateInput(input)) {
            isValid = false;
        }
    });
    
    if (isValid) {
        // Simular guardado
        setTimeout(() => {
            showNotification('Configuración guardada correctamente', 'success');
        }, 500);
    } else {
        showNotification('Por favor corrija los errores antes de guardar', 'error');
    }
}

// Exponer funciones globalmente para uso en HTML
window.closeBackupModal = closeBackupModal;
window.saveBackupConfig = saveBackupConfig;
window.saveGeneralConfig = saveGeneralConfig;