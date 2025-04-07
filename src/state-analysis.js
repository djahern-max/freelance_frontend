const fs = require('fs');
const path = require('path');
const glob = require('glob');

function analyzeStateManagement(directory) {
    const stats = {
        useState: 0,
        useReducer: 0,
        useContext: 0,
        reduxUsage: 0,
        contextProviders: 0,
        totalComponents: 0,
        components: {}
    };

    // Check if directory exists
    if (!fs.existsSync(directory)) {
        console.error(`Directory does not exist: ${directory}`);
        return stats;
    }

    console.log(`Analyzing files in ${directory}...`);
    const files = glob.sync(path.join(directory, '**/*.{js,jsx,ts,tsx}'));
    console.log(`Found ${files.length} files to analyze.`);

    files.forEach(file => {
        try {
            const content = fs.readFileSync(file, 'utf8');
            const filename = path.basename(file);

            // Check for component pattern
            const isComponent = content.includes('function') &&
                (content.includes('return (') || content.includes('return ('));

            if (isComponent) {
                stats.totalComponents++;

                // Count hooks usage
                const useStateCount = (content.match(/useState\(/g) || []).length;
                const useReducerCount = (content.match(/useReducer\(/g) || []).length;
                const useContextCount = (content.match(/useContext\(/g) || []).length;

                stats.useState += useStateCount;
                stats.useReducer += useReducerCount;
                stats.useContext += useContextCount;

                // Check Redux usage
                const hasRedux = content.includes('useSelector') ||
                    content.includes('useDispatch') ||
                    content.includes('connect(');
                if (hasRedux) {
                    stats.reduxUsage++;
                }

                // Check Context Providers
                const hasProvider = content.includes('.Provider') || content.includes('Provider value=');
                if (hasProvider) {
                    stats.contextProviders++;
                }

                // Store component details
                stats.components[filename] = {
                    path: file.replace(directory, ''),
                    useState: useStateCount,
                    useReducer: useReducerCount,
                    useContext: useContextCount,
                    hasRedux,
                    hasProvider
                };
            }
        } catch (error) {
            console.error(`Error analyzing file ${file}:`, error.message);
        }
    });

    return stats;
}

// Install glob if needed
try {
    require.resolve('glob');
} catch (e) {
    console.log('glob package not found. Please install it with:');
    console.log('npm install glob');
    process.exit(1);
}

// Analyze both projects
const ryzeDir = '/Users/ryze.ai/projects/RYZE/ryze-ai-frontend/src';
const analyticsHubDir = '/Users/ryze.ai/projects/analytics-hub/frontend/src';

console.log('Starting analysis...');

const ryzeStats = analyzeStateManagement(ryzeDir);
const analyticsHubStats = analyzeStateManagement(analyticsHubDir);

// Create report
const report = {
    summary: {
        ryze: {
            totalComponents: ryzeStats.totalComponents,
            useState: ryzeStats.useState,
            useStateRatio: ryzeStats.totalComponents > 0 ? (ryzeStats.useState / ryzeStats.totalComponents).toFixed(2) : 0,
            useReducer: ryzeStats.useReducer,
            useContext: ryzeStats.useContext,
            reduxUsage: ryzeStats.reduxUsage,
            contextProviders: ryzeStats.contextProviders
        },
        analyticsHub: {
            totalComponents: analyticsHubStats.totalComponents,
            useState: analyticsHubStats.useState,
            useStateRatio: analyticsHubStats.totalComponents > 0 ? (analyticsHubStats.useState / analyticsHubStats.totalComponents).toFixed(2) : 0,
            useReducer: analyticsHubStats.useReducer,
            useContext: analyticsHubStats.useContext,
            reduxUsage: analyticsHubStats.reduxUsage,
            contextProviders: analyticsHubStats.contextProviders
        }
    },
    components: {
        ryze: ryzeStats.components,
        analyticsHub: analyticsHubStats.components
    }
};

// Print summary to console
console.log('\n--- STATE MANAGEMENT ANALYSIS SUMMARY ---\n');
console.log('RYZE.ai:');
console.log(`  Total Components: ${report.summary.ryze.totalComponents}`);
console.log(`  useState: ${report.summary.ryze.useState} (${report.summary.ryze.useStateRatio} per component)`);
console.log(`  useReducer: ${report.summary.ryze.useReducer}`);
console.log(`  useContext: ${report.summary.ryze.useContext}`);
console.log(`  Redux Usage: ${report.summary.ryze.reduxUsage}`);
console.log(`  Context Providers: ${report.summary.ryze.contextProviders}`);

console.log('\nAnalytics Hub:');
console.log(`  Total Components: ${report.summary.analyticsHub.totalComponents}`);
console.log(`  useState: ${report.summary.analyticsHub.useState} (${report.summary.analyticsHub.useStateRatio} per component)`);
console.log(`  useReducer: ${report.summary.analyticsHub.useReducer}`);
console.log(`  useContext: ${report.summary.analyticsHub.useContext}`);
console.log(`  Redux Usage: ${report.summary.analyticsHub.reduxUsage}`);
console.log(`  Context Providers: ${report.summary.analyticsHub.contextProviders}`);

// Save full report to file
const reportPath = path.join(process.cwd(), 'state-management-analysis.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`\nFull report saved to: ${reportPath}`);

// Top components using state management
console.log('\n--- TOP COMPONENTS BY STATE USAGE ---\n');

function printTopComponents(components, stateType, count = 5) {
    const sorted = Object.entries(components)
        .map(([name, data]) => ({ name, count: data[stateType], ...data }))
        .filter(item => item.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, count);

    return sorted.map(item => `  ${item.name} (${item.count})`).join('\n');
}

console.log('RYZE.ai - Top useState Components:');
console.log(printTopComponents(ryzeStats.components, 'useState'));

console.log('\nAnalytics Hub - Top useState Components:');
console.log(printTopComponents(analyticsHubStats.components, 'useState'));

console.log('\n--- INTEGRATION CONSIDERATIONS ---\n');
console.log(`Primary State Management Approach:`);
console.log(`  RYZE.ai: ${getMainApproach(report.summary.ryze)}`);
console.log(`  Analytics Hub: ${getMainApproach(report.summary.analyticsHub)}`);

function getMainApproach(stats) {
    const approaches = [
        { name: 'Local state (useState)', value: stats.useState },
        { name: 'Reducer-based state', value: stats.useReducer },
        { name: 'Context API', value: stats.useContext + stats.contextProviders * 3 },
        { name: 'Redux', value: stats.reduxUsage * 3 } // Weighted higher as it's typically app-wide
    ];

    return approaches.sort((a, b) => b.value - a.value)[0].name;
}