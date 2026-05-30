// ═══════════════════════════════════════════════════════════
//  跨境 DemoTMS · 页面渲染层
// ═══════════════════════════════════════════════════════════

const PAGES = {};
const O = DATA.order;

// 工具函数
function badge(text, color) { return `<span class="badge badge-${color}"><span class="badge-dot"></span>${text}</span>`; }
function nodeStatusBadge(s) {
  const map = { normal: ['正常', 'green'], warning: ['预警', 'amber'], exception: ['异常', 'red'] };
  const [t, c] = map[s] || ['-', 'gray'];
  return badge(t, c);
}

// ─────────────────────────────────────────────
//  1. 订单中心 / 履约工作台
// ─────────────────────────────────────────────
PAGES['order-list'] = () => {
  const rows = DATA.orderList.map((o, i) => {
    const riskBadge = o.riskLevel === '-' ? '<span style="color:var(--text-muted)">无风险</span>'
      : badge(`${o.risk} ${o.riskLevel}`, o.riskLevel === 'P1' ? 'red' : 'amber');
    const slaColor = o.sla.includes('超') ? 'color:var(--red)' : o.sla.includes('即将') ? 'color:var(--amber)' : 'color:var(--text-secondary)';
    return `
      <tr>
        <td><span style="color:var(--accent-light);font-family:var(--font-mono);font-size:11px;cursor:pointer" onclick="goToDetail()">${o.tmsId}</span><div style="font-size:10px;color:var(--text-muted);margin-top:2px">${o.route}</div></td>
        <td>${o.customer}<br><span style="font-size:10px;color:var(--text-muted)">${o.level === 'KA' ? '<span style="color:var(--amber)">★ KA</span>' : o.level}</span></td>
        <td>${nodeStatusBadge(o.nodeStatus)}<div style="font-size:11px;margin-top:3px">${o.node}</div></td>
        <td><span style="${slaColor};font-family:var(--font-mono);font-size:11px">${o.sla}</span><div style="font-size:10px;color:var(--text-muted);margin-top:2px">来源:${o.source}</div></td>
        <td>${riskBadge}</td>
        <td>${o.handleCount > 0 ? `<span style="color:var(--accent-light);cursor:pointer" onclick="toggleHandlers(${i})">${o.handleCount} 项 ▾</span>` : '<span style="color:var(--text-muted)">-</span>'}</td>
        <td><button class="btn btn-primary btn-sm" onclick="${o.tmsId === O.tmsId ? 'goToDetail()' : 'showToast(\'演示仅支持主订单\')'}">${o.action}</button></td>
      </tr>
      ${o.handleCount > 0 ? `<tr id="handlers-${i}" style="display:none"><td colspan="7" style="padding:0;background:var(--bg-base)">
        <div style="padding:12px 16px">
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px;letter-spacing:0.5px">关联处置项</div>
          <table class="data-table" style="background:var(--bg-card);border-radius:8px;overflow:hidden">
            <thead><tr><th>处置项</th><th>等级</th><th>责任方</th><th>状态</th><th>入口</th></tr></thead>
            <tbody>${o.handlers.map(h => `<tr><td>${h.name}</td><td>${badge(h.level, h.level === 'P1' ? 'red' : 'amber')}</td><td>${h.owner}</td><td>${h.status}</td><td><span style="color:var(--accent-light);cursor:pointer" onclick="goToTab('${entryToTab(h.entry)}')">进入${h.entry} →</span></td></tr>`).join('')}</tbody>
          </table>
        </div>
      </td></tr>` : ''}
    `;
  }).join('');

  return `
    <div class="fade-in">
      <div class="queue-tabs">
        <div class="queue-tab active">全部订单</div>
        <div class="queue-tab">待接入处理 <span style="color:var(--amber)">1</span></div>
        <div class="queue-tab">待调度 <span style="color:var(--amber)">1</span></div>
        <div class="queue-tab">履约风险</div>
        <div class="queue-tab">异常处理中 <span style="color:var(--red)">1</span></div>
        <div class="queue-tab">待客户同步 <span style="color:var(--amber)">1</span></div>
        <div class="queue-tab">待费用确认</div>
      </div>

      <div class="card" style="padding:12px 16px;margin-bottom:14px">
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
          <div class="search-box" style="flex:1;min-width:200px">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--text-muted)" stroke-width="1.5"><circle cx="7" cy="7" r="5"/><line x1="11" y1="11" x2="14" y2="14"/></svg>
            <input placeholder="搜索履约单号 / 客户 / 目的城市...">
          </div>
          <select class="input"><option>全部客户</option><option>A 客户 (KA)</option></select>
          <select class="input"><option>当前节点</option><option>目的国清关</option></select>
          <select class="input"><option>风险等级</option><option>P1</option><option>P2</option></select>
          <button class="btn btn-secondary btn-sm">重置</button>
        </div>
      </div>

      <div class="card" style="padding:0">
        <table class="data-table">
          <thead><tr><th>履约单号</th><th>客户/等级</th><th>当前节点</th><th>节点 SLA</th><th>风险摘要</th><th>关联处置项</th><th>推荐动作</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>

      <div style="margin-top:14px;font-size:11px;color:var(--text-muted);text-align:center">
        💡 点击主订单 <span style="color:var(--accent-light);font-family:var(--font-mono)">TMS-20260529-10238</span> 的"处理异常"进入完整演示流程
      </div>
    </div>
  `;
};

function entryToTab(entry) {
  const m = { '异常工单': 'exception', '客户同步': 'customer-sync', '费用对账': 'billing', '订单接入': 'order-entry', '调度方案': 'dispatch' };
  return m[entry] || 'order-detail';
}

// ─────────────────────────────────────────────
//  2. 订单接入详情 / 校验页
// ─────────────────────────────────────────────
PAGES['order-entry'] = () => {
  const fieldRows = DATA.fieldChecks.map(c => `
    <tr><td>${c.obj}</td><td style="font-size:11px;color:var(--text-muted)">${c.fields}</td>
    <td>${checkIcon(c.result)}</td><td style="font-size:11px">${c.flow}</td></tr>
  `).join('');

  const ap = DATA.addressParse;
  const customsRows = DATA.customsCheck.map(c => `
    <tr><td>${c.obj}</td><td style="font-size:11px;color:var(--text-muted)">${c.fields}</td>
    <td>${checkIcon(c.result)}</td><td style="font-size:11px;${c.result === 'fail' ? 'color:var(--red)' : c.result === 'warn' ? 'color:var(--amber)' : ''}">${c.note}</td></tr>
  `).join('');

  return `
    <div class="fade-in">
      <div class="card" style="margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start">
          <div>
            <div style="font-size:15px;font-weight:600;color:var(--text-primary)">订单接入校验 · ${O.omsId}</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:4px">来源 API 推送 · 接入时间 05-29 08:00 · ${O.customer} (${O.customerLevel})</div>
          </div>
          ${badge('校验中', 'amber')}
        </div>
        <div class="divider"></div>
        <div style="font-size:12px;color:var(--text-secondary);line-height:1.6">
          <strong style="color:var(--text-primary)">接单门禁设计：</strong>订单可以先被 TMS 接收，但必须通过<span style="color:var(--accent-light)">字段校验、地址解析、清关资料预审</span>三关后，才允许生成可调度的履约单。把风险前置到接单阶段，避免到清关阶段才暴露（修复成本 5~10 倍）。
        </div>
      </div>

      <!-- 校验进度 -->
      <div class="card" style="margin-bottom:14px;padding:16px 20px">
        <div class="step-line">
          <div style="text-align:center"><div class="step-node done">✓</div><div style="font-size:10px;color:var(--green);margin-top:4px">字段校验</div></div>
          <div class="step-connector done"></div>
          <div style="text-align:center"><div class="step-node done">✓</div><div style="font-size:10px;color:var(--green);margin-top:4px">地址解析</div></div>
          <div class="step-connector done"></div>
          <div style="text-align:center"><div class="step-node error">!</div><div style="font-size:10px;color:var(--red);margin-top:4px">清关预审</div></div>
          <div class="step-connector"></div>
          <div style="text-align:center"><div class="step-node">4</div><div style="font-size:10px;color:var(--text-muted);margin-top:4px">生成履约单</div></div>
        </div>
      </div>

      <div class="grid-2" style="margin-bottom:14px">
        <!-- 字段校验 -->
        <div class="card">
          <div class="section-title"><span class="dot"></span>字段校验</div>
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:10px">核心是规则校验，不强行引入 AI。价值是分流——把订单分成可继续/待补资料/待确认/失败。</div>
          <table class="data-table"><thead><tr><th>校验对象</th><th>字段</th><th>结果</th><th>分流</th></tr></thead><tbody>${fieldRows}</tbody></table>
        </div>

        <!-- 地址解析 -->
        <div class="card">
          <div class="section-title"><span class="dot"></span>地址解析 <span style="font-size:10px;color:var(--accent-light);margin-left:4px">规则 + AI 辅助 + 人工确认</span></div>
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:10px">国内地址走地图 API，越南地址走多语言规则引擎 + AI 辅助识别。</div>
          <div style="background:var(--bg-base);border-radius:8px;padding:12px;margin-bottom:8px">
            <div style="font-size:11px;color:var(--text-muted)">起运地（国内）</div>
            <div style="font-size:12px;margin:4px 0">${ap.origin.std}</div>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span style="font-size:10px;font-family:var(--font-mono);color:var(--text-muted)">${ap.origin.coord}</span>
              <span style="font-size:11px;color:var(--green)">置信度 ${ap.origin.confidence}%</span>
            </div>
          </div>
          <div style="background:var(--bg-base);border-radius:8px;padding:12px">
            <div style="font-size:11px;color:var(--text-muted)">目的地（越南）</div>
            <div style="font-size:12px;margin:4px 0">${ap.dest.std}</div>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span style="font-size:10px;font-family:var(--font-mono);color:var(--text-muted)">${ap.dest.coord}</span>
              <span style="font-size:11px;color:var(--green)">置信度 ${ap.dest.confidence}%</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 清关资料预审 -->
      <div class="card" style="margin-bottom:14px">
        <div class="section-title"><span class="dot" style="background:var(--red);box-shadow:0 0 6px var(--red)"></span>清关资料预审 <span style="font-size:10px;color:var(--red);margin-left:4px">发现阻塞项</span></div>
        <table class="data-table"><thead><tr><th>预审对象</th><th>关键字段</th><th>结果</th><th>说明</th></tr></thead><tbody>${customsRows}</tbody></table>
        <div class="alert alert-red" style="margin-top:12px;margin-bottom:0">
          <span>⚠</span>
          <div><strong>收货人税号缺失</strong>，阻止生成履约单。AI 同时提示：申报价值 USD 45 低于品类均值，建议人工确认。<br><span style="color:var(--text-muted);font-size:11px">AI 只给风险提示和依据，不决定资料是否放行。</span></div>
        </div>
      </div>

      <div style="display:flex;gap:10px;justify-content:flex-end">
        <button class="btn btn-secondary" onclick="showToast('已生成补资料通知草稿，需人工确认后发送')">生成补资料通知</button>
        <button class="btn btn-secondary" style="opacity:0.5;cursor:not-allowed">生成履约单（门禁未通过）</button>
      </div>
    </div>
  `;
};

function checkIcon(result) {
  const map = {
    pass: '<span class="check-icon pass">✓</span><span style="color:var(--green);font-size:11px;margin-left:4px">通过</span>',
    fail: '<span class="check-icon fail">✕</span><span style="color:var(--red);font-size:11px;margin-left:4px">阻断</span>',
    warn: '<span class="check-icon warn">!</span><span style="color:var(--amber);font-size:11px;margin-left:4px">待确认</span>',
    pending: '<span class="check-icon pending"></span>',
  };
  return `<div style="display:flex;align-items:center">${map[result] || ''}</div>`;
}

// ─────────────────────────────────────────────
//  3. 履约概览 Tab
// ─────────────────────────────────────────────
PAGES['order-detail'] = () => orderDetailShell('overview');

function orderDetailShell(activeTab) {
  return `
    <div class="fade-in">
      ${orderSummaryBar()}
      <div class="tabs" style="margin-top:14px">
        ${detailTabBtn('overview', '履约概览', '⭐', activeTab)}
        ${detailTabBtn('dispatch', '调度方案', '', activeTab)}
        ${detailTabBtn('exception', '异常工单', '⭐', activeTab)}
        ${detailTabBtn('customer', '客户同步', '⭐', activeTab)}
        ${detailTabBtn('billing', '费用对账', '', activeTab)}
        ${detailTabBtn('attach', '附件', '', activeTab)}
      </div>
      <div id="detail-tab-content">${renderDetailTab(activeTab)}</div>
    </div>
  `;
}

function detailTabBtn(key, label, star, active) {
  return `<div class="tab-btn ${active === key ? 'active' : ''}" onclick="switchDetailTab('${key}')">${star ? star + ' ' : ''}${label}</div>`;
}

function orderSummaryBar() {
  return `
    <div class="card" style="padding:14px 18px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px">
        <div>
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:15px;font-weight:600;color:var(--text-primary);font-family:var(--font-mono)">${O.tmsId}</span>
            ${badge(O.customerLevel, 'amber')}
          </div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:5px">${O.customer} · ${O.origin.replace('中国','')} → ${O.destination.replace('越南','')} · ${O.product} · 非 COD</div>
        </div>
        <div style="display:flex;gap:18px;text-align:right">
          <div><div style="font-size:10px;color:var(--text-muted)">当前节点</div><div style="font-size:12px;margin-top:2px">${O.currentNode}</div></div>
          <div><div style="font-size:10px;color:var(--text-muted)">异常标记</div><div style="font-size:12px;margin-top:2px;color:var(--red)">${O.exceptionFlag}</div></div>
          <div><div style="font-size:10px;color:var(--text-muted)">客户可见</div><div style="font-size:12px;margin-top:2px;color:var(--teal)">${O.customerVisible}</div></div>
          <div><div style="font-size:10px;color:var(--text-muted)">节点 SLA</div><div style="font-size:12px;margin-top:2px;color:var(--red);font-family:var(--font-mono)">${O.slaStatus}</div></div>
        </div>
      </div>
    </div>
  `;
}

function renderDetailTab(tab) {
  if (tab === 'overview') return renderOverview();
  if (tab === 'dispatch') return renderDispatch();
  if (tab === 'exception') return renderException();
  if (tab === 'customer') return renderCustomerSync();
  if (tab === 'billing') return renderBilling();
  if (tab === 'attach') return renderAttach();
  return '';
}

function renderOverview() {
  const segs = DATA.fulfillSegments.map(s => {
    const cls = s.status === 'exception' ? 'active-node' : s.status === 'done' ? 'done-node' : '';
    const icon = s.status === 'done' ? '<span style="color:var(--green)">✓</span>' : s.status === 'exception' ? '<span style="color:var(--red)">!</span>' : '<span style="color:var(--text-muted)">○</span>';
    return `
      <div class="node-card ${cls}" onclick="${s.name === '目的国清关' ? 'toggleSubNodes()' : ''}">
        <div class="node-icon" style="background:var(--bg-card)">${s.icon}</div>
        <div style="flex:1">
          <div style="font-size:12px;font-weight:500;color:var(--text-primary)">${s.name} ${icon}</div>
          <div style="font-size:10px;color:var(--text-muted);margin-top:2px">${s.current} · ${s.doneCount}/${s.subCount} 子节点 · ${s.source}</div>
        </div>
        ${s.status === 'exception' ? badge('异常处理中', 'red') : s.status === 'done' ? badge('已完成', 'green') : badge('未开始', 'gray')}
        ${s.name === '目的国清关' ? '<span style="color:var(--text-muted);margin-left:6px">▾</span>' : ''}
      </div>
    `;
  }).join('');

  const subRows = DATA.customsSubNodes.map(n => {
    const sc = n.status === 'done' ? 'green' : n.status === 'active' ? 'amber' : 'gray';
    return `<tr><td>${n.status === 'active' ? '<span style="color:var(--amber)">▶ </span>' : ''}${n.name}</td><td>${badge(n.status === 'done' ? '已完成' : n.status === 'active' ? '处理中' : '未开始', sc)}</td><td style="font-family:var(--font-mono);font-size:10px">${n.plan}</td><td style="font-family:var(--font-mono);font-size:10px">${n.actual}</td><td style="font-size:11px">${n.owner}</td><td style="font-size:10px;color:var(--text-muted)">${n.source}</td></tr>`;
  }).join('');

  const events = DATA.recentEvents.map(e => `
    <div class="tl-item">
      <div class="tl-dot ${e.source.includes('系统') ? 'active' : 'done'}">${e.source.includes('系统') ? '!' : '✓'}</div>
      <div class="tl-body">
        <div class="tl-title">${e.event}</div>
        <div class="tl-meta"><span class="tl-time">${e.time}</span> · ${e.source} · 客户可见: ${e.visible}</div>
      </div>
    </div>
  `).join('');

  return `
    <div class="fade-in">
      <!-- 健康摘要 -->
      <div class="card" style="margin-bottom:14px;border-color:rgba(245,158,11,0.2)">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
          <div style="display:flex;gap:24px">
            <div><div style="font-size:10px;color:var(--text-muted)">当前节点</div><div style="font-size:13px;margin-top:3px">目的国清关</div></div>
            <div><div style="font-size:10px;color:var(--text-muted)">健康状态</div><div style="margin-top:3px">${badge('异常处理中 P1', 'red')}</div></div>
            <div><div style="font-size:10px;color:var(--text-muted)">SLA</div><div style="font-size:13px;margin-top:3px;color:var(--red);font-family:var(--font-mono)">已超 6h</div></div>
            <div><div style="font-size:10px;color:var(--text-muted)">最新回传</div><div style="font-size:13px;margin-top:3px">清关服务商 14:20</div></div>
            <div><div style="font-size:10px;color:var(--text-muted)">预计下次更新</div><div style="font-size:13px;margin-top:3px;color:var(--teal)">4 小时后</div></div>
          </div>
        </div>
      </div>

      <div class="grid-2" style="margin-bottom:14px;grid-template-columns:1.3fr 1fr">
        <!-- 分段进度 -->
        <div class="card">
          <div class="section-title"><span class="dot"></span>分段履约进度 <span style="font-size:10px;color:var(--text-muted);margin-left:4px">点击「目的国清关」展开子节点</span></div>
          <div style="display:flex;flex-direction:column;gap:8px">${segs}</div>
          <div id="subnodes" style="display:none;margin-top:12px">
            <div class="divider"></div>
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px">目的国清关 · 子节点明细</div>
            <table class="data-table"><thead><tr><th>子节点</th><th>状态</th><th>计划</th><th>实际/回传</th><th>责任方</th><th>来源</th></tr></thead><tbody>${subRows}</tbody></table>
          </div>
        </div>

        <!-- 地图轨迹 -->
        <div class="card">
          <div class="section-title"><span class="dot" style="background:var(--teal)"></span>地图 / 轨迹辅助区</div>
          ${mapWidget()}
          <div style="font-size:10px;color:var(--text-muted);margin-top:10px;line-height:1.5">最新轨迹：清关服务商 14:20 回传<br>地图仅作位置辅助，不作为唯一状态依据</div>
        </div>
      </div>

      <!-- 异常提示条 -->
      <div class="alert alert-red" style="margin-bottom:14px">
        <span>⚠</span>
        <div style="flex:1"><strong>目的国清关已超 6h，已生成 P1 异常工单。</strong>最新回传：资料复核中。</div>
        <button class="btn btn-danger btn-sm" onclick="switchDetailTab('exception')">进入异常工单 →</button>
      </div>

      <div class="grid-2">
        <div class="card">
          <div class="section-title"><span class="dot"></span>最近事件</div>
          <div class="timeline">${events}</div>
        </div>
        <div class="card">
          <div class="section-title"><span class="dot"></span>关联处置项 + 推荐动作</div>
          <div style="display:flex;flex-direction:column;gap:8px">
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">
              <div><div style="font-size:12px">目的国清关超时</div><div style="font-size:10px;color:var(--text-muted)">运营 · 待处理</div></div>
              ${badge('P1','red')}
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)">
              <div><div style="font-size:12px">客户同步</div><div style="font-size:10px;color:var(--text-muted)">客服 · 待确认话术</div></div>
              ${badge('P1','red')}
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0">
              <div><div style="font-size:12px">异常费用确认</div><div style="font-size:10px;color:var(--text-muted)">财务 · 待补凭证</div></div>
              ${badge('P2','amber')}
            </div>
          </div>
          <div class="alert alert-blue" style="margin-top:12px;margin-bottom:0">推荐动作：优先进入异常工单 Tab 处理目的国清关超时</div>
        </div>
      </div>
    </div>
  `;
}

function mapWidget() {
  return `
    <div style="position:relative;height:140px;background:var(--bg-base);border-radius:8px;overflow:hidden;border:1px solid var(--border)">
      <svg width="100%" height="140" viewBox="0 0 320 140" style="position:absolute">
        <defs>
          <linearGradient id="routeg" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#22c55e"/><stop offset="60%" stop-color="#22c55e"/>
            <stop offset="60%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#4b6a8a"/>
          </linearGradient>
        </defs>
        <path d="M40 100 Q120 40 180 70 T280 90" fill="none" stroke="url(#routeg)" stroke-width="2" stroke-dasharray="4 3"/>
        <circle cx="40" cy="100" r="5" fill="#22c55e"/><text x="40" y="120" fill="#94a3b8" font-size="9" text-anchor="middle">深圳</text>
        <circle cx="180" cy="70" r="4" fill="#22c55e"/><text x="180" y="58" fill="#94a3b8" font-size="9" text-anchor="middle">凭祥口岸</text>
        <circle cx="280" cy="90" r="6" fill="#f59e0b" stroke="#f59e0b" stroke-opacity="0.3" stroke-width="4"><animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite"/></circle>
        <text x="280" y="110" fill="#fcd34d" font-size="9" text-anchor="middle">胡志明 (当前)</text>
      </svg>
      <div style="position:absolute;top:8px;left:10px;font-size:9px;color:var(--text-muted)">深圳 → 凭祥/口岸 → 胡志明</div>
    </div>
  `;
}

// ─────────────────────────────────────────────
//  4. 调度方案 Tab
// ─────────────────────────────────────────────
function renderDispatch() {
  const segCards = DATA.dispatchSegments.map(s => {
    const execColor = s.execStatus === '已完成' ? 'green' : s.execStatus === '执行中' ? 'blue' : s.execStatus === '异常中' ? 'red' : 'gray';
    const dispColor = s.dispatchStatus === '已确认' || s.dispatchStatus === '已接单' ? 'green' : s.dispatchStatus === '已派单' ? 'amber' : 'gray';
    return `
      <div class="card" style="padding:12px 14px;${s.execStatus === '异常中' ? 'border-color:rgba(239,68,68,0.3)' : ''}">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
          <div style="font-size:12px;font-weight:600;color:var(--text-primary);min-width:80px">${s.name}</div>
          <div style="flex:1;font-size:11px;color:var(--text-secondary)">${s.provider}</div>
          <div style="display:flex;gap:6px;align-items:center">
            ${badge(s.dispatchStatus, dispColor)}
            ${badge(s.execStatus, execColor)}
          </div>
          <div style="font-size:11px;color:var(--text-muted)">${s.feedback}</div>
          <button class="btn btn-sm ${s.execStatus === '异常中' ? 'btn-danger' : 'btn-ghost'}" onclick="${s.execStatus === '异常中' ? 'switchDetailTab(\'exception\')' : 'showToast(\'演示仅展示目的国清关段详情\')'}">
            ${s.action}
          </button>
        </div>
      </div>`;
  }).join('');

  const provRows = DATA.providerCompare.map(p => `
    <tr style="${p.selected ? 'background:rgba(59,130,246,0.06)' : ''}">
      <td>
        <span style="font-weight:${p.selected ? 600 : 400};color:${p.selected ? 'var(--accent-light)' : 'inherit'}">
          ${p.selected ? '✓ ' : ''}${p.name}
        </span>
      </td>
      <td>${p.coverage}</td>
      <td>${costBadge(p.cost)}</td>
      <td>${speedBadge(p.response)}</td>
      <td>${stabilityBadge(p.stability)}</td>
      <td>
        <div style="display:flex;align-items:center;gap:8px">
          <div class="progress-bar" style="width:60px">
            <div class="progress-fill ${p.score >= 85 ? 'green' : p.score >= 75 ? 'blue' : 'amber'}" style="width:${p.score}%"></div>
          </div>
          <span style="font-size:11px;font-family:var(--font-mono)">${p.score}</span>
        </div>
      </td>
      <td style="font-size:11px;color:var(--text-muted)">${p.note}</td>
      <td>${p.recommend ? badge('推荐', 'green') : ''}</td>
    </tr>`).join('');

  const weightBars = DATA.scoreWeights.map(w => `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
      <div style="font-size:11px;color:var(--text-muted);width:72px">${w.dim}</div>
      <div class="progress-bar" style="flex:1"><div class="progress-fill blue" style="width:${w.weight * 3}%"></div></div>
      <div style="font-size:11px;font-family:var(--font-mono);color:var(--text-secondary)">${w.weight}%</div>
    </div>`).join('');

  return `
    <div class="fade-in">
      <!-- 调度前置校验 -->
      <div class="card" style="margin-bottom:14px">
        <div class="section-title"><span class="dot"></span>调度前置校验</div>
        <div style="display:flex;gap:16px;flex-wrap:wrap">
          ${['地址已确认 ✓','清关资料预审通过（税号待补充，已人工确认）✓','服务产品匹配 ✓','偏远区域：否 ✓','禁运/申报风险：无 ✓'].map(t => `<div style="font-size:12px;color:${t.includes('✓')?'var(--green)':'var(--amber)'}">${t}</div>`).join('')}
        </div>
      </div>

      <!-- 全链路总览 -->
      <div class="card" style="margin-bottom:14px">
        <div class="section-title"><span class="dot"></span>全链路调度总览</div>
        <div style="display:flex;flex-direction:column;gap:8px">${segCards}</div>
      </div>

      <!-- 目的国清关详情 -->
      <div class="card" style="margin-bottom:14px;border-color:rgba(245,158,11,0.25)">
        <div class="section-title">
          <span class="dot" style="background:var(--amber)"></span>
          目的国清关 · 候选服务商对比
          <span style="font-size:10px;color:var(--text-muted);font-weight:400;margin-left:6px">MVP 阶段：规则过滤 → 评分排序 → AI 辅助解释（不自动确认调度）</span>
        </div>
        <table class="data-table">
          <thead><tr><th>服务商</th><th>覆盖</th><th>费用</th><th>响应</th><th>稳定性</th><th>综合评分</th><th>备注</th><th></th></tr></thead>
          <tbody>${provRows}</tbody>
        </table>

        <div class="divider"></div>

        <div class="grid-2">
          <div>
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px">评分权重（估算初始值，需跑数据后校准）</div>
            ${weightBars}
            <div class="alert alert-amber" style="margin-top:10px;font-size:11px">
              ⚠ 演示说明：权重为估算值，真实权重需与调度员跑 2 周数据后复盘确定。这也是 MVP 第一阶段选择规则过滤而非算法模型的原因——可解释性比智能化更重要。
            </div>
          </div>
          <div>
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px">AI 推荐解释 <span style="color:var(--accent-light)">· 基于评分结果生成</span></div>
            <div class="ai-panel">
              <div style="font-size:12px;color:var(--text-secondary);line-height:1.7">
                选择清关服务商 D 的主要依据：覆盖胡志明口岸 ✓，清关响应速度快 ✓，综合评分最高（86 分）。<br>
                风险提示：该服务商近期回传稳定性中等，建议设置 2 小时回传超时提醒。<br>
                <span style="color:var(--text-muted);font-size:11px">AI 只辅助解释，调度确认由人工完成。</span>
              </div>
            </div>
            <div style="margin-top:12px;display:flex;gap:8px">
              <button class="btn btn-primary btn-sm" onclick="showToast('调度方案已确认，已回写履约概览')">确认当前服务商</button>
              <button class="btn btn-secondary btn-sm" onclick="showToast('改派功能演示中')">改派</button>
              <button class="btn btn-ghost btn-sm" onclick="showModal('fillReason')">填写偏离原因</button>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

function costBadge(c) { return c === '低' ? badge('低', 'green') : c === '中' ? badge('中', 'blue') : badge('高', 'amber'); }
function speedBadge(c) { return c === '快' ? badge('快', 'green') : badge('中', 'amber'); }
function stabilityBadge(c) { return c === '高' ? badge('高', 'green') : c === '中' ? badge('中', 'amber') : badge('低', 'red'); }

// ─────────────────────────────────────────────
//  5. 异常工单 Tab（含 AI 打字机动效）
// ─────────────────────────────────────────────
function renderException() {
  return `
    <div class="fade-in">
      <div class="grid-2" style="grid-template-columns:1fr 1.6fr;gap:14px">
        <!-- 左列：工单信息 + 上下文 -->
        <div style="display:flex;flex-direction:column;gap:12px">
          <!-- 工单基本信息 -->
          <div class="card" style="border-color:rgba(239,68,68,0.3)">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">
              <div>
                <div style="font-size:13px;font-weight:600;color:var(--red)">目的国清关超时</div>
                <div style="font-size:10px;color:var(--text-muted);margin-top:3px;font-family:var(--font-mono)">WO-20260531-0042</div>
              </div>
              ${badge('P1', 'red')}
            </div>
            <div class="field-row"><span class="field-label">触发时间</span><span class="field-value" style="font-family:var(--font-mono);font-size:11px">05-31 16:10</span></div>
            <div class="field-row"><span class="field-label">超时时长</span><span class="field-value" style="color:var(--red);font-family:var(--font-mono)">6h 10min</span></div>
            <div class="field-row"><span class="field-label">关联节点</span><span class="field-value">目的国清关 · 海关查验/资料复核</span></div>
            <div class="field-row"><span class="field-label">责任方</span><span class="field-value">运营 / 清关服务商</span></div>
            <div class="field-row"><span class="field-label">影响客户 SLA</span><span class="field-value" style="color:var(--amber)">是 · T+6 承诺</span></div>
            <div class="field-row"><span class="field-label">工单状态</span><span class="field-value">${badge('AI 辅助已生成', 'blue')}</span></div>
          </div>

          <!-- 上下文聚合区 -->
          <div class="card">
            <div class="section-title"><span class="dot"></span>上下文证据区 <span style="font-size:10px;color:var(--text-muted);font-weight:400">Agent Step 1 感知</span></div>
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px">系统自动聚合，运营无需跨系统追查</div>
            ${ctxItem('订单', `${O.customer}(KA) · USD 45 · T+6 承诺 · 超时 6h`)}
            ${ctxItem('节点', '目的国清关 · 最晚 05-31 16:00 · 已超时')}
            ${ctxItem('轨迹', '最近轨迹 05-31 09:30，此后无更新')}
            ${ctxItem('服务商回传', '14:20：资料复核中，可能需补收货人税号', true)}
            ${ctxItem('历史案例', '命中 3 个相似案例，补资料后均值 48h 放行')}
            ${ctxItem('费用', '已用仓储免费期 1 天，剩余 2 天')}
          </div>
        </div>

        <!-- 右列：AI 辅助区 -->
        <div class="card ai-panel scan-effect" style="background:linear-gradient(135deg,rgba(59,130,246,0.04),rgba(20,184,166,0.04))">
          <div class="ai-panel-header">
            <div class="ai-dot"></div>
            <span style="font-size:12px;font-weight:600;color:var(--accent-light)">AI 辅助区</span>
            <span style="font-size:10px;color:var(--text-muted);margin-left:4px">分步可见 · 各模块独立审核</span>
            <button class="btn btn-secondary btn-sm" style="margin-left:auto" id="btn-ai-gen" onclick="startAIGeneration()">
              ▶ 重新生成
            </button>
          </div>

          <div id="ai-modules">
            <!-- 模块1：归因 -->
            ${aiModuleShell('attribution', '归因分析', `置信度 ${DATA.aiAttribution.confidenceOverall}%`)}
            <!-- 模块2：SOP -->
            ${aiModuleShell('sop', 'SOP 推荐', DATA.aiSop.name)}
            <!-- 模块3：话术草稿 -->
            ${aiModuleShell('message', '客户话术草稿', '已生成 · 含 2 处风险词')}
            <!-- 模块4：费用提示 -->
            ${aiModuleShell('cost', '费用影响提示', `${DATA.aiCost.types.length} 项`)}
          </div>

          <!-- 工单关闭前置校验 -->
          <div class="divider"></div>
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px">关闭前置校验（全部完成后才可关闭工单）</div>
          <div style="display:flex;flex-direction:column;gap:6px">
            ${closeCheck('归因/SOP 已确认', false)}
            ${closeCheck('客户同步已完成', false)}
            ${closeCheck('节点已恢复或标注', false)}
            ${closeCheck('费用状态已标记', false)}
          </div>
          <button class="btn btn-secondary btn-sm" style="margin-top:10px;opacity:0.5;cursor:not-allowed;width:100%">关闭工单（前置校验未通过）</button>
        </div>
      </div>

      <!-- 人工处理区 -->
      <div class="card" style="margin-top:14px">
        <div class="section-title"><span class="dot" style="background:var(--teal)"></span>人工处理区</div>
        <div class="grid-2">
          <div>
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px">确认最终原因</div>
            <select class="input" style="width:100%;margin-bottom:10px"><option>清关资料待补充——收货人税号问题（AI 建议，已采纳）</option></select>
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px">处理动作</div>
            <textarea class="input" style="width:100%;height:60px;resize:none" placeholder="联系清关服务商 D，向委托客户索取越南格式税号，跟进重新申报..."></textarea>
          </div>
          <div>
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px">预计恢复时间</div>
            <input class="input" style="width:100%;margin-bottom:10px" value="06-01 18:00">
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px">后续动作</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <button class="btn btn-primary btn-sm" onclick="switchDetailTab('customer')">去客户同步 →</button>
              <button class="btn btn-secondary btn-sm" onclick="switchDetailTab('billing')">标记异常费用</button>
              <button class="btn btn-ghost btn-sm" onclick="showToast('处理动作已保存')">保存</button>
            </div>
          </div>
        </div>
      </div>
    </div>`;
}

function ctxItem(label, content, highlight = false) {
  return `
    <div style="display:flex;gap:8px;margin-bottom:7px;align-items:flex-start">
      <span style="font-size:10px;color:var(--accent-light);background:rgba(59,130,246,0.1);padding:1px 6px;border-radius:3px;flex-shrink:0;margin-top:1px;font-weight:500">${label}</span>
      <span style="font-size:11px;color:${highlight ? 'var(--amber)' : 'var(--text-secondary)'};line-height:1.5">${content}</span>
    </div>`;
}

function aiModuleShell(key, title, subtitle) {
  const contentFn = { attribution: aiAttrContent, sop: aiSopContent, message: aiMsgContent, cost: aiCostContent };
  return `
    <div class="card" style="background:var(--bg-surface);border:1px solid var(--border);margin-bottom:10px;padding:0;overflow:hidden" id="module-${key}">
      <div class="collapsible-header" onclick="toggleModule('${key}')">
        <div class="ai-dot" style="width:6px;height:6px"></div>
        <span style="font-size:12px;font-weight:500;color:var(--text-primary)">${title}</span>
        <span style="font-size:10px;color:var(--text-muted);margin-left:6px" id="subtitle-${key}">${subtitle}</span>
        <div id="status-${key}" style="margin-left:auto;margin-right:6px">${badge('已生成', 'blue')}</div>
        <span class="collapsible-arrow" id="arrow-${key}">▾</span>
      </div>
      <div class="collapsible-body open" id="body-${key}" style="max-height:800px">
        <div style="padding:0 12px 12px">${contentFn[key] ? contentFn[key]() : ''}</div>
      </div>
    </div>`;
}

function aiAttrContent() {
  const items = DATA.aiAttribution.results.map((r, i) => {
    const confColor = r.confidence >= 70 ? 'green' : r.confidence >= 50 ? 'amber' : 'red';
    return `
      <div style="padding:10px;background:var(--bg-base);border-radius:8px;margin-bottom:8px;${i === 0 ? 'border:1px solid rgba(59,130,246,0.2)' : ''}">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
          <div style="font-size:12px;color:var(--text-primary);flex:1">${i+1}. ${r.reason}</div>
          <div style="text-align:right;flex-shrink:0">
            <div style="font-size:18px;font-weight:700;color:var(--${confColor});font-family:var(--font-mono)">${r.confidence}%</div>
            <div style="font-size:9px;color:var(--text-muted)">置信度</div>
          </div>
        </div>
        <div class="confidence-bar confidence-${r.confidence>=70?'high':r.confidence>=50?'mid':'low'}" style="margin:8px 0">
          <div class="confidence-track"><div class="confidence-fill" style="width:${r.confidence}%"></div></div>
        </div>
        <div style="font-size:10px;color:var(--text-muted)">
          ${r.evidence.map(e => `<div>· ${e}</div>`).join('')}
          ${r.missing.map(m => `<div style="color:var(--amber)">? 缺失：${m}</div>`).join('')}
        </div>
      </div>`;
  }).join('');

  return `
    <div style="font-size:10px;color:var(--text-muted);margin-bottom:8px">RAG 命中：${DATA.aiAttribution.ragSources.join(' · ')}</div>
    ${items}
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      <button class="btn btn-success btn-sm" onclick="adoptModule('attribution')">✓ 采纳归因 #1</button>
      <button class="btn btn-secondary btn-sm" onclick="showModal('modifyAttribution')">编辑后采纳</button>
      <button class="btn btn-danger btn-sm" onclick="showModal('rejectModule','归因')">驳回</button>
      <button class="btn btn-ghost btn-sm" onclick="showToast('已标记无效')">标记无效</button>
    </div>`;
}

function aiSopContent() {
  const sop = DATA.aiSop;
  return `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px">
      <span style="font-size:12px;font-weight:500;color:var(--text-primary)">${sop.name}</span>
      ${badge(sop.version, 'blue')}
      ${badge(sop.status, 'green')}
    </div>
    <div style="font-size:10px;color:var(--teal);margin-bottom:8px">匹配：${sop.match}</div>
    <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:10px">
      ${sop.steps.map((s,i) => `
        <div style="display:flex;gap:8px;align-items:flex-start">
          <span style="background:var(--accent);color:#fff;border-radius:50%;width:16px;height:16px;display:flex;align-items:center;justify-content:center;font-size:9px;flex-shrink:0;margin-top:1px">${i+1}</span>
          <span style="font-size:12px;color:var(--text-secondary);line-height:1.5">${s}</span>
        </div>`).join('')}
    </div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      <button class="btn btn-success btn-sm" onclick="adoptModule('sop')">✓ 采纳 SOP</button>
      <button class="btn btn-secondary btn-sm" onclick="showModal('modifySOP')">编辑步骤</button>
      <button class="btn btn-danger btn-sm" onclick="showModal('rejectModule','SOP')">驳回</button>
    </div>`;
}

function aiMsgContent() {
  const msg = DATA.aiMessage;
  return `
    <div style="background:var(--bg-base);border-radius:8px;padding:12px;margin-bottom:10px;font-size:12px;color:var(--text-secondary);line-height:1.7" id="msg-draft">
      ${msg.draft}
    </div>
    <div style="margin-bottom:10px">
      <div style="font-size:10px;color:var(--text-muted);margin-bottom:6px">⚠ AI 风险控制拦截（发送前必须消除）</div>
      ${msg.risks.map(r => `
        <div style="display:flex;gap:6px;align-items:flex-start;padding:5px 8px;background:rgba(245,158,11,0.07);border:1px solid rgba(245,158,11,0.2);border-radius:6px;margin-bottom:4px;font-size:11px">
          <span style="color:var(--amber);flex-shrink:0">⚠</span>
          <div>
            <span style="color:var(--amber)">[${r.type}]</span>
            <span style="color:var(--text-muted)"> "${r.text}" → ${r.suggestion}</span>
          </div>
        </div>`).join('')}
    </div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      <button class="btn btn-secondary btn-sm" onclick="switchDetailTab('customer')">前往客户同步 Tab 发送 →</button>
      <button class="btn btn-ghost btn-sm" onclick="showToast('已重新生成话术')">重新生成</button>
    </div>`;
}

function aiCostContent() {
  return `
    <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:10px">
      ${DATA.aiCost.types.map(t => `
        <div style="padding:8px 10px;background:var(--bg-base);border-radius:7px;display:flex;justify-content:space-between;align-items:flex-start">
          <div>
            <div style="font-size:12px;color:var(--text-primary)">${t.name}</div>
            <div style="font-size:10px;color:var(--text-muted);margin-top:2px">${t.node} · ${t.evidence}</div>
          </div>
          <span style="font-size:12px;color:var(--text-secondary);white-space:nowrap;margin-left:12px">${t.amount}</span>
        </div>`).join('')}
    </div>
    <div class="alert alert-amber" style="margin-bottom:10px;font-size:11px">${DATA.aiCost.warning}</div>
    <div style="font-size:10px;color:var(--text-muted);margin-bottom:8px">AI 不自动判责，不修改应收/应付金额</div>
    <div style="display:flex;gap:6px;flex-wrap:wrap">
      <button class="btn btn-success btn-sm" onclick="adoptModule('cost')">✓ 确认费用提示</button>
      <button class="btn btn-secondary btn-sm" onclick="switchDetailTab('billing')">前往费用对账 →</button>
    </div>`;
}

function closeCheck(label, done) {
  return `
    <div style="display:flex;align-items:center;gap:7px;font-size:11px;color:${done ? 'var(--green)' : 'var(--text-muted)'}">
      <span style="width:14px;height:14px;border-radius:50%;border:1.5px solid ${done ? 'var(--green)' : 'var(--border)'};display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:8px">${done ? '✓' : ''}</span>
      ${label}
    </div>`;
}

// ─────────────────────────────────────────────
//  6. 客户同步 Tab
// ─────────────────────────────────────────────
function renderCustomerSync() {
  const mapRows = DATA.statusMapping.map(r => `
    <tr>
      <td style="font-family:var(--font-mono);font-size:10px">${r.internal}</td>
      <td>${badge(r.visible, 'teal')}</td>
      <td style="font-size:11px;color:${r.auto.includes('否') ? 'var(--text-muted)' : 'var(--green)'}">${r.auto}</td>
      <td style="font-size:11px;color:var(--text-muted)">${r.note}</td>
    </tr>`).join('');

  const syncs = DATA.syncRecords.map(r => `
    <div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);align-items:flex-start">
      <div style="font-size:10px;font-family:var(--font-mono);color:var(--text-muted);white-space:nowrap">${r.time}</div>
      <div style="flex:1">
        <div style="font-size:11px;color:var(--text-secondary)">${r.content}</div>
        <div style="font-size:10px;color:var(--text-muted);margin-top:2px">${r.channel} · ${r.operator}</div>
      </div>
      ${badge(r.status, r.status === '已发送' || r.status === '已读' ? 'green' : 'blue')}
    </div>`).join('');

  return `
    <div class="fade-in">
      <!-- 当前同步摘要 -->
      <div class="card" style="margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px">
          <div>
            <div style="font-size:13px;font-weight:600">客户同步 · ${O.customer} (${O.customerLevel})</div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:4px">通知策略：P1 异常需人工确认 · 推荐渠道：企业微信/邮件</div>
          </div>
          <div style="display:flex;gap:16px">
            <div><div style="font-size:10px;color:var(--text-muted)">内部状态</div><div style="font-size:12px;margin-top:2px;color:var(--red)">目的国清关超时 P1</div></div>
            <div><div style="font-size:10px;color:var(--text-muted)">客户可见</div><div style="font-size:12px;margin-top:2px;color:var(--teal)">${O.customerVisible}</div></div>
            <div><div style="font-size:10px;color:var(--text-muted)">下次更新</div><div style="font-size:12px;margin-top:2px">4 小时后</div></div>
          </div>
        </div>
      </div>

      <div class="grid-2" style="margin-bottom:14px">
        <!-- 内外状态映射 -->
        <div class="card">
          <div class="section-title"><span class="dot"></span>内外状态映射
            <span style="font-size:10px;color:var(--text-muted);font-weight:400;margin-left:6px">为什么不能直接透传？</span>
          </div>
          <div style="font-size:11px;color:var(--text-secondary);margin-bottom:10px;line-height:1.6">
            翔运货代项目教训：内部状态透传给货主后，"等待转关文件"引发大量追问。跨境电商场景风险更高——客户对"赔偿"和"责任"的期待更明确。
          </div>
          <table class="data-table">
            <thead><tr><th>内部状态</th><th>客户可见</th><th>是否自动同步</th><th>说明策略</th></tr></thead>
            <tbody>${mapRows}</tbody>
          </table>
        </div>

        <!-- AI 话术草稿 + 风险控制 -->
        <div class="card">
          <div class="section-title"><span class="dot" style="background:var(--amber)"></span>AI 话术草稿
            <span id="sync-state-badge" style="margin-left:8px">${badge('待发送·含风险词', 'red')}</span>
          </div>

          <textarea id="msg-edit" class="input" style="width:100%;height:100px;resize:none;margin-bottom:10px;font-size:12px;line-height:1.6">
您好，您的订单（${O.omsId}）目前正在越南胡志明口岸进行清关核查。清关服务商正在配合处理，我们预计在接下来 4 小时内获得最新进展并向您同步。如需配合，请确认收货人相关证件信息是否完整，我们会及时与您联系。感谢您的理解与耐心等待。</textarea>

          <div style="margin-bottom:10px">
            ${DATA.aiMessage.risks.map(r => `
              <div class="alert alert-amber" style="margin-bottom:6px;padding:7px 10px">
                <span>⚠</span>
                <div style="font-size:11px"><strong>[${r.type}]</strong> "${r.text}"<br><span style="color:var(--text-muted)">建议：${r.suggestion}</span></div>
                <button class="btn btn-ghost btn-sm" onclick="fixRisk(this,'${r.type}')">修复</button>
              </div>`).join('')}
          </div>

          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <select class="input" style="flex:1"><option>企业微信</option><option>邮件</option><option>短信</option></select>
            <button class="btn btn-secondary btn-sm" id="send-btn" onclick="trySend()" style="opacity:0.5">发送（风险词未消除）</button>
            <button class="btn btn-ghost btn-sm" onclick="showToast('已标记：本次无需客户同步')">标记无需同步</button>
          </div>
        </div>
      </div>

      <!-- 同步记录 -->
      <div class="card">
        <div class="section-title"><span class="dot"></span>同步记录</div>
        ${syncs}
        <div style="font-size:11px;color:var(--text-muted);margin-top:8px">每次同步留痕，发送内容/渠道/操作人/关联工单全部可追溯</div>
      </div>
    </div>`;
}

// ─────────────────────────────────────────────
//  7. 费用对账 Tab
// ─────────────────────────────────────────────
function renderBilling() {
  const items = DATA.billingItems.map(r => {
    const sc = r.status === '已确认' ? 'green' : r.status === '待确认' ? 'amber' : r.status === '不适用' ? 'gray' : 'blue';
    return `<tr>
      <td>${r.type}${r.type.includes('异常') ? ' ' + badge('异常', 'red') : ''}</td>
      <td style="font-family:var(--font-mono);font-size:11px">${r.receivable}</td>
      <td style="font-family:var(--font-mono);font-size:11px">${r.payable}</td>
      <td style="font-size:11px;color:var(--text-muted)">${r.node}</td>
      <td>${badge(r.status, sc)}</td>
    </tr>`;
  }).join('');

  const b = DATA.billing;
  return `
    <div class="fade-in">
      <!-- 费用摘要 -->
      <div class="grid-4" style="margin-bottom:14px">
        ${statCard('客户应收', b.receivable, 'CNY', 'blue')}
        ${statCard('供应商应付', b.payable, 'VND', 'purple')}
        ${statCard('预计毛利', b.profit, '', 'green')}
        ${statCard('对账状态', b.status, '', 'amber')}
      </div>

      <!-- 汇率说明 -->
      <div class="alert alert-amber" style="margin-bottom:14px">
        <span>⚠</span>
        <div style="font-size:11px">
          <strong>汇率锁定：待锁定（演示用）</strong> · 演示说明：汇率锁定时点（接单时 vs 结算时）和汇率来源（央行/SWIFT/平台）需跟财务对齐后在规则后台配置。
        </div>
      </div>

      <div class="grid-2" style="margin-bottom:14px">
        <!-- 费用明细 -->
        <div class="card">
          <div class="section-title"><span class="dot"></span>费用明细</div>
          <table class="data-table">
            <thead><tr><th>费用类型</th><th>客户应收</th><th>供应商应付</th><th>关联节点</th><th>状态</th></tr></thead>
            <tbody>${items}</tbody>
          </table>
        </div>

        <!-- AI 费用提示 -->
        <div class="card">
          <div class="section-title"><span class="dot" style="background:var(--accent)"></span>AI 费用提示 <span style="font-size:10px;color:var(--text-muted);font-weight:400;margin-left:4px">不自动判责 · 不修改账单</span></div>
          <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px">
            ${DATA.aiCost.types.map(t => `
              <div style="padding:10px;background:var(--bg-base);border-radius:8px">
                <div style="display:flex;justify-content:space-between;align-items:flex-start">
                  <div style="font-size:12px;font-weight:500">${t.name}</div>
                  <span style="font-size:12px;color:var(--text-secondary)">${t.amount}</span>
                </div>
                <div style="font-size:10px;color:var(--text-muted);margin-top:4px">${t.node} · ${t.evidence}</div>
              </div>`).join('')}
          </div>
          <div class="alert alert-amber" style="margin-bottom:12px;font-size:11px">${DATA.aiCost.warning}</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-primary btn-sm" onclick="showToast('费用状态已确认，已关联异常工单')">确认费用状态</button>
            <button class="btn btn-secondary btn-sm" onclick="showToast('凭证上传功能演示中')">补充凭证</button>
            <button class="btn btn-ghost btn-sm" onclick="showModal('fillResponsible')">确认责任方</button>
          </div>
        </div>
      </div>

      <!-- 多币种说明 -->
      <div class="card">
        <div class="section-title"><span class="dot"></span>多币种 & 汇率记录</div>
        <div style="display:flex;gap:20px;flex-wrap:wrap">
          <div class="field-row" style="flex:1"><span class="field-label">原始币种</span><span class="field-value">USD · VND</span></div>
          <div class="field-row" style="flex:1"><span class="field-label">折算币种</span><span class="field-value">CNY</span></div>
          <div class="field-row" style="flex:1"><span class="field-label">汇率来源</span><span class="field-value" style="color:var(--amber)">待锁定</span></div>
          <div class="field-row" style="flex:1"><span class="field-label">锁定时间</span><span class="field-value" style="color:var(--amber)">待确认</span></div>
        </div>
      </div>
    </div>`;
}

function statCard(label, value, unit, color) {
  return `
    <div class="stat-card">
      <div class="stat-glow" style="background:var(--${color === 'amber' ? 'amber' : color === 'purple' ? 'purple' : color === 'green' ? 'green' : 'accent'})"></div>
      <div class="stat-label">${label}</div>
      <div class="stat-value" style="font-size:16px;margin-top:6px">${value}</div>
      ${unit ? `<div class="stat-sub">${unit}</div>` : ''}
    </div>`;
}

// ─────────────────────────────────────────────
//  8. 附件 Tab
// ─────────────────────────────────────────────
function renderAttach() {
  const rows = DATA.attachments.map(a => {
    const typeColor = a.type === '清关资料' ? 'blue' : a.type === '运输凭证' ? 'green' : a.type === '异常附件' ? 'amber' : 'gray';
    return `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:18px">${a.name.endsWith('.pdf') ? '📄' : '🖼️'}</span>
            <span style="font-size:12px;color:var(--accent-light)">${a.name}</span>
          </div>
        </td>
        <td>${badge(a.type, typeColor)}</td>
        <td style="font-size:11px">${a.node}</td>
        <td style="font-size:11px;color:var(--text-muted)">${a.source}</td>
        <td style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted)">${a.time}</td>
        <td>
          <button class="btn btn-ghost btn-sm" onclick="showToast('文件预览演示中')">预览</button>
        </td>
      </tr>`;
  }).join('');

  return `
    <div class="fade-in">
      <div class="card" style="margin-bottom:14px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            ${['全部', '清关资料', '运输凭证', '异常附件', '费用凭证', '签收凭证'].map((t,i) => `<button class="btn ${i===0?'btn-primary':'btn-secondary'} btn-sm" onclick="showToast('按类型筛选演示中')">${t}</button>`).join('')}
          </div>
          <button class="btn btn-secondary btn-sm" onclick="showToast('附件上传演示中')">+ 上传附件</button>
        </div>
      </div>
      <div class="card">
        <div class="section-title"><span class="dot"></span>附件列表 <span style="font-size:10px;color:var(--text-muted);font-weight:400;margin-left:4px">按履约节点分组管理 · 可关联异常工单和费用对账</span></div>
        <table class="data-table">
          <thead><tr><th>文件名</th><th>类型</th><th>关联节点</th><th>来源</th><th>时间</th><th>操作</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
}

// ─────────────────────────────────────────────
//  9. AI 效果看板
// ─────────────────────────────────────────────
PAGES['ai-dashboard'] = () => {
  const d = DATA.aiDashboard;
  const genRows = d.generation.map(g => `
    <div style="margin-bottom:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px">
        <span style="font-size:12px;font-weight:500">${g.module}模块</span>
        <div style="display:flex;gap:8px">
          <span style="font-size:11px;color:var(--green)">采纳 ${g.adopt}%</span>
          <span style="font-size:11px;color:var(--red)">驳回 ${g.reject}%</span>
          <span style="font-size:11px;color:var(--amber)">修改 ${g.modify}%</span>
        </div>
      </div>
      <div style="display:flex;height:8px;border-radius:4px;overflow:hidden;gap:1px">
        <div style="width:${g.adopt}%;background:var(--green)"></div>
        <div style="width:${g.modify}%;background:var(--amber)"></div>
        <div style="width:${g.reject}%;background:var(--red)"></div>
      </div>
    </div>`).join('');

  const bizCards = d.business.map(b => `
    <div class="stat-card">
      <div class="stat-label">${b.label}</div>
      <div class="stat-value" style="font-size:20px;color:${b.good ? 'var(--green)' : 'var(--red)'}">${b.value}</div>
      <div class="stat-sub">${b.base}</div>
    </div>`).join('');

  const alerts = d.alerts.map(a => `
    <div class="alert alert-${a.level === 'red' ? 'red' : 'amber'}" style="margin-bottom:6px">
      <span>${a.level === 'red' ? '🔴' : '🟡'}</span>
      <div style="flex:1;font-size:11px">[${a.time}] ${a.text}</div>
      <button class="btn btn-ghost btn-sm" onclick="showToast('已标记处理')">标记处理</button>
    </div>`).join('');

  return `
    <div class="fade-in">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <div style="font-size:15px;font-weight:600">AI 效果看板</div>
        <div style="display:flex;gap:8px">
          <select class="input"><option>今日</option><option>近7天</option><option>近30天</option></select>
          <select class="input"><option>全部线路</option><option>深圳→胡志明</option></select>
        </div>
      </div>

      <!-- 第一层：系统健康 -->
      <div class="card" style="margin-bottom:14px">
        <div class="section-title"><span class="dot" style="background:var(--green)"></span>系统健康层 <span style="font-size:10px;color:var(--text-muted);font-weight:400;margin-left:4px">实时 · 秒级刷新</span></div>
        <div class="grid-4">
          ${statCard('Agent 执行成功率', d.health.successRate + '%', '目标 ≥95%', 'green')}
          ${statCard('平均响应时长', d.health.avgTime + 's', '目标 <20s', 'blue')}
          ${statCard('今日降级次数', d.health.degradeCount + ' 次', '阈值 >3 告警', 'green')}
          ${statCard('当前告警', d.health.alert, '', 'green')}
        </div>
      </div>

      <div class="grid-2" style="margin-bottom:14px">
        <!-- 第二层：检索质量 -->
        <div class="card">
          <div class="section-title"><span class="dot" style="background:var(--teal)"></span>检索质量层 <span style="font-size:10px;color:var(--text-muted);font-weight:400;margin-left:4px">日维度</span></div>
          <div style="margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="font-size:11px">RAG 总命中率</span><span style="font-size:14px;font-weight:600;color:var(--teal)">${d.retrieval.ragHit}%</span></div>
            <div class="progress-bar"><div class="progress-fill blue" style="width:${d.retrieval.ragHit}%"></div></div>
          </div>
          ${[['归因',d.retrieval.attrHit],['SOP',d.retrieval.sopHit],['话术',d.retrieval.msgHit],['费用',d.retrieval.costHit]].map(([m,v]) => `
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:7px">
              <span style="font-size:11px;color:var(--text-muted);width:30px">${m}</span>
              <div class="progress-bar" style="flex:1"><div class="progress-fill ${v>=70?'green':'amber'}" style="width:${v}%"></div></div>
              <span style="font-size:11px;font-family:var(--font-mono)">${v}%</span>
            </div>`).join('')}
        </div>

        <!-- 第三层：生成质量 -->
        <div class="card">
          <div class="section-title"><span class="dot" style="background:var(--purple)"></span>生成质量层 <span style="font-size:10px;color:var(--text-muted);font-weight:400;margin-left:4px">四模块独立展示</span></div>
          ${genRows}
          <div style="font-size:10px;color:var(--text-muted)">合并展示会掩盖某个模块的真实问题，因此四模块独立统计</div>
        </div>
      </div>

      <!-- 第四层：业务影响 -->
      <div class="card" style="margin-bottom:14px">
        <div class="section-title"><span class="dot" style="background:var(--amber)"></span>业务影响层 <span style="font-size:10px;color:var(--text-muted);font-weight:400;margin-left:4px">周维度 · 与基线对比 · 最重要，也最容易被忽视</span></div>
        <div class="grid-4">${bizCards}</div>
      </div>

      <div class="grid-2">
        <!-- 告警记录 -->
        <div class="card">
          <div class="section-title"><span class="dot" style="background:var(--red)"></span>告警记录</div>
          ${alerts}
          <div style="font-size:11px;color:var(--text-muted);margin-top:8px">未处理告警持续显示红色，不允许静默忽略</div>
        </div>

        <!-- Prompt 版本对比 -->
        <div class="card">
          <div class="section-title"><span class="dot"></span>Prompt 版本效果对比</div>
          <div style="display:flex;gap:8px;align-items:center;margin-bottom:12px">
            <select class="input"><option>归因模块</option><option>SOP模块</option><option>话术模块</option></select>
            <span style="font-size:11px;color:var(--text-muted)">当前 v1.3 vs</span>
            <select class="input"><option>v1.2</option><option>v1.1</option></select>
          </div>
          ${[['采纳率', d.promptVersions.adoptNew, d.promptVersions.adoptOld, true],
             ['驳回率', d.promptVersions.rejectNew, d.promptVersions.rejectOld, false]].map(([m,n,o,good]) => {
            const better = good ? n > o : n < o;
            return `
              <div style="margin-bottom:10px">
                <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:5px">
                  <span>${m}</span>
                  <span style="color:${better?'var(--green)':'var(--red)'}">v1.3: ${n}% ${better?'↑':'↓'} vs v1.2: ${o}%</span>
                </div>
                <div style="display:flex;gap:4px;height:6px;border-radius:3px;overflow:hidden">
                  <div style="width:${n}%;background:var(--accent);border-radius:3px"></div>
                  <div style="width:${o}%;background:var(--border-bright);border-radius:3px"></div>
                </div>
              </div>`;
          }).join('')}
          <button class="btn btn-secondary btn-sm" style="margin-top:4px" onclick="showToast('已回滚至 v1.2，操作已记录审计日志')">回滚至 v1.2</button>
        </div>
      </div>
    </div>`;
};

// ─────────────────────────────────────────────
//  10. 知识库管理
// ─────────────────────────────────────────────
PAGES['knowledge'] = () => {
  const rows = DATA.knowledge.map(k => {
    const typeColor = k.type === '国家规则' ? 'blue' : k.type.includes('SOP') ? 'teal' : k.type === '历史案例' ? 'purple' : k.type.includes('话术') ? 'green' : 'amber';
    return `
      <tr>
        <td style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted)">${k.id}</td>
        <td>${badge(k.type, typeColor)}</td>
        <td style="font-size:12px;color:var(--accent-light)">${k.name}</td>
        <td style="font-size:11px">${k.country}</td>
        <td style="font-size:11px">${k.route}</td>
        <td>${badge(k.version, 'gray')}</td>
        <td>${badge(k.status, k.status === '生效' ? 'green' : 'amber')}</td>
        <td style="font-size:11px;color:var(--text-muted)">${k.owner}</td>
        <td style="font-family:var(--font-mono);font-size:11px;color:var(--teal)">${k.cites}</td>
        <td>
          <button class="btn btn-ghost btn-sm" onclick="showToast('编辑知识条目')">编辑</button>
        </td>
      </tr>`;
  }).join('');

  const queue = DATA.knowledgeQueue.map(q => `
    <div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);align-items:flex-start">
      <div style="flex:1">
        <div style="font-size:12px">${q.content}</div>
        <div style="font-size:10px;color:var(--text-muted);margin-top:2px">${q.source} · ${q.time}</div>
      </div>
      <div style="display:flex;gap:6px">
        <button class="btn btn-success btn-sm" onclick="showToast('已通过审核，知识正式入库')">通过</button>
        <button class="btn btn-danger btn-sm" onclick="showToast('已退回，请填写退回原因')">退回</button>
      </div>
    </div>`).join('');

  return `
    <div class="fade-in">
      <div class="grid-2" style="margin-bottom:14px">
        <div>
          <div style="font-size:15px;font-weight:600;margin-bottom:4px">知识库管理</div>
          <div style="font-size:12px;color:var(--text-muted)">不是文档库，是活的系统：沉淀→检索→生成→反馈→评估→迭代</div>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;align-items:center;flex-wrap:wrap">
          <button class="btn btn-primary btn-sm" onclick="showToast('新增知识条目')">+ 新增知识</button>
          <button class="btn btn-secondary btn-sm" onclick="showToast('批量导入')">批量导入</button>
        </div>
      </div>

      <div class="grid-4" style="margin-bottom:14px">
        ${statCard('知识总量', DATA.knowledge.length + ' 条', '', 'blue')}
        ${statCard('生效中', DATA.knowledge.filter(k=>k.status==='生效').length + ' 条', '', 'green')}
        ${statCard('待审核', DATA.knowledgeQueue.length + ' 条', '', 'amber')}
        ${statCard('今日引用', '34 次', '', 'teal')}
      </div>

      <!-- 知识列表 -->
      <div class="card" style="margin-bottom:14px;padding:0">
        <div style="padding:14px 16px;border-bottom:1px solid var(--border)">
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
            <div class="search-box" style="flex:1">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--text-muted)" stroke-width="1.5"><circle cx="7" cy="7" r="5"/><line x1="11" y1="11" x2="14" y2="14"/></svg>
              <input placeholder="搜索知识名称...">
            </div>
            <select class="input"><option>全部类型</option><option>清关 SOP</option><option>历史案例</option></select>
            <select class="input"><option>全部状态</option><option>生效</option><option>草稿</option></select>
          </div>
        </div>
        <table class="data-table">
          <thead><tr><th>ID</th><th>类型</th><th>名称</th><th>国家</th><th>线路</th><th>版本</th><th>状态</th><th>维护人</th><th>引用次数</th><th>操作</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>

      <!-- 待审核队列 -->
      <div class="card">
        <div class="section-title"><span class="dot" style="background:var(--amber)"></span>待审核队列 <span style="font-size:10px;color:var(--text-muted);font-weight:400;margin-left:4px">AI 处理结果回写 / 运营补充 / 人工新增 — 审核通过后才入库</span></div>
        ${queue}
        <div style="font-size:11px;color:var(--text-muted);margin-top:8px">待审核队列是知识库质量的守门人。AI 生成内容不能直接入库，统一经 SOP 维护人逐条审核。</div>
      </div>
    </div>`;
};

// ─────────────────────────────────────────────
//  11. 规则配置
// ─────────────────────────────────────────────
PAGES['rules'] = () => {
  const slaRows = DATA.rules.sla.map(r => `
    <tr>
      <td style="font-weight:500">${r.node}</td>
      <td style="font-family:var(--font-mono);color:var(--green)">${r.standard}</td>
      <td style="font-family:var(--font-mono);color:var(--amber)">${r.latest}</td>
      <td style="font-size:11px;color:var(--text-muted)">${r.trigger}</td>
      <td><button class="btn btn-ghost btn-sm" onclick="showToast('编辑 SLA 配置')">编辑</button></td>
    </tr>`).join('');

  const mapRows = DATA.rules.statusMap.map(r => `
    <tr>
      <td style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted)">${r.providerCode}</td>
      <td style="font-size:11px">${r.internal}</td>
      <td>${badge(r.visible, 'teal')}</td>
    </tr>`).join('');

  return `
    <div class="fade-in">
      <div style="font-size:15px;font-weight:600;margin-bottom:14px">规则配置 <span style="font-size:12px;color:var(--text-muted);font-weight:400;margin-left:8px">深圳 → 胡志明 · 标准专线 · 启用</span></div>

      <div class="card" style="margin-bottom:14px">
        <div class="section-title"><span class="dot"></span>线路 SLA 规则</div>
        <table class="data-table">
          <thead><tr><th>履约节点</th><th>标准时效</th><th>最晚完成时间</th><th>超时触发规则</th><th>操作</th></tr></thead>
          <tbody>${slaRows}</tbody>
        </table>
      </div>

      <div class="card" style="margin-bottom:14px">
        <div class="section-title"><span class="dot"></span>状态映射规则 <span style="font-size:10px;color:var(--text-muted);font-weight:400;margin-left:4px">服务商状态码 → 内部状态 → 客户可见</span></div>
        <table class="data-table">
          <thead><tr><th>服务商状态码</th><th>内部状态</th><th>客户可见状态</th></tr></thead>
          <tbody>${mapRows}</tbody>
        </table>
        <div style="margin-top:10px"><button class="btn btn-secondary btn-sm" onclick="showToast('新增状态映射规则')">+ 新增映射</button></div>
      </div>

      <div class="alert alert-blue">
        <span>💡</span>
        <div style="font-size:11px">所有规则配置版本化管理，记录修改人/修改时间/回滚记录。MVP 阶段只维护深圳→胡志明线路的最小配置集，扩展多国家线路时在后台新增一套规则，不改代码。</div>
      </div>
    </div>`;
};

// ─────────────────────────────────────────────
//  导航辅助：从侧边栏入口跳到Tab内页
// ─────────────────────────────────────────────
PAGES['dispatch'] = () => orderDetailShell('dispatch');
PAGES['exception'] = () => orderDetailShell('exception');
PAGES['customer-sync'] = () => orderDetailShell('customer');
PAGES['billing'] = () => orderDetailShell('billing');
PAGES['order-entry'] = PAGES['order-entry'];

