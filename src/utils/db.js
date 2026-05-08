export const KEYS = {
  vehicles:       'se_vehicles',
  bookings:       'se_bookings',
  customers:      'se_customers',
  settings:       'se_settings',
  formSettings:   'se_form_settings',
  admins:         'se_admins',
  areas:          'se_service_areas',
  pricing:        'se_pricing',
  vehiclePricing: 'se_vehicle_pricing',
  auth:           'se_auth',
  dataVersion:    'se_data_version',
};

const DATA_VERSION = '4';

export const DB = {
  get:  (k)    => { try { return JSON.parse(localStorage.getItem(k)); } catch(e) { return null; } },
  set:  (k, v) => { localStorage.setItem(k, JSON.stringify(v)); syncFrontend(k); },
  del:  (k)    => localStorage.removeItem(k),

  getVehicles:      () => DB.get(KEYS.vehicles)       || [],
  getBookings:      () => DB.get(KEYS.bookings)       || [],
  getCustomers:     () => DB.get(KEYS.customers)      || [],
  getAdmins:        () => DB.get(KEYS.admins)         || [],
  getAreas:         () => DB.get(KEYS.areas)          || [],
  getFormSettings:  () => DB.get(KEYS.formSettings)   || {},
  getSettings:      () => DB.get(KEYS.settings)       || {},
  getPricing:       () => DB.get(KEYS.pricing)        || {},
  getVehiclePricing:() => DB.get(KEYS.vehiclePricing) || {},
};

function syncFrontend(key) {
  if ([KEYS.vehicles, KEYS.formSettings, KEYS.areas, KEYS.vehiclePricing].includes(key)) {
    localStorage.setItem('se_frontend_sync', JSON.stringify({ key, ts: Date.now() }));
  }
}

export function initData() {
  if (localStorage.getItem(KEYS.dataVersion) !== DATA_VERSION) {
    localStorage.removeItem(KEYS.bookings);
    localStorage.removeItem(KEYS.customers);
    localStorage.setItem(KEYS.dataVersion, DATA_VERSION);
  }

  if (!localStorage.getItem(KEYS.vehicles)) {
    DB.set(KEYS.vehicles, [
      { id:'v1', name:'Tesla Model Y',    image:'/assets/tesla-model-y.jpg',    category:'Executive Electric SUV', passengers:4, luggage:3, badge:'Electric', badgeType:'green',  features:['Zero Emissions','Premium Interior','Autopilot'],           description:'Cutting-edge electric SUV.', enabled:true, order:1 },
      { id:'v2', name:'Mercedes S-Class', image:'/assets/mercedes-s-class.jpg', category:'Ultra-Luxury Sedan',     passengers:3, luggage:2, badge:'Flagship', badgeType:'gold',   features:['Massage Seats','Maybach Comfort','Executive Class'],        description:'The pinnacle of luxury travel.', enabled:true, order:2 },
      { id:'v3', name:'Mercedes V-Class', image:'/assets/mercedes-v-class.jpg', category:'Luxury MPV',             passengers:7, luggage:6, badge:'Group',    badgeType:'silver', features:['Spacious Interior','Business Conference','Group Transfers'], description:'Perfect for groups.', enabled:true, order:3 },
    ]);
  }
  if (!localStorage.getItem(KEYS.admins)) {
    DB.set(KEYS.admins, [
      { id:'A-001', name:'Admin', email:'admin@swisselite.com', role:'superadmin', lastLogin: new Date().toLocaleDateString(), status:'active' },
    ]);
  }
  if (!localStorage.getItem(KEYS.areas)) {
    DB.set(KEYS.areas, [
      { code:'CH', name:'Switzerland', flag:'🇨🇭', enabled:true, cities:'Geneva, Zurich, Basel, Bern, Lausanne, Zermatt, St. Moritz, Verbier' },
      { code:'FR', name:'France',      flag:'🇫🇷', enabled:true, cities:'Paris, Lyon, Nice, Courchevel, Chamonix, Val d\'Isère, Cannes' },
      { code:'IT', name:'Italy',       flag:'🇮🇹', enabled:true, cities:'Milan, Rome, Venice, Florence, Lake Como, Cortina d\'Ampezzo' },
    ]);
  }
  if (!localStorage.getItem(KEYS.formSettings)) {
    DB.set(KEYS.formSettings, {
      roundTripEnabled:true, vehiclesEnabled:true,
      btn1Text:'Continue to Vehicles', btn2Text:'Continue to Order', btnSubmitText:'Book Your Transfer',
      title1:'Ride Details', title2:'Choose Your Vehicle', title3:'Place Your Order',
    });
  }
  if (!localStorage.getItem(KEYS.settings)) {
    DB.set(KEYS.settings, {
      company:'Swiss Elite Chauffeur', phone:'+41 22 000 0000', email:'info@swisselitetransfers.com',
      address:'Geneva, Switzerland', website:'book.swisselitetransfers.com', currency:'CHF',
    });
  }
  if (!localStorage.getItem(KEYS.pricing)) {
    DB.set(KEYS.pricing, { currency:'CHF', min:80, perkm:2.5, airport:25, night:20, weekend:15 });
  }
  if (!localStorage.getItem(KEYS.vehiclePricing)) {
    DB.set(KEYS.vehiclePricing, {
      v1: { basePrice:80,  pricePerKm:2.0, minPrice:80  },
      v2: { basePrice:120, pricePerKm:3.0, minPrice:120 },
      v3: { basePrice:100, pricePerKm:2.5, minPrice:100 },
      'tesla-model-y':    { basePrice:80,  pricePerKm:2.0, minPrice:80  },
      'mercedes-s-class': { basePrice:120, pricePerKm:3.0, minPrice:120 },
      'mercedes-v-class': { basePrice:100, pricePerKm:2.5, minPrice:100 },
    });
  }
}
