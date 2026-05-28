#!/usr/bin/env node
/**
 * 种子数据脚本 — 灌入模拟新闻数据供本地测试
 * 用法: node scripts/seed-data.js
 */
import { getDb, initSchema, closeDb, saveDb, queryAll, queryOne, run as dbRun } from '../server/db/index.js';
import config from '../server/config.js';

const MOCK_NEWS = [
  {
    title: '软通动力发布2026年一季度财报：营收同比增长23%',
    summary: '软通动力信息技术（集团）股份有限公司发布2026年第一季度财务报告。报告显示，公司一季度实现营业收入68.5亿元，同比增长23.2%；净利润5.8亿元，同比增长18.6%。AI相关业务收入占比首次突破30%，成为公司增长的核心引擎。',
    content: '<p>软通动力信息技术（集团）股份有限公司（以下简称"软通动力"）今日发布2026年第一季度财务报告。报告显示，公司一季度实现营业收入68.5亿元，同比增长23.2%；归属于上市公司股东的净利润5.8亿元，同比增长18.6%。</p><p>值得关注的是，公司AI相关业务收入达到20.6亿元，占总营收的30.1%，首次突破30%大关。公司CEO表示："AI已经从概念验证阶段进入全面落地阶段，我们在金融、制造、能源等多个行业的AI解决方案获得了客户的广泛认可。"</p><p>展望全年，公司维持此前给出的营收增长20%-25%的指引，并预计AI业务占比将在年底达到35%。</p>',
    category: '财报业绩',
    source: 'finance.sina.com.cn',
    sourceUrl: 'https://finance.sina.com.cn/2026/05/softstone-q1-2026',
    publishDate: '2026-05-20',
    tags: ['财报', '营收增长', 'AI业务'],
    keyEntities: { companies: ['软通动力'], numbers: ['68.5亿', '23.2%', '5.8亿', '30.1%'] },
    sentiment: 'positive',
  },
  {
    title: '软通动力与华为签署全面深化战略合作协议',
    summary: '软通动力与华为在深圳签署全面深化战略合作协议，双方将在云计算、AI大模型、数字能源等领域展开深度合作，共同打造行业数字化转型解决方案。预计未来三年合作规模将超50亿元。',
    content: '<p>5月15日，软通动力与华为技术有限公司在深圳华为总部签署全面深化战略合作协议。根据协议，双方将在云计算、AI大模型、数字能源、智慧城市等领域展开深度合作。</p><p>软通动力董事长表示："华为是我们最重要的战略合作伙伴之一，此次全面深化合作标志着双方关系进入新阶段。我们将充分结合华为的技术平台优势和软通动力的行业交付能力，为客户创造更大价值。"</p><p>据悉，双方将共建联合创新实验室，聚焦AI大模型在金融、制造、能源等垂直行业的应用落地。预计未来三年合作规模将超过50亿元。</p>',
    category: '合作签约',
    source: 'news.cnstock.com',
    sourceUrl: 'https://news.cnstock.com/2026/05/softstone-huawei-deal',
    publishDate: '2026-05-15',
    tags: ['华为', '战略合作', '云计算', 'AI大模型'],
    keyEntities: { companies: ['软通动力', '华为'], numbers: ['50亿'] },
    sentiment: 'positive',
  },
  {
    title: '软通动力自研AI代码助手CodePilot 3.0正式发布',
    summary: '软通动力发布自研AI代码助手CodePilot 3.0版本，新增多模态理解、智能测试生成和代码安全审计三大核心能力，内部数据显示开发效率提升40%以上。',
    content: '<p>软通动力今日正式发布自研AI代码助手CodePilot 3.0版本。新版本在原有代码补全和生成的基础上，新增了三大核心能力：多模态理解（支持从设计稿直接生成前端代码）、智能测试生成（自动生成单元测试和集成测试）以及代码安全审计（实时检测OWASP Top 10安全漏洞）。</p><p>据软通动力CTO介绍，CodePilot 3.0已在公司内部全面部署使用，覆盖超过3万名开发人员。内部数据显示，使用CodePilot 3.0后，代码编写效率平均提升42%，测试覆盖率平均提升28%，安全漏洞发现率提升35%。</p><p>CodePilot 3.0将面向企业客户开放订阅，定价为每席位每月299元。</p>',
    category: '产品发布',
    source: '36kr.com',
    sourceUrl: 'https://36kr.com/p/softstone-codepilot-3',
    publishDate: '2026-05-18',
    tags: ['AI代码助手', 'CodePilot', '产品发布'],
    keyEntities: { companies: ['软通动力'], products: ['CodePilot 3.0'], numbers: ['42%', '28%', '35%', '299元'] },
    sentiment: 'positive',
  },
  {
    title: '软通动力入选Gartner全球IT服务魔力象限',
    summary: '国际权威研究机构Gartner发布2026年全球IT服务魔力象限报告，软通动力首次入选并获评"远见者"。这是中国IT服务企业首次在该报告中获得此定位，标志着中国IT服务行业的国际影响力持续提升。',
    content: '<p>国际权威研究机构Gartner发布2026年全球IT服务魔力象限报告，软通动力首次入选并获评"远见者"（Visionaries）象限。报告指出，软通动力在AI工程化、数字化转型和行业解决方案方面展现出强劲的创新能力。</p><p>这是中国IT服务企业首次在该报告中获得"远见者"定位。Gartner分析师认为，软通动力在AI与传统IT服务融合方面的实践具有全球参考价值。</p><p>软通动力表示，将持续加大研发投入，目标在三年内进入"挑战者"象限。</p>',
    category: '公司动态',
    source: 'www.gartner.com',
    sourceUrl: 'https://www.gartner.com/mq/it-services-2026',
    publishDate: '2026-05-10',
    tags: ['Gartner', '魔力象限', '国际认可'],
    keyEntities: { companies: ['软通动力', 'Gartner'] },
    sentiment: 'positive',
  },
  {
    title: '软通动力中标某国有大行AI风控平台项目 合同金额超3亿',
    summary: '软通动力成功中标某国有大型银行AI风控平台建设项目，合同金额超过3亿元。项目将基于大模型技术构建新一代智能风控体系，预计2027年上线运行。',
    content: '<p>近日，软通动力成功中标某国有大型银行AI风控平台建设项目，合同金额超过3亿元人民币。这是迄今为止国内银行业最大的AI风控单体项目之一。</p><p>据了解，该项目将基于大语言模型和图神经网络技术，构建覆盖信用风险、市场风险、操作风险的一体化智能风控平台。平台将实现实时风险监测、智能预警和自动化风险报告等功能。</p><p>项目预计2027年第一季度上线运行，届时将覆盖该银行全国超过2万个网点。</p>',
    category: '合作签约',
    source: 'www.financialnews.com.cn',
    sourceUrl: 'https://www.financialnews.com.cn/softstone-bank-risk',
    publishDate: '2026-05-08',
    tags: ['金融', 'AI风控', '银行', '大模型'],
    keyEntities: { companies: ['软通动力'], numbers: ['3亿', '2万个网点'] },
    sentiment: 'positive',
  },
  {
    title: '软通动力开源AI Agent框架Thunder 获GitHub万星',
    summary: '软通动力正式开源其AI Agent开发框架Thunder，该框架支持多Agent协作、工具调用和知识检索增强。开源仅两周即获GitHub超10000颗Star，成为国内最受关注的AI开源项目之一。',
    content: '<p>软通动力今日宣布正式开源其内部使用的AI Agent开发框架——Thunder。该框架经过公司内部超过一年的打磨，已在多个金融、制造客户项目中得到验证。</p><p>Thunder框架的核心特性包括：支持多Agent协作编排、灵活的工具调用机制、内置RAG（检索增强生成）管道、以及可视化的Agent工作流编辑器。框架同时支持OpenAI、Claude等主流LLM提供商。</p><p>开源仅两周，Thunder即在GitHub获得超过10000颗Star，成为2026年国内增长最快的AI开源项目。社区贡献者已超过200人，提交了超过50个PR。</p><p>软通动力表示，将以Thunder为核心构建AI Agent生态，计划在未来半年内推出Agent市场。</p>',
    category: '技术创新',
    source: 'github.com',
    sourceUrl: 'https://github.com/softstone/thunder',
    publishDate: '2026-05-22',
    tags: ['开源', 'AI Agent', 'Thunder', 'GitHub'],
    keyEntities: { companies: ['软通动力'], products: ['Thunder'], numbers: ['10000', '200人', '50个PR'] },
    sentiment: 'positive',
  },
  {
    title: '软通动力数字能源业务再下一城 助力国家电网智能化升级',
    summary: '软通动力与国家电网签署数字化升级项目合同，将利用数字孪生和AI技术对变电站进行智能化改造，项目覆盖华东地区50座变电站，预计每年可减少碳排放1.2万吨。',
    content: '<p>软通动力与国家电网有限公司签署数字化升级项目合同。根据合同，软通动力将利用数字孪生、物联网和AI技术，对华东地区50座110kV及以上变电站进行智能化改造。</p><p>项目将部署软通动力自研的变电站智能运维平台，实现设备状态实时监测、故障预测预警和运维决策自动化。预计项目完成后，变电站运维效率将提升30%，每年可减少碳排放约1.2万吨。</p><p>这是软通动力数字能源业务板块今年的第三个大型项目，累计合同金额超过8亿元。</p>',
    category: '生态合作',
    source: 'www.bjx.com.cn',
    sourceUrl: 'https://www.bjx.com.cn/softstone-state-grid',
    publishDate: '2026-05-12',
    tags: ['数字能源', '国家电网', '数字孪生', '碳中和'],
    keyEntities: { companies: ['软通动力', '国家电网'], numbers: ['50座', '1.2万吨', '30%', '8亿'] },
    sentiment: 'positive',
  },
  {
    title: '软通动力2026届校园招聘启动 计划招募3000+技术人才',
    summary: '软通动力正式启动2026届校园招聘，计划面向国内外顶尖高校招募超过3000名技术人才，重点面向AI、云计算、大数据方向，新增"AI新星计划"专项培养通道。',
    content: '<p>软通动力正式启动2026届校园招聘活动。今年计划面向国内外顶尖高校招募超过3000名技术人才，招聘规模较去年增长20%。</p><p>此次校招重点面向人工智能、云计算、大数据、物联网等方向，覆盖研发工程师、算法工程师、解决方案架构师等核心岗位。值得一提的是，今年新增"AI新星计划"专项培养通道，面向具有大模型研究和应用经验的优秀毕业生，提供专属导师和快速晋升通道。</p><p>软通动力HR负责人表示，公司为应届毕业生提供行业竞争力的薪酬待遇，技术岗位起薪区间为25万-50万元，AI方向优秀候选人可获得更高薪酬。</p>',
    category: '人才招聘',
    source: 'www.zhaopin.com',
    sourceUrl: 'https://www.zhaopin.com/softstone-campus-2026',
    publishDate: '2026-05-05',
    tags: ['校园招聘', '技术人才', 'AI新星'],
    keyEntities: { companies: ['软通动力'], numbers: ['3000+', '20%', '25万-50万'] },
    sentiment: 'positive',
  },
  {
    title: 'IDC报告：中国AI解决方案市场软通动力排名前三',
    summary: 'IDC发布《中国AI解决方案市场2026年跟踪报告》，软通动力以8.7%的市场份额排名第三，较去年提升两个位次。报告指出，软通动力在金融和制造行业的AI渗透率显著领先。',
    content: '<p>国际数据公司（IDC）发布《中国AI解决方案市场2026年跟踪报告》。报告显示，2025年中国AI解决方案市场规模达到1520亿元，同比增长31.5%。其中，软通动力以8.7%的市场份额排名第三，较去年的第五位提升两个位次。</p><p>IDC分析师指出，软通动力的排名提升主要得益于两个因素：一是其在金融行业的AI解决方案渗透率达到28%，位居行业第一；二是其在制造业的AI质检和预测性维护方案获得了多个大型客户的复购。</p><p>报告预测，2026年中国AI解决方案市场将突破2000亿元，软通动力有望进一步扩大市场份额。</p>',
    category: '行业报告',
    source: 'www.idc.com',
    sourceUrl: 'https://www.idc.com/china-ai-solutions-2026',
    publishDate: '2026-05-16',
    tags: ['IDC', '市场份额', 'AI解决方案'],
    keyEntities: { companies: ['软通动力', 'IDC'], numbers: ['8.7%', '1520亿', '31.5%', '28%'] },
    sentiment: 'positive',
  },
  {
    title: '软通动力智能工厂解决方案落地长三角 助力制造业升级',
    summary: '软通动力智能工厂解决方案在长三角地区成功落地10个项目，涵盖汽车零部件、电子制造、食品加工等行业，平均帮助客户提升生产效率22%，降低不良品率15%。',
    content: '<p>软通动力宣布其智能工厂解决方案在长三角地区已成功落地10个标杆项目，涵盖汽车零部件、电子制造、食品加工等多个制造业细分领域。</p><p>该方案基于工业互联网平台和AI视觉检测技术，实现了生产过程的全面数字化和智能化。据已交付项目的数据统计，平均帮助客户提升生产效率22%，降低不良品率15%，缩短交付周期18%。</p><p>软通动力制造业业务负责人表示："长三角是中国制造业的核心区域，我们将继续深耕，目标在2026年底前再落地20个智能工厂项目。"</p>',
    category: '产品发布',
    source: 'www.caixin.com',
    sourceUrl: 'https://www.caixin.com/softstone-smart-factory',
    publishDate: '2026-05-09',
    tags: ['智能工厂', '制造业', '长三角', '工业互联网'],
    keyEntities: { companies: ['软通动力'], numbers: ['10个', '22%', '15%', '18%', '20个'] },
    sentiment: 'positive',
  },
  {
    title: '软通动力CTO：大模型正在重新定义软件工程',
    summary: '软通动力CTO在2026全球软件工程师大会上发表主题演讲，指出大模型正在从代码辅助工具演变为软件工程的核心基础设施，未来3年内80%的常规编码工作将由AI完成。',
    content: '<p>在2026全球软件工程师大会上，软通动力CTO发表了题为"大模型时代：软件工程的范式转移"的主题演讲。</p><p>他指出，大模型正在经历从"工具"到"基础设施"的转变。第一阶段是代码补全，第二阶段是代码生成，第三阶段（当前）是AI驱动的端到端软件工程，包括需求分析、架构设计、编码、测试、部署全流程。</p><p>他预测，未来3年内80%的常规编码工作将由AI完成，但软件工程师的核心价值将转向系统设计、架构决策和创新思维。"AI不会取代程序员，但会用AI的程序员会取代不会用的。"</p>',
    category: '公司动态',
    source: 'www.infoq.cn',
    sourceUrl: 'https://www.infoq.cn/softstone-cto-speech',
    publishDate: '2026-05-25',
    tags: ['大模型', '软件工程', '技术大会'],
    keyEntities: { companies: ['软通动力'], numbers: ['80%', '3年'] },
    sentiment: 'neutral',
  },
  {
    title: '软通动力与清华大学成立AI联合实验室',
    summary: '软通动力与清华大学计算机科学与技术系签署合作协议，成立"AI与软件工程联合实验室"，聚焦大模型在软件工程领域的应用研究，首期投入5000万元。',
    content: '<p>软通动力与清华大学计算机科学与技术系正式签署合作协议，联合成立"AI与软件工程联合实验室"。实验室将聚焦大模型在代码理解、自动化测试、软件架构优化等方向的应用研究。</p><p>联合实验室首期投入5000万元，由清华大学教授担任学术主任，软通动力技术副总裁担任企业主任。实验室计划每年培养不少于30名硕士和博士研究生。</p><p>软通动力表示，这是公司产学研战略的重要组成部分，未来还将与更多顶尖高校建立合作关系。</p>',
    category: '生态合作',
    source: 'news.tsinghua.edu.cn',
    sourceUrl: 'https://news.tsinghua.edu.cn/softstone-ai-lab',
    publishDate: '2026-05-03',
    tags: ['清华大学', '联合实验室', '产学研'],
    keyEntities: { companies: ['软通动力', '清华大学'], numbers: ['5000万', '30名'] },
    sentiment: 'positive',
  },
  {
    title: '软通动力发布《2026企业AI成熟度白皮书》',
    summary: '软通动力发布《2026企业AI成熟度白皮书》，调研覆盖500家大型企业。结果显示仅12%的企业达到AI成熟阶段，金融行业领先，制造业追赶势头强劲。白皮书提出了企业AI成熟度五阶段模型。',
    content: '<p>软通动力在2026数字中国峰会上发布《2026企业AI成熟度白皮书》。白皮书调研覆盖500家年收入超过50亿元的大型企业，从AI战略、数据基础、技术能力、组织能力和业务价值五个维度进行评估。</p><p>调研结果显示，仅12%的企业达到了"AI驱动"的成熟阶段，38%处于"AI实验"阶段，50%仍处于"AI认知"或"AI准备"阶段。分行业看，金融行业AI成熟度最高，42%的金融机构达到成熟阶段；制造业追赶势头强劲，AI成熟企业占比从去年的5%提升到15%。</p><p>白皮书首次提出了"企业AI成熟度五阶段模型"：认知→准备→实验→规模化→驱动，为企业提供了清晰的AI转型路径图。</p>',
    category: '行业报告',
    source: 'www.softstone.com',
    sourceUrl: 'https://www.softstone.com/ai-maturity-whitepaper-2026',
    publishDate: '2026-05-13',
    tags: ['白皮书', 'AI成熟度', '数字中国'],
    keyEntities: { companies: ['软通动力'], numbers: ['500家', '12%', '38%', '50%', '42%', '5%', '15%'] },
    sentiment: 'neutral',
  },
  {
    title: '软通动力通过CMMI 3.0最高等级认证',
    summary: '软通动力成功通过CMMI 3.0 V2.0 ML5级认证，成为国内首批获得该认证的IT服务企业。CMMI 3.0是国际公认的软件过程改进和能力评估标准的最新版本。',
    content: '<p>软通动力宣布已成功通过CMMI 3.0 V2.0 ML5（成熟度5级）认证评估，成为国内首批获得该最新版本最高等级认证的IT服务企业。</p><p>CMMI（能力成熟度模型集成）是国际公认的软件过程改进和能力评估标准。CMMI 3.0版本于2025年发布，在原有基础上增加了数据管理、安全工程和人工智能应用等新领域。</p><p>软通动力质量管理部门负责人表示："ML5认证是对我们持续改进文化的最高认可。它证明我们不仅能交付高质量的软件，还能通过数据驱动的方式持续优化我们的交付过程。"</p>',
    category: '公司动态',
    source: 'www.softstone.com',
    sourceUrl: 'https://www.softstone.com/cmmi3-ml5-certified',
    publishDate: '2026-05-07',
    tags: ['CMMI', 'ML5', '质量认证'],
    keyEntities: { companies: ['软通动力'], products: ['CMMI 3.0'] },
    sentiment: 'positive',
  },
  {
    title: '软通动力云原生平台通过等保三级测评',
    summary: '软通动力自研云原生平台iTalentCloud通过公安部等保三级测评，安全能力达到金融级标准。平台已在多个银行、保险客户的生产环境中稳定运行。',
    content: '<p>软通动力自研的云原生平台iTalentCloud成功通过公安部信息安全等级保护三级测评。等保三级是国家对非银行金融机构最高级别的安全认证要求。</p><p>该平台在物理安全、网络安全、主机安全、应用安全、数据安全五个维度均达到金融级标准。特别在数据安全方面，实现了全链路加密、细粒度访问控制和数据脱敏等高级安全能力。</p><p>目前，iTalentCloud已在多个银行、保险和证券客户的生产环境中稳定运行，累计承载业务系统超过200个，日均交易处理量超过5000万笔。</p>',
    category: '技术创新',
    source: 'www.csa.cn',
    sourceUrl: 'https://www.csa.cn/softstone-cloud-security',
    publishDate: '2026-04-28',
    tags: ['云原生', '等保三级', '信息安全', 'iTalentCloud'],
    keyEntities: { companies: ['软通动力'], products: ['iTalentCloud'], numbers: ['200个', '5000万笔'] },
    sentiment: 'positive',
  },
  {
    title: '软通动力东南亚业务布局提速 雅加达研发中心启用',
    summary: '软通动力印尼雅加达研发中心正式启用，这是公司在东南亚设立的第3个交付中心。中心初期规模200人，将服务于印尼及东南亚市场的数字化转型项目。',
    content: '<p>软通动力宣布其位于印尼雅加达的研发中心正式启用，这是继新加坡和曼谷之后，软通动力在东南亚设立的第三个交付中心。</p><p>雅加达研发中心初期规模200人，主要服务印尼及东南亚市场的数字化转型项目，重点聚焦金融科技、电子商务和智能制造领域。中心配备了先进的开发环境和AI实验室。</p><p>软通动力国际业务负责人表示："东南亚是我们国际化战略的重点区域。到2026年底，我们计划在东南亚实现1000人的交付能力，服务当地客户和中国出海企业。"</p>',
    category: '公司动态',
    source: 'www.softstone.com',
    sourceUrl: 'https://www.softstone.com/jakarta-rd-center',
    publishDate: '2026-05-01',
    tags: ['东南亚', '国际化', '雅加达', '研发中心'],
    keyEntities: { companies: ['软通动力'], places: ['雅加达', '新加坡', '曼谷'], numbers: ['200人', '1000人'] },
    sentiment: 'positive',
  },
  {
    title: '软通动力携手一汽解放 打造智能网联汽车软件平台',
    summary: '软通动力与一汽解放签署战略合作协议，共同打造智能网联汽车软件平台，覆盖自动驾驶、车联网和智能座舱三大领域，项目首期投入2亿元。',
    content: '<p>软通动力与一汽解放汽车有限公司签署战略合作协议，双方将共同打造面向商用车领域的智能网联汽车软件平台。</p><p>该平台将覆盖三大核心领域：L2+级自动驾驶辅助系统、车联网数据平台和智能座舱系统。软通动力将提供从软件架构设计、算法开发到系统集成测试的全栈能力。</p><p>项目首期投入2亿元，预计2027年第二季度完成平台首个版本的交付。双方还计划成立联合创新中心，持续进行技术迭代和产品升级。</p>',
    category: '合作签约',
    source: 'www.autohome.com.cn',
    sourceUrl: 'https://www.autohome.com.cn/softstone-faw-jiefang',
    publishDate: '2026-04-30',
    tags: ['智能网联', '一汽解放', '自动驾驶', '车联网'],
    keyEntities: { companies: ['软通动力', '一汽解放'], numbers: ['2亿'] },
    sentiment: 'positive',
  },
  {
    title: '软通动力获评"2026中国最佳雇主品牌" 员工满意度创新高',
    summary: '软通动力在智联招聘"2026中国年度最佳雇主"评选中获评"最佳雇主品牌"奖。公司员工满意度调查结果显示，整体满意度达到4.3分（5分制），创历史新高。',
    content: '<p>在智联招聘主办的"2026中国年度最佳雇主"评选中，软通动力凭借卓越的人才培养体系和企业文化，获评"最佳雇主品牌"奖项。</p><p>据软通动力内部最新员工满意度调查结果显示，公司整体满意度达到4.3分（5分制），较去年提升0.2分，创历史新高。其中，"学习成长机会"和"工作生活平衡"两个维度的满意度提升最为显著。</p><p>软通动力人力资源副总裁表示："我们始终将人才视为公司最重要的资产。2025年我们投入了超过2亿元用于员工培训和发展，推出了灵活办公制度和心理健康支持计划。这些举措的成效正在显现。"</p>',
    category: '人才招聘',
    source: 'www.zhaopin.com',
    sourceUrl: 'https://www.zhaopin.com/best-employer-2026-softstone',
    publishDate: '2026-05-19',
    tags: ['最佳雇主', '员工满意度', '人才培养'],
    keyEntities: { companies: ['软通动力'], numbers: ['4.3分', '2亿元'] },
    sentiment: 'positive',
  },
  {
    title: '软通动力推出AI驱动的ESG报告自动生成平台',
    summary: '软通动力推出ESG报告自动生成平台，利用大模型和知识图谱技术，可自动采集、分析和生成符合国际标准的ESG报告，将报告编制周期从3个月缩短至2周。',
    content: '<p>软通动力推出AI驱动的ESG报告自动生成平台——ESG-AutoReporter。该平台利用大语言模型和知识图谱技术，能够自动从企业内部系统采集环境、社会和治理数据，并按照GRI、TCFD等国际标准生成ESG报告。</p><p>据首批使用该平台的客户反馈，ESG报告编制周期从传统的3个月缩短至2周，报告质量也得到了审计机构的认可。</p><p>软通动力表示，ESG-AutoReporter目前已服务超过20家上市公司，预计到2026年底将覆盖100家企业。</p>',
    category: '产品发布',
    source: 'www.cs.com.cn',
    sourceUrl: 'https://www.cs.com.cn/softstone-esg-platform',
    publishDate: '2026-05-11',
    tags: ['ESG', '大模型', '知识图谱', '自动报告'],
    keyEntities: { companies: ['软通动力'], products: ['ESG-AutoReporter'], numbers: ['3个月', '2周', '20家', '100家'] },
    sentiment: 'positive',
  },
  {
    title: '软通动力与南方电网共建新型电力系统AI调度平台',
    summary: '软通动力联合南方电网电网调度中心，共同研发基于AI的新一代电力调度平台。平台采用强化学习算法优化电力调度决策，已在广东区域试运行，调度效率提升15%。',
    content: '<p>软通动力联合南方电网电网调度中心，共同研发基于人工智能技术的新一代电力调度平台。该平台采用深度强化学习算法，能够实时分析电力负荷、新能源发电量和电网状态，自动生成最优调度方案。</p><p>平台已在广东区域试运行三个月，统计数据显示调度效率提升15%，新能源弃电率降低8%，电网运行可靠性达到99.99%。</p><p>双方计划在2026年下半年将平台推广至南方电网五省区域，届时将成为全球最大规模的AI电力调度系统。</p>',
    category: '技术创新',
    source: 'www.bjx.com.cn',
    sourceUrl: 'https://www.bjx.com.cn/softstone-csg-ai-dispatch',
    publishDate: '2026-05-14',
    tags: ['电力调度', '强化学习', '南方电网', '新型电力系统'],
    keyEntities: { companies: ['软通动力', '南方电网'], numbers: ['15%', '8%', '99.99%'] },
    sentiment: 'positive',
  },
  {
    title: '软通动力2025年度社会责任报告发布',
    summary: '软通动力发布2025年度社会责任报告，全年社会公益投入超过8000万元，员工志愿服务时长超过10万小时，荣获联合国全球契约组织"可持续发展先锋企业"称号。',
    content: '<p>软通动力正式发布《2025年度社会责任报告》。报告显示，公司全年社会公益投入超过8000万元，覆盖教育帮扶、数字鸿沟消除、科技扶贫等多个领域。</p><p>在员工志愿服务方面，全年累计志愿服务时长超过10万小时，同比增长45%。公司推出的"编程进校园"公益项目已覆盖全国300所中小学，惠及学生超过20万人。</p><p>此外，软通动力因在可持续发展方面的突出表现，荣获联合国全球契约组织"可持续发展先锋企业"称号，是国内唯一获此殊荣的IT服务企业。</p>',
    category: '公司动态',
    source: 'www.softstone.com',
    sourceUrl: 'https://www.softstone.com/csr-report-2025',
    publishDate: '2026-04-25',
    tags: ['社会责任', 'CSR', '公益', '可持续发展'],
    keyEntities: { companies: ['软通动力'], numbers: ['8000万', '10万小时', '300所', '20万人'] },
    sentiment: 'positive',
  },
  {
    title: '软通动力出席博鳌亚洲论坛 分享数字经济经验',
    summary: '软通动力高级副总裁出席2026年博鳌亚洲论坛"数字经济新范式"分论坛，分享了中国企业在数字化转型中的实践经验，提出"AI+行业"双轮驱动模型。',
    content: '<p>在2026年博鳌亚洲论坛"数字经济新范式"分论坛上，软通动力高级副总裁作为企业代表发表演讲，分享了软通动力在推动各行业数字化转型中的实践经验。</p><p>他提出了"AI+行业"双轮驱动模型：一方面，通用AI能力作为底座，持续进化；另一方面，行业知识作为飞轮，让AI解决方案越用越精准。这一模型已在金融、能源、制造等多个行业得到验证。</p><p>论坛期间，软通动力还与来自东盟国家的多位企业领袖进行了双边会谈，探讨了在东南亚市场开展数字化合作的机遇。</p>',
    category: '公司动态',
    source: 'www.boaoforum.org',
    sourceUrl: 'https://www.boaoforum.org/2026/digital-economy-session',
    publishDate: '2026-04-20',
    tags: ['博鳌论坛', '数字经济', 'AI+行业'],
    keyEntities: { companies: ['软通动力'], places: ['博鳌'] },
    sentiment: 'neutral',
  },
  {
    title: '软通动力助力某头部车企打造AI智能客服系统',
    summary: '软通动力为某头部新能源汽车企业打造AI智能客服系统，基于多轮对话和大模型技术，实现95%的常见问题自动解答，客户满意度提升至92%。',
    content: '<p>软通动力成功为某头部新能源汽车企业交付AI智能客服系统。该系统基于大语言模型和多轮对话技术，能够理解客户关于车辆使用、保养、故障排查等方面的复杂问题，并提供准确、个性化的解答。</p><p>系统上线运行三个月的数据显示：95%的常见问题可由AI自动解答，仅5%的复杂问题需转人工处理；客户满意度从原来的78%提升至92%；平均响应时间从45秒缩短至2秒。</p><p>该项目还获得了"2026中国AI应用创新奖"。</p>',
    category: '生态合作',
    source: 'www.autohome.com.cn',
    sourceUrl: 'https://www.autohome.com.cn/softstone-ai-customer-service',
    publishDate: '2026-05-06',
    tags: ['智能客服', '新能源汽车', '大模型'],
    keyEntities: { companies: ['软通动力'], numbers: ['95%', '5%', '78%', '92%', '45秒', '2秒'] },
    sentiment: 'positive',
  },
];

async function main() {
  console.log('[Seed] Initializing database...');
  const db = await getDb(config.db.path);
  initSchema(db);

  // 清空现有数据
  console.log('[Seed] Clearing existing news data...');
  db.run('DELETE FROM news');

  // 插入模拟数据
  console.log(`[Seed] Inserting ${MOCK_NEWS.length} mock news articles...`);
  let inserted = 0;

  for (const article of MOCK_NEWS) {
    try {
      db.run(
        `INSERT INTO news (title, summary, content, category, source, source_url, publish_date, cover_image, tags, key_entities, sentiment)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          article.title,
          article.summary,
          article.content,
          article.category,
          article.source,
          article.sourceUrl,
          article.publishDate,
          article.coverImage || null,
          JSON.stringify(article.tags),
          JSON.stringify(article.keyEntities),
          article.sentiment,
        ]
      );
      inserted++;
    } catch (err) {
      console.error(`[Seed] Failed to insert: ${article.title}`, err.message);
    }
  }

  // 保存数据库
  saveDb();
  console.log(`[Seed] Done. Inserted ${inserted}/${MOCK_NEWS.length} articles.`);

  // 验证
  const stats = queryAll("SELECT category, COUNT(*) as cnt FROM news GROUP BY category ORDER BY cnt DESC");
  console.log('\n[Seed] Category distribution:');
  for (const row of stats) {
    console.log(`  ${row.category}: ${row.cnt}`);
  }

  closeDb();
  process.exit(0);
}

main().catch(err => {
  console.error('[Seed] Fatal error:', err);
  closeDb();
  process.exit(1);
});
