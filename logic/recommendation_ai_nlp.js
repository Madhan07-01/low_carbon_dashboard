/**
 * Recommendation AI NLP Engine
 * Deterministic Natural Language Processing for sustainability guidance.
 */

const NLP_CONFIG = {
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

const SYSTEM_RULES = {
    HIGH_CONSUMPTION: {
        title: "Load Optimization Strategy",
        text: "Analyze your high consumption windows. Transition non-essential task loads to identified low-carbon intervals (typically 02:00 - 05:00 based on baseline).",
        reasoning: "Triggered by 'High Consumption' detection in user input.",
        category: "Efficiency"
    },
    AC_SPECIFIC: {
        title: "HVAC Precision Tuning",
        text: "Detected focus on climate control. Increase thermostat by 2°C during peak summer months to reduce active power draw by up to 15% without impacting comfort.",
        reasoning: "Triggered by 'AC/Heater' keyword mentions.",
        category: "Appliance"
    },
    KITCHEN_SPECIFIC: {
        title: "Smart Kitchen Operations",
        text: "Concentrating kitchen usage. Utilize thermal-efficient cookware and ensure refrigeration coils are dust-free to maintain peak heat-exchange efficiency.",
        reasoning: "Triggered by 'Kitchen' appliance keyword.",
        category: "Efficiency"
    },
    NIGHT_OPTIMIZATION: {
        title: "Nocturnal Energy Management",
        text: "Night-time usage can be optimized by isolating 'vampire loads' (standby devices). Use smart plugs to completely cut power to entertainment systems at night.",
        reasoning: "Triggered by 'Night' time indicator.",
        category: "Behavior"
    },
    CARBON_REDUCTION: {
        title: "Carbon Footprint Scaling",
        text: "To prioritize carbon impact, synchronize your heaviest appliance cycles with grid stability windows observed in the 235V+ range.",
        reasoning: "Triggered by 'Carbon/Sustainability' intent mapping.",
        category: "Behavior"
    }
};

/**
 * Main NLP Pipeline
 */
function processUserPrompt(prompt, systemContext) {
    // Step 1: Preprocessing
    const cleanText = prompt.toLowerCase().replace(/[^\w\s]/g, '');
    const tokens = cleanText.split(/\s+/);

    // Step 2: Keyword & Intent Extraction
    const extracted = {
        keywords: [],
        intents: new Set()
    };

    tokens.forEach(token => {
        // Find keywords
        Object.keys(NLP_CONFIG.KEYWORDS).forEach(cat => {
            if (NLP_CONFIG.KEYWORDS[cat].includes(token)) {
                extracted.keywords.push(token);
            }
        });

        // Map intents
        Object.keys(NLP_CONFIG.INTENT_MAP).forEach(intent => {
            if (NLP_CONFIG.INTENT_MAP[intent].includes(token)) {
                extracted.intents.add(intent);
            }
        });
    });

    // Step 3: Rule-Augmented Reasoning
    const recommendations = [];

    // Rule 1: NLP Intent - High Consumption
    if (extracted.intents.has('HIGH_CONSUMPTION')) {
        recommendations.push(SYSTEM_RULES.HIGH_CONSUMPTION);
    }

    // Rule 2: Specific Keywords - Appliance
    if (tokens.includes('ac') || tokens.includes('air') || tokens.includes('heater')) {
        recommendations.push(SYSTEM_RULES.AC_SPECIFIC);
    }

    if (tokens.includes('kitchen')) {
        recommendations.push(SYSTEM_RULES.KITCHEN_SPECIFIC);
    }

    // Rule 3: Time indicator
    if (tokens.includes('night') || tokens.includes('evening')) {
        recommendations.push(SYSTEM_RULES.NIGHT_OPTIMIZATION);
    }

    // Rule 4: Carbon intent
    if (extracted.intents.has('CARBON_REDUCTION')) {
        recommendations.push(SYSTEM_RULES.CARBON_REDUCTION);
    }

    // Rule 5: System Context Augmentation (Fallback if NLP is vague)
    if (recommendations.length < 2) {
        if (systemContext.dominantSM === 'SM3') {
            recommendations.push(SYSTEM_RULES.AC_SPECIFIC);
        } else {
            recommendations.push(SYSTEM_RULES.HIGH_CONSUMPTION);
        }
    }

    // Ensure variety and limit to 4
    return recommendations.slice(0, 4);
}

// Export for frontend use
window.RecommendationAI = {
    processUserPrompt
};
