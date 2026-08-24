export const profile = {
  name: '崔琪',
  englishName: 'QI CUI',
  school: 'Imperial College London',
  schoolZh: '帝国理工学院',
  faculty: '地球科学与工程学院',
  degree: '地球科学 · 本硕连读',
  period: '2022.10 — 2026.06',
  email: 'cq030317@gmail.com',
  phone: '185-1913-1780',
  phoneHref: '18519131780',
  intro:
    '帝国理工学院地球科学本硕背景，具备碳治理、生态监测与资源行业研究经历。擅长围绕复杂议题完成问题拆解、事实调研、分析诊断与结构化方案，并将 GIS、数据处理与跨部门沟通带入真实业务。',
  facts: [
    { value: 'TOP 5%', label: '系排名' },
    { value: '7.5', label: 'IELTS' },
    { value: 'EN / CN', label: '工作语言' },
  ],
}

export const projects = [
  {
    id: 'inner-mongolia-mining',
    kind: 'Internship',
    title: '绿色转型与矿产资源业务研究',
    organization: '中国内蒙古矿业有限公司',
    role: '管培生',
    period: '2026.06 — 至今',
    summary:
      '围绕绿色转型与矿产资源收入平衡的业务需求，梳理全国矿床技术报告，参与搭建行业新技术动向工作流程，并向 CEO 进行结构化管理汇报。',
    metrics: ['36 份矿床技术报告', '2 次 CEO 管理汇报'],
    tags: ['绿色转型', '资源行业', '团队协作'],
    image: '/media/work-mining.jpg',
  },
  {
    id: 'battery-carbon',
    kind: 'Consulting',
    title: '动力电池企业碳治理与减排路径研究',
    organization: 'PwC',
    role: 'ESG 咨询实习生',
    period: '2025.02 — 2025.04',
    summary:
      '围绕头部动力电池企业碳治理，拆解 ISO 14064 核算与核查要求，搭建五层治理架构、四级数据质控，并形成覆盖短、中、长期的减排路线。',
    metrics: ['7 项核心交付', '5 类问题诊断', '5 维措施评估'],
    tags: ['ISO 14064', '碳治理', '减排路径'],
    image: '/media/work-carbon.jpg',
  },
  {
    id: 'wangju-capital',
    kind: 'Internship',
    title: '食品供应链与行业战略分析',
    organization: '中国网聚资本有限公司',
    role: '行业战略分析实习生',
    period: '2024.07 — 2024.09',
    summary:
      '研究食品及餐饮供应链市场，完成牛羊肉趋势专题与冷链物流全链条研究；参与芒果 TV 助农项目策略及合作企业对接。',
    metrics: ['50+ 家合作企业触达', '32 家需求企业对接', '15 位嘉宾协同'],
    tags: ['行业研究', '供应链', '商务协同'],
    image: '/media/work-supply-chain.jpg',
    carouselLabel: '网聚资本实习照片',
    images: [
      { image: '/media/wangju-industrial-park.jpg', alt: '双汇第一工业园实地调研' },
      { image: '/media/wangju-industry-visit.jpg', alt: '湖南广电食品饮料行业共创会参访' },
      { image: '/media/wangju-market-analysis.jpg', alt: '中式糕点市场数据分析分享现场' },
    ],
  },
  {
    id: 'xiahe',
    kind: 'Research',
    title: '夏河地区矿产资源可持续发展调研',
    organization: '地科院',
    role: '研究组长',
    period: '2025.03 — 2025.04',
    summary:
      '围绕矿产资源可持续开发，牵头搭建地区可持续发展模型，处理空间数据底稿，识别成矿构造带，并完成资源开发影响与可持续性评估。',
    metrics: ['900+ km² 空间数据', '3 条成矿构造带'],
    tags: ['GIS', '空间数据', '可持续评估'],
    image: '/media/work-xiahe.jpg',
    carouselLabel: '夏河项目调研照片',
    images: [
      {
        image: '/media/xiahe-spatial-data.jpg',
        alt: '夏河项目地球化学空间数据处理',
        position: 'center 40%',
      },
      {
        image: '/media/xiahe-field-site.jpg',
        alt: '夏河地区野外调查与采样现场',
        position: 'center 54%',
      },
    ],
  },
  {
    id: 'sanjiangyuan',
    kind: 'Research',
    title: '三江源生态调查与评估',
    organization: '中国科学院',
    role: '研究员',
    period: '2023.07',
    summary:
      '参与高原草甸调查与可视化数据处理，梳理国家公园环境治理、生物多样性保护和气候监测政策，将遥感数据与生态保护目标关联。',
    metrics: ['约 30 km² 调查', '1 亿+ 可视化数据'],
    tags: ['遥感', '生态监测', '政策研究'],
    image: '/media/work-sanjiangyuan.jpg',
  },
]

export const strengths = [
  {
    number: '01',
    title: '复杂议题拆解',
    description: '将碳治理研究拆分为 7 项核心交付，并持续维护 8 个版本文件。',
  },
  {
    number: '02',
    title: 'ESG 与碳治理',
    description: '把 ISO 14064 要求转化为治理职责、数据质控流程与减排路线。',
  },
  {
    number: '03',
    title: 'GIS 与空间数据',
    description: '在矿产与生态项目中连接空间底稿、遥感数据和可持续评估。',
  },
  {
    number: '04',
    title: '协作与推进',
    description: '具备团队管理、跨部门沟通、业务研究与结构化汇报经验。',
  },
]
