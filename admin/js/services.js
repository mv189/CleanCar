// admin/js/services.js
var API_BASE = window.API_BASE || 'http://localhost:3000/api';

// Función para mostrar notificaciones toast
function showToast(message, type = 'success') {
    const toast = document.createElement('div');

    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <div class="flex items-center gap-3">
            <span class="font-medium">${message}</span>
        </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 100);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}

document.addEventListener('DOMContentLoaded', function() {
    const grid = document.querySelector('.services-grid');
    const newServiceBtn = document.querySelector('.new-service-btn');
    let services = [];

    // Variables globales del modal de servicio
    const serviceModal = document.getElementById('serviceModal');
    const serviceForm = document.getElementById('serviceForm');
    const serviceModalTitle = document.getElementById('serviceModalTitle');
    const serviceName = document.getElementById('serviceName');
    const servicePrice = document.getElementById('servicePrice');
    const serviceDuration = document.getElementById('serviceDuration');
    const cancelServiceBtn = document.getElementById('cancelServiceBtn');

    let editingServiceId = null;

    // Modal de eliminación
    const deleteServiceModal = document.getElementById('deleteServiceModal');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    let serviceToDelete = null;

    // Obtener servicios reales del backend
    async function fetchServices() {
        const res = await fetch(`${API_BASE}/services`);
        services = await res.json();
        renderServices();
    }

    // Formatear precio
    function formatPrice(price) {
        return '$' + Number(price).toLocaleString('es-CO');
    }

    // Renderizar tarjetas
    function renderServices() {
        grid.innerHTML = '';
        services.forEach(s => {
            const card = document.createElement('div');
            card.className = 'service-card';
            card.dataset.serviceId = s.id;

            card.innerHTML = `
                <div class="service-header">
                    <h3>${s.name}</h3>
                    <span class="status-badge ${s.active ? 'active' : 'inactive'}">
                        ${s.active ? 'Activo' : 'Inactivo'}
                    </span>
                </div>
                <div class="service-details">
                    <div class="detail-row">
                        <span class="detail-label">Precio</span>
                        <span class="detail-value price">${formatPrice(s.price)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Duración</span>
                        <span class="detail-value">${s.duration} min</span>
                    </div>
                </div>
                <div class="service-actions">
                    <button class="edit-btn">Editar</button>
                    <button class="power-btn">${s.active ? 'Desactivar' : 'Activar'}</button>
                    <button class="delete-btn" style="color:red">Eliminar</button>
                </div>
            `;

            // Eventos
            card.querySelector('.edit-btn').addEventListener('click', () => editService(s));
            card.querySelector('.power-btn').addEventListener('click', () => toggleActive(s));
            card.querySelector('.delete-btn').addEventListener('click', () => confirmDeleteService(s.id));

            grid.appendChild(card);
        });
    }

    // Abrir modal nuevo servicio
    newServiceBtn.addEventListener('click', () => {
        editingServiceId = null;
        serviceModalTitle.textContent = 'Nuevo Servicio';
        serviceForm.reset();
        serviceModal.classList.remove('hidden');
    });

    // Cerrar modal
    cancelServiceBtn.addEventListener('click', () => {
        serviceModal.classList.add('hidden');
    });

    // Enviar formulario (crear/editar)
    serviceForm.addEventListener('submit', async e => {
        e.preventDefault();

        const name = serviceName.value.trim();
        const price = parseFloat(servicePrice.value);
        const duration = parseInt(serviceDuration.value);

        if (!name || isNaN(price) || isNaN(duration)) {
            alert('Completa todos los campos correctamente.');
            return;
        }

        const payload = { name, price, duration, active: 1 };
        const method = editingServiceId ? 'PUT' : 'POST';
        const url = editingServiceId
            ? `${API_BASE}/services/${editingServiceId}`
            : `${API_BASE}/services`;

        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        serviceModal.classList.add('hidden');
        fetchServices();

        showToast(
            editingServiceId ? 'Servicio actualizado correctamente' : 'Servicio creado correctamente',
            'success'
        );
    });

    // Editar servicio (abre el modal)
    async function editService(s) {
        editingServiceId = s.id;
        serviceModalTitle.textContent = 'Editar Servicio';
        serviceName.value = s.name;
        servicePrice.value = s.price;
        serviceDuration.value = s.duration;
        serviceModal.classList.remove('hidden');
    }

    // Activar / desactivar servicio
    async function toggleActive(s) {
        await fetch(`${API_BASE}/services/${s.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...s, active: s.active ? 0 : 1 })
        });
        fetchServices();
    }

    // Mostrar modal de confirmación
    function confirmDeleteService(serviceId) {
        serviceToDelete = serviceId;
        deleteServiceModal.classList.remove('hidden');
    }

    // Cancelar eliminación
    cancelDeleteBtn.addEventListener('click', () => {
        deleteServiceModal.classList.add('hidden');
        serviceToDelete = null;
    });

    // Confirmar eliminación
    confirmDeleteBtn.addEventListener('click', async () => {
        if (!serviceToDelete) return;

        try {
            await fetch(`${API_BASE}/services/${serviceToDelete}`, {
                method: 'DELETE'
            });

            deleteServiceModal.classList.add('hidden');
            fetchServices();

            showToast('Servicio eliminado correctamente', 'success');

        } catch (error) {
            console.error('Error al eliminar servicio:', error);
            showToast('Error al eliminar servicio', 'error');
        } finally {
            serviceToDelete = null;
        }
    });

    fetchServices();
});