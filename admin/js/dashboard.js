var API_BASE = window.API_BASE || 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', function() {
    // Función para cargar estadísticas del dashboard
    async function cargarDashboard() {
        try {
            const res = await fetch(`${API_BASE}/stats/dashboard`);
            const data = await res.json();

            document.getElementById('ingresosHoy').textContent =
                '$' + Number(data.ingresosHoy).toLocaleString('es-CO');

            document.getElementById('vehiculosHoy').textContent =
                Number(data.vehiculosHoy).toLocaleString('es-CO');

            document.getElementById('serviciosHoy').textContent =
                Number(data.serviciosHoy).toLocaleString('es-CO');

            document.getElementById('promedio').textContent =
                '$' + Math.round(Number(data.promedio)).toLocaleString('es-CO');

        } catch (err) {
            console.error('Error cargando estadísticas:', err);
        }
    }

    // Llamar al cargar y cada 10 segundos
    cargarDashboard();
    setInterval(cargarDashboard, 10000);

    // Datos para las gráficas (datos estáticos como ejemplo)
    const dailyRevenue = [
        { day: 'Lun', revenue: 450000, services: 18 },
        { day: 'Mar', revenue: 520000, services: 22 },
        { day: 'Mié', revenue: 380000, services: 15 },
        { day: 'Jue', revenue: 680000, services: 28 },
        { day: 'Vie', revenue: 720000, services: 32 },
        { day: 'Sáb', revenue: 890000, services: 42 },
        { day: 'Dom', revenue: 650000, services: 28 }
    ];

    // Gráfica de ingresos semanales (Area Chart)
    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
        new Chart(revenueCtx, {
            type: 'line',
            data: {
                labels: dailyRevenue.map(d => d.day),
                datasets: [{
                    label: 'Ingresos',
                    data: dailyRevenue.map(d => d.revenue),
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString('es-CO');
                            }
                        }
                    }
                }
            }
        });
    }

    // Event listeners para filtros
    const timeFilter = document.querySelector('.time-filter');
    if (timeFilter) {
        timeFilter.addEventListener('change', function() {
            console.log('Filtro de tiempo cambiado:', this.value);
            // Aquí se actualizarían las gráficas según el filtro seleccionado
        });
    }

    // Event listener para botón de exportar
    const exportBtn = document.querySelector('.export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            console.log('Exportando datos...');
            alert('Función de exportación no implementada en este demo');
        });
    }

    console.log('Dashboard inicializado correctamente');
});