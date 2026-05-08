/* ===================================================
   SWISS ELITE CHAUFFEUR — Booking Form Logic
   =================================================== */

'use strict';

/* ---------- CONFIG ---------- */

const ALLOWED_COUNTRIES = ['CH', 'FR', 'IT']; // Switzerland, France, Italy
const COUNTRY_NAMES = { CH: 'Switzerland', FR: 'France', IT: 'Italy' };

/* Curated location dataset for demo (replaces Google Places when no API key) */
const DEMO_LOCATIONS = [
  { name: 'Geneva Airport (GVA)', sub: 'Geneva, Switzerland', country: 'CH', type: 'airport' },
  { name: 'Zurich Airport (ZRH)', sub: 'Zurich, Switzerland', country: 'CH', type: 'airport' },
  { name: 'Basel Airport (BSL)', sub: 'Basel, Switzerland', country: 'CH', type: 'airport' },
  { name: 'Bern', sub: 'Capital, Switzerland', country: 'CH', type: 'city' },
  { name: 'Zurich', sub: 'Switzerland', country: 'CH', type: 'city' },
  { name: 'Geneva', sub: 'Switzerland', country: 'CH', type: 'city' },
  { name: 'Lausanne', sub: 'Switzerland', country: 'CH', type: 'city' },
  { name: 'Montreux', sub: 'Switzerland', country: 'CH', type: 'city' },
  { name: 'Zermatt', sub: 'Ski Resort, Switzerland', country: 'CH', type: 'ski' },
  { name: 'Verbier', sub: 'Ski Resort, Switzerland', country: 'CH', type: 'ski' },
  { name: 'Gstaad', sub: 'Ski Resort, Switzerland', country: 'CH', type: 'ski' },
  { name: 'St. Moritz', sub: 'Ski Resort, Switzerland', country: 'CH', type: 'ski' },
  { name: 'Davos', sub: 'Switzerland', country: 'CH', type: 'city' },
  { name: 'Interlaken', sub: 'Switzerland', country: 'CH', type: 'city' },
  { name: 'Lugano', sub: 'Switzerland', country: 'CH', type: 'city' },
  { name: 'Basel', sub: 'Switzerland', country: 'CH', type: 'city' },
  { name: 'Lucerne', sub: 'Switzerland', country: 'CH', type: 'city' },
  { name: 'Grindelwald', sub: 'Ski Resort, Switzerland', country: 'CH', type: 'ski' },
  { name: 'Paris Charles de Gaulle (CDG)', sub: 'Paris, France', country: 'FR', type: 'airport' },
  { name: 'Paris Orly (ORY)', sub: 'Paris, France', country: 'FR', type: 'airport' },
  { name: 'Lyon Airport (LYS)', sub: 'Lyon, France', country: 'FR', type: 'airport' },
  { name: 'Nice Airport (NCE)', sub: 'Nice, France', country: 'FR', type: 'airport' },
  { name: 'Paris', sub: 'France', country: 'FR', type: 'city' },
  { name: 'Lyon', sub: 'France', country: 'FR', type: 'city' },
  { name: 'Nice', sub: 'France', country: 'FR', type: 'city' },
  { name: 'Courchevel', sub: 'Ski Resort, France', country: 'FR', type: 'ski' },
  { name: 'Chamonix', sub: 'Ski Resort, France', country: 'FR', type: 'ski' },
  { name: 'Val d\'Isère', sub: 'Ski Resort, France', country: 'FR', type: 'ski' },
  { name: 'Méribel', sub: 'Ski Resort, France', country: 'FR', type: 'ski' },
  { name: 'Megève', sub: 'Ski Resort, France', country: 'FR', type: 'ski' },
  { name: 'Cannes', sub: 'France', country: 'FR', type: 'city' },
  { name: 'Monaco', sub: 'Monaco (near France)', country: 'FR', type: 'city' },
  { name: 'Annecy', sub: 'France', country: 'FR', type: 'city' },
  { name: 'Grenoble', sub: 'France', country: 'FR', type: 'city' },
  { name: 'Milan Malpensa Airport (MXP)', sub: 'Milan, Italy', country: 'IT', type: 'airport' },
  { name: 'Milan Linate Airport (LIN)', sub: 'Milan, Italy', country: 'IT', type: 'airport' },
  { name: 'Rome Fiumicino (FCO)', sub: 'Rome, Italy', country: 'IT', type: 'airport' },
  { name: 'Venice Airport (VCE)', sub: 'Venice, Italy', country: 'IT', type: 'airport' },
  { name: 'Milan', sub: 'Italy', country: 'IT', type: 'city' },
  { name: 'Rome', sub: 'Italy', country: 'IT', type: 'city' },
  { name: 'Venice', sub: 'Italy', country: 'IT', type: 'city' },
  { name: 'Florence', sub: 'Italy', country: 'IT', type: 'city' },
  { name: 'Lake Como', sub: 'Italy', country: 'IT', type: 'city' },
  { name: 'Como', sub: 'Italy', country: 'IT', type: 'city' },
  { name: 'Bellagio', sub: 'Lake Como, Italy', country: 'IT', type: 'city' },
  { name: 'Turin', sub: 'Italy', country: 'IT', type: 'city' },
  { name: 'Verona', sub: 'Italy', country: 'IT', type: 'city' },
  { name: 'Bergamo Airport (BGY)', sub: 'Bergamo, Italy', country: 'IT', type: 'airport' },
  { name: 'Cortina d\'Ampezzo', sub: 'Ski Resort, Italy', country: 'IT', type: 'ski' },
  { name: 'Courmayeur', sub: 'Ski Resort, Italy', country: 'IT', type: 'ski' },
  { name: 'Madonna di Campiglio', sub: 'Ski Resort, Italy', country: 'IT', type: 'ski' },
];

const LOCATION_ICONS = {
  airport: '✈',
  ski:     '⛷',
  city:    '◎',
  hotel:   '🏨',
  train:   '🚉',
};

/* Approximate distances for demo route calculation (km) */
const APPROX_ROUTES = {
  'CH-CH': { dist: [50, 180], time: [45, 150] },
  'CH-FR': { dist: [100, 450], time: [90, 350] },
  'CH-IT': { dist: [80, 380], time: [80, 300] },
  'FR-FR': { dist: [60, 400], time: [55, 320] },
  'FR-IT': { dist: [150, 500], time: [130, 400] },
  'IT-IT': { dist: [40, 600], time: [40, 480] },
};

/* ---------- STATE ---------- */

let currentStep = 1;
let formData = {
  tripType: 'one-way',
  pickup: null,
  dropoff: null,
  pickupDate: '',
  pickupTime: '',
  returnDate: '',
  returnTime: '',
  vehicle: null,
  name: '',
  email: '',
  phone: '',
  notes: '',
  estimatedDistance: null,
};

/* ---------- DOM HELPERS ---------- */

const $ = id => document.getElementById(id);
const qs = sel => document.querySelector(sel);
const qsa = sel => document.querySelectorAll(sel);

function setError(fieldId, msg) {
  const el = $(fieldId + '-error');
  if (!el) return;
  el.textContent = msg;
  const input = $(fieldId);
  if (input) {
    input.classList.toggle('error', !!msg);
    if (msg) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
  }
}

function clearError(fieldId) {
  setError(fieldId, '');
}

/* ---------- TIME SELECT POPULATION ---------- */

function populateTimeSelect(selectId) {
  const sel = $(selectId);
  sel.innerHTML = '<option value="">Select time...</option>';
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const ampm = h < 12 ? 'AM' : 'PM';
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      const mm = String(m).padStart(2, '0');
      const label = `${hour12}:${mm} ${ampm}`;
      const value = `${String(h).padStart(2, '0')}:${mm}`;
      const opt = document.createElement('option');
      opt.value = value;
      opt.textContent = label;
      sel.appendChild(opt);
    }
  }
}

/* ---------- DATE MIN SETUP ---------- */

function setupDateInputs() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm   = String(today.getMonth() + 1).padStart(2, '0');
  const dd   = String(today.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  $('pickup-date').min = todayStr;
  $('pickup-date').value = todayStr;
  formData.pickupDate = todayStr;
  $('return-date').min = todayStr;

  $('pickup-date').addEventListener('change', function () {
    $('return-date').min = this.value || todayStr;
    formData.pickupDate = this.value;
    clearError('pickup-date');
    updateSummary();
  });

  $('return-date').addEventListener('change', function () {
    formData.returnDate = this.value;
    clearError('return-date');
  });

  $('pickup-time').addEventListener('change', function () {
    formData.pickupTime = this.value;
    clearError('pickup-time');
    updateSummary();
  });

  $('return-time').addEventListener('change', function () {
    formData.returnTime = this.value;
    clearError('return-time');
  });
}

/* ---------- TRIP TYPE TOGGLE ---------- */

function setupTripType() {
  qsa('.trip-card').forEach(card => {
    card.addEventListener('click', function () {
      qsa('.trip-card').forEach(c => { c.classList.remove('active'); c.setAttribute('aria-pressed', 'false'); });
      this.classList.add('active');
      this.setAttribute('aria-pressed', 'true');
      formData.tripType = this.dataset.trip;

      const returnFields = $('return-fields');
      if (formData.tripType === 'round-trip') {
        returnFields.style.display = 'block';
        returnFields.style.animation = 'none';
        requestAnimationFrame(() => { returnFields.style.animation = ''; });
      } else {
        returnFields.style.display = 'none';
        formData.returnDate = '';
        formData.returnTime = '';
      }
      updateSummary();
      updateVehiclePrices();
    });
  });
}

/* ---------- LOCATION AUTOCOMPLETE ---------- */

function detectCountryFromText(text) {
  const t = text.toLowerCase();

  // Explicit country names / suffixes
  if (/\b(switzerland|schweiz|suisse|svizzera)\b/.test(t)) return 'CH';
  if (/\b(france|francia|frankreich)\b/.test(t)) return 'FR';
  if (/\b(italy|italia|italien)\b/.test(t)) return 'IT';

  // Swiss cities / postal codes / cantons
  if (/\b(zurich|zürich|geneva|genève|geneve|lausanne|bern|basel|lugano|lucerne|luzern|interlaken|montreux|zermatt|verbier|gstaad|davos|grindelwald|st\.?\s*moritz|locarno|sion|thun|biel|winterthur|schaffhausen|fribourg|neuchâtel|neuchatel|chur|aarau|st\.?\s*gallen|glarus|altdorf|schwyz|stans|appenzell|herisau|liestal|delémont|frauenfeld|sarnen|engelberg)\b/.test(t)) return 'CH';
  // Swiss postal code pattern: 4 digits starting with 1–9
  if (/\b[1-9]\d{3}\b/.test(t) && !/\b(7[5-9]\d{3}|[0-6]\d{4})\b/.test(t)) {
    // rough: Swiss PCs are 1000–9999, French 01000–99999, Italian 00100–99100
    // If 4 digits and no comma separating a long number, likely CH
    if (/\b[1-9]\d{3}\s/.test(t) || t.match(/,\s*[1-9]\d{3}\s*,/)) return 'CH';
  }

  // French cities / departments / indicators
  if (/\b(paris|lyon|nice|cannes|monaco|annecy|grenoble|marseille|bordeaux|toulouse|strasbourg|courchevel|chamonix|val\s*d'is[eè]re|méribel|meribel|meg[eè]ve|trois\s*vall[eé]es|avenue|boulevard|rue\s+|place\s+du|champs[\s-]él[yy]s[eé]es|champs\s+elysees)\b/.test(t)) return 'FR';
  // French postal code: 5 digits starting 0–9 (but not Italian range 00100–99100 which overlaps)
  if (/\b(7[5-9]\d{3}|[0-6]\d{4})\b/.test(t)) return 'FR';

  // Italian cities / street types
  if (/\b(rome|roma|milan|milano|venice|venezia|florence|firenze|turin|torino|verona|bergamo|como|bellagio|cortina|courmayeur|naples|napoli|bologna|palermo|bari|catania|via\s+|piazza\s+|corso\s+|viale\s+|vicolo|lungotevere)\b/.test(t)) return 'IT';
  // Italian postal code: 5 digits starting 0–9 with common Italian ranges
  if (/\b0[01]\d{3}\b|\b[2-9]\d{4}\b/.test(t) && /\b(via|piazza|corso|viale|rome|roma|milan|milano|italy|italia)\b/.test(t)) return 'IT';

  return null;
}

function setupAutocomplete(inputId, dropdownId, clearId, stateKey) {
  const input    = $(inputId);
  const dropdown = $(dropdownId);
  const clearBtn = $(clearId);

  let selectedIndex = -1;
  let items = [];

  function showDropdown(results) {
    items = results;
    selectedIndex = -1;
    dropdown.innerHTML = '';
    if (!results.length) { dropdown.innerHTML = ''; return; }

    results.forEach((loc, i) => {
      const div = document.createElement('div');
      div.className = 'autocomplete-item';
      div.setAttribute('role', 'option');
      div.innerHTML = `
        <span class="autocomplete-item-icon">${LOCATION_ICONS[loc.type] || '◎'}</span>
        <span>
          <span class="autocomplete-item-name">${loc.name}</span><br>
          <span class="autocomplete-item-sub">${loc.sub}</span>
        </span>`;
      div.addEventListener('mousedown', e => {
        e.preventDefault();
        selectLocation(loc);
      });
      dropdown.appendChild(div);
    });
  }

  function selectLocation(loc) {
    input.value = loc.name;
    formData[stateKey] = loc;
    dropdown.innerHTML = '';
    clearBtn.style.display = 'inline';
    clearError(inputId);
    checkRoute();
    updateSummary();
  }

  function closeDropdown() {
    dropdown.innerHTML = '';
    selectedIndex = -1;
  }

  input.addEventListener('input', function () {
    const raw = this.value.trim();
    const q   = raw.toLowerCase();
    clearBtn.style.display = raw ? 'inline' : 'none';
    if (q.length < 2) { closeDropdown(); return; }

    const matches = DEMO_LOCATIONS.filter(l =>
      l.name.toLowerCase().includes(q) || l.sub.toLowerCase().includes(q)
    ).slice(0, 8);

    if (matches.length) {
      showDropdown(matches);
      return;
    }

    // No curated match — try free-text country detection
    const detectedCountry = detectCountryFromText(raw);
    if (detectedCountry) {
      const countryName = COUNTRY_NAMES[detectedCountry];
      const freeItem = {
        name: raw,
        sub: countryName,
        country: detectedCountry,
        type: 'address',
        _freeText: true,
      };
      // Build a custom dropdown entry with a "use this address" hint
      items = [freeItem];
      selectedIndex = -1;
      dropdown.innerHTML = '';
      const div = document.createElement('div');
      div.className = 'autocomplete-item autocomplete-freetext';
      div.setAttribute('role', 'option');
      div.innerHTML = `
        <span class="autocomplete-item-icon">📍</span>
        <span>
          <span class="autocomplete-item-name">${raw}</span><br>
          <span class="autocomplete-item-sub">Use this address · ${countryName}</span>
        </span>`;
      div.addEventListener('mousedown', e => {
        e.preventDefault();
        selectLocation(freeItem);
      });
      dropdown.appendChild(div);
    } else {
      // Country not detectable — show a soft "outside service area" hint (non-selectable)
      dropdown.innerHTML = '';
      const div = document.createElement('div');
      div.className = 'autocomplete-item autocomplete-noresult';
      div.innerHTML = `
        <span class="autocomplete-item-icon">⚠</span>
        <span>
          <span class="autocomplete-item-name">No results found</span><br>
          <span class="autocomplete-item-sub">Serving Switzerland, France &amp; Italy only</span>
        </span>`;
      dropdown.appendChild(div);
    }
  });

  input.addEventListener('keydown', function (e) {
    const divs = dropdown.querySelectorAll('.autocomplete-item');
    if (!divs.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, divs.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0) { selectLocation(items[selectedIndex]); }
      return;
    } else if (e.key === 'Escape') {
      closeDropdown(); return;
    }

    divs.forEach((d, i) => d.classList.toggle('active-suggestion', i === selectedIndex));
    if (selectedIndex >= 0) divs[selectedIndex].scrollIntoView({ block: 'nearest' });
  });

  input.addEventListener('blur', () => { setTimeout(closeDropdown, 150); });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    formData[stateKey] = null;
    clearBtn.style.display = 'none';
    closeDropdown();
    checkRoute();
    updateSummary();
  });
}

/* ---------- ROUTE ESTIMATION ---------- */

function seededRandom(seed) {
  // Simple LCG — deterministic per-route distance
  const a = 1664525, c = 1013904223, m = 2 ** 32;
  return ((a * seed + c) % m) / m;
}

function routeHash(pickupName, dropoffName) {
  const s = (pickupName + '|' + dropoffName).toLowerCase();
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h;
}

function checkRoute() {
  const p = formData.pickup;
  const d = formData.dropoff;
  const summary = $('route-summary');

  if (!p || !d) { summary.style.display = 'none'; formData.estimatedDistance = null; return; }

  const key1 = `${p.country}-${d.country}`;
  const key2 = `${d.country}-${p.country}`;
  const route = APPROX_ROUTES[key1] || APPROX_ROUTES[key2] || { dist: [80, 300], time: [70, 240] };

  const seed = routeHash(p.name, d.name);
  const r1 = seededRandom(seed);
  const r2 = seededRandom(seed + 1);

  const dist = Math.floor(r1 * (route.dist[1] - route.dist[0]) + route.dist[0]);
  const mins = Math.floor(r2 * (route.time[1] - route.time[0]) + route.time[0]);
  const hours = Math.floor(mins / 60);
  const remaining = mins % 60;
  const timeStr = hours > 0 ? `${hours}h ${remaining > 0 ? remaining + 'm' : ''}` : `${mins}m`;

  const isAirport = (p.type === 'airport' || d.type === 'airport');
  const type = isAirport ? 'Airport Transfer' : (hours >= 2 ? 'Long Distance' : 'City Transfer');

  formData.estimatedDistance = dist;

  $('route-distance').textContent = `~${dist} km`;
  $('route-duration').textContent = `~${timeStr}`;
  $('route-type').textContent = type;

  summary.style.display = 'block';
  summary.style.animation = 'none';
  requestAnimationFrame(() => { summary.style.animation = ''; });
}

/* ---------- FARE CALCULATION ---------- */

function calculateFare(vehicleId, distanceKm, isRoundTrip) {
  try {
    const allPricing = JSON.parse(localStorage.getItem('se_vehicle_pricing') || '{}');
    const p = allPricing[vehicleId];
    if (!p) return null;
    const base    = parseFloat(p.basePrice)   || 0;
    const perKm   = parseFloat(p.pricePerKm)  || 0;
    const minFare = parseFloat(p.minPrice)    || 0;
    let fare = base + distanceKm * perKm;
    fare = Math.max(fare, minFare);
    if (isRoundTrip) fare *= 2;
    return Math.round(fare);
  } catch(e) {
    return null;
  }
}

function updateVehiclePrices() {
  const dist = formData.estimatedDistance;
  if (!dist) return;
  const isRound = formData.tripType === 'round-trip';
  let currency = 'CHF';
  try {
    const settings = JSON.parse(localStorage.getItem('se_settings') || '{}');
    currency = settings.currency || 'CHF';
  } catch(e) {}

  qsa('.vehicle-card').forEach(card => {
    const vid = card.dataset.vehicle;
    let fareEl = card.querySelector('.vehicle-fare');
    if (!fareEl) {
      fareEl = document.createElement('div');
      fareEl.className = 'vehicle-fare';
      const info = card.querySelector('.vehicle-info');
      if (info) info.appendChild(fareEl);
    }
    const fare = calculateFare(vid, dist, isRound);
    if (fare !== null) {
      fareEl.innerHTML = `
        <div class="fare-inner">
          <span class="fare-label">${isRound ? 'Round Trip' : 'One Way'} · ~${dist} km</span>
          <span class="fare-amount">${currency} ${fare.toLocaleString()}</span>
        </div>`;
      fareEl.style.display = 'block';
    } else {
      fareEl.style.display = 'none';
    }
  });
}

/* ---------- BOOKING SUMMARY (Step 3) ---------- */

function updateSummary() {
  const p = formData.pickup;
  const d = formData.dropoff;
  const route = (p && d) ? `${p.name} → ${d.name}` : '—';
  $('summary-route').textContent = route;

  let dt = '—';
  if (formData.pickupDate && formData.pickupTime) {
    const dateObj = new Date(formData.pickupDate + 'T' + formData.pickupTime);
    dt = dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
      + ' · '
      + dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  } else if (formData.pickupDate) {
    dt = new Date(formData.pickupDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  $('summary-datetime').textContent = dt;

  const vNames = {
    'tesla-model-y':    'Tesla Model Y',
    'mercedes-s-class': 'Mercedes S-Class',
    'mercedes-v-class': 'Mercedes V-Class',
  };
  $('summary-vehicle').textContent = formData.vehicle ? vNames[formData.vehicle] : '—';
  $('summary-triptype').textContent = formData.tripType === 'round-trip' ? 'Round Trip' : 'One Way';
}

/* ---------- VEHICLE SELECTION ---------- */

function setupVehicleCards() {
  qsa('.vehicle-card').forEach(card => {
    card.addEventListener('click', () => selectVehicle(card));
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectVehicle(card); }
    });
  });
}

function selectVehicle(card) {
  qsa('.vehicle-card').forEach(c => {
    c.classList.remove('selected');
    c.setAttribute('aria-checked', 'false');
  });
  card.classList.add('selected');
  card.setAttribute('aria-checked', 'true');
  formData.vehicle = card.dataset.vehicle;
  clearError('vehicle');
  updateSummary();
}

/* ---------- STEP NAVIGATION ---------- */

function goToStep(targetStep) {
  if (targetStep > currentStep && !validateStep(currentStep)) return;

  const leaving = $(`step-${currentStep}`);
  const entering = $(`step-${targetStep}`);

  if (!leaving || !entering) return;

  // Animate out
  leaving.style.animation = 'stepOut 0.25s ease forwards';
  setTimeout(() => {
    leaving.classList.remove('active');
    leaving.style.animation = '';

    entering.classList.add('active');
    entering.style.animation = 'stepIn 0.4s cubic-bezier(0.4,0,0.2,1) forwards';

    if (targetStep === 2) updateVehiclePrices();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 220);

  updateProgressBar(currentStep, targetStep);
  currentStep = targetStep;
}

function updateProgressBar(from, to) {
  for (let s = 1; s <= 3; s++) {
    const navItem = $(`step-nav-${s}`);
    navItem.classList.remove('active', 'completed');
    if (s < to) navItem.classList.add('completed');
    else if (s === to) navItem.classList.add('active');
  }

  // Connectors
  $('connector-1-2').classList.toggle('filled', to >= 2);
  $('connector-2-3').classList.toggle('filled', to >= 3);
}

/* ---------- VALIDATION ---------- */

function validateStep(step) {
  let valid = true;

  if (step === 1) {
    // Pickup location
    if (!formData.pickup) {
      setError('pickup-location', 'Please select a pickup location.');
      valid = false;
    } else if (!ALLOWED_COUNTRIES.includes(formData.pickup.country)) {
      setError('pickup-location', 'Currently, transfers are available only within Switzerland, France, and Italy.');
      valid = false;
    } else {
      clearError('pickup-location');
    }

    // Dropoff location
    if (!formData.dropoff) {
      setError('dropoff-location', 'Please select a drop-off location.');
      valid = false;
    } else if (!ALLOWED_COUNTRIES.includes(formData.dropoff.country)) {
      setError('dropoff-location', 'Currently, transfers are available only within Switzerland, France, and Italy.');
      valid = false;
    } else {
      clearError('dropoff-location');
    }

    // Pickup date
    if (!formData.pickupDate) {
      setError('pickup-date', 'Please select a pickup date.');
      valid = false;
    } else {
      clearError('pickup-date');
    }

    // Pickup time
    if (!formData.pickupTime) {
      setError('pickup-time', 'Please select a pickup time.');
      valid = false;
    } else {
      clearError('pickup-time');
    }

    // Round trip validation
    if (formData.tripType === 'round-trip') {
      if (!formData.returnDate) {
        setError('return-date', 'Please select a return date.');
        valid = false;
      } else if (formData.returnDate < formData.pickupDate) {
        setError('return-date', 'Return date must be on or after the pickup date.');
        valid = false;
      } else {
        clearError('return-date');
      }

      if (!formData.returnTime) {
        setError('return-time', 'Please select a return time.');
        valid = false;
      } else {
        clearError('return-time');
      }
    }
  }

  if (step === 2) {
    if (!formData.vehicle) {
      setError('vehicle', 'Please select a vehicle to continue.');
      valid = false;
    } else {
      clearError('vehicle');
    }
  }

  return valid;
}

function validateStep3() {
  let valid = true;

  const name = $('full-name').value.trim();
  if (!name || name.length < 2) {
    setError('full-name', 'Please enter your full name.');
    valid = false;
  } else {
    clearError('full-name');
    formData.name = name;
  }

  const email = $('email').value.trim();
  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    setError('email', 'Please enter your email address.');
    valid = false;
  } else if (!emailRx.test(email)) {
    setError('email', 'Please enter a valid email address.');
    valid = false;
  } else {
    clearError('email');
    formData.email = email;
  }

  const phone = $('phone').value.trim();
  const phoneRx = /^\+?[\d\s\-().]{7,20}$/;
  if (!phone) {
    setError('phone', 'Please enter your phone number.');
    valid = false;
  } else if (!phoneRx.test(phone)) {
    setError('phone', 'Please enter a valid phone number.');
    valid = false;
  } else {
    clearError('phone');
    formData.phone = phone;
  }

  formData.notes = $('special-requests').value.trim();

  return valid;
}

/* ---------- SUBMIT ---------- */

function submitForm() {
  if (!validateStep3()) return;

  const btn = $('submit-btn');
  const btnText = btn.querySelector('.btn-text');
  const btnArrow = btn.querySelector('.btn-arrow');
  const btnLoader = btn.querySelector('.btn-loader');

  btnText.style.display = 'none';
  btnArrow.style.display = 'none';
  btnLoader.style.display = 'inline-flex';
  btn.disabled = true;

  setTimeout(() => {
    const ref = saveBookingToStorage();
    sendConfirmationEmail(ref);
    showSuccess(ref);
  }, 1200);
}

function sendConfirmationEmail(ref) {
  const isRound = formData.tripType === 'round-trip';
  const fare = formData.estimatedDistance
    ? calculateFare(formData.vehicle, formData.estimatedDistance, isRound)
    : null;

  const payload = {
    ref,
    name:              formData.name,
    email:             formData.email,
    phone:             formData.phone,
    tripType:          formData.tripType,
    pickup:            formData.pickup  ? formData.pickup.name  : '',
    dropoff:           formData.dropoff ? formData.dropoff.name : '',
    date:              formData.pickupDate,
    time:              formData.pickupTime,
    returnDate:        formData.returnDate  || '',
    returnTime:        formData.returnTime  || '',
    vehicle:           resolveVehicleName(formData.vehicle),
    estimatedDistance: formData.estimatedDistance || null,
    estimatedFare:     fare,
    notes:             formData.notes || '',
  };

  fetch('/send-email.php', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  }).catch(() => {}); // fire-and-forget — never block the confirmation screen
}

function generateRef() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return 'SE-' + Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function resolveVehicleName(vehicleId) {
  const staticNames = {
    'tesla-model-y':    'Tesla Model Y',
    'mercedes-s-class': 'Mercedes S-Class',
    'mercedes-v-class': 'Mercedes V-Class',
  };
  try {
    const stored = JSON.parse(localStorage.getItem('se_vehicles') || '[]');
    const match = stored.find(v => v.id === vehicleId);
    if (match) return match.name;
  } catch(e) {}
  return staticNames[vehicleId] || vehicleId;
}

function saveBookingToStorage() {
  const ref = generateRef();

  const isRoundTrip = formData.tripType === 'round-trip';
  const fareAmount  = formData.estimatedDistance
    ? calculateFare(formData.vehicle, formData.estimatedDistance, isRoundTrip)
    : null;

  const booking = {
    id:            ref,
    name:          formData.name,
    email:         formData.email,
    phone:         formData.phone,
    tripType:      formData.tripType,
    pickup:        formData.pickup  ? formData.pickup.name  : '',
    pickupSub:     formData.pickup  ? formData.pickup.sub   : '',
    pickupCountry: formData.pickup  ? formData.pickup.country : '',
    dropoff:       formData.dropoff ? formData.dropoff.name : '',
    dropoffSub:    formData.dropoff ? formData.dropoff.sub  : '',
    dropoffCountry:formData.dropoff ? formData.dropoff.country : '',
    date:          formData.pickupDate,
    time:          formData.pickupTime,
    returnDate:    formData.returnDate  || '',
    returnTime:    formData.returnTime  || '',
    vehicleId:     formData.vehicle,
    vehicle:       resolveVehicleName(formData.vehicle),
    estimatedDistance: formData.estimatedDistance || null,
    estimatedFare:     fareAmount,
    status:        'pending',
    payment:       'unpaid',
    notes:         formData.notes || '',
    source:        'website',
    createdAt:     Date.now(),
  };

  /* Save booking */
  const bookings = JSON.parse(localStorage.getItem('se_bookings') || '[]');
  bookings.unshift(booking);
  localStorage.setItem('se_bookings', JSON.stringify(bookings));

  /* Save / update customer */
  const customers = JSON.parse(localStorage.getItem('se_customers') || '[]');
  const existingIdx = customers.findIndex(c => c.email === formData.email);
  if (existingIdx >= 0) {
    customers[existingIdx].bookings   = (customers[existingIdx].bookings || 0) + 1;
    customers[existingIdx].lastBooking = formData.pickupDate;
    customers[existingIdx].phone       = formData.phone;
  } else {
    customers.unshift({
      id:          'C-' + Date.now(),
      name:        formData.name,
      email:       formData.email,
      phone:       formData.phone,
      bookings:    1,
      lastBooking: formData.pickupDate,
      createdAt:   Date.now(),
    });
  }
  localStorage.setItem('se_customers', JSON.stringify(customers));

  /* Signal dashboard for real-time sync */
  localStorage.setItem('se_frontend_sync', JSON.stringify({ key: 'se_bookings', ts: Date.now() }));

  return ref;
}

function showSuccess(ref) {
  $('step-3').classList.remove('active');
  const success = $('step-success');
  success.classList.add('active');

  $('success-ref').textContent = ref;

  // Mark all steps complete
  for (let s = 1; s <= 3; s++) {
    const nav = $(`step-nav-${s}`);
    nav.classList.remove('active');
    nav.classList.add('completed');
  }
  $('connector-1-2').classList.add('filled');
  $('connector-2-3').classList.add('filled');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function resetForm() {
  formData = {
    tripType: 'one-way', pickup: null, dropoff: null,
    pickupDate: '', pickupTime: '', returnDate: '', returnTime: '',
    vehicle: null, name: '', email: '', phone: '', notes: '',
    estimatedDistance: null,
  };

  /* Reset inputs */
  ['pickup-location','dropoff-location','full-name','email','phone'].forEach(id => {
    const el = $(id);
    if (el) { el.value = ''; el.classList.remove('error'); }
  });
  const todayReset = new Date();
  const todayResetStr = `${todayReset.getFullYear()}-${String(todayReset.getMonth()+1).padStart(2,'0')}-${String(todayReset.getDate()).padStart(2,'0')}`;
  $('pickup-date').value = todayResetStr;
  formData.pickupDate = todayResetStr;
  $('return-date').value = '';
  $('pickup-time').value = '';
  $('return-time').value = '';
  $('special-requests').value = '';
  $('return-fields').style.display = 'none';
  $('route-summary').style.display = 'none';
  $('pickup-clear').style.display = 'none';
  $('dropoff-clear').style.display = 'none';

  /* Reset trip cards */
  qsa('.trip-card').forEach((c, i) => {
    c.classList.toggle('active', i === 0);
    c.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
  });

  /* Reset vehicles */
  qsa('.vehicle-card').forEach(c => {
    c.classList.remove('selected');
    c.setAttribute('aria-checked', 'false');
  });

  /* Reset submit button */
  const btn = $('submit-btn');
  btn.querySelector('.btn-text').style.display = '';
  btn.querySelector('.btn-arrow').style.display = '';
  btn.querySelector('.btn-loader').style.display = 'none';
  btn.disabled = false;

  /* Clear all errors */
  qsa('.field-error').forEach(e => e.textContent = '');

  /* Return to step 1 */
  $('step-success').classList.remove('active');
  currentStep = 1;
  const step1 = $('step-1');
  step1.classList.add('active');

  for (let s = 1; s <= 3; s++) {
    const nav = $(`step-nav-${s}`);
    nav.classList.remove('active', 'completed');
    if (s === 1) nav.classList.add('active');
  }
  $('connector-1-2').classList.remove('filled');
  $('connector-2-3').classList.remove('filled');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---------- INLINE FIELD VALIDATION ---------- */

function setupInlineValidation() {
  $('full-name').addEventListener('blur', function () {
    if (this.value.trim().length > 0 && this.value.trim().length < 2) {
      setError('full-name', 'Name must be at least 2 characters.');
    } else if (this.value.trim()) {
      clearError('full-name');
    }
  });

  $('email').addEventListener('blur', function () {
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (this.value && !emailRx.test(this.value.trim())) {
      setError('email', 'Please enter a valid email address.');
    } else {
      clearError('email');
    }
  });

  $('phone').addEventListener('blur', function () {
    const phoneRx = /^\+?[\d\s\-().]{7,20}$/;
    if (this.value && !phoneRx.test(this.value.trim())) {
      setError('phone', 'Please enter a valid phone number.');
    } else {
      clearError('phone');
    }
  });
}

/* ---------- GOOGLE PLACES API (Optional) ---------- */

/*
  To enable Google Places Autocomplete:
  1. Replace YOUR_GOOGLE_PLACES_API_KEY below with your actual key.
  2. Uncomment the <script> tag in index.html for Maps API.
  3. Call initGooglePlaces() in the DOMContentLoaded callback.
*/

const GOOGLE_API_KEY = ''; // e.g. 'AIzaSy...'

function initGooglePlaces() {
  if (!GOOGLE_API_KEY || typeof google === 'undefined') return;

  const BOUNDS = new google.maps.LatLngBounds(
    new google.maps.LatLng(43.0, 5.0),  // SW corner
    new google.maps.LatLng(47.9, 14.0)  // NE corner
  );

  ['pickup-location', 'dropoff-location'].forEach((inputId, idx) => {
    const stateKey = idx === 0 ? 'pickup' : 'dropoff';
    const autocomplete = new google.maps.places.Autocomplete($(inputId), {
      bounds: BOUNDS,
      strictBounds: false,
      types: ['establishment', 'geocode'],
      componentRestrictions: { country: ['ch', 'fr', 'it'] },
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.address_components) return;

      const countryComp = place.address_components.find(c => c.types.includes('country'));
      const countryCode = countryComp ? countryComp.short_name : '';

      if (!ALLOWED_COUNTRIES.includes(countryCode)) {
        setError(inputId, 'Currently, transfers are available only within Switzerland, France, and Italy.');
        formData[stateKey] = null;
        return;
      }

      clearError(inputId);
      formData[stateKey] = {
        name: place.name || place.formatted_address,
        sub: place.formatted_address,
        country: countryCode,
        type: 'city',
        placeId: place.place_id,
      };
      checkRoute();
      updateSummary();
    });
  });
}

/* ---------- INIT ---------- */

/* ---------- DYNAMIC VEHICLES FROM ADMIN ---------- */

const BADGE_CLASSES = { green: '', gold: 'badge-gold', silver: 'badge-silver' };

function renderAdminVehicles() {
  try {
    const stored = localStorage.getItem('se_vehicles');
    if (!stored) return;
    const vehicles = JSON.parse(stored).filter(v => v.enabled);
    if (!vehicles.length) return;

    const grid = document.querySelector('.vehicle-grid');
    if (!grid) return;

    const badgeTypeClass = { green:'', gold:'badge-gold', silver:'badge-silver' };

    grid.innerHTML = vehicles.map(v => `
      <div class="vehicle-card" data-vehicle="${v.id}" role="radio" aria-checked="false" tabindex="0">
        <div class="vehicle-badge ${badgeTypeClass[v.badgeType]||''}">${v.badge || ''}</div>
        <div class="vehicle-image-wrap">
          <img src="${v.image}" alt="${v.name}" class="vehicle-img"
            onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'400\' height=\'300\' viewBox=\'0 0 400 300\'%3E%3Crect width=\'400\' height=\'300\' fill=\'%23111\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' dominant-baseline=\'middle\' text-anchor=\'middle\' fill=\'%23C8A45D\' font-size=\'14\' font-family=\'Poppins\'%3E${v.name}%3C/text%3E%3C/svg%3E'"/>
        </div>
        <div class="vehicle-info">
          <h3 class="vehicle-name">${v.name}</h3>
          <p class="vehicle-class">${v.category}</p>
          <div class="vehicle-specs">
            <span class="spec">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              ${v.passengers} Passengers
            </span>
            <span class="spec">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
              ${v.luggage} Luggage
            </span>
          </div>
          <ul class="vehicle-features">
            ${(v.features||[]).map(f=>`<li>${f}</li>`).join('')}
          </ul>
          <div class="vehicle-fare" style="display:none"></div>
        </div>
        <div class="vehicle-select-indicator">
          <span class="indicator-ring"></span>
          <span class="indicator-text">Selected</span>
        </div>
      </div>`).join('');

    setupVehicleCards();
    updateVehiclePrices();
  } catch(e) { /* silently fall back to static HTML */ }
}

function applyFormSettings() {
  try {
    const fs = JSON.parse(localStorage.getItem('se_form_settings') || '{}');
    if (fs.btn1Text)      { const el = document.querySelector('#step1-next span'); if(el) el.textContent = fs.btn1Text; }
    if (fs.btn2Text)      { const el = document.querySelector('#step2-next span'); if(el) el.textContent = fs.btn2Text; }
    if (fs.btnSubmitText) { const el = document.querySelector('.btn-submit .btn-text'); if(el) el.textContent = fs.btnSubmitText; }
    if (fs.title1)        { const el = document.getElementById('step1-heading'); if(el) el.textContent = fs.title1; }
    if (fs.title2)        { const el = document.getElementById('step2-heading'); if(el) el.textContent = fs.title2; }
    if (fs.title3)        { const el = document.getElementById('step3-heading'); if(el) el.textContent = fs.title3; }
  } catch(e) {}
}

document.addEventListener('DOMContentLoaded', () => {
  populateTimeSelect('pickup-time');
  populateTimeSelect('return-time');
  setupDateInputs();
  setupTripType();
  setupAutocomplete('pickup-location', 'pickup-dropdown', 'pickup-clear', 'pickup');
  setupAutocomplete('dropoff-location', 'dropoff-dropdown', 'dropoff-clear', 'dropoff');

  /* Load vehicles from admin dashboard if available, else use static HTML */
  renderAdminVehicles();
  setupVehicleCards();

  applyFormSettings();
  setupInlineValidation();

  /* If Google API is available, override demo autocomplete */
  if (GOOGLE_API_KEY) {
    initGooglePlaces();
  }

  /* Listen for admin sync events (cross-tab updates) */
  window.addEventListener('storage', function(e) {
    if (e.key === 'se_frontend_sync') {
      renderAdminVehicles();
      applyFormSettings();
      updateVehiclePrices();
    }
    if (e.key === 'se_vehicle_pricing') {
      updateVehiclePrices();
    }
  });
});
