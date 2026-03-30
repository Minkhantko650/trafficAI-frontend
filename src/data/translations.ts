export type Language = 'en' | 'th';

export const translations: Record<string, Record<Language, string>> = {
  // Navbar
  'app.title': { en: 'Bangkok Traffic Assistant', th: 'ผู้ช่วยจราจรกรุงเทพฯ' },
  'nav.home': { en: 'Home', th: 'หน้าแรก' },
  'nav.chat': { en: 'Chat', th: 'แชท' },
  'nav.map': { en: 'Traffic Map', th: 'แผนที่จราจร' },
  'nav.alerts': { en: 'Alerts', th: 'การแจ้งเตือน' },

  // Home
  'home.hero.title': {
    en: 'Smart Bangkok Traffic Assistant',
    th: 'ผู้ช่วยจราจรอัจฉริยะกรุงเทพฯ'
  },
  'home.hero.subtitle': {
    en: 'Check traffic, accidents, and best routes in real time',
    th: 'เช็คสภาพการจราจร อุบัติเหตุ และเส้นทางที่ดีที่สุดแบบเรียลไทม์'
  },
  'home.search.placeholder': {
    en: 'Where do you want to go?',
    th: 'คุณต้องการไปที่ไหน?'
  },

  'home.action.traffic.title': { en: 'Check Traffic', th: 'เช็คการจราจร' },
  'home.action.traffic.desc': {
    en: 'Live updates on major roads',
    th: 'อัปเดตสดบนถนนสายหลัก'
  },
  'home.action.map.title': { en: 'View Traffic Map', th: 'ดูแผนที่จราจร' },
  'home.action.map.desc': {
    en: 'Interactive city overview',
    th: 'ภาพรวมเมืองแบบโต้ตอบ'
  },
  'home.action.alerts.title': { en: 'See Alerts', th: 'ดูการแจ้งเตือน' },
  'home.action.alerts.desc': {
    en: 'Accidents and roadworks',
    th: 'อุบัติเหตุและการทำถนน'
  },
  'home.action.advice.title': { en: 'Travel Advice', th: 'คำแนะนำการเดินทาง' },
  'home.action.advice.desc': {
    en: 'AI-powered route planning',
    th: 'วางแผนเส้นทางด้วย AI'
  },

  'home.recent_alerts': {
    en: 'Recent Traffic Alerts',
    th: 'การแจ้งเตือนการจราจรล่าสุด'
  },
  'home.view_all': { en: 'View all alerts', th: 'ดูการแจ้งเตือนทั้งหมด' },

  // Chat
  'chat.input.placeholder': {
    en: 'Ask about traffic, routes, or delays...',
    th: 'ถามเกี่ยวกับการจราจร เส้นทาง หรือความล่าช้า...'
  },
  'chat.intent.traffic': { en: 'Traffic Query', th: 'สอบถามการจราจร' },
  'chat.live_data': { en: 'Live Data', th: 'ข้อมูลสด' },
  'chat.suggestion.1': {
    en: 'Is there traffic right now?',
    th: 'ตอนนี้รถติดไหม?'
  },
  'chat.suggestion.2': {
    en: 'Any accidents in Bangkok?',
    th: 'มีอุบัติเหตุในกรุงเทพฯ ไหม?'
  },
  'chat.suggestion.3': {
    en: 'Best route to avoid congestion?',
    th: 'เส้นทางที่ดีที่สุดเพื่อหลีกเลี่ยงรถติด?'
  },
  'chat.suggestion.4': {
    en: 'How long will delays last?',
    th: 'ความล่าช้าจะนานแค่ไหน?'
  },

  // Alerts
  'alerts.title': { en: 'Traffic Alerts', th: 'การแจ้งเตือนการจราจร' },
  'alerts.filter.severity': { en: 'Severity', th: 'ความรุนแรง' },
  'alerts.filter.type': { en: 'Type', th: 'ประเภท' },
  'alerts.filter.all': { en: 'All', th: 'ทั้งหมด' },
  'alerts.clearance': { en: 'Est. clearance:', th: 'คาดว่าจะคลี่คลาย:' },

  // Map
  'map.recenter': { en: 'Recenter Map', th: 'จัดกึ่งกลางแผนที่' },
  'map.incidents': { en: 'Incidents', th: 'เหตุการณ์' },
  'map.drag_up': { en: 'Drag up for list', th: 'ลากขึ้นเพื่อดูรายการ' },

  // Severities
  'severity.critical': { en: 'Critical', th: 'วิกฤต' },
  'severity.major': { en: 'Major', th: 'รุนแรง' },
  'severity.moderate': { en: 'Moderate', th: 'ปานกลาง' },
  'severity.minor': { en: 'Minor', th: 'เล็กน้อย' },

  // Types
  'type.accident': { en: 'Accident', th: 'อุบัติเหตุ' },
  'type.construction': { en: 'Construction', th: 'ก่อสร้าง' },
  'type.flood': { en: 'Flood', th: 'น้ำท่วม' },
  'type.congestion': { en: 'Congestion', th: 'รถติด' }
};