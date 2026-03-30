export type Severity = 'critical' | 'major' | 'moderate' | 'minor';
export type IncidentType = 'accident' | 'construction' | 'flood' | 'congestion';

export interface Incident {
  id: string;
  type: IncidentType;
  severity: Severity;
  location: {
    en: string;
    th: string;
  };
  description: {
    en: string;
    th: string;
  };
  lat: number;
  lng: number;
  clearanceTime: string;
  timestamp: string;
}

export const mockIncidents: Incident[] = [
{
  id: '1',
  type: 'accident',
  severity: 'critical',
  location: {
    en: 'Sukhumvit Road (Asok Intersection)',
    th: 'ถนนสุขุมวิท (แยกอโศก)'
  },
  description: {
    en: 'Multi-vehicle collision blocking 2 lanes. Severe delays expected.',
    th: 'รถชนหลายคัน กีดขวาง 2 ช่องจราจร คาดว่าจะล่าช้าอย่างหนัก'
  },
  lat: 13.7367,
  lng: 100.561,
  clearanceTime: '2 hours',
  timestamp: '10 mins ago'
},
{
  id: '2',
  type: 'flood',
  severity: 'major',
  location: { en: 'Ratchadaphisek Road', th: 'ถนนรัชดาภิเษก' },
  description: {
    en: 'Deep water logging after heavy rain. Avoid left lane.',
    th: 'น้ำท่วมขังลึกหลังฝนตกหนัก โปรดหลีกเลี่ยงเลนซ้าย'
  },
  lat: 13.7845,
  lng: 100.5736,
  clearanceTime: '3 hours',
  timestamp: '25 mins ago'
},
{
  id: '3',
  type: 'congestion',
  severity: 'moderate',
  location: { en: 'Silom Road', th: 'ถนนสีลม' },
  description: {
    en: 'Heavy rush hour traffic moving slowly.',
    th: 'การจราจรหนาแน่นในช่วงชั่วโมงเร่งด่วน เคลื่อนตัวได้ช้า'
  },
  lat: 13.7271,
  lng: 100.5284,
  clearanceTime: '1 hour',
  timestamp: 'Just now'
},
{
  id: '4',
  type: 'construction',
  severity: 'minor',
  location: { en: 'Lat Phrao Road', th: 'ถนนลาดพร้าว' },
  description: {
    en: 'Ongoing MRT construction. Right lane closed.',
    th: 'กำลังก่อสร้างรถไฟฟ้า MRT ปิดช่องจราจรขวา'
  },
  lat: 13.804,
  lng: 100.5746,
  clearanceTime: 'Ongoing',
  timestamp: '2 hours ago'
},
{
  id: '5',
  type: 'accident',
  severity: 'major',
  location: { en: 'Rama IV Road', th: 'ถนนพระราม 4' },
  description: {
    en: 'Motorcycle accident near Lumphini Park. Emergency services on site.',
    th: 'อุบัติเหตุรถจักรยานยนต์ใกล้สวนลุมพินี เจ้าหน้าที่ฉุกเฉินอยู่ในพื้นที่'
  },
  lat: 13.7289,
  lng: 100.5441,
  clearanceTime: '45 mins',
  timestamp: '15 mins ago'
},
{
  id: '6',
  type: 'congestion',
  severity: 'critical',
  location: { en: 'Vibhavadi Rangsit Road', th: 'ถนนวิภาวดีรังสิต' },
  description: {
    en: 'Standstill traffic outbound due to earlier accident.',
    th: 'การจราจรหยุดนิ่งขาออกเนื่องจากอุบัติเหตุก่อนหน้านี้'
  },
  lat: 13.82,
  lng: 100.56,
  clearanceTime: '1.5 hours',
  timestamp: '5 mins ago'
},
{
  id: '7',
  type: 'construction',
  severity: 'moderate',
  location: { en: 'Phahonyothin Road', th: 'ถนนพหลโยธิน' },
  description: {
    en: 'Road resurfacing work. Speed limit reduced.',
    th: 'งานปรับปรุงผิวจราจร ลดความเร็วที่กำหนด'
  },
  lat: 13.832,
  lng: 100.575,
  clearanceTime: 'Until tomorrow',
  timestamp: '1 day ago'
},
{
  id: '8',
  type: 'flood',
  severity: 'minor',
  location: { en: 'Sukhumvit Soi 71', th: 'สุขุมวิท ซอย 71' },
  description: {
    en: 'Minor surface water. Passable with caution.',
    th: 'มีน้ำท่วมขังเล็กน้อยบนพื้นผิวจราจร ขับผ่านได้ด้วยความระมัดระวัง'
  },
  lat: 13.72,
  lng: 100.595,
  clearanceTime: '1 hour',
  timestamp: '40 mins ago'
}];


export interface RouteSummary {
  travel_time_mins: number;
  length_km: number;
  traffic_delay_mins: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: {en: string;th: string;};
  intent?: string;
  isLive?: boolean;
  focus_lat?: number;
  focus_lng?: number;
  route_points?: [number, number][];
  route_summary?: RouteSummary;
  suggested_roads?: string[];
}

export const mockChatHistory: ChatMessage[] = [
{
  id: 'msg1',
  sender: 'user',
  text: {
    en: 'How is the traffic on Sukhumvit right now?',
    th: 'ตอนนี้การจราจรบนถนนสุขุมวิทเป็นอย่างไรบ้าง?'
  }
},
{
  id: 'msg2',
  sender: 'ai',
  text: {
    en: 'There is currently a critical accident at the Asok Intersection blocking 2 lanes. Expect severe delays of up to 2 hours. I recommend using Phetchaburi Road as an alternative route.',
    th: 'ขณะนี้มีอุบัติเหตุรุนแรงที่แยกอโศก กีดขวาง 2 ช่องจราจร คาดว่าจะล่าช้าอย่างหนักถึง 2 ชั่วโมง ขอแนะนำให้ใช้ถนนเพชรบุรีเป็นเส้นทางเลี่ยง'
  },
  intent: 'chat.intent.traffic',
  isLive: true
}];