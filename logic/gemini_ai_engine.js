/**
 * Gemini AI Engine
 * Central integration layer for Google Gemini Flash API (Gemini 2.5 Flash & 3.8 Flash)
 * Powers the What-If Simulator, Recommendation AI, and Action Engine
 */

const GEMINI_CONFIG = {
    API_KEY: 'AIzaSyDEgTT3Vlc5qGZdAimP-i6HKJoXgSsV1HM',
    PRIMARY_MODEL: 'gemini-2.5-flash',
    SECONDARY_MODEL: 'gemini-3.8-flash',
    BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models',
    EMISSION_FACTOR: 0.82, // kg CO2 per kWh (India Grid Standard)
};

/**
 * Core function to call Gemini API with multi-model failover and optional JSON mode
 * @param {string} prompt - The user or system prompt
 * @param {string} systemInstruction - Optional system-level instruction
 * @param {boolean} jsonMode - Enforce JSON response format
 * @returns {Promise<string>} - AI text response
 */
async function callGeminiAI(prompt, systemInstruction = '', jsonMode = false) {
    const modelsToTry = [GEMINI_CONFIG.PRIMARY_MODEL, GEMINI_CONFIG.SECONDARY_MODEL];
    let lastError = null;

    for (const model of modelsToTry) {
        try {
            const url = `${GEMINI_CONFIG.BASE_URL}/${model}:generateContent?key=${GEMINI_CONFIG.API_KEY}`;

            const requestBody = {
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: prompt }]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 4096,
                }
            };

            if (jsonMode) {
                requestBody.generationConfig.responseMimeType = 'application/json';
            }

            if (systemInstruction) {
                requestBody.system_instruction = {
                    parts: [{ text: systemInstruction }]
                };
            }

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                // If 503 (demand spike) or 429 (rate limit), log and try alternate model
                if (response.status === 503 || response.status === 429) {
                    console.warn(`Model ${model} returned ${response.status}. Attempting secondary model...`);
                    lastError = new Error(`Gemini API Error (${model}) ${response.status}: ${errorText}`);
                    continue;
                }
                throw new Error(`Gemini API Error (${model}) ${response.status}: ${errorText}`);
            }

            const data = await response.json();

            if (!data.candidates || data.candidates.length === 0) {
                throw new Error(`No candidates returned from Gemini API (${model}).`);
            }

            return data.candidates[0].content.parts[0].text;
        } catch (err) {
            lastError = err;
            console.warn(`Attempt with ${model} failed:`, err.message);
        }
    }

    throw lastError || new Error('All Gemini API model attempts failed.');
}

/**
 * Generate AI-powered What-If Simulation Analysis
 * @param {number} households - Number of households in the simulation
 * @param {object} metrics - Calculated energy metrics
 * @returns {Promise<string>} - AI narrative analysis in HTML
 */
async function generateSimulationInsight(households, metrics) {
    const systemInstruction = `You are a sustainability AI expert specializing in residential energy analysis and decarbonization.
You analyze household energy data using India's grid emission factor of 0.82 kg CO2/kWh.
Provide concise, data-driven insights in a professional, inspiring tone.
Always format your response as clean HTML paragraphs (<p>...</p>) - no markdown code fences, no extra headers.
Keep it to 3-4 focused paragraphs with specific numbers and realistic real-world analogies.`;

    const prompt = `Analyze this What-If energy simulation for ${households} households:
- Average efficient power per household: ${metrics.avgPower.toFixed(4)} kW
- Total estimated monthly energy consumption: ${metrics.totalEnergy.toFixed(2)} kWh
- Estimated monthly CO2 reduction vs baseline: ${metrics.co2Reduction.toFixed(2)} kg
- India grid emission factor: 0.82 kg CO2/kWh

Provide an actionable sustainability insight about scaling these efficiency patterns.
Include:
1. Direct environmental and energy savings analysis with calculated metrics.
2. Relatable real-world equivalents (e.g., equivalent mature trees absorbing CO2 annually, or passenger car kilometers avoided).
3. Strategic, concrete recommendations for community-level or grid-level adoption.`;

    return await callGeminiAI(prompt, systemInstruction, false);
}

/**
 * Generate AI-powered recommendations from natural language input
 * @param {string} userPrompt - User's description of energy habits
 * @param {object} context - Dashboard context (avgPower, dominant meter, etc.)
 * @returns {Promise<Array>} - Array of structured recommendation objects
 */
async function generateAIRecommendations(userPrompt, context = {}) {
    const systemInstruction = `You are an expert sustainability AI consultant for residential energy optimization.
You MUST respond ONLY with a valid JSON array of recommendation objects.
Do NOT include any markdown code fences, backticks, or explanation outside the JSON.
Each recommendation must have these exact keys:
- "title": string (concise action title, max 6 words)
- "text": string (detailed actionable advice, 2-3 sentences)
- "benefit": string (quantified energy/cost/CO2 benefit estimate)
- "category": string (one of: "Efficiency", "Appliance", "Behavior", "Renewable", "Sustainability")
- "impact": string (one of: "High", "Medium", "Low")
Provide 4-5 high-quality, practical recommendations tailored to the user's specific input and context.`;

    const prompt = `User energy habits & concern: "${userPrompt}"

Dashboard context:
- Average household power: ${context.avgPower || 0.076} kW
- Dominant energy source: ${context.highestSource || 'Climate Control (HVAC)'}
- Estimated monthly CO2: ${context.monthlyCO2 || 4.5} kg
- India grid emission factor: 0.82 kg CO2/kWh

Generate 4-5 personalized, AI-powered sustainability recommendations.`;

    const rawText = await callGeminiAI(prompt, systemInstruction, true);

    // Clean any markdown formatting if present
    let cleaned = rawText.trim();
    if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
    } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
    }

    try {
        return JSON.parse(cleaned);
    } catch (e) {
        const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error('AI returned an invalid JSON structure for recommendations.');
    }
}

/**
 * Generate AI-powered action recommendations from usage pattern data
 * @param {object} usageData - Analyzed CSV usage patterns
 * @returns {Promise<Array>} - Array of action recommendation objects
 */
async function generatePatternBasedRecommendations(usageData) {
    const systemInstruction = `You are a data-driven energy efficiency AI.
You analyze household sub-metering data and generate precise, actionable recommendations.
Respond ONLY with a valid JSON array. No markdown, no explanations outside JSON.
Each item must have: "title", "text", "benefit", "category", "impact" keys.`;

    const prompt = `Analyze this household energy usage pattern data:
- Average Global Active Power: ${usageData.avgPower ? usageData.avgPower.toFixed(4) : 0.076} kW
- Kitchen appliances (SM1) average: ${usageData.avgSM1 ? usageData.avgSM1.toFixed(3) : 0} W
- Laundry/AC (SM2) average: ${usageData.avgSM2 ? usageData.avgSM2.toFixed(3) : 0} W
- Climate Control/HVAC (SM3) average: ${usageData.avgSM3 ? usageData.avgSM3.toFixed(3) : 0} W
- Dominant energy source: ${usageData.highestSource || 'Climate Control'}
- Monthly CO2 footprint: ${usageData.monthlyCO2 ? usageData.monthlyCO2.toFixed(2) : 4.5} kg

Generate 5 data-backed recommendations to optimize this specific energy profile.
Focus on the dominant sub-meter source first, then provide behavioral and technology suggestions.`;

    const rawText = await callGeminiAI(prompt, systemInstruction, true);

    let cleaned = rawText.trim();
    if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
    } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
    }

    try {
        return JSON.parse(cleaned);
    } catch (e) {
        const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        throw new Error('AI returned an invalid JSON structure for pattern recommendations.');
    }
}

/**
 * Check if the Gemini API is accessible
 * @returns {Promise<{ ok: boolean, model: string }>}
 */
async function validateAPIConnection() {
    try {
        const result = await callGeminiAI('Respond with only the word: READY');
        return { ok: result.trim().toUpperCase().includes('READY'), model: GEMINI_CONFIG.PRIMARY_MODEL };
    } catch (e) {
        console.error('Gemini API validation error:', e.message);
        return { ok: false, model: 'none', error: e.message };
    }
}

// Export for global browser use and Node.js environments
const GeminiAIModule = {
    callGeminiAI,
    generateSimulationInsight,
    generateAIRecommendations,
    generatePatternBasedRecommendations,
    validateAPIConnection,
    CONFIG: GEMINI_CONFIG
};

if (typeof window !== 'undefined') {
    window.GeminiAI = GeminiAIModule;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = GeminiAIModule;
}
