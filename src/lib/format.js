import dayjs from 'dayjs'
import 'dayjs/locale/km'

const KHMER_DIGITS = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩']

/**
 * Convert Arabic digits (0-9) to Khmer digits (០-៩)
 * @param {string|number} input
 * @returns {string}
 */
export function toKhmerNumeral(input) {
  if (input === null || input === undefined) return ''
  return String(input).replace(/[0-9]/g, (digit) => KHMER_DIGITS[parseInt(digit, 10)])
}

/**
 * Format currency strictly per currency type.
 * KHR: No decimals, e.g. "100,000 ៛"
 * USD: 2 decimals, e.g. "$50.00"
 * WARNING: KHR and USD must NEVER be combined or summed into a single value.
 * @param {number|string} amount
 * @param {'KHR'|'USD'} currency
 * @param {boolean} [useKhmerDigits=false]
 * @returns {string}
 */
export function formatCurrency(amount, currency = 'KHR', useKhmerDigits = false) {
  const num = Number(amount) || 0
  if (currency === 'KHR') {
    const rounded = Math.round(num)
    const formatted = rounded.toLocaleString('en-US')
    const finalStr = `${formatted} ៛`
    return useKhmerDigits ? toKhmerNumeral(finalStr) : finalStr
  }

  // USD
  const formattedUsd = num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const finalStr = `$${formattedUsd}`
  return useKhmerDigits ? toKhmerNumeral(finalStr) : finalStr
}

/**
 * Format dates with localized dayjs
 * @param {string|Date} dateStr
 * @param {string} [formatStr='DD/MM/YYYY']
 * @param {'km'|'en'} [lang='km']
 * @returns {string}
 */
export function formatDate(dateStr, formatStr = 'DD/MM/YYYY', lang = 'km') {
  if (!dateStr) return ''
  try {
    const d = dayjs(dateStr).locale(lang === 'km' ? 'km' : 'en')
    const formatted = d.format(formatStr)
    return lang === 'km' ? toKhmerNumeral(formatted) : formatted
  } catch {
    return String(dateStr)
  }
}

/**
 * Format relative time (e.g. days until wedding)
 * @param {string|Date} targetDate
 * @returns {{ days: number, hours: number, isPast: boolean }}
 */
export function getCountdown(targetDate) {
  if (!targetDate) return { days: 0, hours: 0, isPast: false }
  const now = dayjs()
  const target = dayjs(targetDate)
  const diffHours = target.diff(now, 'hour')
  const diffDays = target.diff(now, 'day')

  if (diffHours <= 0) {
    return { days: 0, hours: 0, isPast: true }
  }

  return {
    days: diffDays,
    hours: diffHours % 24,
    isPast: false,
  }
}

/**
 * Format Cambodian phone numbers cleanly
 * @param {string} phone
 * @returns {string}
 */
export function formatPhone(phone) {
  if (!phone) return ''
  const clean = String(phone).replace(/[^\d+]/g, '')
  // format 012 345 678
  if (clean.length === 9 || clean.length === 10) {
    return clean.replace(/(\d{3})(\d{3})(\d{3,4})/, '$1 $2 $3')
  }
  return clean
}
