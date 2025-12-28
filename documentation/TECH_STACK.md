# Technology Stack: Low-Carbon Case Study Dashboard
*Evaluation-Friendly Technical Architecture Specification*

## Data Layer
- **Python (pandas)**: Responsible for advanced data cleaning, noise reduction, filtering, and extraction of high-efficiency energy records from raw household datasets.
- **CSV Datasets**: Structured storage for processed energy and emission data, ensuring high-speed retrieval and portability.

## Logic & Computation Layer
- **JavaScript (Vanilla JS)**: Implements the **What-If Simulator** engine, handling real-time mathematical modeling and rule-based logic for community-scale impacts.
- **Emission Factor Modeling**: Deterministic CO₂ calculation engine utilizing standardized grid emission factors (e.g., India Grid Standard @ 0.82 kg/kWh) for precision.

## Visualization Layer
- **HTML5**: Semantic structural layout for the primary intelligence dashboard and the high-fidelity landing interface.
- **CSS3 (Modern)**: Responsive design implementation utilizing glassmorphism, flexbox/grid systems, and sustainability-themed aesthetics.
- **Chart.js**: Interactive visualization engine for KPI tracking, trend analysis, and sub-metering contributions.

## Prototype & System Design
- **Modular File Architecture**: Strict separation of concerns across data storage, backend logic, frontend dashboards, and system documentation.
- **Client-Side Simulation Engine**: Edge-computed real-time interaction modules that operate without server-side dependency, optimized for performance.

## Deployment & Tools
- **Power BI / Tableau**: Used for exploratory data analytics, initial pattern validation, and verifying the integrity of the dashboard’s visual insights.
- **Local Dev Server**: Optimized for rapid prototyping and iterative design cycles.
