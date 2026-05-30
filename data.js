// ═══════════════════════════════════════════════════════════
//  跨境 DemoTMS · 数据层
//  数据来源：PRD v5 附录 A 演示数据规格 (TMS-20260529-10238)
// ═══════════════════════════════════════════════════════════

const DATA = {
  // ─── 演示订单基本信息 (PRD 附录 A.1) ───
  order: {
    tmsId: 'TMS-20260529-10238',
    omsId: 'OMS-2026-CN-88421',
    platformId: 'SP-VN-20260528-443901',
    customer: 'A 客户',
    customerLevel: 'KA',
    origin: '中国深圳市龙华区',
    destination: '越南胡志明市第一郡',
    product: '跨境电商标准专线',
    cod: false,
    requireTime: '2026-06-04 18:00 (UTC+7)',
    requireDesc: 'T+6',
    goods: '电子配件（手机壳）',
    qty: '3 件',
    weight: '2.8 kg',
    volume: '0.015 m³',
    declareValue: 'USD 45',
    hsCode: '3926.90',
    receiver: 'Nguyen Van A',
    receiverPhone: '+84-903-123-456',
    receiverAddr: '123 Nguyen Hue, Quan 1, TP HCM',
    receiverTaxId: '待补充',
    currentNode: '目的国清关',
    exceptionFlag: '异常处理中 P1',
    customerVisible: '清关处理中',
    responsible: '运营',
    slaStatus: '已超 6h',
    statusSource: '清关服务商人工回传',
  },

  // ─── 订单列表（订单中心）───
  orderList: [
    {
      tmsId: 'TMS-20260529-10238', route: '深圳 → 胡志明', customer: 'A 客户', level: 'KA',
      node: '目的国清关', nodeStatus: 'exception', sla: '已超 6h', source: '清关服务商',
      risk: '清关超时', riskLevel: 'P1', handleCount: 3, action: '处理异常',
      handlers: [
        { name: '清关异常处理', level: 'P1', owner: '运营', status: '待处理', entry: '异常工单' },
        { name: '客户同步', level: 'P1', owner: '客服', status: '待确认话术', entry: '客户同步' },
        { name: '异常费用确认', level: 'P2', owner: '财务', status: '待补凭证', entry: '费用对账' },
      ],
    },
    {
      tmsId: 'TMS-20260529-10241', route: '深圳 → 胡志明', customer: 'B 客户', level: '普通',
      node: '跨境干线', nodeStatus: 'normal', sla: '正常', source: '承运商 API',
      risk: '无', riskLevel: '-', handleCount: 0, action: '查看',
      handlers: [],
    },
    {
      tmsId: 'TMS-20260530-10256', route: '深圳 → 胡志明', customer: 'C 客户', level: '普通',
      node: '出口清关', nodeStatus: 'warning', sla: '即将超时', source: '报关行回传',
      risk: '资料待确认', riskLevel: 'P2', handleCount: 1, action: '处理',
      handlers: [
        { name: '资料补充', level: 'P2', owner: '运营', status: '待补资料', entry: '订单接入' },
      ],
    },
    {
      tmsId: 'TMS-20260530-10259', route: '深圳 → 胡志明', customer: 'A 客户', level: 'KA',
      node: '末端配送', nodeStatus: 'normal', sla: '正常', source: '末端服务商',
      risk: '无', riskLevel: '-', handleCount: 0, action: '查看',
      handlers: [],
    },
    {
      tmsId: 'TMS-20260530-10262', route: '深圳 → 胡志明', customer: 'D 客户', level: '普通',
      node: '待调度', nodeStatus: 'warning', sla: '待处理', source: '系统',
      risk: '待调度', riskLevel: 'P2', handleCount: 1, action: '去调度',
      handlers: [
        { name: '分段调度', level: 'P2', owner: '调度', status: '待调度', entry: '调度方案' },
      ],
    },
  ],

  // ─── 订单接入列表 ───
  entryList: [
    { id: 'OMS-2026-CN-88421', source: 'API', time: '05-29 08:00', customer: 'A 客户', dest: '越南胡志明', status: 'checking', statusText: '校验中', issue: '收货人税号待补充' },
    { id: 'OMS-2026-CN-88433', source: 'OMS', time: '05-30 09:15', customer: 'C 客户', dest: '越南胡志明', status: 'pass', statusText: '校验通过', issue: '-' },
    { id: 'OMS-2026-CN-88440', source: 'ERP', time: '05-30 10:22', customer: 'E 客户', dest: '越南河内', status: 'fail', statusText: '接入失败', issue: '目的城市暂不支持' },
    { id: 'OMS-2026-CN-88445', source: 'API', time: '05-30 11:08', customer: 'F 客户', dest: '越南胡志明', status: 'wait', statusText: '待补资料', issue: '商业发票缺失' },
  ],

  // ─── 字段校验 (订单接入详情) ───
  fieldChecks: [
    { obj: '客户信息', fields: '客户 ID、客户等级、服务合同', result: 'pass', flow: '匹配客户档案 A (KA)' },
    { obj: '线路信息', fields: '深圳 → 胡志明、标准专线', result: 'pass', flow: '识别为支持线路' },
    { obj: '收件信息', fields: '收件人、电话、地址', result: 'pass', flow: '进入地址解析' },
    { obj: '货品信息', fields: '品名、件数、重量、申报价值', result: 'pass', flow: '进入清关预审' },
    { obj: '订单来源', fields: 'API 推送', result: 'pass', flow: '记录来源和接入时间' },
  ],

  // ─── 地址解析 ───
  addressParse: {
    origin: { raw: '中国深圳市龙华区民治街道', std: '广东省深圳市龙华区民治街道', coord: '22.6531, 114.0426', confidence: 99, status: 'pass' },
    dest: { raw: '123 Nguyen Hue, Quan 1, TP HCM', std: '123 Nguyen Hue Blvd, District 1, Ho Chi Minh City', coord: '10.7743, 106.7038', confidence: 92, status: 'pass' },
  },

  // ─── 清关资料预审 ───
  customsCheck: [
    { obj: '商业发票', fields: '发票号、抬头、币种、金额', result: 'pass', note: '发票号 INV-88421，金额一致' },
    { obj: '装箱单', fields: '件数、重量、体积', result: 'pass', note: '与订单货品信息一致' },
    { obj: 'HS Code', fields: 'HS Code、品类', result: 'pass', note: '3926.90 塑料制品' },
    { obj: '申报价值', fields: '申报币种、金额', result: 'warn', note: 'USD 45，低于品类均值，建议人工确认' },
    { obj: '收货人资料', fields: '名称、电话、税号', result: 'fail', note: '收货人税号缺失，阻止生成履约单' },
  ],

  // ─── 履约节点 (PRD 附录 A.2) ───
  fulfillSegments: [
    { name: '国内揽收', status: 'done', subCount: 4, doneCount: 4, current: '已交仓', source: '承运商 API', icon: '📦' },
    { name: '出口清关', status: 'done', subCount: 5, doneCount: 5, current: '已放行', source: '报关行回传', icon: '📋' },
    { name: '跨境干线', status: 'done', subCount: 4, doneCount: 4, current: '到达目的国', source: '承运商 API', icon: '✈️' },
    { name: '目的国清关', status: 'exception', subCount: 6, doneCount: 3, current: '海关查验/资料复核', source: '清关服务商人工回传', icon: '🛃' },
    { name: '末端配送', status: 'pending', subCount: 4, doneCount: 0, current: '待派送', source: '系统计划', icon: '🚚' },
  ],

  // 目的国清关子节点明细
  customsSubNodes: [
    { name: '到达目的国口岸', status: 'done', plan: '05-31 10:00', actual: '05-31 10:05', owner: '干线承运商', source: '承运商 API', note: '货物到达胡志明口岸' },
    { name: '清关资料接收', status: 'done', plan: '05-31 11:00', actual: '05-31 11:15', owner: '清关服务商', source: '服务商回传', note: '发票、箱单、HS Code 已接收' },
    { name: '进口申报提交', status: 'done', plan: '05-31 12:00', actual: '05-31 12:30', owner: '清关服务商', source: '服务商回传', note: '已提交进口申报' },
    { name: '海关查验/资料复核', status: 'active', plan: '05-31 14:00', actual: '05-31 14:20 (回传)', owner: '清关服务商/海关', source: '人工回传', note: '资料复核中，可能需补收货人税号' },
    { name: '税费确认', status: 'pending', plan: '待触发', actual: '-', owner: '清关服务商/客户', source: '系统计划', note: '依赖资料复核结果' },
    { name: '清关放行', status: 'pending', plan: '待触发', actual: '-', owner: '海关/清关服务商', source: '系统计划', note: '依赖税费确认或查验结果' },
  ],

  // 最近事件
  recentEvents: [
    { time: '05-31 14:20', source: '清关服务商人工回传', event: '资料复核中，预计需补充收货人税号', visible: '否，需运营确认' },
    { time: '05-31 11:50', source: '系统规则', event: '目的国清关接近超时，触发预警', visible: '否' },
    { time: '05-31 09:30', source: '干线承运商 API', event: '货物到达胡志明口岸', visible: '是，可映射为清关处理中' },
  ],

  // ─── 调度方案 ───
  dispatchSegments: [
    { name: '国内揽收', dispatchStatus: '已确认', execStatus: '已完成', provider: '深圳揽收车队 A', sla: '正常', feedback: 'API 回传正常', action: '查看详情' },
    { name: '出口清关', dispatchStatus: '已确认', execStatus: '已完成', provider: '出口报关行 B', sla: '正常', feedback: '服务商回传正常', action: '查看详情' },
    { name: '跨境干线', dispatchStatus: '已接单', execStatus: '执行中', provider: '中越专线承运商 C', sla: '正常', feedback: 'API 回传正常', action: '查看详情' },
    { name: '目的国清关', dispatchStatus: '已派单', execStatus: '异常中', provider: '胡志明清关服务商 D', sla: '已超时', feedback: '人工回传', action: '处理异常 / 改派' },
    { name: '末端配送', dispatchStatus: '已预选', execStatus: '未开始', provider: '越南末端服务商 E', sla: '待触发', feedback: '未要求回传', action: '查看预选' },
  ],

  // 候选服务商对比（目的国清关）
  providerCompare: [
    { name: '清关服务商 D', coverage: '胡志明', cost: '中', response: '快', stability: '中', score: 86, recommend: true, note: '综合最优，需设 2h 回传提醒', selected: true },
    { name: '清关服务商 E', coverage: '胡志明', cost: '低', response: '中', stability: '低', score: 71, recommend: false, note: '费用低，但回传风险较高', selected: false },
    { name: '清关服务商 F', coverage: '胡志明', cost: '高', response: '快', stability: '高', score: 79, recommend: false, note: '稳定性高，但费用偏高', selected: false },
  ],

  // 评分权重（PRD 附录 A.5 — Demo 刻意保留点）
  scoreWeights: [
    { dim: '时效', weight: 30 },
    { dim: '费用', weight: 25 },
    { dim: '覆盖', weight: 20 },
    { dim: '历史准时率', weight: 15 },
    { dim: '回传稳定性', weight: 10 },
  ],

  // ─── AI 归因输出 (PRD 附录 A.3) ───
  aiAttribution: {
    confidenceOverall: 72,
    results: [
      {
        rank: 1, confidence: 72,
        reason: '清关资料待补充——收货人税号可能缺失或格式不符越南海关要求',
        evidence: ['服务商 14:20 回传：资料复核中，可能需补充收货人税号', '订单接入时收货人税号字段标记为「待补充」', '历史案例匹配：2024-03 越南胡志明清关资料补充，相似度 81%'],
        missing: ['海关具体要求的税号格式', '是否已有补充途径'],
      },
      {
        rank: 2, confidence: 54,
        reason: '海关主动查验（单查）——概率约 30%',
        evidence: ['胡志明口岸 5 月下旬查验率历史均值约 25-30%', '货品为电子配件，属常见查验品类'],
        missing: ['服务商未明确说明是主动查验还是资料问题'],
      },
      {
        rank: 3, confidence: 38,
        reason: '清关服务商内部排期延迟',
        evidence: ['服务商近 30 天回传及时率 86%，低于平均水平'],
        missing: ['服务商未回传延迟原因'],
      },
    ],
    ragSources: ['越南清关 SOP-资料补充 v2.1', '历史案例-胡志明清关 20240318'],
  },

  // AI SOP 推荐
  aiSop: {
    name: '越南目的国清关资料补充 SOP',
    version: 'v2.1',
    status: '生效',
    match: '国家✓ 线路✓ 异常类型✓',
    steps: [
      '联系清关服务商 D，确认是资料问题还是查验问题',
      '若为资料问题，向委托客户 A 索取收货人税号（越南税号格式：10 位或 13 位数字）',
      '资料补齐后回传清关服务商，跟进重新申报',
      '同步预计放行时间给客户，标注下次更新节点',
    ],
  },

  // AI 话术草稿 (PRD 附录 A.4)
  aiMessage: {
    draft: '您好，您的订单（OMS-2026-CN-88421）目前正在越南胡志明口岸进行清关核查。清关服务商正在配合处理，我们预计在接下来 4 小时内获得最新进展并向您同步。如需配合，请确认收货人相关证件信息是否完整，我们会及时与您联系。感谢您的理解与耐心等待。',
    risks: [
      { type: '时效承诺', text: '预计明日到达', suggestion: '改为：将在确认后同步预计到达时间' },
      { type: '责任判定', text: '收货人税号问题', suggestion: '改为：清关资料待核实（避免提前判定责任）' },
    ],
  },

  // AI 费用提示
  aiCost: {
    types: [
      { name: '补资料费', amount: '约 CNY 50', node: '目的国清关', evidence: '需服务商出具补资料工时凭证' },
      { name: '仓储费', amount: 'CNY 0（免费期内）', node: '目的国清关', evidence: '免费期 3 天，已用 1 天，剩余 2 天' },
    ],
    warning: '若超过免费期（剩余 2 天），将按 CNY 30/天产生滞港费',
  },

  // ─── 内外状态映射 ───
  statusMapping: [
    { internal: '目的国清关-待补资料', visible: '清关资料待确认', auto: '否，需人工确认', note: '说明需补充资料，不写责任归属' },
    { internal: '目的国清关-查验滞留', visible: '清关处理中', auto: '否，需人工确认', note: '说明清关处理中，已联系服务商' },
    { internal: '目的国清关-服务商响应延迟', visible: '清关处理中', auto: '否，需人工确认', note: '改为中性进展说明' },
    { internal: '目的国清关-已放行', visible: '清关完成，准备派送', auto: '可按规则同步', note: '告知下一节点和更新时间' },
  ],

  // 客户同步记录
  syncRecords: [
    { time: '05-31 12:00', channel: '企业微信', content: '您的订单已到达越南口岸，正在清关处理中', status: '已发送', operator: '客服-小林' },
    { time: '05-30 18:30', channel: '邮件', content: '您的订单已发出，预计 T+6 送达', status: '已读', operator: '系统自动' },
  ],

  // ─── 费用对账 ───
  billing: {
    receivable: 'CNY 1,280',
    payable: 'VND 4,200,000',
    profit: 'CNY 160',
    status: '待确认',
    exception: '查验费 / 补资料费',
    exchangeStatus: '待锁定（演示用）',
  },
  billingItems: [
    { type: '基础运费', receivable: 'CNY 980', payable: 'VND 2,800,000', node: '全链路', status: '已确认' },
    { type: '清关费', receivable: 'CNY 200', payable: 'VND 1,200,000', node: '目的国清关', status: '已确认' },
    { type: '末端配送费', receivable: 'CNY 100', payable: 'VND 200,000', node: '末端配送', status: '待执行' },
    { type: '补资料费（异常）', receivable: '待确认', payable: '约 CNY 50', node: '目的国清关', status: '待确认' },
    { type: '偏远附加费', receivable: 'CNY 0', payable: 'CNY 0', node: '末端配送', status: '不适用' },
  ],

  // ─── 附件 ───
  attachments: [
    { name: '商业发票_INV88421.pdf', type: '清关资料', node: '出口清关', source: '客户上传', time: '05-29 08:30' },
    { name: '装箱单_PL88421.pdf', type: '清关资料', node: '出口清关', source: '客户上传', time: '05-29 08:30' },
    { name: '出口放行单.pdf', type: '运输凭证', node: '出口清关', source: '报关行', time: '05-30 08:30' },
    { name: '海关查验通知.jpg', type: '异常附件', node: '目的国清关', source: '清关服务商', time: '05-31 14:20' },
  ],

  // ─── AI 效果看板 ───
  aiDashboard: {
    health: { successRate: 98.2, avgTime: 11.2, degradeCount: 0, alert: '无告警' },
    retrieval: { ragHit: 72, attrHit: 81, sopHit: 65, msgHit: 69, costHit: 70 },
    generation: [
      { module: '归因', adopt: 68, reject: 15, modify: 17 },
      { module: 'SOP', adopt: 61, reject: 22, modify: 17 },
      { module: '话术', adopt: 74, reject: 8, modify: 35 },
      { module: '费用', adopt: 70, reject: 12, modify: 18 },
    ],
    business: [
      { label: '异常处理时长', value: '3.2h', base: '基线 5.1h', trend: 'down', good: true },
      { label: '客户重复查询量', value: '-23%', base: 'vs 基线', trend: 'down', good: true },
      { label: '话术一次通过率', value: '74%', base: '基线 0%', trend: 'up', good: true },
      { label: '费用争议率', value: '8%', base: 'vs 基线', trend: 'down', good: true },
    ],
    alerts: [
      { level: 'red', time: '05-28', text: 'SOP 模块驳回率突升至 48%，超阈值' },
      { level: 'amber', time: '05-27', text: '话术模块 RAG 命中率连续 3 日 < 35%' },
    ],
    promptVersions: { module: '归因', current: 'v1.3', compare: 'v1.2', adoptNew: 68, adoptOld: 61, rejectNew: 15, rejectOld: 21 },
  },

  // ─── 知识库 ───
  knowledge: [
    { id: 'KB-001', type: '国家规则', name: '越南清关资料要求', country: '越南', route: '深圳→胡志明', version: 'v1.2', status: '生效', owner: '运营主管', cites: 24 },
    { id: 'KB-002', type: '清关 SOP', name: '目的国清关超时处理 SOP', country: '越南', route: '深圳→胡志明', version: 'v2.1', status: '生效', owner: '运营主管', cites: 18 },
    { id: 'KB-003', type: '清关 SOP', name: '清关资料补充流程', country: '越南', route: '深圳→胡志明', version: 'v1.0', status: '生效', owner: '运营主管', cites: 12 },
    { id: 'KB-004', type: '历史案例', name: '胡志明查验滞留 48h 处理案例', country: '越南', route: '深圳→胡志明', version: 'v1.0', status: '生效', owner: '运营-小王', cites: 9 },
    { id: 'KB-005', type: '客户话术模板', name: 'KA 客户清关处理中同步模板', country: '通用', route: '通用', version: 'v1.1', status: '生效', owner: '客服主管', cites: 31 },
    { id: 'KB-006', type: '费用规则', name: '滞港费阶梯计算规则', country: '越南', route: '深圳→胡志明', version: 'v1.0', status: '草稿', owner: '财务', cites: 0 },
  ],
  knowledgeQueue: [
    { source: 'AI 处理结果回写', content: '补资料后 36h 放行案例', time: '05-31 18:00' },
    { source: '运营驳回补充', content: '节假日清关延误处理经验', time: '05-30 16:20' },
    { source: '人工新增', content: '越南税号格式校验规则', time: '05-30 10:00' },
  ],

  // ─── 规则配置 ───
  rules: {
    sla: [
      { node: '国内揽收', standard: '4h', latest: '6h', trigger: '超时生成预警' },
      { node: '出口清关', standard: '8h', latest: '12h', trigger: '超时生成预警' },
      { node: '跨境干线', standard: '24h', latest: '36h', trigger: '超时生成预警' },
      { node: '目的国清关', standard: '4h', latest: '6h（+缓冲4h）', trigger: '超时生成 P1 异常工单' },
      { node: '末端配送', standard: '12h', latest: '24h', trigger: '超时生成预警' },
    ],
    statusMap: [
      { providerCode: 'CUSTOMS_INSPECTING', internal: '目的国清关-查验中', visible: '清关处理中' },
      { providerCode: 'CUSTOMS_DOC_PENDING', internal: '目的国清关-待补资料', visible: '清关资料待确认' },
      { providerCode: 'CUSTOMS_RELEASED', internal: '目的国清关-已放行', visible: '清关完成，准备派送' },
    ],
  },
};

// 全局状态（用于交互记忆）
const STATE = {
  currentPage: 'order-list',
  detailTab: 'overview',
  aiModuleStatus: { attribution: 'pending', sop: 'pending', message: 'pending', cost: 'pending' },
  aiGenerated: false,
};
