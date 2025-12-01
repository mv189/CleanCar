var API_BASE = 'http://127.0.0.1:3000/api';
document.addEventListener('DOMContentLoaded', function() {

    // 1. Cargar estadísticas del día
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

    cargarDashboard();
    setInterval(cargarDashboard, 10000);

    // 2. Cargar gráfica semanal REAL

    async function cargarGraficoSemanal() {
        try {
            const res = await fetch(`${API_BASE}/stats/weekly`);
            const weekData = await res.json();

            // Orden de días lunes → domingo
            const daysOfWeek = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

            // Si no hubo ventas un día → queda en 0
            const chartData = daysOfWeek.map(day => weekData[day] || 0);

            const revenueCtx = document.getElementById('revenueChart');
            if (revenueCtx) {
                new Chart(revenueCtx, {
                    type: 'bar',
                    data: {
                        labels: daysOfWeek,
                        datasets: [{
                            label: 'Ingresos',
                            data: chartData,
                            borderColor: '#3B82F6',
                            backgroundColor: 'rgba(59, 130, 246, 0.8)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return 'Ingresos: $' + context.raw.toLocaleString('es-CO');
                                    }
                                }
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

        } catch (err) {
            console.error('Error cargando gráfico semanal:', err);
        }
    }

    // ← Llamar al cargar
    cargarGraficoSemanal();


    // ===============================
    // 3. Filtros (a futuro)
    // ===============================
    const timeFilter = document.querySelector('.time-filter');
    if (timeFilter) {
        timeFilter.addEventListener('change', function() {
            console.log('Filtro cambiado:', this.value);
        });
    }

    console.log('Dashboard inicializado correctamente');
});

// ===============================
// 4. Función Exportar PDF
// ===============================
document.addEventListener("DOMContentLoaded", () => {
    const exportButton = document.getElementById("exportButton");

    if (exportButton) {
        exportButton.addEventListener("click", async () => {

            const dashboard = document.querySelector(".content-wrapper"); // Contenedor principal del dashboard

            // Convertir a imagen
            const canvas = await html2canvas(dashboard, { scale: 2 });
            const imgData = canvas.toDataURL("image/png");

            // Crear PDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF("p", "mm", "a4");

            // Medidas
            const pageWidth = 210;
            const imgWidth = pageWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

            // Descargar
            pdf.save("dashboard.pdf");
        });
    }
});