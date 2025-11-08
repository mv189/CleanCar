// washers.js
var API_BASE = window.API_BASE || 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', function() {
    let washers = [];
    let editingWasherId = null;

    // --- Modal de confirmación reutilizable ---
    const confirmModal = document.getElementById('confirmModal');
    const confirmTitle = document.getElementById('confirmTitle');
    const confirmMessage = document.getElementById('confirmMessage');
    const cancelConfirm = document.getElementById('cancelConfirm');
    const acceptConfirm = document.getElementById('acceptConfirm');

    function showConfirm(title, message, onConfirm) {
        confirmTitle.textContent = title;
        confirmMessage.textContent = message;
        confirmModal.classList.remove('hidden');

        // Cerrar modal
        cancelConfirm.onclick = () => confirmModal.classList.add('hidden');
        acceptConfirm.onclick = () => {
            confirmModal.classList.add('hidden');
            onConfirm?.(); // ejecutar acción si se acepta
        };
    }

    // Referencias DOM
    const searchInput = document.querySelector('.search-input');
    const statusFilter = document.querySelector('.status-filter');
    const newWasherBtn = document.querySelector('.new-washer-btn');
    const tableBody = document.querySelector('#washersTableBody');
    const washerModal = document.getElementById('washerModal');
    const washerForm = document.getElementById('washerForm');
    const modalTitle = document.getElementById('modalTitle');
    const washerNameInput = document.getElementById('washerName');

    // Cargar lavadores desde la API
    async function fetchWashers() {
        try {
            const response = await fetch(`${API_BASE}/washers`);

            if (!response.ok) throw new Error('Error al cargar lavadores');
            washers = await response.json();
            renderWashers();
        } catch (error) {
            console.error('Error:', error);
            showToast('Error al cargar lavadores', 'error');
        }
    }

    // Función para renderizar lavadores en la tabla
    function renderWashers(washersToRender = washers) {
        if (!tableBody) return;

        tableBody.innerHTML = '';
        
        if (washersToRender.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6">
                        <div class="empty-state">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                            </svg>
                            <h3>No hay lavadores registrados</h3>
                            <p>Crea tu primer lavador usando el botón "Nuevo Lavador"</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        washersToRender.forEach(washer => {
            const row = document.createElement('tr');
            const status = washer.active === 1 ? 'active' : 'inactive';
            const statusText = washer.active === 1 ? 'Activo' : 'Inactivo';
            const vehiclesWashed = washer.vehicles_washed || 0;
            
            row.innerHTML = `
                <td>
                    <div class="washer-id">#${washer.id}</div>
                </td>
                <td>
                    <div class="washer-info">
                        <p class="washer-name">${washer.name}</p>
                    </div>
                </td>
                <td>
                    <span class="status-badge ${status}">${statusText}</span>
                </td>
                <td>
                    <span class="stats-badge">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            <path d="M7 17v5"/>
                            <path d="M17 17v5"/>
                        </svg>
                        ${vehiclesWashed} vehículos
                    </span>
                </td>
                <td class="date">${formatDate(washer.created_at)}</td>
                <td>
                    <div class="actions">
                        <button class="action-btn edit" onclick="editWasher(${washer.id})" title="Editar">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="action-btn ${status === 'active' ? 'deactivate' : 'activate'}" 
                                onclick="toggleWasherStatus(${washer.id})" 
                                title="${status === 'active' ? 'Desactivar' : 'Activar'}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="3"/>
                                <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
                            </svg>
                        </button>
                        <button class="action-btn delete" onclick="deleteWasher(${washer.id})" title="Eliminar">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Formatear fecha
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    // Función para filtrar lavadores
    function filterWashers() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const statusFilterValue = statusFilter ? statusFilter.value : '';
        
        const filtered = washers.filter(washer => {
            const matchesSearch = washer.name.toLowerCase().includes(searchTerm);
            
            let matchesStatus = true;
            if (statusFilterValue === 'Activo') {
                matchesStatus = washer.active === 1;
            } else if (statusFilterValue === 'Inactivo') {
                matchesStatus = washer.active === 0;
            }
            
            return matchesSearch && matchesStatus;
        });
        
        renderWashers(filtered);
    }

    // Abrir modal para crear nuevo lavador
    function openNewWasherModal() {
        editingWasherId = null;
        modalTitle.textContent = 'Nuevo Lavador';
        washerNameInput.value = '';
        washerModal.classList.remove('hidden');
    }

    // Cerrar modal
    window.closeWasherModal = function() {
        washerModal.classList.add('hidden');
        editingWasherId = null;
        washerForm.reset();
    };

    // Guardar lavador (crear o editar)
    washerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = washerNameInput.value.trim();
        
        if (!name) {
            showToast('El nombre es obligatorio', 'error');
            return;
        }

        try {
            let response;
            
            if (editingWasherId) {
                // Editar lavador existente
                response = await fetch(`${API_BASE}/washers/${editingWasherId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name })
                });
            } else {
                // Crear nuevo lavador
                response = await fetch(`${API_BASE}/washers`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name })
                });
            }

            if (!response.ok) throw new Error('Error al guardar lavador');
            
            showToast(editingWasherId ? 'Lavador actualizado correctamente' : 'Lavador creado correctamente', 'success');
            closeWasherModal();
            fetchWashers();
        } catch (error) {
            console.error('Error:', error);
            showToast('Error al guardar lavador', 'error');
        }
    });

    // Editar lavador
    window.editWasher = async function(washerId) {
        const washer = washers.find(w => w.id === washerId);
        if (!washer) return;
        
        editingWasherId = washerId;
        modalTitle.textContent = 'Editar Lavador';
        washerNameInput.value = washer.name;
        washerModal.classList.remove('hidden');
    };

    // Activar/Desactivar lavador
    window.toggleWasherStatus = async function(washerId) {
        const washer = washers.find(w => w.id === washerId);
        if (!washer) return;
        
        const newStatus = washer.active === 1 ? 0 : 1;
        const action = newStatus === 1 ? 'activar' : 'desactivar';
        
        showConfirm(
            `¿${action === 'activar' ? 'Activar' : 'Desactivar'} lavador?`,
            `¿Deseas ${action} a ${washer.name}?`,
            async () => {
                try {
                    const response = await fetch(`${API_BASE}/washers/${washerId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: washer.name,
                            active: newStatus
                        })
                    });

                    if (!response.ok) throw new Error('Error al cambiar estado');

                    showToast(`Lavador ${action === 'activar' ? 'activado' : 'desactivado'} correctamente`, 'success');
                    fetchWashers();
                } catch (error) {
                    console.error('Error:', error);
                    showToast('Error al cambiar estado del lavador', 'error');
                }
            }
        );
    };

    // Eliminar lavador
    window.deleteWasher = async function(washerId) {
        const washer = washers.find(w => w.id === washerId);
        if (!washer) return;
        
        showConfirm(
            '¿Eliminar lavador?',
            `¿Seguro que deseas eliminar a ${washer.name}? Esta acción no se puede deshacer.`,
            async () => {
                try {
                    const response = await fetch(`${API_BASE}/washers/${washerId}`, { method: 'DELETE' });
                    if (!response.ok) throw new Error('Error al eliminar lavador');
                    showToast('Lavador eliminado correctamente', 'success');
                    fetchWashers();
                } catch (error) {
                    console.error('Error:', error);
                    showToast('Error al eliminar lavador', 'error');
                }
            }
        );
    };

    // Mostrar notificación toast
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Event listeners
    if (searchInput) {
        searchInput.addEventListener('input', filterWashers);
    }

    if (statusFilter) {
        statusFilter.addEventListener('change', filterWashers);
    }

    if (newWasherBtn) {
        newWasherBtn.addEventListener('click', openNewWasherModal);
    }

    // Cerrar modal al hacer clic fuera
    washerModal.addEventListener('click', function(e) {
        if (e.target === washerModal) {
            closeWasherModal();
        }
    });

    // Inicializar
    fetchWashers();
    
    console.log('Módulo de lavadores inicializado correctamente');
});