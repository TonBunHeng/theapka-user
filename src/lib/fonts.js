export const FONT_OPTIONS = [
  { value: 'moul', label: 'Moul' },
  { value: 'moulpali', label: 'Moulpali' },
  { value: 'noto-sans-khmer', label: 'Noto Sans Khmer' },
  { value: 'kantumruy-pro', label: 'Kantumruy Pro' },
  { value: 'battambang', label: 'Battambang' },
  { value: 'siemreap', label: 'Siemreap' },
  { value: 'hanuman', label: 'Hanuman' },
  { value: 'koulen', label: 'Koulen' },
  { value: 'dangrek', label: 'Dangrek' },
  { value: 'content', label: 'Content' },
  { value: 'khmer-os', label: 'Khmer OS' },
  { value: 'khmer-os-battambang', label: 'Khmer OS Battambang' },
  { value: 'khmer-os-siemreap', label: 'Khmer OS Siemreap' },
  { value: 'khmer-os-muol-light', label: 'Khmer OS Muol Light' },
  { value: 'khmer-os-muol', label: 'Khmer OS Muol' },
  { value: 'khmer-os-system', label: 'Khmer OS System' },
  { value: 'serif', label: 'Serif Roman' },
]

export const FONT_FAMILY_MAP = {
  serif: 'Georgia, serif',
  moul: '"Moul", cursive',
  moulpali: '"Moulpali", cursive',
  'noto-sans-khmer': '"Noto Sans Khmer", sans-serif',
  'kantumruy-pro': '"Kantumruy Pro", sans-serif',
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
  return FONT_FAMILY_MAP[fontName] || FONT_FAMILY_MAP.moul
}
