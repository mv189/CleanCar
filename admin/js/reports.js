// reports.js - Versión real conectada al backend
var API_BASE = window.API_BASE || 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', () => {
    const monthFilter = document.querySelector('.month-filter');
    const amountEl = document.querySelector('.amount');
    const monthChangeEl = document.getElementById('month-change');
    const exportBtn = document.querySelector('.export-btn');

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
            const monthName = new Date(year, month - 1).toLocaleDateString('es-CO', { month: 'long', year: 'numeric' });
            monthChangeEl.textContent = `Ingresos acumulados en ${monthName}`;
            monthChangeEl.className = 'change positive';

        } catch (error) {
            console.error(error);
            amountEl.textContent = '$0';
            monthChangeEl.textContent = `Error: ${error.message}`;
            monthChangeEl.className = 'change error';
        }
    }

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

    function handleExport() {
        const [year, month] = monthFilter.value.split('-');
        console.log(`Exportando ${year}-${month}`);
        alert('Función de exportación próximamente disponible');
    }

    monthFilter.addEventListener('change', () => {
        const [year, month] = monthFilter.value.split('-');
        loadMonthlyTotal(year, month);
    });

    exportBtn.addEventListener('click', handleExport);

    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    monthFilter.value = `${y}-${m}`;
    loadMonthlyTotal(y, m);
});