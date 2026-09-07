// TerraByte - guess the mystery country on a pixelated 3D globe.
// Country boundaries: Natural Earth 50m via world-atlas (data/countries-50m.json).

// ============================================================
// Country metadata
// ============================================================

// Rendered on the globe but not guessable (uninhabited or disputed specks)
const TB_RENDER_ONLY = [
    'Antarctica', 'Ashmore and Cartier Is.', 'Br. Indian Ocean Ter.',
    'Fr. S. Antarctic Lands', 'Heard I. and McDonald Is.', 'Indian Ocean Ter.',
    'S. Geo. and the Is.', 'Siachen Glacier'
];

// Guessable, but never the daily/practice answer (territories & dependencies)
const TB_TERRITORIES = [
    'American Samoa', 'Anguilla', 'Aruba', 'Bermuda', 'British Virgin Is.',
    'Cayman Is.', 'Cook Is.', 'Curaçao', 'Faeroe Is.', 'Falkland Is.',
    'Fr. Polynesia', 'Greenland', 'Guam', 'Guernsey', 'Hong Kong',
    'Isle of Man', 'Jersey', 'Macao', 'Montserrat', 'N. Cyprus',
    'N. Mariana Is.', 'New Caledonia', 'Niue', 'Norfolk Island',
    'Pitcairn Is.', 'Puerto Rico', 'Saint Helena', 'Sint Maarten',
    'Somaliland', 'St-Barthélemy', 'St-Martin', 'St. Pierre and Miquelon',
    'Turks and Caicos Is.', 'U.S. Virgin Is.', 'W. Sahara',
    'Wallis and Futuna Is.', 'Åland'
];

// Dataset name -> friendlier display name
const TB_DISPLAY_NAMES = {
    'Antigua and Barb.': 'Antigua and Barbuda',
    'Bosnia and Herz.': 'Bosnia and Herzegovina',
    'British Virgin Is.': 'British Virgin Islands',
    'Cayman Is.': 'Cayman Islands',
    'Central African Rep.': 'Central African Republic',
    'Congo': 'Republic of the Congo',
    'Cook Is.': 'Cook Islands',
    "Côte d'Ivoire": 'Ivory Coast',
    'Dem. Rep. Congo': 'DR Congo',
    'Dominican Rep.': 'Dominican Republic',
    'Eq. Guinea': 'Equatorial Guinea',
    'Faeroe Is.': 'Faroe Islands',
    'Falkland Is.': 'Falkland Islands',
    'Fr. Polynesia': 'French Polynesia',
    'Macedonia': 'North Macedonia',
    'Marshall Is.': 'Marshall Islands',
    'N. Cyprus': 'Northern Cyprus',
    'N. Mariana Is.': 'Northern Mariana Islands',
    'Pitcairn Is.': 'Pitcairn Islands',
    'S. Sudan': 'South Sudan',
    'Solomon Is.': 'Solomon Islands',
    'St-Barthélemy': 'Saint Barthelemy',
    'St-Martin': 'Saint Martin',
    'St. Kitts and Nevis': 'Saint Kitts and Nevis',
    'St. Pierre and Miquelon': 'Saint Pierre and Miquelon',
    'St. Vin. and Gren.': 'Saint Vincent and the Grenadines',
    'São Tomé and Principe': 'Sao Tome and Principe',
    'Turks and Caicos Is.': 'Turks and Caicos Islands',
    'U.S. Virgin Is.': 'US Virgin Islands',
    'United States of America': 'United States',
    'Vatican': 'Vatican City',
    'W. Sahara': 'Western Sahara',
    'Wallis and Futuna Is.': 'Wallis and Futuna',
    'eSwatini': 'Eswatini',
    'Åland': 'Aland Islands'
};

// Normalized alias -> dataset name (common alternative names people type)
const TB_ALIASES = {
    'usa': 'United States of America',
    'us': 'United States of America',
    'america': 'United States of America',
    'uk': 'United Kingdom',
    'britain': 'United Kingdom',
    'greatbritain': 'United Kingdom',
    'england': 'United Kingdom',
    'scotland': 'United Kingdom',
    'wales': 'United Kingdom',
    'uae': 'United Arab Emirates',
    'emirates': 'United Arab Emirates',
    'drc': 'Dem. Rep. Congo',
    'democraticrepublicofthecongo': 'Dem. Rep. Congo',
    'democraticrepublicofcongo': 'Dem. Rep. Congo',
    'congokinshasa': 'Dem. Rep. Congo',
    'zaire': 'Dem. Rep. Congo',
    'congobrazzaville': 'Congo',
    'republicofcongo': 'Congo',
    'cotedivoire': "Côte d'Ivoire",
    'burma': 'Myanmar',
    'czechrepublic': 'Czechia',
    'holland': 'Netherlands',
    'swaziland': 'eSwatini',
    'easttimor': 'Timor-Leste',
    'capeverde': 'Cabo Verde',
    'vatican': 'Vatican',
    'holysee': 'Vatican',
    'rok': 'South Korea',
    'republicofkorea': 'South Korea',
    'dprk': 'North Korea',
    'turkiye': 'Turkey',
    'fsm': 'Micronesia',
    'federatedstatesofmicronesia': 'Micronesia',
    'bosnia': 'Bosnia and Herz.',
    'bruneidarussalam': 'Brunei',
    'lao': 'Laos',
    'laopdr': 'Laos',
    'russianfederation': 'Russia',
    'thegambia': 'Gambia',
    'thebahamas': 'Bahamas',
    'nz': 'New Zealand',
    'palestinianterritories': 'Palestine',
    'westbank': 'Palestine',
    'gaza': 'Palestine',
    'chinesetaipei': 'Taiwan',
    'macau': 'Macao',
    'antigua': 'Antigua and Barb.',
    'trinidad': 'Trinidad and Tobago',
    'stkitts': 'St. Kitts and Nevis',
    'stvincent': 'St. Vin. and Gren.',
    'saudi': 'Saudi Arabia',
    'tahiti': 'Fr. Polynesia',
    'turksandcaicos': 'Turks and Caicos Is.',
    'malvinas': 'Falkland Is.',
    'papua': 'Papua New Guinea'
};

// ============================================================
// Tuning constants
// ============================================================

const TB_TEX_W = 512;             // texture width (low = chunkier pixels)
const TB_TEX_H = 256;
const TB_MAX_DIST_KM = 15000;     // distance mapped to the coldest color
const TB_SAMPLE_BUDGET = 350;     // max border points sampled per country
const TB_EPOCH = '2026-09-07T00:00:00'; // puzzle #1

const TB_COLORS = {
    ocean: '#31a2e2',
    land: '#e8d8a8',
    ice: '#e6ece9',
    border: 'rgba(80, 52, 30, 0.75)',
    guessedBorder: 'rgba(66, 25, 10, 0.9)',
    found: '#2ecc71',
    heatStops: [
        [0.00, [255, 247, 217]],  // freezing (very far)
        [0.25, [255, 224, 138]],
        [0.45, [255, 179, 92]],
        [0.65, [249, 124, 60]],
        [0.82, [224, 67, 43]],
        [1.00, [143, 14, 14]]     // blazing (borders the target)
    ]
};

// Muted atlas colors for unguessed countries (political-map style).
// Cool/earthy tones only, so the warm heat colors of guesses stand out.
const TB_POLITICAL_PALETTE = [
    '#a5cd85',  // light green
    '#7cbd93',  // medium green
    '#cfc98a',  // olive khaki
    '#8ec9b6',  // seafoam
    '#dbc994',  // warm sand
    '#74b3a5',  // muted teal
    '#b7d693'   // pale lime
];

// ============================================================
// Small helpers
// ============================================================

function tbNormalizeName(str) {
    return String(str)
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]/g, '')
        .replace(/saint/g, 'st');
}

function tbHashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

function tbSeededRandom(seed) {
    // mulberry32 - same generator the other daily games use
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

function tbHaversineKm(a, b) {
    const R = 6371;
    const toRad = Math.PI / 180;
    const dLat = (b[1] - a[1]) * toRad;
    const dLon = (b[0] - a[0]) * toRad;
    const s = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(a[1] * toRad) * Math.cos(b[1] * toRad) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

function tbHeatColor(distanceKm) {
    const t = 1 - Math.min(distanceKm, TB_MAX_DIST_KM) / TB_MAX_DIST_KM;
    const stops = TB_COLORS.heatStops;
    for (let i = 1; i < stops.length; i++) {
        if (t <= stops[i][0]) {
            const [t0, c0] = stops[i - 1];
            const [t1, c1] = stops[i];
            const f = t1 === t0 ? 0 : (t - t0) / (t1 - t0);
            const r = Math.round(c0[0] + (c1[0] - c0[0]) * f);
            const g = Math.round(c0[1] + (c1[1] - c0[1]) * f);
            const b = Math.round(c0[2] + (c1[2] - c0[2]) * f);
            return `rgb(${r}, ${g}, ${b})`;
        }
    }
    const last = stops[stops.length - 1][1];
    return `rgb(${last[0]}, ${last[1]}, ${last[2]})`;
}

function tbIsDarkColor(cssColor) {
    const m = cssColor.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
    if (!m) return false;
    const lum = 0.299 * m[1] + 0.587 * m[2] + 0.114 * m[3];
    return lum < 140;
}

// ============================================================
// World model: decodes the TopoJSON and answers geography questions
// ============================================================

class TerraByteWorld {
    constructor(topology) {
        this.countries = new Map();     // dataset name -> country record
        this.lookup = new Map();        // normalized name/alias -> dataset name
        this.guessableNames = [];       // display names for autocomplete
        this.answerPool = [];           // dataset names eligible as answers
        this.buildFromTopology(topology);
    }

    buildFromTopology(topo) {
        const scale = topo.transform.scale;
        const translate = topo.transform.translate;

        // Decode delta-encoded quantized arcs into [lon, lat] point lists
        const decodedArcs = topo.arcs.map(arc => {
            let x = 0, y = 0;
            const points = [];
            for (const [dx, dy] of arc) {
                x += dx;
                y += dy;
                points.push([x * scale[0] + translate[0], y * scale[1] + translate[1]]);
            }
            return points;
        });

        const ringFromArcs = (arcIndices) => {
            const pts = [];
            for (const idx of arcIndices) {
                let seg = idx >= 0 ? decodedArcs[idx] : decodedArcs[~idx].slice().reverse();
                if (pts.length > 0) seg = seg.slice(1); // skip duplicated join point
                for (const p of seg) pts.push(p);
            }
            return pts;
        };

        const renderOnly = new Set(TB_RENDER_ONLY);
        const territories = new Set(TB_TERRITORIES);

        for (const geom of topo.objects.countries.geometries) {
            const name = geom.properties && geom.properties.name;
            if (!name || (geom.type !== 'Polygon' && geom.type !== 'MultiPolygon')) continue;

            const polygonArcs = geom.type === 'Polygon' ? [geom.arcs] : geom.arcs;
            const polygons = [];    // list of polygons, each a list of rings
            const arcSet = new Set();

            for (const polyArcs of polygonArcs) {
                const rings = [];
                for (const ringArcs of polyArcs) {
                    rings.push(ringFromArcs(ringArcs));
                    for (const idx of ringArcs) arcSet.add(idx >= 0 ? idx : ~idx);
                }
                polygons.push(rings);
            }

            const record = {
                name: name,
                displayName: TB_DISPLAY_NAMES[name] || name,
                polygons: polygons,
                arcSet: arcSet,
                guessable: !renderOnly.has(name),
                isAnswer: !renderOnly.has(name) && !territories.has(name),
                samplePoints: [],
                centroid: [0, 0],
                tiny: false
            };

            this.computeSamplesAndCentroid(record);
            this.countries.set(name, record);
        }

        // Build lookup + pools
        for (const record of this.countries.values()) {
            if (!record.guessable) continue;
            this.lookup.set(tbNormalizeName(record.name), record.name);
            this.lookup.set(tbNormalizeName(record.displayName), record.name);
            this.guessableNames.push(record.displayName);
            if (record.isAnswer) this.answerPool.push(record.name);
        }
        for (const [alias, name] of Object.entries(TB_ALIASES)) {
            if (this.countries.has(name)) this.lookup.set(tbNormalizeName(alias), name);
        }
        this.guessableNames.sort((a, b) => a.localeCompare(b));
        this.answerPool.sort((a, b) => a.localeCompare(b)); // stable order for daily seeding

        this.assignPoliticalColors();
    }

    // Give every country an atlas color, greedily ensuring neighbors differ
    // (adjacency comes from shared TopoJSON border arcs)
    assignPoliticalColors() {
        const arcOwners = new Map();
        for (const record of this.countries.values()) {
            for (const arc of record.arcSet) {
                if (!arcOwners.has(arc)) arcOwners.set(arc, []);
                arcOwners.get(arc).push(record.name);
            }
        }

        const neighbors = new Map();
        for (const name of this.countries.keys()) neighbors.set(name, new Set());
        for (const owners of arcOwners.values()) {
            for (let i = 0; i < owners.length; i++) {
                for (let j = i + 1; j < owners.length; j++) {
                    neighbors.get(owners[i]).add(owners[j]);
                    neighbors.get(owners[j]).add(owners[i]);
                }
            }
        }

        // Color high-degree countries first; name tiebreak keeps it deterministic
        const order = [...this.countries.keys()].sort((a, b) =>
            (neighbors.get(b).size - neighbors.get(a).size) || a.localeCompare(b));

        for (const name of order) {
            const record = this.countries.get(name);
            const used = new Set();
            for (const neighborName of neighbors.get(name)) {
                const neighbor = this.countries.get(neighborName);
                if (neighbor.colorIndex !== undefined) used.add(neighbor.colorIndex);
            }
            // Start from a name-hashed offset so islands vary instead of all
            // taking the first palette color
            const start = Math.abs(tbHashCode(name)) % TB_POLITICAL_PALETTE.length;
            record.colorIndex = start;
            for (let k = 0; k < TB_POLITICAL_PALETTE.length; k++) {
                const idx = (start + k) % TB_POLITICAL_PALETTE.length;
                if (!used.has(idx)) {
                    record.colorIndex = idx;
                    break;
                }
            }
        }
    }

    computeSamplesAndCentroid(record) {
        let totalPoints = 0;
        let biggestRing = null;
        let biggestSpan = -1;
        let minLon = 180, maxLon = -180, minLat = 90, maxLat = -90;

        for (const rings of record.polygons) {
            for (const ring of rings) {
                totalPoints += ring.length;
                let rMinLon = 180, rMaxLon = -180, rMinLat = 90, rMaxLat = -90;
                for (const [lon, lat] of ring) {
                    if (lon < rMinLon) rMinLon = lon;
                    if (lon > rMaxLon) rMaxLon = lon;
                    if (lat < rMinLat) rMinLat = lat;
                    if (lat > rMaxLat) rMaxLat = lat;
                }
                const span = (rMaxLon - rMinLon) + (rMaxLat - rMinLat);
                if (span > biggestSpan) {
                    biggestSpan = span;
                    biggestRing = ring;
                }
                if (rMinLon < minLon) minLon = rMinLon;
                if (rMaxLon > maxLon) maxLon = rMaxLon;
                if (rMinLat < minLat) minLat = rMinLat;
                if (rMaxLat > maxLat) maxLat = rMaxLat;
            }
        }

        // Sample border points evenly for distance checks
        const stride = Math.max(1, Math.floor(totalPoints / TB_SAMPLE_BUDGET));
        for (const rings of record.polygons) {
            for (const ring of rings) {
                for (let i = 0; i < ring.length; i += stride) {
                    record.samplePoints.push(ring[i]);
                }
            }
        }

        // View centroid: average of the largest ring (lands inside the main landmass)
        if (biggestRing && biggestRing.length > 0) {
            let sumLon = 0, sumLat = 0;
            for (const [lon, lat] of biggestRing) {
                sumLon += lon;
                sumLat += lat;
            }
            record.centroid = [sumLon / biggestRing.length, sumLat / biggestRing.length];
        }

        record.tiny = (maxLon - minLon) < 1.0 && (maxLat - minLat) < 1.0;
    }

    resolveGuess(input) {
        const normalized = tbNormalizeName(input);
        if (!normalized) return null;
        const name = this.lookup.get(normalized);
        return name ? this.countries.get(name) : null;
    }

    getSuggestions(input, excludeNames, limit = 8) {
        const q = tbNormalizeName(input);
        if (!q) return [];
        const prefix = [];
        const substring = [];
        for (const display of this.guessableNames) {
            const record = this.countries.get(this.lookup.get(tbNormalizeName(display)));
            if (!record || excludeNames.has(record.name)) continue;
            const norm = tbNormalizeName(display);
            if (norm.startsWith(q)) prefix.push(display);
            else if (norm.includes(q)) substring.push(display);
        }
        return prefix.concat(substring).slice(0, limit);
    }

    sharesBorder(a, b) {
        const [small, big] = a.arcSet.size < b.arcSet.size ? [a, b] : [b, a];
        for (const idx of small.arcSet) {
            if (big.arcSet.has(idx)) return true;
        }
        return false;
    }

    // Minimum distance in km between two countries' borders (0 = they touch)
    distanceBetween(a, b) {
        if (a.name === b.name) return 0;
        if (this.sharesBorder(a, b)) return 0;

        // Coarse pass over the sampled border points
        let min = Infinity;
        let bestP = null;
        let bestQ = null;
        for (const p of a.samplePoints) {
            for (const q of b.samplePoints) {
                const d = tbHaversineKm(p, q);
                if (d < min) {
                    min = d;
                    bestP = p;
                    bestQ = q;
                }
            }
        }

        // Refinement pass: exact check over full-resolution vertices near the
        // coarse closest pair (sampling alone overestimates narrow straits)
        const margin = min + 500;
        const nearA = this.collectPointsNear(a, bestQ, margin);
        const nearB = this.collectPointsNear(b, bestP, margin);
        for (const p of nearA) {
            for (const q of nearB) {
                const d = tbHaversineKm(p, q);
                if (d < min) min = d;
            }
        }
        return Math.round(min);
    }

    collectPointsNear(record, refPoint, maxKm, cap = 1200) {
        const out = [];
        for (const rings of record.polygons) {
            for (const ring of rings) {
                for (const p of ring) {
                    if (tbHaversineKm(p, refPoint) <= maxKm) out.push(p);
                }
            }
        }
        if (out.length <= cap) return out;
        const stride = Math.ceil(out.length / cap);
        return out.filter((_, i) => i % stride === 0);
    }

    countryAt(lon, lat, candidateNames) {
        for (const name of candidateNames) {
            const record = this.countries.get(name);
            if (record && this.pointInCountry(lon, lat, record)) return record;
        }
        return null;
    }

    pointInCountry(lon, lat, record) {
        let inside = false;
        for (const rings of record.polygons) {
            for (const ring of rings) {
                for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
                    const xi = ring[i][0], yi = ring[i][1];
                    const xj = ring[j][0], yj = ring[j][1];
                    if ((yi > lat) !== (yj > lat) &&
                        lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) {
                        inside = !inside;
                    }
                }
            }
        }
        return inside;
    }
}

// ============================================================
// Globe renderer: pixelated equirectangular texture on a three.js sphere
// ============================================================

class GlobeRenderer {
    constructor(container, world, onTap) {
        this.container = container;
        this.world = world;
        this.onTap = onTap;

        this.viewLat = 20;
        this.viewLon = 0;
        this.targetLat = 20;
        this.targetLon = 0;
        this.flying = false;
        this.camDist = 2.7;
        this.velocityLon = 0;
        this.velocityLat = 0;
        this.lastInteraction = 0;
        this.pointers = new Map();
        this.pinchStartDist = 0;
        this.pinchStartCam = 0;
        this.dragging = false;
        this.downInfo = null;

        this.initTexture();
        this.initThree();
        this.initControls();
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    initTexture() {
        this.texCanvas = document.createElement('canvas');
        this.texCanvas.width = TB_TEX_W;
        this.texCanvas.height = TB_TEX_H;
        this.texCtx = this.texCanvas.getContext('2d');
        this.paint(new Map());
    }

    lonLatToPx(lon, lat) {
        return [
            (lon + 180) / 360 * TB_TEX_W,
            (90 - lat) / 180 * TB_TEX_H
        ];
    }

    tracePath(ctx, record) {
        ctx.beginPath();
        for (const rings of record.polygons) {
            for (const ring of rings) {
                for (let i = 0; i < ring.length; i++) {
                    const [x, y] = this.lonLatToPx(ring[i][0], ring[i][1]);
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
            }
        }
    }

    // colorMap: dataset name -> fill color for guessed countries
    paint(colorMap) {
        const ctx = this.texCtx;
        ctx.fillStyle = TB_COLORS.ocean;
        ctx.fillRect(0, 0, TB_TEX_W, TB_TEX_H);

        ctx.lineJoin = 'round';

        for (const record of this.world.countries.values()) {
            const guessedColor = colorMap.get(record.name);
            const baseColor = record.name === 'Antarctica'
                ? TB_COLORS.ice
                : (TB_POLITICAL_PALETTE[record.colorIndex] || TB_COLORS.land);
            this.tracePath(ctx, record);
            ctx.fillStyle = guessedColor || baseColor;
            ctx.fill('evenodd');
            // Guessed countries get a heavier, darker outline so they pop
            ctx.strokeStyle = guessedColor ? TB_COLORS.guessedBorder : TB_COLORS.border;
            ctx.lineWidth = guessedColor ? 1 : 0.6;
            ctx.stroke();
        }

        // Tiny colored countries get a chunky marker so they stay visible
        for (const [name, color] of colorMap) {
            const record = this.world.countries.get(name);
            if (!record || !record.tiny) continue;
            const [x, y] = this.lonLatToPx(record.centroid[0], record.centroid[1]);
            ctx.fillStyle = 'rgba(40, 25, 12, 0.9)';
            ctx.fillRect(Math.round(x) - 2.5, Math.round(y) - 2.5, 5, 5);
            ctx.fillStyle = color;
            ctx.fillRect(Math.round(x) - 1.5, Math.round(y) - 1.5, 3, 3);
        }

        if (this.texture) this.texture.needsUpdate = true;
    }

    initThree() {
        const width = this.container.clientWidth || 300;
        const height = this.container.clientHeight || 300;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
        this.camera.position.set(0, 0, this.camDist);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.renderer.setSize(width, height);
        this.container.appendChild(this.renderer.domElement);
        this.canvas = this.renderer.domElement;

        this.texture = new THREE.CanvasTexture(this.texCanvas);
        this.texture.magFilter = THREE.NearestFilter;   // the chunky pixel look
        this.texture.minFilter = THREE.LinearFilter;
        this.texture.generateMipmaps = false;

        this.tiltGroup = new THREE.Group();
        this.globe = new THREE.Mesh(
            new THREE.SphereGeometry(1, 96, 64),
            new THREE.MeshBasicMaterial({ map: this.texture })
        );
        this.tiltGroup.add(this.globe);
        this.scene.add(this.tiltGroup);

        // Soft atmosphere glow sprite behind the globe
        const glowCanvas = document.createElement('canvas');
        glowCanvas.width = glowCanvas.height = 256;
        const gctx = glowCanvas.getContext('2d');
        const gradient = gctx.createRadialGradient(128, 128, 80, 128, 128, 128);
        gradient.addColorStop(0, 'rgba(130, 215, 255, 0)');
        gradient.addColorStop(0.62, 'rgba(130, 215, 255, 0.45)');
        gradient.addColorStop(0.82, 'rgba(110, 190, 255, 0.18)');
        gradient.addColorStop(1, 'rgba(100, 180, 255, 0)');
        gctx.fillStyle = gradient;
        gctx.fillRect(0, 0, 256, 256);
        const glowTexture = new THREE.CanvasTexture(glowCanvas);
        const glow = new THREE.Sprite(new THREE.SpriteMaterial({
            map: glowTexture,
            transparent: true,
            depthWrite: false
        }));
        glow.scale.set(2.75, 2.75, 1);
        this.scene.add(glow);

        this.raycaster = new THREE.Raycaster();
        this.applyView();

        window.addEventListener('resize', () => this.handleResize());
    }

    handleResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        if (!width || !height) return;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    applyView() {
        this.tiltGroup.rotation.x = this.viewLat * Math.PI / 180;
        this.globe.rotation.y = -Math.PI / 2 - this.viewLon * Math.PI / 180;
    }

    flyTo(lon, lat) {
        this.targetLon = lon;
        this.targetLat = Math.max(-72, Math.min(72, lat));
        this.flying = true;
        this.velocityLon = 0;
        this.velocityLat = 0;
        this.lastInteraction = performance.now();
    }

    initControls() {
        const el = this.canvas;
        el.style.touchAction = 'none';

        el.addEventListener('pointerdown', (e) => {
            el.setPointerCapture(e.pointerId);
            this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
            this.lastInteraction = performance.now();
            this.flying = false;
            this.velocityLon = 0;
            this.velocityLat = 0;
            if (this.pointers.size === 1) {
                this.dragging = true;
                this.downInfo = { x: e.clientX, y: e.clientY, time: performance.now() };
            } else if (this.pointers.size === 2) {
                const pts = [...this.pointers.values()];
                this.pinchStartDist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
                this.pinchStartCam = this.camDist;
                this.downInfo = null;
            }
        });

        el.addEventListener('pointermove', (e) => {
            if (!this.pointers.has(e.pointerId)) return;
            const prev = this.pointers.get(e.pointerId);
            const dx = e.clientX - prev.x;
            const dy = e.clientY - prev.y;
            this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
            this.lastInteraction = performance.now();

            if (this.pointers.size === 1 && this.dragging) {
                const degPerPx = 0.25 * (this.camDist - 0.9) / 1.8;
                this.viewLon -= dx * degPerPx;
                this.viewLat += dy * degPerPx;
                this.viewLat = Math.max(-72, Math.min(72, this.viewLat));
                this.velocityLon = -dx * degPerPx;
                this.velocityLat = dy * degPerPx;
                this.targetLon = this.viewLon;
                this.targetLat = this.viewLat;
                this.applyView();
            } else if (this.pointers.size === 2) {
                const pts = [...this.pointers.values()];
                const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
                if (this.pinchStartDist > 0) {
                    this.camDist = Math.max(1.5, Math.min(3.6,
                        this.pinchStartCam * this.pinchStartDist / dist));
                    this.camera.position.set(0, 0, this.camDist);
                }
            }
        });

        const endPointer = (e) => {
            this.pointers.delete(e.pointerId);
            if (this.pointers.size < 2) this.pinchStartDist = 0;
            if (this.pointers.size === 0) {
                this.dragging = false;
                if (this.downInfo) {
                    const moved = Math.hypot(e.clientX - this.downInfo.x, e.clientY - this.downInfo.y);
                    const elapsed = performance.now() - this.downInfo.time;
                    if (moved < 7 && elapsed < 450) this.handleTap(e);
                    this.downInfo = null;
                }
            }
        };
        el.addEventListener('pointerup', endPointer);
        el.addEventListener('pointercancel', endPointer);

        el.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.lastInteraction = performance.now();
            this.camDist = Math.max(1.5, Math.min(3.6, this.camDist + e.deltaY * 0.0015));
            this.camera.position.set(0, 0, this.camDist);
        }, { passive: false });
    }

    handleTap(e) {
        const rect = this.canvas.getBoundingClientRect();
        const ndc = new THREE.Vector2(
            ((e.clientX - rect.left) / rect.width) * 2 - 1,
            -((e.clientY - rect.top) / rect.height) * 2 + 1
        );
        this.raycaster.setFromCamera(ndc, this.camera);
        const hits = this.raycaster.intersectObject(this.globe);
        if (hits.length === 0) return;

        const local = this.globe.worldToLocal(hits[0].point.clone()).normalize();
        const lat = Math.asin(Math.max(-1, Math.min(1, local.y))) * 180 / Math.PI;
        let lon = Math.atan2(local.z, -local.x) * 180 / Math.PI - 180;
        if (lon < -180) lon += 360;
        if (lon > 180) lon -= 360;

        if (this.onTap) this.onTap(lon, lat);
    }

    animate(now) {
        requestAnimationFrame(this.animate);

        // Keep accumulated longitude bounded so the wrap math stays exact
        if (this.viewLon > 180) { this.viewLon -= 360; this.targetLon -= 360; }
        else if (this.viewLon < -180) { this.viewLon += 360; this.targetLon += 360; }

        if (this.flying) {
            let dLon = (this.targetLon - this.viewLon) % 360;
            if (dLon > 180) dLon -= 360;
            else if (dLon < -180) dLon += 360;
            let dLat = this.targetLat - this.viewLat;
            this.viewLon += dLon * 0.08;
            this.viewLat += dLat * 0.08;
            if (Math.abs(dLon) < 0.1 && Math.abs(dLat) < 0.1) this.flying = false;
            this.applyView();
        } else if (!this.dragging) {
            // Inertia after a fling
            if (Math.abs(this.velocityLon) > 0.01 || Math.abs(this.velocityLat) > 0.01) {
                this.viewLon += this.velocityLon;
                this.viewLat = Math.max(-72, Math.min(72, this.viewLat + this.velocityLat));
                this.velocityLon *= 0.93;
                this.velocityLat *= 0.93;
                this.targetLon = this.viewLon;
                this.targetLat = this.viewLat;
                this.applyView();
            } else if (now - this.lastInteraction > 4000) {
                // Gentle idle spin
                this.viewLon += 0.04;
                this.targetLon = this.viewLon;
                this.applyView();
            }
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// ============================================================
// The game
// ============================================================

class TerraByteGame {
    constructor() {
        this.world = null;
        this.globe = null;
        this.gameMode = 'daily';
        this.gameActive = true;
        this.targetName = null;
        this.guesses = [];          // { name, displayName, distance, isTarget }
        this.practiceGameId = null;
        this.suggestionIndex = -1;

        this.audioContext = null;
        this.gameAnalytics = new GameAnalytics('terra_byte');

        this.initializeElements();
        this.setupEventListeners();
        this.setupVisibilityHandling();
        this.initializeGame();
    }

    async initializeGame() {
        try {
            const response = await fetch('/games/terra-byte/data/countries-50m.json');
            if (!response.ok) throw new Error(`HTTP error loading countries! status: ${response.status}`);
            const topology = await response.json();

            this.world = new TerraByteWorld(topology);

            const wrap = document.getElementById('globeWrap');
            this.globe = new GlobeRenderer(wrap, this.world, (lon, lat) => this.handleGlobeTap(lon, lat));
            const loading = document.getElementById('globeLoading');
            if (loading) loading.style.display = 'none';

            const savedMode = localStorage.getItem('terraByte-gameMode');
            this.gameMode = savedMode === 'practice' ? 'practice' : 'daily';
            this.dailyModeButton.classList.toggle('active', this.gameMode === 'daily');
            this.practiceModeButton.classList.toggle('active', this.gameMode === 'practice');

            this.loadStats();
            this.startNewGame();

            if (window.analytics) {
                window.analytics.trackPageView('TerraByte Game', window.location.href);
            }
        } catch (error) {
            console.error('Failed to initialize TerraByte:', error);
            const loading = document.getElementById('globeLoading');
            if (loading) loading.textContent = '🌍 Could not load the globe. Check your connection and refresh!';
            this.updateMessage('Failed to load country data. Please refresh the page.', 'error');
        }
    }

    initializeElements() {
        this.message = document.getElementById('message');
        this.guessCountEl = document.getElementById('guessCount');
        this.closestDistanceEl = document.getElementById('closestDistance');
        this.guessInput = document.getElementById('guessInput');
        this.guessForm = document.getElementById('guessForm');
        this.guessButton = document.getElementById('guessButton');
        this.suggestionsEl = document.getElementById('suggestions');
        this.guessChipsEl = document.getElementById('guessChips');
        this.gamesWon = document.getElementById('gamesWon');
        this.gamesPlayed = document.getElementById('gamesPlayed');
        this.winStreak = document.getElementById('winStreak');
        this.dailyModeButton = document.getElementById('dailyMode');
        this.practiceModeButton = document.getElementById('practiceMode');
        this.newGameButton = document.getElementById('newGameButton');
        this.shareButton = document.getElementById('shareButton');
        this.statsButton = document.getElementById('statsButton');
    }

    setupEventListeners() {
        this.dailyModeButton.addEventListener('click', () => this.setGameMode('daily'));
        this.practiceModeButton.addEventListener('click', () => this.setGameMode('practice'));
        this.newGameButton.addEventListener('click', () => this.startNewGame(true));
        this.shareButton.addEventListener('click', () => this.shareResults());
        this.statsButton.addEventListener('click', () => this.showStatsModal());

        this.guessForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitGuess();
        });

        this.guessInput.addEventListener('input', () => this.updateSuggestions());
        this.guessInput.addEventListener('focus', () => this.updateSuggestions());
        this.guessInput.addEventListener('blur', () => {
            setTimeout(() => this.hideSuggestions(), 180);
        });
        this.guessInput.addEventListener('keydown', (e) => this.handleSuggestionKeys(e));

        const statsModal = document.getElementById('statsModal');
        if (statsModal) {
            const closeModal = () => statsModal.style.display = 'none';
            const closeButton = statsModal.querySelector('.modal-close-button');
            if (closeButton) closeButton.addEventListener('click', closeModal);
            statsModal.addEventListener('click', (e) => {
                if (e.target === statsModal) closeModal();
            });
        }
    }

    setupVisibilityHandling() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.audioContext) {
                this.audioContext.suspend();
            }
        });
    }

    // ------------------------------------------------------------
    // Modes & new game
    // ------------------------------------------------------------

    setGameMode(mode) {
        if (this.gameMode === mode) return;
        this.gameMode = mode;
        localStorage.setItem('terraByte-gameMode', mode);
        this.dailyModeButton.classList.toggle('active', mode === 'daily');
        this.practiceModeButton.classList.toggle('active', mode === 'practice');
        this.updateStatsDisplay();
        this.startNewGame();
        this.gameAnalytics.trackGameAction('game_mode_change', { mode: mode });
    }

    startNewGame(forceNew = false) {
        if (!this.world) return;
        this.hideAllButtons();
        this.hideSuggestions();

        if (!forceNew && this.loadGameState()) {
            console.log('Loaded saved game state.');
            return;
        }

        this.clearGameState();
        this.guesses = [];
        this.gameActive = true;

        if (this.gameMode === 'daily') {
            this.targetName = this.getDailyCountryName();
            this.practiceGameId = null;
            this.updateMessage("Guess today's mystery country! Warmer colors = closer.", 'info');
        } else {
            this.targetName = this.getRandomCountryName();
            this.practiceGameId = 'practice-' + Date.now();
            this.updateMessage('Guess the mystery country! Warmer colors = closer.', 'info');
        }

        this.refreshBoard();
        this.updateUIVisibility();
        this.saveGameState();

        console.log('Target country:', this.targetName); // For debugging
        this.gameAnalytics.trackGameStart(this.gameMode);
    }

    getDailyCountryName() {
        const today = new Date();
        const dateString = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
        const seed = tbHashCode('terrabyte-' + dateString);
        const index = Math.floor(tbSeededRandom(seed) * this.world.answerPool.length);
        return this.world.answerPool[index];
    }

    getRandomCountryName() {
        const pool = this.world.answerPool;
        return pool[Math.floor(Math.random() * pool.length)];
    }

    getDateString() {
        const today = new Date();
        return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
    }

    // ------------------------------------------------------------
    // Guessing
    // ------------------------------------------------------------

    submitGuess(rawValue = null) {
        if (!this.gameActive || !this.world) return;

        const value = (rawValue !== null ? rawValue : this.guessInput.value).trim();
        if (!value) return;

        const record = this.world.resolveGuess(value);
        if (!record) {
            this.updateMessage('Not in the country list! Try the suggestions.', 'error');
            this.playSound('error');
            this.updateSuggestions();
            return;
        }

        if (this.guesses.some(g => g.name === record.name)) {
            this.updateMessage(`You already guessed ${record.displayName}!`, 'error');
            this.playSound('error');
            this.guessInput.value = '';
            this.hideSuggestions();
            return;
        }

        const target = this.world.countries.get(this.targetName);
        const distance = this.world.distanceBetween(record, target);
        const isTarget = record.name === this.targetName;

        this.guesses.push({
            name: record.name,
            displayName: record.displayName,
            distance: distance,
            isTarget: isTarget
        });

        this.guessInput.value = '';
        this.hideSuggestions();
        this.guessInput.blur();

        this.refreshBoard();
        if (this.globe) this.globe.flyTo(record.centroid[0], record.centroid[1]);

        if (isTarget) {
            this.saveGameState();
            this.handleWin();
        } else {
            this.showDistanceMessage(record.displayName, distance);
            this.playSound('guess');
            this.saveGameState();
        }
    }

    showDistanceMessage(displayName, distance) {
        if (distance === 0) {
            this.updateMessage(`🔥 SO CLOSE! ${displayName} borders the mystery country!`, 'info');
            return;
        }
        const miles = Math.round(distance * 0.621371);
        let flavor;
        if (distance < 500) flavor = '🔥 Blazing hot!';
        else if (distance < 1500) flavor = '🌶️ Hot!';
        else if (distance < 3000) flavor = '☀️ Warm...';
        else if (distance < 6000) flavor = '❄️ Cold...';
        else flavor = '🧊 Freezing!';
        this.updateMessage(`${flavor} ${displayName} is ${distance.toLocaleString()} km (${miles.toLocaleString()} mi) away`, 'info');
    }

    handleWin() {
        this.gameActive = false;
        const count = this.guesses.length;
        const target = this.world.countries.get(this.targetName);
        this.updateMessage(`🎉 Amazing! The mystery country was ${target.displayName}! Got it in ${count} ${count === 1 ? 'guess' : 'guesses'}!`, 'success');
        this.playSound('win');
        this.createConfetti();

        this.gameAnalytics.trackGameEnd(true, count);

        const stats = this.getStats();
        const gameKey = this.gameMode === 'daily' ? this.getDateString() : this.practiceGameId;
        if (stats.lastGamePlayed !== gameKey) {
            stats.gamesWon++;
            stats.gamesPlayed++;
            stats.currentStreak++;
            stats.maxStreak = Math.max(stats.maxStreak, stats.currentStreak);
            stats.totalGuesses += count;
            if (stats.bestGuesses === null || count < stats.bestGuesses) {
                stats.bestGuesses = count;
            }
            const bucket = count >= 8 ? '8+' : String(count);
            stats.guessDistribution[bucket] = (stats.guessDistribution[bucket] || 0) + 1;
            stats.lastGamePlayed = gameKey;
            this.saveStats(stats);
        }
        this.updateStatsDisplay();
        this.saveGameState();

        setTimeout(() => this.updateUIVisibility(), 500);
    }

    handleGlobeTap(lon, lat) {
        if (!this.world || this.guesses.length === 0) return;
        const guessedNames = this.guesses.map(g => g.name);
        const record = this.world.countryAt(lon, lat, guessedNames);
        if (!record) return;
        const guess = this.guesses.find(g => g.name === record.name);
        if (guess.isTarget) {
            this.updateMessage(`🎯 ${record.displayName} — the mystery country!`, 'success');
        } else if (guess.distance === 0) {
            this.updateMessage(`${record.displayName} borders the mystery country!`, 'info');
        } else {
            this.updateMessage(`${record.displayName}: ${guess.distance.toLocaleString()} km away`, 'info');
        }
    }

    // ------------------------------------------------------------
    // Board / UI refresh
    // ------------------------------------------------------------

    refreshBoard() {
        // Repaint globe
        if (this.globe) {
            const colorMap = new Map();
            for (const guess of this.guesses) {
                colorMap.set(guess.name, guess.isTarget ? TB_COLORS.found : tbHeatColor(guess.distance));
            }
            this.globe.paint(colorMap);
        }

        // Guess chips, closest first
        this.guessChipsEl.innerHTML = '';
        const sorted = [...this.guesses].sort((a, b) => {
            if (a.isTarget) return -1;
            if (b.isTarget) return 1;
            return a.distance - b.distance;
        });
        for (const guess of sorted) {
            const chip = document.createElement('div');
            chip.className = 'guess-chip';
            const color = guess.isTarget ? TB_COLORS.found : tbHeatColor(guess.distance);
            chip.style.background = color;
            chip.style.color = tbIsDarkColor(color) ? '#fff' : '#3a2a10';
            chip.textContent = guess.isTarget
                ? `${guess.displayName} 🎯`
                : `${guess.displayName} · ${guess.distance.toLocaleString()} km`;
            this.guessChipsEl.appendChild(chip);
        }

        // Info bar
        this.guessCountEl.textContent = `Guesses: ${this.guesses.length}`;
        const nonTarget = this.guesses.filter(g => !g.isTarget);
        if (this.guesses.some(g => g.isTarget)) {
            this.closestDistanceEl.textContent = '🎯 Found it!';
        } else if (nonTarget.length > 0) {
            const closest = Math.min(...nonTarget.map(g => g.distance));
            this.closestDistanceEl.textContent = `Closest: ${closest.toLocaleString()} km`;
        } else {
            this.closestDistanceEl.textContent = 'Closest: —';
        }
    }

    updateUIVisibility() {
        const gameOver = !this.gameActive;
        this.shareButton.style.display = gameOver && this.gameMode === 'daily' ? 'inline-block' : 'none';
        this.statsButton.style.display = gameOver ? 'inline-block' : 'none';
        this.newGameButton.style.display = this.gameMode === 'practice' ? 'inline-block' : 'none';
        this.guessInput.disabled = gameOver;
        this.guessButton.disabled = gameOver;
        this.guessInput.placeholder = !gameOver ? 'Enter a country...'
            : (this.gameMode === 'daily' ? 'Come back tomorrow!' : 'Press NEW GAME to play again!');
    }

    hideAllButtons() {
        this.shareButton.style.display = 'none';
        this.statsButton.style.display = 'none';
        this.newGameButton.style.display = 'none';
    }

    updateMessage(text, type) {
        this.message.innerHTML = `<p>${text}</p>`;
        this.message.className = `message ${type}`;
    }

    // ------------------------------------------------------------
    // Autocomplete suggestions
    // ------------------------------------------------------------

    updateSuggestions() {
        if (!this.world || !this.gameActive) return;
        const value = this.guessInput.value.trim();
        if (value.length < 1) {
            this.hideSuggestions();
            return;
        }
        const exclude = new Set(this.guesses.map(g => g.name));
        const matches = this.world.getSuggestions(value, exclude);
        if (matches.length === 0) {
            this.hideSuggestions();
            return;
        }

        this.suggestionsEl.innerHTML = '';
        this.suggestionIndex = -1;
        matches.forEach((displayName) => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.textContent = displayName;
            // pointerdown fires before the input's blur hides the list
            item.addEventListener('pointerdown', (e) => {
                e.preventDefault();
                this.submitGuess(displayName);
            });
            this.suggestionsEl.appendChild(item);
        });
        this.suggestionsEl.style.display = 'block';
    }

    hideSuggestions() {
        this.suggestionsEl.style.display = 'none';
        this.suggestionsEl.innerHTML = '';
        this.suggestionIndex = -1;
    }

    handleSuggestionKeys(e) {
        const items = this.suggestionsEl.querySelectorAll('.suggestion-item');
        if (items.length === 0) return;

        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            const delta = e.key === 'ArrowDown' ? 1 : -1;
            this.suggestionIndex = (this.suggestionIndex + delta + items.length) % items.length;
            items.forEach((item, i) => item.classList.toggle('highlighted', i === this.suggestionIndex));
        } else if (e.key === 'Enter' && this.suggestionIndex >= 0) {
            e.preventDefault();
            this.submitGuess(items[this.suggestionIndex].textContent);
        } else if (e.key === 'Escape') {
            this.hideSuggestions();
        }
    }

    // ------------------------------------------------------------
    // Game state persistence
    // ------------------------------------------------------------

    saveGameState() {
        const state = {
            targetName: this.targetName,
            guesses: this.guesses.map(g => g.name),
            gameActive: this.gameActive,
            practiceGameId: this.practiceGameId,
            savedDate: this.gameMode === 'daily' ? this.getDateString() : null
        };
        localStorage.setItem(`terraByte-gameState-${this.gameMode}-v1`, JSON.stringify(state));
    }

    loadGameState() {
        const savedJSON = localStorage.getItem(`terraByte-gameState-${this.gameMode}-v1`);
        if (!savedJSON) return false;

        try {
            const saved = JSON.parse(savedJSON);

            if (this.gameMode === 'daily') {
                if (saved.savedDate !== this.getDateString() ||
                    saved.targetName !== this.getDailyCountryName()) {
                    this.clearGameState();
                    return false;
                }
            }

            if (!saved.targetName || !this.world.countries.has(saved.targetName)) {
                this.clearGameState();
                return false;
            }

            this.targetName = saved.targetName;
            this.gameActive = saved.gameActive;
            this.practiceGameId = saved.practiceGameId || null;

            const target = this.world.countries.get(this.targetName);
            this.guesses = [];
            for (const name of saved.guesses || []) {
                const record = this.world.countries.get(name);
                if (!record) continue;
                this.guesses.push({
                    name: record.name,
                    displayName: record.displayName,
                    distance: this.world.distanceBetween(record, target),
                    isTarget: record.name === this.targetName
                });
            }

            this.refreshBoard();
            this.updateUIVisibility();

            if (!this.gameActive) {
                const count = this.guesses.length;
                this.updateMessage(`🎉 The mystery country was ${target.displayName}! Got it in ${count} ${count === 1 ? 'guess' : 'guesses'}!`, 'success');
                if (this.globe) this.globe.flyTo(target.centroid[0], target.centroid[1]);
            } else if (this.guesses.length > 0) {
                this.updateMessage('Welcome back! Keep guessing!', 'info');
            } else {
                this.updateMessage(this.gameMode === 'daily'
                    ? "Guess today's mystery country! Warmer colors = closer."
                    : 'Guess the mystery country! Warmer colors = closer.', 'info');
            }

            return true;
        } catch (error) {
            console.error('Failed to load game state:', error);
            this.clearGameState();
            return false;
        }
    }

    clearGameState() {
        localStorage.removeItem(`terraByte-gameState-${this.gameMode}-v1`);
    }

    // ------------------------------------------------------------
    // Stats
    // ------------------------------------------------------------

    getStats() {
        const key = `terraByte-stats-${this.gameMode}`;
        const defaultStats = {
            gamesWon: 0,
            gamesPlayed: 0,
            currentStreak: 0,
            maxStreak: 0,
            totalGuesses: 0,
            bestGuesses: null,
            lastGamePlayed: null,
            guessDistribution: {}
        };
        const saved = localStorage.getItem(key);
        const stats = saved ? JSON.parse(saved) : defaultStats;
        if (!stats.guessDistribution) stats.guessDistribution = {};
        return stats;
    }

    saveStats(stats) {
        localStorage.setItem(`terraByte-stats-${this.gameMode}`, JSON.stringify(stats));
    }

    loadStats() {
        this.updateStatsDisplay();
    }

    updateStatsDisplay() {
        const stats = this.getStats();
        this.gamesWon.textContent = stats.gamesWon;
        this.gamesPlayed.textContent = stats.gamesPlayed;
        this.winStreak.textContent = stats.currentStreak;
    }

    showStatsModal() {
        const stats = this.getStats();
        const modal = document.getElementById('statsModal');
        if (!modal) return;

        this.gameAnalytics.trackButtonClick('show_stats');

        document.getElementById('statsPlayed').textContent = stats.gamesPlayed;
        const avg = stats.gamesWon > 0 ? (stats.totalGuesses / stats.gamesWon).toFixed(1) : '—';
        document.getElementById('statsAvgGuesses').textContent = avg;
        document.getElementById('statsCurrentStreak').textContent = stats.currentStreak;
        document.getElementById('statsMaxStreak').textContent = stats.maxStreak;

        const distributionContainer = document.getElementById('guessDistribution');
        distributionContainer.innerHTML = '';
        const buckets = ['1', '2', '3', '4', '5', '6', '7', '8+'];
        const maxCount = Math.max(1, ...buckets.map(b => stats.guessDistribution[b] || 0));
        const currentBucket = !this.gameActive && this.guesses.length > 0
            ? (this.guesses.length >= 8 ? '8+' : String(this.guesses.length))
            : null;

        buckets.forEach((bucket) => {
            const count = stats.guessDistribution[bucket] || 0;
            const row = document.createElement('div');
            row.className = 'dist-item';

            const label = document.createElement('span');
            label.textContent = bucket;

            const bar = document.createElement('div');
            bar.className = 'dist-bar';
            bar.textContent = count;
            if (bucket === currentBucket) bar.classList.add('highlight');
            bar.style.width = `${Math.max((count / maxCount) * 100, 5)}%`;

            row.appendChild(label);
            row.appendChild(bar);
            distributionContainer.appendChild(row);
        });

        modal.style.display = 'flex';
    }

    // ------------------------------------------------------------
    // Sharing
    // ------------------------------------------------------------

    generateShareText() {
        const epoch = new Date(TB_EPOCH);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const daysSinceEpoch = Math.floor((today.getTime() - epoch.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const puzzleNumber = Math.max(1, daysSinceEpoch);
        const count = this.guesses.length;

        let emojiLine = '';
        for (const guess of this.guesses) {
            if (guess.isTarget) emojiLine += '🟩';
            else if (guess.distance < 700) emojiLine += '🟥';
            else if (guess.distance < 1800) emojiLine += '🟧';
            else if (guess.distance < 4000) emojiLine += '🟨';
            else emojiLine += '⬜';
        }

        let shareText = `TerraByte ${puzzleNumber} 🌍 ${count} ${count === 1 ? 'guess' : 'guesses'}\n\n`;
        shareText += emojiLine + '\n';
        shareText += '\nPlay at: ' + window.location.href;
        return shareText;
    }

    shareResults() {
        const shareText = this.generateShareText();
        this.gameAnalytics.trackButtonClick('share_results');

        if (navigator.share) {
            navigator.share({ text: shareText }).catch(err => {
                console.log('Error sharing:', err);
                this.fallbackShare(shareText);
            });
        } else {
            this.fallbackShare(shareText);
        }
    }

    fallbackShare(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                this.updateMessage('📋 Results copied to clipboard!', 'success');
                setTimeout(() => {
                    const target = this.world.countries.get(this.targetName);
                    const count = this.guesses.length;
                    this.updateMessage(`🎉 The mystery country was ${target.displayName}! Got it in ${count} ${count === 1 ? 'guess' : 'guesses'}!`, 'success');
                }, 2000);
            }).catch(err => {
                console.log('Failed to copy:', err);
                this.showShareText(text);
            });
        } else {
            this.showShareText(text);
        }
    }

    showShareText(text) {
        // Prevent main page from scrolling while the modal is open
        document.body.style.overflow = 'hidden';

        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.7); display: flex;
            align-items: center; justify-content: center; z-index: 1000;
        `;

        const modal = document.createElement('div');
        modal.style.cssText = `
            background: #2c2c2c; padding: 20px; border-radius: 8px;
            width: 90%; max-width: 400px; text-align: center;
            color: #fff;
        `;

        const closeModal = () => {
            document.body.removeChild(overlay);
            document.body.style.overflow = '';
        };

        modal.innerHTML = `
            <h3 style="margin-top:0;">Copy to Clipboard</h3>
            <textarea readonly style="width: 100%; height: 120px; background: #1e1e1e; color: #fff; border: 1px solid #444; border-radius: 4px; padding: 10px; box-sizing: border-box; resize: none;">${text}</textarea>
            <button class="modal-close-button" style="width: 100%; padding: 10px; margin-top: 15px; background: #007bff; color: white; border: none; border-radius: 4px; font-size: 16px; cursor: pointer;">Close</button>
        `;

        modal.querySelector('.modal-close-button').addEventListener('click', closeModal);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });

        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    }

    // ------------------------------------------------------------
    // Effects
    // ------------------------------------------------------------

    playSound(type) {
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            let frequency, duration;
            switch (type) {
                case 'win': frequency = 523.25; duration = 0.5; break;
                case 'guess': frequency = 330; duration = 0.15; break;
                case 'error': frequency = 200; duration = 0.3; break;
                default: frequency = 440; duration = 0.2;
            }

            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.08, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (error) {
            // Audio is a nice-to-have; never let it break the game
        }
    }

    createConfetti() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f7dc6f', '#bb8fce'];
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.position = 'fixed';
                confetti.style.width = '10px';
                confetti.style.height = '10px';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.left = Math.random() * 100 + '%';
                confetti.style.top = '-10px';
                confetti.style.borderRadius = '50%';
                confetti.style.pointerEvents = 'none';
                confetti.style.zIndex = '9999';
                confetti.style.animation = 'confettiFall 3s linear forwards';

                document.body.appendChild(confetti);

                setTimeout(() => {
                    if (confetti.parentNode) {
                        confetti.parentNode.removeChild(confetti);
                    }
                }, 3000);
            }, i * 50);
        }
    }
}

// ============================================================
// Analytics wrapper (same pattern as the other games)
// ============================================================

class GameAnalytics {
    constructor(gameName) {
        this.gameName = gameName;
        this.gameStartTime = null;
    }

    trackGameStart(difficulty = null) {
        this.gameStartTime = Date.now();
        if (typeof window !== 'undefined' && window.analytics) {
            window.analytics.trackGameStart(this.gameName, difficulty);
        }
    }

    trackGameEnd(success, score = null) {
        const timePlayed = this.gameStartTime ? Math.round((Date.now() - this.gameStartTime) / 1000) : null;
        if (typeof window !== 'undefined' && window.analytics) {
            window.analytics.trackGameComplete(this.gameName, success, score, timePlayed);
        }
    }

    trackGameAction(action, additionalParams = {}) {
        if (typeof window !== 'undefined' && window.analytics) {
            window.analytics.trackGameEvent(action, this.gameName, additionalParams);
        }
    }

    trackButtonClick(buttonName) {
        if (typeof window !== 'undefined' && window.analytics) {
            window.analytics.trackButtonClick(buttonName, this.gameName);
        }
    }
}

// ============================================================
// Boot
// ============================================================

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    // CSS for confetti animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes confettiFall {
            to {
                transform: translateY(100vh) rotate(360deg);
            }
        }
    `;
    document.head.appendChild(style);

    window.addEventListener('load', () => {
        if (typeof THREE === 'undefined') {
            const loading = document.getElementById('globeLoading');
            if (loading) loading.textContent = '🌍 Could not load the 3D engine. Check your connection and refresh!';
            return;
        }
        window.terraByteGame = new TerraByteGame();
    });
}

// Export pure logic for testing in Node (has no effect in the browser)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TerraByteWorld,
        tbNormalizeName,
        tbHashCode,
        tbSeededRandom,
        tbHaversineKm,
        tbHeatColor,
        TB_ALIASES,
        TB_DISPLAY_NAMES,
        TB_TERRITORIES,
        TB_RENDER_ONLY
    };
}
