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
// Knowledge Graph Functions removed
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
            // Knowledge graph initialization removed
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
