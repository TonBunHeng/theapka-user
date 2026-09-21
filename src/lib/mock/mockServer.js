import {
  INITIAL_USER,
  INITIAL_WEDDING,
  INITIAL_GROUPS,
  INITIAL_GUESTS,
  INITIAL_GIFTS,
  INITIAL_SCHEDULES,
  INITIAL_WISHES,
  INITIAL_GALLERY,
} from './seedData'

const STORAGE_KEY = 'theapka_mock_data_v1'

function getStoredState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error('Failed to parse mock state from localStorage', e)
  }

  const initial = {
    user: INITIAL_USER,
    token: 'mock-sanctum-token-user-1',
    wedding: INITIAL_WEDDING,
    groups: INITIAL_GROUPS,
    guests: INITIAL_GUESTS,
    gifts: INITIAL_GIFTS,
    schedules: INITIAL_SCHEDULES,
    wishes: INITIAL_WISHES,
    media: INITIAL_GALLERY,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
  return initial
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.error('Failed to save mock state to localStorage', e)
  }
}

export function resetMockState() {
  localStorage.removeItem(STORAGE_KEY)
  return getStoredState()
}

/**
 * In-memory / localStorage mock router
 * Simulates Laravel Sanctum API endpoints
 */
export async function handleMockRequest(config) {
  const method = config.method ? config.method.toUpperCase() : 'GET'
  const url = config.url.replace(/^https?:\/\/[^/]+/, '') // strip domain if any
  const data = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : config.data || {}
  const state = getStoredState()

  // Small latency to simulate realistic network feeling
  await new Promise((r) => setTimeout(r, 150))

  // Helper response builders
  const success = (resData, meta = {}) => ({
    status: 200,
    data: { data: resData, meta },
  })

  const error = (status, message, errors = {}) => {
    const err = new Error(message)
    err.response = {
      status,
      data: { message, errors },
    }
    throw err
  }

  // ---------------- AUTH ----------------
  if (url === '/api/auth/login' && method === 'POST') {
    const { email, password } = data
    if (!email || !password) {
      error(422, 'Validation error', { email: ['Email is required'], password: ['Password is required'] })
    }
    // Check if admin is attempted
    if (email.includes('admin@')) {
      return success({
        user: { ...state.user, role: 'admin' },
        token: 'mock-admin-token',
      })
    }

    state.user = {
      ...state.user,
      email,
    }
    saveState(state)
    return success({
      user: state.user,
      token: 'mock-sanctum-token-user-1',
    })
  }

  if (url === '/api/auth/register' && method === 'POST') {
    const { name, email, phone } = data
    state.user = {
      id: Date.now(),
      name: name || 'គូស្វាមីភរិយាថ្មី',
      email: email || 'user@theapka.com',
      phone: phone || '012 345 678',
      role: 'user',
    }
    // Initially no wedding
    state.wedding = null
    saveState(state)
    return success({
      user: state.user,
      token: 'mock-sanctum-token-new',
    })
  }

  if (url === '/api/auth/me' && method === 'GET') {
    return success({
      user: state.user,
      wedding: state.wedding,
    })
  }

  if (url === '/api/auth/logout' && method === 'POST') {
    return success({ message: 'Logged out successfully' })
  }

  if (url === '/api/auth/forgot-password' && method === 'POST') {
    return success({ message: 'Password reset instructions sent to email' })
  }

  // ---------------- USER DASHBOARD ----------------
  if (url === '/api/user/dashboard' && method === 'GET') {
    const totalGuests = state.guests.length
    const invited = state.guests.filter((g) => g.sent_at).length
    const opened = state.guests.filter((g) => g.opened_at).length
    const attending = state.guests.filter((g) => g.rsvp_status === 'attending').length
    const declined = state.guests.filter((g) => g.rsvp_status === 'declined').length
    const pending = state.guests.filter((g) => g.rsvp_status === 'pending' || !g.rsvp_status).length
    const maybe = state.guests.filter((g) => g.rsvp_status === 'maybe').length

    // Gifts calculations: separate KHR and USD strictly!
    let totalKhr = 0
    let totalUsd = 0
    state.gifts.forEach((g) => {
      const amt = Number(g.amount) || 0
      if (g.currency === 'KHR') totalKhr += amt
      if (g.currency === 'USD') totalUsd += amt
    })

    return success({
      wedding: state.wedding,
      stats: {
        total_guests: totalGuests,
        invited,
        opened,
        attending,
        declined,
        pending,
        maybe,
        gifts: {
          total_khr: totalKhr,
          total_usd: totalUsd,
          count: state.gifts.length,
        },
      },
    })
  }

  // ---------------- WEDDING PROFILE ----------------
  if (url === '/api/user/wedding' && method === 'GET') {
    return success(state.wedding)
  }

  if (url === '/api/user/wedding' && (method === 'PUT' || method === 'POST')) {
    const updated = {
      ...(state.wedding || {}),
      ...data,
      id: state.wedding?.id || 1,
      user_id: state.user?.id || 1,
    }
    state.wedding = updated
    saveState(state)
    return success(updated)
  }

  // ---------------- SCHEDULES ----------------
  if (url === '/api/user/schedules' && method === 'GET') {
    const sorted = [...state.schedules].sort((a, b) => (a.order || 0) - (b.order || 0))
    return success(sorted)
  }

  if (url === '/api/user/schedules' && method === 'POST') {
    const newSchedule = {
      id: Date.now(),
      ...data,
      order: state.schedules.length + 1,
    }
    state.schedules.push(newSchedule)
    saveState(state)
    return success(newSchedule)
  }

  const scheduleIdMatch = url.match(/^\/api\/user\/schedules\/(\d+)$/)
  if (scheduleIdMatch) {
    const id = parseInt(scheduleIdMatch[1], 10)
    if (method === 'PUT') {
      const idx = state.schedules.findIndex((s) => s.id === id)
      if (idx !== -1) {
        state.schedules[idx] = { ...state.schedules[idx], ...data }
        saveState(state)
        return success(state.schedules[idx])
      }
      error(404, 'Schedule not found')
    }
    if (method === 'DELETE') {
      state.schedules = state.schedules.filter((s) => s.id !== id)
      saveState(state)
      return success({ id })
    }
  }

  // ---------------- GUEST GROUPS ----------------
  if (url === '/api/user/guest-groups' && method === 'GET') {
    const groupsWithCount = state.groups.map((grp) => ({
      ...grp,
      count: state.guests.filter((g) => g.group_id === grp.id).length,
    }))
    return success(groupsWithCount)
  }

  if (url === '/api/user/guest-groups' && method === 'POST') {
    const newGroup = {
      id: Date.now(),
      name: data.name || 'ក្រុមថ្មី',
      color: data.color || '#C59B27',
      count: 0,
    }
    state.groups.push(newGroup)
    saveState(state)
    return success(newGroup)
  }

  const groupIdMatch = url.match(/^\/api\/user\/guest-groups\/(\d+)$/)
  if (groupIdMatch) {
    const id = parseInt(groupIdMatch[1], 10)
    if (method === 'PUT') {
      const idx = state.groups.findIndex((g) => g.id === id)
      if (idx !== -1) {
        state.groups[idx] = { ...state.groups[idx], ...data }
        saveState(state)
        return success(state.groups[idx])
      }
      error(404, 'Group not found')
    }
    if (method === 'DELETE') {
      state.groups = state.groups.filter((g) => g.id !== id)
      saveState(state)
      return success({ id })
    }
  }

  // ---------------- GUESTS ----------------
  if (url === '/api/user/guests' && method === 'GET') {
    return success(state.guests, { total: state.guests.length })
  }

  if (url === '/api/user/guests' && method === 'POST') {
    const token = 'g-tok-' + Math.random().toString(36).substring(2, 9)
    const newGuest = {
      id: Date.now(),
      name: data.name || '',
      phone: data.phone || '',
      group_id: Number(data.group_id) || (state.groups[0]?.id || 1),
      side: data.side || 'groom',
      seats: Number(data.seats) || 1,
      token,
      rsvp_status: 'pending',
      sent_at: null,
      opened_at: null,
    }
    state.guests.unshift(newGuest)
    saveState(state)
    return success(newGuest)
  }

  if (url === '/api/user/guests/import' && method === 'POST') {
    const guestsToImport = data.guests || []
    const created = []
    guestsToImport.forEach((item) => {
      const token = 'g-tok-' + Math.random().toString(36).substring(2, 9)
      const guest = {
        id: Date.now() + Math.floor(Math.random() * 10000),
        name: item.name,
        phone: item.phone || '',
        group_id: Number(item.group_id) || 1,
        side: item.side || 'groom',
        seats: Number(item.seats) || 1,
        token,
        rsvp_status: 'pending',
        sent_at: null,
        opened_at: null,
      }
      created.push(guest)
      state.guests.push(guest)
    })
    saveState(state)
    return success({ count: created.length, guests: created })
  }

  const guestIdMatch = url.match(/^\/api\/user\/guests\/(\d+)$/)
  if (guestIdMatch) {
    const id = parseInt(guestIdMatch[1], 10)
    if (method === 'PUT') {
      const idx = state.guests.findIndex((g) => g.id === id)
      if (idx !== -1) {
        state.guests[idx] = { ...state.guests[idx], ...data }
        saveState(state)
        return success(state.guests[idx])
      }
      error(404, 'Guest not found')
    }
    if (method === 'DELETE') {
      state.guests = state.guests.filter((g) => g.id !== id)
      saveState(state)
      return success({ id })
    }
  }

  // ---------------- INVITATION ----------------
  if (url === '/api/user/invitation' && method === 'GET') {
    return success({
      template_id: state.wedding?.template_id || 'traditional-gold',
      template_config: state.wedding?.template_config || {},
      is_published: !!state.wedding?.is_published,
      wedding: state.wedding,
    })
  }

  if (url === '/api/user/invitation' && method === 'PUT') {
    if (state.wedding) {
      state.wedding.template_id = data.template_id || state.wedding.template_id
      state.wedding.template_config = data.template_config || state.wedding.template_config
      saveState(state)
    }
    return success({
      template_id: state.wedding?.template_id,
      template_config: state.wedding?.template_config,
    })
  }

  if (url === '/api/user/invitation/publish' && method === 'POST') {
    if (state.wedding) {
      state.wedding.is_published = true
      saveState(state)
    }
    return success({ is_published: true })
  }

  if (url === '/api/user/invitation/unpublish' && method === 'POST') {
    if (state.wedding) {
      state.wedding.is_published = false
      saveState(state)
    }
    return success({ is_published: false })
  }

  // ---------------- GIFTS / ចំណងដៃ ----------------
  if (url === '/api/user/gifts' && method === 'GET') {
    return success(state.gifts, { total: state.gifts.length })
  }

  if (url === '/api/user/gifts' && method === 'POST') {
    const clientUuid = data.client_uuid || ('mock-uuid-' + Date.now())
    // Check idempotent client_uuid
    const existing = state.gifts.find((g) => g.client_uuid === clientUuid)
    if (existing) {
      return success(existing)
    }

    const newGift = {
      id: state.gifts.length + 1,
      client_uuid: clientUuid,
      guest_id: data.guest_id || null,
      giver_name: data.giver_name || 'ភ្ញៀវកិត្តិយស',
      amount: Number(data.amount) || 0,
      currency: data.currency === 'USD' ? 'USD' : 'KHR',
      method: data.method || 'cash',
      entry_type: data.entry_type === 'correction' ? 'correction' : 'gift',
      corrects_id: data.corrects_id || null,
      note: data.note || '',
      recorded_by: data.recorded_by || state.user?.name || 'អ្នកទទួលភ្ញៀវ',
      recorded_at: data.recorded_at || new Date().toISOString(),
    }

    state.gifts.unshift(newGift)
    saveState(state)
    return success(newGift)
  }

  if (url === '/api/user/gifts/summary' && method === 'GET') {
    let totalKhr = 0
    let totalUsd = 0
    const byGroup = {}
    const byRecorder = {}

    state.gifts.forEach((g) => {
      const amt = Number(g.amount) || 0
      if (g.currency === 'KHR') totalKhr += amt
      if (g.currency === 'USD') totalUsd += amt

      // group stats
      const guest = state.guests.find((gu) => gu.id === g.guest_id)
      const groupName = guest ? state.groups.find((gr) => gr.id === guest.group_id)?.name || 'ផ្សេងៗ' : 'ភ្ញៀវក្រៅបញ្ជី'
      if (!byGroup[groupName]) byGroup[groupName] = { khr: 0, usd: 0, count: 0 }
      if (g.currency === 'KHR') byGroup[groupName].khr += amt
      if (g.currency === 'USD') byGroup[groupName].usd += amt
      byGroup[groupName].count++

      // recorder stats
      const rec = g.recorded_by || 'មិនស្គាល់'
      if (!byRecorder[rec]) byRecorder[rec] = { khr: 0, usd: 0, count: 0 }
      if (g.currency === 'KHR') byRecorder[rec].khr += amt
      if (g.currency === 'USD') byRecorder[rec].usd += amt
      byRecorder[rec].count++
    })

    return success({
      total_khr: totalKhr,
      total_usd: totalUsd,
      count: state.gifts.length,
      by_group: byGroup,
      by_recorder: byRecorder,
    })
  }

  // ---------------- MEDIA / GALLERY ----------------
  if (url === '/api/user/media' && method === 'GET') {
    return success(state.media)
  }

  if (url === '/api/user/media' && method === 'POST') {
    const newMedia = {
      id: Date.now(),
      url: data.url || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
      is_cover: !!data.is_cover,
    }
    if (newMedia.is_cover) {
      state.media.forEach((m) => (m.is_cover = false))
    }
    state.media.unshift(newMedia)
    saveState(state)
    return success(newMedia)
  }

  const mediaIdMatch = url.match(/^\/api\/user\/media\/(\d+)$/)
  if (mediaIdMatch && method === 'DELETE') {
    const id = parseInt(mediaIdMatch[1], 10)
    state.media = state.media.filter((m) => m.id !== id)
    saveState(state)
    return success({ id })
  }

  // ---------------- USER PROFILE & PASSWORD ----------------
  if (url === '/api/user/profile' && method === 'PUT') {
    state.user = { ...state.user, ...data }
    saveState(state)
    return success(state.user)
  }

  if (url === '/api/user/password' && method === 'PUT') {
    return success({ message: 'Password updated successfully' })
  }

  // ---------------- PUBLIC INVITATION ENDPOINTS ----------------
  // GET /api/public/invitation/:slug/:token
  const publicTokenMatch = url.match(/^\/api\/public\/invitation\/([^/]+)\/([^/?]+)/)
  if (publicTokenMatch && method === 'GET') {
    const slug = publicTokenMatch[1]
    const token = publicTokenMatch[2]
    const guest = state.guests.find((g) => g.token === token)
    const wedding = state.wedding?.slug === slug ? state.wedding : state.wedding

    // Mark guest opened_at if not already
    if (guest && !guest.opened_at) {
      guest.opened_at = new Date().toISOString()
      saveState(state)
    }

    const group = guest ? state.groups.find((gr) => gr.id === guest.group_id) : null

    return success({
      wedding,
      guest: guest || null,
      group: group || null,
      schedules: state.schedules,
      gallery: state.media,
      wishes: state.wishes,
    })
  }

  // GET /api/public/invitation/:slug
  const publicSlugMatch = url.match(/^\/api\/public\/invitation\/([^/?]+)$/)
  if (publicSlugMatch && method === 'GET') {
    return success({
      wedding: state.wedding,
      guest: null,
      group: null,
      schedules: state.schedules,
      gallery: state.media,
      wishes: state.wishes,
    })
  }

  // POST /api/public/invitation/:token/rsvp
  const rsvpMatch = url.match(/^\/api\/public\/invitation\/([^/]+)\/rsvp$/)
  if (rsvpMatch && method === 'POST') {
    const token = rsvpMatch[1]
    const guest = state.guests.find((g) => g.token === token)
    if (guest) {
      guest.rsvp_status = data.rsvp_status || 'attending'
      guest.attending_seats = data.seats || guest.seats
      guest.rsvp_note = data.note || ''
      saveState(state)
      return success(guest)
    }
    // If walk-in or invalid token, still accept gracefully
    return success({ rsvp_status: data.rsvp_status, message: 'RSVP recorded' })
  }

  // POST /api/public/invitation/:token/wish OR generic wish
  const wishMatch = url.match(/^\/api\/public\/invitation\/([^/]+)\/wish$/)
  if (wishMatch && method === 'POST') {
    const newWish = {
      id: Date.now(),
      name: data.name || 'ភ្ញៀវកិត្តិយស',
      message: data.message || '',
      created_at: new Date().toISOString(),
    }
    state.wishes.unshift(newWish)
    saveState(state)
    return success(newWish)
  }

  // GET /api/public/invitation/:slug/wishes
  const wishesListMatch = url.match(/^\/api\/public\/invitation\/([^/]+)\/wishes$/)
  if (wishesListMatch && method === 'GET') {
    return success(state.wishes)
  }

  // Fallback 404
  console.warn('Mock route not matched:', method, url)
  error(404, `Mock endpoint not found: ${method} ${url}`)
}
