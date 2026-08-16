// 多语言数据字典与翻译辅助函数。
// 车辆结构化字段在 src/data/cars.ts 中以中文存储，这里映射到四种展示语言。
// 服务端组件（如 generateMetadata）使用默认语言 en；客户端组件通过
// LanguageProvider 设置 activeLang 后即可自动跟随切换。

export type Lang = "zh" | "en" | "ar" | "ru";

export const SUPPORTED_LANGS: Lang[] = ["zh", "en", "ar", "ru"];

let activeLang: Lang = "en";

export function setActiveLang(lang: Lang) {
  activeLang = lang;
}

export function getActiveLang(): Lang {
  return activeLang;
}

// 每个字段：{ 中文值: { zh, en, ar, ru } }
type FieldDict = Record<string, Record<Lang, string>>;

function pick(dict: FieldDict, value: string, lang: Lang): string {
  const entry = dict[value];
  if (!entry) return value;
  return entry[lang] ?? entry.en ?? value;
}

const brandDict: FieldDict = {
  丰田: { zh: "丰田", en: "Toyota", ar: "تويوتا", ru: "Toyota" },
  宝马: { zh: "宝马", en: "BMW", ar: "بي إم دبليو", ru: "BMW" },
  奔驰: { zh: "奔驰", en: "Mercedes-Benz", ar: "مرسيدس-بنز", ru: "Mercedes-Benz" },
  雷克萨斯: { zh: "雷克萨斯", en: "Lexus", ar: "لكزس", ru: "Lexus" },
  本田: { zh: "本田", en: "Honda", ar: "هوندا", ru: "Honda" },
  奥迪: { zh: "奥迪", en: "Audi", ar: "أودي", ru: "Audi" },
  大众: { zh: "大众", en: "Volkswagen", ar: "فولكس فاجن", ru: "Volkswagen" },
  路虎: { zh: "路虎", en: "Land Rover", ar: "لاند روفر", ru: "Land Rover" },
  比亚迪: { zh: "比亚迪", en: "BYD", ar: "بي واي دي", ru: "BYD" },
  特斯拉: { zh: "特斯拉", en: "Tesla", ar: "تسلا", ru: "Tesla" },
  小鹏: { zh: "小鹏", en: "XPeng", ar: "إكس بنغ", ru: "XPeng" },
  蔚来: { zh: "蔚来", en: "NIO", ar: "نيو", ru: "NIO" },
  理想: { zh: "理想", en: "Li Auto", ar: "لي أوتو", ru: "Li Auto" },
  广汽埃安: { zh: "广汽埃安", en: "AION", ar: "أيون", ru: "AION" },
  吉利: { zh: "吉利", en: "Geely", ar: "جيلي", ru: "Geely" },
  长安: { zh: "长安", en: "Changan", ar: "شانجان", ru: "Changan" },
  哪吒: { zh: "哪吒", en: "NETA", ar: "نيتا", ru: "NETA" },
  零跑: { zh: "零跑", en: "Leapmotor", ar: "ليب موتور", ru: "Leapmotor" },
  上汽: { zh: "上汽", en: "Rising Auto", ar: "رايزينغ أوتو", ru: "Rising Auto" },
  东风: { zh: "东风", en: "Voyah", ar: "فوياه", ru: "Voyah" },
  凯迪拉克: { zh: "凯迪拉克", en: "Cadillac", ar: "كاديلاك", ru: "Cadillac" },
  昊铂: { zh: "昊铂", en: "Hyper", ar: "هايبر", ru: "Hyper" },
  高合: { zh: "高合", en: "HiPhi", ar: "هاي فاي", ru: "HiPhi" },
  腾势: { zh: "腾势", en: "Denza", ar: "دينزا", ru: "Denza" },
  智己: { zh: "智己", en: "IM Motors", ar: "آي إم موتورز", ru: "IM Motors" },
  阿维塔: { zh: "阿维塔", en: "Avatr", ar: "أفاتر", ru: "Avatr" },
  极越: { zh: "极越", en: "JIDU", ar: "جيدو", ru: "JIDU" },
  小米: { zh: "小米", en: "Xiaomi", ar: "شاومي", ru: "Xiaomi" },
};

// 车型名仅提供英文映射；阿拉伯语/俄语市场通常保留拉丁字母车型名，故回退英文。
const modelDict: Record<string, string> = {
  卡罗拉: "Corolla",
  凯美瑞: "Camry",
  RAV4: "RAV4",
  普拉多: "Prado",
  埃尔法: "Alphard",
  "3系": "3 Series",
  C级: "C-Class",
  ES: "ES",
  兰德酷路泽: "Land Cruiser",
  揽胜: "Range Rover",
  海狮: "Hiace",
  雅阁: "Accord",
  A6L: "A6L",
  途观L: "Tiguan L",
  Fortuner: "Fortuner",
  X5: "X5",
  GLE: "GLE",
  LX: "LX",
  赛那: "Sienna",
  帕萨特: "Passat",
  "CR-V": "CR-V",
  Q5L: "Q5L",
  "5系": "5 Series",
  E级: "E-Class",
  RX: "RX",
  思域: "Civic",
  迈腾: "Magotan",
  A4L: "A4L",
  X3: "X3",
  GLC: "GLC",
  NX: "NX",
  发现: "Discovery",
  汉兰达: "Highlander",
  途昂: "Teramont",
  "UR-V": "UR-V",
  Q7: "Q7",
  皇冠: "Crown",
  X1: "X1",
  A级: "A-Class",
  UX: "UX",
  威兰达: "Wildlander",
  高尔夫: "Golf",
  英仕派: "Inspire",
  Q3: "Q3",
  凌放: "Harrier",
  "1系": "1 Series",
  汉: "Han",
  秦PLUS: "Qin PLUS",
  海豹: "Seal",
  宋PLUS: "Song PLUS",
  "Model 3": "Model 3",
  "Model Y": "Model Y",
  P7: "P7",
  G9: "G9",
  ET5: "ET5",
  ES6: "ES6",
  L7: "L7",
  L8: "L8",
  元PLUS: "Yuan PLUS",
  "唐DM-p": "Tang DM-p",
  "AION Y": "AION Y",
  "AION V": "AION V",
  极氪001: "Zeekr 001",
  极氪007: "Zeekr 007",
  深蓝SL03: "Deepal SL03",
  深蓝S7: "Deepal S7",
  哪吒S: "NETA S",
  哪吒U: "NETA U",
  C11: "C11",
  C01: "C01",
  飞凡F7: "Rising F7",
  飞凡R7: "Rising R7",
  岚图FREE: "Voyah FREE",
  岚图追光: "Voyah Passion",
  i3: "i3",
  iX3: "iX3",
  EQE: "EQE",
  EQB: "EQB",
  "Q4 e-tron": "Q4 e-tron",
  "e-tron": "e-tron",
  "ID.4": "ID.4",
  "ID.6": "ID.6",
  LYRIQ: "LYRIQ",
  HT: "HT",
  GT: "GT",
  "HiPhi Y": "HiPhi Y",
  Z: "Z",
  D9: "D9",
  N7: "N7",
  LS6: "LS6",
  L6: "L6",
  "11": "11",
  "12": "12",
  "01": "01",
  SU7: "SU7",
};

const fuelTypeDict: FieldDict = {
  汽油: { zh: "汽油", en: "Petrol", ar: "بنزين", ru: "Бензин" },
  柴油: { zh: "柴油", en: "Diesel", ar: "ديزل", ru: "Дизель" },
  混动: { zh: "混动", en: "Hybrid", ar: "هجين", ru: "Гибрид" },
  纯电动: { zh: "纯电动", en: "BEV", ar: "كهربائي", ru: "Электро" },
  插电混动: { zh: "插电混动", en: "PHEV", ar: "هجين قابل للشحن", ru: "PHEV" },
  增程式: { zh: "增程式", en: "EREV", ar: "موسّع المدى", ru: "EREV" },
};

const transmissionDict: FieldDict = {
  自动: { zh: "自动", en: "Automatic", ar: "أوتوماتيك", ru: "Автомат" },
  手动: { zh: "手动", en: "Manual", ar: "يدوي", ru: "Механика" },
};

const emissionDict: FieldDict = {
  国VI: { zh: "国VI", en: "China VI", ar: "الصين VI", ru: "Китай VI" },
  国V: { zh: "国V", en: "China V", ar: "الصين V", ru: "Китай V" },
  电动: { zh: "电动", en: "Electric", ar: "كهربائي", ru: "Электро" },
};

const colorDict: FieldDict = {
  白色: { zh: "白色", en: "White", ar: "أبيض", ru: "Белый" },
  黑色: { zh: "黑色", en: "Black", ar: "أسود", ru: "Чёрный" },
  银色: { zh: "银色", en: "Silver", ar: "فضي", ru: "Серебристый" },
  蓝色: { zh: "蓝色", en: "Blue", ar: "أزرق", ru: "Синий" },
  红色: { zh: "红色", en: "Red", ar: "أحمر", ru: "Красный" },
  灰色: { zh: "灰色", en: "Grey", ar: "رمادي", ru: "Серый" },
  绿色: { zh: "绿色", en: "Green", ar: "أخضر", ru: "Зелёный" },
  海湾蓝: { zh: "海湾蓝", en: "Bay Blue", ar: "أزرق خليجي", ru: "Голубой" },
  金色: { zh: "金色", en: "Gold", ar: "ذهبي", ru: "Золотой" },
};

const countryDict: FieldDict = {
  非洲: { zh: "非洲", en: "Africa", ar: "أفريقيا", ru: "Африка" },
  中东: { zh: "中东", en: "Middle East", ar: "الشرق الأوسط", ru: "Ближний Восток" },
  东南亚: { zh: "东南亚", en: "Southeast Asia", ar: "جنوب شرق آسيا", ru: "Юго-Восточная Азия" },
  欧美: { zh: "欧美", en: "Europe & Americas", ar: "أوروبا والأمريكتان", ru: "Европа и Америка" },
  欧洲: { zh: "欧洲", en: "Europe", ar: "أوروبا", ru: "Европа" },
  北美: { zh: "北美", en: "North America", ar: "أمريكا الشمالية", ru: "Северная Америка" },
  澳洲: { zh: "澳洲", en: "Australia", ar: "أستراليا", ru: "Австралия" },
  俄罗斯: { zh: "俄罗斯", en: "Russia", ar: "روسيا", ru: "Россия" },
  中亚: { zh: "中亚", en: "Central Asia", ar: "آسيا الوسطى", ru: "Центральная Азия" },
  港澳: { zh: "港澳", en: "HK & Macau", ar: "هونغ كونغ وماكاو", ru: "Гонконг и Макао" },
};

const cityDict: Record<string, string> = {
  广州: "Guangzhou",
  深圳: "Shenzhen",
  天津: "Tianjin",
  上海: "Shanghai",
  北京: "Beijing",
  东莞: "Dongguan",
  杭州: "Hangzhou",
  佛山: "Foshan",
  成都: "Chengdu",
  西安: "Xi'an",
  郑州: "Zhengzhou",
  武汉: "Wuhan",
  南京: "Nanjing",
  济南: "Jinan",
  青岛: "Qingdao",
  长沙: "Changsha",
  沈阳: "Shenyang",
  大连: "Dalian",
  苏州: "Suzhou",
  昆明: "Kunming",
  厦门: "Xiamen",
  哈尔滨: "Harbin",
  长春: "Changchun",
  南宁: "Nanning",
  石家庄: "Shijiazhuang",
  福州: "Fuzhou",
  南昌: "Nanchang",
  贵阳: "Guiyang",
  乌鲁木齐: "Urumqi",
  兰州: "Lanzhou",
  银川: "Yinchuan",
  西宁: "Xining",
  呼和浩特: "Hohhot",
  拉萨: "Lhasa",
  海口: "Haikou",
  宁波: "Ningbo",
  重庆: "Chongqing",
  嘉兴: "Jiaxing",
  金华: "Jinhua",
};

export function tBrand(value: string, lang: Lang = activeLang): string {
  return pick(brandDict, value, lang);
}

export function tModel(value: string, lang: Lang = activeLang): string {
  // 车型名：英文映射，其余语言回退英文（拉丁字母为行业惯例）。
  if (lang === "zh") return value;
  return modelDict[value] ?? value;
}

export function tFuelType(value: string, lang: Lang = activeLang): string {
  return pick(fuelTypeDict, value, lang);
}

export function tTransmission(value: string, lang: Lang = activeLang): string {
  return pick(transmissionDict, value, lang);
}

export function tEmission(value: string, lang: Lang = activeLang): string {
  return pick(emissionDict, value, lang);
}

export function tColor(value: string, lang: Lang = activeLang): string {
  return pick(colorDict, value, lang);
}

export function tCountry(value: string, lang: Lang = activeLang): string {
  return pick(countryDict, value, lang);
}

export function tCity(value: string, lang: Lang = activeLang): string {
  if (lang === "zh") return value;
  return cityDict[value] ?? value;
}

/** 中文里程 "0.5万公里" → 本地化距离 "5,000 km"。 */
export function formatMileage(value: string): string {
  const m = value.match(/([\d.]+)\s*万公里/);
  if (m) {
    const km = Math.round(parseFloat(m[1]) * 10000);
    return `${km.toLocaleString("en-US")} km`;
  }
  const m2 = value.match(/([\d.]+)\s*公里/);
  if (m2) {
    const km = Math.round(parseFloat(m2[1]));
    return `${km.toLocaleString("en-US")} km`;
  }
  return value;
}
