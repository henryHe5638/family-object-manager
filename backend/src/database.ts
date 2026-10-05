import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { encryptPassword } from './utils/crypto';

const defaultDbPath = path.join(__dirname, '../database.sqlite');
const dbPath = process.env.DB_PATH || defaultDbPath;
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}
const db: Database.Database = new Database(dbPath);

// 初始化数据库表
export function initDatabase() {
  // 用户表 - 添加role字段
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      email TEXT,
      role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'user')),
      disabled INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 系统配置表
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 地点表
  db.exec(`
    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // 大类表（原categories表改为category_groups）
  db.exec(`
    CREATE TABLE IF NOT EXISTS category_groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 物品类目表（具体物品名称）
  db.exec(`
    CREATE TABLE IF NOT EXISTS item_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      group_id INTEGER NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (group_id) REFERENCES category_groups(id) ON DELETE CASCADE
    )
  `);

  // 抽屉表
  db.exec(`
    CREATE TABLE IF NOT EXISTS drawers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      qr_code TEXT UNIQUE,
      image_url TEXT,
      image_data TEXT,
      is_private INTEGER DEFAULT 0,
      location_id INTEGER,
      parent_id INTEGER,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (location_id) REFERENCES locations(id),
      FOREIGN KEY (parent_id) REFERENCES drawers(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // 物品表 - item_category_id改为关联item_categories
  db.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      brand TEXT,
      size TEXT,
      item_category_id INTEGER,
      location_id INTEGER,
      drawer_id INTEGER,
      purchase_date DATE,
      production_date DATE,
      purchase_price REAL,
      expiry_date DATE,
      quantity INTEGER DEFAULT 1,
      is_private INTEGER DEFAULT 0,
      image_url TEXT,
      image_data TEXT,
      qr_code TEXT UNIQUE,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (item_category_id) REFERENCES item_categories(id),
      FOREIGN KEY (location_id) REFERENCES locations(id),
      FOREIGN KEY (drawer_id) REFERENCES drawers(id),
      FOREIGN KEY (created_by) REFERENCES users(id)
    )
  `);

  // 物品状态字段迁移：stored=在库, in_use=使用中, discarded=已丢弃
  const itemColumns = db.prepare("PRAGMA table_info(items)").all() as any[];
  if (!itemColumns.some((col) => col.name === 'status')) {
    db.exec(`ALTER TABLE items ADD COLUMN status TEXT DEFAULT 'stored'`);
    console.log('物品状态字段迁移完成');
  }

  // 生产日期字段迁移
  if (!itemColumns.some((col) => col.name === 'production_date')) {
    db.exec(`ALTER TABLE items ADD COLUMN production_date DATE`);
    console.log('生产日期字段迁移完成');
  }

  // 品牌字段迁移
  if (!itemColumns.some((col) => col.name === 'brand')) {
    db.exec(`ALTER TABLE items ADD COLUMN brand TEXT`);
    console.log('品牌字段迁移完成');
  }

  // 大小字段迁移（重量/体积/尺码等自由文本）
  if (!itemColumns.some((col) => col.name === 'size')) {
    db.exec(`ALTER TABLE items ADD COLUMN size TEXT`);
    console.log('大小字段迁移完成');
  }

  // 私人物品/私人抽屉标记迁移：is_private=1 仅创建者可见，0 所有人可见
  // 历史数据回填为私有，保持迁移前"仅自己可见"的行为不变
  const drawerColumns = db.prepare("PRAGMA table_info(drawers)").all() as any[];
  if (!itemColumns.some((col) => col.name === 'is_private')) {
    db.exec(`ALTER TABLE items ADD COLUMN is_private INTEGER DEFAULT 0`);
    db.exec(`UPDATE items SET is_private = 1`);
    console.log('私人物品字段迁移完成');
  }
  if (!drawerColumns.some((col) => col.name === 'is_private')) {
    db.exec(`ALTER TABLE drawers ADD COLUMN is_private INTEGER DEFAULT 0`);
    db.exec(`UPDATE drawers SET is_private = 1`);
    console.log('私人抽屉字段迁移完成');
  }

  // 物品类目与品类的多对多映射表：同名物品视为一个，可归属多个品类
  db.exec(`
    CREATE TABLE IF NOT EXISTS item_category_map (
      item_category_id INTEGER NOT NULL,
      group_id INTEGER NOT NULL,
      PRIMARY KEY (item_category_id, group_id),
      FOREIGN KEY (item_category_id) REFERENCES item_categories(id) ON DELETE CASCADE,
      FOREIGN KEY (group_id) REFERENCES category_groups(id) ON DELETE CASCADE
    )
  `);

  // 历史数据迁移：按名称合并重复的物类类目，并填充映射
  const mapCount = db.prepare('SELECT COUNT(*) as c FROM item_category_map').get() as any;
  if (mapCount.c === 0) {
    const allCats = db.prepare('SELECT id, name, group_id FROM item_categories ORDER BY id').all() as any[];
    const nameToId = new Map<string, number>();
    const remap = new Map<number, number>();
    const insertMap = db.prepare('INSERT OR IGNORE INTO item_category_map (item_category_id, group_id) VALUES (?, ?)');
    const updateItemCat = db.prepare('UPDATE items SET item_category_id = ? WHERE item_category_id = ?');

    for (const cat of allCats) {
      const key = (cat.name || '').trim();
      let canonical = nameToId.get(key);
      if (canonical === undefined) {
        nameToId.set(key, cat.id);
        canonical = cat.id;
      } else {
        remap.set(cat.id, canonical);
      }
      insertMap.run(canonical, cat.group_id);
    }

    for (const [dupId, canonicalId] of remap) {
      updateItemCat.run(canonicalId, dupId);
      db.prepare('DELETE FROM item_categories WHERE id = ?').run(dupId);
    }
    if (remap.size > 0) {
      console.log(`同名物品类目合并完成，共合并 ${remap.size} 个`);
    }
  }

  // 物品名称全局唯一
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_item_categories_name ON item_categories(name)');

  // 初始化默认配置，使用环境变量
  const defaultSettings = [
    ['allow_guest_register', process.env.ALLOW_GUEST_REGISTER || 'true'],
    ['site_url', process.env.SITE_URL || 'http://localhost:5174']
  ];
  
  const insertSetting = db.prepare('INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)');
  defaultSettings.forEach(([key, value]) => {
    insertSetting.run(key, value);
  });

  // 如果没有用户，自动创建一个默认管理员（便于首次使用）
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
  if (userCount.count === 0) {
    // 从环境变量读取初始管理员信息
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const adminEmail = process.env.ADMIN_EMAIL || '';
    
    // 前端会对密码进行 SHA256 加密后发送
    // 所以初始密码也需要先用 SHA256 加密，然后再用 bcrypt 加密存储
    const clientEncryptedPassword = encryptPassword(adminPassword); // SHA256
    const hashedPassword = bcrypt.hashSync(clientEncryptedPassword, 10); // bcrypt
    
    const defaultAdmin = {
      username: adminUsername,
      password: hashedPassword,
      email: adminEmail,
      role: 'admin'
    };
    const insertUser = db.prepare('INSERT OR IGNORE INTO users (username, password, email, role) VALUES (?, ?, ?, ?)');
    insertUser.run(defaultAdmin.username, defaultAdmin.password, defaultAdmin.email, defaultAdmin.role);
    console.log(`已创建默认管理员: ${adminUsername} (密码: ${adminPassword})`);
  }
  console.log('数据库表初始化完成');
}

// 插入内置常用大类和物品
export function seedDefaultCategories() {
  const categories = [
    {
      group: '食品',
      icon: '🍎',
      items: ['大米', '面粉', '食用油', '酱油', '醋', '盐', '糖', '味精', '鸡精', '大葱', '生姜', '大蒜', '洋葱', '土豆', '红薯', '胡萝卜', '白菜', '西红柿', '黄瓜', '茄子', '辣椒', '青椒', '芹菜', '菠菜', '生菜', '韭菜']
    },
    {
      group: '调味品',
      icon: '🧂',
      items: ['料酒', '蚝油', '豆瓣酱', '芝麻油', '花椒', '八角', '桂皮', '香叶', '孜然', '胡椒粉', '辣椒粉', '十三香', '番茄酱', '沙拉酱', '老干妈', '海鲜酱', '甜面酱', '黄豆酱']
    },
    {
      group: '干货',
      icon: '🌾',
      items: ['木耳', '香菇', '银耳', '海带', '紫菜', '粉丝', '红枣', '枸杞', '桂圆', '莲子', '百合', '山药', '腐竹', '笋干', '虾米', '鱿鱼干']
    },
    {
      group: '零食',
      icon: '🍪',
      items: ['饼干', '薯片', '巧克力', '糖果', '坚果', '瓜子', '花生', '开心果', '腰果', '核桃', '杏仁', '夏威夷果', '松子', '碧根果', '榛子', '果冻', '话梅', '牛肉干', '猪肉脯', '鱼片']
    },
    {
      group: '饮品',
      icon: '🥤',
      items: ['茶叶', '咖啡', '牛奶', '酸奶', '果汁', '可乐', '雪碧', '矿泉水', '啤酒', '白酒', '红酒', '豆浆', '奶茶', '冰红茶', '绿茶', '乌龙茶', '普洱茶', '红茶']
    },
    {
      group: '日用品',
      icon: '🧴',
      items: ['洗发水', '沐浴露', '牙膏', '牙刷', '毛巾', '香皂', '洗手液', '纸巾', '卫生纸', '湿巾', '洗洁精', '洗衣液', '洗衣粉', '柔顺剂', '漂白剂', '衣架', '晾衣架', '脸盆', '水桶']
    },
    {
      group: '厨房用品',
      icon: '🍳',
      items: ['锅', '碗', '盘子', '筷子', '勺子', '刀', '砧板', '保鲜膜', '保鲜袋', '铝箔纸', '厨房纸', '抹布', '海绵', '刷子', '炒锅', '蒸锅', '汤锅', '煎锅', '电饭煲', '微波炉碗', '保温杯', '饭盒']
    },
    {
      group: '药品',
      icon: '💊',
      items: ['感冒药', '退烧药', '止痛药', '消炎药', '创可贴', '碘酒', '酒精', '棉签', '纱布', '体温计', '血压计', '止咳糖浆', '维生素C', '维生素B', '钙片', '肠胃药', '眼药水', '风油精', '清凉油']
    },
    {
      group: '文具',
      icon: '✏️',
      items: ['笔', '笔记本', '橡皮', '尺子', '剪刀', '胶水', '胶带', '订书机', '回形针', '便签', '文件夹', '档案袋', '计算器', '修正液', '铅笔', '圆珠笔', '中性笔', '荧光笔', '水彩笔', '画笔']
    },
    {
      group: '工具',
      icon: '🔧',
      items: ['螺丝刀', '扳手', '锤子', '钳子', '电钻', '卷尺', '手电筒', '胶枪', '美工刀', '老虎钳', '锯子', '水平仪', '螺丝批', '万用表', '电烙铁', '钢丝钳', '斜口钳']
    },
    {
      group: '电子产品',
      icon: '📱',
      items: ['充电器', '数据线', '充电宝', '耳机', '鼠标', '键盘', 'U盘', '硬盘', '路由器', '插座', '转换器', '电池', '内存卡', '读卡器', '摄像头', '音箱', '麦克风', '鼠标垫', '手机壳', '钢化膜']
    },
    {
      group: '清洁用品',
      icon: '🧹',
      items: ['扫把', '拖把', '垃圾袋', '垃圾桶', '吸尘器', '清洁剂', '消毒液', '玻璃水', '除尘掸', '地板清洁剂', '马桶清洁剂', '油污清洁剂', '钢丝球', '洗碗布', '手套']
    },
    {
      group: '个人护理',
      icon: '💄',
      items: ['护肤水', '乳液', '面霜', '面膜', '洗面奶', '卸妆水', '防晒霜', '口红', '粉底液', '眉笔', '睫毛膏', '指甲油', '梳子', '发卡', '发绳', '剃须刀', '化妆棉', '棉签']
    },
    {
      group: '母婴用品',
      icon: '🍼',
      items: ['奶瓶', '奶嘴', '奶粉', '尿不湿', '湿巾', '爽身粉', '婴儿洗发水', '婴儿沐浴露', '婴儿霜', '体温计', '奶瓶刷', '消毒锅', '围兜', '口水巾', '婴儿车', '背带', '安抚奶嘴']
    },
    {
      group: '宠物用品',
      icon: '🐾',
      items: ['猫粮', '狗粮', '猫砂', '宠物零食', '宠物玩具', '猫爬架', '狗窝', '猫窝', '宠物牵引绳', '宠物碗', '宠物梳子', '宠物洗澡液', '宠物除臭剂', '猫抓板']
    },
    {
      group: '五金建材',
      icon: '🔩',
      items: ['螺丝', '钉子', '膨胀螺丝', '合页', '门锁', '拉手', '挂钩', '铁丝', '钢丝', '胶带', '防水胶', '玻璃胶', '油漆', '刷子', '砂纸']
    },
    {
      group: '纸制品',
      icon: '📄',
      items: ['A4纸', '复印纸', '打印纸', '相纸', '卡纸', '餐巾纸', '抽纸', '手帕纸', '厨房纸', '卫生纸', '湿巾纸', '纸杯', '纸盘', '纸袋']
    },
    {
      group: '户外运动',
      icon: '⚽',
      items: ['帐篷', '睡袋', '登山包', '防潮垫', '户外刀具', '指南针', '手电筒', '头灯', '水壶', '保温杯', '户外锅具', '烧烤架', '瑜伽垫', '跳绳', '哑铃', '篮球', '足球', '羽毛球拍']
    },
    {
      group: '服饰鞋帽',
      icon: '👔',
      items: ['T恤', '衬衫', '外套', '毛衣', '羽绒服', '卫衣', '风衣', '西装', '连衣裙', '半身裙', '牛仔裤', '休闲裤', '运动裤', '短裤', '西裤', '运动鞋', '皮鞋', '凉鞋', '拖鞋', '靴子', '高跟鞋', '帆布鞋', '袜子', '内衣', '内裤', '帽子', '围巾', '手套', '腰带', '包包', '太阳镜']
    }
  ];

  const insertGroup = db.prepare('INSERT INTO category_groups (name, icon, description) VALUES (?, ?, ?)');
  const insertItem = db.prepare('INSERT INTO item_categories (name, group_id, description) VALUES (?, ?, ?)');
  const findGroup = db.prepare('SELECT id FROM category_groups WHERE name = ?');
  const findItemByName = db.prepare('SELECT id FROM item_categories WHERE name = ?');
  const insertMap = db.prepare('INSERT OR IGNORE INTO item_category_map (item_category_id, group_id) VALUES (?, ?)');

  let addedGroups = 0;
  categories.forEach(cat => {
    // 按名称检查，已存在的大类跳过（兼容已初始化的数据库）
    const existingGroup: any = findGroup.get(cat.group);
    let groupId: number;
    if (existingGroup) {
      groupId = existingGroup.id;
    } else {
      const result = insertGroup.run(cat.group, cat.icon, `${cat.group}类商品`);
      groupId = Number(result.lastInsertRowid);
      addedGroups++;
    }

    cat.items.forEach(item => {
      // 同名物品视为一个：已存在则补充品类映射
      const existingItem: any = findItemByName.get(item);
      if (existingItem) {
        insertMap.run(existingItem.id, groupId);
      } else {
        const result = insertItem.run(item, groupId, `${cat.group} - ${item}`);
        insertMap.run(Number(result.lastInsertRowid), groupId);
      }
    });
  });

  console.log(addedGroups > 0 ? `内置类目更新完成，新增 ${addedGroups} 个大类` : '内置类目已存在，跳过初始化');
}

export default db;
