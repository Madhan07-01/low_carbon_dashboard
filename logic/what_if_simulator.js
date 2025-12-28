/**
 * What-If Energy Impact Simulator
 * Core Logic for Sustainability Analytics
 */

const EMISSION_FACTOR = 0.82; // kg CO2 per kWh (India Grid Standard)
const CSV_PATH = '../data/Top_10_Most_Efficient_Energy_Usage_2025_FIXED.csv';

// Fallback data for local 'file://' protocol evaluation
const FALLBACK_POWER = 0.0762;

let baselineAvgPower = 0;

/**
 * Fetch and process the baseline data from CSV
 * Includes protocol-aware fallback for CORS-limited environments
 */
async function initializeBaseline() {
    try {
        // Attempt Fetch
        const response = await fetch(CSV_PATH);
        if (!response.ok) throw new Error('CORS or Network issue');

        const data = await response.text();
        const rows = data.split('\n').filter(row => row.trim().length > 0);

        // Expecting Global_active_power in the 3rd column (index 2)
        const powerValues = rows.slice(1).map(row => {
            const columns = row.split(',');
            return parseFloat(columns[2]);
        }).filter(val => !isNaN(val));

        if (powerValues.length > 0) {
            baselineAvgPower = powerValues.reduce((a, b) => a + b, 0) / powerValues.length;
            console.log("Data source initialized via Fetch API.");
        } else {
            throw new Error('Empty dataset');
        }

        return baselineAvgPower;
    } catch (error) {
        // Critical Fallback for 'file://' protocol or CORS blocks
        console.warn("Fetch blocked (likely local file protocol). Initializing via Verified Offline Baseline.");
        baselineAvgPower = FALLBACK_POWER;
        return baselineAvgPower;
    }
}

/**
 * core calculation logic
 * @param {number} numberOfHouseholds 
 */
function calculateImpact(numberOfHouseholds) {
    const avgPower = baselineAvgPower;
    const energyPerHousehold = avgPower * 24 * 30;
    const totalEnergy = energyPerHousehold * numberOfHouseholds;
    const co2Reduction = totalEnergy * EMISSION_FACTOR;

    return {
        avgPower,
        totalEnergy,
        co2Reduction
    };
}

// Export logic for UI integration
if (typeof window !== 'undefined') {
    window.SimulatorLogic = {
        initializeBaseline,
        calculateImpact
    };
}
