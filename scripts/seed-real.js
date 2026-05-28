#!/usr/bin/env node
/**
 * 真实新闻数据种子脚本
 * 抓取真实软通动力新闻 → 下载封面图到本地 → 写入数据库
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDb, initSchema, closeDb, saveDb, queryAll } from '../server/db/index.js';
import config from '../server/config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imgDir = path.join(__dirname, '..', 'client', 'images', 'news');

// 确保图片目录存在
if (!fs.existsSync(imgDir)) fs.mkdirSync(imgDir, { recursive: true });

// 下载图片
async function downloadImage(url, filename) {
  // 处理协议相对 URL
  if (url.startsWith('//')) url = 'https:' + url;
  // 去掉 prnasia 的 ?p=medium600 等参数（直接用原图）
  const cleanUrl = url.split('?')[0];
  const filePath = path.join(imgDir, filename);
  if (fs.existsSync(filePath)) {
    console.log(`  [skip] ${filename} already exists`);
    return;
  }
  try {
    const res = await fetch(cleanUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(filePath, buf);
    console.log(`  [ok] ${filename} (${(buf.length / 1024).toFixed(1)}KB)`);
  } catch (err) {
    console.error(`  [fail] ${filename}: ${err.message}`);
  }
}

// ========== 真实新闻数据 ==========

const REAL_NEWS = [
  {
    title: '软通动力2025年营收破350亿，AI业务贡献过半',
    summary: '软通动力2025年全年实现营业收入350.90亿元，同比增长12.05%，AI相关业务收入首破184亿，占比达52.6%，标志着软通动力的转型进入实质性收获期。',
    category: '财报业绩',
    source: '财联社',
    sourceUrl: 'https://www.cls.cn/detail/2355867',
    publishDate: '2026-04-26',
    coverImage: 'https://www.isoftstone.com/resources/zh-cn/uploads/20260424/2047685943079825408.jpg',
    localImage: '2026-04-26-yingye.jpg',
    tags: ['财报', '营收350亿', 'AI业务', '全栈智能'],
    keyEntities: { companies: ['软通动力'], numbers: ['350.90亿', '12.05%', '184.66亿', '52.6%', '81.17亿'] },
    sentiment: 'positive',
    content: `<h2>软通动力2025年营收破350亿！AI业务贡献过半</h2>
<p><strong>来源：财联社</strong></p>
<p>在从"数字经济"向"智能经济"加速切换的时代背景下，软通动力全面落地"软硬一体 全栈智能"战略，推进向"全栈智能化产品与服务提供商"的战略升维。</p>
<p>从最新发布的2025年业绩报告来看，作为"算力 + 模型 + 应用 + 终端" 全栈布局的龙头企业，软通动力交出了一份颇为亮眼的成绩单：全年实现营业收入350.90亿元，同比增长12.05%，归母净利润2.06亿元，同比增长14.27%。公司不仅实现规模与效益双提升，AI相关业务更首次成为收入支柱，占比达52.6%，标志着软通动力的转型进入实质性收获期。</p>
<h3>AI相关业务收入首破184亿</h3>
<p>业绩数据显示，软通动力AI相关业务2025年营收首次突破184.66亿元，占公司总营收的52.6%。公司同时披露了2026年第一季度数据，营收81.17亿元，同比增长15.79%。其中AI相关业务营收同比增幅39%，达45.14亿元。</p>
<p>AI相关收入占比过半，可谓是一个重要里程碑，意味着软通动力不再是传统意义上的IT服务商，而成为AI驱动的科技型企业。</p>
<h3>"软硬一体 全栈智能" 四大板块全面落地</h3>
<p>以AI基础设施、计算智能、场景智能、终端智能四大板块为核心支柱，软通动力开创"算力基建+睿动Tokens+OpenClaw"全新运营模式，在多行业实现"AI+场景"落地验证。</p>
<p>AI基础设施上，公司构建"绿色能源+算力基建+Tokens"服务体系。其中，平潭两岸融合算力中心1300P异构算力池已全面投入运营。</p>
<h3>三大业务实现规模与效益双提升</h3>
<p>软件与数字技术服务业务实现营收189.61亿元，占比54.02%，同比增长4.64%。计算产品与智能电子业务实现营收158.09亿元，占比45.05%，同比增长22.36%。数字能源与智算服务业务实现营收3.01亿元，同比增长16.16%。</p>
<h3>出海2.0战略启动，全球化布局再提速</h3>
<p>2025年，软通动力全面启动"出海2.0"战略，聚焦东南亚、中东、日本、北美四大核心市场。在东南亚市场，马来西亚全球交付中心（GDC）正式落成。公司旗下高端计算设备品牌机械革命中标巴基斯坦总理青年计划笔记本电脑项目，为该国提供十万台定制化笔记本电脑。</p>`,
  },
  {
    title: '软通计算机中标中国移动17.53亿元服务器大单',
    summary: '软通动力旗下全栈智算品牌软通华方中标中国移动2026—2027年PC服务器集中采购项目，金额达17.53亿元。其AI服务器已率先完成DeepSeek-V4大模型适配。',
    category: '合作签约',
    source: 'DoNews',
    sourceUrl: 'https://www.donews.com/news/detail/8/6561823.html',
    publishDate: '2026-05-20',
    coverImage: 'https://mma.prnasia.com/media2/2982863/image1.jpg?p=medium600',
    localImage: '2026-05-20-zhongyidong.jpg',
    tags: ['中国移动', '服务器', '17.53亿', '软通华方'],
    keyEntities: { companies: ['软通动力', '中国移动', '软通华方'], numbers: ['17.53亿'] },
    sentiment: 'positive',
    content: `<h2>软通动力中标中国移动17.53亿元服务器大单</h2>
<p><strong>来源：DoNews</strong></p>
<img src="/images/news/2026-05-20-zhongyidong.jpg" alt="中标喜报" style="max-width:100%;border-radius:8px;margin:16px 0;">
<p>2026年5月，软通动力旗下全栈智算品牌软通华方中标中国移动2026—2027年PC服务器集中采购项目，金额达17.53亿元。</p>
<p>该订单覆盖政务、金融、医疗等多行业AI算力需求，其AI服务器已率先完成DeepSeek-V4大模型适配。此举标志着软通华方国产AI服务器获头部运营商规模化商用认可，加速推进"软硬一体、全栈智能"解决方案落地。</p>`,
  },
  {
    title: '软通动力2026年一季报简析：营收81.17亿元，同比增长15.79%',
    summary: '软通动力发布2026年一季报，营业总收入81.17亿元，同比上升15.79%，归母净利润-3.5亿元。AI相关业务营收同比增幅39%，达45.14亿元。',
    category: '财报业绩',
    source: '证券之星',
    sourceUrl: 'https://view.inews.qq.com/a/20260426A01XSK00',
    publishDate: '2026-04-26',
    coverImage: 'https://www.isoftstone.com/resources/zh-cn/uploads/20260424/2047685943079825408.jpg',
    localImage: '2026-04-26-jibao.jpg',
    tags: ['一季报', '营收81亿', 'AI业务增长'],
    keyEntities: { companies: ['软通动力'], numbers: ['81.17亿', '15.79%', '-3.5亿', '45.14亿', '39%'] },
    sentiment: 'neutral',
    content: `<h2>软通动力（301236）2026年一季报简析</h2>
<p><strong>来源：证券之星</strong></p>
<p>据证券之星公开数据整理，近期软通动力（301236）发布2026年一季报。截至本报告期末，公司营业总收入81.17亿元，同比上升15.79%，归母净利润-3.5亿元，同比下降76.99%。</p>
<p>本次财报公布的各项数据指标：毛利率7.78%，同比减24.58%，净利率-4.57%，同比减44.51%，销售费用、管理费用、财务费用总计7.51亿元，三费占营收比9.26%，每股净资产12.89元，同比增18.73%。</p>
<h3>关键数据</h3>
<ul>
<li>营业总收入：81.17亿元，同比+15.79%</li>
<li>归母净利润：-3.5亿元，同比-76.99%</li>
<li>AI相关业务营收：45.14亿元，同比+39%</li>
<li>应收账款占最新年报归母净利润比：3002.14%</li>
</ul>
<p>分析师工具显示：证券研究员普遍预期2026年业绩在4.0亿元，每股收益均值在0.39元。</p>`,
  },
  {
    title: '软通动力与象帝先达成战略合作，共建芯片到场景协同新范式',
    summary: '软通动力与象帝先在京签署战略合作协议，协同推进图形计算芯片与行业平台的深度融合，聚焦数字孪生、工业仿真等共创解决方案。',
    category: '合作签约',
    source: 'isoftstone.com',
    sourceUrl: 'https://www.isoftstone.com/zh-cn/htmls/news/xiangdixian.html',
    publishDate: '2026-02-12',
    coverImage: 'https://www.isoftstone.com/resources/zh-cn/uploads/20260212/2021886663677276160.png',
    localImage: '2026-02-12-xiangdixian.png',
    tags: ['象帝先', '战略合作', '图形计算芯片', '数字孪生'],
    keyEntities: { companies: ['软通动力', '象帝先'], people: ['张丹', '王耀宇', '刘会福', '雒冬梅'] },
    sentiment: 'positive',
    content: `<h2>软通动力与象帝先达成战略合作</h2>
<p><strong>来源：软通动力官网</strong></p>
<img src="/images/news/2026-02-12-xiangdixian.png" alt="签约仪式" style="max-width:100%;border-radius:8px;margin:16px 0;">
<p>2月12日，软通动力信息技术（集团）股份有限公司（以下简称"软通动力"）与象帝先计算技术（重庆）有限公司（以下简称"象帝先"）在京签署战略合作协议。双方将协同推进图形计算芯片与行业平台的深度融合，聚焦数字孪生、工业仿真等共创解决方案，加速场景应用智能跃迁。</p>
<p>象帝先副总裁张丹、销售运营中心总经理王耀宇与软通动力董事兼首席技术官刘会福、副总裁兼集团创新与技术研究院副院长雒冬梅等出席签约仪式。</p>`,
  },
  {
    title: '软通国际加入全球数字经济城市联盟（DEC40），成为首批理事单位',
    summary: '软通动力旗下国际业务品牌软通国际正式成为首批加入全球数字经济城市联盟（DEC40）的理事单位。',
    category: '公司动态',
    source: 'isoftstone.com',
    sourceUrl: 'https://www.isoftstone.com/zh-cn/htmls/news/dec40.html',
    publishDate: '2026-02-09',
    coverImage: 'https://www.isoftstone.com/resources/zh-cn/uploads/20260210/2021050810184855552.png',
    localImage: '2026-02-09-dec40.png',
    tags: ['DEC40', '全球数字经济城市联盟', '软通国际'],
    keyEntities: { companies: ['软通动力', '软通国际', 'DEC40'], people: ['黄立'] },
    sentiment: 'positive',
    content: `<h2>软通国际加入全球数字经济城市联盟（DEC40）</h2>
<p><strong>来源：软通动力官网</strong></p>
<img src="/images/news/2026-02-09-dec40.png" alt="DEC40理事单位" style="max-width:100%;border-radius:8px;margin:16px 0;">
<p>2月4日，联合国"国际数字经济治理与领军人才能力建设项目"在北京圆满结业。在结业仪式上，软通动力旗下国际业务品牌——软通国际正式成为首批加入全球数字经济城市联盟（DEC40）的理事单位。</p>
<p>软通动力集团执行副总裁、国际业务总裁黄立出席仪式并发言，系统总结了软通在赋能全球数字化转型中的实践与思考。</p>`,
  },
  {
    title: '从副中心制造到亮相国家信创园，软通动力系列硬核产品展示科技实力',
    summary: '软通动力在国家信创园集中展示自主创新领域系列成果，涵盖服务器、台式机、便携式计算机等多款软通华方信创硬件产品。',
    category: '产品发布',
    source: 'isoftstone.com',
    sourceUrl: 'https://www.isoftstone.com/zh-cn/htmls/news/xinchuangyuan.html',
    publishDate: '2026-02-09',
    coverImage: 'https://www.isoftstone.com/resources/zh-cn/uploads/20260210/2021048922655780864.png',
    localImage: '2026-02-09-xinchuangyuan.png',
    tags: ['信创园', '软通华方', '自主创新', '服务器'],
    keyEntities: { companies: ['软通动力', '软通华方'], places: ['北京亦庄', '国家信创园', '通州区'] },
    sentiment: 'positive',
    content: `<h2>从副中心制造到亮相国家信创园</h2>
<p><strong>来源：软通动力官网</strong></p>
<img src="/images/news/2026-02-09-xinchuangyuan.png" alt="信创园展示" style="max-width:100%;border-radius:8px;margin:16px 0;">
<p>在位于北京亦庄的国家信创园，软通动力集中展示了其在自主创新领域的系列成果，涵盖服务器、台式机、便携式计算机等多款软通华方信创硬件产品。</p>
<p>过去一年，软通动力在北京市通州区积极布局信创产业，通过战略并购与智能制造基地建设，快速构建了完整的本地化产业能力。</p>`,
  },
  {
    title: '软通动力子公司软通睿联通过ASPICE CL2评估，智能汽车软件研发管理能力接轨国际水准',
    summary: '软通动力子公司软通睿联成功通过ASPICE CL2能力评估，标志着软件开发过程管控及质量管理能力已达到国际水准。',
    category: '技术创新',
    source: 'isoftstone.com',
    sourceUrl: 'https://www.isoftstone.com/zh-cn/htmls/news/aspice-cl2.html',
    publishDate: '2026-02-03',
    coverImage: 'https://www.isoftstone.com/resources/zh-cn/uploads/20260206/2019652296443785216.png',
    localImage: '2026-02-03-aspice.png',
    tags: ['ASPICE', 'CL2', '智能汽车', '软通睿联'],
    keyEntities: { companies: ['软通动力', '软通睿联', '中国汽研'], people: ['陈力铭', '徐维'] },
    sentiment: 'positive',
    content: `<h2>软通睿联通过ASPICE CL2评估</h2>
<p><strong>来源：软通动力官网</strong></p>
<img src="/images/news/2026-02-03-aspice.png" alt="ASPICE CL2认证" style="max-width:100%;border-radius:8px;margin:16px 0;">
<p>近日，软通动力子公司软通睿联成功通过ASPICE CL2（汽车软件过程改进及能力评定二级）能力评估。作为国内外主流车企甄选合作伙伴的核心依据，ASPICE认证具有极高的国际权威性与行业认可度。</p>
<p>此次获证，标志着软通动力软件开发过程管控及质量管理能力已达到国际水准，为持续向行业提供高可靠、高质量的智能汽车软件研发服务筑牢了坚实根基。</p>
<p>软通动力高级副总裁陈力铭，中国汽研高级专家、车联网公司总经理徐维等双方领导共同出席认证颁发仪式。</p>`,
  },
  {
    title: '从软件服务到全栈智能：软通动力在京港数字经济合作论坛分享转型实践',
    summary: '软通动力董事长兼首席执行官刘天文在京港数字经济合作论坛发表主旨演讲，深度分享软通动力在智能化时代的战略思考与实践成果。',
    category: '公司动态',
    source: 'isoftstone.com',
    sourceUrl: 'https://www.isoftstone.com/zh-cn/htmls/news/jinggang-forum.html',
    publishDate: '2026-01-30',
    coverImage: 'https://www.isoftstone.com/resources/zh-cn/uploads/20260206/2019651697568477184.jpg',
    localImage: '2026-01-30-jinggang.jpg',
    tags: ['京港论坛', '全栈智能', '数字化转型', '刘天文'],
    keyEntities: { companies: ['软通动力'], people: ['刘天文'], places: ['北京', '香港'] },
    sentiment: 'positive',
    content: `<h2>从软件服务到全栈智能</h2>
<p><strong>来源：软通动力官网</strong></p>
<img src="/images/news/2026-01-30-jinggang.jpg" alt="京港论坛" style="max-width:100%;border-radius:8px;margin:16px 0;">
<p>1月30日，"2026全球数字经济大会首场活动——京港数字经济合作论坛"在京隆重召开。本次论坛以"京港接力·赋能出海"为主题，由北京市经济和信息化局、香港投资推广署联合主办。</p>
<p>作为中国领先的全栈智能化产品与服务提供商，软通动力董事长兼首席执行官刘天文受邀出席，并发表"从软件服务到全栈智能——智能化、自主化、国际化的转型实践"的主旨演讲，深度分享了软通动力在智能化时代的战略思考与实践成果。</p>`,
  },
  {
    title: '软通动力×金盘科技联合发布：软通天璇AI Factory智能制造转型整体解决方案',
    summary: '软通动力联合金盘科技正式发布"软通天璇AI Factory智能制造解决方案"，已赋能零售、金融、制造、医药健康、能源、汽车等多个行业。',
    category: '产品发布',
    source: 'isoftstone.com',
    sourceUrl: 'https://www.isoftstone.com/zh-cn/htmls/news/ai-factory.html',
    publishDate: '2026-01-26',
    coverImage: 'https://www.isoftstone.com/resources/zh-cn/uploads/20260206/2019650349993127936.png',
    localImage: '2026-01-26-aifactory.png',
    tags: ['AI Factory', '金盘科技', '智能制造', '天璇'],
    keyEntities: { companies: ['软通动力', '金盘科技'], products: ['软通天璇AI Factory'] },
    sentiment: 'positive',
    content: `<h2>软通天璇AI Factory智能制造解决方案</h2>
<p><strong>来源：软通动力官网</strong></p>
<img src="/images/news/2026-01-26-aifactory.png" alt="AI Factory发布" style="max-width:100%;border-radius:8px;margin:16px 0;">
<p>依托全栈AI能力和深厚的制造行业积累，软通动力联合金盘科技，正式发布"软通天璇AI Factory智能制造解决方案"。</p>
<p>软通AI Factory智能转型解决方案已经赋能零售、金融、制造、医药健康、能源、汽车等多个行业。此次软通动力联手金盘科技正式发布"AI Factory"智能制造整体解决方案，旨在共同帮助制造业行业客户加速部署AI平台和AI应用，加速制造业向智能制造转型。</p>`,
  },
  {
    title: '软通动力与沈阳水务集团达成战略合作：以鸿蒙+AI重塑智能水务',
    summary: '软通动力与沈阳水务集团在北京举行战略合作签约仪式，基于鸿蒙技术推进水务全业务数字化，是"软硬一体、全栈智能"战略在水务领域的关键落地。',
    category: '生态合作',
    source: 'isoftstone.com',
    sourceUrl: 'https://www.isoftstone.com/zh-cn/htmls/news/shenyang-water.html',
    publishDate: '2026-01-22',
    coverImage: 'https://www.isoftstone.com/resources/zh-cn/uploads/20260206/2019649363698348032.jpg',
    localImage: '2026-01-22-shenyangwater.jpg',
    tags: ['鸿蒙', 'AI', '智能水务', '沈阳水务'],
    keyEntities: { companies: ['软通动力', '沈阳水务集团'], places: ['北京', '沈阳'] },
    sentiment: 'positive',
    content: `<h2>软通动力与沈阳水务集团达成战略合作</h2>
<p><strong>来源：软通动力官网</strong></p>
<img src="/images/news/2026-01-22-shenyangwater.jpg" alt="签约仪式" style="max-width:100%;border-radius:8px;margin:16px 0;">
<p>1月21日，软通动力信息技术（集团）股份有限公司与沈阳水务集团有限公司在北京成功举行战略合作签约仪式暨基于鸿蒙的水务全业务数字化合作启动仪式。</p>
<p>双方将围绕智能水务建设展开深度合作，共同推进水务行业的数字化与智能化转型。此次合作是软通动力"软硬一体、全栈智能"战略在水务领域的关键落地，也是其通过数字能源与智算服务及鸿蒙生态技术推动行业"绿色化"发展的重要实践。</p>`,
  },
  {
    title: '软通动力与居然之家开启战略合作2.0，共拓数智化、全球化与生态空间建设',
    summary: '软通动力与居然智家在北京签署战略合作协议，合作全面升级至"战略合作2.0"新阶段，围绕数智化转型升级、全球化市场联合拓展等领域展开深度合作。',
    category: '合作签约',
    source: 'isoftstone.com',
    sourceUrl: 'https://www.isoftstone.com/zh-cn/htmls/news/juran-home.html',
    publishDate: '2026-01-20',
    coverImage: 'https://www.isoftstone.com/resources/zh-cn/uploads/20260206/2019648050054918144.png',
    localImage: '2026-01-20-juranzhijia.png',
    tags: ['居然之家', '居然智家', '战略合作2.0', '数智化'],
    keyEntities: { companies: ['软通动力', '居然智家'] },
    sentiment: 'positive',
    content: `<h2>软通动力与居然之家开启战略合作2.0</h2>
<p><strong>来源：软通动力官网</strong></p>
<img src="/images/news/2026-01-20-juranzhijia.png" alt="签约仪式" style="max-width:100%;border-radius:8px;margin:16px 0;">
<p>1月19日，软通动力信息技术（集团）股份有限公司与居然智家新零售集团股份有限公司在北京居然大厦签署战略合作协议，共同宣告将双方合作全面升级至"战略合作2.0"新阶段。</p>
<p>双方将整合各自优势资源，围绕数智化转型升级、全球化市场联合拓展、生态空间建设等领域展开深度合作，共同推动行业发展，实现互利共赢。</p>`,
  },
  {
    title: '软通动力联合工信部电子五所中标国家AI应用首个操作系统中试基地',
    summary: '软通动力联合工信部电子五所成功中标国家人工智能应用中试基地东莞操作系统适配新建项目，为全国首个聚焦核心操作系统的国家级中试平台。',
    category: '技术创新',
    source: 'isoftstone.com',
    sourceUrl: 'https://www.isoftstone.com/zh-cn/htmls/news/ai-zhongshi.html',
    publishDate: '2026-01-15',
    coverImage: 'https://www.isoftstone.com/resources/zh-cn/uploads/20260206/2019647551922597888.png',
    localImage: '2026-01-15-zhongshi.png',
    tags: ['中试基地', '工信部电子五所', '操作系统', '国家AI应用'],
    keyEntities: { companies: ['软通动力', '工信部电子五所'], places: ['东莞'] },
    sentiment: 'positive',
    content: `<h2>软通动力中标国家AI应用首个操作系统中试基地</h2>
<p><strong>来源：软通动力官网</strong></p>
<img src="/images/news/2026-01-15-zhongshi.png" alt="中标喜报" style="max-width:100%;border-radius:8px;margin:16px 0;">
<p>近日，软通动力联合工业和信息化部电子第五研究所（中国赛宝实验室），成功中标国家人工智能应用中试基地东莞操作系统适配新建项目。</p>
<p>该项目作为全国首个聚焦于核心操作系统的国家级中试平台，标志着我国在构建自主人工智能软硬件生态体系上迈出坚实一步。</p>`,
  },
  {
    title: '软通国际CES 2026：以"全栈智能"打破边界，重塑中国科技企业出海范式',
    summary: '软通国际在CES 2026完成首次亮相，双展位联动展示"软硬一体、全栈智能"能力，正式发布全新品牌战略，海外业务规模同比增长超过200%。',
    category: '公司动态',
    source: '搜狐',
    sourceUrl: 'https://www.sohu.com/a/975660937_114838',
    publishDate: '2026-01-13',
    coverImage: 'https://q3.itc.cn/q_70/images03/20260113/2e961da3c3cf489cb7d4c2c4139d3a45.jpeg',
    localImage: '2026-01-13-ces.jpg',
    tags: ['CES 2026', '软通国际', '全栈智能', '出海2.0', '机械革命'],
    keyEntities: { companies: ['软通动力', '软通国际'], people: ['黄立'], places: ['拉斯维加斯'] },
    sentiment: 'positive',
    content: `<h2>软通国际CES 2026重磅发布</h2>
<p><strong>来源：搜狐</strong></p>
<img src="/images/news/2026-01-13-ces.jpg" alt="CES 2026" style="max-width:100%;border-radius:8px;margin:16px 0;">
<p>2026年1月6日至9日，全球科技产业的年度风向标——国际消费电子展（CES）在美国拉斯维加斯如期举行。软通动力旗下国际业务品牌 iSoftStone Digital 软通国际完成了其意义深远的首次亮相。</p>
<h3>双展位亮相</h3>
<p>本次CES，软通国际采用"双展位联动"方式。位于南一馆展位（LVCC South Hall 1 30513），作为中关村科学城代表，重点呈现"AI软件服务+AI终端+行业"综合解决方案。主展馆展位与钛媒体联合，主打视觉和体验，以"机械革命"新款AI PC、数字艺术方案吸引全球关注。</p>
<h3>出海2.0战略</h3>
<p>CES期间，软通国际正式发布全新品牌战略。软通动力国际业务总裁黄立指出软通国际已进入"出海2.0"阶段。2025年，软通国际海外业务规模同比增长超过200%，东南亚、中东、拉美等"一带一路"新兴市场成为核心增长极。</p>
<img src="/images/news/2026-01-13-ces2.jpg" alt="CES展位" style="max-width:100%;border-radius:8px;margin:16px 0;">
<h3>全栈智能产品</h3>
<ul>
<li><strong>机械革命 AIPC + 教育解决方案</strong>：已在巴基斯坦、沙特等市场规模化落地，交付数十万台设备</li>
<li><strong>软通华方 AI 液冷工作站</strong>：面向AI开发、工程设计与科研计算等高要求场景</li>
<li><strong>基于英伟达生态的企业级AI全栈方案</strong>：通过Merak AI工厂服务北美零售、新能源等行业</li>
<li><strong>CatalystM AI达人营销平台</strong>：在国际快消品牌实践中验证了高可扩展性</li>
</ul>`,
  },
  {
    title: '软通动力2025半年报：营收稳步攀升，全栈智能点亮发展新局',
    summary: '软通动力2025年上半年实现营收157.81亿元，同比增长25.99%，计算产品与智能电子业务营收同比增长72.77%，首次登榜《财富》中国500强。',
    category: '财报业绩',
    source: '美通社',
    sourceUrl: 'https://www.prnasia.com/story/501239-1.shtml',
    publishDate: '2025-08-28',
    coverImage: 'https://mma.prnasia.com/media2/2759879/image_5017798_3338244.jpg?p=medium600',
    localImage: '2025-08-28-bannianbao.jpg',
    tags: ['半年报', '营收157亿', '全栈智能', '财富500强'],
    keyEntities: { companies: ['软通动力'], numbers: ['157.81亿', '25.99%', '72.77%', '429名'] },
    sentiment: 'positive',
    content: `<h2>软通动力2025半年报：全栈智能点亮发展新局</h2>
<p><strong>来源：美通社</strong></p>
<img src="/images/news/2025-08-28-bannianbao.jpg" alt="软通华方新品" style="max-width:100%;border-radius:8px;margin:16px 0;">
<p>2025年8月27日，软通动力发布2025年半年度报告。2025年是国家"十四五"规划收官和"十五五"开局之年，也是软通动力成立20周年的重要节点。</p>
<p>2025年上半年，软通动力充分发挥软硬协同优势，驱动业务规模持续增长，实现整体营收157.81亿元，较上年同期增长25.99%。其中，计算产品与智能电子业务实现营收67.56亿元，较上年同期增长72.77%，占比42.81%。</p>
<h3>品牌升级战略领航</h3>
<p>公司明确"中国领先的全栈智能化产品与服务提供商"定位，以"软硬一体"为核心引擎，成功实现从"软件服务商"到"全栈智能化产品与服务提供商"的转型升级。</p>
<h3>计算产品与智能电子业务表现亮眼</h3>
<p>软通动力旗下机械革命推出耀世、苍龙、极光、蛟龙、星耀等系列高性能笔记本，稳居国产电竞PC第一阵营，国内游戏本市场份额提升至17%。推出恒悦品牌进军商用市场。</p>
<h3>国际业务：出海2.0战略启动</h3>
<p>软通动力全新推出"iSoftStone Digital 软通国际"品牌。马来西亚全球交付中心（GDC）正式落成，中标巴基斯坦10万台笔记本电脑项目、沙特政府3万台笔记本电脑SKD采购项目。</p>
<img src="/images/news/2025-08-28-jixiegeming.jpg" alt="机械革命&恒悦" style="max-width:100%;border-radius:8px;margin:16px 0;">`,
  },
  {
    title: '软通动力上半年营收同比增长约26%，软硬一体化初见成效',
    summary: '软通动力2025年上半年实现营收157.81亿元，同比增长25.99%。旗下机械革命稳居国产电竞PC第一阵营，"出海2.0"战略全面启动。',
    category: '行业报告',
    source: '证券时报',
    sourceUrl: 'https://www.stcn.com/article/detail/3290972.html',
    publishDate: '2025-08-28',
    coverImage: 'https://mma.prnasia.com/media2/2759880/image_5017798_3338416.jpg?p=medium600',
    localImage: '2025-08-28-ruanying.jpg',
    tags: ['营收157亿', '软硬一体', '机械革命', '出海2.0'],
    keyEntities: { companies: ['软通动力'], numbers: ['157.81亿', '25.99%', '17%'] },
    sentiment: 'positive',
    content: `<h2>软通动力上半年营收同比增长约26%</h2>
<p><strong>来源：证券时报</strong></p>
<img src="/images/news/2025-08-28-ruanying.jpg" alt="机械革命" style="max-width:100%;border-radius:8px;margin:16px 0;">
<p>8月27日晚间，软通动力(301236)发布2025年半年报。报告期内，公司实现营业收入157.81亿元，同比增长25.99%，归母净利润同比向好；第二季度实现营业收入87.7亿元，同比增长23.93%，环比增长25.10%，归母净利润0.55亿元。</p>
<h3>软件方面</h3>
<p>软通动力以人工智能技术为底层技术核心，打造"1+4+N"AI工程能力矩阵；构建以"天鸿操作系统SwanLinkOS+鸿鹄云管理平台"为核心的全产业链生态；布局20+矿鸿业务场景，完成60+矿鸿资质认证项目。</p>
<h3>硬件方面</h3>
<p>旗下机械革命推出耀世、苍龙、极光、蛟龙、星耀等多系列高性能笔记本，稳居国产电竞PC第一阵营，国内游戏本市场份额提升至17%；推出恒悦品牌进军商用市场。</p>
<h3>国际市场</h3>
<p>软通动力全新推出"iSoftStone Digital 软通国际"品牌，"出海 2.0"战略全面启动。在东南亚市场，马来西亚全球交付中心正式落成；在中东市场，与多个本地伙伴达成战略合作；中标巴基斯坦笔记本电脑采购项目。</p>`,
  },
];

// CES 文章第二张图
const CES_IMAGE_2 = 'https://q5.itc.cn/q_70/images03/20260113/d6508de634f042098d6dc82cf58a442a.jpeg';

async function main() {
  console.log(`[Seed-Real] === 下载封面图片 (${REAL_NEWS.length} 张) ===`);
  for (const article of REAL_NEWS) {
    console.log(`  ${article.localImage}`);
    await downloadImage(article.coverImage, article.localImage);
  }
  // 额外下载 CES 文章第二张图
  await downloadImage(CES_IMAGE_2, '2026-01-13-ces2.jpg');

  console.log(`\n[Seed-Real] === 初始化数据库 ===`);
  const db = await getDb(config.db.path);
  initSchema(db);

  // 清空旧数据
  console.log('[Seed-Real] 清空旧数据...');
  db.run('DELETE FROM news');

  console.log(`[Seed-Real] 插入 ${REAL_NEWS.length} 条真实新闻...`);
  let inserted = 0;

  for (const article of REAL_NEWS) {
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
          `/images/news/${article.localImage}`,  // 指向本地图片
          JSON.stringify(article.tags),
          JSON.stringify(article.keyEntities),
          article.sentiment,
        ]
      );
      inserted++;
    } catch (err) {
      console.error(`  [fail] ${article.title}: ${err.message}`);
    }
  }

  saveDb();
  console.log(`\n[Seed-Real] 完成。插入 ${inserted}/${REAL_NEWS.length} 条。`);

  // 验证
  const stats = queryAll("SELECT category, COUNT(*) as cnt FROM news GROUP BY category ORDER BY cnt DESC");
  console.log('\n[Seed-Real] 分类分布:');
  for (const row of stats) {
    console.log(`  ${row.category}: ${row.cnt}`);
  }

  // 检查图片文件
  const imgFiles = fs.readdirSync(imgDir);
  console.log(`\n[Seed-Real] 本地图片: ${imgFiles.length} 个`);
  for (const f of imgFiles) {
    const stat = fs.statSync(path.join(imgDir, f));
    console.log(`  ${f} (${(stat.size / 1024).toFixed(1)}KB)`);
  }

  closeDb();
  process.exit(0);
}

main().catch(err => {
  console.error('[Seed-Real] Fatal:', err);
  closeDb();
  process.exit(1);
});
