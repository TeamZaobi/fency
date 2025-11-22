// Content Enhancer: cards layout, TOC, Mermaid and ECharts support
(function(){
  const state = { enhanced: false };

  function slugify(text){
    return (text||'')
      .toString()
      .trim()
      .toLowerCase()
      .replace(/\s+/g,'-')
      .replace(/[^\w\-\u4e00-\u9fa5]/g,'')
      .replace(/\-+/g,'-');
  }

  function ensureScript(src){
    return new Promise((resolve,reject)=>{
      if ([...document.scripts].some(s=>s.src.includes(src))) return resolve();
      const s = document.createElement('script'); s.src = src; s.async = true; s.onload = resolve; s.onerror = reject; document.head.appendChild(s);
    });
  }

  async function renderMermaid(root){
    // Support multiple class patterns from different MD renderers
    const codeBlocks = root.querySelectorAll(
      'pre code.language-mermaid, code.language-mermaid, pre code.lang-mermaid, code.lang-mermaid, pre code[class*="mermaid"], code[class*="mermaid"]'
    );
    if (codeBlocks.length === 0) return;
    try { await ensureScript('https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js'); } catch(e) { return; }
    if (window.mermaid && typeof window.mermaid.initialize === 'function') {
      window.mermaid.initialize({ startOnLoad: false, theme: 'neutral', securityLevel: 'loose' });
    }
    codeBlocks.forEach((code)=>{
      const src = (code.textContent || '').trim();
      // Validate before replacing to avoid Mermaid's big error box
      let isValid = true;
      if (window.mermaid && typeof window.mermaid.parse === 'function') {
        try { window.mermaid.parse(src); } catch(_) { isValid = false; }
      }
      if (!isValid) return; // keep original code block if invalid
      const holder = document.createElement('div');
      holder.className = 'mermaid';
      holder.textContent = src;
      const pre = code.closest('pre');
      if (pre) pre.replaceWith(holder); else code.replaceWith(holder);
    });
    try {
      if (window.mermaid && typeof window.mermaid.run === 'function') {
        window.mermaid.run({ querySelector: '.mermaid' });
      } else if (window.mermaid && typeof window.mermaid.init === 'function') {
        window.mermaid.init(undefined, document.querySelectorAll('.mermaid'));
      }
    } catch(e) {
      // swallow to avoid breaking the page
    }
  }

  async function renderCharts(root){
    const blocks = root.querySelectorAll(
      'code.language-chart, code.language-echarts, code.lang-chart, code.lang-echarts, code[class*="chart"], code[class*="echarts"]'
    );
    if (blocks.length === 0) return;
    try { await ensureScript('https://cdn.jsdelivr.net/npm/echarts/dist/echarts.min.js'); } catch(e) { return; }
    blocks.forEach((code, idx)=>{
      const json = (code.textContent || '').trim();
      let option = null;
      try { option = JSON.parse(json); } catch(_){ /* keep as code if invalid */ }
      const pre = code.closest('pre');
      if (!option || !pre) return;
      const box = document.createElement('div');
      box.style.minHeight = '280px';
      box.style.border = '1px solid var(--color-border)';
      box.style.borderRadius = 'var(--radius-md)';
      box.style.background = 'var(--color-popover, transparent)';
      pre.replaceWith(box);
      const chart = window.echarts.init(box);
      chart.setOption(option);
      window.addEventListener('resize', ()=> chart.resize());
    });
  }

  function buildTOC(sections){
    const toc = document.createElement('section');
    toc.className = 'panel';
    const title = document.createElement('div');
    title.className = 'h2';
    title.textContent = '目录';
    const list = document.createElement('div');
    list.className = 'list';
    list.style.columnCount = 2;
    sections.forEach(sec=>{
      const a = document.createElement('a');
      a.href = `#${sec.id}`; a.textContent = sec.text; a.style.display='block'; a.style.margin='6px 0';
      list.appendChild(a);
    });
    toc.appendChild(title); toc.appendChild(list);
    return toc;
  }

  function toCards(container){
    if (!container || container.dataset.enhanced === '1') return;
    // assign ids to h2/h3 and slice into sections by h2
    const heads = [...container.querySelectorAll('h2, h3')];
    heads.forEach(h=>{ if (!h.id) h.id = slugify(h.textContent); });
    const h2s = [...container.querySelectorAll('h2')];
    const wrapper = document.createElement('div');
    wrapper.className = 'grid cols-2';
    const sectionsMeta = [];

    if (h2s.length === 0){
      // fallback: single card with existing content
      const card = document.createElement('div'); card.className = 'card';
      card.append(...[...container.childNodes]);
      wrapper.appendChild(card);
    } else {
      for (let i=0; i<h2s.length; i++){
        const start = h2s[i];
        const end = h2s[i+1];
        const card = document.createElement('div'); card.className = 'card';
        // capture next sibling BEFORE moving start out of container
        let n = start.nextSibling;
        card.appendChild(start);
        while(n && n !== end){ const next = n.nextSibling; card.appendChild(n); n = next; }
        wrapper.appendChild(card);
        sectionsMeta.push({ id: start.id, text: start.textContent });
      }
    }
    // replace container content
    container.innerHTML = '';
    container.appendChild(wrapper);
    container.dataset.enhanced = '1';
    return sectionsMeta;
  }

  async function enhance(root){
    if (!root || state.enhanced) return;
    // Build cards and TOC
    const sectionsMeta = toCards(root);
    // Insert TOC before container
    if (sectionsMeta && sectionsMeta.length){
      const toc = buildTOC(sectionsMeta);
      root.parentElement && root.parentElement.insertBefore(toc, root);
    }
    // Render diagrams/charts
    await renderMermaid(root);
    await renderCharts(root);
    state.enhanced = true;
  }

  function watch(){
    const mount = document.getElementById('mdMount');
    if (!mount) return;
    const obs = new MutationObserver(()=>{
      if (!mount.textContent || mount.textContent.trim() === '正在加载内容…') return;
      obs.disconnect();
      enhance(mount);
    });
    obs.observe(mount, { childList: true, subtree: true });
  }

  document.addEventListener('DOMContentLoaded', watch);
  // Expose manual entry
  window.AgentEnhancer = { enhance };
})();
