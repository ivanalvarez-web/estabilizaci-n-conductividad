const form = document.getElementById('data-form');
const input = document.getElementById('conductivity-input');
const tbody = document.getElementById('data-list');
const clearBtn = document.getElementById('clear-btn');
const statAverage = document.getElementById('stat-average');
const statCount = document.getElementById('stat-count');
const statStatus = document.getElementById('stat-status');

let dataset = []; // Almacena { id, value }
let currentId = 0;

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = parseFloat(input.value);
    
    if (isNaN(val)) return;

    dataset.push({
        id: ++currentId,
        value: val
    });

    input.value = '';
    input.focus();
    updateUI();
});

clearBtn.addEventListener('click', () => {
    dataset = [];
    currentId = 0;
    updateUI();
});

function removeData(id) {
    dataset = dataset.filter(item => item.id !== id);
    updateUI();
}

function updateUI() {
    if (dataset.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="5">No hay datos introducidos aún.</td></tr>';
        statAverage.textContent = '0.00';
        statCount.textContent = '0';
        updateStatusBadge('N/A', '');
        return;
    }

    const count = dataset.length;
    // Calcular el promedio
    const sum = dataset.reduce((acc, curr) => acc + curr.value, 0);
    const avg = sum / count;

    statCount.textContent = count;
    statAverage.textContent = avg.toFixed(3);

    let allValid = true;
    let html = '';

    // Solo podemos calcular desviaciones si hay más de 1 dato, 
    // pero calcularemos usando el promedio incluso con 1 dato (desviación 0%).
    dataset.forEach((item, index) => {
        let deviation = 0;
        let isItemValid = true;

        if (count > 0) {
            deviation = ((item.value - avg) / avg) * 100;
            // Evaluamos si el dato actual diverge más del 5% del promedio
            if (Math.abs(deviation) > 5) {
                isItemValid = false;
                allValid = false;
            }
        }

        const rowClass = (count > 1) ? (isItemValid ? 'row-valid' : 'row-invalid') : 'row-valid';
        const statusText = (count > 1) ? (isItemValid ? '✔ Cumple' : '✘ No cumple') : '✔ Base';

        html += `
            <tr class="animate-entry ${rowClass}" style="animation-delay: ${index * 0.05}s">
                <td>${index + 1}</td>
                <td><strong>${item.value.toFixed(3)}</strong></td>
                <td>${deviation > 0 ? '+' : ''}${deviation.toFixed(2)}%</td>
                <td>${statusText}</td>
                <td><button type="button" class="btn-danger" onclick="removeData(${item.id})">Eliminar</button></td>
            </tr>
        `;
    });

    tbody.innerHTML = html;

    if (count > 1) {
        if (allValid) {
            updateStatusBadge('CUMPLE (±5%)', 'status-valid');
        } else {
            updateStatusBadge('NO CUMPLE', 'status-invalid');
        }
    } else {
        updateStatusBadge('ESPERANDO', '');
    }
}

function updateStatusBadge(text, className) {
    statStatus.textContent = text;
    statStatus.className = 'stat-value status-badge';
    if (className) {
        statStatus.classList.add(className);
    }
}

// Hacer globales las funciones para los onclick en HTML
window.removeData = removeData;
