import { APPROX_ROUTES } from './locations';

function buildRouteResult(distKm, durationMin, pickupType, dropoffType) {
  const h = Math.floor(durationMin / 60), m = durationMin % 60;
  const timeStr = h > 0 ? `${h}h ${m > 0 ? m + 'm' : ''}` : `${durationMin}m`;
  const isAirport = pickupType === 'airport' || dropoffType === 'airport';
  const type = isAirport ? 'Airport Transfer' : (h >= 2 ? 'Long Distance' : 'City Transfer');
  return { dist: distKm, timeStr, type };
}

export async function estimateRoute(pickup, dropoff) {
  try {
    const params = new URLSearchParams();
    if (pickup.lat != null && pickup.lng != null) {
      params.set('olat', pickup.lat);
      params.set('olng', pickup.lng);
    } else {
      params.set('origin', [pickup.name, pickup.sub].filter(Boolean).join(', '));
    }
    if (dropoff.lat != null && dropoff.lng != null) {
      params.set('dlat', dropoff.lat);
      params.set('dlng', dropoff.lng);
    } else {
      params.set('destination', [dropoff.name, dropoff.sub].filter(Boolean).join(', '));
    }

    const resp = await fetch('/api/distance?' + params);
    if (!resp.ok) throw new Error('API error');
    const data = await resp.json();
    if (!data.ok) throw new Error(data.error);

    return buildRouteResult(data.distanceKm, data.durationMin, pickup.type, dropoff.type);
  } catch {
    return estimateRouteFallback(pickup, dropoff);
  }
}

function seededRandom(seed) {
  return (((1664525 * seed + 1013904223) >>> 0) / 2 ** 32);
}
function routeHash(a, b) {
  const s = (a + '|' + b).toLowerCase();
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
  return h;
}
function estimateRouteFallback(pickup, dropoff) {
  const key1 = `${pickup.country}-${dropoff.country}`;
  const key2 = `${dropoff.country}-${pickup.country}`;
  const route = APPROX_ROUTES[key1] || APPROX_ROUTES[key2] || { dist:[80,300], time:[70,240] };
  const seed  = routeHash(pickup.name, dropoff.name);
  const dist  = Math.floor(seededRandom(seed)     * (route.dist[1] - route.dist[0]) + route.dist[0]);
  const mins  = Math.floor(seededRandom(seed + 1) * (route.time[1] - route.time[0]) + route.time[0]);
  return buildRouteResult(dist, mins, pickup.type, dropoff.type);
}

export function calculateFare(vehicleId, distanceKm, isRoundTrip, vPricing = {}) {
  try {
    const p = vPricing[vehicleId];
    if (!p) return null;
    let fare = (parseFloat(p.basePrice) || 0) + distanceKm * (parseFloat(p.pricePerKm) || 0);
    fare = Math.max(fare, parseFloat(p.minPrice) || 0);
    if (isRoundTrip) fare *= 2;
    return Math.round(fare);
  } catch(e) { return null; }
}

export function generateRef() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return 'SE-' + Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function resolveVehicleName(vehicleId, vehicles = []) {
  const staticNames = {
    'tesla-model-y':'Tesla Model Y', 'mercedes-s-class':'Mercedes S-Class', 'mercedes-v-class':'Mercedes V-Class',
  };
  const match = vehicles.find(v => v.id === vehicleId);
  if (match) return match.name;
  return staticNames[vehicleId] || vehicleId;
}
