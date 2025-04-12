var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// ---- Global Variables ----
// Use declare to inform TypeScript about the global variable from CDN
let cy = null;
let currentTheme = 'light'; // Track current theme
/**
 * Display error message on the page
 */
function displayError(message) {
    console.error('[DEBUG] Displaying error:', message);
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) {
        const messageSpan = errorContainer.querySelector('.error-message');
        if (messageSpan) {
            messageSpan.textContent = ' ' + message;
        }
        errorContainer.classList.remove('hidden');
    }
    else {
        console.error('[DEBUG] Error container #error-container not found.');
        alert(message); // Fallback
    }
}
/**
 * Load metadata.json
 */
function loadMetadata() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('[DEBUG] Attempting to load metadata.json...');
        try {
            const response = yield fetch('metadata.json');
            console.log('[DEBUG] Fetch response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
            }
            const data = yield response.json();
            console.log('[DEBUG] Successfully parsed metadata.json');
            if (!data || !Array.isArray(data.pages)) {
                throw new Error("Invalid metadata format: 'pages' array not found or invalid.");
            }
            console.log(`[DEBUG] Metadata loaded: ${data.pages.length} pages found.`);
            // ---- Clean up erroneous 'publishDate' field ----
            data.pages.forEach((page) => {
                if (page.hasOwnProperty('publishDate')) {
                    // We only want 'publish-date', remove the incorrect 'publishDate'
                    delete page.publishDate;
                    // Optional: Log which page was cleaned
                    // console.log(`[DEBUG] Removed erroneous 'publishDate' field from page: ${page.id || page.path}`);
                }
            });
            console.log('[DEBUG] Erroneous date fields cleaned from loaded data.');
            // ---- End cleaning ----
            // ---- DEBUG: Log the CLEANED metadata ----
            console.log('[DEBUG] Cleaned metadata passed to application:', JSON.stringify(data, null, 2));
            // ---- END DEBUG ----
            return data; // Return the cleaned data
        }
        catch (error) {
            console.error('[DEBUG] Failed to load or parse metadata.json:', error);
            let errorMessage = '无法加载知识库索引。请检查 metadata.json 文件是否存在且格式正确。';
            if (error instanceof Error) {
                errorMessage += ` 错误详情: ${error.message}`;
            }
            displayError(errorMessage);
            return null;
        }
    });
}
// ---- Card Rendering Functions ----
function getCategoryColor(category) {
    switch (category) {
        case 'ai-tech': return { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200' };
        case 'info-upgrade': return { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-800 dark:text-purple-200' };
        case 'knowledge': return { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-800 dark:text-yellow-200' };
        case 'research': return { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-200' };
        default: return { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-200' };
    }
}
function getCategoryName(category) {
    switch (category) {
        case 'ai-tech': return 'AI 技术与生态';
        case 'info-upgrade': return '信息化升级';
        case 'knowledge': return '知识报告';
        case 'research': return '科研辅助';
        default: return '其他';
    }
}
function renderCard(page) {
    const publishDate = page['publish-date'] || page.publishDate || '未知日期';
    const categoryColorClasses = getCategoryColor(page.category);
    return `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-shadow duration-300 hover:shadow-lg flex flex-col">
            <div class="p-6 flex-grow">
                <div class="mb-3 flex justify-between items-center">
                    <span class="text-sm font-medium ${categoryColorClasses.text} ${categoryColorClasses.bg} px-2 py-1 rounded">${getCategoryName(page.category)}</span>
                    <span class="text-sm text-gray-500 dark:text-gray-400">${publishDate}</span>
                </div>
                <h4 class="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <a href="${page.path}" target="_blank" rel="noopener noreferrer">${page.title}</a>
                </h4>
                <p class="text-sm text-gray-600 dark:text-gray-400 flex-grow">${page.description}</p>
            </div>
            <div class="px-6 pb-4 pt-2 border-t border-gray-200 dark:border-gray-700 mt-auto">
                <a href="${page.path}" target="_blank" rel="noopener noreferrer" 
                   class="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">
                    阅读全文 &rarr;
                </a>
            </div>
        </div>
    `;
}
function renderAllCards(pages) {
    console.log('[DEBUG] Rendering all cards...');
    try {
        // 1. Get container references
        const containers = {
            'ai-tech': document.getElementById('cards-ai-tech'),
            'info-upgrade': document.getElementById('cards-info-upgrade'),
            'knowledge': document.getElementById('cards-knowledge'),
            'research': document.getElementById('cards-research'),
        };
        // 2. Clear existing container content
        let containersFound = 0;
        Object.values(containers).forEach(container => {
            if (container) {
                container.innerHTML = ''; // Clear previous content or loading messages
                containersFound++;
            }
            else {
                console.warn('[DEBUG] A card container element is missing!');
            }
        });
        if (containersFound === 0) {
            console.error('[DEBUG] No card containers found. Cannot render cards.');
            displayError('无法找到用于显示内容的容器。');
            return;
        }
        console.log(`[DEBUG] Cleared ${containersFound} card containers.`);
        // 3. Group pages by category
        const pagesByCategory = {
            'ai-tech': [],
            'info-upgrade': [],
            'knowledge': [],
            'research': [],
        };
        pages.forEach(page => {
            if (pagesByCategory[page.category]) {
                pagesByCategory[page.category].push(page);
            }
            else {
                console.warn(`[DEBUG] Page with unknown category encountered: ${page.category} for page ${page.id}`);
                // Optionally, create a category or put in a default one
            }
        });
        console.log('[DEBUG] Pages grouped by category.');
        let totalCardsRendered = 0;
        // 4. Sort within each category and render cards
        Object.entries(pagesByCategory).forEach(([category, categoryPages]) => {
            console.log(`[DEBUG] Processing category: ${category} with ${categoryPages.length} pages.`);
            const container = containers[category];
            if (!container) {
                console.warn(`[DEBUG] Container for category ${category} not found, skipping rendering.`);
                return;
            }
            if (categoryPages.length === 0) {
                console.log(`[DEBUG] No pages for category: ${category}.`);
                container.innerHTML = `<p class="text-gray-500 dark:text-gray-400 col-span-full">该分类下暂无内容。</p>`;
                return;
            }
            // Sort pages within this category by publishDate (descending: newest first)
            categoryPages.sort((a, b) => {
                // Ensure 'publish-date' exists and is a valid date string for comparison
                const dateStrA = a['publish-date'] || a.publishDate; // Prioritize 'publish-date'
                const dateStrB = b['publish-date'] || b.publishDate;
                const dateA = dateStrA ? new Date(dateStrA).getTime() : 0;
                const dateB = dateStrB ? new Date(dateStrB).getTime() : 0;
                // Handle cases where dates might be invalid or missing
                if (isNaN(dateA) && isNaN(dateB))
                    return 0; // Both invalid/missing, treat as equal
                if (isNaN(dateA))
                    return 1; // Treat invalid/missing A as older
                if (isNaN(dateB))
                    return -1; // Treat invalid/missing B as older
                return dateB - dateA; // Descending order
            });
            console.log(`[DEBUG] Pages sorted for category: ${category}.`);
            // Render sorted cards for this category
            let categoryCardsRendered = 0;
            categoryPages.forEach(page => {
                const cardHtml = renderCard(page);
                container.insertAdjacentHTML('beforeend', cardHtml);
                categoryCardsRendered++;
            });
            totalCardsRendered += categoryCardsRendered;
            console.log(`[DEBUG] Rendered ${categoryCardsRendered} cards for category: ${category}.`);
        });
        console.log(`[DEBUG] Card rendering complete. Total ${totalCardsRendered} cards rendered across all categories.`);
    }
    catch (error) {
        console.error('[DEBUG] Error during card rendering:', error);
        displayError('渲染内容卡片时出错。');
    }
}
// ---- Knowledge Graph Functions ----
function buildGraphData(pages) {
    console.log('[DEBUG] Building graph data...');
    const elements = [];
    const keywordMap = {};
    pages.forEach(page => {
        const nodeData = {
            id: page.id, label: page.title, category: page.category, path: page.path,
        };
        elements.push({ group: 'nodes', data: nodeData });
        page.keywords.forEach(keyword => {
            const lowerKeyword = keyword.toLowerCase().trim();
            if (lowerKeyword) {
                if (!keywordMap[lowerKeyword])
                    keywordMap[lowerKeyword] = [];
                if (!keywordMap[lowerKeyword].includes(page.id))
                    keywordMap[lowerKeyword].push(page.id);
            }
        });
    });
    const addedEdges = new Set();
    Object.entries(keywordMap).forEach(([keyword, pageIds]) => {
        if (pageIds.length >= 2) {
            for (let i = 0; i < pageIds.length; i++) {
                for (let j = i + 1; j < pageIds.length; j++) {
                    const sourceId = pageIds[i];
                    const targetId = pageIds[j];
                    const edgeIdSorted = [sourceId, targetId].sort().join('---');
                    const edgeId = `edge-${edgeIdSorted}-${keyword}`;
                    if (!addedEdges.has(edgeId)) {
                        const edgeData = { id: edgeId, source: sourceId, target: targetId, keyword: keyword };
                        elements.push({ group: 'edges', data: edgeData });
                        addedEdges.add(edgeId);
                    }
                }
            }
        }
    });
    console.log(`[DEBUG] Graph data built: ${pages.length} nodes, ${elements.length - pages.length} edges.`);
    return elements;
}
function initKnowledgeGraph(elements) {
    console.log('[DEBUG] Initializing knowledge graph with fcose layout (explicit registration attempt)...'); // Updated log
    const container = document.getElementById('knowledge-graph');
    if (!container) {
        console.error('[DEBUG] Knowledge graph container #knowledge-graph not found!');
        return;
    }
    container.innerHTML = ''; // Clear loading message
    try {
        // Restore explicit registration attempt
        if (cytoscape && cytoscapeFcose) {
            cytoscape.use(cytoscapeFcose);
            console.log('[DEBUG] Explicitly registered fcose layout extension using cytoscapeFcose.');
        }
        else {
            console.error('[DEBUG] Cannot explicitly register fcose: cytoscape or cytoscapeFcose global not found!');
            displayError('知识图谱布局扩展加载失败。');
            return; // Stop initialization if extension not loaded
        }
        cy = cytoscape({
            container: container,
            elements: elements,
            style: [
                {
                    selector: 'node',
                    style: {
                        // Base node style (slightly adjusted)
                        'background-color': '#666',
                        'label': 'data(label)',
                        'width': 25, // Slightly smaller nodes
                        'height': 25,
                        'font-size': '9px', // Smaller font
                        'text-valign': 'bottom',
                        'text-halign': 'center',
                        'text-margin-y': 4,
                        'color': '#fff', // Default label color
                        'text-outline-width': 2,
                        'text-outline-color': '#888', // Default outline
                        'transition-property': 'background-color, border-color, border-width, opacity', // Added opacity
                        'transition-duration': '0.2s'
                    }
                },
                {
                    selector: 'edge',
                    style: {
                        // Base edge style (slightly adjusted)
                        'width': 1.5, // Slightly thinner edges
                        'line-color': '#ccc',
                        'target-arrow-color': '#ccc',
                        'target-arrow-shape': 'triangle',
                        'curve-style': 'bezier',
                        'opacity': 0.6, // Default lower opacity for edges
                        'transition-property': 'line-color, target-arrow-color, opacity',
                        'transition-duration': '0.2s'
                    }
                },
                // Category colors (kept the same for now)
                {
                    selector: 'node[category="ai-tech"]',
                    style: { 'background-color': '#03cea4' }
                },
                {
                    selector: 'node[category="info-upgrade"]',
                    style: { 'background-color': '#a463f2' }
                },
                {
                    selector: 'node[category="knowledge"]',
                    style: { 'background-color': '#facc15' }
                },
                {
                    selector: 'node[category="research"]',
                    style: { 'background-color': '#fb4d3d' }
                },
                // Styles for neighbor highlighting
                {
                    selector: '.neighbor-highlight', // Highlighted nodes and edges
                    style: {
                        'opacity': 1,
                        'border-width': 2,
                        'border-color': '#fff', // White border for highlighted nodes
                        'line-color': '#ff5722', // Orange for highlighted edges
                        'target-arrow-color': '#ff5722',
                        'z-index': 10 // Bring highlighted elements to front
                    }
                },
                {
                    selector: 'node.neighbor-highlight',
                    style: {
                        'background-color': '#ff5722', // Orange background for highlighted nodes
                        'text-outline-color': '#ff5722' // Orange outline for highlighted node labels
                    }
                },
                {
                    selector: '.non-highlight', // Dimmed elements
                    style: {
                        'opacity': 0.2
                    }
                }
            ],
            layout: {
                name: 'fcose',
                animate: false,
                padding: 50,
                randomize: true,
            },
            // Zoom control options
            wheelSensitivity: 0.2,
            minZoom: 0.2, // Minimum zoom level
            maxZoom: 2.5 // Maximum zoom level
        });
        if (!cy) {
            console.error('[DEBUG] Cytoscape instance is null after initialization attempt.');
            displayError('知识图谱实例创建失败。');
            return;
        }
        // **Apply initial theme AFTER graph is initialized** 
        updateGraphTheme(currentTheme);
        // Click event to open page
        cy.on('tap', 'node', (evt) => {
            const node = evt.target;
            const path = node.data('path');
            if (path)
                window.open(path, '_blank');
        });
        // Mouseover/Mouseout for neighbor highlighting
        cy.on('mouseover', 'node', (evt) => {
            if (!cy)
                return; // Add null check
            const node = evt.target;
            const neighborhood = node.neighborhood().add(node); // Node itself + neighbors
            cy.elements().addClass('non-highlight'); // Dim everything first
            neighborhood.removeClass('non-highlight').addClass('neighbor-highlight'); // Highlight neighborhood
        });
        cy.on('mouseout', 'node', (evt) => {
            if (!cy)
                return; // Add null check
            // Remove all highlight/dim classes on mouseout
            cy.elements().removeClass('non-highlight neighbor-highlight');
        });
        console.log('[DEBUG] Knowledge graph initialized successfully with enhanced features.');
    }
    catch (error) {
        console.error('[DEBUG] Failed to initialize Cytoscape:', error);
        let errorMessage = '知识图谱渲染失败。';
        if (error instanceof Error) {
            errorMessage += ` 错误详情: ${error.message}`;
        }
        displayError(errorMessage);
        if (container)
            container.innerHTML = `<p class="p-4 text-center text-red-500">${errorMessage}</p>`;
    }
}
// ---- Theme Switching ----
const themeToggleBtn = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;
function updateToggleButtonIcon() {
    const sunIcon = themeToggleBtn === null || themeToggleBtn === void 0 ? void 0 : themeToggleBtn.querySelector('.fa-sun');
    const moonIcon = themeToggleBtn === null || themeToggleBtn === void 0 ? void 0 : themeToggleBtn.querySelector('.fa-moon');
    // Simplify icon toggling based on the presence of 'dark' class
    if (htmlElement.classList.contains('dark')) {
        moonIcon === null || moonIcon === void 0 ? void 0 : moonIcon.classList.remove('hidden');
        sunIcon === null || sunIcon === void 0 ? void 0 : sunIcon.classList.add('hidden');
    }
    else {
        sunIcon === null || sunIcon === void 0 ? void 0 : sunIcon.classList.remove('hidden');
        moonIcon === null || moonIcon === void 0 ? void 0 : moonIcon.classList.add('hidden');
    }
}
function updateGraphTheme(theme) {
    if (!cy) {
        console.warn('[DEBUG] updateGraphTheme called but cy instance is not ready.');
        return;
    }
    console.log('[DEBUG] Updating graph theme to:', theme);
    const nodeColor = theme === 'dark' ? '#ccc' : '#fff';
    const nodeOutline = theme === 'dark' ? '#555' : '#888';
    const edgeColor = theme === 'dark' ? '#555' : '#ccc';
    cy.batch(() => {
        cy.nodes().style({
            'color': nodeColor,
            'text-outline-color': nodeOutline
        });
        cy.edges().style({
            'line-color': edgeColor,
            'target-arrow-color': edgeColor
        });
    });
}
function setTheme(theme) {
    console.log('[DEBUG] Setting theme to:', theme);
    currentTheme = theme; // Update global theme state
    if (theme === 'dark') {
        htmlElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }
    else {
        htmlElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
    updateToggleButtonIcon();
    updateGraphTheme(theme); // Update graph style AFTER theme is set
}
function initTheme() {
    console.log('[DEBUG] Initializing theme...');
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    // Set the initial state WITHOUT triggering graph update yet
    currentTheme = initialTheme;
    if (initialTheme === 'dark') {
        htmlElement.classList.add('dark');
    }
    else {
        htmlElement.classList.remove('dark');
    }
    updateToggleButtonIcon(); // Set the button icon correctly on load
    // Add event listener for the toggle button
    themeToggleBtn === null || themeToggleBtn === void 0 ? void 0 : themeToggleBtn.addEventListener('click', () => {
        setTheme(htmlElement.classList.contains('dark') ? 'light' : 'dark');
    });
    // Add event listener for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        if (!localStorage.getItem('theme')) { // Only follow if no manual override
            setTheme(event.matches ? 'dark' : 'light');
        }
    });
    console.log('[DEBUG] Theme initialized to:', currentTheme);
}
// ---- Tab Switching ----
function initTabs() {
    console.log('[DEBUG] Initializing category tabs...');
    const tabContainer = document.getElementById('category-tabs');
    const contentContainer = document.getElementById('tab-content');
    if (!tabContainer || !contentContainer) {
        console.warn('[DEBUG] Tab container or content container not found. Skipping tab initialization.');
        return;
    }
    const tabs = tabContainer.querySelectorAll('.tab-button');
    const sections = contentContainer.querySelectorAll('[data-category-section]');
    const activeClasses = ['border-blue-500', 'text-blue-600', 'dark:border-blue-400', 'dark:text-blue-300'];
    const inactiveClasses = ['border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300', 'dark:text-gray-400', 'dark:hover:text-gray-200', 'dark:hover:border-gray-600'];
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const category = tab.dataset.category;
            console.log(`[DEBUG] Tab clicked: ${category}`);
            // Update tab styles
            tabs.forEach(t => {
                t.classList.remove(...activeClasses);
                t.classList.add(...inactiveClasses);
                t.removeAttribute('aria-current');
            });
            tab.classList.add(...activeClasses);
            tab.classList.remove(...inactiveClasses);
            tab.setAttribute('aria-current', 'page');
            // Update content visibility
            sections.forEach(section => {
                if (section.dataset.categorySection === category) {
                    section.classList.remove('hidden');
                }
                else {
                    section.classList.add('hidden');
                }
            });
        });
    });
    console.log('[DEBUG] Tab event listeners attached.');
}
/**
 * Main initialization function.
 */
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('---- [DEBUG] Initializing knowledge base ----');
        try {
            initTheme(); // Initialize theme first (sets class, determines initial theme)
            console.log('[DEBUG] Theme initialized.');
            const metadata = yield loadMetadata();
            // ---- DEBUG: Log the loaded metadata ---- (This log is now moved inside loadMetadata)
            // console.log('[DEBUG] Raw metadata loaded:', JSON.stringify(metadata, null, 2)); 
            // ---- END DEBUG ----
            if (!metadata) {
                console.error('[DEBUG] Initialization stopped: Metadata loading failed.');
                return;
            }
            console.log('[DEBUG] Metadata loaded.');
            renderAllCards(metadata.pages);
            console.log('[DEBUG] Card rendering finished attempt.');
            const graphElements = buildGraphData(metadata.pages);
            console.log('[DEBUG] Graph data built.');
            initKnowledgeGraph(graphElements); // Initializes graph AND applies initial theme style inside
            console.log('[DEBUG] Graph initialization attempt finished.');
            initTabs(); // Initialize tab switching functionality AFTER cards are rendered
            console.log('[DEBUG] Tabs initialized.');
            console.log('---- [DEBUG] Knowledge base initialization nominally complete ----');
        }
        catch (error) {
            console.error('[DEBUG] Unhandled error during init:', error);
            displayError('页面初始化过程中发生意外错误。');
        }
    });
}
// ---- Entry Point ----
document.addEventListener('DOMContentLoaded', init);
export {};
