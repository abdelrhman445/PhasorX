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
];

export function labelForComponentType(type: ComponentType): string {
  return COMPONENT_LIBRARY.find((c) => c.componentType === type)?.label ?? type;
}
