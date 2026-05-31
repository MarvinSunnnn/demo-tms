// ═══════════════════════════════════════════════════════════
//  跨境 DemoTMS · 应用逻辑层
// ═══════════════════════════════════════════════════════════

// ─── 页面路由 ───
const breadcrumbs = {
  'access-center': '接入中心',
  'order-list':    '订单中心',
  'order-entry':   '订单接入',
  'order-detail':  '履约概览',
  'dispatch':      '调度方案',
  'exception':     '异常工单',
  'customer-sync': '客户同步',
  'billing':       '费用对账',
  'attach':        '附件',
  'ai-dashboard':  'AI 效果看板',
  'knowledge':     '知识库管理',
  'rules':         '规则配置',
  'system-flow':   '流程示意图',
};

function navigate(el) {
  const page = el.dataset.page;
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  el.classList.add('active');
  loadPage(page);
}

function loadPage(page) {
  STATE.currentPage = page;
  document.getElementById('breadcrumb-current').textContent = breadcrumbs[page] || page;
  const content = document.getElementById('content');
  content.innerHTML = '';
  const html = PAGES[page] ? PAGES[page]() : `<div style="color:var(--text-muted);padding:40px;text-align:center">页面构建中...</div>`;
  content.innerHTML = html;
  content.scrollTop = 0;
  // 调度方案页默认选中目的国清关
  if (page === 'dispatch') { setTimeout(() => selectDispatchSegment('目的国清关'), 50); }
  if (page === 'exception' && !STATE.aiGenerated) { setTimeout(() => startAIGeneration(), 400); }

}

// ─── 订单详情 Tab 切换 ───
function switchDetailTab(tab) {
  // 同步侧边栏高亮
  const tabToNav = {
    overview: 'order-detail', dispatch: 'dispatch',
    exception: 'exception', customer: 'customer-sync',
    billing: 'billing', attach: 'order-detail',
  };
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navTarget = tabToNav[tab] || 'order-detail';
  const navEl = document.querySelector(`[data-page="${navTarget}"]`);
  if (navEl) navEl.classList.add('active');

  STATE.detailTab = tab;
  document.getElementById('breadcrumb-current').textContent = breadcrumbs[navTarget] || '';

  const content = document.getElementById('detail-tab-content');
  if (content) {
    content.innerHTML = renderDetailTab(tab);
    // 如果切到异常工单且 AI 还没生成过，自动启动
    if (tab === 'exception' && !STATE.aiGenerated) {
      setTimeout(() => startAIGeneration(), 600);
    }
  } else {
    // 从其他页面跳进来，重新渲染整个详情页
    loadPage(navTarget);
    STATE.currentPage = navTarget;
    if (tab === 'exception' && !STATE.aiGenerated) {
      setTimeout(() => startAIGeneration(), 800);
    }
  }

  // 更新 Tab 按钮高亮
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const tabBtns = document.querySelectorAll('.tab-btn');
  const labelMap = { overview:'履约概览', dispatch:'调度方案', exception:'异常工单', customer:'客户同步', billing:'费用对账', attach:'附件' };
  tabBtns.forEach(b => { if (b.textContent.includes(labelMap[tab] || '')) b.classList.add('active'); });
}

// 从订单列表进入详情
function goToEntry() {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const el = document.querySelector('[data-page="order-entry"]');
  if (el) el.classList.add('active');
  loadPage('order-entry');
}

function goToDetail() {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const el = document.querySelector('[data-page="order-detail"]');
  if (el) el.classList.add('active');
  loadPage('order-detail');
}

// 从处置项直接跳 Tab
function goToTab(page) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const el = document.querySelector(`[data-page="${page}"]`);
  if (el) { el.classList.add('active'); loadPage(page); }
}

// ─── 子节点弹框 ───
function showSubNodes(segName) {
  const nodes = DATA.segmentSubNodes[segName];
  if (!nodes) return;
  const rows = nodes.map(n => {
    const sc = n.status === 'done' ? 'green' : n.status === 'active' ? 'amber' : 'gray';
    const statusText = n.status === 'done' ? '已完成' : n.status === 'active' ? '处理中' : n.status === 'pending' ? '未开始' : '未触发';
    return `<tr>
      <td>${n.status === 'active' ? '<span style="color:var(--amber)">▶ </span>' : ''}${n.name}</td>
      <td>${badge(statusText, sc)}</td>
      <td style="font-family:var(--font-mono);font-size:10px">${n.plan}</td>
      <td style="font-family:var(--font-mono);font-size:10px">${n.actual}</td>
      <td style="font-size:11px">${n.owner}</td>
      <td style="font-size:10px;color:var(--text-muted)">${n.source}</td>
      <td style="font-size:10px;color:var(--text-muted)">${n.note}</td>
    </tr>`;
  }).join('');
  const modal = document.getElementById('modal');
  const body = document.getElementById('modal-body');
  body.innerHTML = `
    <div class="modal-title">${segName} · 子节点明细</div>
    <div style="max-height:50vh;overflow-y:auto">
      <table class="data-table">
        <thead><tr><th>子节点</th><th>状态</th><th>计划</th><th>实际/回传</th><th>责任方</th><th>来源</th><th>说明</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div style="display:flex;justify-content:flex-end;margin-top:14px">
      <button class="btn btn-ghost btn-sm" onclick="closeModal()">关闭</button>
    </div>`;
  modal.classList.add('open');
}

// ─── 展开/折叠关联处置项 ───
function toggleHandlers(i) {
  const wrap = document.getElementById(`hw-${i}`);
  const tr = document.getElementById(`handlers-${i}`);
  if (!wrap || !tr) return;
  if (tr.style.display === 'table-row') {
    wrap.style.maxHeight = wrap.scrollHeight + 'px';
    requestAnimationFrame(() => {
      wrap.style.transition = 'max-height 0.2s ease, opacity 0.15s ease, padding 0.15s ease';
      wrap.style.maxHeight = '0px';
      wrap.style.opacity = '0';
      wrap.style.paddingTop = '0';
      wrap.style.paddingBottom = '0';
      wrap.addEventListener('transitionend', function h() {
        wrap.removeEventListener('transitionend', h);
        tr.style.display = 'none';
        wrap.style.transition = '';
        wrap.style.opacity = '';
        wrap.style.paddingTop = '';
        wrap.style.paddingBottom = '';
      });
    });
  } else {
    tr.style.display = 'table-row';
    wrap.style.maxHeight = '0px';
    wrap.style.opacity = '0';
    wrap.style.paddingTop = '0';
    wrap.style.paddingBottom = '0';
    wrap.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      wrap.style.transition = 'max-height 0.25s ease, opacity 0.2s ease, padding 0.2s ease';
      wrap.style.maxHeight = '300px';
      wrap.style.opacity = '1';
      wrap.style.paddingTop = '12px';
      wrap.style.paddingBottom = '12px';
      wrap.addEventListener('transitionend', function h() {
        wrap.removeEventListener('transitionend', h);
        wrap.style.maxHeight = '';
        wrap.style.overflow = '';
        wrap.style.transition = '';
      });
    });
  }
}

// ─── 折叠面板 ───
function toggleModule(key) {
  const body = document.getElementById(`body-${key}`);
  const arrow = document.getElementById(`arrow-${key}`);
  const card = document.getElementById(`module-${key}`);
  if (!body) return;
  const isOpen = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  if (arrow) arrow.style.transform = isOpen ? 'rotate(-90deg)' : 'rotate(0)';
  if (card) card.classList.toggle('expanded', !isOpen);
}

// ─── 异常标签切换 ───
function switchExceptionTab(idx) {
  STATE.exceptionTab = idx;
  STATE.aiGenerated = (idx === 0); // 只有第一条(P1清关超时)已生成AI
  loadPage('exception');
}

// ─── AI 生成动效 ───
function startAIGeneration() {
  STATE.aiGenerated = true;
  const modules = ['attribution', 'sop', 'message', 'cost'];
  const delays = [0, 3200, 5800, 8200];
  const titles = ['归因分析', 'SOP 推荐', '客户话术草稿', '费用影响提示'];
  const subtitles = [`置信度 ${DATA.aiAttribution.confidenceOverall}%`, DATA.aiSop.name, '已生成 · 含 2 处风险词', `${DATA.aiCost.types.length} 项`];
  const contentFns = [aiAttrContent, aiSopContent, aiMsgContent, aiCostContent];

  modules.forEach((key, idx) => {
    // 先把每个模块设为"生成中"
    setModuleLoading(key, titles[idx]);

    setTimeout(() => {
      typewriterModule(key, titles[idx], subtitles[idx], contentFns[idx]);
    }, delays[idx]);
  });
}

function setModuleLoading(key, title) {
  const statusEl = document.getElementById(`status-${key}`);
  if (statusEl) statusEl.innerHTML = badge('生成中...', 'amber');
  const body = document.getElementById(`body-${key}`);
  if (body) {
    body.innerHTML = 'AI 正在分析<span class="typewriter-cursor"></span>';
  }
}

function typewriterModule(key, title, subtitle, contentFn) {
  const statusEl = document.getElementById(`status-${key}`);
  const subtitleEl = document.getElementById(`subtitle-${key}`);
  const body = document.getElementById(`body-${key}`);
  if (!body) return;

  const fullHTML = contentFn();
  body.innerHTML = '<div id="tw-target"></div>';
  const target = document.getElementById('tw-target');

  // 提取第一段可见文字（第一个卡片的 reason）
  let typeText = '';
  if (key === 'attribution') typeText = DATA.aiAttribution.results[0].reason;
  else if (key === 'sop') typeText = DATA.aiSop.steps[0];
  else if (key === 'message') typeText = DATA.aiMessage.draft.slice(0, 60) + '...';
  else if (key === 'cost') typeText = DATA.aiCost.types[0].name + '：' + DATA.aiCost.types[0].amount;

  let i = 0;
  target.innerHTML = `<div style="font-size:12px;color:var(--text-secondary);line-height:1.7"></div>`;
  const textNode = target.querySelector('div');

  const timer = setInterval(() => {
    if (i < typeText.length) {
      textNode.textContent = typeText.slice(0, ++i);
    } else {
      clearInterval(timer);
      // 打字完成后，替换为完整内容
      setTimeout(() => {
        body.innerHTML = fullHTML;
        if (statusEl) statusEl.innerHTML = badge('已生成', 'blue');
        if (subtitleEl) subtitleEl.textContent = subtitle;
        // 进度条动画
        document.querySelectorAll('.confidence-fill, .progress-fill').forEach(el => {
          const w = el.style.width;
          el.style.width = '0';
          setTimeout(() => { el.style.width = w; }, 50);
        });
      }, 200);
    }
  }, 28);
}

// ─── 模块采纳 ───
function adoptModule(key) {
  const statusEl = document.getElementById(`status-${key}`);
  if (statusEl) statusEl.innerHTML = badge('✓ 已采纳', 'green');
  showToast(`${key === 'attribution' ? '归因' : key === 'sop' ? 'SOP' : key === 'message' ? '话术' : '费用'} 模块已采纳，已写入反馈日志`);

  // 更新关闭前置校验
  updateCloseCheck(key);
}

function updateCloseCheck(key) {
  const checks = document.querySelectorAll('#ai-modules ~ div .close-check, [data-close-check]');
  // 简化处理：Toast 说明即可
}

// ─── 风险词修复 ───
let riskFixed = 0;
function fixRisk(btn, type) {
  btn.closest('.alert').style.opacity = '0.4';
  btn.textContent = '已修复';
  btn.disabled = true;
  riskFixed++;
  showToast(`已修复风险词：${type}`);
  if (riskFixed >= DATA.aiMessage.risks.length) {
    const sendBtn = document.getElementById('send-btn');
    const badge_el = document.getElementById('sync-state-badge');
    if (sendBtn) {
      sendBtn.style.opacity = '1';
      sendBtn.textContent = '发送';
      sendBtn.onclick = () => {
        sendBtn.textContent = '发送中...';
        setTimeout(() => {
          sendBtn.textContent = '✓ 已发送';
          sendBtn.disabled = true;
          if (badge_el) badge_el.innerHTML = badge('已发送', 'green');
          showToast('客户同步消息已发送，已写入同步记录');
        }, 800);
      };
    }
    if (badge_el) badge_el.innerHTML = badge('待发送·风险词已清除', 'blue');
  }
}

function trySend() {
  if (riskFixed < DATA.aiMessage.risks.length) {
    showToast('⚠ 存在未消除的风险词，请先修复', 'amber');
  }
}

// ─── 模态框 ───
function showModal(type, extra) {
  const modal = document.getElementById('modal');
  const body = document.getElementById('modal-body');

  const templates = {
    rejectModule: (module) => `
      <div class="modal-title">驳回 · ${module} 模块</div>
      <div style="font-size:12px;color:var(--text-muted);margin-bottom:14px">驳回原因必填，将进入 Prompt 评估报告</div>
      <div style="margin-bottom:10px">
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px">驳回原因（必选）</div>
        <select class="input" style="width:100%">
          <option>归因方向错误</option><option>SOP 不适用</option>
          <option>话术风格不符</option><option>费用判断不准</option><option>其他</option>
        </select>
      </div>
      <div style="margin-bottom:14px">
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px">具体说明（必填）</div>
        <textarea class="input" style="width:100%;height:70px;resize:none" placeholder="请描述具体问题，将用于优化 Prompt..."></textarea>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button class="btn btn-ghost" onclick="closeModal()">取消</button>
        <button class="btn btn-danger" onclick="closeModal();showToast('驳回已记录，已计入 Prompt 评估报告')">确认驳回</button>
      </div>`,

    modifyAttribution: () => `
      <div class="modal-title">修改后采纳 · 归因分析</div>
      <div style="font-size:12px;color:var(--text-muted);margin-bottom:14px">AI 方向对，细节可调整。修改内容将进入知识库待审核队列。</div>
      <textarea class="input" style="width:100%;height:80px;resize:none;margin-bottom:14px">${DATA.aiAttribution.results[0].reason}</textarea>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button class="btn btn-ghost" onclick="closeModal()">取消</button>
        <button class="btn btn-success" onclick="closeModal();showToast('修改后采纳已记录，diff 已保存')">保存修改并采纳</button>
      </div>`,

    modifySOP: () => `
      <div class="modal-title">编辑 SOP 步骤</div>
      <div style="font-size:12px;color:var(--text-muted);margin-bottom:14px">可删减步骤或插入经验步骤。修改将进入知识库待审核。</div>
      ${DATA.aiSop.steps.map((s, i) => `
        <div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:8px">
          <span style="background:var(--accent);color:#fff;border-radius:50%;width:16px;height:16px;display:flex;align-items:center;justify-content:center;font-size:9px;flex-shrink:0;margin-top:4px">${i+1}</span>
          <input class="input" style="flex:1" value="${s}">
          <button class="btn btn-ghost btn-sm" onclick="showToast('步骤已删除')">✕</button>
        </div>`).join('')}
      <button class="btn btn-ghost btn-sm" style="margin-bottom:14px" onclick="showToast('已插入新步骤')">+ 插入步骤</button>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button class="btn btn-ghost" onclick="closeModal()">取消</button>
        <button class="btn btn-success" onclick="closeModal();showToast('SOP 修改已保存，进入待审核队列')">保存并采纳</button>
      </div>`,

    fillReason: () => `
      <div class="modal-title">填写偏离调度原因</div>
      <div style="font-size:12px;color:var(--text-muted);margin-bottom:14px">偏离系统推荐方案需留痕，用于后续复盘</div>
      <textarea class="input" style="width:100%;height:80px;resize:none;margin-bottom:14px" placeholder="请说明偏离推荐方案的原因..."></textarea>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button class="btn btn-ghost" onclick="closeModal()">取消</button>
        <button class="btn btn-primary" onclick="closeModal();showToast('偏离原因已记录')">确认</button>
      </div>`,

    fillResponsible: () => `
      <div class="modal-title">确认费用责任方</div>
      <div style="font-size:12px;color:var(--text-muted);margin-bottom:14px">AI 不自动判责，由财务人工确认</div>
      <div style="margin-bottom:10px">
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px">补资料费责任方</div>
        <select class="input" style="width:100%"><option>清关服务商承担</option><option>委托客户承担</option><option>平台内部承担</option><option>待议</option></select>
      </div>
      <div style="margin-bottom:14px">
        <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px">备注</div>
        <textarea class="input" style="width:100%;height:60px;resize:none" placeholder="判责依据..."></textarea>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end">
        <button class="btn btn-ghost" onclick="closeModal()">取消</button>
        <button class="btn btn-primary" onclick="closeModal();showToast('责任方已确认，已关联费用对账')">确认</button>
      </div>`,
  };

  const tpl = templates[type];
  if (!tpl) return;
  body.innerHTML = tpl(extra);
  modal.classList.add('open');
}

function closeModal(e) {
  if (e && e.target !== document.getElementById('modal')) return;
  document.getElementById('modal').classList.remove('open');
}

// ─── Toast 通知 ───
let toastTimer = null;
function showToast(msg, type = 'blue') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = `
      position:fixed;bottom:24px;right:24px;z-index:200;
      padding:10px 18px;border-radius:8px;font-size:12px;font-weight:500;
      max-width:340px;pointer-events:none;
      transition:opacity 0.25s,transform 0.25s;
      box-shadow:0 8px 32px rgba(0,0,0,0.4);
    `;
    document.body.appendChild(toast);
  }
  const colors = {
    blue: 'background:rgba(30,58,100,0.95);border:1px solid rgba(59,130,246,0.4);color:#93c5fd',
    green: 'background:rgba(20,50,30,0.95);border:1px solid rgba(34,197,94,0.4);color:#86efac',
    amber: 'background:rgba(60,40,10,0.95);border:1px solid rgba(245,158,11,0.4);color:#fcd34d',
    red: 'background:rgba(60,20,20,0.95);border:1px solid rgba(239,68,68,0.4);color:#fca5a5',
  };
  toast.style.cssText += colors[type] || colors.blue;
  toast.textContent = msg;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
  }, 2800);
}

// ─── AI 话术语言切换 ───
function switchMsgLang(lang) {
  const el = document.getElementById('msg-lang');
  const label = document.getElementById('lang-label');
  if (!el || !label) return;
  if (lang === 'EN') {
    el.textContent = DATA.aiMessage.draftEN;
    label.innerHTML = '🇬🇧 English（AI 翻译·只读）';
  } else {
    el.textContent = DATA.aiMessage.draftVN;
    label.innerHTML = '🇻🇳 Tiếng Việt（AI 翻译·只读）';
  }
}

// ─── badge 工具（全局可用）───
function badge(text, color) {
  return `<span class="badge badge-${color}"><span class="badge-dot"></span>${text}</span>`;
}

// ─── 调度段选择 ───
function selectDispatchSegment(segName) {
  document.querySelectorAll('.dispatch-seg-card').forEach(el => {
    if (el.dataset.seg === segName) {
      el.style.background = 'rgba(99,102,241,0.05)';
      el.style.borderColor = 'rgba(99,102,241,0.3)';
    } else {
      el.style.background = '';
      el.style.borderColor = '';
    }
  });
  const detail = document.getElementById('dispatch-detail');
  if (detail) { detail.innerHTML = renderDispatchDetail(segName); }
}

// ─── 工作队列筛选 ───
function queueFilter(el, type) {
  document.querySelectorAll('.queue-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  showToast(`已切换到「${el.textContent.trim().replace(/ \d+$/, '')}」队列（演示模式）`, 'blue');
}

// ─── 地址候选选择 ───
let selectedAddressCandidate = 0;

function selectAddressCandidate(n) {
  selectedAddressCandidate = n;
  // 更新所有候选的视觉状态
  document.querySelectorAll('[data-candidate]').forEach(el => {
    const num = parseInt(el.dataset.candidate);
    if (num === n) {
      el.style.borderColor = 'rgba(99,102,241,0.5)';
      el.style.background = 'rgba(99,102,241,0.05)';
      el.dataset.selected = '1';
    } else {
      el.style.borderColor = 'transparent';
      el.style.background = 'var(--bg-base)';
      el.dataset.selected = '0';
    }
  });
  // 更新确认按钮
  const btn = document.getElementById('confirm-addr-btn');
  if (btn) {
    btn.disabled = false;
    btn.textContent = `确认选择 候选 ${n}`;
  }
}

function confirmAddressCandidate() {
  if (!selectedAddressCandidate) {
    showToast('请先选择一个候选地址', 'amber');
    return;
  }
  showToast(`已确认选择 候选 ${selectedAddressCandidate}，地址已回写履约单`);
}

// ─── 初始化 ───
document.addEventListener('DOMContentLoaded', () => {
  // 加载默认页
  loadPage('access-center');

  // 键盘快捷键
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal({ target: document.getElementById('modal') });
  });
});
