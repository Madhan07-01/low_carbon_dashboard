/**
 * Recommendation AI NLP Engine — Gemini AI Edition
 * Now powered by Google Gemini 2.5 Flash for real AI recommendations.
 * Falls back to deterministic rule engine if AI is unavailable.
 */

// ─── Legacy Fallback Engine (used if Gemini is unavailable) ───────────────────

const NLP_FALLBACK_CONFIG = {
    KEYWORDS: {
        appliance: ['ac', 'air conditioner', 'fridge', 'refrigerator', 'heater', 'geyser', 'tv', 'washing machine', 'kitchen', 'lights'],
        time: ['night', 'day', 'peak', 'evening', 'summer', 'winter', 'morning'],
        intent: ['reduce', 'save', 'optimize', 'cut', 'high', 'bill', 'carbon', 'footprint']
    },
    INTENT_MAP: {
        HIGH_CONSUMPTION: ['high', 'bill', 'reduce', 'cut', 'cost'],
        APPLIANCE_DOMINANT: ['ac', 'fridge', 'heater', 'kitchen', 'appliances'],
        BEHAVIORAL_OPTIMIZATION: ['night', 'day', 'peak', 'evening', 'time'],
        CARBON_REDUCTION: ['carbon', 'footprint', 'environment', 'sustainability']
    }
};

const FALLBACK_RULES = {
    HIGH_CONSUMPTION: {
        title: "Load Optimization Strategy",
        text: "Analyze your high consumption windows. Transition non-essential task loads to identified low-carbon intervals (typically 02:00 - 05:00 based on baseline).",
        benefit: "Estimated 15-20% reduction in peak load costs",
        reasoning: "Triggered by 'High Consumption' detection in user input.",
        category: "Efficiency",
        impact: "High"
    },
    AC_SPECIFIC: {
        title: "HVAC Precision Tuning",
        text: "Detected focus on climate control. Increase thermostat by 2°C during peak summer months to reduce active power draw by up to 15% without impacting comfort.",
        benefit: "Up to 15% reduction in HVAC energy consumption",
        reasoning: "Triggered by 'AC/Heater' keyword mentions.",
        category: "Appliance",
        impact: "High"
    },
    KITCHEN_SPECIFIC: {
        title: "Smart Kitchen Operations",
        text: "Concentrating kitchen usage. Utilize thermal-efficient cookware and ensure refrigeration coils are dust-free to maintain peak heat-exchange efficiency.",
        benefit: "10-12% reduction in kitchen appliance consumption",
        reasoning: "Triggered by 'Kitchen' appliance keyword.",
        category: "Efficiency",
        impact: "Medium"
    },
    NIGHT_OPTIMIZATION: {
        title: "Nocturnal Energy Management",
        text: "Night-time usage can be optimized by isolating 'vampire loads' (standby devices). Use smart plugs to completely cut power to entertainment systems at night.",
        benefit: "Eliminate 5-10% standby power waste",
        reasoning: "Triggered by 'Night' time indicator.",
        category: "Behavior",
        impact: "Medium"
    },
    CARBON_REDUCTION: {
        title: "Carbon Footprint Scaling",
        text: "To prioritize carbon impact, synchronize your heaviest appliance cycles with grid stability windows observed in the 235V+ range.",
        benefit: "Estimated 8-15 kg CO₂/month reduction",
        reasoning: "Triggered by 'Carbon/Sustainability' intent mapping.",
        category: "Behavior",
        impact: "High"
    }
};

/**
 * Legacy deterministic fallback pipeline
 */
function fallbackProcessPrompt(prompt, systemContext) {
    const cleanText = prompt.toLowerCase().replace(/[^\w\s]/g, '');
    const tokens = cleanText.split(/\s+/);
    const extracted = { keywords: [], intents: new Set() };

    tokens.forEach(token => {
        Object.keys(NLP_FALLBACK_CONFIG.KEYWORDS).forEach(cat => {
            if (NLP_FALLBACK_CONFIG.KEYWORDS[cat].includes(token)) extracted.keywords.push(token);
        });
        Object.keys(NLP_FALLBACK_CONFIG.INTENT_MAP).forEach(intent => {
            if (NLP_FALLBACK_CONFIG.INTENT_MAP[intent].includes(token)) extracted.intents.add(intent);
        });
    });

    const recommendations = [];
    if (extracted.intents.has('HIGH_CONSUMPTION')) recommendations.push(FALLBACK_RULES.HIGH_CONSUMPTION);
    if (tokens.includes('ac') || tokens.includes('air') || tokens.includes('heater')) recommendations.push(FALLBACK_RULES.AC_SPECIFIC);
    if (tokens.includes('kitchen')) recommendations.push(FALLBACK_RULES.KITCHEN_SPECIFIC);
    if (tokens.includes('night') || tokens.includes('evening')) recommendations.push(FALLBACK_RULES.NIGHT_OPTIMIZATION);
    if (extracted.intents.has('CARBON_REDUCTION')) recommendations.push(FALLBACK_RULES.CARBON_REDUCTION);

    if (recommendations.length < 2) {
        recommendations.push(systemContext && systemContext.dominantSM === 'SM3'
            ? FALLBACK_RULES.AC_SPECIFIC
            : FALLBACK_RULES.HIGH_CONSUMPTION);
    }

    return recommendations.slice(0, 4);
}

// ─── Primary AI Pipeline ───────────────────────────────────────────────────────

/**
 * Main NLP Pipeline — tries Gemini AI first, falls back to rule engine
 * @param {string} prompt - User's energy habits description
 * @param {object} systemContext - Dashboard context (avgPower, dominantSM, etc.)
 * @returns {Promise<Array>} - Array of recommendation objects
 */
async function processUserPrompt(prompt, systemContext) {
    // Try Gemini AI first
    if (window.GeminiAI) {
        try {
            const context = {
                avgPower: systemContext.avgPower || 0.076,
                highestSource: systemContext.dominantSM === 'SM3' ? 'Climate Control (HVAC)' :
                               systemContext.dominantSM === 'SM1' ? 'Kitchen Appliances' : 'General Appliances',
                monthlyCO2: systemContext.monthlyCO2 || 4.5
            };
            const results = await window.GeminiAI.generateAIRecommendations(prompt, context);
            // Add legacy 'reasoning' field for backward compatibility with older UI
            return results.map(r => ({ ...r, reasoning: `Gemini AI analysis of: "${prompt.substring(0, 50)}..."` }));
        } catch (err) {
            console.warn('Gemini AI unavailable, falling back to rule engine:', err.message);
        }
    }

    // Deterministic fallback
    return fallbackProcessPrompt(prompt, systemContext);
}

// Export for both legacy UI and new AI-powered UI
window.RecommendationAI = {
    processUserPrompt,
    fallbackProcessPrompt
};
