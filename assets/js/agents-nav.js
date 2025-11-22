// Agent 教学站点：导航与暗色模式
(function(){
  const navItems = [
    { title: '总览', href: 'index.html' },
    { title: '快速上手', href: 'quickstart.html' },
    { title: '工具与框架', href: 'tools.html' },
    { title: 'OpenAI AgentKit', href: 'openai-agentkit.html' },
    { title: 'LangChain', href: 'langchain.html' },
    { title: 'n8n', href: 'n8n.html' },
    { title: '规划与记忆', href: 'planning-memory.html' },
    { title: 'Agent + RAG', href: 'rag.html' },
    { title: '多智能体协作', href: 'multi-agent.html' },
    { title: '评测与安全', href: 'eval-safety.html' },
    { title: '案例', href: 'cases.html' },
    { title: '实验室', href: 'labs/index.html' }
  ];

  function getCurrentFile() {
    try {
      const parts = location.pathname.split('/').filter(Boolean);
      return parts[parts.length - 1] || 'index.html';
    } catch { return 'index.html'; }
  }

  function renderNav(container) {
    const cur = getCurrentFile();
    const nav = document.createElement('nav');
    nav.className = 'ag-nav';
    navItems.forEach(it => {
      const a = document.createElement('a');
      a.href = it.href;
      a.textContent = it.title;
      if (cur === it.href || (cur === '' && it.href === 'index.html')) a.classList.add('active');
      nav.appendChild(a);
    });
    container.innerHTML = '';
    container.appendChild(nav);
  }

  function setupDarkMode(btn) {
    const root = document.documentElement;
    const saved = localStorage.getItem('ag-theme');
    if (saved === 'dark' || (!saved && matchMedia('(prefers-color-scheme: dark)').matches)) root.classList.add('dark');
    btn?.addEventListener('click', () => {
      root.classList.toggle('dark');
      localStorage.setItem('ag-theme', root.classList.contains('dark') ? 'dark' : 'light');
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const navMount = document.getElementById('agentsNav');
    if (navMount) renderNav(navMount);
    setupDarkMode(document.getElementById('darkModeToggle'));
  });
})();
