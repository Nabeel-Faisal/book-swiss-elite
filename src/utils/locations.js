export const ALLOWED_COUNTRIES = ['CH', 'FR', 'IT'];
export const COUNTRY_NAMES = { CH: 'Switzerland', FR: 'France', IT: 'Italy' };

export const LOCATION_ICONS = { airport:'✈', ski:'⛷', city:'◎', address:'📍' };

export const DEMO_LOCATIONS = [
  { name:'Geneva Airport (GVA)',            sub:'Geneva, Switzerland',     country:'CH', type:'airport', lat:46.2370, lng:6.1090 },
  { name:'Zurich Airport (ZRH)',            sub:'Zurich, Switzerland',     country:'CH', type:'airport', lat:47.4502, lng:8.5617 },
  { name:'Basel Airport (BSL)',             sub:'Basel, Switzerland',      country:'CH', type:'airport', lat:47.5896, lng:7.5294 },
  { name:'Geneva',                          sub:'Switzerland',             country:'CH', type:'city',    lat:46.2044, lng:6.1432 },
  { name:'Zurich',                          sub:'Switzerland',             country:'CH', type:'city',    lat:47.3769, lng:8.5417 },
  { name:'Bern',                            sub:'Capital, Switzerland',    country:'CH', type:'city',    lat:46.9480, lng:7.4474 },
  { name:'Lausanne',                        sub:'Switzerland',             country:'CH', type:'city',    lat:46.5197, lng:6.6323 },
  { name:'Basel',                           sub:'Switzerland',             country:'CH', type:'city',    lat:47.5596, lng:7.5886 },
  { name:'Lucerne',                         sub:'Switzerland',             country:'CH', type:'city',    lat:47.0502, lng:8.3093 },
  { name:'Lugano',                          sub:'Switzerland',             country:'CH', type:'city',    lat:46.0037, lng:8.9511 },
  { name:'Montreux',                        sub:'Switzerland',             country:'CH', type:'city',    lat:46.4312, lng:6.9115 },
  { name:'Interlaken',                      sub:'Switzerland',             country:'CH', type:'city',    lat:46.6863, lng:7.8632 },
  { name:'Davos',                           sub:'Switzerland',             country:'CH', type:'city',    lat:46.8003, lng:9.8372 },
  { name:'Zermatt',                         sub:'Ski Resort, Switzerland', country:'CH', type:'ski',     lat:46.0207, lng:7.7491 },
  { name:'Verbier',                         sub:'Ski Resort, Switzerland', country:'CH', type:'ski',     lat:46.0970, lng:7.2290 },
  { name:'Gstaad',                          sub:'Ski Resort, Switzerland', country:'CH', type:'ski',     lat:46.4769, lng:7.2846 },
  { name:'St. Moritz',                      sub:'Ski Resort, Switzerland', country:'CH', type:'ski',     lat:46.4980, lng:9.8384 },
  { name:'Grindelwald',                     sub:'Ski Resort, Switzerland', country:'CH', type:'ski',     lat:46.6242, lng:8.0413 },
  { name:'Paris Charles de Gaulle (CDG)',   sub:'Paris, France',           country:'FR', type:'airport', lat:49.0097, lng:2.5479 },
  { name:'Paris Orly (ORY)',                sub:'Paris, France',           country:'FR', type:'airport', lat:48.7262, lng:2.3652 },
  { name:'Nice Airport (NCE)',              sub:'Nice, France',            country:'FR', type:'airport', lat:43.6654, lng:7.2152 },
  { name:'Lyon Airport (LYS)',              sub:'Lyon, France',            country:'FR', type:'airport', lat:45.7239, lng:5.0808 },
  { name:'Paris',                           sub:'France',                  country:'FR', type:'city',    lat:48.8566, lng:2.3522 },
  { name:'Lyon',                            sub:'France',                  country:'FR', type:'city',    lat:45.7640, lng:4.8357 },
  { name:'Nice',                            sub:'France',                  country:'FR', type:'city',    lat:43.7102, lng:7.2620 },
  { name:'Cannes',                          sub:'France',                  country:'FR', type:'city',    lat:43.5528, lng:7.0174 },
  { name:'Monaco',                          sub:'Monaco (near France)',    country:'FR', type:'city',    lat:43.7384, lng:7.4246 },
  { name:'Annecy',                          sub:'France',                  country:'FR', type:'city',    lat:45.8992, lng:6.1294 },
  { name:'Grenoble',                        sub:'France',                  country:'FR', type:'city',    lat:45.1885, lng:5.7245 },
  { name:'Courchevel',                      sub:'Ski Resort, France',      country:'FR', type:'ski',     lat:45.4146, lng:6.6354 },
  { name:'Chamonix',                        sub:'Ski Resort, France',      country:'FR', type:'ski',     lat:45.9237, lng:6.8694 },
  { name:"Val d'Isère",                     sub:'Ski Resort, France',      country:'FR', type:'ski',     lat:45.4481, lng:6.9820 },
  { name:'Méribel',                         sub:'Ski Resort, France',      country:'FR', type:'ski',     lat:45.3966, lng:6.5593 },
  { name:'Megève',                          sub:'Ski Resort, France',      country:'FR', type:'ski',     lat:45.8562, lng:6.6152 },
  { name:'Milan Malpensa Airport (MXP)',    sub:'Milan, Italy',            country:'IT', type:'airport', lat:45.6300, lng:8.7231 },
  { name:'Milan Linate Airport (LIN)',      sub:'Milan, Italy',            country:'IT', type:'airport', lat:45.4451, lng:9.2784 },
  { name:'Rome Fiumicino (FCO)',            sub:'Rome, Italy',             country:'IT', type:'airport', lat:41.8003, lng:12.2389 },
  { name:'Venice Airport (VCE)',            sub:'Venice, Italy',           country:'IT', type:'airport', lat:45.5053, lng:12.3519 },
  { name:'Bergamo Airport (BGY)',           sub:'Bergamo, Italy',          country:'IT', type:'airport', lat:45.6699, lng:9.7043 },
  { name:'Milan',                           sub:'Italy',                   country:'IT', type:'city',    lat:45.4654, lng:9.1866 },
  { name:'Rome',                            sub:'Italy',                   country:'IT', type:'city',    lat:41.9028, lng:12.4964 },
  { name:'Venice',                          sub:'Italy',                   country:'IT', type:'city',    lat:45.4408, lng:12.3155 },
  { name:'Florence',                        sub:'Italy',                   country:'IT', type:'city',    lat:43.7696, lng:11.2558 },
  { name:'Turin',                           sub:'Italy',                   country:'IT', type:'city',    lat:45.0703, lng:7.6869 },
  { name:'Verona',                          sub:'Italy',                   country:'IT', type:'city',    lat:45.4384, lng:10.9916 },
  { name:'Como',                            sub:'Italy',                   country:'IT', type:'city',    lat:45.8081, lng:9.0852 },
  { name:'Lake Como',                       sub:'Italy',                   country:'IT', type:'city',    lat:45.9666, lng:9.2730 },
  { name:'Bellagio',                        sub:'Lake Como, Italy',        country:'IT', type:'city',    lat:45.9862, lng:9.2624 },
  { name:'Bergamo',                         sub:'Italy',                   country:'IT', type:'city',    lat:45.6950, lng:9.6700 },
  { name:"Cortina d'Ampezzo",               sub:'Ski Resort, Italy',       country:'IT', type:'ski',     lat:46.5402, lng:12.1354 },
  { name:'Courmayeur',                      sub:'Ski Resort, Italy',       country:'IT', type:'ski',     lat:45.7921, lng:6.9742 },
  { name:'Madonna di Campiglio',            sub:'Ski Resort, Italy',       country:'IT', type:'ski',     lat:46.2339, lng:10.8244 },
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
