// 决策智能可视化与动效逻辑
import Chart from 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';

// 认知偏差分布条形图
export function renderBiasBarChart(ctx) {
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [
        '确认偏差', '锚定偏差', '可得性启发', '事后偏差', '过度自信', '框架效应', '沉没成本谬误', '从众效应', '遗漏偏差', '负面偏差', '基本归因错误'
      ],
      datasets: [{
        label: '影响决策的认知偏差',
        data: [95, 90, 87, 85, 80, 78, 77, 75, 72, 70, 68],
        backgroundColor: 'rgba(45,127,249,0.7)',
        borderRadius: 8,
        maxBarThickness: 38
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: '常见认知偏差对决策的影响程度',
          color: '#2d7ff9',
          font: { size: 18, weight: 'bold' }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#222', font: { size: 14 } } },
        y: { beginAtZero: true, max: 100, ticks: { color: '#222', font: { size: 13 } } }
      },
      animation: {
        duration: 1200,
        easing: 'easeOutQuart'
      }
    }
  });
}

// 概念关系SVG思维导图
export function renderConceptMap(container) {
  container.innerHTML = `
  <svg width="100%" height="350" viewBox="0 0 960 350">
    <defs>
      <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#2d7ff9"/>
        <stop offset="100%" stop-color="#13c2c2"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="960" height="350" rx="28" fill="#f8fafc"/>
    <g font-family="Noto Sans SC, Arial" font-size="17">
      <rect x="400" y="30" width="160" height="46" rx="16" fill="url(#g1)"/>
      <text x="480" y="60" fill="#fff" text-anchor="middle" font-weight="bold">决策智能</text>
      <rect x="100" y="140" width="180" height="44" rx="14" fill="#fff" stroke="#2d7ff9" stroke-width="2"/>
      <text x="190" y="170" fill="#2d7ff9" text-anchor="middle">数据智能</text>
      <rect x="380" y="140" width="200" height="44" rx="14" fill="#fff" stroke="#13c2c2" stroke-width="2"/>
      <text x="480" y="170" fill="#13c2c2" text-anchor="middle">大语言模型（LLM）</text>
      <rect x="720" y="140" width="140" height="44" rx="14" fill="#fff" stroke="#2d7ff9" stroke-width="2"/>
      <text x="790" y="170" fill="#2d7ff9" text-anchor="middle">智能体</text>
      <rect x="280" y="260" width="400" height="44" rx="14" fill="#fff" stroke="#13c2c2" stroke-width="2"/>
      <text x="480" y="290" fill="#13c2c2" text-anchor="middle">高质量高效率决策</text>
      <path d="M480 76 Q480 120 190 140" stroke="#2d7ff9" stroke-width="2" fill="none" marker-end="url(#arrow)"/>
      <path d="M480 76 Q480 120 480 140" stroke="#13c2c2" stroke-width="2" fill="none" marker-end="url(#arrow)"/>
      <path d="M480 76 Q480 120 790 140" stroke="#2d7ff9" stroke-width="2" fill="none" marker-end="url(#arrow)"/>
      <path d="M190 184 Q190 220 480 260" stroke="#13c2c2" stroke-width="2" fill="none" marker-end="url(#arrow)"/>
      <path d="M480 184 Q480 220 480 260" stroke="#2d7ff9" stroke-width="2" fill="none" marker-end="url(#arrow)"/>
      <path d="M790 184 Q790 220 480 260" stroke="#13c2c2" stroke-width="2" fill="none" marker-end="url(#arrow)"/>
      <marker id="arrow" markerWidth="12" markerHeight="12" refX="6" refY="6" orient="auto" markerUnits="strokeWidth">
        <path d="M2,2 L10,6 L2,10 L6,6 L2,2" fill="#13c2c2"/>
      </marker>
    </g>
  </svg>`;
}

// 页面加载动效
export function fadeInPage() {
  document.body.style.opacity = 0;
  document.body.style.transition = 'opacity 1.2s cubic-bezier(.6,0,.4,1)';
  setTimeout(() => { document.body.style.opacity = 1; }, 80);
}

document.addEventListener('DOMContentLoaded', () => {
  fadeInPage();
  const biasChart = document.getElementById('bias-bar-chart');
  if (biasChart) renderBiasBarChart(biasChart.getContext('2d'));
  const conceptMap = document.getElementById('concept-map');
  if (conceptMap) renderConceptMap(conceptMap);
});
