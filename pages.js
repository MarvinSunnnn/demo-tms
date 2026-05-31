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
//  1. 接入中心 / 接入订单列表（工作台）
// ─────────────────────────────────────────────
PAGES['access-center'] = () => {
  const statusConfig = {
    checking: { text: '校验中', color: 'blue', action: '进入校验' },
    pass:     { text: '校验通过', color: 'green', action: '查看' },
    fail:     { text: '接入失败', color: 'red', action: '查看原因' },
    wait:     { text: '待补资料', color: 'amber', action: '去补资料' },
  };
  const sourceIcon = (s) => s === 'API' ? '🔌' : s === 'OMS' ? '📦' : '🏭';

  const rows = DATA.entryList.map(e => {
    const cfg = statusConfig[e.status] || { text: e.statusText, color: 'gray', action: '查看' };
    const isDemo = e.id === 'OMS-2026-CN-88421';
    return `
      <tr>
        <td>
          <span style="color:var(--accent-light);font-family:var(--font-mono);font-size:11px;${isDemo ? 'cursor:pointer' : ''}" ${isDemo ? 'onclick="goToEntry()"' : ''}>${e.id}</span>
        </td>
        <td><span style="font-size:12px">${sourceIcon(e.source)} ${e.source}</span></td>
        <td style="font-family:var(--font-mono);font-size:11px;color:var(--text-muted)">${e.time}</td>
        <td>${e.customer}</td>
        <td style="font-size:11px">${e.dest}</td>
        <td>${badge(cfg.text, cfg.color)}</td>
        <td style="font-size:11px;${e.issue !== '-' ? 'color:var(--amber)' : 'color:var(--text-muted)'}">${e.issue}</td>
        <td>
          <button class="btn ${isDemo ? 'btn-primary' : 'btn-ghost'} btn-sm" onclick="${isDemo ? 'goToEntry()' : 'showToast(\'演示仅支持主接入单\')'}">${cfg.action}</button>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <div class="fade-in">
      <div style="font-size:11px;color:var(--text-muted);margin-bottom:10px;line-height:1.6">
        展示所有从 OMS/ERP/API 推送到 TMS 的订单接入记录。通过校验状态定位待处理订单，点击进入接入详情执行字段校验、地址解析和清关资料预审。
      </div>

      <div class="card" style="padding:12px 16px;margin-bottom:14px">
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
          <div class="search-box" style="flex:1;min-width:180px">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--text-muted)" stroke-width="1.5"><circle cx="7" cy="7" r="5"/><line x1="11" y1="11" x2="14" y2="14"/></svg>
            <input placeholder="搜索接入单号 / 客户...">
          </div>
          <select class="input"><option>全部来源</option><option>API</option><option>OMS</option><option>ERP</option></select>
          <select class="input"><option>全部状态</option><option>校验中</option><option>校验通过</option><option>待补资料</option><option>接入失败</option></select>
          <select class="input"><option>全部目的国</option><option>越南胡志明</option><option>越南河内</option></select>
          <button class="btn btn-secondary btn-sm" onclick="showToast('筛选条件已重置')">重置</button>
        </div>
      </div>

      <div class="card" style="padding:0;overflow-x:auto">
        <table class="data-table">
          <thead><tr><th>接入单号</th><th>来源</th><th>接入时间</th><th>客户</th><th>目的国</th><th>校验状态</th><th>接入异常</th><th>操作</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>

      <div style="margin-top:14px;font-size:11px;color:var(--text-muted);text-align:center">
        💡 点击 <span style="color:var(--accent-light);font-family:var(--font-mono)">OMS-2026-CN-88421</span>（A 客户 · 越南胡志明）进入接入校验演示流程
      </div>
    </div>
  `;
};

// ─────────────────────────────────────────────
//  2. 订单中心 / 履约工作台（PRD 3.3）
// ─────────────────────────────────────────────
PAGES['order-list'] = () => {
  const rows = DATA.orderList.map((o, i) => {
    const riskBadge = o.riskLevel === '-' ? '<span style="color:var(--text-muted)">无风险</span>'
      : badge(`${o.risk} ${o.riskLevel}`, o.riskLevel === 'P1' ? 'red' : 'amber');
    const slaColor = o.sla.includes('超') ? 'color:var(--red)' : o.sla.includes('即将') ? 'color:var(--amber)' : 'color:var(--text-secondary)';
    const responsible = o.handlers.length > 0 ? o.handlers[0].owner : '-';
    const sourceBadge = o.source === '清关服务商' || o.source.includes('人工') ? badge(o.source, 'amber') : `<span style="font-size:11px;color:var(--text-muted)">${o.source}</span>`;
    return `
      <tr>
        <td>
          <span style="color:var(--accent-light);font-family:var(--font-mono);font-size:11px;cursor:pointer" onclick="goToDetail()">${o.tmsId}</span>
          <div style="font-size:10px;color:var(--text-muted);margin-top:2px">${o.route}</div>
        </td>
        <td>${o.customer}<br><span style="font-size:10px;color:var(--text-muted)">${o.level === 'KA' ? '<span style="color:var(--amber)">★ KA</span>' : o.level}</span></td>
        <td>${nodeStatusBadge(o.nodeStatus)}<div style="font-size:11px;margin-top:3px">${o.node}</div></td>
        <td><span style="${slaColor};font-family:var(--font-mono);font-size:11px">${o.sla}</span></td>
        <td style="font-size:11px">${sourceBadge}</td>
        <td>${riskBadge}</td>
        <td>${o.handleCount > 0 ? `<span style="color:var(--accent-light);cursor:pointer;font-weight:500" onclick="toggleHandlers(${i})">查看 ${o.handleCount} 项处置 →</span>` : '<span style="color:var(--text-muted)">-</span>'}</td>
        <td style="font-size:11px">${responsible !== '-' ? `<span style="color:var(--text-secondary)">${responsible}</span>` : '<span style="color:var(--text-muted)">-</span>'}</td>
        <td><button class="btn btn-primary btn-sm" onclick="${o.tmsId === O.tmsId ? 'goToDetail()' : 'showToast(\'演示仅支持主订单\')'}">${o.action}</button></td>
      </tr>
      ${o.handleCount > 0 ? `<tr id="handlers-${i}" style="display:none"><td colspan="9" style="padding:0;background:var(--bg-base)">
        <div id="hw-${i}" style="padding:12px 16px">
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
        <div class="queue-tab active" onclick="queueFilter(this,'all')">全部订单</div>
        <div class="queue-tab" onclick="queueFilter(this,'entry')">待接入处理 <span style="color:var(--amber)">1</span></div>
        <div class="queue-tab" onclick="queueFilter(this,'dispatch')">待调度 <span style="color:var(--amber)">1</span></div>
        <div class="queue-tab" onclick="queueFilter(this,'risk')">履约风险</div>
        <div class="queue-tab" onclick="queueFilter(this,'exception')">异常处理中 <span style="color:var(--red)">1</span></div>
        <div class="queue-tab" onclick="queueFilter(this,'customer')">待客户同步 <span style="color:var(--amber)">1</span></div>
        <div class="queue-tab" onclick="queueFilter(this,'billing')">待费用确认</div>
      </div>

      <div class="card" style="padding:12px 16px;margin-bottom:14px">
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
          <div class="search-box" style="flex:1;min-width:180px">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--text-muted)" stroke-width="1.5"><circle cx="7" cy="7" r="5"/><line x1="11" y1="11" x2="14" y2="14"/></svg>
            <input placeholder="搜索履约单号 / 客户 / 目的城市...">
          </div>
          <select class="input"><option>全部客户</option><option>A 客户 (KA)</option></select>
          <select class="input"><option>全部节点</option><option>目的国清关</option><option>跨境干线</option><option>出口清关</option><option>末端配送</option></select>
          <select class="input"><option>全部风险</option><option>P1</option><option>P2</option></select>
          <select class="input"><option>全部责任方</option><option>运营</option><option>客服</option><option>调度</option><option>财务</option></select>
          <select class="input"><option>SLA 全部</option><option>已超时</option><option>即将超时</option><option>正常</option></select>
          <button class="btn btn-secondary btn-sm" onclick="showToast('筛选条件已重置')">重置</button>
        </div>
      </div>

      <div class="card" style="padding:0;overflow-x:auto">
        <table class="data-table">
          <thead><tr><th>履约单号</th><th>客户/等级</th><th>当前节点</th><th>节点SLA</th><th>状态来源</th><th>风险摘要</th><th>处置项</th><th>责任方</th><th>推荐动作</th></tr></thead>
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
    <tr>
      <td style="white-space:nowrap">${c.obj}</td>
      <td style="font-size:11px;color:var(--text-muted);white-space:nowrap">${c.fields}</td>
      <td>${checkIcon(c.result)}</td>
      <td>${routingBadge(c.routingType, c.routing)}</td>
      <td style="font-size:11px;color:var(--text-secondary);line-height:1.5">${c.flow}</td>
    </tr>
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

      </div>

      <!-- 校验进度 -->
      <div class="card" style="margin-bottom:14px;padding:16px 20px">
        <div class="step-line">
          <div style="text-align:center;flex-shrink:0;width:56px"><div class="step-node done">✓</div><div style="font-size:10px;color:var(--green);margin-top:4px">字段校验</div></div>
          <div class="step-connector done"></div>
          <div style="text-align:center;flex-shrink:0;width:56px"><div class="step-node done">✓</div><div style="font-size:10px;color:var(--green);margin-top:4px">地址解析</div></div>
          <div class="step-connector done"></div>
          <div style="text-align:center;flex-shrink:0;width:56px"><div class="step-node error">!</div><div style="font-size:10px;color:var(--red);margin-top:4px">清关预审</div></div>
          <div class="step-connector"></div>
          <div style="text-align:center;flex-shrink:0;width:56px"><div class="step-node">4</div><div style="font-size:10px;color:var(--text-muted);margin-top:4px">生成履约单</div></div>
        </div>
      </div>

      <div class="grid-2" style="margin-bottom:14px">
        <!-- 字段校验 -->
        <div class="card">
          <div class="section-title"><span class="dot"></span>字段校验</div>
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:10px">核心是规则校验，不强行引入 AI。价值是分流——把订单分成可继续/待补资料/待确认/失败。</div>
          <table class="data-table"><thead><tr><th style="white-space:nowrap">校验对象</th><th style="white-space:nowrap">字段</th><th style="white-space:nowrap">校验结果</th><th style="white-space:nowrap">分流结果</th><th>系统动作</th></tr></thead><tbody>${fieldRows}</tbody></table>
        </div>

        <!-- 地址解析 -->
        <div class="card">
          <div class="section-title"><span class="dot"></span>地址解析 <span style="font-size:10px;color:var(--accent-light);margin-left:4px">规则 + AI 辅助 + 人工确认</span></div>

          <!-- 起运地 -->
          <div style="background:var(--bg-base);border-radius:8px;padding:12px;margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
              <span style="font-size:11px;color:var(--text-muted)">起运地（国内）</span>
              ${badge('解析成功', 'green')}
            </div>
            <div style="font-size:12px">${ap.origin.std}</div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px">
              <span style="font-size:10px;font-family:var(--font-mono);color:var(--text-muted)">${ap.origin.coord}</span>
              <span style="font-size:11px;color:var(--green)">置信度 ${ap.origin.confidence}%</span>
            </div>
            <div style="font-size:10px;color:var(--text-muted);margin-top:4px">${ap.origin.coverage}</div>
          </div>

          <!-- 目的地 -->
          <div style="background:linear-gradient(135deg,rgba(245,158,11,0.06),rgba(245,158,11,0.02));border:1px solid rgba(245,158,11,0.2);border-radius:8px;padding:12px;margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
              <span style="font-size:11px;color:var(--text-muted)">目的地（越南）</span>
              ${badge(ap.dest.statusText, 'amber')}
            </div>
            <div style="font-size:12px;color:var(--amber)">${ap.dest.raw}</div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px">
              <span style="font-size:10px;color:var(--text-muted)">置信度 ${ap.dest.confidence}% · ${ap.dest.coverage}</span>
            </div>
          </div>

          <!-- AI 辅助说明 -->
          <div class="ai-panel" style="margin-bottom:10px">
            <div style="font-size:11px;color:var(--text-secondary);line-height:1.6;margin-bottom:8px">
              🤖 ${ap.dest.aiNote}
            </div>
            <div style="font-size:10px;color:var(--amber);margin-bottom:8px">⚠ ${ap.dest.missing}</div>
            <div style="font-size:10px;color:var(--text-muted);margin-bottom:8px;letter-spacing:0.5px">AI 候选地址</div>
            ${ap.dest.candidates.map((c, i) => `
              <div data-candidate="${i+1}" onclick="selectAddressCandidate(${i+1})" style="display:flex;align-items:center;gap:8px;padding:7px 10px;background:var(--bg-base);border-radius:6px;margin-bottom:4px;border:1px solid transparent;cursor:pointer;transition:all var(--transition)" onmouseover="if(!this.dataset.selected||this.dataset.selected!=='1')this.style.borderColor='var(--border-bright)'" onmouseout="if(!this.dataset.selected||this.dataset.selected!=='1')this.style.borderColor='transparent'">
                <span style="font-size:10px;font-family:var(--font-mono);color:var(--text-muted);flex-shrink:0">候选${i+1}</span>
                <div style="flex:1;min-width:0">
                  <div style="font-size:11px;color:var(--text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.addr}</div>
                  <div style="font-size:9px;color:var(--text-muted)">${c.coord} · ${c.source}</div>
                </div>
                <span style="font-size:11px;font-weight:600;font-family:var(--font-mono);color:${c.confidence>=70?'var(--green)':'var(--amber)'}">${c.confidence}%</span>
              </div>
            `).join('')}
          </div>

          <div style="display:flex;gap:8px">
            <button class="btn btn-primary btn-sm" id="confirm-addr-btn" onclick="confirmAddressCandidate()" disabled>请先选择候选地址</button>
            <button class="btn btn-secondary btn-sm" onclick="showToast('地址编辑演示中')">手动编辑</button>
            <button class="btn btn-ghost btn-sm" onclick="showToast('已标记：需客户补充')">标记需客户补充</button>
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

function routingBadge(type, text) {
  const map = {
    continue:    ['green',  '可继续'],
    pending_doc: ['amber',  '待补资料'],
    pending_check:['amber', '待人工确认'],
    failed:      ['red',    '接入失败'],
  };
  const [color, label] = map[type] || ['gray', text];
  return `<span class="badge badge-${color}">${label}</span>`;
}

function checkIcon(result) {
  const map = {
    pass: '<span style="color:var(--green);font-size:11px">通过</span>',
    fail: '<span style="color:var(--red);font-size:11px">阻断</span>',
    warn: '<span style="color:var(--amber);font-size:11px">待确认</span>',
    pending: '<span style="color:var(--text-muted);font-size:11px">-</span>',
  };
  return map[result] || '';
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
      <div class="node-card ${cls}" onclick="showSubNodes('${s.name}')" style="cursor:pointer" title="点击查看 ${s.name} 子节点明细">
        <div class="node-icon" style="background:var(--bg-card)">${s.icon}</div>
        <div style="flex:1">
          <div style="font-size:12px;font-weight:500;color:var(--text-primary)">${s.name} ${icon}</div>
          <div style="font-size:10px;color:var(--text-muted);margin-top:2px">${s.current} · ${s.doneCount}/${s.subCount} 子节点 · ${s.source}</div>
        </div>
        ${s.status === 'exception' ? badge('异常处理中', 'red') : s.status === 'done' ? badge('已完成', 'green') : badge('未开始', 'gray')}
        <span style="color:var(--accent-light);font-size:11px;margin-left:10px;flex-shrink:0">查看明细 →</span>
      </div>
    `;
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
          <div class="section-title"><span class="dot"></span>分段履约进度 <span style="font-size:10px;color:var(--text-muted);margin-left:4px">点击各履约段查看子节点明细</span></div>
          <div style="display:flex;flex-direction:column;gap:8px">${segs}</div>
        </div>

        <!-- 地图轨迹 -->
        <div class="card" style="display:flex;flex-direction:column">
          <div class="section-title"><span class="dot" style="background:var(--teal)"></span>地图 / 轨迹辅助区</div>
          ${mapWidget()}
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
    <div style="position:relative;flex:1;min-height:200px;background:#d1d5db;border-radius:8px;overflow:hidden">
      <!-- 地图占位底图 -->
      <div style="position:absolute;inset:0;background:#d1d5db"></div>
      <!-- "地图示意" 右上角 -->
      <div style="position:absolute;top:8px;right:10px;color:#9ca3af;font-size:11px;letter-spacing:1px;z-index:3">🗺 地图示意</div>
      <!-- 路线叠加层 -->
      <svg width="100%" height="200" viewBox="0 0 320 200" style="position:absolute;z-index:2">
        <defs>
          <linearGradient id="routeg" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#22c55e"/><stop offset="60%" stop-color="#22c55e"/>
            <stop offset="60%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#4b6a8a"/>
          </linearGradient>
        </defs>
        <path d="M40 140 Q120 60 180 100 T280 120" fill="none" stroke="url(#routeg)" stroke-width="2.5" stroke-dasharray="4 3"/>
        <circle cx="40" cy="140" r="6" fill="#22c55e"/><text x="40" y="158" fill="#6b7280" font-size="9" text-anchor="middle" font-weight="600">深圳</text>
        <circle cx="180" cy="100" r="5" fill="#22c55e"/><text x="180" y="85" fill="#6b7280" font-size="9" text-anchor="middle">凭祥口岸</text>
        <circle cx="280" cy="120" r="7" fill="#f59e0b" stroke="#f59e0b" stroke-opacity="0.3" stroke-width="4"><animate attributeName="r" values="7;9;7" dur="2s" repeatCount="indefinite"/></circle>
        <text x="280" y="142" fill="#b45309" font-size="10" text-anchor="middle" font-weight="600">胡志明</text>
      </svg>
      <!-- 顶部路线标签 -->
      <div style="position:absolute;top:8px;left:10px;font-size:9px;color:#6b7280;z-index:3;background:rgba(255,255,255,0.7);padding:2px 6px;border-radius:3px">深圳 → 凭祥/口岸 → 胡志明</div>
      <!-- 底部信息 -->
      <div style="position:absolute;bottom:0;left:0;right:0;z-index:3;background:rgba(255,255,255,0.85);padding:6px 10px 6px">
        <div style="font-size:10px;color:var(--text-secondary);margin-bottom:1px">最新轨迹：清关服务商 14:20 回传</div>
        <div style="font-size:10px;color:var(--text-muted)">地图仅作位置辅助，不作为唯一状态依据</div>
      </div>
    </div>
  `;
}

// ─────────────────────────────────────────────
//  4. 调度方案 Tab
// ─────────────────────────────────────────────
function renderDispatch() {
  const segCards = DATA.dispatchSegments.map(s => {
    const dispColor = s.dispatchStatus === '已确认' || s.dispatchStatus === '已接单' ? 'green' : s.dispatchStatus === '已派单' ? 'amber' : 'gray';
    const isException = s.execStatus === '异常中';
    return `
      <div class="card dispatch-seg-card" data-seg="${s.name}" style="padding:14px 16px;cursor:pointer;transition:all var(--transition);${isException ? 'border-color:rgba(239,68,68,0.3)' : ''}" onclick="selectDispatchSegment('${s.name}')">
        <div style="display:flex;align-items:center;gap:12px">
          <div style="font-size:13px;font-weight:600;color:var(--text-primary);min-width:72px;flex-shrink:0">${s.name}</div>
          <div style="flex:1;font-size:12px;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.provider}</div>
          ${badge(s.dispatchStatus, dispColor)}
          <span style="color:var(--text-muted);font-size:11px;margin-left:auto">▸</span>
        </div>
      </div>`;
  }).join('');

  return `
    <div class="fade-in">
      <div class="card" style="margin-bottom:14px">
        <div class="section-title"><span class="dot"></span>调度前置校验</div>
        <div style="display:flex;gap:16px;flex-wrap:wrap">
          ${['地址已确认 ✓','清关资料预审通过（税号待补充，已人工确认）✓','服务产品匹配 ✓','偏远区域：否 ✓','禁运/申报风险：无 ✓'].map(t => `<div style="font-size:12px;color:${t.includes('✓')?'var(--green)':'var(--amber)'}">${t}</div>`).join('')}
        </div>
      </div>

      <div class="grid-2" style="grid-template-columns:380px 1fr;align-items:start;gap:12px">
        <div class="card" style="position:sticky;top:0">
          <div class="section-title"><span class="dot"></span>全链路调度总览 <span style="font-size:10px;color:var(--text-muted);font-weight:400;margin-left:4px">点击切换</span></div>
          <div style="display:flex;flex-direction:column;gap:8px">${segCards}</div>
        </div>
        <div id="dispatch-detail"></div>
      </div>
    </div>`;
}

function renderDispatchDetail(segName) {
  const seg = DATA.dispatchSegments.find(s => s.name === segName);
  if (!seg) return '';

  if (seg.execStatus === '已完成') {
    return renderDispatchDone(seg);
  } else if (seg.execStatus === '执行中') {
    return renderDispatchRunning(seg);
  } else if (seg.execStatus === '异常中') {
    return renderDispatchException(seg);
  } else {
    return renderDispatchPending(seg);
  }
}

function renderDispatchDone(seg) {
  const nodes = DATA.segmentSubNodes[seg.name] || [];
  const rows = nodes.map(n => {
    const sc = n.status === 'done' ? 'green' : n.status === 'active' ? 'amber' : 'gray';
    const st = n.status === 'done' ? '已完成' : n.status === 'active' ? '处理中' : '未触发';
    return `<tr><td style="font-size:11px">${n.name}</td><td>${badge(st, sc)}</td><td style="font-family:var(--font-mono);font-size:10px">${n.plan}</td><td style="font-family:var(--font-mono);font-size:10px">${n.actual}</td><td style="font-size:10px;color:var(--text-muted)">${n.source}</td><td style="font-size:10px;color:var(--text-muted)">${n.note}</td></tr>`;
  }).join('');
  return `
    <div class="card" style="margin-bottom:14px;border-color:rgba(34,197,94,0.2)">
      <div class="section-title"><span class="dot" style="background:var(--green)"></span>${seg.name} · 执行记录 <span style="font-size:10px;color:var(--text-muted);font-weight:400;margin-left:4px">只读</span></div>
      <div style="display:flex;gap:16px;margin-bottom:12px;flex-wrap:wrap">
        <div><span style="font-size:10px;color:var(--text-muted)">服务商</span><div style="font-size:12px;margin-top:2px">${seg.provider}</div></div>
        <div><span style="font-size:10px;color:var(--text-muted)">反馈状态</span><div style="font-size:12px;margin-top:2px;color:var(--green)">${seg.feedback}</div></div>
        <div><span style="font-size:10px;color:var(--text-muted)">SLA</span><div style="font-size:12px;margin-top:2px">${seg.sla}</div></div>
      </div>
      <table class="data-table">
        <thead><tr><th>子节点</th><th>状态</th><th>计划</th><th>实际</th><th>来源</th><th>说明</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function renderDispatchRunning(seg) {
  return `
    <div class="card" style="margin-bottom:14px;border-color:rgba(99,102,241,0.2)">
      <div class="section-title"><span class="dot" style="background:var(--accent)"></span>${seg.name} · 进度监控</div>
      <div class="grid-2" style="margin-bottom:12px">
        <div>
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">当前服务商</div>
          <div style="font-size:12px;font-weight:500">${seg.provider}</div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:4px">SLA 状态</div>
          <span style="font-family:var(--font-mono);font-size:12px;color:var(--accent-light)">${seg.sla}</span>
        </div>
      </div>
      <div class="ai-panel" style="margin-bottom:12px">
        <div style="font-size:11px;color:var(--text-secondary);line-height:1.7">
          最近回传：${seg.feedback}<br>
          预计到达胡志明口岸：05-31 09:30<br>
          <span style="color:var(--text-muted);font-size:10px">跨境运输中，暂无异常。</span>
        </div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-primary btn-sm" onclick="showToast('已联系服务商')">联系服务商</button>
        <button class="btn btn-secondary btn-sm" onclick="showToast('改派功能演示中')">改派</button>
      </div>
    </div>`;
}

function renderDispatchException(seg) {
  const provRows = DATA.providerCompare.map(p => `
    <tr style="${p.selected ? 'background:rgba(59,130,246,0.06)' : ''}">
      <td><span style="font-weight:${p.selected ? 600 : 400};color:${p.selected ? 'var(--accent-light)' : 'inherit'}">${p.selected ? '✓ ' : ''}${p.name}</span></td>
      <td>${p.coverage}</td><td>${costBadge(p.cost)}</td><td>${speedBadge(p.response)}</td><td>${stabilityBadge(p.stability)}</td>
      <td><div style="display:flex;align-items:center;gap:8px"><div class="progress-bar" style="width:60px"><div class="progress-fill ${p.score >= 85 ? 'green' : p.score >= 75 ? 'blue' : 'amber'}" style="width:${p.score}%"></div></div><span style="font-size:11px;font-family:var(--font-mono)">${p.score}</span></div></td>
      <td style="font-size:11px;color:var(--text-muted)">${p.note}</td><td>${p.recommend ? badge('推荐', 'green') : ''}</td>
    </tr>`).join('');
  const weightBars = DATA.scoreWeights.map(w => `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><div style="font-size:11px;color:var(--text-muted);width:72px">${w.dim}</div><div class="progress-bar" style="flex:1"><div class="progress-fill blue" style="width:${w.weight * 3}%"></div></div><div style="font-size:11px;font-family:var(--font-mono);color:var(--text-secondary)">${w.weight}%</div></div>`).join('');
  return `
    <div class="card" style="margin-bottom:14px;border-color:rgba(245,158,11,0.25)">
      <div class="section-title"><span class="dot" style="background:var(--amber)"></span>${seg.name} <span style="font-size:10px;color:var(--text-muted);font-weight:400;margin-left:4px">候选服务商对比</span></div>
      <table class="data-table"><thead><tr><th>服务商</th><th>覆盖</th><th>费用</th><th>响应</th><th>稳定性</th><th>综合评分</th><th>备注</th><th></th></tr></thead><tbody>${provRows}</tbody></table>
      <div class="divider"></div>
      <div class="grid-2">
        <div><div style="font-size:11px;color:var(--text-muted);margin-bottom:8px">评分权重</div>${weightBars}</div>
        <div>
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px">AI 推荐解释</div>
          <div class="ai-panel"><div style="font-size:12px;color:var(--text-secondary);line-height:1.7">选择清关服务商 D 的主要依据：覆盖胡志明口岸 ✓，清关响应速度快 ✓，综合评分最高（86 分）。<br>风险提示：该服务商近期回传稳定性中等，建议设置 2 小时回传超时提醒。</div></div>
          <div style="margin-top:12px;display:flex;gap:8px"><button class="btn btn-primary btn-sm" onclick="showToast('调度方案已确认')">确认当前服务商</button><button class="btn btn-secondary btn-sm" onclick="showToast('改派功能演示中')">改派</button><button class="btn btn-ghost btn-sm" onclick="showModal('fillReason')">填写偏离原因</button></div>
        </div>
      </div>
    </div>`;
}

function renderDispatchPending(seg) {
  return `
    <div class="card" style="margin-bottom:14px;border-color:rgba(99,102,241,0.15)">
      <div class="section-title"><span class="dot" style="background:var(--accent)"></span>${seg.name} · 候选方案 <span style="font-size:10px;color:var(--text-muted);font-weight:400;margin-left:4px">待调度 / 已预选</span></div>
      <div style="display:flex;gap:16px;margin-bottom:12px;flex-wrap:wrap">
        <div><span style="font-size:10px;color:var(--text-muted)">预选服务商</span><div style="font-size:12px;margin-top:2px">${seg.provider}</div></div>
        <div><span style="font-size:10px;color:var(--text-muted)">回传要求</span><div style="font-size:12px;margin-top:2px;color:var(--text-muted)">${seg.feedback}</div></div>
        <div><span style="font-size:10px;color:var(--text-muted)">SLA</span><div style="font-size:12px;margin-top:2px">${seg.sla}</div></div>
      </div>
      <div class="ai-panel" style="margin-bottom:12px">
        <div style="font-size:11px;color:var(--text-secondary);line-height:1.7">该段依赖目的国清关放行后触发。当前已预选越南末端服务商 E，覆盖胡志明市第一郡，历史签收率 94%。待清关放行后可确认派单。</div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-primary btn-sm" onclick="showToast('派单已确认')">确认派单</button>
        <button class="btn btn-secondary btn-sm" onclick="showToast('更换方案演示中')">更换候选方案</button>
      </div>
    </div>`;
}

function costBadge(c) { return c === '低' ? badge('低', 'green') : c === '中' ? badge('中', 'blue') : badge('高', 'amber'); }
function speedBadge(c) { return c === '快' ? badge('快', 'green') : badge('中', 'amber'); }
function stabilityBadge(c) { return c === '高' ? badge('高', 'green') : c === '中' ? badge('中', 'amber') : badge('低', 'red'); }

// ─────────────────────────────────────────────
//  5. 异常工单 Tab（含 AI 打字机动效）+ 多异常标签栏
// ─────────────────────────────────────────────
function renderException() {
  const ex = DATA.exceptions;
  const activeIdx = STATE.exceptionTab || 0;
  const e = ex[activeIdx];
  const isClosed = e.status === '已关闭';
  const lc = e.levelColor==='red'?'239,68,68':'217,119,6';
  return `
    <div class="fade-in" style="display:flex;flex-direction:column;gap:12px">
      <!-- 异常标签栏 -->
      <div class="card" style="padding:6px 10px;display:flex;gap:6px;align-items:center;flex-wrap:wrap">
        ${ex.map((x, i) => `
          <div class="exception-tab ${i === activeIdx ? 'active' : ''}" onclick="switchExceptionTab(${i})"
               style="display:flex;align-items:center;gap:5px;padding:5px 10px;border-radius:6px;cursor:pointer;
                      ${i === activeIdx ? 'background:var(--accent);color:#fff' : 'background:var(--bg-hover);color:var(--text-secondary)'};
                      font-size:11px;transition:background var(--transition)">
            ${badge(x.level, x.levelColor)}
            <span style="font-weight:500;font-size:11px">${x.type}</span>
            <span style="font-size:9px;opacity:0.7">● ${x.status}</span>
          </div>`).join('')}
      </div>

      <!-- 工单摘要行 -->
      <div class="card" style="padding:10px 14px;border-left:3px solid rgba(${lc},0.5);${isClosed?'opacity:0.6':''}">
        <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;font-size:12px">
          <span style="font-weight:600;color:var(--${e.levelColor==='red'?'red':'amber'})">${e.type}</span>
          ${badge(e.level, e.levelColor)}
          <span style="color:var(--text-muted);font-family:var(--font-mono);font-size:10px">${e.woId}</span>
          <span style="color:var(--text-muted)">|</span>
          <span style="font-family:var(--font-mono);font-size:11px">触发 ${e.triggerTime}</span>
          <span style="color:var(--${e.levelColor==='red'?'red':'amber'});font-family:var(--font-mono);font-size:11px">超时 ${e.overtime}</span>
          <span style="color:var(--text-muted)">|</span>
          <span>${e.node}</span>
          <span style="color:var(--text-muted)">|</span>
          <span>责任方: ${e.responsible}</span>
          <span style="margin-left:auto">${badge(e.status, e.statusColor)}</span>
        </div>
      </div>

      <!-- 正文区：上下文 + AI 上下排列 -->
      <!-- 上下文证据区 -->
      <div class="card" style="${isClosed?'opacity:0.6':''}">
        <div class="section-title"><span class="dot"></span>上下文证据区 <span style="font-size:10px;color:var(--text-muted);font-weight:400">Agent Step 1 感知 · 自动聚合，无需跨系统追查</span></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px 16px">
          ${e.ctx.map(c => `
            <div style="display:flex;gap:6px;align-items:flex-start;padding:4px 0">
              <span style="font-size:10px;color:var(--accent-light);background:rgba(99,102,241,0.08);padding:1px 6px;border-radius:3px;flex-shrink:0;font-weight:500">${c.label}</span>
              <span style="font-size:11px;color:${c.hl?'var(--amber)':'var(--text-secondary)'};line-height:1.5">${c.text}</span>
            </div>`).join('')}
        </div>
      </div>

      <!-- AI 辅助区 -->
      ${isClosed ? `
        <div class="card" style="opacity:0.6;text-align:center;padding:30px;color:var(--text-muted)">
          <div style="font-size:20px;margin-bottom:6px">✓</div>
          <div style="font-size:12px">工单已关闭，AI 辅助区不再可用</div>
        </div>
      ` : `
        <div class="card ai-panel scan-effect" style="background:linear-gradient(135deg,rgba(59,130,246,0.04),rgba(20,184,166,0.04))">
          <div class="ai-panel-header">
            <div class="ai-dot"></div>
            <span style="font-size:12px;font-weight:600;color:var(--accent-light)">AI 辅助区</span>
            <span style="font-size:10px;color:var(--text-muted);margin-left:4px">分步可见 · 各模块独立审核</span>
            <button class="btn btn-secondary btn-sm" style="margin-left:auto" id="btn-ai-gen" onclick="startAIGeneration()">▶ 重新生成</button>
          </div>
          <div id="ai-modules" style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            ${aiModuleShell('attribution', '归因分析', `置信度 ${DATA.aiAttribution.confidenceOverall}%`)}
            ${aiModuleShell('sop', 'SOP 推荐', DATA.aiSop.name)}
            ${aiModuleShell('message', '客户话术草稿', '已生成 · 含 2 处风险词')}
            ${aiModuleShell('cost', '费用影响提示', `${DATA.aiCost.types.length} 项`)}
          </div>
          <div class="divider"></div>
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px">关闭前置校验（全部完成后才可关闭工单）</div>
          <div style="display:flex;gap:12px;flex-wrap:wrap">
            ${closeCheck('归因/SOP已确认', false)}
            ${closeCheck('客户同步已完成', false)}
            ${closeCheck('节点已恢复', false)}
            ${closeCheck('费用已标记', false)}
          </div>
          <button class="btn btn-secondary btn-sm" style="margin-top:10px;opacity:0.5;cursor:not-allowed;width:100%">关闭工单（前置校验未通过）</button>
        </div>
      `}

      <!-- 人工处理区 -->
      <div class="card" style="${isClosed?'opacity:0.5':''}">
        <div class="section-title"><span class="dot" style="background:var(--teal)"></span>人工处理区</div>
        <div class="grid-2">
          <div>
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px">确认最终原因</div>
            <select class="input" style="width:100%;margin-bottom:10px" ${isClosed?'disabled':''}><option>清关资料待补充——收货人税号问题（AI 建议，已采纳）</option></select>
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px">处理动作</div>
            <textarea class="input" style="width:100%;height:60px;resize:none" ${isClosed?'disabled':''} placeholder="联系清关服务商 D，向委托客户索取越南格式税号，跟进重新申报..."></textarea>
          </div>
          <div>
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px">预计恢复时间</div>
            <input class="input" style="width:100%;margin-bottom:10px" value="06-01 18:00" ${isClosed?'disabled':''}>
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px">后续动作</div>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              ${isClosed ? '<span style="font-size:11px;color:var(--text-muted)">工单已关闭，不可操作</span>' : `
                <button class="btn btn-primary btn-sm" onclick="switchDetailTab('customer')">去客户同步 →</button>
                <button class="btn btn-secondary btn-sm" onclick="switchDetailTab('billing')">标记异常费用</button>
                <button class="btn btn-ghost btn-sm" onclick="showToast('处理动作已保存')">保存</button>
              `}
            </div>
          </div>
        </div>
      </div>
    </div>
    <script>if(!STATE.aiGenerated)setTimeout(function(){startAIGeneration()},400)</script>\`;
}

function ctxItem(label, content, highlight = false) {
  return `
    <div style="display:flex;gap:8px;margin-bottom:7px;align-items:flex-start">
      <span style="font-size:10px;color:var(--accent-light);background:rgba(59,130,246,0.1);padding:1px 6px;border-radius:3px;flex-shrink:0;margin-top:1px;font-weight:500">${label}</span>
      <span style="font-size:11px;color:${highlight ? 'var(--amber)' : 'var(--text-secondary)'};line-height:1.5">${content}</span>
    </div>`;
}

function aiModuleShell(key, title, subtitle) {
  return `
    <div class="card" style="background:var(--bg-surface);padding:0;overflow:hidden" id="module-${key}">
      <div style="display:flex;align-items:center;gap:8px;padding:8px 12px;border-bottom:1px solid var(--border)">
        <div class="ai-dot" style="width:6px;height:6px"></div>
        <span style="font-size:12px;font-weight:500;color:var(--text-primary)">${title}</span>
        <span style="font-size:10px;color:var(--text-muted)" id="subtitle-${key}">${subtitle}</span>
        <span style="margin-left:auto" id="status-${key}">${badge('等待生成', 'amber')}</span>
      </div>
      <div style="padding:0 12px 12px;font-size:12px;color:var(--text-muted);min-height:40px" id="body-${key}">
        AI 正在分析<span class="typewriter-cursor"></span>
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
    </tr>`).join('');

  const syncs = DATA.syncRecords.map(r => {
    const sc = r.status === '已读' ? 'green' : r.status === '已发送' ? 'blue' : r.status === '发送失败' ? 'red' : 'gray';
    return `<tr>
      <td style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted);white-space:nowrap">${r.time}</td>
      <td>${badge(r.trigger, r.trigger === '异常处理' ? 'amber' : 'blue')}</td>
      <td style="font-size:11px;max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${r.content.replace(/"/g, '&quot;')}">${r.content}</td>
      <td style="font-size:11px">${r.channel}</td>
      <td style="font-size:11px;color:var(--text-muted)">${r.contact}</td>
      <td>${badge(r.status, sc)}</td>
      <td style="font-size:11px;color:var(--text-muted)">${r.operator}</td>
      <td style="font-size:10px;font-family:var(--font-mono);color:var(--accent-light)">${r.relatedObj}</td>
      <td style="font-size:10px;color:var(--text-muted)">${r.followUp}</td>
    </tr>`;
  }).join('');

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
          <div class="section-title"><span class="dot"></span>内外状态映射</div>
          <table class="data-table">
            <thead><tr><th>内部状态</th><th>客户可见</th></tr></thead>
            <tbody>${mapRows}</tbody>
          </table>
        </div>

        <!-- AI 话术草稿 + 风险控制 -->
        <div class="card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
            <div class="section-title" style="margin-bottom:0"><span class="dot" style="background:var(--amber)"></span>AI 话术草稿
              <span id="sync-state-badge" style="margin-left:8px">${badge('待发送·含风险词', 'red')}</span>
            </div>
            <div style="display:flex;align-items:center;gap:6px">
              <span style="font-size:11px;color:var(--text-muted)">切换目标语言</span>
              <select class="input" onchange="switchMsgLang(this.value)">
                <option value="VN">🇻🇳 越南语</option>
                <option value="EN">🇬🇧 英语</option>
              </select>
            </div>
          </div>

          <div class="grid-2" style="margin-bottom:10px;gap:10px">
            <div>
              <div style="font-size:10px;color:var(--text-muted);margin-bottom:4px">🇨🇳 中文（可编辑）</div>
              <textarea id="msg-edit" class="input" style="width:100%;height:110px;resize:none;font-size:12px;line-height:1.6">您好，您的订单（${O.omsId}）目前正在越南胡志明口岸进行清关核查。清关服务商正在配合处理，我们预计在接下来 4 小时内获得最新进展并向您同步。如需配合，请确认收货人相关证件信息是否完整，我们会及时与您联系。感谢您的理解与耐心等待。</textarea>
            </div>
            <div>
              <div style="font-size:10px;color:var(--text-muted);margin-bottom:4px" id="lang-label">🇻🇳 Tiếng Việt（AI 翻译·只读）</div>
              <div id="msg-lang" class="input" style="width:100%;height:110px;overflow-y:auto;font-size:12px;line-height:1.6;background:var(--bg-base);color:var(--text-secondary);padding:7px 11px;border-radius:var(--radius);border:1px solid var(--border)">${DATA.aiMessage.draftVN}</div>
            </div>
          </div>

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
      <div class="card" style="overflow-x:auto">
        <div class="section-title"><span class="dot"></span>同步记录 <span style="font-size:10px;color:var(--text-muted);font-weight:400;margin-left:4px">每次同步留痕，全部可追溯</span></div>
        <table class="data-table">
          <thead><tr><th>时间</th><th>触发类型</th><th>同步内容</th><th>渠道</th><th>同步对象</th><th>状态</th><th>操作人</th><th>关联对象</th><th>后续跟进</th></tr></thead>
          <tbody>${syncs}</tbody>
        </table>
      </div>
    </div>`;
}

// ─────────────────────────────────────────────
//  7. 费用对账 Tab
// ─────────────────────────────────────────────
function renderBilling() {
  const items = DATA.billingItems.map(r => {
    const sc = r.status === '已确认' ? 'green' : r.status === '待确认' ? 'amber' : r.status === '不适用' ? 'gray' : r.status === '待执行' ? 'blue' : 'gray';
    return `<tr>
      <td>${r.type}${r.type.includes('异常') ? ' ' + badge('异常', 'red') : r.type.includes('汇率') ? ' ' + badge('汇率', 'amber') : ''}</td>
      <td style="font-family:var(--font-mono);font-size:11px">${r.receivable}</td>
      <td style="font-family:var(--font-mono);font-size:11px">${r.payable}</td>
      <td style="font-size:11px;color:var(--text-muted)">${r.node}</td>
      <td style="font-family:var(--font-mono);font-size:10px;color:${r.relatedWO === '-' ? 'var(--text-muted)' : 'var(--amber)'}">${r.relatedWO}</td>
      <td style="font-size:11px;color:var(--text-muted)">${r.responsible}</td>
      <td>${badge(r.status, sc)}</td>
    </tr>`;
  }).join('');

  const b = DATA.billing;
  const evidenceRows = DATA.billingEvidence.map(e => `<tr>
    <td style="font-size:11px">${e.node}</td>
    <td style="font-family:var(--font-mono);font-size:10px;color:${e.wo === '-' ? 'var(--text-muted)' : 'var(--amber)'}">${e.wo}</td>
    <td style="font-size:11px;color:var(--text-muted)">${e.feedback}</td>
    <td style="font-size:11px;color:var(--accent-light)">${e.doc}</td>
    <td style="font-size:11px;color:var(--text-secondary)">${e.bill}</td>
  </tr>`).join('');

  return `
    <div class="fade-in">
      <!-- 费用摘要 -->
      <div class="grid-3" style="margin-bottom:10px">
        ${statCard('客户应收', b.receivable, 'CNY', 'blue')}
        ${statCard('供应商应付', b.payable, 'VND', 'purple')}
        ${statCard('预计毛利', b.profit, '', 'green')}
      </div>
      <div class="grid-3" style="margin-bottom:14px">
        ${statCard('对账状态', b.status, '', 'amber')}
        ${statCard('异常费用', b.exception, '', 'red')}
        ${statCard('汇率状态', b.exchangeStatus, '', 'amber')}
      </div>

      <!-- 费用明细 -->
      <div class="card" style="margin-bottom:14px;padding:0;overflow-x:auto">
        <div style="padding:16px 16px 0">
          <div class="section-title"><span class="dot"></span>费用明细 <span style="font-size:10px;color:var(--text-muted);font-weight:400;margin-left:4px">三向关联：节点 + 工单 + 责任方</span></div>
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:10px">每笔费用追溯至具体履约节点和异常工单，对账争议时有据可查。</div>
        </div>
        <table class="data-table">
          <thead><tr><th>费用类型</th><th>客户应收</th><th>供应商应付</th><th>关联节点</th><th>关联异常工单</th><th>责任方/承担方</th><th>状态</th></tr></thead>
          <tbody>${items}</tbody>
        </table>
      </div>

      <!-- 多币种 & 汇兑差异 -->
      <div class="card" style="margin-bottom:14px">
        <div class="section-title"><span class="dot" style="background:var(--teal)"></span>多币种 & 汇率</div>
        <div style="display:flex;gap:20px;flex-wrap:wrap">
          <div class="field-row" style="flex:1"><span class="field-label">原始币种</span><span class="field-value">USD · VND</span></div>
          <div class="field-row" style="flex:1"><span class="field-label">折算币种</span><span class="field-value">CNY</span></div>
          <div class="field-row" style="flex:1"><span class="field-label">汇率来源</span><span class="field-value" style="color:var(--amber)">待锁定</span></div>
          <div class="field-row" style="flex:1"><span class="field-label">锁定时间</span><span class="field-value" style="color:var(--amber)">待确认</span></div>
          <div class="field-row" style="flex:1"><span class="field-label">汇兑差异</span><span class="field-value" style="color:var(--amber)">${b.exchangeDiff}</span></div>
        </div>
      </div>

      <!-- 费用依据区 -->
      <div class="card" style="margin-bottom:14px;padding:0;overflow-x:auto">
        <div style="padding:16px 16px 0">
          <div class="section-title"><span class="dot" style="background:var(--purple)"></span>费用依据 <span style="font-size:10px;color:var(--text-muted);font-weight:400;margin-left:4px">追溯链：节点 → 工单 → 回传 → 凭证 → 账单</span></div>
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:10px">每笔费用关联到具体履约节点、异常工单、服务商回传和原始凭证，财务对账争议时可逐级下钻。</div>
        </div>
        <table class="data-table">
          <thead><tr><th>履约节点</th><th>异常工单</th><th>服务商回传 / 来源</th><th>凭证</th><th>账单</th></tr></thead>
          <tbody>${evidenceRows}</tbody>
        </table>
      </div>

      <!-- 人工确认区 -->
      <div class="card" style="margin-bottom:14px">
        <div class="section-title"><span class="dot"></span>人工确认 <span style="font-size:10px;color:var(--text-muted);font-weight:400;margin-left:4px">所有高风险操作由人工确认，AI 不做自动判责和自动入账</span></div>
        <div class="grid-2" style="gap:12px">
          <div>
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px">确认费用状态</div>
            <select class="input" style="width:100%;margin-bottom:10px"><option>待确认</option><option>已确认</option><option>对账差异中</option><option>已关闭</option></select>
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px">确认责任方/承担方</div>
            <select class="input" style="width:100%;margin-bottom:10px"><option>清关服务商承担</option><option>委托客户承担</option><option>平台内部承担</option><option>待议</option></select>
          </div>
          <div>
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px">确认汇率来源</div>
            <select class="input" style="width:100%;margin-bottom:10px"><option>合同约定汇率</option><option>财务系统汇率</option><option>当日结算汇率</option><option>待确认</option></select>
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px">补充凭证</div>
            <button class="btn btn-secondary btn-sm" style="width:100%" onclick="showToast('凭证上传功能演示中')">+ 上传凭证</button>
          </div>
        </div>
        <div style="display:flex;gap:8px;margin-top:14px;justify-content:flex-end">
          <button class="btn btn-primary btn-sm" onclick="showToast('费用确认已保存，已回写对账状态')">保存确认</button>
          <button class="btn btn-secondary btn-sm" onclick="showModal('fillResponsible')">填写确认说明</button>
        </div>
      </div>

      <!-- MVP 阶段说明（降级 AI） -->
      <div style="font-size:10px;color:var(--text-muted);text-align:center;margin-bottom:10px">
        💡 MVP1 阶段费用全部人工确认，AI 不自动判责、不修改金额、不自动入账。MVP3 将引入 OCR 识别和异常检测。
      </div>
    </div>
  `;
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
  const typeColorMap = { '合同协议':'purple','清关类':'blue','运输类':'green','异常类':'amber','费用类':'teal','图片类':'gray' };
  const nodeList = ['全部','订单级','国内揽收','出口清关','跨境干线','目的国清关','末端配送'];
  const typeFilters = ['全部','清关类','运输类','异常类','费用类','图片类','合同协议'];
  const sourceFilters = ['全部来源','系统自动','承运商 API','客户上传','报关行','清关服务商','运营补充'];

  const cards = DATA.attachments.map(a => {
    const tc = typeColorMap[a.type] || 'gray';
    const icon = a.name.endsWith('.pdf') ? '📄' : a.name.endsWith('.png') || a.name.endsWith('.jpg') ? '🖼️' : '📎';
    return `
      <div class="card attach-card" data-node="${a.node}" data-type="${a.type}" style="padding:14px;cursor:pointer;transition:all var(--transition);display:flex;flex-direction:column;gap:8px" onclick="showToast('文件预览演示中: ${a.name}')" onmouseover="this.style.borderColor='var(--accent-light)'" onmouseout="this.style.borderColor='var(--border)'">
        <div style="display:flex;align-items:flex-start;gap:8px">
          <span style="font-size:22px;flex-shrink:0">${icon}</span>
          <div style="flex:1;min-width:0">
            <div style="font-size:11px;font-weight:500;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${a.name}">${a.name}</div>
            <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px">
              ${badge(a.type, tc)}
              ${badge(a.node, 'gray')}
            </div>
          </div>
        </div>
        <div style="font-size:10px;color:var(--text-muted);line-height:1.5">
          来源：${a.uploader} · ${a.time}<br>
          ${a.relatedWO !== '-' ? `<span style="color:var(--amber)">关联工单：${a.relatedWO}</span>` : ''}
          ${a.relatedFee !== '-' ? `<span style="color:var(--teal)"> | 关联费用：${a.relatedFee}</span>` : ''}
        </div>
      </div>`;
  }).join('');

  return `
    <div class="fade-in">
      <!-- 筛选区 -->
      <div class="card" style="margin-bottom:14px;padding:12px 16px">
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <span style="font-size:11px;color:var(--text-muted);flex-shrink:0;margin-right:4px">附件类型</span>
          ${typeFilters.map((t,i) => `<button class="btn ${i===0?'btn-primary':'btn-secondary'} btn-sm" onclick="filterAttach(this,'type','${t}')">${t}</button>`).join('')}
          <span style="width:1px;height:20px;background:var(--border);margin:0 4px;flex-shrink:0"></span>
          <span style="font-size:11px;color:var(--text-muted);flex-shrink:0;margin-right:4px">来源</span>
          ${sourceFilters.map((s,i) => `<button class="btn btn-secondary btn-sm" onclick="filterAttach(this,'source','${s}')">${s}</button>`).join('')}
          <button class="btn btn-primary btn-sm" style="margin-left:auto" onclick="showToast('附件上传演示中')">+ 上传附件</button>
        </div>
      </div>

      <!-- 左侧节点导航 + 右侧卡片网格 -->
      <div style="display:flex;gap:12px;align-items:flex-start">
        <div class="card" style="width:120px;flex-shrink:0;padding:8px 0;position:sticky;top:0">
          <div style="font-size:10px;color:var(--text-muted);padding:4px 12px;letter-spacing:0.5px">履约节点</div>
          ${nodeList.map((n,i) => `
            <div class="attach-node-nav" data-node="${n === '全部' ? 'all' : n}" onclick="filterAttachByNode(this,'${n === '全部' ? 'all' : n}')" style="padding:6px 12px;font-size:11px;cursor:pointer;transition:all var(--transition);color:var(--text-secondary);${i===0?'font-weight:600;color:var(--accent-light);background:rgba(99,102,241,0.05);border-right:2px solid var(--accent)':''}">
              ${n === '全部' ? '📂 ' : n === '订单级' ? '📋 ' : '• '}${n}
            </div>`).join('')}
        </div>

        <div class="card" style="flex:1;padding:14px">
          <div class="section-title"><span class="dot"></span>附件卡片 <span style="font-size:10px;color:var(--text-muted);font-weight:400;margin-left:4px">共 ${DATA.attachments.length} 个 · 点击查看详情</span></div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px" id="attach-grid">
            ${cards}
          </div>
        </div>
      </div>

      <div style="font-size:10px;color:var(--text-muted);text-align:center;margin-top:14px">
        💡 MVP1 按履约节点展示附件，支持类型/来源筛选。MVP2 增加客户门户共享和版本管理，MVP3 引入 AI OCR 分类和字段抽取。
      </div>
    </div>
  `;
}

function filterAttach(btn, dimension, value) {
  if (dimension === 'type') {
    document.querySelectorAll('[onclick^="filterAttach(this,\'type\'"]').forEach(b => b.classList.replace('btn-primary','btn-secondary'));
    btn.classList.replace('btn-secondary','btn-primary');
  } else {
    document.querySelectorAll('[onclick^="filterAttach(this,\'source\'"]').forEach(b => b.classList.replace('btn-primary','btn-secondary'));
    btn.classList.replace('btn-secondary','btn-primary');
  }
  showToast(`已按${value}筛选（演示）`, 'blue');
}

function filterAttachByNode(el, node) {
  document.querySelectorAll('.attach-node-nav').forEach(n => {
    n.style.fontWeight = ''; n.style.color = 'var(--text-secondary)';
    n.style.background = ''; n.style.borderRight = '';
  });
  el.style.fontWeight = '600'; el.style.color = 'var(--accent-light)';
  el.style.background = 'rgba(99,102,241,0.05)'; el.style.borderRight = '2px solid var(--accent)';
  // 过滤卡片
  document.querySelectorAll('.attach-card').forEach(card => {
    if (node === 'all' || card.dataset.node === node) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
}

// ─────────────────────────────────────────────
//  9. AI 效果看板
// ─────────────────────────────────────────────
PAGES['system-flow'] = () => `
  <div class="fade-in">
    <div style="font-size:15px;font-weight:600;margin-bottom:10px">流程示意图 <span style="font-size:11px;color:var(--text-muted);font-weight:400">前端 · 后端 · AI Agent 协作关系</span></div>
    ${systemFlowSVG()}
    <div class="card" style="margin-top:14px;background:var(--bg-base);border:1px dashed var(--border-bright)">
      <div class="grid-3" style="font-size:10px;gap:12px">
        <div><span style="color:var(--accent-light);font-weight:600">🖥 前端</span> <span style="color:var(--text-muted)">展示 + 人工确认。不直连 AI，不调知识库。</span></div>
        <div><span style="color:var(--amber);font-weight:600">⚙ 后端</span> <span style="color:var(--text-muted)">规则判断 + 数据流转 + 编排 Agent。所有 AI 调用经此中转。</span></div>
        <div><span style="color:var(--purple);font-weight:600">🧠 AI Agent</span> <span style="color:var(--text-muted)">RAG 检索知识库 + LLM 生成四模块。不自动确认，不自动改规则。</span></div>
      </div>
    </div>
  </div>
`;

PAGES['ai-dashboard'] = () => {
  const d = DATA.aiDashboard;
  const genBars = d.generation.map(g => `
    <div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
        <span style="font-size:11px;font-weight:500">${g.module}</span>
        <div style="display:flex;gap:8px;font-size:10px">
          <span style="color:var(--green)">采纳 ${g.adopt}%</span><span style="color:var(--red)">驳回 ${g.reject}%</span><span style="color:var(--amber)">修改 ${g.modify}%</span>
        </div>
      </div>
      <div style="display:flex;height:7px;border-radius:4px;overflow:hidden;gap:1px">
        <div style="width:${g.adopt}%;background:var(--green)"></div>
        <div style="width:${g.modify}%;background:var(--amber)"></div>
        <div style="width:${g.reject}%;background:var(--red)"></div>
      </div>
    </div>`).join('');

  const alerts = d.alerts.map(a => `
    <div style="display:flex;gap:8px;align-items:center;padding:4px 0;font-size:10px">
      <span>${a.level === 'red' ? '🔴' : '🟡'}</span>
      <span style="flex:1;color:var(--text-secondary)">[${a.time}] ${a.text}</span>
      <button class="btn btn-ghost btn-sm" onclick="showToast('已标记处理')">处理</button>
    </div>`).join('');

  const pv = d.promptVersions;
  const adoptBetter = pv.adoptNew > pv.adoptOld;
  const rejectBetter = pv.rejectNew < pv.rejectOld;

  return `
    <div class="fade-in">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <div style="font-size:15px;font-weight:600">AI 效果看板</div>
        <div style="display:flex;gap:8px;align-items:center">
          <select class="input"><option>近7日</option><option>今日</option><option>近30日</option></select>
          <select class="input"><option>深圳→胡志明</option><option>全部线路</option></select>
        </div>
      </div>

      <div style="font-size:10px;color:var(--amber);background:rgba(245,158,11,0.08);border:1px dashed rgba(245,158,11,0.3);border-radius:6px;padding:6px 10px;margin-bottom:10px;text-align:center">
        ⚠ Demo 态：以下数据为演示用估算值，指标框架真实可用，数据采集需上线后启动。
      </div>

      <div class="grid-2" style="margin-bottom:12px;gap:12px">
        <div class="card">
          <div class="section-title"><span class="dot" style="background:var(--green)"></span>系统健康 <span style="font-size:10px;color:var(--text-muted);font-weight:400">当日实时</span></div>
          <div class="grid-2" style="gap:8px">
            ${statCard('Agent 执行成功率', d.health.successRate + '%', '目标≥95%', 'green')}
            ${statCard('平均响应时长', d.health.avgTime + 's', '目标<20s', 'blue')}
            ${statCard('今日降级次数', d.health.degradeCount + '次', '阈值>3', 'green')}
            <div class="stat-card" style="display:flex;flex-direction:column;gap:4px">
              <div style="display:flex;gap:6px;align-items:center;font-size:9px;padding:2px 5px;background:${d.health.alertLevel.includes('🔴')?'rgba(239,68,68,0.08)':d.health.alertLevel.includes('🟠')?'rgba(249,115,22,0.08)':'rgba(245,158,11,0.08)'};border-radius:4px;color:${d.health.alertLevel.includes('🔴')?'var(--red)':d.health.alertLevel.includes('🟠')?'#f97316':'var(--amber)'}">
                ${d.health.alertLevel} ${d.health.alertMsg}
              </div>
              <div class="stat-label" style="margin-top:2px">各步骤失败分布</div>
              <div style="display:flex;gap:2px;margin-top:4px">
                ${d.health.stepFails.map((n,i) => {
                  const pct = n > 0 ? Math.round(n * 16) : 3;
                  return `<div style="flex:1;text-align:center"><div style="font-size:8px;color:var(--text-muted)">S${i+1}</div><div class="progress-bar" style="height:2px;margin-bottom:1px"><div class="progress-fill ${n>=3?'red':'green'}" style="width:${pct}%"></div></div><div style="font-size:8px;font-family:var(--font-mono);color:${n>=3?'var(--red)':'var(--text-muted)'}">${n}</div></div>`;
                }).join('')}
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="section-title"><span class="dot" style="background:var(--accent)"></span>输出质量 <span style="font-size:10px;color:var(--text-muted);font-weight:400">日维度 · 核心关注</span></div>
          ${genBars}
          <div style="display:flex;gap:16px;margin-top:8px;font-size:10px">
            <span style="color:var(--text-muted)">低置信占比 <span style="font-family:var(--font-mono);color:${d.lowConfidence>30?'var(--red)':'var(--green)'}">${d.lowConfidence}%</span> ${d.lowConfidence>30?'⚠':'✓'}</span>
            <span style="color:var(--text-muted)">标记无效 <span style="font-family:var(--font-mono);color:var(--text-secondary)">${d.markInvalid}%</span></span>
          </div>
          <div style="font-size:10px;color:var(--text-muted);margin-top:6px">驳回原因 top5：${d.rejectTop5.join(' · ')}</div>
        </div>
      </div>

      <div class="grid-2" style="margin-bottom:12px;gap:12px">
        <div class="card">
          <div class="section-title"><span class="dot" style="background:var(--teal)"></span>知识质量 <span style="font-size:10px;color:var(--text-muted);font-weight:400">日维度</span></div>
          <div style="margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px"><span style="font-size:11px">RAG 命中率</span><span style="font-size:14px;font-weight:600;color:var(--teal)">${d.retrieval.ragHit}%</span></div>
            <div class="progress-bar"><div class="progress-fill blue" style="width:${d.retrieval.ragHit}%"></div></div>
          </div>
          ${[['归因',d.retrieval.attrHit],['SOP',d.retrieval.sopHit],['话术',d.retrieval.msgHit],['费用',d.retrieval.costHit]].map(([m,v]) => `
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px">
              <span style="font-size:10px;color:var(--text-muted);width:28px">${m}</span>
              <div class="progress-bar" style="flex:1"><div class="progress-fill ${v>=70?'green':'amber'}" style="width:${v}%"></div></div>
              <span style="font-size:10px;font-family:var(--font-mono)">${v}%</span>
            </div>`).join('')}
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;font-size:10px;color:var(--text-muted)">
            <span>检索平均耗时</span><span style="font-family:var(--font-mono);color:var(--text-secondary)">${d.retrieval.avgLatency}s <span style="color:var(--green)">（< 5s ✓）</span></span>
          </div>
          <div style="font-size:10px;color:var(--text-muted);margin-top:6px">未命中场景 top5（按异常类型/线路）</div>
          <div style="display:flex;flex-direction:column;gap:2px;margin-top:4px">
            ${d.missTop5.map((m,i) => `
              <div style="display:flex;align-items:center;gap:6px;font-size:9px">
                <span style="color:var(--text-muted);width:14px">${i+1}.</span>
                <span style="flex:1;color:var(--text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${m.scene}</span>
                <span style="color:var(--text-muted)">${m.route}</span>
                <span style="font-family:var(--font-mono);color:var(--amber);width:20px;text-align:right">${m.count}</span>
              </div>`).join('')}
          </div>
        </div>

        <div class="card">
          <div class="section-title"><span class="dot" style="background:var(--amber)"></span>业务影响 <span style="font-size:10px;color:var(--text-muted);font-weight:400">周维度 · vs 基线</span></div>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:8px">
            ${d.business.slice(0,3).map(b => `
              <div class="stat-card" style="display:flex;flex-direction:column;justify-content:space-between">
                <div>
                  <div class="stat-label" style="font-size:11px;color:var(--text-primary);font-weight:500">${b.label}</div>
                  <div style="font-size:9px;color:var(--text-muted);margin-top:2px">${b.desc}</div>
                </div>
                <div style="margin-top:8px">
                  <div class="stat-value" style="font-size:20px;color:${b.good?'var(--green)':'var(--red)'};margin-top:0">${b.value}</div>
                  <div class="stat-sub" style="margin-top:2px">${b.base}</div>
                </div>
              </div>`).join('')}
          </div>
          <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:8px">
            ${d.business.slice(3,5).map(b => `
              <div class="stat-card" style="display:flex;flex-direction:column;justify-content:space-between">
                <div>
                  <div class="stat-label" style="font-size:11px;color:var(--text-primary);font-weight:500">${b.label}</div>
                  <div style="font-size:9px;color:var(--text-muted);margin-top:2px">${b.desc}</div>
                </div>
                <div style="margin-top:8px">
                  <div class="stat-value" style="font-size:20px;color:${b.good?'var(--green)':'var(--red)'};margin-top:0">${b.value}</div>
                  <div class="stat-sub" style="margin-top:2px">${b.base}</div>
                </div>
              </div>`).join('')}
          </div>
        </div>
      </div>

      <div class="grid-2" style="gap:12px">
        <div class="card">
          <div class="section-title"><span class="dot" style="background:var(--red)"></span>告警记录</div>
          ${alerts || '<div style="font-size:10px;color:var(--text-muted)">暂无告警</div>'}
        </div>

        <div class="card">
          <div class="section-title"><span class="dot"></span>Prompt 版本对比</div>
          <div style="display:flex;gap:6px;align-items:center;margin-bottom:10px">
            <select class="input"><option>归因模块</option><option>SOP</option><option>话术</option></select>
            <span style="font-size:10px;color:var(--text-muted)">${pv.current} vs</span>
            <select class="input"><option>${pv.compare}</option></select>
          </div>
          <div style="margin-bottom:8px">
            <div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:3px">
              <span>采纳率</span><span style="color:${adoptBetter?'var(--green)':'var(--red)'}">${pv.current}: ${pv.adoptNew}% ${adoptBetter?'↑':'↓'} vs ${pv.compare}: ${pv.adoptOld}%</span>
            </div>
            <div style="display:flex;gap:4px;height:5px;border-radius:3px;overflow:hidden"><div style="width:${pv.adoptNew}%;background:var(--accent)"></div><div style="width:${pv.adoptOld}%;background:var(--border-bright)"></div></div>
          </div>
          <div style="margin-bottom:10px">
            <div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:3px">
              <span>驳回率</span><span style="color:${rejectBetter?'var(--green)':'var(--red)'}">${pv.current}: ${pv.rejectNew}% ${rejectBetter?'↓':'↑'} vs ${pv.compare}: ${pv.rejectOld}%</span>
            </div>
            <div style="display:flex;gap:4px;height:5px;border-radius:3px;overflow:hidden"><div style="width:${pv.rejectNew}%;background:var(--red)"></div><div style="width:${pv.rejectOld}%;background:var(--border-bright)"></div></div>
          </div>
          <button class="btn btn-secondary btn-sm" onclick="showToast('已回滚至 ${pv.compare}')">回滚至 ${pv.compare}</button>
        </div>
      </div>
    </div>
  `;
};

// ─────────────────────────────────────────────
//  10. 知识库管理
// ─────────────────────────────────────────────
PAGES['knowledge'] = () => {
  const typeColors = { '清关 SOP':'teal','历史案例':'purple','客户话术模板':'green','费用处理知识':'amber' };
  const statusColor = (s) => s === '生效' ? 'green' : s === '待审核' ? 'blue' : 'amber';
  const allItems = DATA.knowledge;

  const renderTable = (items) => items.length ? items.map((k, i) => `
    <tr class="kb-item-row" onclick="selectKbItem(this,${DATA.knowledge.indexOf(k)})" style="cursor:pointer;${i===0?'background:rgba(99,102,241,0.03)':''}">
      <td style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted)">${k.id}</td>
      <td style="font-size:11px;font-weight:500;color:var(--accent-light)">${k.name}</td>
      <td>${badge(k.type, typeColors[k.type]||'gray')}</td>
      <td style="font-size:10px">${k.country} · ${k.route}</td>
      <td>${badge(k.version, 'gray')}</td>
      <td>${badge(k.status, statusColor(k.status))}</td>
      <td style="font-size:10px;color:var(--text-muted)">${k.owner}</td>
      <td><span style="color:var(--accent-light);font-size:11px;cursor:pointer;font-weight:500">查看</span></td>
    </tr>`).join('') : '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:20px">暂无知识条目</td></tr>';

  return `
    <div class="fade-in">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <div style="font-size:15px;font-weight:600">AI 知识库 <span style="font-size:11px;color:var(--text-muted);font-weight:400;margin-left:4px">知识维护与审核</span></div>
        <button class="btn btn-primary btn-sm" onclick="showToast('新增知识条目')">+ 新增知识</button>
      </div>

      <div class="grid-4" style="margin-bottom:10px">
        ${statCard('知识总量', allItems.length + ' 条', '', 'blue')}
        ${statCard('生效中', allItems.filter(k=>k.status==='生效').length + ' 条', '', 'green')}
        ${statCard('待审核', allItems.filter(k=>k.status==='待审核').length + ' 条', '', 'amber')}
        ${statCard('今日引用', '34 次', '', 'teal')}
      </div>

      <div class="card" style="padding:12px 16px;margin-bottom:14px">
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <div class="search-box" style="flex:1;min-width:150px"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="var(--text-muted)" stroke-width="1.5"><circle cx="7" cy="7" r="5"/><line x1="11" y1="11" x2="14" y2="14"/></svg><input placeholder="搜索知识名称..." oninput="filterKbTable()"></div>
          <select class="input" onchange="filterKbTable()" id="kb-type-filter">
            <option value="">全部类型</option>
            ${Object.keys(typeColors).map(t => `<option value="${t}">${t}</option>`).join('')}
          </select>
          <select class="input" onchange="filterKbTable()" id="kb-status-filter">
            <option value="">全部状态</option>
            <option value="生效">生效</option>
            <option value="待审核">待审核</option>
            <option value="草稿">草稿</option>
          </select>
        </div>
      </div>

      <div class="card" style="padding:0;overflow-x:auto">
        <table class="data-table">
          <thead><tr><th>ID</th><th>名称</th><th>类型</th><th>国家/线路</th><th>版本</th><th>状态</th><th>维护人</th><th>操作</th></tr></thead>
          <tbody id="kb-item-list">${renderTable(allItems)}</tbody>
        </table>
      </div>

      <div class="card" style="margin-top:14px;background:var(--bg-base);border:1px dashed var(--border-bright)">
        <div class="section-title" style="font-weight:400;color:var(--text-muted)">检索策略：四层匹配 <span style="font-size:10px;color:var(--text-muted);margin-left:4px">RAG 按元数据标签匹配</span></div>
        <div style="display:flex;flex-direction:column;gap:4px">
          <div style="display:flex;gap:8px;font-size:10px"><span style="color:var(--text-muted)">L1</span><span style="color:var(--text-muted)"> 国家 + 线路 + 异常类型 → 锁定场景范围</span></div>
          <div style="display:flex;gap:8px;font-size:10px"><span style="color:var(--text-muted)">L2</span><span style="color:var(--text-muted)"> 客户等级 + 服务产品 + 服务商 → 差异化匹配</span></div>
          <div style="display:flex;gap:8px;font-size:10px"><span style="color:var(--text-muted)">L3</span><span style="color:var(--text-muted)"> 历史相似案例 + 最近处理结果 + 客户反馈</span></div>
          <div style="display:flex;gap:8px;font-size:10px"><span style="color:var(--text-muted)">L4</span><span style="color:var(--text-muted)"> 费用规则 + 客户话术模板 → 补充费用影响和沟通策略</span></div>
        </div>
        <div style="font-size:10px;color:var(--text-muted);margin-top:8px">⚠ 四层均未命中时，AI 必须输出「未命中有效知识，建议人工主导判断」，不得编造。</div>
      </div>
    </div>
  `;
};

function filterKbTable() {
  const typeFilter = document.getElementById('kb-type-filter');
  const statusFilter = document.getElementById('kb-status-filter');
  const searchInput = document.querySelector('#kb-item-list').closest('.card').parentElement.querySelector('input');
  const typeVal = typeFilter ? typeFilter.value : '';
  const statusVal = statusFilter ? statusFilter.value : '';
  const searchVal = searchInput ? searchInput.value.toLowerCase() : '';
  const typeColors = { '清关 SOP':'teal','历史案例':'purple','客户话术模板':'green','费用处理知识':'amber' };
  const statusColor = (s) => s === '生效' ? 'green' : s === '待审核' ? 'blue' : 'amber';
  
  let items = DATA.knowledge;
  if (typeVal) items = items.filter(k => k.type === typeVal);
  if (statusVal) items = items.filter(k => k.status === statusVal);
  if (searchVal) items = items.filter(k => k.name.toLowerCase().includes(searchVal) || (k.id||'').toLowerCase().includes(searchVal));

  const tbody = document.getElementById('kb-item-list');
  if (tbody) {
    tbody.innerHTML = items.length ? items.map((k, i) => `
      <tr class="kb-item-row" onclick="selectKbItem(this,${DATA.knowledge.indexOf(k)})" style="cursor:pointer;${i===0?'background:rgba(99,102,241,0.03)':''}">
        <td style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted)">${k.id}</td>
        <td style="font-size:11px;font-weight:500;color:var(--accent-light)">${k.name}</td>
        <td>${badge(k.type, typeColors[k.type]||'gray')}</td>
        <td style="font-size:10px">${k.country} · ${k.route}</td>
        <td>${badge(k.version, 'gray')}</td>
        <td>${badge(k.status, statusColor(k.status))}</td>
        <td style="font-size:10px;color:var(--text-muted)">${k.owner}</td>
        <td><span style="color:var(--accent-light);font-size:11px;cursor:pointer;font-weight:500">查看</span></td>
      </tr>`).join('') : '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:20px">暂无匹配条目</td></tr>';
  }
}

function selectKbItem(el, idx) {
  document.querySelectorAll('.kb-item-row').forEach(r => { r.style.background = ''; });
  el.style.background = 'rgba(99,102,241,0.06)';
  const k = DATA.knowledge[idx];
  if (!k) return;
  const tc = { '清关 SOP':'teal','历史案例':'purple','客户话术模板':'green','费用处理知识':'amber' };
  let metaHtml = '';
  if (k.type === '清关 SOP') {
    metaHtml = `<div class="field-row"><span class="field-label">异常类型</span><span class="field-value">${k.meta.anomalyType}</span></div><div class="field-row"><span class="field-label">适用节点</span><span class="field-value">${k.meta.node}</span></div><div class="field-row"><span class="field-label">触发条件</span><span class="field-value" style="font-size:11px">${k.meta.conditions}</span></div><div class="field-row"><span class="field-label">处理步骤</span><span class="field-value"><ol style="margin:0;padding-left:16px;font-size:11px">${k.meta.steps.map(s => '<li>'+s+'</li>').join('')}</ol></span></div>`;
  } else if (k.type === '历史案例') {
    metaHtml = `<div class="field-row"><span class="field-label">订单类型</span><span class="field-value">${k.meta.orderType}</span></div><div class="field-row"><span class="field-label">异常原因</span><span class="field-value">${k.meta.anomaly}</span></div><div class="field-row"><span class="field-label">处理动作</span><span class="field-value" style="font-size:11px">${k.meta.actions}</span></div><div class="field-row"><span class="field-label">最终结果</span><span class="field-value">${k.meta.result}</span></div><div class="field-row"><span class="field-label">相似度匹配</span><span class="field-value" style="color:var(--accent-light);font-weight:600">${k.meta.similarity}%</span></div>`;
  } else if (k.type === '客户话术模板') {
    metaHtml = `<div class="field-row"><span class="field-label">客户等级</span><span class="field-value">${k.meta.clientLevel}</span></div><div class="field-row"><span class="field-label">异常等级</span><span class="field-value">${k.meta.anomalyLevel}</span></div><div class="field-row"><span class="field-label">推荐渠道</span><span class="field-value">${k.meta.channel}</span></div><div class="field-row"><span class="field-label">禁用措辞</span><span class="field-value" style="color:var(--red);font-size:10px">${k.meta.forbidden}</span></div><div class="field-row"><span class="field-label">模板</span><span class="field-value" style="font-size:11px;background:var(--bg-base);padding:6px 8px;border-radius:4px">${k.meta.template}</span></div>`;
  } else {
    metaHtml = `<div class="field-row"><span class="field-label">费用类型</span><span class="field-value">${k.meta.feeType}</span></div><div class="field-row"><span class="field-label">计算公式</span><span class="field-value">${k.meta.formula}</span></div><div class="field-row"><span class="field-label">凭证要求</span><span class="field-value">${k.meta.evidence}</span></div><div class="field-row"><span class="field-label">责任判定</span><span class="field-value" style="font-size:11px">${k.meta.responsible}</span></div>`;
  }
  const modal = document.getElementById('modal');
  const body = document.getElementById('modal-body');
  body.innerHTML = `<div class="modal-title">${k.name}</div><div style="font-size:10px;color:var(--text-muted);margin-bottom:14px">${k.id} · ${badge(k.type, tc[k.type]||'gray')} · ${badge(k.version, 'gray')} · ${badge(k.status, k.status==='生效'?'green':'amber')}</div><div class="field-row"><span class="field-label">适用国家</span><span class="field-value">${k.country}</span></div><div class="field-row"><span class="field-label">适用线路</span><span class="field-value">${k.route}</span></div><div class="field-row"><span class="field-label">维护人</span><span class="field-value">${k.owner}</span></div><div class="field-row"><span class="field-label">更新时间</span><span class="field-value">${k.updated}</span></div><div class="field-row"><span class="field-label">来源</span><span class="field-value">${k.source}</span></div><div class="divider"></div>${metaHtml}<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px"><button class="btn btn-primary btn-sm" onclick="showToast('编辑知识条目: ${k.id}')">编辑</button><button class="btn btn-ghost btn-sm" onclick="showToast('废弃知识: ${k.id}')">废弃</button><button class="btn btn-ghost btn-sm" onclick="showToast('引用记录: ${k.id}')">引用 ${k.cites}</button><button class="btn btn-secondary btn-sm" onclick="closeModal()">关闭</button></div>`;
  modal.classList.add('open');
}

// ─────────────────────────────────────────────
//  11. 规则配置
// ─────────────────────────────────────────────
PAGES['rules'] = () => {
  const cats = [
    { key: 'sla',           icon: '⏱',  label: '线路 SLA 配置', color: 'var(--accent)' },
    { key: 'statusMapping', icon: '🔄',  label: '状态映射配置', color: 'var(--teal)' },
    { key: 'entryCheck',    icon: '🛡',  label: '接单校验配置', color: 'var(--amber)' },
    { key: 'provider',      icon: '🏢',  label: '服务商能力配置', color: 'var(--purple)' },
    { key: 'notify',        icon: '💬',  label: '通知策略配置', color: 'var(--green)' },
    { key: 'fee',           icon: '💰',  label: '费用规则配置', color: 'var(--red)' },
  ];
  const colKeys = { sla:'slaCols', statusMapping:'smCols', entryCheck:'ecCols', provider:'pvCols', notify:'ntCols', fee:'feCols' };

  const navItems = cats.map((c,i) => `<div class="rule-cat-nav" data-cat="${c.key}" onclick="showRuleCat(this,'${c.key}')" style="padding:7px 12px;font-size:11px;cursor:pointer;transition:all var(--transition);color:var(--text-secondary);border-radius:6px;margin-bottom:2px;${i===0?'font-weight:600;color:var(--accent-light);background:rgba(99,102,241,0.05)':''}">${c.icon} ${c.label}</div>`).join('');

  const panels = cats.map((c,i) => {
    const cols = DATA.rules[colKeys[c.key]] || [];
    const rows = DATA.rules[c.key] || [];
    const headers = cols.map(h => `<th style="font-size:10px;white-space:nowrap">${h}</th>`).join('');
    const body = rows.map((r,ri) => `<tr>${r.fields.map(f => `<td style="font-size:10px;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${f}">${f}</td>`).join('')}<td><span style="color:var(--accent-light);font-size:11px;cursor:pointer;font-weight:500" onclick="editRule('${c.key}',${ri})">查看</span></td></tr>`).join('');
    const desc = {
      sla: '按线路+服务产品定义履约段、节点时效和超时触发规则。新增线路只需加一行。',
      statusMapping: '两层映射：服务商回传→TMS内部状态→客户可见状态。含自动同步和回传超时阈值。',
      entryCheck: '定义订单接入时的字段必填、阈值判断和拦截动作。按目的国差异化配置。',
      provider: '定义每个服务商的服务范围、能力和约束，供调度过滤使用。',
      notify: '定义不同客户等级和异常场景下的同步策略和风险词库。',
      fee: '定义报价匹配逻辑、计费方式和异常费用类型。',
    };
    return `<div class="rule-panel" data-cat="${c.key}" style="${i===0?'':'display:none'}"><div class="card" style="padding:0;overflow-x:auto"><div style="padding:14px 16px 0"><div class="section-title"><span class="dot" style="background:${c.color}"></span>${c.label}</div><div style="font-size:11px;color:var(--text-muted);margin-bottom:10px">${desc[c.key]||''} MVP1 手动维护，按"新增一行数据"设计字段结构。</div></div><table class="data-table"><thead><tr>${headers}<th style="width:60px">操作</th></tr></thead><tbody>${body}</tbody></table></div></div>`;
  }).join('');

  return `
    <div class="fade-in">
      <div style="font-size:15px;font-weight:600;margin-bottom:14px">规则配置 <span style="font-size:12px;color:var(--text-muted);font-weight:400;margin-left:8px">深圳 → 胡志明 · 标准专线 · 启用</span></div>
      <div style="display:flex;gap:12px;align-items:flex-start">
        <div class="card" style="width:180px;flex-shrink:0;padding:10px 8px;position:sticky;top:0">${navItems}</div>
        <div style="flex:1;min-width:0">${panels}</div>
      </div>
      <div class="card" style="margin-top:14px;background:var(--bg-base);border:1px dashed var(--border-bright)">
            <div class="grid-2">
              <div>
                <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px">分期路线</div>
                <div style="display:flex;flex-direction:column;gap:6px">
                  <div style="display:flex;gap:8px;align-items:baseline"><span style="font-size:11px;font-weight:500;color:var(--accent-light)">MVP1</span><span style="font-size:11px;color:var(--text-secondary)">深圳→胡志明单线路最小规则集，手动维护</span></div>
                  <div style="display:flex;gap:8px;align-items:baseline"><span style="font-size:11px;font-weight:500;color:var(--teal)">MVP2</span><span style="font-size:11px;color:var(--text-secondary)">规则模板化，新增线路只改参数；增加版本和回滚</span></div>
                  <div style="display:flex;gap:8px;align-items:baseline"><span style="font-size:11px;font-weight:500;color:var(--purple)">MVP3</span><span style="font-size:11px;color:var(--text-secondary)">规则效果分析 + AI 辅助发现冲突和过期规则</span></div>
                </div>
              </div>
              <div>
                <div style="font-size:11px;color:var(--text-muted);margin-bottom:8px">AI 与规则的配合</div>
                <div style="font-size:10px;color:var(--text-muted);line-height:1.6">规则做<strong style="color:var(--text-primary)">确定性判断</strong>（超时触发、字段门禁），AI 做<strong style="color:var(--accent-light)">不确定性判断</strong>（归因、话术）。AI 永远不自动修改生效规则，规则变更须人工审核+版本记录+回滚。</div>
              </div>
            </div>
          </div>
    </div>
  `;
};

function editRule(cat, idx) {
  const ckMap = { sla:'slaCols', statusMapping:'smCols', entryCheck:'ecCols', provider:'pvCols', notify:'ntCols', fee:'feCols' };
  const cols = DATA.rules[ckMap[cat]] || [];
  const fields = DATA.rules[cat][idx].fields;
  const rows = cols.map((h, i) => `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span style="font-size:10px;color:var(--text-muted);width:100px;flex-shrink:0;text-align:right">${h}</span><input class="input" style="flex:1;font-size:11px" value="${fields[i]||''}"></div>`).join('');
  const modal = document.getElementById('modal');
  const body = document.getElementById('modal-body');
  body.innerHTML = `<div class="modal-title">编辑配置 · ${cat}</div><div style="max-height:50vh;overflow-y:auto;margin-bottom:14px">${rows}</div><div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn btn-ghost btn-sm" onclick="closeModal()">取消</button><button class="btn btn-primary btn-sm" onclick="closeModal();showToast('配置已保存，版本已记录')">保存</button></div>`;
  modal.classList.add('open');
}

function showRuleCat(el, cat) {
  document.querySelectorAll('.rule-cat-nav').forEach(n => {
    n.style.fontWeight = ''; n.style.color = 'var(--text-secondary)'; n.style.background = '';
  });
  el.style.fontWeight = '600'; el.style.color = 'var(--accent-light)'; el.style.background = 'rgba(99,102,241,0.05)';
  document.querySelectorAll('.rule-panel').forEach(p => { p.style.display = 'none'; });
  const panel = document.querySelector('.rule-panel[data-cat="' + cat + '"]');
  if (panel) panel.style.display = '';
}

// ─────────────────────────────────────────────
//  导航辅助：从侧边栏入口跳到Tab内页
// ─────────────────────────────────────────────
PAGES['dispatch'] = () => orderDetailShell('dispatch');
PAGES['exception'] = () => orderDetailShell('exception');
PAGES['customer-sync'] = () => orderDetailShell('customer');
PAGES['billing'] = () => orderDetailShell('billing');
PAGES['attach'] = () => orderDetailShell('attach');
PAGES['order-entry'] = PAGES['order-entry'];

function systemFlowSVG() {
  return `
    <div class="card" style="padding:0;overflow-x:auto">
      <svg viewBox="0 0 820 480" width="100%" style="min-width:780px">
        <rect width="820" height="480" fill="#fafbfc" rx="8"/>
        <!-- 三列头 -->
        <rect x="10" y="8" width="230" height="28" rx="5" fill="rgba(99,102,241,0.08)"/>
        <text x="125" y="26" fill="#6366f1" font-size="12" font-weight="700" text-anchor="middle">🖥 前端</text>
        <rect x="252" y="8" width="316" height="28" rx="5" fill="rgba(245,158,11,0.08)"/>
        <text x="410" y="26" fill="#d97706" font-size="12" font-weight="700" text-anchor="middle">⚙ 后端 / 规则引擎</text>
        <rect x="580" y="8" width="230" height="28" rx="5" fill="rgba(124,58,237,0.08)"/>
        <text x="695" y="26" fill="#7c3aed" font-size="12" font-weight="700" text-anchor="middle">🧠 AI Agent</text>
        <!-- 列分隔线 -->
        <line x1="248" y1="42" x2="248" y2="440" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="4 3"/>
        <line x1="574" y1="42" x2="574" y2="440" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="4 3"/>

        <!-- Step 1 后端 -->
        <rect x="262" y="46" width="296" height="24" rx="4" fill="rgba(245,158,11,0.08)"/>
        <text x="272" y="62" fill="#4b5563" font-size="9"><tspan fill="#d97706" font-weight="700">①</tspan> 检测目的国清关超时 → 规则判断 → 生成 P1 异常工单</text>

        <!-- Step 2 后端 -->
        <rect x="262" y="74" width="296" height="24" rx="4" fill="rgba(245,158,11,0.08)"/>
        <text x="272" y="90" fill="#4b5563" font-size="9"><tspan fill="#d97706" font-weight="700">②</tspan> 聚合订单·节点·轨迹·回传 → 打包上下文</text>
        <!-- Arrow 2→3 -->
        <line x1="262" y1="86" x2="125" y2="86" stroke="#d97706" stroke-width="1.5"/>
        <line x1="125" y1="86" x2="125" y2="108" stroke="#d97706" stroke-width="1.5"/>
        <polygon points="125,114 121,106 129,106" fill="#d97706"/>

        <!-- Step 3 前端 -->
        <rect x="20" y="114" width="210" height="24" rx="4" fill="rgba(99,102,241,0.06)"/>
        <text x="30" y="130" fill="#4b5563" font-size="9"><tspan fill="#6366f1" font-weight="700">③</tspan> 渲染工单 Tab + 上下文证据</text>

        <!-- Step 4 前端→后端 -->
        <rect x="20" y="142" width="210" height="24" rx="4" fill="rgba(99,102,241,0.06)"/>
        <text x="30" y="158" fill="#4b5563" font-size="9"><tspan fill="#6366f1" font-weight="700">④</tspan> 触发 AI 生成请求</text>
        <line x1="230" y1="154" x2="258" y2="154" stroke="#6366f1" stroke-width="1.5"/>
        <polygon points="266,154 258,150 258,158" fill="#6366f1"/>

        <!-- Step 5 后端 -->
        <rect x="262" y="142" width="296" height="24" rx="4" fill="rgba(245,158,11,0.08)"/>
        <text x="272" y="158" fill="#4b5563" font-size="9"><tspan fill="#d97706" font-weight="700">⑤</tspan> Step 1 感知：聚合完整上下文 → 构建 Prompt</text>

        <!-- Step 6 后端→AI -->
        <rect x="262" y="170" width="296" height="24" rx="4" fill="rgba(245,158,11,0.08)"/>
        <text x="272" y="186" fill="#4b5563" font-size="9"><tspan fill="#d97706" font-weight="700">⑥</tspan> Step 2 检索：查 RAG（越南·胡志明·清关超时）</text>
        <line x1="558" y1="182" x2="578" y2="182" stroke="#d97706" stroke-width="1.5"/>
        <polygon points="586,182 578,178 578,186" fill="#d97706"/>

        <!-- Step 7 AI Agent -->
        <rect x="590" y="170" width="210" height="36" rx="4" fill="rgba(124,58,237,0.06)"/>
        <text x="600" y="186" fill="#4b5563" font-size="9"><tspan fill="#7c3aed" font-weight="700">⑦</tspan> Step 3-4 推理+生成</text>
        <text x="600" y="200" fill="#6b7280" font-size="8">四模块：归因·SOP·话术·费用</text>

        <!-- Step 8 AI→后端 -->
        <rect x="590" y="212" width="210" height="24" rx="4" fill="rgba(124,58,237,0.06)"/>
        <text x="600" y="228" fill="#4b5563" font-size="9"><tspan fill="#7c3aed" font-weight="700">⑧</tspan> 返回四模块结果</text>
        <line x1="574" y1="224" x2="558" y2="224" stroke="#7c3aed" stroke-width="1.5"/>
        <polygon points="550,224 558,220 558,228" fill="#6366f1"/>

        <!-- Step 9 后端接收 -->
        <rect x="262" y="212" width="296" height="24" rx="4" fill="rgba(245,158,11,0.08)"/>
        <text x="272" y="228" fill="#4b5563" font-size="9"><tspan fill="#d97706" font-weight="700">⑨</tspan> 接收并格式化 AI 输出</text>

        <!-- Arrow 9→10 -->
        <line x1="262" y1="224" x2="125" y2="224" stroke="#d97706" stroke-width="1.5"/>
        <line x1="125" y1="224" x2="125" y2="244" stroke="#d97706" stroke-width="1.5"/>
        <polygon points="125,250 121,242 129,242" fill="#d97706"/>

        <!-- Step 10 前端 -->
        <rect x="20" y="250" width="210" height="24" rx="4" fill="rgba(99,102,241,0.06)"/>
        <text x="30" y="266" fill="#4b5563" font-size="9"><tspan fill="#6366f1" font-weight="700">⑩</tspan> 展示四模块输出（置信度+依据）</text>

        <!-- Step 11 前端 -->
        <rect x="20" y="278" width="210" height="24" rx="4" fill="rgba(99,102,241,0.06)"/>
        <text x="30" y="294" fill="#4b5563" font-size="9"><tspan fill="#6366f1" font-weight="700">⑪</tspan> 逐模块审核：采纳/修改/驳回</text>
        <line x1="230" y1="290" x2="258" y2="290" stroke="#6366f1" stroke-width="1.5"/>
        <polygon points="266,290 258,286 258,294" fill="#6366f1"/>

        <!-- Step 12 后端 -->
        <rect x="262" y="278" width="296" height="24" rx="4" fill="rgba(245,158,11,0.08)"/>
        <text x="272" y="294" fill="#4b5563" font-size="9"><tspan fill="#d97706" font-weight="700">⑫</tspan> 回写确认结果 → 更新异常工单状态</text>

        <!-- Step 13 后端→AI -->
        <rect x="262" y="306" width="296" height="24" rx="4" fill="rgba(245,158,11,0.08)"/>
        <text x="272" y="322" fill="#4b5563" font-size="9"><tspan fill="#d97706" font-weight="700">⑬</tspan> 采纳内容写入知识库待审核队列</text>
        <line x1="558" y1="318" x2="578" y2="318" stroke="#d97706" stroke-width="1.5"/>
        <polygon points="586,318 578,314 578,322" fill="#d97706"/>

        <!-- Step 14 AI Agent -->
        <rect x="590" y="306" width="210" height="24" rx="4" fill="rgba(124,58,237,0.06)"/>
        <text x="600" y="322" fill="#4b5563" font-size="9"><tspan fill="#7c3aed" font-weight="700">⑭</tspan> 审核通过 → 更新 RAG 索引</text>

        <!-- 底部闭环弧线 -->
        <path d="M695 340 Q695 380 410 380 Q125 380 125 340" fill="none" stroke="#9ca3af" stroke-width="1" stroke-dasharray="5 3"/>
        <text x="410" y="395" fill="#9ca3af" font-size="9" text-anchor="middle">反馈闭环：驱动下次检索更准</text>

        <!-- 图例 -->
        <text x="20" y="460" fill="#9ca3af" font-size="8">箭头颜色：<tspan fill="#6366f1">蓝=前端</tspan> · <tspan fill="#d97706">琥珀=后端</tspan> · <tspan fill="#7c3aed">紫=AI Agent</tspan></text>
      </svg>
    </div>`;
}

function systemFlowTable() {
  const rows = [
    { step:'1', time:'T0', actor:'后端', desc:'履约引擎轮询检测节点 SLA，发现目的国清关超过最晚完成时间', action:'规则判断 → 自动生成 P1 异常工单' },
    { step:'2', time:'T0+1s', actor:'后端', desc:'聚合上下文：订单信息、履约节点、轨迹记录、服务商回传、费用状态', action:'打包为异常工单上下文，推送到前端' },
    { step:'3', time:'', actor:'前端', desc:'异常工单 Tab 渲染：工单详情 + 上下文证据区', action:'运营看到：P1 工单已生成，AI 辅助区待触发' },
    { step:'4', time:'', actor:'前端→后端', desc:'运营点击「生成」或页面自动触发 AI', action:'前端发送 AI 生成请求到后端' },
    { step:'5', time:'T0+2s', actor:'后端', desc:'Step 1 感知：聚合订单·节点·轨迹·回传等完整上下文', action:'构建 AI Prompt 上下文' },
    { step:'6', time:'', actor:'后端→AI Agent', desc:'Step 2 检索：按国家(越南)·线路(深圳→胡志明)·异常类型(清关超时)查询 RAG', action:'RAG 返回匹配的 SOP、历史案例、话术模板' },
    { step:'7', time:'', actor:'AI Agent', desc:'Step 3-4 推理+生成：串行调用四组 Prompt', action:'输出：归因分析(含置信度) / SOP 推荐 / 客户话术草稿 / 费用影响提示' },
    { step:'8', time:'', actor:'AI Agent→后端', desc:'AI Agent 将四模块结果（归因/SOP/话术/费用）返回给后端', action:'后端接收并格式化 AI 输出' },
    { step:'9', time:'', actor:'后端', desc:'接收 AI 返回的四模块结果，格式化后准备推送前端', action:'格式化完成，等待推送' },
    { step:'10', time:'', actor:'后端→前端', desc:'后端推送结果到前端进行渲染', action:'前端展示四模块输出（归因/SOP/话术/费用，含置信度+依据）' },
    { step:'11', time:'', actor:'前端', desc:'运营逐模块审核：查看归因依据+置信度、SOP 步骤、话术风险词、费用提示', action:'采纳 / 修改后采纳 / 驳回（附原因）' },
    { step:'12', time:'', actor:'前端→后端', desc:'确认结果回写后端：关联 Prompt 版本号、操作人、时间戳', action:'更新异常工单状态、触发后续流程（客户同步/费用确认）' },
    { step:'13', time:'', actor:'后端→AI Agent', desc:'采纳/修改后的内容进入知识库待审核队列', action:'SOP 维护人审核 → 通过后更新 RAG 索引' },
    { step:'14', time:'', actor:'AI Agent', desc:'反馈闭环完成：下次相似异常检索时命中更新的知识', action:'驱动 RAG 检索精准度持续提升' },
  ];
  const colorMap = { '前端':'#6366f1','后端':'#d97706','AI Agent':'#7c3aed','前端→后端':'#6366f1','后端→AI Agent':'#d97706','AI Agent→后端':'#7c3aed' };
  const rowsHtml = rows.map(r => `
    <tr>
      <td style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted);text-align:center">${r.step}</td>
      <td style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted);white-space:nowrap">${r.time}</td>
      <td><span style="font-size:10px;font-weight:600;color:${colorMap[r.actor]||'var(--text-secondary)'};background:${r.actor==='前端'?'rgba(99,102,241,0.08)':r.actor==='后端'?'rgba(245,158,11,0.08)':r.actor.includes('→')?'rgba(124,58,237,0.05)':'rgba(124,58,237,0.08)'};padding:1px 6px;border-radius:3px">${r.actor}</span></td>
      <td style="font-size:11px;color:var(--text-secondary)">${r.desc}</td>
      <td style="font-size:10px;color:var(--accent-light)">${r.action}</td>
    </tr>`).join('');

  return `
    <div class="card" style="padding:0;overflow-x:auto">
      <table class="data-table">
        <thead><tr><th style="width:32px">#</th><th style="width:60px">时间</th><th style="width:110px">执行层</th><th>做什么</th><th>结果 / 下一步</th></tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>`;
}

