// import cytoscape from 'cytoscape';
import { Metadata, PageData, GraphElement, GraphNodeData, GraphEdgeData } from './types';

// Use ES6 imports now that we are using a bundler
import cytoscape from 'cytoscape';
// @ts-ignore // Suppress module not found error temporarily
import fcose from 'cytoscape-fcose';

// ---- Global Variables ----
// Use the imported cytoscape type directly
let cy: cytoscape.Core | null = null;
let currentTheme: 'light' | 'dark' = 'light'; // Track current theme
let allPages: PageData[] = []; // Store all loaded pages globally
let currentCategory: string = 'all'; // Track the currently selected category tab

/**
 * Display error message on the page
 */
function displayError(message: string): void {
    console.error('[DEBUG] Displaying error:', message);
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) {
        const messageSpan = errorContainer.querySelector('.error-message');
        if (messageSpan) {
            messageSpan.textContent = ' ' + message;
        }
        errorContainer.classList.remove('hidden');
    } else {
        console.error('[DEBUG] Error container #error-container not found.');
        alert(message); // Fallback
    }
}

/**
 * Load metadata.json
 */
async function loadMetadata(): Promise<Metadata | null> {
    console.log('[DEBUG] Attempting to load metadata.json...');
    try {
        const response = await fetch('metadata.json');
        console.log('[DEBUG] Fetch response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }
        const data: Metadata = await response.json();
        console.log('[DEBUG] Successfully parsed metadata.json');
        if (!data || !Array.isArray(data.pages)) {
            throw new Error("Invalid metadata format: 'pages' array not found or invalid.");
        }
        console.log(`[DEBUG] Metadata loaded: ${data.pages.length} pages found.`);

        // ---- Clean up erroneous 'publishDate' field ----
        data.pages.forEach((page: any) => { // Use 'any' temporarily for deletion
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
    } catch (error) {
        console.error('[DEBUG] Failed to load or parse metadata.json:', error);
        let errorMessage = '无法加载知识库索引。请检查 metadata.json 文件是否存在且格式正确。';
        if (error instanceof Error) {
            errorMessage += ` 错误详情: ${error.message}`;
        }
        displayError(errorMessage);
        return null;
    }
}

// ---- Card Rendering Functions ----
function getCategoryColor(category: string): { bg: string; text: string } {
    switch (category) {
        case 'ai-tech': return { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200' };
        case 'info-upgrade': return { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-800 dark:text-purple-200' };
        case 'knowledge': return { bg: 'bg-yellow-100 dark:bg-yellow-900', text: 'text-yellow-800 dark:text-yellow-200' };
        case 'research': return { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-200' };
        default: return { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-200' };
    }
}

function getCategoryName(category: string): string {
    switch (category) {
        case 'ai-tech': return 'AI 技术与生态';
        case 'info-upgrade': return '信息化升级';
        case 'knowledge': return '知识报告';
        case 'research': return '科研辅助';
        default: return '其他';
    }
}

function renderCard(page: PageData): string {
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

/**
 * Renders cards for a specific category into the main container.
 * @param categoryId The category to display ('all' for all categories).
 * @param pages The full list of page data.
 */
function displayCardsForCategory(categoryId: string, pages: PageData[]): void {
    console.log(`[DEBUG] Rendering cards for category: ${categoryId}`);
    const cardsContainer = document.getElementById('cards-container');
    if (!cardsContainer) {
        console.error('[DEBUG] Cards container #cards-container not found.');
        displayError('无法找到用于显示内容的容器。');
        return;
    }

    // Filter pages
    const filteredPages = categoryId === 'all' 
        ? pages 
        : pages.filter(page => page.category === categoryId);

    // Sort pages by date (descending)
    filteredPages.sort((a, b) => {
        const dateStrA = a['publish-date'] || a.publishDate; 
        const dateStrB = b['publish-date'] || b.publishDate;
        const dateA = dateStrA ? new Date(dateStrA).getTime() : 0;
        const dateB = dateStrB ? new Date(dateStrB).getTime() : 0;
        if (isNaN(dateA) && isNaN(dateB)) return 0;
        if (isNaN(dateA)) return 1; 
        if (isNaN(dateB)) return -1;
        return dateB - dateA; 
    });

    // Clear container and render cards
    cardsContainer.innerHTML = ''; // Clear previous content
    if (filteredPages.length === 0) {
        cardsContainer.innerHTML = `<p class="text-gray-500 dark:text-gray-400 col-span-full text-center">该分类下暂无内容。</p>`;
        console.log(`[DEBUG] No cards to render for category: ${categoryId}.`);
    } else {
        let renderedCount = 0;
        filteredPages.forEach(page => {
            const cardHtml = renderCard(page);
            cardsContainer.insertAdjacentHTML('beforeend', cardHtml);
            renderedCount++;
        });
        console.log(`[DEBUG] Rendered ${renderedCount} cards for category: ${categoryId}.`);
    }
}

// ---- Knowledge Graph Functions ----
function buildGraphData(pages: PageData[]): GraphElement[] {
    console.log('[DEBUG] Building graph data...');
    const elements: GraphElement[] = [];
    const keywordMap: { [keyword: string]: string[] } = {};
    pages.forEach(page => {
        const nodeData: GraphNodeData = {
            id: page.id, label: page.title, category: page.category, path: page.path,
        };
        elements.push({ group: 'nodes', data: nodeData });
        page.keywords.forEach(keyword => {
            const lowerKeyword = keyword.toLowerCase().trim();
            if (lowerKeyword) {
                if (!keywordMap[lowerKeyword]) keywordMap[lowerKeyword] = [];
                if (!keywordMap[lowerKeyword].includes(page.id)) keywordMap[lowerKeyword].push(page.id);
            }
        });
    });
    const addedEdges = new Set<string>();
    Object.entries(keywordMap).forEach(([keyword, pageIds]) => {
        if (pageIds.length >= 2) {
            for (let i = 0; i < pageIds.length; i++) {
                for (let j = i + 1; j < pageIds.length; j++) {
                    const sourceId = pageIds[i]; const targetId = pageIds[j];
                    const edgeIdSorted = [sourceId, targetId].sort().join('---');
                    const edgeId = `edge-${edgeIdSorted}-${keyword}`;
                    if (!addedEdges.has(edgeId)) {
                        const edgeData: GraphEdgeData = { id: edgeId, source: sourceId, target: targetId, keyword: keyword };
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

function initKnowledgeGraph(elements: GraphElement[]): void {
    console.log('[DEBUG] Initializing knowledge graph with fcose layout (imported)...'); 
    const container = document.getElementById('knowledge-graph');
    if (!container) {
        console.error('[DEBUG] Knowledge graph container #knowledge-graph not found!');
        return;
    }
    container.innerHTML = ''; // Clear loading message

    try {
        // Register the fcose layout extension using the imported variable
        // @ts-ignore // Suppress potential type errors during registration temporarily
        cytoscape.use(fcose);
        console.log('[DEBUG] fcose layout extension registered via import.');

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
                         'width': 25 as cytoscape.Css.Node['width'], // Slightly smaller nodes
                         'height': 25 as cytoscape.Css.Node['height'],
                         'font-size': '9px', // Smaller font
                         'text-valign': 'bottom',
                         'text-halign': 'center',
                         'text-margin-y': 4,
                         'color': '#fff', // Default label color
                         'text-outline-width': 2 as cytoscape.Css.Node['text-outline-width'],
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
                 },
                 {
                     selector: '.selected-node',
                     style: {
                         'background-color': '#e11d48', // Example: Rose-600 bg
                         'border-color': '#fff', // White border for contrast
                         'border-width': 3,
                         'text-outline-color': '#e11d48',
                         'z-index': 20 // Ensure selected is on top
                     }
                 }
            ],
            layout: {
                name: 'fcose',
                // @ts-ignore // Suppress type error for animate, as it is a valid fcose option
                animate: false,
                padding: 50,
                randomize: true,
            },
            // Zoom control options
            wheelSensitivity: 0.2,
            minZoom: 0.2,        // Minimum zoom level
            maxZoom: 2.5         // Maximum zoom level
        });

        if (!cy) {
             console.error('[DEBUG] Cytoscape instance is null after initialization attempt.');
             displayError('知识图谱实例创建失败。');
             return;
        }

        // Apply initial theme
        updateGraphTheme(currentTheme); 

        // --- Event Handlers ---
        cy.on('tap', 'node', (evt: cytoscape.EventObject) => {
            if (!cy) return;
            const node = evt.target;
            const path = node.data('path');
            if (path) window.open(path, '_blank');
        });

        cy.on('mouseover', 'node', (evt: cytoscape.EventObject) => {
            if (!cy) return;
            const node = evt.target;
            // Avoid highlighting if a node is already selected
            if (cy.$('.selected-node').length > 0) return;

            const neighborhood = node.neighborhood().add(node); 
            
            // Explicitly cast to 'any' to bypass potential incorrect linter errors
            (cy.elements() as any).addClass('non-highlight'); 
            (neighborhood as any).removeClass('non-highlight').addClass('neighbor-highlight'); 
        });

        cy.on('mouseout', 'node', (evt: cytoscape.EventObject) => {
            if (!cy) return;
            // Explicitly cast to 'any' to bypass potential incorrect linter errors
            (cy.elements() as any).removeClass('non-highlight neighbor-highlight');
        });

        // --- Add Handler to Clear Selection on Background Tap ---
        cy.on('tap', (evt: cytoscape.EventObject) => {
             // Check if the tap target is the core (background)
             if (evt.target === cy && cy) {
                 cy.$('.selected-node').removeClass('selected-node');
                 console.log('[DEBUG] Cleared node selection (background tap).');
             }
        });
        // --- End Clear Selection Handler ---

        console.log('[DEBUG] Knowledge graph initialized successfully with fcose layout.');
    } catch (error) {
        console.error('[DEBUG] Failed to initialize Cytoscape:', error);
        let errorMessage = '知识图谱渲染失败。';
         if (error instanceof Error) {
            errorMessage += ` 错误详情: ${error.message}`;
         }
        displayError(errorMessage);
        if (container) container.innerHTML = `<p class="p-4 text-center text-red-500">${errorMessage}</p>`;
    }
}

// ---- Theme Switching ----
const themeToggleBtn = document.getElementById('theme-toggle');
const htmlElement = document.documentElement;

function updateToggleButtonIcon(): void {
    const sunIcon = themeToggleBtn?.querySelector('.fa-sun');
    const moonIcon = themeToggleBtn?.querySelector('.fa-moon');
    // Simplify icon toggling based on the presence of 'dark' class
    if (htmlElement.classList.contains('dark')) {
        moonIcon?.classList.remove('hidden');
        sunIcon?.classList.add('hidden');
    } else {
        sunIcon?.classList.remove('hidden');
        moonIcon?.classList.add('hidden');
    }
}

function updateGraphTheme(theme: 'light' | 'dark'): void {
    if (!cy) {
        console.warn('[DEBUG] updateGraphTheme called but cy instance is not ready.');
        return;
    }
    console.log('[DEBUG] Updating graph theme to:', theme);
    const nodeColor = theme === 'dark' ? '#ccc' : '#fff';
    const nodeOutline = theme === 'dark' ? '#555' : '#888';
    const edgeColor = theme === 'dark' ? '#555' : '#ccc';
    cy.batch(() => { 
        cy!.nodes().style({
            'color': nodeColor,
            'text-outline-color': nodeOutline
        });
        cy!.edges().style({
            'line-color': edgeColor,
            'target-arrow-color': edgeColor
        });
    });
}

function setTheme(theme: 'light' | 'dark'): void {
    console.log('[DEBUG] Setting theme to:', theme);
    currentTheme = theme; // Update global theme state
    if (theme === 'dark') {
        htmlElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    } else {
        htmlElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    }
    updateToggleButtonIcon(); 
    updateGraphTheme(theme); // Update graph style AFTER theme is set
}

function initTheme(): void {
    console.log('[DEBUG] Initializing theme...');
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        setTheme('dark');
    } else {
        setTheme('light');
    }
    // Add listener for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        const newColorScheme = event.matches ? "dark" : "light";
        // Only change if no theme explicitly set by user
        if (!localStorage.getItem('theme')) {
            setTheme(newColorScheme);
        }
    });

    // Add listener for the toggle button
    const themeToggleButton = document.getElementById('theme-toggle');
    themeToggleButton?.addEventListener('click', () => {
        const newTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme); // Save user preference
    });
    console.log('[DEBUG] Theme initialized to:', currentTheme);
}

/**
 * Initializes tab switching functionality.
 */
function initTabs(): void {
    console.log('[DEBUG] Initializing tabs...');
    const tabsContainer = document.getElementById('category-tabs');
    if (!tabsContainer) {
        console.warn('[DEBUG] Tab container #category-tabs not found. Skipping tab initialization.');
        return;
    }
    const tabButtons = tabsContainer.querySelectorAll<HTMLButtonElement>('.tab-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;
            if (!category) return;

            currentCategory = category; // Update global state

            // Update button styles
            tabButtons.forEach(btn => {
                if (btn === button) {
                    // Active tab styles
                    btn.classList.add('border-blue-500', 'text-blue-600', 'dark:border-blue-400', 'dark:text-blue-300');
                    btn.classList.remove('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300', 'dark:text-gray-400', 'dark:hover:text-gray-200', 'dark:hover:border-gray-600');
                    btn.setAttribute('aria-current', 'page');
                } else {
                    // Inactive tab styles
                    btn.classList.remove('border-blue-500', 'text-blue-600', 'dark:border-blue-400', 'dark:text-blue-300');
                    btn.classList.add('border-transparent', 'text-gray-500', 'hover:text-gray-700', 'hover:border-gray-300', 'dark:text-gray-400', 'dark:hover:text-gray-200', 'dark:hover:border-gray-600');
                    btn.removeAttribute('aria-current');
                }
            });

            // Render cards for the selected category
            displayCardsForCategory(category, allPages);

            // Optional: Filter/update graph based on category
            // updateGraphFilter(category);
            console.log(`[DEBUG] Switched to tab: ${category}`);
        });
    });
    console.log(`[DEBUG] Tab event listeners added to ${tabButtons.length} buttons.`);
}

// Optional: Function to filter graph (implement later if needed)
// function updateGraphFilter(category: string): void {
//     if (!cy) return;
//     console.log(`[DEBUG] Filtering graph for category: ${category}`);
//     if (category === 'all') {
//         cy.elements().style({ 'display': 'element' });
//     } else {
//         cy.nodes().forEach(node => {
//             if (node.data('category') === category) {
//                 node.style({ 'display': 'element' });
//                 node.connectedEdges().style({ 'display': 'element' }); // Show connected edges
//             } else {
//                 node.style({ 'display': 'none' });
//                 node.connectedEdges().style({ 'display': 'none' }); // Hide edges connected to hidden nodes
//             }
//         });
//         // Need to re-run layout potentially after filtering?
//         // cy.layout({ name: 'fcose' }).run(); 
//     }
// }

/**
 * Initialize the application
 */
async function init(): Promise<void> {
    console.log('[DEBUG] Initializing application...');
    initTheme(); // Initialize theme first

    const metadata = await loadMetadata();
    if (!metadata || !metadata.pages || metadata.pages.length === 0) {
        console.warn('[DEBUG] No page data loaded or available. Initialization might be incomplete.');
        // Display error already handled in loadMetadata
        // Ensure loading indicators are removed or updated
        const cardsContainer = document.getElementById('cards-container');
        if (cardsContainer) cardsContainer.innerHTML = '<p class="text-gray-500 dark:text-gray-400 col-span-full text-center">无法加载内容索引。</p>';
        const graphContainer = document.getElementById('knowledge-graph')?.querySelector('p');
        if (graphContainer) graphContainer.textContent = '无法加载知识图谱。';
        return;
    }

    allPages = metadata.pages; // Store pages globally
    currentCategory = 'all'; // Set initial category

    console.log('[DEBUG] Initializing tabs...');
    initTabs(); // Setup tab click handlers

    console.log('[DEBUG] Displaying initial cards (all categories)...');
    displayCardsForCategory('all', allPages); // Display initial cards for the default 'all' tab
    
    console.log('[DEBUG] Building graph data and initializing graph...');
    const graphElements = buildGraphData(allPages);
    initKnowledgeGraph(graphElements);

    // REMOVED CALL to old renderAllCards
    // renderAllCards(metadata.pages);

    console.log('[DEBUG] Application initialized successfully.');
}

// ---- Initialization ----
document.addEventListener('DOMContentLoaded', init);
