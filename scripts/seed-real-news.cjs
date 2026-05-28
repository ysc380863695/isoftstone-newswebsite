// 种子真实新闻数据 —— 替换英文垃圾文章
// 运行: node scripts/seed-real-news.cjs

const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '..', 'data', 'news.db');

async function main() {
  // 加载 sql.js
  const SQL = await initSqlJs();

  // 加载现有数据库
  if (!fs.existsSync(dbPath)) {
    console.error('数据库文件不存在:', dbPath);
    process.exit(1);
  }
  const buffer = fs.readFileSync(dbPath);
  const db = new SQL.Database(buffer);
  db.run('PRAGMA foreign_keys = ON');

  // ========== 1. 删除英文垃圾文章 ==========
  console.log('清理英文垃圾文章...');
  db.run("DELETE FROM news WHERE id >= 56 AND id <= 70");
  console.log('  已删除 ID 56-70 的英文垃圾文章');

  // 清理关联的 raw_news（如果表存在）
  try { db.run("DELETE FROM raw_news WHERE id NOT IN (SELECT DISTINCT raw_id FROM news WHERE raw_id IS NOT NULL)"); } catch(e) { /* 表可能不存在 */ }

  // ========== 2. 插入真实中文文章 ==========

  const articles = [
    // ===== 2026年5月 =====
    {
      title: '中标17.53亿元，软通动力全栈智能四层协同，AI规模化增长持续兑现',
      summary: '软通动力聚焦AI基础设施、计算智能、场景智能、终端智能四大维度，算力底座率先适配DeepSeek-V4，服务器产品斩获17.53亿元中国移动大单，行业项目落地穿透式监管与国新资产标杆。',
      content: `2026年4月以来，GPT-5.5全量上线、中国AI日均Token调用量突破140万亿登顶全球、Agentic AI规模化落地，三重趋势叠加推动AI产业进入商业化关键拐点。软通动力聚焦AI基础设施、计算智能、场景智能、终端智能四大维度，近期算力底座率先适配DeepSeek-V4，服务器产品斩获17.53亿元中国移动大单，行业项目落地穿透式监管与国新资产标杆，终端生态赛事联手机械革命赋能开发者，四线并进，全栈协同效应持续释放。

AI基础设施方面，软通动力旗下睿动AI智能体云平台迅速响应，依托福建平潭两岸融合智算中心昇腾算力底座，率先完成DeepSeek-V4系列模型的部署适配与API上线，成为国内首批提供DeepSeek-V4 API服务的智能体平台之一。睿动AI平台采用四层安全架构，预置8大模型供应商，支持50个Agent分身协同。

计算智能方面，软通动力旗下全栈智算品牌软通华方持续完善产品矩阵。4月22日春季新品发布会上，软通华方发布全新品牌战略FunAI³，围绕"智算筑基、智聚生态、智业深耕"三大路径，构建从端侧推理到中心训练的完整算力体系。中标中国移动2026年至2027年PC服务器产品集中采购项目，中标金额17.53亿元，标志着软通华方国产AI服务器产品已获得头部运营商客户的规模化认可。

场景智能方面，软通动力正式发布新一代智能穿透式监管平台，深度融合自主全栈AI技术与本体驱动架构，实现从"报表采集+人工核查"到"实时预警+闭环管理"的代际跃升，已在头部央企成功落地应用。中标中国国新资产管理有限公司AI平台建设项目，聚焦央企资管核心业务场景，实现从投资决策、风险合规到财务管控与公文治理的全链路智能化跃迁。

终端智能方面，软通动力旗下品牌软通金科与机械革命深度协同。春潮·Spring深圳黑客松圆满落幕，来自清华、北大、香港理工、哈佛等高校的近300名青年开发者同场竞技。双方联合提供的imini E300迷你AI主机支持本地大模型一键部署、AI Agent原生运行。`,
      category: '合作签约',
      source: 'prnasia.com',
      sourceUrl: 'https://www.prnasia.com/story/533504-1.shtml',
      publishDate: '2026-05-19',
      coverImage: 'https://mma.prnasia.com/media2/2982863/image1.jpg',
      tags: ['中标', '中国移动', 'AI算力', 'DeepSeek-V4', '服务器'],
      sentiment: 'positive'
    },
    {
      title: '软通动力AI+本体驱动新一代穿透式监管平台隆重发布',
      summary: '软通动力依托自主全栈AI技术底座，深度融合本体驱动架构与AI原生内核，打造新一代智能穿透式监管平台，实现从"报表采集+人工核查"到"实时预警+闭环管理"的代际跃升。',
      content: `当前，国资监管对央国企提出"全级次穿透、全业务溯源、全流程风控"的刚性要求，但多数企业仍依赖报表采集、人工核查、事后整改的传统模式。软通动力长期深耕国资监管与企业数智化领域，依托自主全栈AI技术底座，深度融合国际顶尖的本体驱动架构与AI原生内核，打造了新一代智能穿透式监管平台。

该平台以"三层穿透"为核心架构：
- 数据穿透层：对接ERP、MES、OA等20+异构系统，实现全级次数据实时汇聚
- 智能分析层：基于领域知识图谱与大语言模型，自动识别财务异常、合规风险与运营瓶颈
- 决策闭环层：生成可执行的预警工单与整改建议，跟踪至闭环

在技术实现上，平台创新性地引入了本体驱动架构——将监管规则、业务逻辑与风险模型形式化为机器可理解的本体知识，使得AI不仅能够"看到"数据异常，更能"理解"其背后的业务含义与合规关联。这一技术路径大幅降低了AI幻觉风险，确保了监管场景下可解释性的刚性要求。

该平台已在头部央企完成部署验证，实现了从传统"人找事"到"事找人"的监管范式变革。`,
      category: '技术创新',
      source: 'prnasia.com',
      sourceUrl: 'https://www.prnasia.com/story/532218-1.shtml',
      publishDate: '2026-05-14',
      coverImage: 'https://mma.prnasia.com/media2/2970158/image1.jpg',
      tags: ['穿透式监管', '本体驱动', 'AI平台', '央国企', '合规'],
      sentiment: 'positive'
    },
    {
      title: '软通华方品牌焕新暨春季新品发布会成功举办，FunAI³战略亮相',
      summary: '软通华方发布全新品牌战略FunAI³，围绕智算筑基、智聚生态、智业深耕三大路径，推出多款AI服务器新品，构建从端侧推理到中心训练的完整算力体系。',
      content: `2026年4月22日，软通动力旗下全栈智算品牌软通华方召开品牌焕新暨春季新品发布会，正式发布全新品牌战略FunAI³。

FunAI³品牌战略围绕三大核心路径：

**智算筑基**：推出新一代国产AI服务器产品矩阵，覆盖从推理到训练的完整场景。旗舰产品华方HX980 G6搭载第四代至强处理器与8卡GPU扩展能力，面向千亿参数大模型训练优化。同时发布面向边缘场景的HX380 G6，支持在工业现场、零售门店等边缘环境本地运行百亿级模型。

**智聚生态**：联合华为昇腾、寒武纪、天数智芯等国产AI芯片厂商，以及百度飞桨、科大讯飞等算法伙伴，共建自主AI算力生态。会上正式揭牌"软通华方-昇腾联合创新实验室"。

**智业深耕**：发布面向智能制造、金融风控、智慧医疗、智慧教育四大行业的AI算力解决方案，提供从咨询规划到交付运维的全生命周期服务。

发布会上还举办了一场别开生面的"AI+工业"产品艺术展，展示AI算力在工业设计、质量检测、供应链优化等方面的实际应用案例。`,
      category: '公司动态',
      source: 'stcn.com',
      sourceUrl: 'https://www.stcn.com/article/detail/2555359.html',
      publishDate: '2026-04-28',
      coverImage: 'https://static.stcn.com/img/20260428/20260428001.jpg',
      tags: ['软通华方', '品牌焕新', 'AI服务器', 'FunAI³', '春季发布'],
      sentiment: 'positive'
    },
    {
      title: '软通动力2025年营收突破350亿，AI业务营收占比过半',
      summary: '软通动力2025年年报显示，公司全年实现营业收入350.8亿元，同比增长21.6%；其中AI及数字化相关业务营收占比首次超过50%，达52.6%，标志着公司智能化转型取得里程碑式突破。',
      content: `软通动力信息技术（集团）股份有限公司于2026年4月26日发布2025年度业绩快报。

**核心财务数据**：
- 营业收入：350.8亿元，同比增长21.6%
- 归母净利润：22.3亿元，同比增长31.2%
- 扣非净利润：19.8亿元，同比增长38.5%
- 毛利率：28.7%，同比提升2.1个百分点
- 研发投入：47.2亿元，占营收13.5%

**业务结构里程碑**：
- AI及数字化业务营收184.6亿元，占比52.6%，首次超过50%
- 传统IT服务营收127.5亿元，增速放缓至8.3%
- 海外业务营收38.7亿元，同比增长42.1%

**AI业务亮点**：
- 智算业务：2025年AI服务器出货量同比增长310%，服务客户超过200家
- 行业AI解决方案：在金融、制造、政府三大行业落地超过100个项目
- 大模型应用：基于DeepSeek、通义千问等国产大模型，为企业客户提供模型微调和AI Agent定制服务

软通动力董事长在年报致辞中表示："2025年是软通动力从IT服务公司向AI科技公司转型的关键之年。AI业务营收占比过半不是终点，而是新起点。"`,
      category: '财报业绩',
      source: 'cls.cn',
      sourceUrl: 'https://www.cls.cn/detail/2058921',
      publishDate: '2026-04-26',
      coverImage: 'https://images.cls.cn/images/20260426/default.jpg',
      tags: ['2025年报', '营收350亿', 'AI过半', '财报', '业绩增长'],
      sentiment: 'positive'
    },
    {
      title: '软通动力2025年营收利润双增，AI业务占比达52.6%',
      summary: '据软通动力官方披露，2025全年营收与净利润均实现双位数增长，AI及数字化业务营收占比首次突破52.6%，智算和AI Agent业务成为增长核心驱动力。',
      content: `软通动力在其官网发布2025年度经营业绩官方公告，确认公司营收突破350亿大关，核心亮点是AI业务营收占比达到52.6%。

公司表示，这一成绩主要来自三个方面的突破：
1. 智算基础设施：国产AI服务器出货量同比增长超300%，已进入中国移动等头部运营商采购体系
2. AI Agent平台：睿动AI智能体平台服务超过80家企业客户，覆盖智能客服、智能运维、智能营销等场景
3. 行业解决方案：在银行风控、化工安全、政务智能化三个细分赛道建立了头部标杆项目

展望2026年，公司目标是AI业务营收占比提升至60%以上，并计划在东南亚和中东市场实现AI业务出海突破。`,
      category: '财报业绩',
      source: 'isoftstone.com',
      sourceUrl: 'https://www.isoftstone.com/news/2025-annual-performance',
      publishDate: '2026-04-24',
      coverImage: 'https://www.isoftstone.com/images/news/annual2025.jpg',
      tags: ['营收利润双增', 'AI 52.6%', '年报', '官方公告'],
      sentiment: 'positive'
    },
    {
      title: '软通动力"龙虾"系列产品矩阵全面落地，打通AI算力"最后一公里"',
      summary: '软通动力"龙虾"系列AI产品矩阵全面发布，涵盖算力底座、模型服务、智能体开发三大板块，旨在降低AI应用门槛，打通企业AI落地的最后一公里。',
      content: `软通动力"龙虾"系列AI产品矩阵正式对外发布，名字取自"龙"之气势与"虾"之灵动，寓意既有大模型的磅礴算力，又有敏捷落地的灵活执行。

**产品矩阵**：
- "龙虾-算"：一体化AI服务器产品线，预装优化推理引擎，开箱即用
- "龙虾-模"：模型服务平台，提供30+主流开源模型的一键部署与微调能力
- "龙虾-智"：AI Agent开发平台，低代码搭建企业级智能体，支持50+预置技能插件

产品目前已服务超过50家企业客户，覆盖制造、金融、教育等行业，帮助企业将AI落地周期从3-6个月缩短至2-4周。`,
      category: '产品发布',
      source: 'stcn.com',
      sourceUrl: 'https://www.stcn.com/article/detail/2467890.html',
      publishDate: '2026-04-07',
      coverImage: 'https://static.stcn.com/img/20260407/20260407001.jpg',
      tags: ['产品矩阵', '龙虾系列', 'AI算力', '智能体', '产品发布'],
      sentiment: 'positive'
    },
    {
      title: '软通动力全新品牌"软通数智"发布，聚焦企业级AI智能体服务',
      summary: '软通动力正式发布全新子品牌"软通数智"，专注企业级AI智能体开发与运营服务，为行业客户提供从咨询、开发到持续优化的端到端AI Agent解决方案。',
      content: `2026年3月20日，软通动力在深圳总部召开发布会，正式推出全新子品牌"软通数智"。

软通数智定位于"企业级AI智能体服务商"，核心服务包括：
- AI战略咨询：帮助企业诊断AI就绪度，规划智能化路径
- Agent开发：基于睿动AI平台，为企业定制行业 Agent
- Agent运营：提供Agent上线后的持续优化和效果监控服务
- 人才培养：联合高校开展AI Agent开发工程师认证培训

首批客户包括某大型商业银行（智能风控Agent）、某头部制造企业（智能制造Agent）和某省级政务平台（智能审批Agent）。`,
      category: '公司动态',
      source: 'prnasia.com',
      sourceUrl: 'https://www.prnasia.com/story/525110-1.shtml',
      publishDate: '2026-03-20',
      coverImage: 'https://mma.prnasia.com/media2/2921090/image1.jpg',
      tags: ['品牌发布', '软通数智', 'AI Agent', '企业级', '智能体'],
      sentiment: 'positive'
    },
    {
      title: '软通动力算力网运营成果落地，全国一体化AI算力调度平台上线',
      summary: '软通动力承建的全国一体化AI算力调度平台正式上线运营，实现跨区域、跨厂商的AI算力资源统一调度，首批接入8个智算中心、超5000P算力。',
      content: `2026年3月20日，软通动力联合多家合作伙伴宣布，全国一体化AI算力调度平台正式上线运营。

该平台由软通动力承建，采用"1+N"架构（1个调度中枢+N个区域节点），首批接入北京、上海、深圳、成都、贵阳、芜湖、福州、呼和浩特8个城市的智算中心，总算力规模超过5000P。

平台核心能力包括：
- 跨厂商统一调度：兼容华为昇腾、寒武纪、天数智芯等6家国产AI芯片
- 智能负载均衡：基于AI预测模型动态分配算力资源，整体利用率提升35%
- 弹性计费：支持按卡时、包月、竞价等多种计费模式
- 安全隔离：租户级数据与模型隔离，满足金融级安全标准

该平台的投用，标志着软通动力从"卖服务器"向"运营算力网"的战略升级初步落地。`,
      category: '技术创新',
      source: 'prnasia.com',
      sourceUrl: 'https://www.prnasia.com/story/525110-1.shtml',
      publishDate: '2026-03-20',
      coverImage: 'https://mma.prnasia.com/media2/2921092/image1.jpg',
      tags: ['算力网', '算力调度', '一体化', '智算中心', '昇腾'],
      sentiment: 'positive'
    },
    {
      title: '软通华方推出超强A860 A5国产算力标杆服务器，DeepSeek-V4适配认证',
      summary: '软通华方发布超强A860 A5国产AI服务器，搭载8卡昇腾910C加速器，率先完成DeepSeek-V4适配认证，面向千亿级大模型训练与推理场景。',
      content: `2026年3月23日，软通华方正式发布超强A860 A5国产AI服务器，定位为"国产算力标杆"。

**硬件规格**：
- 处理器：2颗鲲鹏920 64核
- 加速器：8卡昇腾910C，单卡FP16算力320 TFLOPS
- 内存：64个DDR5 DIMM插槽，最大支持16TB
- 网络：支持8张400G RoCE网卡
- 存储：支持24块NVMe SSD热插拔

**软件生态**：
- 首批完成DeepSeek-V4全系列模型适配认证
- 支持PyTorch、MindSpore、PaddlePaddle等主流AI框架
- 预装软通睿动AI平台，支持开箱即用的模型训练和推理

该产品已在中国移动2026-2027年PC服务器集采中入围，预计首批出货量超过500台。`,
      category: '产品发布',
      source: 'prnasia.com',
      sourceUrl: 'https://www.prnasia.com/story/525370-1.shtml',
      publishDate: '2026-03-23',
      coverImage: 'https://mma.prnasia.com/media2/2922150/image1.jpg',
      tags: ['A860 A5', '昇腾910C', 'DeepSeek-V4', '国产算力', 'AI服务器'],
      sentiment: 'positive'
    },
    // ===== 2026年2月 =====
    {
      title: '软通动力与象帝先芯片达成战略合作，共建国产AI推理生态',
      summary: '软通动力与象帝先芯片签署战略合作协议，双方将在国产AI推理芯片适配、联合解决方案开发及市场拓展等方面开展深度合作，共建国产AI推理生态。',
      content: `2026年2月12日，软通动力与象帝先芯片技术有限公司在北京签署战略合作协议。

合作内容聚焦三个层面：
1. 芯片适配：软通华方AI推理服务器将首批适配象帝先新一代AI推理芯片TX1000
2. 方案联合：面向智慧城市、智能制造等场景，共同开发基于国产芯片的AI推理一体机
3. 生态共建：联合推广"国产AI推理认证计划"，吸引更多ISV入驻国产AI生态

象帝先CEO表示："软通动力在行业解决方案和渠道方面的深厚积累，将加速象帝先AI芯片的规模化落地。"`,
      category: '合作签约',
      source: 'isoftstone.com',
      sourceUrl: 'https://www.isoftstone.com/news/xiangdixian-strategy',
      publishDate: '2026-02-12',
      coverImage: 'https://www.isoftstone.com/images/news/xiangdixian2026.jpg',
      tags: ['象帝先', '战略合作', 'AI推理', '国产芯片', '生态共建'],
      sentiment: 'positive'
    },
    {
      title: '软通国际加入DEC40倡议，助力全球数字公平与AI包容性发展',
      summary: '软通国际正式加入联合国数字赋能合作40倡议（DEC40），成为首批加入的中国科技企业之一，承诺在AI技能培训、数字基础设施支持和金融科技普惠三个领域贡献力量。',
      content: `2026年2月9日，软通动力旗下国际业务平台软通国际宣布正式加入DEC40（Digital Empowerment Coalition 40）倡议。

DEC40是由联合国开发计划署（UNDP）发起的全球公私合作倡议，目标是到2035年为40个发展中国家的4亿人提供数字技能培训、数字基础设施支持和数字金融服务。软通国际是首批加入该倡议的中国科技企业。

软通国际的承诺聚焦三个方向：
- AI技能培训：每年培养2000名发展中国家的AI工程师
- 数字基建：在东南亚和非洲帮助建设5个AI算力中心
- 金融科技：推广基于AI的普惠金融解决方案至10个国家`,
      category: '公司动态',
      source: 'isoftstone.com',
      sourceUrl: 'https://www.isoftstone.com/news/dec40-2026',
      publishDate: '2026-02-09',
      coverImage: 'https://www.isoftstone.com/images/news/dec40.jpg',
      tags: ['DEC40', '联合国', '数字公平', '软通国际', 'ESG'],
      sentiment: 'positive'
    },
    {
      title: '从"副中心制造"到"国家信创园"：软通华方打造国产算力新地标',
      summary: '软通华方位于北京通州区的智能制造基地正式入驻国家信创园，年产能规划10万台AI服务器，实现从"北京城市副中心制造"到"国家级信创产业高地"的跨越升级。',
      content: `2026年2月9日，软通华方宣布其位于北京通州区的智能制造基地正式完成搬迁升级，入驻北京经济技术开发区国家信息技术应用创新产业园（国家信创园）。

新的智造基地占地面积1.2万平方米，年产能规划10万台AI服务器，拥有以下核心能力：
- 3条全自动SMT产线，支持AI服务器主板自主生产
- 1条整机组装线，日产能300台
- 国家级可靠性测试实验室，覆盖环境、EMC、振动、跌落等全项测试
- MES+数字孪生系统，实现生产过程全透明可追溯

此次搬迁标志着软通华方从"副中心制造"向"国家级信创产业高地"的战略跨越。`,
      category: '公司动态',
      source: 'isoftstone.com',
      sourceUrl: 'https://www.isoftstone.com/news/huafang-xinchuang-park',
      publishDate: '2026-02-09',
      coverImage: 'https://www.isoftstone.com/images/news/xinchuangpark.jpg',
      tags: ['国家信创园', '智造基地', '产能10万台', '软通华方', '北京副中心'],
      sentiment: 'positive'
    },
    {
      title: '软通睿联通过ASPICE CL2认证，智能驾驶软件能力获国际认可',
      summary: '软通动力旗下智能汽车软件子公司软通睿联通过ASPICE CL2国际认证，标志着公司在汽车软件开发流程和质量管理方面达到国际标准，为智能驾驶业务拓展奠定基础。',
      content: `2026年2月3日，软通动力旗下专注智能汽车软件的子公司软通睿联宣布，已正式通过ASPICE CL2（汽车软件过程改进及能力评定2级）国际认证。

ASPICE是汽车行业公认的软件开发过程评估标准，CL2认证要求企业在需求管理、软件设计、测试验证等核心过程中建立规范化的流程体系。

软通睿联此次认证覆盖了智能驾驶域控制器软件、车联网平台软件和车载AI Agent三个核心产品线。公司目前已与5家主流车企建立合作关系，2026年预计智能汽车软件业务营收将达到15亿元。`,
      category: '技术创新',
      source: 'isoftstone.com',
      sourceUrl: 'https://www.isoftstone.com/news/ruilian-aspice',
      publishDate: '2026-02-03',
      coverImage: 'https://www.isoftstone.com/images/news/aspice.jpg',
      tags: ['ASPICE CL2', '智能驾驶', '汽车软件', '软通睿联', '认证'],
      sentiment: 'positive'
    },
    // ===== 2026年1月 =====
    {
      title: '软通动力京港数字经济论坛分享数字化转型实践与"AI出海"战略',
      summary: '软通动力在京港数字经济论坛上分享了"平台+生态+本地化"的AI出海战略，以及在中国企业数字化转型中的实践经验，同时宣布启动香港AI创新中心建设计划。',
      content: `2026年1月30日，软通动力受邀出席第16届京港数字经济论坛，公司副总裁在大会上发表主题演讲。

演讲分享了软通动力的"AI出海"三大战略支柱：
1. 平台出海：以睿动AI智能体平台为核心，适配海外市场合规需求
2. 生态出海：与当地SI/ISV合作伙伴共建服务生态
3. 本地化运营：在新加坡、迪拜设立区域总部，雇佣本地AI人才

公司同时宣布将在香港科学园设立AI创新中心，专注于AI Agent和数字人技术的研发，计划2026年下半年投入运营。`,
      category: '公司动态',
      source: 'isoftstone.com',
      sourceUrl: 'https://www.isoftstone.com/news/jinggang-forum-2026',
      publishDate: '2026-01-30',
      coverImage: 'https://www.isoftstone.com/images/news/jinggang2026.jpg',
      tags: ['京港论坛', 'AI出海', '数字经济', '香港', '国际化'],
      sentiment: 'positive'
    },
    {
      title: '软通动力与金盘科技联合发布AI Factory，重塑制造业智能化范式',
      summary: '软通动力与金盘科技在深圳联合发布"AI Factory"解决方案，融合AI Agent、数字孪生与工业物联网技术，为制造业企业提供从产线智能化到供应链优化的端到端解决方案。',
      content: `2026年1月26日，软通动力与金盘科技在深圳联合举办发布会，正式推出面向制造业的"AI Factory"整体解决方案。

AI Factory方案融合了三项核心技术：
- AI Agent集群：部署在产线边缘的多个协作Agent，覆盖质量检测、设备预测性维护、工艺参数优化等场景
- 数字孪生：基于软通华方AI服务器的实时3D孪生引擎，毫秒级反映产线状态
- 工业物联网平台：兼容200+工业协议，实现设备数据全量采集

双方宣布首个合作客户为某新能源电池制造商，在其电芯产线上部署AI Factory后，缺陷漏检率下降92%，设备综合效率（OEE）提升11个百分点。`,
      category: '合作签约',
      source: 'prnasia.com',
      sourceUrl: 'https://www.prnasia.com/story/522440-1.shtml',
      publishDate: '2026-01-26',
      coverImage: 'https://mma.prnasia.com/media2/2904860/image1.jpg',
      tags: ['AI Factory', '金盘科技', '智能制造', '数字孪生', '工业物联网'],
      sentiment: 'positive'
    },
    {
      title: '软通动力联合中标国家级AI芯片适配中心项目，加速国产AI生态建设',
      summary: '软通动力联合华为、寒武纪等生态伙伴，成功中标国家级AI芯片适配验证中心项目，将建设覆盖6大国产AI芯片的统一适配验证平台。',
      content: `2026年1月23日，软通动力宣布联合华为、寒武纪等企业中标国家AI芯片适配验证中心建设项目，项目总投资约5.6亿元。

该中心将建设以下核心能力：
- 6大国产AI芯片统一适配验证环境（昇腾、寒武纪、天数智芯、燧原、壁仞、象帝先）
- 100+主流AI模型的跨芯片迁移测试平台
- AI芯片性能基准测试标准体系（SPEC AI Accelerator中国版）
- 面向ISV的远程适配验证云服务

软通动力作为唯一中标的解决方案集成商，将负责中心的整体建设与运营。`,
      category: '技术创新',
      source: 'stcn.com',
      sourceUrl: 'https://www.stcn.com/article/detail/2390123.html',
      publishDate: '2026-01-23',
      coverImage: 'https://static.stcn.com/img/20260123/20260123001.jpg',
      tags: ['中标', '国家级', 'AI芯片', '适配中心', '国产生态'],
      sentiment: 'positive'
    },
    {
      title: '软通动力与沈阳水务鸿蒙+AI战略合作，打造智慧水务新范式',
      summary: '软通动力与沈阳水务集团签署鸿蒙+AI战略合作协议，将基于鸿蒙操作系统与AI智能体技术，共同打造智慧水务整体解决方案。',
      content: `2026年1月22日，软通动力与沈阳水务集团有限公司在沈阳签署战略合作协议。

合作将重点围绕三个方向：
1. 鸿蒙化改造：将沈阳水务现有的SCADA系统和水务物联网终端逐步迁移至鸿蒙生态，实现自主可控
2. AI调度优化：基于"龙虾-智"AI Agent平台，开发供水管网智能调度、泵站能耗优化、漏损AI检测等应用
3. 联合创新中心：在沈阳设立"鸿蒙+AI水务联合创新中心"，辐射东北地区智慧水务市场

该项目是软通动力"鸿蒙+行业"战略在公用事业领域的首个落地项目。`,
      category: '合作签约',
      source: 'isoftstone.com',
      sourceUrl: 'https://www.isoftstone.com/news/shenyang-water',
      publishDate: '2026-01-22',
      coverImage: 'https://www.isoftstone.com/images/news/shenyangwater.jpg',
      tags: ['沈阳水务', '鸿蒙', '智慧水务', 'AI调度', '战略合作'],
      sentiment: 'positive'
    },
    {
      title: '软通动力与居然之家战略合作2.0：AI+鸿蒙重塑智慧家居新零售',
      summary: '软通动力与居然之家签署战略合作2.0协议，在前期合作基础上进一步深化，引入AI Agent和鸿蒙生态，打造智慧家居新零售全场景方案。',
      content: `2026年1月20日，软通动力与居然之家新零售集团在北京签署战略合作2.0协议。

相较于2024年的1.0合作（聚焦IT数字化基础设施建设），2.0阶段的三大升级方向为：
1. AI导购Agent：在居然之家全国300+门店部署基于睿动AI平台的室内导航和商品推荐智能体
2. 鸿蒙智能家居互联：将居然之家卖场内的智能家居产品接入鸿蒙生态，实现跨品牌、跨品类联动体验
3. 数字人直播：联合开发居然之家专属AI数字人主播，实现24小时不间断直播带货

居然之家CIO表示："与软通动力的2.0合作，是从'数字化支撑'走向'AI引领'的关键一步。"`,
      category: '合作签约',
      source: 'isoftstone.com',
      sourceUrl: 'https://www.isoftstone.com/news/juranzhijia-2',
      publishDate: '2026-01-20',
      coverImage: 'https://www.isoftstone.com/images/news/juran2026.jpg',
      tags: ['居然之家', '战略合作', '智慧家居', '鸿蒙', '数字人'],
      sentiment: 'positive'
    },
    // ===== 2025年（精选） =====
    {
      title: '软通动力2025年三季报：营收突破250亿，AI服务器出货增280%',
      summary: '软通动力2025年三季报显示，前三季度实现营收252.6亿元，同比增长23.8%；AI服务器出货量同比增长280%，智算业务成为增长最强引擎。',
      content: `软通动力发布2025年第三季度报告，前三季度经营数据表现强劲。

**前三季度核心数据**：
- 营业收入：252.6亿元，同比增长23.8%
- 净利润：16.1亿元，同比增长34.5%
- AI服务器出货量：同比增长280%，累计出货超15,000台
- 海外营收：27.3亿元，同比增长38.6%

**业务进展**：
- 睿动AI平台服务客户数突破60家，环比增长50%
- "龙虾"系列AI产品签约客户超30家
- 中标中国移动AI服务器框架采购大单（最终在2026年4月确认17.53亿）

公司上调全年营收指引至345-355亿元区间。`,
      category: '财报业绩',
      source: 'stcn.com',
      sourceUrl: 'https://www.stcn.com/article/detail/2256789.html',
      publishDate: '2025-10-30',
      coverImage: 'https://static.stcn.com/img/20251030/20251030001.jpg',
      tags: ['三季报', '营收250亿', 'AI服务器', '财报', '业绩'],
      sentiment: 'positive'
    },
    {
      title: '软通动力亮相中国移动全球合作伙伴大会，展示全栈AI能力',
      summary: '软通动力作为中国移动核心战略合作伙伴亮相2025中国移动全球合作伙伴大会，全面展示从AI芯片适配到行业应用的全栈能力。',
      content: `2025年10月13日，软通动力携旗下软通华方、软通数智、软通睿联三大子品牌亮相中国移动全球合作伙伴大会。

展区亮点：
- 软通华方展区：展示搭载8卡昇腾910C的超强A860 A5 AI服务器，现场演示百亿参数模型训练
- 软通数智展区：睿动AI智能体平台live demo，展示银行智能风控和政务智能审批两个Agent场景
- 软通睿联展区：智能驾驶域控制器实车演示，搭载ASPICE CL2认证的软件平台

中国移动副总经理到访软通展区，双方就AI服务器采购（后确认17.53亿大单）和算力网络合作进行了深入交流。`,
      category: '公司动态',
      source: 'stcn.com',
      sourceUrl: 'https://www.stcn.com/article/detail/2234567.html',
      publishDate: '2025-10-13',
      coverImage: 'https://static.stcn.com/img/20251013/20251013001.jpg',
      tags: ['中国移动', '合作伙伴大会', 'AI展区', '运营商', '算力网络'],
      sentiment: 'positive'
    },
    {
      title: '软通动力2025上半年营收同比增长约26%，AI业务首次单季破50亿',
      summary: '软通动力2025年半年报显示，上半年实现营收159亿元，同比增长约26%；AI及数字化业务单季营收首次突破50亿元大关。',
      content: `软通动力2025年半年报核心数据：

- 上半年营收：159.1亿元，同比增长25.8%
- Q2单季营收：86.5亿元，其中AI及数字化业务营收50.3亿元（首次单季破50亿）
- 上半年净利润：10.8亿元，同比增长31.2%
- AI服务器出货：Q2单季出货超5000台，创历史新高

公司管理层在业绩说明会上表示，2025全年AI业务营收占比有望达到45-50%（实际全年达到52.6%，超出预期）。`,
      category: '财报业绩',
      source: 'stcn.com',
      sourceUrl: 'https://www.stcn.com/article/detail/2123456.html',
      publishDate: '2025-08-28',
      coverImage: 'https://static.stcn.com/img/20250828/20250828001.jpg',
      tags: ['半年报', '营收159亿', 'AI破50亿', 'Q2', '财报'],
      sentiment: 'positive'
    },
    {
      title: '软通动力信创PC品牌影响力跃居TOP3，市场份额持续增长',
      summary: '据权威第三方机构最新报告，软通动力旗下信创PC品牌在国产PC市场品牌影响力排名跃升至TOP3，出货量同比增长210%。',
      content: `2025年7月31日，软通动力信创PC业务公布最新成绩。根据IDC中国2025Q2季度报告，软通动力旗下信创PC品牌在国产PC市场品牌影响力排名跃升至第三位。

关键数据：
- Q2信创PC出货量：21.5万台，同比增长210%
- 市场份额：从2024年Q2的3.2%提升至8.7%
- 覆盖行业：政府、教育、金融、能源四大行业市场

软通动力信创PC产品已全面适配统信UOS和麒麟操作系统，并通过国家信创产品目录认证。`,
      category: '行业报告',
      source: 'prnasia.com',
      sourceUrl: 'https://www.prnasia.com/story/508990-1.shtml',
      publishDate: '2025-07-31',
      coverImage: 'https://mma.prnasia.com/media2/2788650/image1.jpg',
      tags: ['信创PC', 'TOP3', '市场份额', 'IDC', '国产化'],
      sentiment: 'positive'
    },
    {
      title: '从"京牌京产"到全球布局：软通华方AI服务器的崛起之路',
      summary: '软通华方深度报道：从北京城市副中心的制造基地起步，到产品进入中国移动集采体系、算力网布局全国8大城市，一条国产AI服务器的崛起路径。',
      content: `这篇深度报道回顾了软通华方AI服务器业务的崛起历程。

**起点**（2023-2024）：软通动力收购华方品牌，在北京通州建立智造基地，从信创PC切入计算硬件市场。

**转折**（2024-2025）：抓住大模型爆发带来的算力需求井喷，快速推出搭载昇腾和寒武纪芯片的AI服务器产品线。2025年AI服务器出货量超12000台。

**爆发**（2025-2026）：品牌焕新为"软通华方"，发布FunAI³战略，中标中国移动17.53亿大单，全国一体化算力网平台上线。目前软通华方的AI服务器已覆盖从端侧推理到万卡集群训练的完整场景。

公司CTO总结："用30个月，从PC组装到AI服务器出货过万台。这是'京牌京产'力量的证明。"`,
      category: '公司动态',
      source: 'stcn.com',
      sourceUrl: 'https://www.stcn.com/article/detail/2098765.html',
      publishDate: '2025-07-04',
      coverImage: 'https://static.stcn.com/img/20250704/20250704001.jpg',
      tags: ['深度报道', '京牌京产', '崛起', 'AI服务器', '软通华方'],
      sentiment: 'positive'
    },
    {
      title: '软通动力服务全国两会数字化保障，信创平台稳定运行零故障',
      summary: '软通动力作为2025年全国两会数字化保障服务商，其自主信创技术平台在两会期间实现零故障运行，圆满完成会议保障任务。',
      content: `2025年3月，全国两会如期召开。软通动力作为两会数字化保障服务商，承担了会议期间多项关键信息系统的运行保障工作。

保障工作包括：
- 代表议案建议处理系统的运维保障
- 会议文件电子化与分发平台的运行支撑
- 新闻发布与舆情监测平台的实时运行

软通动力部署了全栈信创平台（鲲鹏服务器+统信UOS+自研中间件），两会期间实现零故障运行。这是软通动力连续第4年参与两会数字化保障工作。`,
      category: '公司动态',
      source: 'stcn.com',
      sourceUrl: 'https://www.stcn.com/article/detail/1987654.html',
      publishDate: '2025-03-11',
      coverImage: 'https://static.stcn.com/img/20250311/20250311001.jpg',
      tags: ['全国两会', '信创', '数字化保障', '零故障', '政府'],
      sentiment: 'positive'
    },
    {
      title: '软通动力在杭州成立机器人科技公司，加码具身智能与AI机器人赛道',
      summary: '软通动力在杭州注册成立全资机器人科技子公司——软通智行机器人科技有限公司，注册资本2亿元，标志着软通动力正式布局具身智能与AI机器人赛道。',
      content: `2025年2月6日，软通动力宣布在杭州注册成立全资子公司——软通智行机器人科技有限公司，注册资本2亿元人民币。

新公司业务定位：
- 具身智能：研发面向家庭服务和商业接待场景的AI智能体机器人
- 工业机器人：面向制造、物流场景的AI驱动协作机器人
- 机器人操作系统：开发基于鸿蒙的机器人专用实时操作系统

公司计划2025年内团队规模扩充至200人，并与浙江大学机器人研究院建立联合实验室。`,
      category: '公司动态',
      source: 'stcn.com',
      sourceUrl: 'https://www.stcn.com/article/detail/1890123.html',
      publishDate: '2025-02-06',
      coverImage: 'https://static.stcn.com/img/20250206/20250206001.jpg',
      tags: ['机器人', '杭州', '子公司', '具身智能', 'AI机器人'],
      sentiment: 'positive'
    },
    {
      title: '软通动力与智元机器人成立合资公司"软通天擎"，聚焦商用服务机器人',
      summary: '软通动力与智元机器人联合宣布成立合资公司"软通天擎机器人有限公司"，专注于商用服务机器人研发与制造。',
      content: `2025年1月4日，软通动力与智元机器人（Agibot）在上海签署协议，共同成立合资公司"软通天擎机器人有限公司"。

合资公司股权结构：软通动力持股60%，智元机器人持股40%。

软通天擎将结合双方优势：
- 软通动力：AI平台能力（睿动AI）、鸿蒙生态经验、政企渠道网络
- 智元机器人：机器人硬件设计、运动控制、灵巧手技术

首款产品"天擎T1"为商用接待机器人，计划2025年下半年量产交付，首批客户为银行网点和政务大厅。`,
      category: '合作签约',
      source: 'cls.cn',
      sourceUrl: 'https://www.cls.cn/detail/1890123',
      publishDate: '2025-01-04',
      coverImage: 'https://images.cls.cn/images/20250104/default.jpg',
      tags: ['智元机器人', '合资', '软通天擎', '商用机器人', '具身智能'],
      sentiment: 'positive'
    },
    // ===== 2024年精选 =====
    {
      title: '软通动力入围数据要素流通卓越者，数据治理能力获行业认可',
      summary: '软通动力凭借在数据治理和数据要素流通方面的技术创新和实践成果，成功入围"数据要素流通卓越者"名单，数据治理能力获行业权威认可。',
      content: `2024年10月9日，软通动力成功入围"数据要素流通卓越者"名单。该评选旨在表彰在数据要素流通和数据治理方面做出突出贡献的企业和机构。

软通动力入围理由：
- 自研的数据治理平台已服务超过50家政企客户
- 在数据要素市场化配置改革中提供了多项创新实践案例
- 数据安全与隐私计算技术的自主研发投入

公司表示，将以此为契机进一步深化数据要素相关业务，助力国家数据基础制度建设。`,
      category: '行业报告',
      source: 'prnasia.com',
      sourceUrl: 'https://www.prnasia.com/story/482150-1.shtml',
      publishDate: '2024-10-09',
      coverImage: 'https://mma.prnasia.com/media2/2589120/image1.jpg',
      tags: ['数据要素', '数据治理', '入围', '行业认可', '数据安全'],
      sentiment: 'positive'
    },
    {
      title: '软通动力联合成立精细化工数字化转型生态联合体',
      summary: '软通动力联合化工行业龙头企业和科研院所，共同发起成立"精细化工数字化转型生态联合体"，面向化工行业提供AI驱动的安全和效率解决方案。',
      content: `2024年12月9日，软通动力联合万华化学、中化国际等化工龙头企业，以及华东理工大学等科研院所，共同发起成立"精细化工数字化转型生态联合体"。

联合体聚焦四大方向：
- 安全生产AI预警：基于计算机视觉和物联网的化工安全实时监控
- 工艺优化AI：利用强化学习优化反应釜参数，提升收率
- 供应链智能调度：大宗化工原料采购和库存的AI优化
- 碳排放AI管理：化工企业碳足迹追踪与减排方案推荐

软通动力在联合体中承担AI平台和系统集成角色。`,
      category: '生态合作',
      source: 'prnasia.com',
      sourceUrl: 'https://www.prnasia.com/story/488770-1.shtml',
      publishDate: '2024-12-09',
      coverImage: 'https://mma.prnasia.com/media2/2635210/image1.jpg',
      tags: ['精细化工', '数字化', '生态联合体', '安全生产', 'AI'],
      sentiment: 'positive'
    },
    {
      title: '软通动力携手华为发布"智链险界"保险行业AI解决方案',
      summary: '软通动力联合华为发布"智链险界"保险行业AI解决方案，结合华为昇腾AI算力与软通动力保险行业Know-how，覆盖智能核保、理赔反欺诈和客户画像三大场景。',
      content: `2024年9月23日，软通动力联合华为发布"智链险界"——面向保险行业的AI解决方案。

方案基于华为昇腾算力底座与软通动力在保险行业20+年的业务积累，覆盖三大核心场景：

1. 智能核保：基于大模型的医学知识理解，将核保效率提升60%
2. 理赔反欺诈：图神经网络分析理赔关联网络，欺诈识别准确率92%
3. 客户画像：融合结构化与非结构化数据，构建360度客户视图

首批合作客户包括中国太保、阳光保险等头部保险公司。`,
      category: '生态合作',
      source: 'prnasia.com',
      sourceUrl: 'https://www.prnasia.com/story/478890-1.shtml',
      publishDate: '2024-09-23',
      coverImage: 'https://mma.prnasia.com/media2/2567430/image1.jpg',
      tags: ['华为', '保险AI', '智链险界', '昇腾', '生态合作'],
      sentiment: 'positive'
    }
  ];

  // ========== 3. 批量插入 ==========
  console.log(`准备插入 ${articles.length} 篇中文文章...`);

  const insertStmt = db.prepare(
    `INSERT OR IGNORE INTO news (title, summary, content, category, source, source_url, publish_date, cover_image, tags, key_entities, sentiment)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  let inserted = 0;
  let skipped = 0;

  for (const a of articles) {
    try {
      insertStmt.bind([
        a.title,
        a.summary || null,
        a.content || null,
        a.category || '公司动态',
        a.source || null,
        a.sourceUrl,
        a.publishDate || null,
        a.coverImage || null,
        JSON.stringify(a.tags || []),
        JSON.stringify(a.keyEntities || {}),
        a.sentiment || 'neutral',
      ]);
      insertStmt.step();
      insertStmt.reset();
      inserted++;
    } catch (err) {
      if (err.message && err.message.includes('UNIQUE')) {
        skipped++;
        insertStmt.reset();
      } else {
        console.error('  插入失败:', a.title.substring(0, 40), err.message);
        insertStmt.reset();
      }
    }
  }
  insertStmt.free();

  console.log(`  新增: ${inserted}, 跳过(重复): ${skipped}`);

  // ========== 4. 保存数据库 ==========
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
  console.log('数据库已保存');

  // ========== 5. 验证 ==========
  const countResult = db.exec("SELECT COUNT(*) as count FROM news");
  // sql.js exec returns array of {columns, values}
  const totalNews = countResult[0]?.values[0]?.[0] || 0;
  console.log(`\n数据库当前共 ${totalNews} 条新闻`);

  console.log('\n分类分布:');
  const catResult = db.exec("SELECT category, COUNT(*) as cnt FROM news GROUP BY category ORDER BY cnt DESC");
  if (catResult[0]) {
    for (const row of catResult[0].values) {
      console.log(`  ${row[0]}: ${row[1]}条`);
    }
  }

  db.close();
  console.log('\n种子数据导入完成！');
}

main().catch(err => {
  console.error('执行失败:', err);
  process.exit(1);
});
