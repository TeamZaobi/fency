import { Metadata, PageData } from './types';

// 元数据存储
let metadata: Metadata = { pages: [], lastUpdated: '' };

// 加载元数据
async function loadMetadata(): Promise<void> {
    try {
        const response = await fetch('metadata.json'); // 确保路径正确
        if (!response.ok) {
            throw new Error(`Failed to load metadata: ${response.status} ${response.statusText}`);
        }
        metadata = await response.json() as Metadata;
        console.log('Metadata loaded successfully');
        
        // 渲染所有分类的卡片
        renderAllCards();
        
        // 更新最后更新时间显示
        updateLastUpdatedDisplay();
    } catch (error) {
        console.error('Error loading or processing metadata:', error);
        displayError('无法加载内容列表，请稍后刷新重试。');
    }
}

// 渲染所有分类的卡片
function renderAllCards(): void {
    if (!metadata || !metadata.pages) {
        console.error('Metadata or pages array is missing.');
        displayError('元数据格式错误，无法加载内容。');
        return;
    }
    
    // 按日期排序（从新到旧）
    const sortedPages = [...metadata.pages].sort((a, b) => {
        // 添加对无效日期的处理
        const dateA = new Date(a.publishDate).getTime();
        const dateB = new Date(b.publishDate).getTime();
        if (isNaN(dateB)) return -1; // 将无效日期排在后面
        if (isNaN(dateA)) return 1; 
        return dateB - dateA;
    });

    // 获取所有分类的容器
    const containers: { [key: string]: HTMLElement | null } = {
        '信息化升级': document.getElementById('info-upgrade-cards'),
        '科研辅助': document.getElementById('research-cards'),
        'AI技术与生态': document.getElementById('ai-tech-cards'),
        '知识报告': document.getElementById('knowledge-cards')
    };

    // 清空所有容器
    Object.values(containers).forEach(container => {
        if (container) container.innerHTML = '';
    });

    // 渲染每个卡片到对应的分类容器
    sortedPages.forEach(page => {
        const container = containers[page.category];
        if (container) {
            const card = createCardElement(page);
            container.appendChild(card);
        } else {
            console.warn(`Container not found for category: ${page.category} for page: ${page.title}`);
        }
    });

    // 更新各分类的计数
    updateCategoryCounts();
}

// 创建卡片元素
function createCardElement(page: PageData): HTMLElement {
    const card = document.createElement('div');
    // 为卡片添加动画效果
    card.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-md p-5 transform transition-transform hover:scale-105 hover:shadow-lg fade-in'; 
    
    // 格式化日期为 YYYY-MM-DD
    let formattedDate = '日期无效';
    try {
        const publishDate = new Date(page.publishDate);
        if (!isNaN(publishDate.getTime())) {
            formattedDate = publishDate.toISOString().split('T')[0];
        }
    } catch (e) {
        console.error(`Error formatting date for page ${page.id}:`, e);
    }
    
    // 创建卡片内容
    card.innerHTML = `
        <a href="${page.path}" class="block h-full flex flex-col">
            <h3 class="text-xl font-bold mb-2 text-blue-600 dark:text-blue-400">${page.title}</h3>
            <p class="text-gray-600 dark:text-gray-300 mb-3 flex-grow">${page.description}</p> 
            <div class="flex justify-between items-center mt-auto pt-3 border-t border-gray-200 dark:border-gray-700">
                <span class="text-sm text-gray-500 dark:text-gray-400">
                    <i class="far fa-calendar-alt mr-1"></i>${formattedDate}
                </span>
                <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                    ${page.category}
                </span>
            </div>
        </a>
    `;
    
    return card;
}

// 更新各分类的计数
function updateCategoryCounts(): void {
    const categoryCounts: { [key: string]: number } = {
        '信息化升级': 0,
        '科研辅助': 0,
        'AI技术与生态': 0,
        '知识报告': 0
    };

    metadata.pages.forEach(page => {
        if (categoryCounts.hasOwnProperty(page.category)) {
            categoryCounts[page.category]++;
        }
    });

    for (const category in categoryCounts) {
        const categoryId = getCategoryId(category);
        const countElement = document.getElementById(`${categoryId}-count`);
        if (countElement) {
            countElement.textContent = categoryCounts[category].toString();
        }
        // 同时更新 Hero 区的计数
        const heroCountElement = document.getElementById(`${categoryId}-count`); // Hero区和分类区的ID相同
        if (heroCountElement) {
             heroCountElement.textContent = categoryCounts[category].toString();
        }
    }
}

// 根据分类名获取分类ID
function getCategoryId(category: string): string {
    switch (category) {
        case '信息化升级': return 'info-upgrade';
        case '科研辅助': return 'research';
        case 'AI技术与生态': return 'ai-tech';
        case '知识报告': return 'knowledge';
        default: return '';
    }
}

// 更新最后更新时间显示
function updateLastUpdatedDisplay(): void {
    const lastUpdatedElement = document.getElementById('last-updated');
    if (lastUpdatedElement && metadata.lastUpdated) {
        try {
            const updatedDate = new Date(metadata.lastUpdated);
            if (!isNaN(updatedDate.getTime())) {
                 // 格式化为 YYYY-MM-DD HH:mm
                const formattedTimestamp = updatedDate.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).replace(/\//g, '-');
                lastUpdatedElement.textContent = formattedTimestamp;
            } else {
                 lastUpdatedElement.textContent = metadata.lastUpdated; // 如果格式无效，直接显示原始字符串
            }
        } catch (e) {
            console.error('Error formatting lastUpdated timestamp:', e);
            lastUpdatedElement.textContent = metadata.lastUpdated; // 出错时显示原始字符串
        }
    } else if (lastUpdatedElement) {
        lastUpdatedElement.textContent = '未知';
    }
}

// 显示错误信息
function displayError(message: string): void {
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) {
        errorContainer.textContent = message;
        errorContainer.classList.remove('hidden');
    } else {
        console.error('Error container not found, error message:', message);
    }
}

// 初始化主题
function initTheme(): void {
    // 检查本地存储中的主题偏好
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // 如果有保存的偏好，使用保存的偏好；否则，跟随系统
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    
    // 设置主题切换按钮的状态
    updateThemeToggleButton();
}

// 切换主题
function toggleTheme(): void {
    if (document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
    }
    
    // 更新按钮状态
    updateThemeToggleButton();
}

// 更新主题切换按钮的状态
function updateThemeToggleButton(): void {
    const themeToggleButton = document.getElementById('theme-toggle');
    if (themeToggleButton) {
        const isDarkMode = document.documentElement.classList.contains('dark');
        
        // 更新按钮图标
        const moonIcon = themeToggleButton.querySelector('.fa-moon');
        const sunIcon = themeToggleButton.querySelector('.fa-sun');
        
        if (moonIcon && sunIcon) {
            if (isDarkMode) {
                moonIcon.classList.add('hidden');
                sunIcon.classList.remove('hidden');
            } else {
                moonIcon.classList.remove('hidden');
                sunIcon.classList.add('hidden');
            }
        }
    }
}

// 初始化知识图谱
function initKnowledgeGraph(): void {
    // 此功能将在后续实现
    console.log('Knowledge graph initialization placeholder');
}

// 当 DOM 加载完成时执行初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化主题
    initTheme();
    
    // 加载元数据
    loadMetadata();
    
    // 绑定主题切换按钮的点击事件
    const themeToggleButton = document.getElementById('theme-toggle');
    if (themeToggleButton) {
        themeToggleButton.addEventListener('click', toggleTheme);
    }
    
    // 初始化知识图谱（未来功能）
    // initKnowledgeGraph();
});
