import { useState, useEffect, useRef, useCallback } from 'react';
import '../styles/booking.css';
import { DEMO_LOCATIONS, detectCountryFromText, COUNTRY_NAMES, ALLOWED_COUNTRIES, LOCATION_ICONS } from '../utils/locations';
import { estimateRoute, calculateFare, generateRef, resolveVehicleName } from '../utils/pricing';

const TODAY = (() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
})();

const TIME_OPTIONS = (() => {
  const opts = [{ value:'', label:'Select time...' }];
  for (let h = 0; h < 24; h++) for (let m = 0; m < 60; m += 30) {
    const ampm = h < 12 ? 'AM' : 'PM';
    const h12 = h % 12 || 12;
    const mm = String(m).padStart(2,'0');
    opts.push({ value:`${String(h).padStart(2,'0')}:${mm}`, label:`${h12}:${mm} ${ampm}` });
  }
  return opts;
})();

/* ── Location Autocomplete Component ─────────────────────────── */
function LocationAutocomplete({ placeholder, selected, onSelect, onClear, error, id }) {
  const [query, setQuery]      = useState(selected?.name || '');
  const [items, setItems]      = useState([]);
  const [open, setOpen]        = useState(false);
  const [activeIdx, setActive] = useState(-1);
  const dropRef = useRef(null);

  useEffect(() => { setQuery(selected?.name || ''); }, [selected]);

  function handleInput(val) {
    setQuery(val);
    if (!selected || selected.name !== val) onSelect(null);
    const q = val.trim().toLowerCase();
    if (q.length < 2) { setItems([]); setOpen(false); return; }

    const curated = DEMO_LOCATIONS.filter(l =>
      l.name.toLowerCase().includes(q) || l.sub.toLowerCase().includes(q)
    ).slice(0, 8);

    if (curated.length) {
      setItems(curated); setOpen(true); setActive(-1); return;
    }
    const country = detectCountryFromText(val);
    if (country) {
      setItems([{ name: val, sub: `Use this address · ${COUNTRY_NAMES[country]}`, country, type:'address', _free: true }]);
    } else {
      setItems([{ _noResult: true }]);
    }
    setOpen(true); setActive(-1);
  }

  function select(item) {
    if (item._noResult) return;
    setQuery(item.name); onSelect(item); setOpen(false);
  }

  function handleKey(e) {
    const valid = items.filter(i => !i._noResult);
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(i => Math.min(i+1, valid.length-1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(i => Math.max(i-1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (activeIdx >= 0) select(valid[activeIdx]); }
    else if (e.key === 'Escape') setOpen(false);
  }

  return (
    <div className="input-wrap autocomplete-wrap" style={{position:'relative'}}>
      <input
        id={id}
        className={`input ${error ? 'error' : ''}`}
        value={query}
        placeholder={placeholder}
        onChange={e => handleInput(e.target.value)}
        onKeyDown={handleKey}
        onFocus={() => query.length >= 2 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        autoComplete="off"
      />
      {query && (
        <button className="input-clear-btn" onMouseDown={e => { e.preventDefault(); setQuery(''); onSelect(null); onClear(); setOpen(false); }}>✕</button>
      )}
      {open && items.length > 0 && (
        <div className="autocomplete-dropdown" ref={dropRef}>
          {items.map((item, i) => item._noResult ? (
            <div key="nr" className="autocomplete-item autocomplete-noresult">
              <span className="autocomplete-item-icon">⚠</span>
              <span><span className="autocomplete-item-name">No results found</span><br/><span className="autocomplete-item-sub">Serving Switzerland, France &amp; Italy only</span></span>
            </div>
          ) : (
            <div key={i} className={`autocomplete-item ${item._free ? 'autocomplete-freetext' : ''} ${i === activeIdx ? 'active-suggestion' : ''}`}
              onMouseDown={e => { e.preventDefault(); select(item); }}>
              <span className="autocomplete-item-icon">{item._free ? '📍' : (LOCATION_ICONS[item.type] || '◎')}</span>
              <span>
                <span className="autocomplete-item-name">{item.name}</span><br/>
                <span className="autocomplete-item-sub">{item.sub}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Main BookingForm ─────────────────────────────────────────── */
export default function BookingForm() {
  const [step, setStep]         = useState(1);
  const [tripType, setTripType] = useState('one-way');
  const [pickup, setPickup]     = useState(null);
  const [dropoff, setDropoff]   = useState(null);
  const [pickupDate, setPickupDate]   = useState(TODAY);
  const [pickupTime, setPickupTime]   = useState('');
  const [returnDate, setReturnDate]   = useState('');
  const [returnTime, setReturnTime]   = useState('');
  const [vehicle, setVehicle]   = useState(null);
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [phone, setPhone]       = useState('');
  const [notes, setNotes]       = useState('');
  const [errors, setErrors]     = useState({});
  const [vehicles, setVehicles] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);
  const [estimatedDist, setEstDist] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [formSettings, setFormSettings] = useState({});

  const loadVehicles = useCallback(() => {
    try {
      const stored = localStorage.getItem('se_vehicles');
      if (stored) {
        const parsed = JSON.parse(stored).filter(v => v.enabled);
        if (parsed.length) { setVehicles(parsed); return; }
      }
    } catch(e) {}
    setVehicles([]);
  }, []);

  const loadSettings = useCallback(() => {
    try {
      const fs = JSON.parse(localStorage.getItem('se_form_settings') || '{}');
      setFormSettings(fs);
    } catch(e) {}
  }, []);

  useEffect(() => {
    loadVehicles();
    loadSettings();
    const onStorage = e => {
      if (['se_frontend_sync','se_vehicles','se_vehicle_pricing'].includes(e.key)) {
        loadVehicles(); loadSettings();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [loadVehicles, loadSettings]);

  useEffect(() => {
    if (pickup && dropoff) {
      const info = estimateRoute(pickup, dropoff);
      setRouteInfo(info);
      setEstDist(info.dist);
    } else {
      setRouteInfo(null);
      setEstDist(null);
    }
  }, [pickup, dropoff]);

  const isRound = tripType === 'round-trip';

  function clearErr(field) { setErrors(e => { const n = {...e}; delete n[field]; return n; }); }

  function validateStep1() {
    const errs = {};
    if (!pickup)  errs['pickup-location']  = 'Please select a pickup location.';
    else if (!ALLOWED_COUNTRIES.includes(pickup.country))  errs['pickup-location']  = 'Transfers available within Switzerland, France and Italy only.';
    if (!dropoff) errs['dropoff-location'] = 'Please select a drop-off location.';
    else if (!ALLOWED_COUNTRIES.includes(dropoff.country)) errs['dropoff-location'] = 'Transfers available within Switzerland, France and Italy only.';
    if (!pickupDate) errs['pickup-date'] = 'Please select a pickup date.';
    if (!pickupTime) errs['pickup-time'] = 'Please select a pickup time.';
    if (isRound) {
      if (!returnDate) errs['return-date'] = 'Please select a return date.';
      else if (returnDate < pickupDate) errs['return-date'] = 'Return date must be on or after pickup date.';
      if (!returnTime) errs['return-time'] = 'Please select a return time.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }
  function validateStep2() {
    if (!vehicle) { setErrors({ vehicle: 'Please select a vehicle to continue.' }); return false; }
    setErrors({});
    return true;
  }
  function validateStep3() {
    const errs = {};
    if (!name || name.length < 2) errs['full-name'] = 'Please enter your full name.';
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs['email'] = 'Please enter a valid email address.';
    if (!phone || !/^\+?[\d\s\-().]{7,20}$/.test(phone)) errs['phone'] = 'Please enter a valid phone number.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function goToStep(target) {
    if (target > step) {
      if (step === 1 && !validateStep1()) return;
      if (step === 2 && !validateStep2()) return;
    }
    setStep(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function submit(e) {
    e.preventDefault();
    if (!validateStep3()) return;
    setSubmitting(true);

    setTimeout(() => {
      const ref  = generateRef();
      const fare = estimatedDist ? calculateFare(vehicle, estimatedDist, isRound) : null;

      const booking = {
        id: ref, name, email, phone, tripType,
        pickup: pickup?.name, pickupSub: pickup?.sub, pickupCountry: pickup?.country,
        dropoff: dropoff?.name, dropoffSub: dropoff?.sub, dropoffCountry: dropoff?.country,
        date: pickupDate, time: pickupTime,
        returnDate: returnDate || '', returnTime: returnTime || '',
        vehicleId: vehicle, vehicle: resolveVehicleName(vehicle),
        estimatedDistance: estimatedDist || null, estimatedFare: fare,
        status:'pending', payment:'unpaid', notes, source:'website', createdAt: Date.now(),
      };

      const bookings = JSON.parse(localStorage.getItem('se_bookings') || '[]');
      bookings.unshift(booking);
      localStorage.setItem('se_bookings', JSON.stringify(bookings));

      const customers = JSON.parse(localStorage.getItem('se_customers') || '[]');
      const ci = customers.findIndex(c => c.email === email);
      if (ci >= 0) { customers[ci].bookings = (customers[ci].bookings||0)+1; customers[ci].lastBooking = pickupDate; customers[ci].phone = phone; }
      else customers.unshift({ id:'C-'+Date.now(), name, email, phone, bookings:1, lastBooking: pickupDate, createdAt: Date.now() });
      localStorage.setItem('se_customers', JSON.stringify(customers));
      localStorage.setItem('se_frontend_sync', JSON.stringify({ key:'se_bookings', ts: Date.now() }));

      fetch('/api/send-email', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ ref, name, email, phone, tripType,
          pickup: pickup?.name, dropoff: dropoff?.name,
          date: pickupDate, time: pickupTime, returnDate, returnTime,
          vehicle: resolveVehicleName(vehicle), estimatedDistance: estimatedDist, estimatedFare: fare, notes }),
      }).catch(err => console.error('[Email]', err));

      setBookingRef(ref);
      setSubmitting(false);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1200);
  }

  const staticVehicles = [
    { id:'tesla-model-y',    name:'Tesla Model Y',    image:'/assets/tesla-model-y.jpg',    category:'Executive Electric SUV', passengers:4, luggage:3, badge:'Electric', badgeType:'green',  features:['Zero Emissions','Premium Interior','Autopilot'] },
    { id:'mercedes-s-class', name:'Mercedes S-Class', image:'/assets/mercedes-s-class.jpg', category:'Ultra-Luxury Sedan',     passengers:3, luggage:2, badge:'Flagship', badgeType:'gold',   features:['Maybach-Level Comfort','Massage Seats','Executive Class'] },
    { id:'mercedes-v-class', name:'Mercedes V-Class', image:'/assets/mercedes-v-class.jpg', category:'Luxury MPV',             passengers:7, luggage:6, badge:'Group',    badgeType:'silver', features:['Spacious Interior','Business Conference','Group Transfers'] },
  ];
  const displayVehicles = vehicles.length ? vehicles : staticVehicles;

  function stepClass(s) {
    if (s < step) return 'step-item completed';
    if (s === step) return 'step-item active';
    return 'step-item';
  }

  if (submitted) return <SuccessScreen ref_={bookingRef} />;

  return (
    <div className="booking-page">
      <div className="booking-container">

        {/* Brand */}
        <div className="brand-header">
          <div className="brand-logo">◆ SWISS <span>ELITE</span></div>
          <div className="brand-tagline">Luxury Chauffeur Transfers</div>
        </div>

        {/* Progress — outside the card */}
        <div className="progress-steps">
          <div className={stepClass(1)} onClick={() => step > 1 && goToStep(1)}>
            <div className="step-circle"><span>{step > 1 ? '✓' : '1'}</span></div>
            <div className="step-lbl">{formSettings.title1 || 'Ride Details'}</div>
          </div>
          <div className={`step-line ${step >= 2 ? 'done' : ''}`}/>
          <div className={stepClass(2)} onClick={() => step > 2 && goToStep(2)}>
            <div className="step-circle"><span>{step > 2 ? '✓' : '2'}</span></div>
            <div className="step-lbl">{formSettings.title2 || 'Choose Vehicle'}</div>
          </div>
          <div className={`step-line ${step >= 3 ? 'done' : ''}`}/>
          <div className={stepClass(3)}>
            <div className="step-circle"><span>3</span></div>
            <div className="step-lbl">{formSettings.title3 || 'Place Order'}</div>
          </div>
        </div>

        {/* Form card */}
        <div className="form-card">

          {/* ── STEP 1 ── */}
          {step === 1 && (
            <div className="form-step">
              <div className="step-header">
                <h2 className="step-title">{formSettings.title1 || 'Ride Details'}</h2>
                <p className="step-desc">Configure your transfer preferences</p>
              </div>

              {/* Trip Type */}
              <div className="field-section">
                <div className="section-label">TRIP TYPE</div>
                <div className="trip-grid">
                  {[
                    ['one-way',    'One Way',    '→', 'Single destination transfer'],
                    ['round-trip', 'Round Trip', '⇄', 'Return journey included'],
                  ].map(([val, label, icon, desc]) => (
                    <button key={val} type="button" className={`trip-btn ${tripType === val ? 'active' : ''}`}
                      onClick={() => { setTripType(val); if (val !== 'round-trip') { setReturnDate(''); setReturnTime(''); } }}>
                      <span className="trip-btn-icon">{icon}</span>
                      <span className="trip-btn-title">{label}</span>
                      <span className="trip-btn-desc">{desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Locations */}
              <div className="field-row">
                <div className="field">
                  <label className="field-label" htmlFor="pickup-location">
                    <span className="loc-dot loc-dot-a"/>Pickup Location
                  </label>
                  <LocationAutocomplete id="pickup-location" placeholder="City, airport or address…" selected={pickup}
                    onSelect={v => { setPickup(v); clearErr('pickup-location'); }}
                    onClear={() => setPickup(null)} error={errors['pickup-location']}/>
                  {errors['pickup-location'] && <p className="field-error">{errors['pickup-location']}</p>}
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="dropoff-location">
                    <span className="loc-dot loc-dot-b"/>Drop-off Location
                  </label>
                  <LocationAutocomplete id="dropoff-location" placeholder="City, airport or address…" selected={dropoff}
                    onSelect={v => { setDropoff(v); clearErr('dropoff-location'); }}
                    onClear={() => setDropoff(null)} error={errors['dropoff-location']}/>
                  {errors['dropoff-location'] && <p className="field-error">{errors['dropoff-location']}</p>}
                </div>
              </div>

              {/* Route card */}
              {routeInfo && (
                <div className="route-card">
                  <div className="route-col">
                    <span className="route-col-label">EST. DISTANCE</span>
                    <span className="route-col-val">~{routeInfo.dist} km</span>
                  </div>
                  <div className="route-divider"/>
                  <div className="route-col">
                    <span className="route-col-label">EST. DURATION</span>
                    <span className="route-col-val">~{routeInfo.timeStr}</span>
                  </div>
                  <div className="route-divider"/>
                  <div className="route-col">
                    <span className="route-col-label">TRANSFER TYPE</span>
                    <span className="route-col-val gold">{routeInfo.type}</span>
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="field-row">
                <div className="field">
                  <label className="field-label" htmlFor="pickup-date">Pickup Date</label>
                  <input className={`input ${errors['pickup-date'] ? 'error' : ''}`} type="date" id="pickup-date"
                    value={pickupDate} min={TODAY} onChange={e => { setPickupDate(e.target.value); clearErr('pickup-date'); }}/>
                  {errors['pickup-date'] && <p className="field-error">{errors['pickup-date']}</p>}
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="pickup-time">Pickup Time</label>
                  <select className={`input ${errors['pickup-time'] ? 'error' : ''}`} id="pickup-time"
                    value={pickupTime} onChange={e => { setPickupTime(e.target.value); clearErr('pickup-time'); }}>
                    {TIME_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                  {errors['pickup-time'] && <p className="field-error">{errors['pickup-time']}</p>}
                </div>
              </div>

              {isRound && (
                <div className="field-row">
                  <div className="field">
                    <label className="field-label" htmlFor="return-date">Return Date</label>
                    <input className={`input ${errors['return-date'] ? 'error' : ''}`} type="date" id="return-date"
                      value={returnDate} min={pickupDate || TODAY} onChange={e => { setReturnDate(e.target.value); clearErr('return-date'); }}/>
                    {errors['return-date'] && <p className="field-error">{errors['return-date']}</p>}
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="return-time">Return Time</label>
                    <select className={`input ${errors['return-time'] ? 'error' : ''}`} id="return-time"
                      value={returnTime} onChange={e => { setReturnTime(e.target.value); clearErr('return-time'); }}>
                      {TIME_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    {errors['return-time'] && <p className="field-error">{errors['return-time']}</p>}
                  </div>
                </div>
              )}

              <div className="step-footer">
                <button type="button" className="btn-next" onClick={() => goToStep(2)}>
                  {formSettings.btn1Text || 'Continue to Vehicles'} →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2 ── */}
          {step === 2 && (
            <div className="form-step">
              <div className="step-header">
                <h2 className="step-title">{formSettings.title2 || 'Choose Your Vehicle'}</h2>
                <p className="step-desc">Select your preferred vehicle for this transfer</p>
              </div>
              <div className="vehicles-grid">
                {displayVehicles.map(v => {
                  const fare = estimatedDist ? calculateFare(v.id, estimatedDist, isRound) : null;
                  return (
                    <div key={v.id} className={`vehicle-card ${vehicle === v.id ? 'selected' : ''}`}
                      role="radio" aria-checked={vehicle === v.id} tabIndex={0}
                      onClick={() => { setVehicle(v.id); clearErr('vehicle'); }}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setVehicle(v.id); clearErr('vehicle'); } }}>
                      <div className={`v-badge ${v.badgeType === 'gold' ? 'v-badge-gold' : v.badgeType === 'silver' ? 'v-badge-silver' : ''}`}>{v.badge}</div>
                      <div className="v-img-wrap">
                        <img src={v.image} alt={v.name} className="v-img"
                          onError={e => { e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23111'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23C8A45D' font-size='14' font-family='sans-serif'%3E${v.name}%3C/text%3E%3C/svg%3E`; }}/>
                      </div>
                      <div className="v-info">
                        <h3 className="v-name">{v.name}</h3>
                        <p className="v-category">{v.category}</p>
                        <div className="v-specs">
                          <span className="v-spec">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="13" height="13"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                            {v.passengers} Passengers
                          </span>
                          <span className="v-spec">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="13" height="13"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                            {v.luggage} Luggage
                          </span>
                        </div>
                        <ul className="v-features">
                          {(v.features||[]).map((f, i) => <li key={i}>{f}</li>)}
                        </ul>
                      </div>
                      {fare !== null && (
                        <div className="v-fare">
                          <div className="v-fare-meta">
                            <span className="v-fare-type">{isRound ? 'Round Trip' : 'One Way'}</span>
                            <span className="v-fare-dist">~{estimatedDist} km</span>
                          </div>
                          <span className="v-fare-val">CHF {fare.toLocaleString()}</span>
                        </div>
                      )}
                      {vehicle === v.id && (
                        <div className="v-selected-bar">✓ Selected</div>
                      )}
                    </div>
                  );
                })}
              </div>
              {errors.vehicle && <p className="field-error" style={{textAlign:'center',marginTop:'1rem'}}>{errors.vehicle}</p>}
              <div className="step-footer step-footer-split">
                <button type="button" className="btn-back" onClick={() => goToStep(1)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                  Back
                </button>
                <button type="button" className="btn-next" onClick={() => goToStep(3)}>
                  {formSettings.btn2Text || 'Continue to Order'} →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3 ── */}
          {step === 3 && (
            <div className="form-step">
              <div className="step-header">
                <h2 className="step-title">{formSettings.title3 || 'Place Your Order'}</h2>
                <p className="step-desc">Enter your contact details to confirm the booking</p>
              </div>

              <div className="order-summary">
                <div className="order-summary-title">Booking Summary</div>
                <div className="order-summary-grid">
                  <div className="os-item"><span className="os-label">Route</span><span className="os-val">{pickup && dropoff ? `${pickup.name} → ${dropoff.name}` : '—'}</span></div>
                  <div className="os-item"><span className="os-label">Date & Time</span><span className="os-val">{pickupDate ? new Date(pickupDate+'T00:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : '—'} {pickupTime && '· '+pickupTime}</span></div>
                  <div className="os-item"><span className="os-label">Vehicle</span><span className="os-val">{vehicle ? resolveVehicleName(vehicle) : '—'}</span></div>
                  <div className="os-item"><span className="os-label">Trip Type</span><span className="os-val">{isRound ? 'Round Trip' : 'One Way'}</span></div>
                </div>
              </div>

              <form onSubmit={submit} noValidate>
                <div className="field-row">
                  <div className="field">
                    <label className="field-label" htmlFor="full-name">Full Name</label>
                    <input className={`input ${errors['full-name'] ? 'error' : ''}`} id="full-name" type="text" placeholder="John Smith"
                      value={name} onChange={e => { setName(e.target.value); clearErr('full-name'); }} autoComplete="name"/>
                    {errors['full-name'] && <p className="field-error">{errors['full-name']}</p>}
                  </div>
                  <div className="field">
                    <label className="field-label" htmlFor="email">Email Address</label>
                    <input className={`input ${errors.email ? 'error' : ''}`} id="email" type="email" placeholder="john@example.com"
                      value={email} onChange={e => { setEmail(e.target.value); clearErr('email'); }} autoComplete="email"/>
                    {errors.email && <p className="field-error">{errors.email}</p>}
                  </div>
                </div>
                <div className="field" style={{marginBottom:'1.25rem'}}>
                  <label className="field-label" htmlFor="phone">Phone Number</label>
                  <input className={`input ${errors.phone ? 'error' : ''}`} id="phone" type="tel" placeholder="+41 79 000 0000"
                    value={phone} onChange={e => { setPhone(e.target.value); clearErr('phone'); }} autoComplete="tel"/>
                  {errors.phone && <p className="field-error">{errors.phone}</p>}
                </div>
                <div className="field" style={{marginBottom:'2rem'}}>
                  <label className="field-label" htmlFor="special-requests">Special Requests <span style={{color:'var(--text-muted)',fontWeight:400}}>(optional)</span></label>
                  <textarea className="input textarea" id="special-requests" rows={3} placeholder="Any special requirements, flight number, etc."
                    value={notes} onChange={e => setNotes(e.target.value)}/>
                </div>
                <div className="step-footer step-footer-split">
                  <button type="button" className="btn-back" onClick={() => goToStep(2)}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                    Back
                  </button>
                  <button type="submit" className="btn-next" disabled={submitting}>
                    {submitting ? (
                      <><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" style={{animation:'spin .8s linear infinite'}}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Processing...</>
                    ) : (
                      <>{formSettings.btnSubmitText || 'Book Your Transfer'} →</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Success Screen ───────────────────────────────────────────── */
function SuccessScreen({ ref_ }) {
  return (
    <div className="booking-page">
      <div className="booking-container">
        <div className="brand-header">
          <div className="brand-logo">◆ SWISS <span>ELITE</span></div>
          <div className="brand-tagline">Luxury Chauffeur Transfers</div>
        </div>
        <div className="form-card">
          <div className="form-step" style={{textAlign:'center',padding:'2rem 0'}}>
            <div style={{width:72,height:72,borderRadius:'50%',background:'rgba(74,222,128,0.12)',border:'1.5px solid rgba(74,222,128,0.35)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1.5rem',fontSize:'2rem'}}>✓</div>
            <h2 style={{fontSize:'1.5rem',fontWeight:700,color:'var(--text)',marginBottom:'.75rem'}}>Booking Confirmed!</h2>
            <p style={{fontSize:'.9rem',color:'var(--text-muted)',maxWidth:400,margin:'0 auto 1.5rem',lineHeight:1.7}}>Your luxury transfer has been reserved. A confirmation email has been sent to your inbox.</p>
            <div style={{display:'inline-block',background:'rgba(200,164,93,0.1)',border:'1px solid rgba(200,164,93,0.3)',borderRadius:12,padding:'1rem 2rem',marginBottom:'2rem'}}>
              <div style={{fontSize:'.72rem',letterSpacing:'.2em',textTransform:'uppercase',color:'var(--text-muted)',marginBottom:'.3rem'}}>Booking Reference</div>
              <div style={{fontSize:'1.4rem',fontWeight:700,color:'var(--gold)',letterSpacing:'.1em'}}>{ref_}</div>
            </div>
            <br/>
            <button className="btn-next" style={{display:'inline-flex'}} onClick={() => window.location.reload()}>
              Book Another Transfer →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
