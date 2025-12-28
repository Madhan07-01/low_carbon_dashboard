/**
 * Personal Carbon Footprint Calculator Core Logic
 * Deterministic estimation based on standardized emission factors.
 */

const FACTORS = {
    ELECTRICITY: 0.82, // kg CO2 per kWh
    TRANSPORT: 0.021,  // kg CO2 per km (avg petrol two-wheeler)
    WASTE: 1.9         // kg CO2 per kg (organic landfill equivalent)
};

/**
 * Calculates carbon footprint based on user inputs.
 * Ensures strict 2-decimal precision and non-negative validation.
 */
function calculateFootprint() {
    // Collect Inputs
    const electricityKWh = parseFloat(document.getElementById('input-electricity').value) || 0;
    const dailyTravelKm = parseFloat(document.getElementById('input-transport').value) || 0;
    const monthlyWasteKg = parseFloat(document.getElementById('input-waste').value) || 0;

    // Validation
    if (electricityKWh < 0 || dailyTravelKm < 0 || monthlyWasteKg < 0) {
        alert("Please enter non-negative values for calculation.");
        return;
    }

    // Formulas
    const electricityCO2 = electricityKWh * FACTORS.ELECTRICITY;
    const transportCO2 = dailyTravelKm * 30 * FACTORS.TRANSPORT;
    const wasteCO2 = monthlyWasteKg * FACTORS.WASTE;
    const totalCO2 = electricityCO2 + transportCO2 + wasteCO2;

    // Update Output Display
    updateDisplay('result-electricity', electricityCO2);
    updateDisplay('result-transport', transportCO2);
    updateDisplay('result-waste', wasteCO2);
    updateDisplay('result-total', totalCO2);
}

/**
 * Helper to update dynamic values in the UI
 */
function updateDisplay(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.innerText = value.toFixed(2);
    }
}

// Initialize listeners on load
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        const inputs = ['input-electricity', 'input-transport', 'input-waste'];
        inputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', calculateFootprint);
            }
        });

        // Initial run
        calculateFootprint();
    });
}
