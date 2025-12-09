// reports.js - Versión real conectada al backend
var API_BASE = window.API_BASE || 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    const monthFilter = document.querySelector('.month-filter');
    const amountEl = document.querySelector('.amount');
    const monthChangeEl = document.getElementById('month-change');
    const exportBtn = document.querySelector('.export-btn');

    /* ===========================================================
       Cargar ingresos mensuales (Tu lógica original)
    =========================================================== */
    async function loadMonthlyTotal(year, month) {
        try {
            amountEl.textContent = 'Cargando...';
            monthChangeEl.textContent = '';

            const res = await fetch(`${API_BASE}/reports/monthly/${year}/${month}`);
            if (!res.ok) throw new Error(`Error del servidor: ${res.status}`);

            const data = await res.json();

            if (!data || data.length === 0) {
                amountEl.textContent = '$0';
                monthChangeEl.textContent = 'Sin ventas en este mes';
                monthChangeEl.className = 'change';
                return;
            }

            const total = data.reduce((sum, d) => sum + Number(d.daily_total), 0);

            animateCounter(amountEl, total, '$');

            const monthName = new Date(year, month - 1).toLocaleDateString('es-CO', { 
                month: 'long', year: 'numeric'
            });

            monthChangeEl.textContent = `Ingresos acumulados en ${monthName}`;
            monthChangeEl.className = 'change positive';

        } catch (error) {
            console.error(error);
            amountEl.textContent = '$0';
            monthChangeEl.textContent = `Error: ${error.message}`;
            monthChangeEl.className = 'change error';
        }
    }

    /* ===========================================================
       Animación contador (Tu lógica original)
    =========================================================== */
    function animateCounter(element, finalValue, prefix = '', suffix = '', duration = 1500) {
        const startValue = 0;
        const range = finalValue - startValue;
        const increment = range / (duration / 16);
        let current = startValue;

        const timer = setInterval(() => {
            current += increment;
            if (current >= finalValue) {
                current = finalValue;
                clearInterval(timer);
            }
            element.textContent = prefix + Math.floor(current).toLocaleString('es-CO') + suffix;
        }, 16);
    }

    /* ===========================================================
       Exportar reporte a PDF (NUEVO)
    =========================================================== */
    async function handleExport() {
        const [year, month] = monthFilter.value.split('-');

        try {
            const res = await fetch(`${API_BASE}/reports/month/${year}/${month}`);
            if (!res.ok) throw new Error("No se pudo obtener el reporte para exportar");

            const data = await res.json();

            if (!data || data.length === 0) {
                alert("No hay información para exportar en este mes");
                return;
            }

            // Crear PDF
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF();

            // Encabezado
            pdf.setFontSize(18);
            pdf.text("Quili Wash - Reporte Mensual", 14, 20);

            const monthName = new Date(year, month - 1).toLocaleDateString("es-CO", {
                month: "long",
                year: "numeric"
            });

            pdf.setFontSize(12);
            pdf.text(`Mes: ${monthName}`, 14, 28);

            // Formato tabla
            const tableData = data.map(t => [
                t.id,
                t.plate,
                t.owner,
                t.services,
                "$" + t.total.toLocaleString("es-CO"),
                t.payment_method,
                t.created_at
            ]);

            pdf.autoTable({
                head: [["ID", "Placa", "Propietario", "Servicios", "Total", "Pago", "Fecha"]],
                body: tableData,
                startY: 34
            });

            // Total
            const total = data.reduce((sum, t) => sum + Number(t.total), 0);
            pdf.setFontSize(14);
            pdf.text(`TOTAL: $${total.toLocaleString("es-CO")}`, 14, pdf.lastAutoTable.finalY + 10);

            // Guardar archivo
            pdf.save(`reporte_${year}_${month}.pdf`);

        } catch (error) {
            console.error(error);
            alert("Error al exportar el PDF.");
        }
    }

    /* ===========================================================
       Eventos
    =========================================================== */
    monthFilter.addEventListener('change', () => {
        const [year, month] = monthFilter.value.split('-');
        loadMonthlyTotal(year, month);
    });

    exportBtn.addEventListener('click', handleExport);

    /* ===========================================================
       Inicialización
    =========================================================== */
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    monthFilter.value = `${y}-${m}`;
    loadMonthlyTotal(y, m);
});
