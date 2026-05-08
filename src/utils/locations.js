export const ALLOWED_COUNTRIES = ['CH', 'FR', 'IT'];
export const COUNTRY_NAMES = { CH: 'Switzerland', FR: 'France', IT: 'Italy' };

export const LOCATION_ICONS = { airport:'✈', ski:'⛷', city:'◎', address:'📍' };

export const DEMO_LOCATIONS = [
  { name:'Geneva Airport (GVA)',            sub:'Geneva, Switzerland',   country:'CH', type:'airport' },
  { name:'Zurich Airport (ZRH)',            sub:'Zurich, Switzerland',   country:'CH', type:'airport' },
  { name:'Basel Airport (BSL)',             sub:'Basel, Switzerland',    country:'CH', type:'airport' },
  { name:'Geneva',                          sub:'Switzerland',           country:'CH', type:'city' },
  { name:'Zurich',                          sub:'Switzerland',           country:'CH', type:'city' },
  { name:'Bern',                            sub:'Capital, Switzerland',  country:'CH', type:'city' },
  { name:'Lausanne',                        sub:'Switzerland',           country:'CH', type:'city' },
  { name:'Basel',                           sub:'Switzerland',           country:'CH', type:'city' },
  { name:'Lucerne',                         sub:'Switzerland',           country:'CH', type:'city' },
  { name:'Lugano',                          sub:'Switzerland',           country:'CH', type:'city' },
  { name:'Montreux',                        sub:'Switzerland',           country:'CH', type:'city' },
  { name:'Interlaken',                      sub:'Switzerland',           country:'CH', type:'city' },
  { name:'Davos',                           sub:'Switzerland',           country:'CH', type:'city' },
  { name:'Zermatt',                         sub:'Ski Resort, Switzerland', country:'CH', type:'ski' },
  { name:'Verbier',                         sub:'Ski Resort, Switzerland', country:'CH', type:'ski' },
  { name:'Gstaad',                          sub:'Ski Resort, Switzerland', country:'CH', type:'ski' },
  { name:'St. Moritz',                      sub:'Ski Resort, Switzerland', country:'CH', type:'ski' },
  { name:'Grindelwald',                     sub:'Ski Resort, Switzerland', country:'CH', type:'ski' },
  { name:'Paris Charles de Gaulle (CDG)',   sub:'Paris, France',         country:'FR', type:'airport' },
  { name:'Paris Orly (ORY)',                sub:'Paris, France',         country:'FR', type:'airport' },
  { name:'Nice Airport (NCE)',              sub:'Nice, France',          country:'FR', type:'airport' },
  { name:'Lyon Airport (LYS)',              sub:'Lyon, France',          country:'FR', type:'airport' },
  { name:'Paris',                           sub:'France',                country:'FR', type:'city' },
  { name:'Lyon',                            sub:'France',                country:'FR', type:'city' },
  { name:'Nice',                            sub:'France',                country:'FR', type:'city' },
  { name:'Cannes',                          sub:'France',                country:'FR', type:'city' },
  { name:'Monaco',                          sub:'Monaco (near France)',  country:'FR', type:'city' },
  { name:'Annecy',                          sub:'France',                country:'FR', type:'city' },
  { name:'Grenoble',                        sub:'France',                country:'FR', type:'city' },
  { name:'Courchevel',                      sub:'Ski Resort, France',    country:'FR', type:'ski' },
  { name:'Chamonix',                        sub:'Ski Resort, France',    country:'FR', type:'ski' },
  { name:"Val d'Isère",                     sub:'Ski Resort, France',    country:'FR', type:'ski' },
  { name:'Méribel',                         sub:'Ski Resort, France',    country:'FR', type:'ski' },
  { name:'Megève',                          sub:'Ski Resort, France',    country:'FR', type:'ski' },
  { name:'Milan Malpensa Airport (MXP)',    sub:'Milan, Italy',          country:'IT', type:'airport' },
  { name:'Milan Linate Airport (LIN)',      sub:'Milan, Italy',          country:'IT', type:'airport' },
  { name:'Rome Fiumicino (FCO)',            sub:'Rome, Italy',           country:'IT', type:'airport' },
  { name:'Venice Airport (VCE)',            sub:'Venice, Italy',         country:'IT', type:'airport' },
  { name:'Bergamo Airport (BGY)',           sub:'Bergamo, Italy',        country:'IT', type:'airport' },
  { name:'Milan',                           sub:'Italy',                 country:'IT', type:'city' },
  { name:'Rome',                            sub:'Italy',                 country:'IT', type:'city' },
  { name:'Venice',                          sub:'Italy',                 country:'IT', type:'city' },
  { name:'Florence',                        sub:'Italy',                 country:'IT', type:'city' },
  { name:'Turin',                           sub:'Italy',                 country:'IT', type:'city' },
  { name:'Verona',                          sub:'Italy',                 country:'IT', type:'city' },
  { name:'Como',                            sub:'Italy',                 country:'IT', type:'city' },
  { name:'Lake Como',                       sub:'Italy',                 country:'IT', type:'city' },
  { name:'Bellagio',                        sub:'Lake Como, Italy',      country:'IT', type:'city' },
  { name:'Bergamo',                         sub:'Italy',                 country:'IT', type:'city' },
  { name:"Cortina d'Ampezzo",               sub:'Ski Resort, Italy',     country:'IT', type:'ski' },
  { name:'Courmayeur',                      sub:'Ski Resort, Italy',     country:'IT', type:'ski' },
  { name:'Madonna di Campiglio',            sub:'Ski Resort, Italy',     country:'IT', type:'ski' },
];

export function detectCountryFromText(text) {
  const t = text.toLowerCase();
  if (/\b(switzerland|schweiz|suisse|svizzera)\b/.test(t)) return 'CH';
  if (/\b(france|francia|frankreich)\b/.test(t)) return 'FR';
  if (/\b(italy|italia|italien)\b/.test(t)) return 'IT';
  if (/\b(zurich|zürich|geneva|genève|geneve|lausanne|bern|basel|lugano|lucerne|luzern|interlaken|montreux|zermatt|verbier|gstaad|davos|grindelwald|st\.?\s*moritz|locarno|sion|thun|winterthur|schaffhausen|fribourg|neuchâtel|chur|aarau|st\.?\s*gallen|engelberg)\b/.test(t)) return 'CH';
  if (/\b(paris|lyon|nice|cannes|monaco|annecy|grenoble|marseille|bordeaux|toulouse|strasbourg|courchevel|chamonix|val\s*d'is[eè]re|méribel|meribel|meg[eè]ve|avenue|boulevard|rue\s+|champs.él[yy]s[eé]es)\b/.test(t)) return 'FR';
  if (/\b(7[5-9]\d{3}|[0-6]\d{4})\b/.test(t)) return 'FR';
  if (/\b(rome|roma|milan|milano|venice|venezia|florence|firenze|turin|torino|verona|bergamo|como|bellagio|cortina|courmayeur|naples|napoli|bologna|via\s+|piazza\s+|corso\s+|viale\s+|vicolo)\b/.test(t)) return 'IT';
  return null;
}

export const APPROX_ROUTES = {
  'CH-CH': { dist:[50,180],  time:[45,150] },
  'CH-FR': { dist:[100,450], time:[90,350] },
  'CH-IT': { dist:[80,380],  time:[80,300] },
  'FR-FR': { dist:[60,400],  time:[55,320] },
  'FR-IT': { dist:[150,500], time:[130,400] },
  'IT-IT': { dist:[40,600],  time:[40,480] },
};
