// LENS Atlas — "Field" pattern: dots that rearrange across organizing axes.
// Axes: Map (geographic, line-art world backdrop) / Year / Type / Tags.

// ──────────────────────────────────────────────────────────────────────
// SIMPLIFIED LINE-ART WORLD MAP
// Equirectangular projection in viewBox 1000 x 500.
// x = (lng + 180) * 1000 / 360 ; y = (90 - lat) * 500 / 180
// ──────────────────────────────────────────────────────────────────────
const WORLD_PATHS = [
  // North America — Alaska arc through Canadian arctic, east coast curve, Florida hook,
  // Gulf of Mexico, Central America tail, Mexican west coast, Baja, up Pacific NW back to Alaska
  "M 42,56 L 67,53 L 97,56 L 125,56 L 153,50 L 175,53 L 194,58 L 222,58 L 240,67 L 260,72 L 275,80 L 290,86 L 308,82 L 322,86 L 336,95 L 344,106 L 353,118 L 348,128 L 333,134 L 322,128 L 312,133 L 306,142 L 298,150 L 292,158 L 289,164 L 286,170 L 280,172 L 278,180 L 275,178 L 270,172 L 266,166 L 263,162 L 256,164 L 250,168 L 247,166 L 246,170 L 256,192 L 256,202 L 264,210 L 268,218 L 264,224 L 278,228 L 283,232 L 280,230 L 268,225 L 252,218 L 240,210 L 228,205 L 218,200 L 211,195 L 206,188 L 200,184 L 194,189 L 194,184 L 200,178 L 206,170 L 216,158 L 222,150 L 218,142 L 210,138 L 198,138 L 184,140 L 175,150 L 170,156 L 162,148 L 158,140 L 158,128 L 153,120 L 147,114 L 139,108 L 125,102 L 110,100 L 92,100 L 78,92 L 65,86 L 56,76 L 50,68 Z",

  // Greenland — distinctive elongated shape
  "M 388,30 L 410,28 L 432,34 L 446,46 L 452,62 L 454,80 L 446,96 L 432,105 L 416,110 L 400,108 L 388,98 L 378,86 L 372,74 L 370,60 L 374,46 L 380,36 Z",

  // South America — NE Brazil bulge, tapered south, narrow west coast
  "M 286,222 L 295,222 L 308,224 L 322,232 L 336,240 L 348,250 L 360,260 L 372,268 L 388,272 L 400,278 L 408,288 L 412,300 L 412,312 L 408,322 L 402,332 L 395,340 L 388,350 L 380,360 L 372,370 L 363,380 L 354,390 L 345,398 L 336,404 L 328,408 L 322,402 L 318,392 L 314,380 L 308,368 L 302,355 L 296,342 L 292,328 L 290,315 L 288,300 L 286,285 L 285,270 L 285,255 L 286,240 Z",

  // Africa — Mediterranean top, Horn pointing east, Cape pointing south, Guinea concavity
  "M 478,148 L 498,144 L 518,142 L 535,146 L 552,150 L 568,156 L 580,160 L 590,156 L 600,160 L 608,170 L 612,178 L 615,188 L 622,196 L 632,202 L 640,210 L 642,220 L 638,228 L 628,232 L 618,234 L 610,242 L 606,254 L 602,266 L 596,278 L 590,290 L 582,300 L 575,310 L 568,320 L 558,328 L 548,335 L 540,340 L 534,338 L 528,330 L 522,322 L 516,312 L 508,300 L 500,288 L 492,276 L 486,266 L 482,256 L 478,246 L 474,236 L 470,224 L 466,212 L 462,200 L 462,188 L 466,176 L 470,166 L 472,158 Z",

  // Mediterranean inward bite (Gulf of Sirte / cleaner top)  — skipped, kept simple

  // Europe — Iberia, UK, Scandinavia, Italy boot
  "M 478,148 L 482,140 L 490,134 L 502,132 L 514,134 L 526,128 L 538,122 L 545,112 L 548,98 L 552,82 L 562,70 L 575,62 L 588,62 L 596,72 L 594,86 L 586,98 L 580,108 L 590,114 L 605,118 L 618,124 L 626,134 L 628,144 L 618,148 L 605,148 L 590,146 L 575,142 L 562,144 L 552,148 L 545,142 L 538,138 L 532,144 L 528,150 L 524,144 L 520,148 L 515,144 L 510,148 L 505,144 L 500,150 L 495,146 L 488,150 Z",

  // Italy peninsula (boot)
  "M 532,140 L 537,142 L 540,150 L 542,158 L 540,164 L 535,162 L 533,154 L 531,146 Z",

  // British Isles (Great Britain + Ireland approximated as one cluster)
  "M 480,102 L 488,96 L 497,98 L 502,108 L 502,118 L 496,128 L 488,128 L 482,118 L 478,110 Z",
  "M 470,118 L 477,116 L 478,126 L 472,128 L 468,122 Z",

  // Asia — Caspian/Black Sea inland, India triangle, SE Asia peninsulas, Kamchatka, Korea, China coast
  "M 588,62 L 605,55 L 625,50 L 650,48 L 678,48 L 705,50 L 730,52 L 758,55 L 785,58 L 812,62 L 840,68 L 868,72 L 895,76 L 915,82 L 932,90 L 945,100 L 952,112 L 945,120 L 932,122 L 918,118 L 905,122 L 895,130 L 905,138 L 920,142 L 930,148 L 928,156 L 918,158 L 905,154 L 892,148 L 882,140 L 875,148 L 880,156 L 888,164 L 888,172 L 880,170 L 870,164 L 862,158 L 855,164 L 848,170 L 845,178 L 850,188 L 858,194 L 855,202 L 845,206 L 832,204 L 820,200 L 808,202 L 800,210 L 792,218 L 785,224 L 778,232 L 772,238 L 762,242 L 755,238 L 748,228 L 740,218 L 732,210 L 728,202 L 724,210 L 720,222 L 718,232 L 712,240 L 705,242 L 696,236 L 690,226 L 686,216 L 680,206 L 674,194 L 668,182 L 658,170 L 648,160 L 644,150 L 642,140 L 645,132 L 642,124 L 632,122 L 622,124 L 612,118 L 605,110 L 598,98 L 592,86 L 588,74 Z",

  // India peninsula (extra triangle)
  "M 686,180 L 700,182 L 712,188 L 718,200 L 716,212 L 710,222 L 702,228 L 696,222 L 692,212 L 690,200 L 688,190 Z",

  // Arabian peninsula
  "M 605,170 L 622,170 L 638,180 L 645,196 L 642,210 L 632,220 L 618,222 L 608,214 L 602,200 L 600,184 Z",

  // Japan — Hokkaido / Honshu / Kyushu approximation
  "M 880,128 L 890,124 L 898,132 L 902,142 L 898,152 L 890,156 L 884,150 L 880,142 L 878,134 Z",
  "M 878,158 L 884,158 L 888,168 L 886,176 L 880,176 L 876,166 Z",

  // Korean peninsula
  "M 855,148 L 862,150 L 864,160 L 862,170 L 855,170 L 852,160 Z",

  // Indonesia — Sumatra long island
  "M 758,228 L 778,228 L 798,234 L 812,242 L 810,250 L 795,250 L 778,246 L 762,240 Z",
  // Java
  "M 800,258 L 822,256 L 838,260 L 836,266 L 818,266 L 802,264 Z",
  // Borneo
  "M 802,236 L 822,234 L 838,240 L 842,252 L 836,260 L 822,258 L 808,252 L 802,244 Z",
  // Philippines (cluster)
  "M 835,200 L 842,196 L 848,204 L 850,212 L 845,220 L 838,220 L 834,210 Z",

  // Australia — proper shape with Cape York, Great Australian Bight
  "M 814,295 L 830,290 L 850,288 L 868,285 L 880,288 L 890,295 L 895,288 L 902,295 L 915,302 L 925,312 L 928,325 L 925,338 L 918,348 L 905,354 L 890,356 L 875,355 L 858,356 L 842,355 L 828,352 L 818,346 L 812,338 L 808,328 L 808,318 L 810,308 Z",

  // New Zealand — North and South Island
  "M 962,348 L 970,344 L 974,352 L 972,362 L 964,362 Z",
  "M 968,368 L 976,366 L 982,376 L 980,388 L 970,388 L 966,378 Z",

  // Madagascar
  "M 622,288 L 632,288 L 638,300 L 638,316 L 632,324 L 624,322 L 620,310 L 619,298 Z",

  // Sri Lanka
  "M 706,230 L 712,230 L 714,238 L 710,242 L 706,238 Z",

  // Iceland
  "M 470,84 L 482,82 L 490,86 L 488,94 L 478,96 L 470,90 Z",

  // Antarctica — full bottom band
  "M 30,448 L 80,440 L 140,438 L 200,440 L 260,442 L 320,440 L 380,442 L 440,442 L 500,440 L 560,442 L 620,440 L 680,442 L 740,440 L 800,442 L 860,440 L 920,442 L 970,440 L 970,495 L 30,495 Z",
];

// FIELD viewBox — matches MD spec (1000 x 700, preserveAspectRatio=none)
const FW = 1000;
const FH = 560;  // top pad 30 + map 500 + bottom pad 30

// ──────────────────────────────────────────────────────────────────────
// POSITION ENGINES — one normalized {x, y} in [0,1] per project, per view
// ──────────────────────────────────────────────────────────────────────

function positionsForMap(projects) {
  // Equirectangular → field. Map block is centered in field area with y-margin.
  // The world map (1000x500) is drawn inside field (1000x700) shifted down 100px.
  const MAP_X_FRAC = 0; // 0..1 of field width
  const MAP_W_FRAC = 1;
  const MAP_Y_FRAC = 30 / FH;
  const MAP_H_FRAC = 500 / FH;
  const out = {};
  projects.forEach(p => {
    if (!p.coordinates) return;
    const [lat, lng] = p.coordinates.split(',').map(s => parseFloat(s));
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return;
    const px = (lng + 180) / 360;       // 0..1 in map
    const py = (90 - lat) / 180;         // 0..1 in map
    out[p.id] = {
      x: MAP_X_FRAC + px * MAP_W_FRAC,
      y: MAP_Y_FRAC + py * MAP_H_FRAC,
    };
  });
  return out;
}

function positionsForYear(projects) {
  // Columns by year, dots stacked top-to-bottom within column.
  const groups = {};
  projects.forEach(p => {
    const key = p.year || '—';
    (groups[key] = groups[key] || []).push(p);
  });
  const years = Object.keys(groups).sort();
  const N = years.length;
  const out = {};
  const padX = 0.06;
  const usableX = 1 - padX * 2;
  const colW = usableX / Math.max(N, 1);
  years.forEach((y, xi) => {
    const cx = padX + colW * xi + colW * 0.5;
    const items = groups[y];
    // sort within column for stable layout
    items.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    items.forEach((p, i) => {
      out[p.id] = {
        x: cx,
        y: 0.22 + i * 0.085,
      };
    });
  });
  return { positions: out, columns: years.map((y, i) => ({ label: y, x: padX + colW * i + colW * 0.5 })) };
}

function positionsForType(projects) {
  const groups = {};
  projects.forEach(p => {
    const key = p.type || 'Other';
    (groups[key] = groups[key] || []).push(p);
  });
  const types = Object.keys(groups).sort();
  const N = types.length;
  const out = {};
  const padX = 0.06;
  const usableX = 1 - padX * 2;
  const colW = usableX / Math.max(N, 1);
  types.forEach((ty, xi) => {
    const cx = padX + colW * xi + colW * 0.5;
    const items = groups[ty];
    items.sort((a, b) => (a.year || 0) - (b.year || 0));
    items.forEach((p, i) => {
      out[p.id] = {
        x: cx,
        y: 0.24 + i * 0.085,
      };
    });
  });
  return { positions: out, columns: types.map((t, i) => ({ label: t, x: padX + colW * i + colW * 0.5 })) };
}

// ──────────────────────────────────────────────────────────────────────
// BACKDROP COMPONENTS
// ──────────────────────────────────────────────────────────────────────

// Cache for fetched world geojson so it loads once across mounts
let WORLD_PATHS_CACHE = null;
let WORLD_PATHS_PROMISE = null;

function fetchWorldPaths() {
  if (WORLD_PATHS_CACHE) return Promise.resolve(WORLD_PATHS_CACHE);
  if (WORLD_PATHS_PROMISE) return WORLD_PATHS_PROMISE;
  // Douglas-Peucker simplification (operates in lng/lat degrees)
  const perpDist = (p, a, b) => {
    const dx = b[0] - a[0], dy = b[1] - a[1];
    if (dx === 0 && dy === 0) return Math.hypot(p[0]-a[0], p[1]-a[1]);
    const t = ((p[0]-a[0])*dx + (p[1]-a[1])*dy) / (dx*dx + dy*dy);
    const cx = a[0] + t*dx, cy = a[1] + t*dy;
    return Math.hypot(p[0]-cx, p[1]-cy);
  };
  const dp = (pts, tol) => {
    if (pts.length < 3) return pts;
    const keep = new Uint8Array(pts.length);
    keep[0] = keep[pts.length-1] = 1;
    const stack = [[0, pts.length-1]];
    while (stack.length) {
      const [s, e] = stack.pop();
      let maxD = 0, idx = -1;
      for (let i = s+1; i < e; i++) {
        const d = perpDist(pts[i], pts[s], pts[e]);
        if (d > maxD) { maxD = d; idx = i; }
      }
      if (maxD > tol && idx !== -1) {
        keep[idx] = 1;
        stack.push([s, idx], [idx, e]);
      }
    }
    const out = [];
    for (let i = 0; i < pts.length; i++) if (keep[i]) out.push(pts[i]);
    return out;
  };
  // Bounding box area in degrees² — drop tiny islets
  const bboxArea = (pts) => {
    let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
    for (const [x,y] of pts) { if(x<minX)minX=x; if(x>maxX)maxX=x; if(y<minY)minY=y; if(y>maxY)maxY=y; }
    return (maxX-minX) * (maxY-minY);
  };

  WORLD_PATHS_PROMISE = fetch('https://cdn.jsdelivr.net/gh/martynafford/natural-earth-geojson@master/110m/physical/ne_110m_land.json')
    .then(r => r.json())
    .then(geo => {
      const TOL = 1.2;       // degrees — chunkier silhouette
      const MIN_AREA = 4;    // deg² — drop islets smaller than this
      const paths = [];
      const feats = geo.features || [];
      feats.forEach(f => {
        const g = f.geometry;
        if (!g) return;
        const polys = g.type === 'MultiPolygon' ? g.coordinates : (g.type === 'Polygon' ? [g.coordinates] : []);
        polys.forEach(poly => {
          poly.forEach((ring, ringIdx) => {
            // Only filter outer rings by size; keep holes for the outers we keep
            if (ringIdx === 0 && bboxArea(ring) < MIN_AREA) return;
            // Skip Antarctica — anything whose northernmost point is below -60°
            let maxLat = -Infinity;
            for (const [, lat] of ring) if (lat > maxLat) maxLat = lat;
            if (maxLat < -60) return;
            const simp = dp(ring, TOL);
            if (simp.length < 4) return;
            let d = '';
            simp.forEach(([lng, lat], i) => {
              const x = ((lng + 180) / 360) * 1000;
              const y = ((90 - lat) / 180) * 500;
              d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1) + ' ';
            });
            d += 'Z';
            paths.push(d);
          });
        });
      });
      WORLD_PATHS_CACHE = paths;
      return paths;
    })
    .catch(() => {
      WORLD_PATHS_CACHE = WORLD_PATHS; // fallback to hand-drawn paths
      return WORLD_PATHS_CACHE;
    });
  return WORLD_PATHS_PROMISE;
}

function MapBackdrop() {
  const [paths, setPaths] = React.useState(WORLD_PATHS_CACHE);
  React.useEffect(() => {
    if (!paths) fetchWorldPaths().then(setPaths);
  }, []);
  const usePaths = paths || WORLD_PATHS;
  return (
    <svg viewBox={`0 0 ${FW} ${FH}`} preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      <g transform="translate(0, 30)">
        <g stroke="var(--border)" strokeWidth="0.5" fill="none" opacity="0.6">
          {[-60, -30, 0, 30, 60].map(lat => {
            const y = ((90 - lat) / 180) * 500;
            return <line key={'lat' + lat} x1="0" y1={y} x2={FW} y2={y} strokeDasharray={lat === 0 ? "0" : "2 5"} />;
          })}
          {[-150, -120, -90, -60, -30, 30, 60, 90, 120, 150].map(lng => {
            const x = ((lng + 180) / 360) * FW;
            return <line key={'lng' + lng} x1={x} y1="0" x2={x} y2="500" strokeDasharray="2 5" />;
          })}
          <line x1={FW/2} y1="0" x2={FW/2} y2="500" />
        </g>
        <g fill="none" stroke="var(--fg2)" strokeWidth="0.7" strokeLinejoin="round" strokeLinecap="round" opacity="0.75">
          {usePaths.map((d, i) => <path key={i} d={d} vectorEffect="non-scaling-stroke" />)}
        </g>
        <g fill="var(--fg)" opacity="0.035">
          {usePaths.map((d, i) => <path key={'fill' + i} d={d} />)}
        </g>
      </g>
    </svg>
  );
}

function ColumnBackdrop({ columns, axisLabel }) {
  return (
    <svg viewBox={`0 0 ${FW} ${FH}`} preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      {/* Vertical column dividers */}
      <g stroke="var(--border)" strokeWidth="0.5" opacity="0.5">
        {columns.map((c, i) => i > 0 && (
          <line key={i} x1={(columns[i-1].x + c.x) / 2 * FW} y1="80" x2={(columns[i-1].x + c.x) / 2 * FW} y2={FH - 20} strokeDasharray="2 6" />
        ))}
      </g>
      {/* Column headers */}
      <g fill="var(--fg3)" fontFamily="Inter, sans-serif" fontSize="14" letterSpacing="0.12em" textAnchor="middle" style={{ textTransform: 'uppercase' }}>
        {columns.map((c, i) => (
          <text key={i} x={c.x * FW} y="58" fontSize="11">{String(c.label).toUpperCase()}</text>
        ))}
      </g>
      {/* Oversized faint column numerals (for year view) — only when columns don't get too packed */}
      {axisLabel === 'year' && columns.length <= 6 && (
        <g fill="var(--fg)" opacity="0.03" fontFamily="Inter, sans-serif" fontWeight="200" textAnchor="middle" letterSpacing="-0.03em">
          {columns.map((c, i) => {
            // Auto-scale font size based on column width so adjacent numerals don't overlap
            const colWidthPx = (1 / columns.length) * FW;
            const fs = Math.min(220, colWidthPx * 0.85);
            return (
              <text key={i} x={c.x * FW} y={FH * 0.62} fontSize={fs}>{String(c.label).slice(-2)}</text>
            );
          })}
        </g>
      )}
    </svg>
  );
}

// ──────────────────────────────────────────────────────────────────────
// MAIN ATLAS COMPONENT
// ──────────────────────────────────────────────────────────────────────

// Hand-generalized coastlines: increasing detail by level, no political borders.
const ATLAS_COASTS = {
  china: [[135,49],[134,46],[132,43],[130,42],[129,39],[129,36],[127,34.5],[126,35],[125,38],[124,39.5],[122,40],[121,41],[119.5,40],[118,39],[119,38],[121,38],[122,37],[120,36],[120,34],[121.5,32],[122,30],[121,28],[120,26],[118,24.5],[116,23],[114,22.5],[113.5,23],[113,22],[111,21.5],[110.3,21],[110,20.2],[109.6,20.3],[109.8,21.3],[108.5,21.7],[107,21],[106,19.5],[105.5,18],[107,16],[109,13],[109,10],[106,8]],
  guangdong: [[105,20],[107,21],[108,21.6],[108.8,21.7],[109.7,21.4],[109.6,20.5],[109.9,20.2],[110.3,20.4],[110.4,20.9],[110.2,21.2],[110.7,21.4],[111,21.5],[111.5,21.5],[112,21.8],[112.4,21.8],[112.7,22.1],[113.05,22.05],[113.25,22.2],[113.35,22.55],[113.25,22.8],[113.48,23.05],[113.65,22.85],[113.55,22.6],[113.8,22.4],[113.95,22.5],[114.15,22.3],[114.35,22.4],[114.5,22.65],[114.8,22.6],[115.1,22.8],[115.5,22.75],[115.8,22.9],[116.25,23.05],[116.6,23.3],[116.9,23.4],[117.2,23.65],[117.6,23.75],[118,24.1],[118.5,24.4],[119,25],[120,26],[121,28]],
};
const ATLAS_COAST_ISLANDS = [
  [[108.7,19.8],[109.4,20.1],[110.5,19.8],[111,19.1],[110.5,18.4],[109.6,18.1],[108.8,18.5],[108.5,19.2]],
  [[121.5,25.2],[122,24.6],[121.5,23.4],[120.8,22],[120.2,22.5],[120.3,23.7],[120.8,24.7]],
];
function AtlasRegionBackdrop({level,bounds}) {
  const coast=ATLAS_COASTS[level];
  const path=points=>'M'+points.map(([x,y])=>`${x},${-y}`).join(' L');
  const edge=path(coast);
  const land=level==='china'?edge+' L 65,-8 L 65,-65 L 145,-65 Z':edge+' L 130,-60 L 65,-60 L 65,-15 Z';
  return <svg aria-hidden="true" viewBox={`${bounds[0]} ${-bounds[3]} ${bounds[2]-bounds[0]} ${bounds[3]-bounds[1]}`} style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none'}}>
    <g stroke="var(--border)" strokeWidth=".5" opacity=".6">
      {[1,2,3].map(i=>{const y=bounds[1]+(bounds[3]-bounds[1])*i/4;return <line key={'y'+i} x1={bounds[0]} y1={-y} x2={bounds[2]} y2={-y} strokeDasharray="2 5" vectorEffect="non-scaling-stroke"/>;})}
      {[1,2,3,4].map(i=>{const x=bounds[0]+(bounds[2]-bounds[0])*i/5;return <line key={'x'+i} x1={x} y1={-bounds[1]} x2={x} y2={-bounds[3]} strokeDasharray="2 5" vectorEffect="non-scaling-stroke"/>;})}
    </g>
    <path d={land} fill="var(--fg)" opacity=".035"/>
    <g fill="none" stroke="var(--fg2)" strokeWidth=".7" strokeLinejoin="round" strokeLinecap="round" opacity=".75">
      <path d={edge} vectorEffect="non-scaling-stroke"/>
      {ATLAS_COAST_ISLANDS.map((points,i)=><path key={i} d={path(points)+' Z'} fill="var(--fg)" fillOpacity=".035" vectorEffect="non-scaling-stroke"/>)}
    </g>
  </svg>;
}

// Fixed editorial views; no free camera, dragging, wheel or pinch zoom.
const ATLAS_LEVELS = {
  world: {label:'World'},
  china: {label:'China',bounds:[72,17,136,55]},
  guangdong: {label:'Guangdong',bounds:[109,19.5,118,26]},
};
function atlasRegionPositions(projects,level,width,height) {
  if(level==='world') return {positions:positionsForMap(projects),bounds:null};
  const raw=ATLAS_LEVELS[level].bounds;
  const cx=(raw[0]+raw[2])/2,cy=(raw[1]+raw[3])/2;
  let w=raw[2]-raw[0],h=raw[3]-raw[1];
  if(w/h<width/height)w=h*width/height;else h=w*height/width;
  const bounds=[cx-w/2,cy-h/2,cx+w/2,cy+h/2],positions={};
  for(const p of projects){
    const parts=(p.coordinates||'').split(',');
    if(parts.length!==2||parts.some(v=>!v.trim()))continue;
    const [lat,lng]=parts.map(Number);
    if(!Number.isFinite(lat)||!Number.isFinite(lng)||Math.abs(lat)>90||Math.abs(lng)>180)continue;
    if(lng<raw[0]||lng>raw[2]||lat<raw[1]||lat>raw[3])continue;
    positions[p.id]={x:(lng-bounds[0])/w,y:(bounds[3]-lat)/h};
  }
  return {positions,bounds};
}
function atlasClusters(projects,positions,width,height) {
  const remaining=new Set(projects.filter(p=>positions[p.id]));
  const groups=[];
  for(const seed of [...remaining]){
    if(!remaining.delete(seed))continue;
    const members=[seed];
    for(let i=0;i<members.length;i++)for(const p of remaining){
      const a=positions[members[i].id],b=positions[p.id];
      if(Math.hypot((a.x-b.x)*width,(a.y-b.y)*height)<48){remaining.delete(p);members.push(p);}
    }
    groups.push({members,x:members.reduce((v,p)=>v+positions[p.id].x,0)/members.length,y:members.reduce((v,p)=>v+positions[p.id].y,0)/members.length});
  }
  return groups;
}
function AtlasMap({projects,onSelect,setView}) {
  const [level,setLevel]=React.useState('world');
  const [selection,setSelection]=React.useState(null);
  const [filter,setFilter]=React.useState('all');
  const [size,setSize]=React.useState({width:1000,height:560});
  const field=React.useRef(null);
  React.useEffect(()=>{const observer=new ResizeObserver(([e])=>setSize({width:e.contentRect.width,height:e.contentRect.height}));observer.observe(field.current);return()=>observer.disconnect();},[]);
  const filtered=React.useMemo(()=>projects.filter(p=>filter==='all'||p.type===filter),[projects,filter]);
  const {positions,bounds}=React.useMemo(()=>atlasRegionPositions(filtered,level,size.width,size.height),[filtered,level,size]);
  const groups=React.useMemo(()=>atlasClusters(filtered,positions,size.width,size.height),[filtered,positions,size]);
  const inView=filtered.filter(p=>positions[p.id]);
  const listed=(selection?inView.filter(p=>selection.includes(p.id)):inView).slice().sort((a,b)=>a.title.localeCompare(b.title));
  const go=next=>{setLevel(next);setSelection(null);};
  const destination=g=>{
    if(level==='world'&&g.members.every(p=>/china/i.test(p.location||'')))return 'china';
    if(level==='china'&&g.members.every(p=>{const [lat,lng]=(p.coordinates||'').split(',').map(Number);return lat>=20&&lat<=26&&lng>=109&&lng<=118;}))return 'guangdong';
    return null;
  };
  const open=g=>{const next=destination(g);if(next)go(next);else if(g.members.length===1)onSelect(g.members[0]);else setSelection(g.members.map(p=>p.id));};
  const button={border:'1px solid var(--border)',background:'var(--card-bg)',color:'var(--fg)',padding:'9px 12px',cursor:'pointer',font:'inherit',fontSize:12};
  return <main className="atlas-map-page" style={{padding:'120px 56px 40px',minWidth:0}}>
    <style>{`
      .atlas-map-toolbar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:22px 0 14px}
      .atlas-map-layout{display:grid;grid-template-columns:minmax(0,1fr) 260px;gap:20px}
      .atlas-map-field{height:clamp(360px,60vh,680px)}
      .atlas-map-marker:focus-visible{outline:2px solid var(--fg);outline-offset:3px}
      @media(max-width:760px){.atlas-map-page{padding:110px 20px 28px!important}.atlas-map-layout{grid-template-columns:minmax(0,1fr)}.atlas-map-field{height:300px}.atlas-map-toolbar select{max-width:100%;min-width:0}}
    `}</style>
    <h1 style={{fontWeight:200,fontSize:'clamp(40px,5vw,64px)',margin:0,letterSpacing:'-.025em'}}>Atlas</h1>
    <p style={{color:'var(--fg3)',lineHeight:1.6,marginTop:12}}>Explore the collection by geography, year, or type. Select a group to see its region.</p>
    <div className="atlas-map-toolbar">
      <span style={{fontSize:12,color:'var(--fg3)'}}>Arrange by</span>
      {['map','year','type'].map(v=><button key={v} style={{...button,background:v==='map'?'var(--fg)':'transparent',color:v==='map'?'var(--bg)':'var(--fg)'}} onClick={()=>setView(v)}>{v==='map'?'Geography':v==='year'?'Year':'Type'}</button>)}
      <select aria-label="Filter projects by type" value={filter} onChange={e=>{setFilter(e.target.value);setSelection(null);}} style={button}><option value="all">All types</option>{[...new Set(projects.map(p=>p.type).filter(Boolean))].sort().map(t=><option key={t}>{t}</option>)}</select>
    </div>
    <nav aria-label="Map region" style={{display:'flex',alignItems:'center',gap:8,marginBottom:14,flexWrap:'wrap'}}>
      {(level==='world'?['world']:level==='china'?['world','china']:['world','china','guangdong']).map((key,i)=><React.Fragment key={key}>{i>0&&<span style={{color:'var(--fg3)'}}> / </span>}<button onClick={()=>go(key)} aria-current={level===key?'location':undefined} style={{...button,border:'none',padding:'6px 0',color:level===key?'var(--accent)':'var(--fg3)'}}>{ATLAS_LEVELS[key].label}</button></React.Fragment>)}
      {level!=='world'&&<button style={{...button,marginLeft:'auto'}} onClick={()=>go(level==='guangdong'?'china':'world')}>← Back one level</button>}
    </nav>
    {level!=='world'&&<p style={{fontSize:11,color:'var(--fg3)',marginBottom:12}}>Schematic view · relative project locations</p>}
    <div className="atlas-map-layout">
      <div ref={field} className="atlas-map-field" aria-label={`${ATLAS_LEVELS[level].label} project map`} style={{position:'relative',overflow:'hidden',border:'1px solid var(--border)',background:'var(--card-bg)'}}>
        {level==='world'?<MapBackdrop/>:<AtlasRegionBackdrop level={level} bounds={bounds}/>}
        {groups.map(g=>{const next=destination(g),count=g.members.length,label=next?`Explore ${ATLAS_LEVELS[next].label}`:count>1?`Choose from ${count} projects`:`Open ${g.members[0].title}`;return <button className="atlas-map-marker" key={g.members.map(p=>p.id).join('-')} aria-label={label} title={label} onClick={()=>open(g)} style={{position:'absolute',left:`${g.x*100}%`,top:`${g.y*100}%`,transform:'translate(-50%,-50%)',display:'grid',placeItems:'center',width:44,height:44,border:0,padding:0,background:'transparent',cursor:'pointer'}}>
          <span style={{display:'grid',placeItems:'center',width:count>1?36:13,height:count>1?36:13,borderRadius:'50%',background:'var(--accent)',color:'white',fontSize:13,boxShadow:'0 0 0 3px var(--card-bg)'}}>{count>1?count:''}</span>
          {next&&<span style={{position:'absolute',top:43,fontSize:11,color:'var(--fg2)',whiteSpace:'nowrap'}}>{ATLAS_LEVELS[next].label}</span>}
        </button>})}
      </div>
      <aside aria-label="Projects in map area" style={{minWidth:0,borderTop:'1px solid var(--border)',paddingTop:16,overflowWrap:'anywhere'}}>
        <div aria-live="polite" style={{fontSize:12,color:'var(--fg3)',marginBottom:12}}>{selection?'Selected group':ATLAS_LEVELS[level].label} · {listed.length} projects</div>
        {selection&&<button style={button} onClick={()=>setSelection(null)}>Show all in this region</button>}
        {listed.map(p=><button key={p.id} onClick={()=>onSelect(p)} style={{display:'block',width:'100%',textAlign:'left',padding:'16px 0',border:0,borderBottom:'1px solid var(--border)',background:'transparent',color:'var(--fg)',cursor:'pointer'}}><span style={{display:'block',fontSize:16,lineHeight:1.4}}>{p.title} →</span><span style={{display:'block',fontSize:12,color:'var(--fg3)',marginTop:6}}>{p.location}{p.year?` · ${p.year}`:''}</span></button>)}
        {!listed.length&&<p style={{fontSize:13,color:'var(--fg3)'}}>No projects match this view.</p>}
        {level==='guangdong'&&listed.length>1&&<p style={{fontSize:12,color:'var(--fg3)',lineHeight:1.6,marginTop:16}}>Select a project from the list. Nearby projects share a numbered point.</p>}
      </aside>
    </div>
  </main>;
}

function Atlas({ projects, onSelect }) {
  const [view, setView] = React.useState('map');     // 'map' | 'year' | 'type'
  const [active, setActive] = React.useState(null);
  const [filter, setFilter] = React.useState('all'); // 'all' | <type>

  const typeOptions = React.useMemo(() => {
    const set = new Set(projects.map(p => p.type).filter(Boolean));
    return ['all', ...Array.from(set).sort()];
  }, [projects]);

  const filtered = React.useMemo(() => (
    filter === 'all' ? projects : projects.filter(p => p.type === filter)
  ), [projects, filter]);

  // Build positions for the active view
  const { positions, columns } = React.useMemo(() => {
    if (view === 'map') return { positions: positionsForMap(filtered), columns: null };
    if (view === 'year') return positionsForYear(filtered);
    if (view === 'type') return positionsForType(filtered);
    return { positions: {}, columns: null };
  }, [view, filtered]);

  // Projects without positions in current view (e.g. no coords on map) — show offscreen
  const visibleProjects = filtered.filter(p => positions[p.id]);

  if (view === 'map') return <AtlasMap projects={projects} onSelect={onSelect} setView={setView} />;

  return (
    <>
      <style>{`
        .field-dot {
          transition: cx 700ms cubic-bezier(.4,.1,.2,1),
                      cy 700ms cubic-bezier(.4,.1,.2,1),
                      r 250ms ease,
                      opacity 200ms;
          cursor: pointer;
        }
        .field-label {
          transition: left 700ms cubic-bezier(.4,.1,.2,1),
                      top 700ms cubic-bezier(.4,.1,.2,1),
                      opacity 250ms;
          pointer-events: none;
        }
        @keyframes fieldPulse {
          0%   { r: 14; opacity: 0.4; }
          70%  { r: 38; opacity: 0; }
          100% { r: 14; opacity: 0; }
        }
        .field-pulse { animation: fieldPulse 2s ease-out infinite; }
      `}</style>

      <div style={{ paddingTop: 96, position: 'relative', zIndex: 1, height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxSizing: 'border-box' }}>
        {/* Header — matches Browse alignment */}
        <div style={{ padding: '24px 56px 20px', flex: '0 0 auto' }}>
          <h1 style={{
            fontFamily: 'Inter, sans-serif', fontWeight: 200,
            fontSize: 'clamp(40px, 5vw, 64px)', letterSpacing: '-0.025em',
            margin: 0, lineHeight: 1.05,
          }}>Atlas</h1>
          <p style={{
            fontFamily: 'Inter, sans-serif', fontSize: 15, color: 'var(--fg3)',
            marginTop: 12, marginBottom: 0, maxWidth: 540, lineHeight: 1.55,
          }}>
            The collection as a field. Each dot is a project — rearrange by geography, year, or type, and hover to inspect.
          </p>
        </div>

        {/* Field + chrome */}
        <div style={{ padding: '0 56px 24px', flex: '1 1 auto', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{
            position: 'relative',
            flex: '1 1 auto',
            minHeight: 0,
            maxWidth: 'min(100%, calc((100vh - 260px) * 2.1))',
            margin: '0 auto',
            width: '100%',
            border: '1px solid var(--border)',
            background: 'var(--card-bg)',
            overflow: 'hidden',
          }}>
            {/* Backdrop varies by view */}
            {view === 'map' && <MapBackdrop />}
            {view === 'year' && <ColumnBackdrop columns={columns} axisLabel="year" />}
            {view === 'type' && <ColumnBackdrop columns={columns} axisLabel="type" />}

            {/* Dots — HTML divs so they stay round regardless of viewport aspect */}
            {visibleProjects.map(p => {
              const pos = positions[p.id];
              const isActive = active && active.id === p.id;
              const size = isActive ? 22 : 11;
              return (
                <React.Fragment key={p.id}>
                  {isActive && (
                    <div
                      className="field-pulse-html"
                      style={{
                        position: 'absolute',
                        left: `${pos.x * 100}%`,
                        top: `${pos.y * 100}%`,
                        width: size, height: size,
                        marginLeft: -size/2, marginTop: -size/2,
                        borderRadius: '50%',
                        border: '1px solid var(--accent)',
                        pointerEvents: 'none',
                      }}
                    />
                  )}
                  <div
                    className="field-dot-html"
                    onMouseEnter={() => setActive(p)}
                    onMouseLeave={() => setActive(null)}
                    onClick={() => onSelect(p)}
                    style={{
                      position: 'absolute',
                      left: `${pos.x * 100}%`,
                      top: `${pos.y * 100}%`,
                      width: size, height: size,
                      marginLeft: -size/2, marginTop: -size/2,
                      borderRadius: '50%',
                      background: 'var(--accent)',
                      cursor: 'pointer',
                      transition: 'width 0.2s, height 0.2s, margin 0.2s',
                    }}
                  />
                </React.Fragment>
              );
            })}

            {/* Labels — HTML so type renders crisp */}
            {visibleProjects.map(p => {
              const pos = positions[p.id];
              const isActive = active && active.id === p.id;
              return (
                <div
                  key={p.id}
                  className="field-label"
                  style={{
                    position: 'absolute',
                    left: `${pos.x * 100}%`,
                    top: `${pos.y * 100}%`,
                    transform: 'translate(12px, -50%)',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 10,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: isActive ? 'var(--fg)' : 'var(--fg3)',
                    opacity: isActive ? 1 : 0.55,
                    fontWeight: isActive ? 500 : 400,
                    whiteSpace: 'nowrap',
                    maxWidth: 220,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {p.title}
                </div>
              );
            })}

            {/* Bottom-left control panel — Arrange by + Filter merged */}
            <div style={{
              position: 'absolute', left: 20, bottom: 20,
              display: 'flex', flexDirection: 'column',
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(8px)',
              border: '1px solid var(--border)',
            }}>
              <div style={{ display: 'flex', gap: 6, padding: 4, alignItems: 'center' }}>
                <span style={{
                  fontFamily: 'Inter, sans-serif', fontSize: 10,
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: 'var(--fg4)', padding: '6px 8px 6px 10px',
                  alignSelf: 'center', minWidth: 76,
                }}>Arrange by</span>
                {[
                  { id: 'map', label: 'Geography' },
                  { id: 'year', label: 'Year' },
                  { id: 'type', label: 'Type' },
                ].map(o => {
                  const isActive = view === o.id;
                  return (
                    <button
                      key={o.id}
                      onClick={() => setView(o.id)}
                      style={{
                        background: isActive ? 'var(--fg)' : 'transparent',
                        color: isActive ? 'var(--bg)' : 'var(--fg2)',
                        border: 'none',
                        padding: '6px 12px',
                        fontFamily: 'Inter, sans-serif', fontSize: 12,
                        cursor: 'pointer',
                        letterSpacing: '0.02em',
                        transition: 'background 0.15s, color 0.15s',
                      }}
                    >{o.label}</button>
                  );
                })}
              </div>
              <div style={{
                borderTop: '1px solid var(--border)',
                display: 'flex', gap: 4, padding: 4, alignItems: 'center', flexWrap: 'wrap',
              }}>
                <span style={{
                  fontFamily: 'Inter, sans-serif', fontSize: 10,
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: 'var(--fg4)', padding: '6px 8px 6px 10px',
                  alignSelf: 'center', minWidth: 76,
                }}>Filter</span>
                {typeOptions.map(t => {
                  const isActive = filter === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setFilter(t)}
                      style={{
                        background: isActive ? 'var(--accent-dim)' : 'transparent',
                        color: isActive ? 'var(--accent-bright)' : 'var(--fg3)',
                        border: 'none',
                        padding: '6px 12px',
                        fontFamily: 'Inter, sans-serif', fontSize: 11,
                        cursor: 'pointer',
                        letterSpacing: '0.04em',
                        whiteSpace: 'nowrap',
                      }}
                    >{t === 'all' ? 'All' : t}</button>
                  );
                })}
              </div>
            </div>

            {/* Active project card — bottom-right */}
            {active && (
              <div style={{
                position: 'absolute', right: 20, bottom: 20,
                width: 320,
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(12px)',
                border: '1px solid var(--border)',
                padding: 18,
                boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
              }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)' }}>
                    {active.type}
                  </div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: 'var(--fg4)' }}>{active.year}</div>
                </div>
                <div style={{
                  fontFamily: 'Inter, sans-serif', fontSize: 22, fontWeight: 400,
                  letterSpacing: '-0.015em', marginTop: 8, color: 'var(--fg)',
                  lineHeight: 1.2,
                }}>{active.title}</div>
                <div style={{
                  fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'var(--fg3)',
                  marginTop: 4, lineHeight: 1.4,
                }}>{active.location}</div>
                {active.subtitle && (
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'var(--fg2)', marginTop: 10, lineHeight: 1.5 }}>
                    {active.subtitle}
                  </div>
                )}
                <button
                  onClick={() => onSelect(active)}
                  style={{
                    marginTop: 14,
                    background: 'none', border: 'none',
                    color: 'var(--accent-bright)',
                    fontFamily: 'Inter, sans-serif', fontSize: 12,
                    fontWeight: 500, letterSpacing: '0.04em',
                    cursor: 'pointer', padding: 0,
                    textDecoration: 'underline', textUnderlineOffset: 4,
                  }}
                >Open project →</button>
              </div>
            )}

            {/* Hint when nothing is active */}
            {!active && (
              <div style={{
                position: 'absolute', right: 20, bottom: 20,
                fontFamily: 'Inter, sans-serif', fontSize: 11,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'var(--fg4)',
                background: 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(6px)',
                padding: '8px 12px',
                border: '1px solid var(--border)',
              }}>
                Hover a dot
              </div>
            )}
          </div>

          {/* Field meta — count below */}
          <div style={{
            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
            marginTop: 16, fontFamily: 'Inter, sans-serif', fontSize: 12, color: 'var(--fg3)',
          }}>
            <div>
              Showing <span style={{ color: 'var(--fg)', fontWeight: 500 }}>{visibleProjects.length}</span> of {projects.length} projects
              {view === 'map' && filtered.length > visibleProjects.length && (
                <span style={{ color: 'var(--fg4)' }}> · {filtered.length - visibleProjects.length} lack coordinates</span>
              )}
            </div>
            <div style={{ letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: 11 }}>
              Atlas / {view === 'map' ? 'Geography' : view === 'year' ? 'Chronology' : 'Typology'}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

if (typeof window !== 'undefined') Object.assign(window, { Atlas });
