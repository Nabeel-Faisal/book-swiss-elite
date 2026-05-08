/* ================================================
   SWISS ELITE — Admin Dashboard Logic
   ================================================ */
'use strict';

/* ---------- AUTH GUARD ---------- */
(function authGuard() {
  const auth = JSON.parse(localStorage.getItem('se_auth') || '{}');
  if (!auth.loggedIn) { window.location.href = 'login.html'; return; }
  document.getElementById('topbar-name').textContent = auth.name || 'Admin';
})();

/* ---------- CONSTANTS ---------- */
const KEYS = {
  vehicles:        'se_vehicles',
  bookings:        'se_bookings',
  customers:       'se_customers',
  settings:        'se_settings',
  formSettings:    'se_form_settings',
  admins:          'se_admins',
  areas:           'se_service_areas',
  pricing:         'se_pricing',
  vehiclePricing:  'se_vehicle_pricing',
};

/* ---------- DATA VERSION (flush old dummy data) ---------- */
const DATA_VERSION = '3';
if (localStorage.getItem('se_data_version') !== DATA_VERSION) {
  localStorage.removeItem('se_bookings');
  localStorage.removeItem('se_customers');
  localStorage.setItem('se_data_version', DATA_VERSION);
}

/* ---------- SEED DATA (config only — no fake bookings/customers) ---------- */
function seedData() {
  if (!localStorage.getItem(KEYS.vehicles)) {
    localStorage.setItem(KEYS.vehicles, JSON.stringify([
      { id:'v1', name:'Tesla Model Y',    image:'../assets/tesla-model-y.jpg',    category:'Executive Electric SUV', passengers:4, luggage:3, badge:'Electric', badgeType:'green',  features:['Zero Emissions','Premium Interior','Autopilot'], description:'Cutting-edge electric SUV with autopilot.', enabled:true,  order:1 },
      { id:'v2', name:'Mercedes S-Class', image:'../assets/mercedes-s-class.jpg', category:'Ultra-Luxury Sedan',     passengers:3, luggage:2, badge:'Flagship', badgeType:'gold',   features:['Massage Seats','Maybach Comfort','Executive Class'], description:'The pinnacle of luxury sedan travel.', enabled:true, order:2 },
      { id:'v3', name:'Mercedes V-Class', image:'../assets/mercedes-v-class.jpg', category:'Luxury MPV',             passengers:7, luggage:6, badge:'Group',    badgeType:'silver', features:['Spacious Interior','Business Conference','Group Transfers'], description:'Perfect for group and family transfers.', enabled:true, order:3 },
    ]));
  }
  if (!localStorage.getItem(KEYS.admins)) {
    localStorage.setItem(KEYS.admins, JSON.stringify([
      { id:'A-001', name:'Admin', email:'admin@swisselite.com', role:'superadmin', lastLogin: new Date().toLocaleDateString(), status:'active' },
    ]));
  }
  if (!localStorage.getItem(KEYS.areas)) {
    localStorage.setItem(KEYS.areas, JSON.stringify([
      { code:'CH', name:'Switzerland', flag:'🇨🇭', enabled:true,  cities:'Geneva, Zurich, Basel, Bern, Lausanne, Zermatt, St. Moritz, Verbier' },
      { code:'FR', name:'France',      flag:'🇫🇷', enabled:true,  cities:'Paris, Lyon, Nice, Courchevel, Chamonix, Val d\'Isère, Cannes' },
      { code:'IT', name:'Italy',       flag:'🇮🇹', enabled:true,  cities:'Milan, Rome, Venice, Florence, Lake Como, Cortina d\'Ampezzo' },
    ]));
  }
  if (!localStorage.getItem(KEYS.formSettings)) {
    localStorage.setItem(KEYS.formSettings, JSON.stringify({
      roundTripEnabled: true, vehiclesEnabled: true,
      btn1Text:'Continue to Vehicles', btn2Text:'Continue to Order', btnSubmitText:'Book Your Transfer',
      title1:'Ride Details', title2:'Choose Your Vehicle', title3:'Place Your Order',
      locMsg:'Currently, transfers are available only within Switzerland, France, and Italy.',
      vehMsg:'Please select a vehicle to continue.',
      successMsg:'Your transfer has been successfully reserved.',
    }));
  }
  if (!localStorage.getItem(KEYS.settings)) {
    localStorage.setItem(KEYS.settings, JSON.stringify({
      company:'Swiss Elite Chauffeur', phone:'+41 22 000 0000', whatsapp:'+41 79 000 0000',
      email:'info@swisselite.com', address:'Geneva, Switzerland', website:'www.swisselite.com',
      currency:'CHF', timezone:'Europe/Zurich', dateFormat:'DD/MM/YYYY', lang:'English',
    }));
  }
  if (!localStorage.getItem(KEYS.pricing)) {
    localStorage.setItem(KEYS.pricing, JSON.stringify({ currency:'CHF', min:80, perkm:2.5, airport:25, night:20, weekend:15 }));
  }
  if (!localStorage.getItem(KEYS.vehiclePricing)) {
    localStorage.setItem(KEYS.vehiclePricing, JSON.stringify({
      // Admin-seeded vehicle IDs
      v1: { basePrice: 80,  pricePerKm: 2.0, minPrice: 80  },
      v2: { basePrice: 120, pricePerKm: 3.0, minPrice: 120 },
      v3: { basePrice: 100, pricePerKm: 2.5, minPrice: 100 },
      // Static booking-form vehicle IDs (fallback)
      'tesla-model-y':    { basePrice: 80,  pricePerKm: 2.0, minPrice: 80  },
      'mercedes-s-class': { basePrice: 120, pricePerKm: 3.0, minPrice: 120 },
      'mercedes-v-class': { basePrice: 100, pricePerKm: 2.5, minPrice: 100 },
    }));
  }
}

/* ---------- DATA ACCESS ---------- */
const DB = {
  get: k => JSON.parse(localStorage.getItem(k) || 'null'),
  set: (k,v) => { localStorage.setItem(k, JSON.stringify(v)); syncFrontend(k); },
  getVehicles:     () => DB.get(KEYS.vehicles) || [],
  getBookings:     () => DB.get(KEYS.bookings)  || [],
  getCustomers:    () => DB.get(KEYS.customers) || [],
  getAdmins:       () => DB.get(KEYS.admins)    || [],
  getAreas:        () => DB.get(KEYS.areas)     || [],
  getFormSettings:    () => DB.get(KEYS.formSettings)   || {},
  getSettings:        () => DB.get(KEYS.settings)       || {},
  getPricing:         () => DB.get(KEYS.pricing)        || {},
  getVehiclePricing:  () => DB.get(KEYS.vehiclePricing) || {},
};

/* Sync to frontend booking form */
function syncFrontend(key) {
  if (key === KEYS.vehicles || key === KEYS.formSettings || key === KEYS.areas || key === KEYS.vehiclePricing) {
    localStorage.setItem('se_frontend_sync', JSON.stringify({ key, ts: Date.now() }));
  }
}

/* ---------- NAVIGATION ---------- */
let currentPage = 'overview';

function navigate(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const el = document.getElementById(`page-${page}`);
  if (el) { el.classList.remove('hidden'); }

  const navItem = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (navItem) { navItem.classList.add('active'); }

  const titles = {
    overview:'Dashboard', bookings:'Bookings', vehicles:'Vehicles',
    customers:'Customers', pricing:'Pricing Settings', 'service-areas':'Service Areas',
    'form-settings':'Form Settings', notifications:'Notifications',
    'admin-users':'Admin Users', analytics:'Analytics', settings:'Settings',
  };
  document.getElementById('page-breadcrumb').textContent = titles[page] || page;
  currentPage = page;
  renderPage(page);
  window.scrollTo(0, 0);

  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('mobile-open');
  document.getElementById('sidebar-overlay').classList.remove('visible');
}

function renderPage(page) {
  const renders = {
    overview:       renderOverview,
    bookings:       renderBookings,
    vehicles:       renderVehicles,
    customers:      renderCustomers,
    pricing:        renderPricing,
    'service-areas': renderServiceAreas,
    'form-settings': renderFormSettings,
    'admin-users':  renderAdminUsers,
    analytics:      renderAnalytics,
    settings:       renderSettings,
  };
  if (renders[page]) renders[page]();
}

/* ---------- OVERVIEW ---------- */
function renderOverview() {
  const bookings  = DB.getBookings();
  const vehicles  = DB.getVehicles();
  const customers = DB.getCustomers();

  const pending   = bookings.filter(b => b.status === 'pending').length;
  const confirmed = bookings.filter(b => b.status === 'confirmed').length;
  const cancelled = bookings.filter(b => b.status === 'cancelled').length;
  const completed = bookings.filter(b => b.status === 'completed').length;
  const activeVeh = vehicles.filter(v => v.enabled).length;

  document.getElementById('today-date').textContent = new Date().toLocaleDateString('en-GB',{weekday:'long',year:'numeric',month:'long',day:'numeric'});

  const statsEl = document.getElementById('stats-grid');
  statsEl.innerHTML = [
    { label:'Total Bookings',        value: bookings.length,  icon:'📋', color:'var(--gold)',  sub: bookings.length === 0 ? 'Awaiting first booking' : `${completed} completed` },
    { label:'Pending',               value: pending,          icon:'⏳', color:'var(--amber)', sub: pending > 0 ? 'Require attention' : 'None pending' },
    { label:'Confirmed',             value: confirmed,        icon:'✅', color:'var(--blue)',  sub: confirmed > 0 ? 'Upcoming rides' : 'None confirmed' },
    { label:'Cancelled',             value: cancelled,        icon:'❌', color:'var(--red)',   sub: 'Total cancelled' },
    { label:'Active Vehicles',       value: activeVeh,        icon:'🚗', color:'var(--green)', sub: `${vehicles.length} total in fleet` },
    { label:'Total Customers',       value: customers.length, icon:'👥', color:'var(--gold)',  sub: customers.length === 0 ? 'No customers yet' : 'Registered' },
    { label:'Revenue',               value: 'CHF —',          icon:'💰', color:'var(--green)', sub: 'Connect Stripe to track' },
  ].map(s => `
    <div class="stat-card">
      <div class="stat-icon" style="background:${s.color}22"><span style="font-size:1.1rem">${s.icon}</span></div>
      <div class="stat-value">${s.value}</div>
      <div class="stat-label">${s.label}</div>
      <div class="stat-change" style="color:var(--text-muted)">${s.sub}</div>
    </div>`).join('');

  // Recent bookings table — shows real data from form submissions
  const recent = [...bookings].sort((a,b) => b.createdAt - a.createdAt).slice(0, 6);
  document.getElementById('overview-bookings-body').innerHTML = recent.length
    ? recent.map(b => `
        <tr>
          <td><strong>${b.id}</strong></td>
          <td>${b.name}</td>
          <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${b.pickup} → ${b.dropoff}">${b.pickup} → ${b.dropoff}</td>
          <td>${formatDate(b.date)}</td>
          <td>${statusBadge(b.status)}</td>
        </tr>`).join('')
    : `<tr><td colspan="5">
        <div class="empty-state" style="padding:2rem 1rem">
          <div style="font-size:1.8rem;margin-bottom:.5rem">📋</div>
          <strong style="color:var(--text-sec)">No bookings yet</strong>
          <p>Bookings from your website form will appear here instantly.</p>
        </div>
       </td></tr>`;

  // Upcoming rides
  const upcoming = bookings
    .filter(b => b.date >= todayStr() && ['pending','confirmed'].includes(b.status))
    .sort((a,b) => a.date.localeCompare(b.date))
    .slice(0, 4);
  document.getElementById('upcoming-rides').innerHTML = upcoming.length
    ? upcoming.map(b => `
        <div class="ride-item">
          <div class="ride-time">${b.time}</div>
          <div class="ride-info">
            <div class="ride-name">${b.name}</div>
            <div class="ride-route">${b.pickup} → ${b.dropoff}</div>
            <div class="ride-route" style="margin-top:.15rem;color:var(--text-muted);font-size:.7rem">${b.vehicle} · ${formatDate(b.date)}</div>
          </div>
          ${statusBadge(b.status)}
        </div>`).join('')
    : `<div class="empty-state" style="padding:1.5rem 0.5rem">
        <div style="font-size:1.5rem;margin-bottom:.4rem">🗓</div>
        <p>No upcoming rides scheduled.</p>
       </div>`;

  // Quick stats
  document.getElementById('quick-stats').innerHTML = [
    { label:'Most booked vehicle', val: topVehicle(bookings) },
    { label:'This week bookings',  val: bookings.filter(b=>b.createdAt>Date.now()-604800000).length },
    { label:'Completion rate',     val: bookings.length ? Math.round(bookings.filter(b=>b.status==='completed').length/bookings.length*100)+'%' : '0%' },
    { label:'Avg bookings/day',    val: '~'+Math.ceil(bookings.length/30) },
  ].map(i=>`<div class="quick-stat-item"><span class="qs-label">${i.label}</span><span class="qs-val">${i.val}</span></div>`).join('');
}

/* ---------- BOOKINGS ---------- */
let bookingPage = 1; const BOOKINGS_PER_PAGE = 8;

function renderBookings() {
  const search = (document.getElementById('booking-search').value || '').toLowerCase();
  const statusF = document.getElementById('booking-status-filter').value;
  let data = DB.getBookings().filter(b => {
    const matchSearch = !search || b.name.toLowerCase().includes(search) || b.id.toLowerCase().includes(search) || b.pickup.toLowerCase().includes(search);
    const matchStatus = !statusF || b.status === statusF;
    return matchSearch && matchStatus;
  });
  data.sort((a,b) => b.createdAt - a.createdAt);

  const total = data.length;
  const pages = Math.ceil(total / BOOKINGS_PER_PAGE);
  const slice = data.slice((bookingPage-1)*BOOKINGS_PER_PAGE, bookingPage*BOOKINGS_PER_PAGE);

  document.getElementById('badge-bookings').textContent = DB.getBookings().filter(b=>b.status==='pending').length;

  document.getElementById('bookings-body').innerHTML = slice.length ? slice.map(b => `
    <tr>
      <td><strong>${b.id}</strong></td>
      <td>
        <div style="font-weight:500;color:var(--text)">${b.name}</div>
        <div style="font-size:.72rem;color:var(--text-muted)">${b.email || ''}</div>
      </td>
      <td style="max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${b.pickup}">${b.pickup}</td>
      <td style="max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${b.dropoff}">${b.dropoff}</td>
      <td>
        <div>${formatDate(b.date)}</div>
        <div style="font-size:.72rem;color:var(--text-muted)">${b.time}</div>
      </td>
      <td>
        <div style="white-space:nowrap">${b.vehicle}</div>
        <div style="font-size:.72rem;color:var(--text-muted);text-transform:capitalize">${(b.tripType||'one-way').replace('-',' ')}</div>
      </td>
      <td>${statusBadge(b.status)}</td>
      <td>${b.phone}</td>
      <td>${paymentBadge(b.payment)}</td>
      <td>
        <div class="action-btns">
          <button class="act-btn act-btn-view" onclick="viewBooking('${b.id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>View
          </button>
          <button class="act-btn act-btn-del" onclick="confirmDelete('booking','${b.id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/></svg>
          </button>
        </div>
      </td>
    </tr>`).join('')
  : `<tr><td colspan="9">
      <div class="empty-state" style="padding:3rem 1rem">
        <div style="font-size:2rem;margin-bottom:.6rem">📭</div>
        <strong style="color:var(--text-sec)">No bookings yet</strong>
        <p style="margin-top:.4rem">Submit a booking from the <a href="../index.html" target="_blank" style="color:var(--gold)">booking form</a> and it will appear here instantly.</p>
      </div>
     </td></tr>`;

  renderPagination('bookings-pagination', bookingPage, pages, p => { bookingPage = p; renderBookings(); });
}

function viewBooking(id) {
  const b = DB.getBookings().find(x => x.id === id);
  if (!b) return;

  const returnRow = b.tripType === 'round-trip' && b.returnDate ? `
    <div class="detail-item"><div class="detail-label">Return Date</div><div class="detail-value">${formatDate(b.returnDate)}</div></div>
    <div class="detail-item"><div class="detail-label">Return Time</div><div class="detail-value">${b.returnTime || '—'}</div></div>` : '';

  document.getElementById('booking-detail-body').innerHTML = `
    <div style="display:flex;align-items:center;gap:.75rem;padding:.75rem 1rem;background:var(--gold-dim);border:1px solid var(--gold-border);border-radius:10px;margin-bottom:1.25rem">
      <span style="font-size:1.4rem">🔖</span>
      <div>
        <div style="font-size:.68rem;letter-spacing:.12em;text-transform:uppercase;color:var(--text-muted)">Booking Reference</div>
        <div style="font-size:1.1rem;font-weight:700;color:var(--gold);letter-spacing:.08em">${b.id}</div>
      </div>
      <div style="margin-left:auto">${statusBadge(b.status)}</div>
    </div>

    <div class="detail-grid">
      <div class="detail-item"><div class="detail-label">Full Name</div><div class="detail-value">${b.name}</div></div>
      <div class="detail-item"><div class="detail-label">Email</div><div class="detail-value">${b.email || '—'}</div></div>
      <div class="detail-item"><div class="detail-label">Phone</div><div class="detail-value">${b.phone}</div></div>
      <div class="detail-item"><div class="detail-label">Trip Type</div><div class="detail-value" style="text-transform:capitalize">${(b.tripType||'one-way').replace('-',' ')}</div></div>

      <div class="detail-item"><div class="detail-label">Pickup Location</div><div class="detail-value">${b.pickup}</div></div>
      <div class="detail-item"><div class="detail-label">Drop-off Location</div><div class="detail-value">${b.dropoff}</div></div>

      <div class="detail-item"><div class="detail-label">Pickup Date</div><div class="detail-value">${formatDate(b.date)}</div></div>
      <div class="detail-item"><div class="detail-label">Pickup Time</div><div class="detail-value">${b.time}</div></div>

      ${returnRow}

      <div class="detail-item"><div class="detail-label">Vehicle</div><div class="detail-value">${b.vehicle}</div></div>
      ${b.estimatedDistance ? `<div class="detail-item"><div class="detail-label">Est. Distance</div><div class="detail-value">~${b.estimatedDistance} km</div></div>` : ''}
      ${b.estimatedFare     ? `<div class="detail-item"><div class="detail-label">Estimated Fare</div><div class="detail-value" style="color:var(--gold);font-weight:600">CHF ${b.estimatedFare.toLocaleString()}</div></div>` : ''}
      <div class="detail-item"><div class="detail-label">Payment Status</div><div class="detail-value">${paymentBadge(b.payment)}</div></div>
      <div class="detail-item"><div class="detail-label">Booked On</div><div class="detail-value">${b.createdAt ? new Date(b.createdAt).toLocaleString('en-GB') : '—'}</div></div>
      <div class="detail-item"><div class="detail-label">Source</div><div class="detail-value" style="text-transform:capitalize">${b.source || 'website'}</div></div>
    </div>

    ${b.notes ? `<div class="detail-item" style="margin-top:.75rem;padding:.85rem 1rem;background:var(--bg-input);border-radius:8px;border:1px solid var(--border)"><div class="detail-label" style="margin-bottom:.3rem">Special Requests / Notes</div><div class="detail-value" style="color:var(--text-sec)">${b.notes}</div></div>` : ''}

    <div class="form-field" style="margin-top:1.25rem;padding-top:1rem;border-top:1px solid var(--border)">
      <label class="detail-label">Update Booking Status</label>
      <select class="form-input" id="booking-status-select" data-id="${b.id}" style="margin-top:.4rem">
        ${['pending','confirmed','in-progress','completed','cancelled'].map(s=>`<option value="${s}" ${b.status===s?'selected':''}>${capitalize(s)}</option>`).join('')}
      </select>
    </div>`;
  openModal('booking-modal');
}

function saveBookingStatus() {
  const sel = document.getElementById('booking-status-select');
  if (!sel) return;
  const id = sel.dataset.id;
  const bookings = DB.getBookings();
  const idx = bookings.findIndex(b => b.id === id);
  if (idx === -1) return;
  bookings[idx].status = sel.value;
  DB.set(KEYS.bookings, bookings);
  closeModal('booking-modal');
  renderBookings();
  toast('Booking status updated.', 'success');
}

function openAddBookingModal() { toast('Manual booking form coming soon.', 'info'); }

/* ---------- VEHICLES ---------- */
function renderVehicles() {
  const vehicles = DB.getVehicles();
  const grid = document.getElementById('vehicles-grid');
  if (!vehicles.length) {
    grid.innerHTML = '<div class="empty-state"><p>No vehicles yet. Add your first vehicle.</p></div>';
    return;
  }
  grid.innerHTML = vehicles.map(v => `
    <div class="v-card ${v.enabled ? '' : 'disabled-card'}" id="vc-${v.id}">
      <img class="v-card-img" src="${v.image}" alt="${v.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'225\' viewBox=\'0 0 400 225\'%3E%3Crect width=\'400\' height=\'225\' fill=\'%23111\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'%23C8A45D\' font-size=\'14\' font-family=\'Poppins\'%3E${v.name}%3C/text%3E%3C/svg%3E'"/>
      <div class="v-card-body">
        <div class="v-card-top">
          <div><div class="v-card-name">${v.name}</div><div class="v-card-cat">${v.category}</div></div>
          <span class="status-badge ${v.enabled ? 'badge-enabled' : 'badge-disabled'}">${v.enabled ? 'Active' : 'Disabled'}</span>
        </div>
        <div class="v-card-specs">
          <div class="v-card-spec">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            ${v.passengers} Passengers
          </div>
          <div class="v-card-spec">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
            ${v.luggage} Luggage
          </div>
        </div>
        <div class="v-card-features">
          ${(v.features||[]).map(f=>`<span class="v-feature">${f}</span>`).join('')}
        </div>
        <div class="v-card-foot">
          <div class="action-btns">
            <button class="act-btn act-btn-edit" onclick="openVehicleModal('${v.id}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>Edit
            </button>
            <button class="act-btn act-btn-toggle" onclick="toggleVehicle('${v.id}')">
              ${v.enabled ? '⏸ Disable' : '▶ Enable'}
            </button>
            <button class="act-btn act-btn-del" onclick="confirmDelete('vehicle','${v.id}')">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>`).join('');
}

function openVehicleModal(id) {
  document.getElementById('vehicle-modal-title').textContent = id ? 'Edit Vehicle' : 'Add Vehicle';
  document.getElementById('v-id').value = id || '';
  const preview = document.getElementById('vehicle-img-preview');
  const placeholder = document.getElementById('img-upload-placeholder');

  if (id) {
    const v = DB.getVehicles().find(x => x.id === id);
    if (!v) return;
    document.getElementById('v-name').value = v.name;
    document.getElementById('v-category').value = v.category;
    document.getElementById('v-passengers').value = v.passengers;
    document.getElementById('v-luggage').value = v.luggage;
    document.getElementById('v-badge').value = v.badge || '';
    document.getElementById('v-badge-type').value = v.badgeType || 'green';
    document.getElementById('v-features').value = (v.features||[]).join(', ');
    document.getElementById('v-desc').value = v.description || '';
    if (v.image) { preview.src = v.image; preview.style.display='block'; placeholder.style.display='none'; }
    else { preview.style.display='none'; placeholder.style.display='flex'; }
  } else {
    ['v-name','v-category','v-passengers','v-luggage','v-badge','v-features','v-desc'].forEach(f => { const el=document.getElementById(f); if(el) el.value=''; });
    document.getElementById('v-badge-type').value = 'green';
    preview.style.display='none'; placeholder.style.display='flex';
    preview.src='';
  }
  openModal('vehicle-modal');
}

document.getElementById('vehicle-img-input').addEventListener('change', function() {
  const file = this.files[0];
  if (!file) return;
  if (file.size > 5*1024*1024) { toast('Image must be under 5MB.','error'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    const preview = document.getElementById('vehicle-img-preview');
    preview.src = e.target.result;
    preview.style.display = 'block';
    document.getElementById('img-upload-placeholder').style.display = 'none';
  };
  reader.readAsDataURL(file);
});

function saveVehicle() {
  const name = document.getElementById('v-name').value.trim();
  if (!name) { toast('Vehicle name is required.','error'); return; }

  const id = document.getElementById('v-id').value;
  const imgSrc = document.getElementById('vehicle-img-preview').src;
  const vehicles = DB.getVehicles();

  const vData = {
    id: id || 'v' + Date.now(),
    name,
    image: imgSrc && imgSrc !== window.location.href ? imgSrc : '',
    category: document.getElementById('v-category').value.trim(),
    passengers: parseInt(document.getElementById('v-passengers').value) || 4,
    luggage: parseInt(document.getElementById('v-luggage').value) || 2,
    badge: document.getElementById('v-badge').value.trim(),
    badgeType: document.getElementById('v-badge-type').value,
    features: document.getElementById('v-features').value.split(',').map(s=>s.trim()).filter(Boolean),
    description: document.getElementById('v-desc').value.trim(),
    enabled: id ? (vehicles.find(v=>v.id===id)||{}).enabled !== false : true,
    order: id ? (vehicles.find(v=>v.id===id)||{}).order || 99 : vehicles.length + 1,
  };

  if (id) {
    const idx = vehicles.findIndex(v => v.id === id);
    if (idx !== -1) vehicles[idx] = vData;
  } else {
    vehicles.push(vData);
  }

  DB.set(KEYS.vehicles, vehicles);
  closeModal('vehicle-modal');
  renderVehicles();
  toast(`Vehicle "${name}" ${id?'updated':'added'} and synced to booking form.`, 'success');
}

function toggleVehicle(id) {
  const vehicles = DB.getVehicles();
  const idx = vehicles.findIndex(v => v.id === id);
  if (idx === -1) return;
  vehicles[idx].enabled = !vehicles[idx].enabled;
  DB.set(KEYS.vehicles, vehicles);
  renderVehicles();
  toast(`Vehicle ${vehicles[idx].enabled ? 'enabled' : 'disabled'} and synced to booking form.`, 'success');
}

/* ---------- CUSTOMERS ---------- */
function renderCustomers() {
  const search = (document.getElementById('customer-search').value || '').toLowerCase();
  const customers = DB.getCustomers().filter(c =>
    !search || c.name.toLowerCase().includes(search) || c.email.toLowerCase().includes(search)
  );
  document.getElementById('customers-body').innerHTML = customers.map(c => `
    <tr>
      <td>${c.name}</td>
      <td>${c.email}</td>
      <td>${c.phone}</td>
      <td><span class="status-badge badge-confirmed">${c.bookings}</span></td>
      <td>${formatDate(c.lastBooking)}</td>
      <td>
        <div class="action-btns">
          <button class="act-btn act-btn-view" onclick="toast('Customer history coming soon.','info')">View History</button>
          <button class="act-btn act-btn-del" onclick="confirmDelete('customer','${c.id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg>
          </button>
        </div>
      </td>
    </tr>`).join('') || '<tr><td colspan="6"><div class="empty-state"><p>No customers found</p></div></td></tr>';
}

/* ---------- PRICING ---------- */
function renderPricing() {
  const p = DB.getPricing();
  document.getElementById('price-currency').value = p.currency || 'CHF';
  document.getElementById('price-min').value = p.min || '';
  document.getElementById('price-perkm').value = p.perkm || '';
  document.getElementById('price-airport').value = p.airport || '';
  document.getElementById('price-night').value = p.night || '';
  document.getElementById('price-weekend').value = p.weekend || '';

  const vehicles = DB.getVehicles();
  const vp = DB.getVehiclePricing();
  const currency = p.currency || 'CHF';
  document.getElementById('vehicle-pricing-list').innerHTML = vehicles.length
    ? vehicles.map(v => {
        const vPrice = vp[v.id] || {};
        const hasPrice = vPrice.basePrice || vPrice.pricePerKm;
        const summary = hasPrice
          ? `${currency} ${vPrice.basePrice||0} base + ${currency} ${vPrice.pricePerKm||0}/km · min ${currency} ${vPrice.minPrice||0}`
          : '<em style="color:var(--text-muted)">No pricing set</em>';
        return `
        <div class="toggle-item" style="flex-wrap:wrap;gap:.75rem">
          <div style="flex:1;min-width:0">
            <div style="font-weight:500">${v.name}</div>
            <div class="toggle-label-sub">${v.category}</div>
            <div style="font-size:.73rem;margin-top:.25rem;color:var(--text-sec)">${summary}</div>
          </div>
          <button class="act-btn act-btn-edit" onclick="openVehiclePricingModal('${v.id}')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Set Pricing
          </button>
        </div>`;
      }).join('')
    : '<p style="font-size:.82rem;color:var(--text-muted);padding:.5rem 0">Add vehicles first to configure pricing.</p>';
}

function savePricing() {
  const p = {
    currency: document.getElementById('price-currency').value,
    min:      parseFloat(document.getElementById('price-min').value)||0,
    perkm:    parseFloat(document.getElementById('price-perkm').value)||0,
    airport:  parseFloat(document.getElementById('price-airport').value)||0,
    night:    parseFloat(document.getElementById('price-night').value)||0,
    weekend:  parseFloat(document.getElementById('price-weekend').value)||0,
    multipliers: DB.getPricing().multipliers || {},
  };
  DB.set(KEYS.pricing, p);
  renderPricing();
  toast('Pricing settings saved.', 'success');
}

let _pricingVehicleId = null;

function openVehiclePricingModal(vehicleId) {
  _pricingVehicleId = vehicleId;
  const v = DB.getVehicles().find(x => x.id === vehicleId);
  const vp = DB.getVehiclePricing();
  const current = vp[vehicleId] || {};
  document.getElementById('vp-modal-title').textContent = v ? v.name : 'Vehicle';
  document.getElementById('vp-base-price').value    = current.basePrice   ?? '';
  document.getElementById('vp-price-per-km').value  = current.pricePerKm  ?? '';
  document.getElementById('vp-min-price').value     = current.minPrice    ?? '';
  openModal('vehicle-pricing-modal');
}

function saveVehiclePricing() {
  const basePrice  = parseFloat(document.getElementById('vp-base-price').value);
  const pricePerKm = parseFloat(document.getElementById('vp-price-per-km').value);
  const minPrice   = parseFloat(document.getElementById('vp-min-price').value);

  if (isNaN(basePrice) || isNaN(pricePerKm) || isNaN(minPrice)) {
    toast('Please fill in all pricing fields.', 'error'); return;
  }

  const vp = DB.getVehiclePricing();
  vp[_pricingVehicleId] = { basePrice, pricePerKm, minPrice };
  DB.set(KEYS.vehiclePricing, vp);
  closeModal('vehicle-pricing-modal');
  renderPricing();
  toast('Vehicle pricing saved and synced to booking form.', 'success');
}

/* ---------- SERVICE AREAS ---------- */
function renderServiceAreas() {
  const areas = DB.getAreas();
  document.getElementById('service-areas-list').innerHTML = areas.map(a => `
    <div class="area-item">
      <span class="area-flag">${a.flag}</span>
      <div class="area-info">
        <div class="area-name">${a.name}</div>
        <div class="area-sub">${a.cities}</div>
      </div>
      <div style="display:flex;gap:.5rem;align-items:center">
        <span class="status-badge ${a.enabled?'badge-enabled':'badge-disabled'}">${a.enabled?'Active':'Off'}</span>
        <label class="toggle"><input type="checkbox" ${a.enabled?'checked':''} onchange="toggleArea('${a.code}',this.checked)"/><span class="toggle-slider"></span></label>
      </div>
    </div>`).join('');
}

function toggleArea(code, enabled) {
  const areas = DB.getAreas();
  const idx = areas.findIndex(a => a.code === code);
  if (idx !== -1) { areas[idx].enabled = enabled; DB.set(KEYS.areas, areas); renderServiceAreas(); }
  toast(`${code} service area ${enabled?'enabled':'disabled'} — booking form synced.`, 'success');
}

function openAddAreaModal() { toast('Custom area addition coming soon.', 'info'); }

/* ---------- FORM SETTINGS ---------- */
function renderFormSettings() {
  const fs = DB.getFormSettings();
  document.getElementById('fs-btn1').value     = fs.btn1Text     || '';
  document.getElementById('fs-btn2').value     = fs.btn2Text     || '';
  document.getElementById('fs-btnsubmit').value= fs.btnSubmitText|| '';
  document.getElementById('fs-title1').value   = fs.title1       || '';
  document.getElementById('fs-title2').value   = fs.title2       || '';
  document.getElementById('fs-title3').value   = fs.title3       || '';
  document.getElementById('fs-loc-msg').value  = fs.locMsg       || '';
  document.getElementById('fs-veh-msg').value  = fs.vehMsg       || '';
  document.getElementById('fs-success-msg').value = fs.successMsg|| '';

  document.getElementById('form-toggles').innerHTML = [
    { key:'roundTripEnabled', label:'Round Trip Option',    sub:'Show round trip toggle in Step 1' },
    { key:'vehiclesEnabled',  label:'Vehicle Selection',    sub:'Show vehicle step (Step 2)' },
  ].map(t => `
    <div class="toggle-item">
      <div><div>${t.label}</div><div class="toggle-label-sub">${t.sub}</div></div>
      <label class="toggle"><input type="checkbox" ${fs[t.key]?'checked':''} onchange="updateFormToggle('${t.key}',this.checked)"/><span class="toggle-slider"></span></label>
    </div>`).join('');
}

function updateFormToggle(key, val) {
  const fs = DB.getFormSettings();
  fs[key] = val;
  DB.set(KEYS.formSettings, fs);
}

function saveFormSettings() {
  const fs = DB.getFormSettings();
  fs.btn1Text      = document.getElementById('fs-btn1').value;
  fs.btn2Text      = document.getElementById('fs-btn2').value;
  fs.btnSubmitText = document.getElementById('fs-btnsubmit').value;
  fs.title1        = document.getElementById('fs-title1').value;
  fs.title2        = document.getElementById('fs-title2').value;
  fs.title3        = document.getElementById('fs-title3').value;
  fs.locMsg        = document.getElementById('fs-loc-msg').value;
  fs.vehMsg        = document.getElementById('fs-veh-msg').value;
  fs.successMsg    = document.getElementById('fs-success-msg').value;
  DB.set(KEYS.formSettings, fs);
  toast('Form settings saved and synced to booking form.', 'success');
}

/* ---------- ADMIN USERS ---------- */
function renderAdminUsers() {
  const admins = DB.getAdmins();
  document.getElementById('admin-users-body').innerHTML = admins.map(a => `
    <tr>
      <td>${a.name}</td>
      <td>${a.email}</td>
      <td><span class="status-badge ${a.role==='superadmin'?'badge-confirmed':'badge-pending'}">${a.role}</span></td>
      <td>${a.lastLogin}</td>
      <td><span class="status-badge badge-enabled">${a.status}</span></td>
      <td>
        <div class="action-btns">
          <button class="act-btn act-btn-edit" onclick="openAdminUserModal('${a.id}')">Edit</button>
          ${a.id!=='A-001'?`<button class="act-btn act-btn-del" onclick="confirmDelete('admin','${a.id}')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/></svg></button>`:''}
        </div>
      </td>
    </tr>`).join('');
}

function openAdminUserModal(id) {
  document.getElementById('admin-user-modal-title').textContent = id ? 'Edit Admin' : 'Add Admin';
  document.getElementById('au-id').value = id || '';
  if (id) {
    const a = DB.getAdmins().find(x=>x.id===id)||{};
    document.getElementById('au-name').value  = a.name  || '';
    document.getElementById('au-email').value = a.email || '';
    document.getElementById('au-role').value  = a.role  || 'operator';
    document.getElementById('au-pass').value  = '';
  } else {
    ['au-name','au-email','au-pass'].forEach(f=>{const el=document.getElementById(f);if(el)el.value='';});
    document.getElementById('au-role').value = 'operator';
  }
  openModal('admin-user-modal');
}

function saveAdminUser() {
  const name = document.getElementById('au-name').value.trim();
  const email= document.getElementById('au-email').value.trim();
  if (!name||!email) { toast('Name and email are required.','error'); return; }
  const id = document.getElementById('au-id').value;
  const admins = DB.getAdmins();
  const aData = { id: id||'A-'+Date.now(), name, email, role:document.getElementById('au-role').value, lastLogin:'Never', status:'active' };
  if (id) { const idx=admins.findIndex(a=>a.id===id); if(idx!==-1) admins[idx]={...admins[idx],...aData}; }
  else admins.push(aData);
  DB.set(KEYS.admins, admins);
  closeModal('admin-user-modal');
  renderAdminUsers();
  toast('Admin user saved.','success');
}

/* ---------- ANALYTICS ---------- */
function renderAnalytics() {
  const bookings = DB.getBookings();
  document.getElementById('analytics-stats').innerHTML = [
    { label:'Total Bookings',  value: bookings.length,   icon:'📋' },
    { label:'Completed',       value: bookings.filter(b=>b.status==='completed').length, icon:'✅' },
    { label:'Conversion Rate', value: bookings.length ? Math.round(bookings.filter(b=>b.status==='completed').length/bookings.length*100)+'%' : '0%', icon:'📈' },
    { label:'Active Vehicles', value: DB.getVehicles().filter(v=>v.enabled).length, icon:'🚗' },
  ].map(s=>`<div class="stat-card"><div class="stat-icon" style="background:var(--gold-dim)"><span style="font-size:1.1rem">${s.icon}</span></div><div class="stat-value">${s.value}</div><div class="stat-label">${s.label}</div></div>`).join('');

  // Booking chart (monthly mock data)
  const months=['Jan','Feb','Mar','Apr','May','Jun'];
  const vals=[18,25,22,30,28,35];
  const maxV=Math.max(...vals);
  document.getElementById('booking-chart').innerHTML = vals.map((v,i)=>`
    <div style="display:flex;flex-direction:column;align-items:center;flex:1;gap:.3rem">
      <div class="chart-bar" style="height:${(v/maxV)*90}px"></div>
      <span style="font-size:.62rem;color:var(--text-muted)">${months[i]}</span>
    </div>`).join('');

  // Vehicle popularity
  const vCounts = {};
  bookings.forEach(b=>{ vCounts[b.vehicle]=(vCounts[b.vehicle]||0)+1; });
  const maxC = Math.max(...Object.values(vCounts),1);
  document.getElementById('vehicle-popularity').innerHTML = Object.entries(vCounts)
    .sort((a,b)=>b[1]-a[1])
    .map(([name,count])=>`
      <div class="pop-item">
        <div class="pop-item-head"><span>${name}</span><span style="color:var(--gold);font-weight:600">${count}</span></div>
        <div class="pop-bar-bg"><div class="pop-bar-fill" style="width:${(count/maxC)*100}%"></div></div>
      </div>`).join('') || '<div class="empty-state"><p>No booking data yet</p></div>';

  // Popular routes
  const routes = {};
  bookings.forEach(b=>{ const k=`${b.pickup.split('(')[0].trim()} → ${b.dropoff}`; routes[k]=(routes[k]||0)+1; });
  document.getElementById('popular-routes').innerHTML = Object.entries(routes)
    .sort((a,b)=>b[1]-a[1]).slice(0,5)
    .map(([r,c])=>`<div class="route-item"><span class="route-name">${r}</span><span class="route-count">${c} trips</span></div>`).join('')
    || '<div class="empty-state"><p>No routes yet</p></div>';
}

/* ---------- SETTINGS ---------- */
function renderSettings() {
  const s = DB.getSettings();
  ['company','phone','whatsapp','email','address','website'].forEach(k => {
    const el = document.getElementById('s-'+k); if(el) el.value = s[k]||'';
  });
  const currency = document.getElementById('s-currency'); if(currency) currency.value = s.currency||'CHF';
  const tz = document.getElementById('s-timezone'); if(tz) tz.value = s.timezone||'Europe/Zurich';
  const df = document.getElementById('s-dateformat'); if(df) df.value = s.dateFormat||'DD/MM/YYYY';
  const la = document.getElementById('s-lang'); if(la) la.value = s.lang||'English';
}

function saveSettings() {
  const s = DB.getSettings();
  ['company','phone','whatsapp','email','address','website'].forEach(k=>{const el=document.getElementById('s-'+k);if(el)s[k]=el.value.trim();});
  s.currency = document.getElementById('s-currency')?.value;
  s.timezone = document.getElementById('s-timezone')?.value;
  s.dateFormat = document.getElementById('s-dateformat')?.value;
  s.lang = document.getElementById('s-lang')?.value;
  DB.set(KEYS.settings, s);
  toast('Business settings saved.','success');
}

function saveNotifications() { toast('Notification settings saved.','success'); }

/* ---------- DELETE (shared) ---------- */
let pendingDelete = null;

function confirmDelete(type, id) {
  const labels = { booking:'booking', vehicle:'vehicle', customer:'customer', admin:'admin user' };
  document.getElementById('confirm-title').textContent = `Delete ${capitalize(labels[type]||type)}`;
  document.getElementById('confirm-msg').textContent = `Are you sure you want to delete this ${labels[type]||type}? This action cannot be undone.`;
  pendingDelete = { type, id };
  openModal('confirm-modal');
}

document.getElementById('confirm-action-btn').addEventListener('click', function() {
  if (!pendingDelete) return;
  const { type, id } = pendingDelete;
  const keyMap = { booking:KEYS.bookings, vehicle:KEYS.vehicles, customer:KEYS.customers, admin:KEYS.admins };
  const key = keyMap[type];
  if (key) {
    const data = DB.get(key) || [];
    DB.set(key, data.filter(item => item.id !== id));
  }
  closeModal('confirm-modal');
  pendingDelete = null;
  renderPage(currentPage);
  toast(`${capitalize(type)} deleted.`, 'success');
});

/* ---------- EXPORT CSV ---------- */
function exportCSV(type) {
  const data = type === 'bookings' ? DB.getBookings() : DB.getCustomers();
  if (!data.length) { toast('No data to export.','info'); return; }
  const keys = Object.keys(data[0]).filter(k=>k!=='createdAt');
  const csv = [keys.join(','), ...data.map(row=>keys.map(k=>JSON.stringify(row[k]??'')).join(','))].join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = `swiss-elite-${type}-${Date.now()}.csv`; a.click();
  toast(`${capitalize(type)} exported.`, 'success');
}

/* ---------- PAGINATION ---------- */
function renderPagination(containerId, current, total, onChange) {
  const el = document.getElementById(containerId);
  if (!el || total <= 1) { if(el) el.innerHTML=''; return; }
  let html = `<button class="page-btn" onclick="(${onChange.toString()})(${current-1})" ${current===1?'disabled':''}>← Prev</button>`;
  for(let p=1;p<=total;p++) {
    if(total>7 && (p>2 && p<total-1 && Math.abs(p-current)>1)) { if(p===3||p===total-2) html+='<span style="color:var(--text-muted);padding:.35rem .4rem">…</span>'; continue; }
    html += `<button class="page-btn ${p===current?'active':''}" onclick="(${onChange.toString()})(${p})">${p}</button>`;
  }
  html += `<button class="page-btn" onclick="(${onChange.toString()})(${current+1})" ${current===total?'disabled':''}>Next →</button>`;
  el.innerHTML = html;
}

/* ---------- MODAL ---------- */
function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

document.querySelectorAll('.modal-backdrop').forEach(bd => {
  bd.addEventListener('click', function(e) { if(e.target===this) closeModal(this.id); });
});

/* ---------- TOAST ---------- */
function toast(msg, type='success') {
  const icons = { success:'✓', error:'✕', info:'ℹ' };
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span class="toast-icon">${icons[type]||'✓'}</span><span class="toast-msg">${msg}</span><button class="toast-close" onclick="this.parentElement.remove()">✕</button>`;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => { el.classList.add('toast-out'); setTimeout(()=>el.remove(), 300); }, 3500);
}

/* ---------- HELPERS ---------- */
function todayStr() {
  const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function formatDate(str) {
  if (!str) return '—';
  try { return new Date(str).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}); } catch(e){return str;}
}
function capitalize(str) { return str ? str.charAt(0).toUpperCase()+str.slice(1).replace(/-/g,' ') : ''; }
function topVehicle(bookings) {
  if(!bookings.length) return '—';
  const c={}; bookings.forEach(b=>{c[b.vehicle]=(c[b.vehicle]||0)+1;});
  return Object.entries(c).sort((a,b)=>b[1]-a[1])[0]?.[0]||'—';
}
function statusBadge(s) {
  const map={pending:'badge-pending',confirmed:'badge-confirmed','in-progress':'badge-in-progress',completed:'badge-completed',cancelled:'badge-cancelled'};
  return `<span class="status-badge ${map[s]||''}">${capitalize(s)}</span>`;
}
function paymentBadge(p) {
  return `<span class="status-badge ${p==='paid'?'badge-paid':'badge-unpaid'}">${p==='paid'?'Paid':'Unpaid'}</span>`;
}

/* ---------- SIDEBAR TOGGLE ---------- */
document.getElementById('sidebar-toggle').addEventListener('click', function() {
  const sb=document.getElementById('sidebar'), mw=document.getElementById('main-wrapper');
  sb.classList.toggle('collapsed'); mw.classList.toggle('collapsed');
});

document.getElementById('menu-toggle').addEventListener('click', function() {
  document.getElementById('sidebar').classList.toggle('mobile-open');
  document.getElementById('sidebar-overlay').classList.toggle('visible');
});

document.getElementById('sidebar-overlay').addEventListener('click', function() {
  document.getElementById('sidebar').classList.remove('mobile-open');
  this.classList.remove('visible');
});

/* ---------- NAV CLICKS ---------- */
document.querySelectorAll('.nav-item[data-page]').forEach(item => {
  item.addEventListener('click', () => navigate(item.dataset.page));
});

/* ---------- LOGOUT ---------- */
document.getElementById('logout-btn').addEventListener('click', function() {
  localStorage.removeItem('se_auth');
  window.location.href = 'login.html';
});

/* ---------- SEARCH ---------- */
document.getElementById('booking-search').addEventListener('input', () => { bookingPage=1; renderBookings(); });
document.getElementById('booking-status-filter').addEventListener('change', () => { bookingPage=1; renderBookings(); });
document.getElementById('customer-search').addEventListener('input', renderCustomers);

/* ---------- NOTIFICATION DOT ---------- */
function updateNotifDot() {
  const pending = DB.getBookings().filter(b=>b.status==='pending').length;
  document.getElementById('notif-dot').classList.toggle('visible', pending > 0);
}

/* ---------- INIT ---------- */
seedData();
navigate('overview');
updateNotifDot();

/* Real-time sync — when form submits a booking, dashboard refreshes automatically */
window.addEventListener('storage', function(e) {
  if (e.key === 'se_bookings' || e.key === 'se_frontend_sync') {
    updateNotifDot();
    if (currentPage === 'overview') renderOverview();
    if (currentPage === 'bookings') renderBookings();
    if (currentPage === 'customers') renderCustomers();
    if (currentPage === 'analytics') renderAnalytics();
    /* Flash the bookings badge */
    const badge = document.getElementById('badge-bookings');
    if (badge) {
      badge.style.transform = 'scale(1.4)';
      badge.style.background = 'var(--red)';
      setTimeout(() => { badge.style.transform = ''; badge.style.background = ''; }, 600);
    }
  }
});
