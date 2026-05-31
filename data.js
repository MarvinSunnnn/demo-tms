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
    product: '跨境标准专线',
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
    { obj: '客户信息', fields: '客户 ID、客户等级、服务合同', result: 'pass', routing: '可继续', routingType: 'continue', flow: '自动进入地址解析' },
    { obj: '线路信息', fields: '深圳 → 胡志明、标准专线', result: 'pass', routing: '可继续', routingType: 'continue', flow: '自动进入地址解析' },
    { obj: '收件信息', fields: '收件人、电话、地址', result: 'warn', routing: '待补资料', routingType: 'pending_doc', flow: '收货人电话格式异常，生成缺失字段清单，标记责任方：客户补充' },
    { obj: '货品信息', fields: '品名、件数、重量、申报价值', result: 'warn', routing: '待人工确认', routingType: 'pending_check', flow: '申报价值 $45 高于品类均值 $5-15，标黄高亮，等待运营确认后分流' },
    { obj: '订单来源', fields: 'API 推送', result: 'pass', routing: '可继续', routingType: 'continue', flow: '自动进入地址解析' },
  ],

  // ─── 地址解析 ───
  addressParse: {
    origin: {
      raw: '中国深圳市龙华区民治街道',
      std: '广东省深圳市龙华区民治街道',
      coord: '22.6531, 114.0426',
      confidence: 99,
      status: 'success',
      statusText: '解析成功',
      coverage: '深圳市龙华区 · 揽收车队 A 覆盖',
    },
    dest: {
      raw: '123 Nguyen Hue, Quan 1, TP HCM',
      candidates: [
        { addr: '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh', coord: '10.7743, 106.7038', confidence: 68, source: '规则引擎 + AI 辅助' },
        { addr: '123 Nguyễn Huệ, P. Bến Nghé, Quận 1, TP. Hồ Chí Minh', coord: '10.7751, 106.7045', confidence: 52, source: 'AI 多语言识别' },
      ],
      confidence: 68,
      status: 'low_confidence',
      statusText: '低置信待确认',
      aiNote: '越南语地址含缩写 "Quan 1"（应为 Quận 1）、"TP HCM"（应为 TP. Hồ Chí Minh），AI 识别后给出 2 个候选地址，需运营确认。',
      missing: '门牌号 123 对应的建筑类型未确认，可能影响末端配送精度。',
      coverage: '胡志明市第一郡 · 末端服务商 E 可覆盖',
      remote: false,
    },
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

  // ─── 各履约段子节点明细 ───
  segmentSubNodes: {
    '国内揽收': [
      { name: '已预约', status: 'done', plan: '05-29 08:00', actual: '05-29 08:00', owner: '深圳揽收车队 A', source: '承运商 API', note: '揽收预约已确认' },
      { name: '司机前往揽收', status: 'done', plan: '05-29 09:00', actual: '05-29 09:05', owner: '深圳揽收车队 A', source: '承运商 API', note: '司机已出发' },
      { name: '已揽收', status: 'done', plan: '05-29 10:00', actual: '05-29 10:15', owner: '深圳揽收车队 A', source: '承运商 API', note: '货物已揽收' },
      { name: '已交仓', status: 'done', plan: '05-29 12:00', actual: '05-29 11:50', owner: '深圳揽收车队 A', source: '承运商 API', note: '货物已交付集货仓' },
      { name: '交仓异常', status: 'pending', plan: '-', actual: '-', owner: '-', source: '-', note: '本次无异常' },
    ],
    '出口清关': [
      { name: '资料预审中', status: 'done', plan: '05-29 12:30', actual: '05-29 12:35', owner: '出口报关行 B', source: '服务商回传', note: '发票、箱单、HS Code 已预审' },
      { name: '申报中', status: 'done', plan: '05-29 13:00', actual: '05-29 13:10', owner: '出口报关行 B', source: '服务商回传', note: '出口申报已提交' },
      { name: '查验中', status: 'pending', plan: '-', actual: '-', owner: '海关', source: '-', note: '本次未被查验' },
      { name: '已放行', status: 'done', plan: '05-29 14:00', actual: '05-29 14:05', owner: '海关', source: '服务商回传', note: '出口放行' },
      { name: '待补资料', status: 'pending', plan: '-', actual: '-', owner: '-', source: '-', note: '本次资料齐备' },
    ],
    '跨境干线': [
      { name: '待装车/装舱', status: 'done', plan: '05-29 15:00', actual: '05-29 15:10', owner: '中越专线承运商 C', source: '承运商 API', note: '货物已装车' },
      { name: '运输中', status: 'done', plan: '05-29 15:30', actual: '05-30 09:30', owner: '中越专线承运商 C', source: '承运商 API', note: '跨境运输中' },
      { name: '轨迹断点', status: 'pending', plan: '-', actual: '-', owner: '-', source: '-', note: '本次轨迹正常' },
      { name: '到达目的国', status: 'done', plan: '05-31 09:30', actual: '05-31 09:30', owner: '中越专线承运商 C', source: '承运商 API', note: '到达胡志明口岸' },
    ],
    '目的国清关': [
      { name: '到达目的国口岸', status: 'done', plan: '05-31 10:00', actual: '05-31 10:05', owner: '干线承运商', source: '承运商 API', note: '货物到达胡志明口岸' },
      { name: '清关资料接收', status: 'done', plan: '05-31 11:00', actual: '05-31 11:15', owner: '清关服务商', source: '服务商回传', note: '发票、箱单、HS Code 已接收' },
      { name: '进口申报提交', status: 'done', plan: '05-31 12:00', actual: '05-31 12:30', owner: '清关服务商', source: '服务商回传', note: '已提交进口申报' },
      { name: '海关查验/资料复核', status: 'active', plan: '05-31 14:00', actual: '05-31 14:20 (回传)', owner: '清关服务商/海关', source: '人工回传', note: '资料复核中，可能需补收货人税号' },
      { name: '税费确认', status: 'pending', plan: '待触发', actual: '-', owner: '清关服务商/客户', source: '系统计划', note: '依赖资料复核结果' },
      { name: '清关放行', status: 'pending', plan: '待触发', actual: '-', owner: '海关/清关服务商', source: '系统计划', note: '依赖税费确认或查验结果' },
    ],
    '末端配送': [
      { name: '待派送', status: 'pending', plan: '待触发', actual: '-', owner: '越南末端服务商 E', source: '系统计划', note: '依赖清关放行' },
      { name: '派送中', status: 'pending', plan: '待触发', actual: '-', owner: '越南末端服务商 E', source: '系统计划', note: '-' },
      { name: '已签收', status: 'pending', plan: '待触发', actual: '-', owner: '越南末端服务商 E', source: '系统计划', note: '-' },
      { name: '派送异常', status: 'pending', plan: '-', actual: '-', owner: '-', source: '-', note: '本次无异常' },
    ],
  },

  // 保留旧引用兼容
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
    draftVN: 'Kính chào Quý khách, đơn hàng (OMS-2026-CN-88421) của Quý khách hiện đang được kiểm tra hải quan tại cửa khẩu TP. Hồ Chí Minh, Việt Nam. Đơn vị khai báo hải quan đang phối hợp xử lý, chúng tôi dự kiến sẽ có tiến triển mới trong vòng 4 giờ tới và sẽ cập nhật ngay cho Quý khách. Nếu cần, xin vui lòng xác nhận thông tin giấy tờ của người nhận hàng đã đầy đủ, chúng tôi sẽ liên hệ với Quý khách kịp thời. Cảm ơn Quý khách đã thông cảm và kiên nhẫn.',
    draftEN: 'Dear Customer, your order (OMS-2026-CN-88421) is currently undergoing customs inspection at Ho Chi Minh City port, Vietnam. The customs broker is coordinating the process, and we expect to have an update within the next 4 hours. If needed, please confirm that the consignee\'s documentation is complete, and we will contact you promptly. Thank you for your understanding and patience.',
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
    { time: '05-31 14:30', trigger: '异常处理', channel: '企业微信', content: '您的订单目前正在胡志明口岸清关核查，已联系服务商配合处理，预计 4 小时内同步进展。如需配合，请确认收货人税号信息是否完整。', contact: 'Nguyen Van A (KA)', status: '已发送', operator: '客服-小林', relatedObj: 'WO-20260531-0042', followUp: '需客户补税号，下次更新 18:00' },
    { time: '05-31 12:00', trigger: '节点同步', channel: '企业微信', content: '您的订单已到达越南胡志明口岸，正在清关处理中。', contact: 'Nguyen Van A (KA)', status: '已读', operator: '客服-小林', relatedObj: '目的国清关', followUp: '自动通知，无需操作' },
    { time: '05-30 18:30', trigger: '节点同步', channel: '邮件', content: '您的订单已从深圳发出，预计 T+6 送达胡志明。', contact: 'Nguyen Van A (KA)', status: '已读', operator: '系统自动', relatedObj: '跨境干线', followUp: '自动通知，无需操作' },
    { time: '05-30 10:00', trigger: '节点同步', channel: '邮件', content: '您的订单已揽收，即将进入出口清关。', contact: 'Nguyen Van A (KA)', status: '已读', operator: '系统自动', relatedObj: '国内揽收', followUp: '自动通知，无需操作' },
  ],

  // ─── 异常工单列表（支持多条异常切换）───
  exceptions: [
    {
      id: 'wo1', type: '目的国清关超时', level: 'P1', levelColor: 'red', status: 'AI 输出完毕', statusColor: 'blue', active: true,
      woId: 'WO-20260531-0042', triggerTime: '05-31 16:10', overtime: '6h 10min', node: '目的国清关 · 海关查验/资料复核',
      responsible: '运营 / 清关服务商', slaImpact: '是 · T+6 承诺',
      ctx: [
        { label: '订单', text: 'A客户(KA) · USD 45 · T+6 承诺 · 超时 6h' },
        { label: '节点', text: '目的国清关 · 最晚 05-31 16:00 · 已超时' },
        { label: '轨迹', text: '最近轨迹 05-31 09:30，此后无更新' },
        { label: '服务商回传', text: '14:20：资料复核中，可能需补收货人税号', hl: true },
        { label: '历史案例', text: '命中 3 个相似案例，补资料后均值 48h 放行' },
        { label: '费用', text: '已用仓储免费期 1 天，剩余 2 天' },
      ],
    },
    {
      id: 'wo2', type: '状态回传超时', level: 'P2', levelColor: 'amber', status: '人工处理中', statusColor: 'amber', active: false,
      woId: 'WO-20260531-0043', triggerTime: '05-31 15:00', overtime: '3h 未回传', node: '国内揽收',
      responsible: '运营 / 揽收车队', slaImpact: '否',
      ctx: [
        { label: '订单', text: 'A客户(KA) · 深圳揽收 · 预计 12:00 完成' },
        { label: '节点', text: '国内揽收 · 已揽收 · 未回传交仓状态' },
        { label: '轨迹', text: '最近轨迹 05-31 09:05（司机已出发），此后无更新' },
        { label: '服务商回传', text: '承运商 API 异常：连接超时，未收到交仓回传', hl: true },
        { label: '历史案例', text: '同车队上月 2 次 API 回传延迟，均为网络问题' },
        { label: '费用', text: '暂未产生额外费用' },
      ],
    },
    {
      id: 'wo3', type: '费用差异', level: 'P2', levelColor: 'amber', status: '已关闭', statusColor: 'gray', active: false,
      woId: 'WO-20260530-0038', triggerTime: '05-30 10:00', overtime: '已处理', node: '出口清关',
      responsible: '财务 / 出口报关行', slaImpact: '否',
      ctx: [
        { label: '订单', text: 'A客户(KA) · 出口申报 · 报关费差异' },
        { label: '节点', text: '出口清关 · 已完成 · 费用对账中' },
        { label: '差异', text: '报关行账单 CNY 200 vs 报价 CNY 180，差异 CNY 20' },
        { label: '服务商说明', text: '海关加收单证审查费 CNY 20，已提供收费凭证', hl: true },
        { label: '处理结果', text: '财务已确认，费用已计入供应商应付' },
        { label: '费用', text: '差异 CNY 20 已解决' },
      ],
    },
  ],

  // ─── 费用对账 ───
  billing: {
    receivable: 'CNY 1,280',
    payable: 'VND 4,200,000',
    profit: 'CNY 160',
    status: '待确认',
    exception: '查验费 / 补资料费',
    exchangeStatus: '待锁定（演示用）',
    exchangeDiff: 'CNY 35（VND→CNY 折算偏差）',
  },
  billingItems: [
    { type: '基础运费', receivable: 'CNY 980', payable: 'VND 2,800,000', node: '全链路', relatedWO: '-', responsible: '客户 / 干线承运商', status: '已确认' },
    { type: '清关费', receivable: 'CNY 200', payable: 'VND 1,200,000', node: '目的国清关', relatedWO: '-', responsible: '客户 / 清关服务商', status: '已确认' },
    { type: '末端配送费', receivable: 'CNY 100', payable: 'VND 200,000', node: '末端配送', relatedWO: '-', responsible: '客户 / 末端服务商', status: '待执行' },
    { type: '补资料费（异常）', receivable: '待确认', payable: '约 CNY 50', node: '目的国清关', relatedWO: 'WO-20260531-0042', responsible: '待确认', status: '待确认' },
    { type: '偏远附加费', receivable: 'CNY 0', payable: 'CNY 0', node: '末端配送', relatedWO: '-', responsible: '-', status: '不适用' },
    { type: '汇率差异', receivable: 'CNY 35', payable: 'VND 120,000', node: '目的国清关', relatedWO: '-', responsible: '财务确认', status: '待确认' },
  ],
  billingEvidence: [
    { node: '目的国清关', wo: 'WO-20260531-0042', feedback: '清关服务商 14:20 回传：查验通知', doc: '海关查验通知.jpg', bill: '清关服务商 D 账单 #202605' },
    { node: '目的国清关', wo: 'WO-20260531-0042', feedback: '运营补充：补资料费 CNY 50', doc: '补资料工时凭证（待上传）', bill: '清关服务商 D 账单 #202605' },
    { node: '全链路', wo: '-', feedback: '系统自动：基础运费 CNY 980', doc: '承运商报价单', bill: '中越专线承运商 C 账单 #202605' },
  ],

  // ─── 附件 ───
  attachments: [
    { name: '客户服务协议_KH2026001.pdf', type: '合同协议', node: '订单级', source: '客户上传', uploader: '客户 A', time: '05-28 12:00', relatedWO: '-', relatedFee: '-' },
    { name: '商业发票_INV88421.pdf', type: '清关类', node: '出口清关', source: '客户上传', uploader: '客户 A', time: '05-29 08:30', relatedWO: '-', relatedFee: '-' },
    { name: '装箱单_PL88421.pdf', type: '清关类', node: '出口清关', source: '客户上传', uploader: '客户 A', time: '05-29 08:30', relatedWO: '-', relatedFee: '-' },
    { name: '申报要素表.pdf', type: '清关类', node: '出口清关', source: '客户上传', uploader: '客户 A', time: '05-29 08:30', relatedWO: '-', relatedFee: '-' },
    { name: '承运商交接单.pdf', type: '运输类', node: '国内揽收', source: '承运商 API', uploader: '系统自动', time: '05-29 11:50', relatedWO: '-', relatedFee: '-' },
    { name: '出口放行单.pdf', type: '运输类', node: '出口清关', source: '报关行', uploader: '出口报关行 B', time: '05-30 08:30', relatedWO: '-', relatedFee: '-' },
    { name: '提单_BOL202605.pdf', type: '运输类', node: '跨境干线', source: '承运商 API', uploader: '系统自动', time: '05-30 09:30', relatedWO: '-', relatedFee: '-' },
    { name: '海关查验通知.jpg', type: '异常类', node: '目的国清关', source: '清关服务商', uploader: '清关服务商 D', time: '05-31 14:20', relatedWO: 'WO-20260531-0042', relatedFee: '补资料费' },
    { name: '补资料清单_20260531.png', type: '异常类', node: '目的国清关', source: '运营补充', uploader: '运营', time: '05-31 15:00', relatedWO: 'WO-20260531-0042', relatedFee: '补资料费' },
    { name: '清关费报价单.pdf', type: '费用类', node: '目的国清关', source: '清关服务商', uploader: '清关服务商 D', time: '05-28 16:00', relatedWO: '-', relatedFee: '清关费' },
    { name: '货物照片_揽收.jpg', type: '图片类', node: '国内揽收', source: '揽收车队', uploader: '深圳揽收车队 A', time: '05-29 10:15', relatedWO: '-', relatedFee: '-' },
  ],

  // ─── AI 效果看板 ───
  aiDashboard: {
    health: { successRate: 98.2, avgTime: 11.2, degradeCount: 0, stepFails: [0,3,1,0,0,0], alertLevel: '🟡 关注', alertMsg: 'S2 失败率 6% 超阈值 (5%)' },
    retrieval: { ragHit: 72, attrHit: 81, sopHit: 65, msgHit: 69, costHit: 70, avgLatency: 2.8 },
    generation: [
      { module: '归因', adopt: 68, reject: 15, modify: 17 },
      { module: 'SOP', adopt: 61, reject: 22, modify: 17 },
      { module: '话术', adopt: 74, reject: 8, modify: 35 },
      { module: '费用', adopt: 70, reject: 12, modify: 18 },
    ],
    business: [
      { label: '异常处理时长', value: '3.2h', base: '基线 5.1h', desc: '工单生成到关闭的平均时长', good: true },
      { label: '客户重复查询量', value: '-23%', base: '基线 3.2 次/单', desc: '同一异常期间客户催问次数', good: true },
      { label: '话术一次通过率', value: '74%', base: '基线 0%', desc: '客服不修改直接发送的比例', good: true },
      { label: '费用争议率', value: '8%', base: '基线 18%', desc: '产生费用争议的异常占比', good: true },
      { label: 'AI 使用覆盖率', value: '86%', base: '目标 > 80%', desc: '触发 AI 的工单 / 全部异常工单', good: true },
    ],
    missTop5: [
      { scene: '末端配送异常·派送失败', route: '深圳→胡志明', count: 12 },
      { scene: '收货人补税流程', route: '深圳→胡志明', count: 8 },
      { scene: '服务商响应超时', route: '深圳→胡志明', count: 6 },
      { scene: '出口清关·资料预审', route: '深圳→河内', count: 4 },
      { scene: '跨境干线·轨迹断点', route: '深圳→胡志明', count: 3 },
    ],
    lowConfidence: 18,
    markInvalid: 7,
    rejectTop5: ['归因错误', 'SOP 不适用', '话术风格不符', '费用判断不准', '场景不匹配'],
    alerts: [
      { level: 'red', time: '05-28', text: 'SOP 模块驳回率突升至 48%，超阈值' },
      { level: 'amber', time: '05-27', text: '话术模块 RAG 命中率连续 3 日 < 35%' },
    ],
    promptVersions: { module: '归因', current: 'v1.3', compare: 'v1.2', adoptNew: 68, adoptOld: 61, rejectNew: 15, rejectOld: 21 },
  },

  // ─── 知识库 ───
  knowledge: [
    { id: 'KB-001', type: '清关 SOP', name: '目的国清关超时处理 SOP', country: '越南', route: '深圳→胡志明', version: 'v2.1', status: '生效', owner: '运营主管', updated: '05-28', source: '运营主管口述',
      meta: { anomalyType: '清关超时', node: '目的国清关', steps: ['联系清关服务商确认原因','索取缺失资料清单','通知客户并获取补充材料','跟进重新申报','确认放行时间并同步客户'], conditions: '目的国清关超过最晚完成时间' },
      cites: 18 },
    { id: 'KB-002', type: '清关 SOP', name: '清关资料补充流程', country: '越南', route: '深圳→胡志明', version: 'v1.0', status: '生效', owner: '运营主管', updated: '05-20', source: '历史工单提炼',
      meta: { anomalyType: '资料缺失', node: '目的国清关', steps: ['确认缺失资料类型（税号/发票/箱单）','联系客户获取越南格式税号','资料补齐后回传服务商','跟进重新申报状态'], conditions: '收货人税号缺失或格式不符' },
      cites: 12 },
    { id: 'KB-003', type: '清关 SOP', name: '服务商响应延迟升级 SOP', country: '越南', route: '深圳→胡志明', version: 'v1.0', status: '生效', owner: '运营主管', updated: '05-25', source: '运营主管口述',
      meta: { anomalyType: '服务商响应延迟', node: '目的国清关', steps: ['超过2h未回传→电话联系对接人','4h未解决→升级至服务商主管','同步记录延迟原因和恢复时间','严重延迟→启动改派评估'], conditions: '服务商回传超时>2h' },
      cites: 7 },
    { id: 'KB-004', type: '历史案例', name: '胡志明查验滞留 48h 处理案例', country: '越南', route: '深圳→胡志明', version: 'v1.0', status: '生效', owner: '运营-小王', updated: '05-15', source: '历史工单脱敏',
      meta: { orderType: 'KA 客户·标准专线', anomaly: '目的国清关超时·海关查验', actions: '联系服务商确认查验原因→获取查验通知→判断为资料问题→联系客户补税号→税号补齐后36h放行', result: '最终放行，超时 48h，客户接受说明', similarity: 81 },
      cites: 9 },
    { id: 'KB-005', type: '历史案例', name: '申报价值异常引发延迟案例', country: '越南', route: '深圳→胡志明', version: 'v1.0', status: '生效', owner: '运营-小王', updated: '05-18', source: '运营经验提炼',
      meta: { orderType: '普通客户·标准专线', anomaly: '申报价值USD45低于品类均值', actions: '接单时标黄→运营确认→联系客户确认→客户未回复→默认放行→清关时海关额外审查→补资料', result: '额外延误 12h，可避免', similarity: 62 },
      cites: 5 },
    { id: 'KB-006', type: '客户话术模板', name: 'KA 客户清关处理中同步模板', country: '通用', route: '通用', version: 'v1.1', status: '生效', owner: '客服主管', updated: '05-22', source: '客服历史话术',
      meta: { clientLevel: 'KA', anomalyLevel: 'P0/P1', forbidden: '赔付/责任方/保证/最晚送达/赔偿', channel: '企业微信+邮件', template: '您好，您的订单目前在[清关节点]处理中，我们已联系[服务商]配合处理，预计[X]小时内同步最新进展。感谢您的理解与耐心等待。' },
      cites: 31 },
    { id: 'KB-007', type: '客户话术模板', name: '普通客户节点同步模板', country: '通用', route: '通用', version: 'v1.0', status: '生效', owner: '客服主管', updated: '05-20', source: '客服历史话术',
      meta: { clientLevel: '普通', anomalyLevel: 'P2', forbidden: '赔付/责任方/赔偿', channel: '邮件', template: '您好，您的订单已到达[节点]，预计[X]处理完毕。如有疑问请回复本邮件。' },
      cites: 22 },
    { id: 'KB-008', type: '费用处理知识', name: '滞港费阶梯计算规则', country: '越南', route: '深圳→胡志明', version: 'v1.0', status: '草稿', owner: '财务', updated: '05-25', source: '财务对账经验',
      meta: { feeType: '仓储费/滞港费', formula: '免费期3天→超期CNY30/天→第7天起CNY50/天', evidence: '需仓储费凭证', responsible: '按异常原因判定：服务商延误→服务商承担 客户补资料延误→客户承担' },
      cites: 0 },
    { id: 'KB-009', type: '历史案例', name: '补资料后 36h 放行案例', country: '越南', route: '深圳→胡志明', version: 'v1.0', status: '待审核', owner: '运营-小王', updated: '05-31', source: '运营修改采纳',
      meta: { orderType: 'KA 客户·标准专线', anomaly: '目的国清关·资料缺失', actions: '客户补充税号→服务商重新申报→36h后放行', result: '补资料后顺利放行，可作为资料补充标准案例', similarity: 75 },
      cites: 0 },
    { id: 'KB-010', type: '清关 SOP', name: '节假日清关延误处理经验', country: '越南', route: '深圳→胡志明', version: 'v0.9', status: '待审核', owner: '运营主管', updated: '05-30', source: '运营驳回补充',
      meta: { anomalyType: '节假日延误', node: '目的国清关', steps: ['提前确认节假日海关工作时间','预留额外 24h 缓冲','提前通知客户可能延迟'], conditions: '节假日前后清关' },
      cites: 0 },
    { id: 'KB-011', type: '清关 SOP', name: '越南税号格式校验规则', country: '越南', route: '深圳→胡志明', version: 'v0.8', status: '待审核', owner: '运营主管', updated: '05-30', source: '人工新增',
      meta: { anomalyType: '资料校验', node: '目的国清关', steps: ['检查税号格式（10位或13位数字）','若不匹配→联系客户确认','验证通过后更新收货人资料'], conditions: '收货人税号提交但格式异常' },
      cites: 0 },
  ],
  knowledgeQueue: [],

  // ─── 规则配置 ───
  rules: {
    // ① 线路 SLA 配置
    sla: [
      { fields: ['中国深圳→越南胡志明','标准专线','国内揽收','已预约/司机前往揽收/已揽收/已交仓/交仓异常','2','0','不触发','中国工作日历'] },
      { fields: ['中国深圳→越南胡志明','标准专线','出口清关','资料预审中/申报中/查验中/已放行/待补资料','4','0','不触发','中国工作日历'] },
      { fields: ['中国深圳→越南胡志明','标准专线','跨境干线','待装车/运输中/轨迹断点/到达目的国','18','2','P2','中国工作日历'] },
      { fields: ['中国深圳→越南胡志明','标准专线','目的国清关','到达口岸/资料接收/申报提交/海关查验/税费确认/清关放行','8','4','P1','越南工作日历'] },
      { fields: ['中国深圳→越南胡志明','标准专线','末端配送','待派送/派送中/已签收/派送异常','4','2','P2','越南工作日历'] },
    ],
    slaCols: ['线路','服务产品','履约段','子节点','标准时效(h)','缓冲(h)','超时触发','工作日历'],
    // ② 状态映射配置
    statusMapping: [
      { fields: ['胡志明清关服务商 D','资料复核中','目的国清关-查验滞留','清关处理中','否','4'] },
      { fields: ['胡志明清关服务商 D','待补资料','目的国清关-待补资料','清关资料待确认','否','4'] },
      { fields: ['胡志明清关服务商 D','已放行','目的国清关-已放行','清关完成，准备派送','是','4'] },
    ],
    smCols: ['服务商','服务商状态码','TMS 内部状态','客户可见状态','自动同步','回传超时(h)'],
    // ③ 接单校验配置
    entryCheck: [
      { fields: ['客户信息','客户 ID','必填','非空','拦截','目的国=越南','-','-'] },
      { fields: ['线路信息','起运地/目的地','必填','非空','拦截','-','-','-'] },
      { fields: ['收件信息','收件人/电话/地址','必填','非空','拦截','-','-','-'] },
      { fields: ['货品信息','申报价值','范围','>品类均值×3','标黄确认','目的国=越南','80%','发票/箱单/HS Code/申报价值/收货人税号'] },
      { fields: ['地址解析','置信度','范围','<阈值→待确认','标黄确认','-','80%','-'] },
    ],
    ecCols: ['校验对象','字段名','校验类型','校验规则','不通过动作','适用条件','置信度阈值','清关资料必填项'],
    // ④ 服务商能力配置
    provider: [
      { fields: ['深圳揽收车队 A','揽收服务商','深圳全境','可用','API','API','王队 138-xxx','无','无'] },
      { fields: ['出口报关行 B','报关服务商','深圳口岸','可用','API','服务商回传','李经理 139-xxx','无','无'] },
      { fields: ['中越专线承运商 C','干线承运商','中国-越南','可用','API','API','赵调度 137-xxx','无','无'] },
      { fields: ['胡志明清关服务商 D','清关服务商','越南-胡志明','可用','邮件+电话','人工回传','张三 090-xxx→李四 091-xxx','无','胡志明市外环以外'] },
      { fields: ['越南末端服务商 E','末端配送商','越南-胡志明','可用','API','API','阮经理 092-xxx','无','胡志明市外环以外'] },
    ],
    pvCols: ['服务商名称','服务类型','覆盖国家/城市','可用状态','接单方式','回传方式','联系人/升级路径','禁运品类','偏远区域'],
    // ⑤ 通知策略配置
    notify: [
      { fields: ['KA','企业微信 + 邮件','P0/P1:人工确认 P2:可规则同步','4','赔付/责任方/保证/最晚送达/赔偿'] },
      { fields: ['普通','邮件','P0/P1:人工确认 P2:可规则同步','8','赔付/责任方/保证/最晚送达/赔偿'] },
    ],
    ntCols: ['客户等级','默认渠道','异常等级→同步策略','更新间隔(h)','风险词库'],
    // ⑥ 费用规则配置
    fee: [
      { fields: ['深圳→胡志明/标准专线','按重量','980 CNY','2,800,000 VND','合同汇率','补资料费/查验费/仓储费/滞港费','3','30 CNY'] },
    ],
    feCols: ['线路+服务产品','计费方式','客户报价(原币)','服务商结算价(原币)','汇率来源','异常费用类型','仓储免费期(天)','超期费率(/天)'],
  },
};

// 全局状态（用于交互记忆）
const STATE = {
  currentPage: 'access-center',
  detailTab: 'overview',
  aiModuleStatus: { attribution: 'pending', sop: 'pending', message: 'pending', cost: 'pending' },
  aiGenerated: false,
};
