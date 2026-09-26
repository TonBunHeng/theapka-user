export const FONT_OPTIONS = [
  { value: 'moul', label: 'Moul', name: 'Moul', label_kh: 'អក្សរមូល' },
  { value: 'moulpali', label: 'Moulpali', name: 'Moulpali', label_kh: 'អក្សរមូលបាលី' },
  { value: 'noto-sans-khmer', label: 'Noto Sans Khmer', name: 'Noto Sans Khmer', label_kh: 'ណូតូ សាន' },
  { value: 'kantumruy-pro', label: 'Kantumruy Pro', name: 'Kantumruy Pro', label_kh: 'កណ្ដុររុយ' },
  { value: 'battambang', label: 'Battambang', name: 'Battambang', label_kh: 'បាត់ដំបង' },
  { value: 'siemreap', label: 'Siemreap', name: 'Siemreap', label_kh: 'សៀមរាប' },
  { value: 'hanuman', label: 'Hanuman', name: 'Hanuman', label_kh: 'ហនុមាន' },
  { value: 'koulen', label: 'Koulen', name: 'Koulen', label_kh: 'គូលែន' },
  { value: 'dangrek', label: 'Dangrek', name: 'Dangrek', label_kh: 'ដងរែក' },
  { value: 'content', label: 'Content', name: 'Content', label_kh: 'ខនថិន' },
  { value: 'khmer-os', label: 'Khmer OS', name: 'Khmer OS', label_kh: 'ខ្មែរ អូអេស' },
  { value: 'khmer-os-battambang', label: 'Khmer OS Battambang', name: 'Khmer OS Battambang', label_kh: 'ខ្មែរ អូអេស បាត់ដំបង' },
  { value: 'khmer-os-siemreap', label: 'Khmer OS Siemreap', name: 'Khmer OS Siemreap', label_kh: 'ខ្មែរ អូអេស សៀមរាប' },
  { value: 'khmer-os-muol-light', label: 'Khmer OS Muol Light', name: 'Khmer OS Muol Light', label_kh: 'ខ្មែរ អូអេស មូលស្រាល' },
  { value: 'khmer-os-muol', label: 'Khmer OS Muol', name: 'Khmer OS Muol', label_kh: 'ខ្មែរ អូអេស មូល' },
  { value: 'khmer-os-system', label: 'Khmer OS System', name: 'Khmer OS System', label_kh: 'ខ្មែរ អូអេស ស៊ីស្ទឹម' },
  { value: 'serif', label: 'Serif Roman', name: 'Serif Roman', label_kh: 'អក្សរសេរីហ្វ' },
]

export const FONT_FAMILY_MAP = {
  serif: 'Georgia, serif',
  moul: '"Moul", cursive',
  moulpali: '"Moulpali", cursive',
  'noto-sans-khmer': '"Noto Sans Khmer", sans-serif',
  'kantumruy-pro': '"Kantumruy Pro", sans-serif',
  kantumruy: '"Kantumruy Pro", sans-serif',
  'kantumruy pro': '"Kantumruy Pro", sans-serif',
  battambang: '"Battambang", sans-serif',
  siemreap: '"Siemreap", cursive',
  hanuman: '"Hanuman", serif',
  koulen: '"Koulen", cursive',
  dangrek: '"Dangrek", cursive',
  content: '"Content", serif',
  'khmer-os': '"Khmer OS", sans-serif',
  'khmer-os-battambang': '"Khmer OS Battambang", sans-serif',
  'khmer-os-siemreap': '"Khmer OS Siemreap", sans-serif',
  'khmer-os-muol-light': '"Khmer OS Muol Light", sans-serif',
  'khmer-os-muol': '"Khmer OS Muol", sans-serif',
  'khmer-os-system': '"Khmer OS System", sans-serif',
}

export function getFontFamily(fontName) {
  if (!fontName) return FONT_FAMILY_MAP.moul
  if (FONT_FAMILY_MAP[fontName]) return FONT_FAMILY_MAP[fontName]
  const normalized = String(fontName).trim().toLowerCase().replace(/\s+/g, '-')
  if (FONT_FAMILY_MAP[normalized]) return FONT_FAMILY_MAP[normalized]
  return FONT_FAMILY_MAP.moul
}
