import type { ComponentType } from '../types';

export interface LibraryItem {
  componentType: ComponentType;
  label: string;
  icon: string;
  defaultData: Record<string, unknown>;
}

export const COMPONENT_LIBRARY: LibraryItem[] = [
  {
    componentType: 'power',
    label: 'مصدر طاقة (3-Phase)',
    icon: '⚡️',
    defaultData: {},
  },
  {
    componentType: 'motor',
    label: 'موتور حثي',
    icon: '⚙️',
    defaultData: {},
  },
  {
    componentType: 'pushButtonNO',
    label: 'زر ضغط (NO)',
    icon: '🔘',
    defaultData: { pressed: false },
  },
  {
    componentType: 'pushButtonNC',
    label: 'زر ضغط (NC)',
    icon: '🔴',
    defaultData: { pressed: false },
  },
  {
    componentType: 'contactor',
    label: 'كونتاكتور',
    icon: '🧲',
    defaultData: {},
  },
  {
    componentType: 'relay',
    label: 'ريلاي',
    icon: '🔁',
    defaultData: {},
  },
  {
    componentType: 'timer',
    label: 'تايمر (تأخير التشغيل)',
    icon: '⏱️',
    defaultData: { delaySeconds: 5 },
  },

  // ---- protective / manual switching gear ----
  {
    componentType: 'isolatorSwitch',
    label: 'مفتاح عزل يدوي',
    icon: '🔌',
    defaultData: { pressed: false },
  },
  {
    componentType: 'circuitBreaker',
    label: 'قاطع دائرة (MCB)',
    icon: '⛔',
    defaultData: { pressed: false },
  },
  {
    componentType: 'fuse',
    label: 'فيوز',
    icon: '🧯',
    defaultData: { pressed: false },
  },
  {
    componentType: 'overloadRelay',
    label: 'ريلاي حراري (Overload)',
    icon: '♨️',
    defaultData: { pressed: false },
  },

  // ---- mechanically actuated switches ----
  {
    componentType: 'emergencyStop',
    label: 'زر توقف طارئ (E-STOP)',
    icon: '🛑',
    defaultData: { pressed: false },
  },
  {
    componentType: 'limitSwitchNO',
    label: 'ليمت سويتش (NO)',
    icon: '📍',
    defaultData: { pressed: false },
  },
  {
    componentType: 'limitSwitchNC',
    label: 'ليمت سويتش (NC)',
    icon: '📍',
    defaultData: { pressed: false },
  },

  // ---- selector ----
  {
    componentType: 'selectorSwitch',
    label: 'مفتاح اختيار (Selector)',
    icon: '🎚️',
    defaultData: { pressed: false },
  },

  // ---- basic passives ----
  {
    componentType: 'resistor',
    label: 'مقاومة (Resistor)',
    icon: '🟫',
    defaultData: { value: '220Ω' },
  },
  {
    componentType: 'capacitor',
    label: 'مكثف (Capacitor)',
    icon: '🔵',
    defaultData: { value: '100µF' },
  },
  {
    componentType: 'inductor',
    label: 'ملف (Inductor)',
    icon: '🌀',
    defaultData: { value: '10mH' },
  },

  // ---- indicator / bus ----
  {
    componentType: 'pilotLamp',
    label: 'لمبة بيان (Pilot Lamp)',
    icon: '💡',
    defaultData: {},
  },
  {
    componentType: 'terminalBlock',
    label: 'بلوك توصيل (Terminal Block)',
    icon: '🟧',
    defaultData: {},
  },
];

export function labelForComponentType(type: ComponentType): string {
  return COMPONENT_LIBRARY.find((c) => c.componentType === type)?.label ?? type;
}
