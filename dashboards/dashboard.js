// Data from Top_10_Most_Efficient_Energy_Usage_2025_FIXED.csv
const dashboardData = [
    { date: '2025-08-12', time: '19:26:00', power: 0.076, voltage: 236.5, sm1: 0.0, sm2: 0.0, sm3: 1.0 },
    { date: '2025-08-28', time: '20:46:00', power: 0.076, voltage: 235.18, sm1: 0.0, sm2: 0.0, sm3: 0.0 },
    { date: '2025-08-28', time: '20:47:00', power: 0.076, voltage: 235.4, sm1: 0.0, sm2: 0.0, sm3: 1.0 },
    { date: '2025-08-28', time: '20:48:00', power: 0.076, voltage: 234.88, sm1: 0.0, sm2: 0.0, sm3: 1.0 },
    { date: '2025-08-28', time: '20:51:00', power: 0.076, voltage: 234.03, sm1: 0.0, sm2: 0.0, sm3: 1.0 },
    { date: '2025-08-28', time: '20:49:00', power: 0.076, voltage: 234.34, sm1: 0.0, sm2: 0.0, sm3: 0.0 },
    { date: '2025-08-28', time: '20:50:00', power: 0.076, voltage: 234.06, sm1: 0.0, sm2: 0.0, sm3: 1.0 },
    { date: '2025-08-28', time: '21:02:00', power: 0.076, voltage: 235.64, sm1: 0.0, sm2: 0.0, sm3: 1.0 },
    { date: '2025-08-28', time: '20:52:00', power: 0.076, voltage: 233.92, sm1: 0.0, sm2: 0.0, sm3: 0.0 },
    { date: '2025-08-28', time: '09:07:00', power: 0.078, voltage: 238.15, sm1: 0.0, sm2: 0.0, sm3: 0.0 }
];

// Helper to format labels
const labels = dashboardData.map(d => `${d.date} ${d.time}`);

// Common chart settings
const primaryColor = '#1abc9c';
const secondaryColor = '#2ecc71';
const accentColor = '#34495e';

// 1. Line Chart: Efficient Energy Consumption Trend (2025)
const ctxLine = document.getElementById('lineChart').getContext('2d');
new Chart(ctxLine, {
    type: 'line',
    data: {
        labels: labels,
        datasets: [{
            label: 'Global Active Power (kW)',
            data: dashboardData.map(d => d.power),
            borderColor: primaryColor,
            backgroundColor: 'rgba(26, 188, 156, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 8
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { position: 'top' }
        },
        scales: {
            y: { beginAtZero: false, title: { display: true, text: 'Power (kW)' } }
        }
    }
});

// 2. Bar Chart: Top 10 Most Efficient Energy Usage Records
const ctxBar = document.getElementById('barChart').getContext('2d');
new Chart(ctxBar, {
    type: 'bar',
    data: {
        labels: labels,
        datasets: [{
            label: 'Global Active Power (kW)',
            data: dashboardData.map(d => d.power),
            backgroundColor: dashboardData.map((_, i) => i === 0 ? secondaryColor : primaryColor),
            borderRadius: 8
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: { display: false }
        },
        indexAxis: 'y', // Horizontal bar chart
        scales: {
            x: { title: { display: true, text: 'Power (kW)' } }
        }
    }
});

// 3. Scatter Plot: Voltage vs Power Consumption
const ctxScatter = document.getElementById('scatterPlot').getContext('2d');
new Chart(ctxScatter, {
    type: 'scatter',
    data: {
        datasets: [{
            label: 'Usage Records',
            data: dashboardData.map(d => ({ x: d.voltage, y: d.power, label: `${d.date} ${d.time}` })),
            backgroundColor: accentColor,
            pointRadius: 10,
            pointHoverRadius: 12
        }]
    },
    options: {
        responsive: true,
        plugins: {
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const point = context.raw;
                        return `Date: ${point.label} | Voltage: ${point.x}V | Power: ${point.y}kW`;
                    }
                }
            }
        },
        scales: {
            x: { title: { display: true, text: 'Voltage (V)' } },
            y: { title: { display: true, text: 'Global Active Power (kW)' } }
        }
    }
});

// 4. Stacked Bar Chart: Sub-Meter Energy Contribution
const ctxStacked = document.getElementById('stackedBarChart').getContext('2d');
new Chart(ctxStacked, {
    type: 'bar',
    data: {
        labels: labels,
        datasets: [
            { label: 'Kitchen (SM1)', data: dashboardData.map(d => d.sm1), backgroundColor: '#16a085' },
            { label: 'Laundry (SM2)', data: dashboardData.map(d => d.sm2), backgroundColor: '#1abc9c' },
            { label: 'Heater/AC (SM3)', data: dashboardData.map(d => d.sm3), backgroundColor: '#2ecc71' }
        ]
    },
    options: {
        responsive: true,
        scales: {
            x: { stacked: true },
            y: { stacked: true, title: { display: true, text: 'Energy (Wh)' } }
        }
    }
});
