/* =========================================================
   International Capital Markets — Interactive Guide
   Complete JavaScript: chart helpers + section update logic
   ========================================================= */

const NS = "http://www.w3.org/2000/svg";
const $ = id => document.getElementById(id);
const fmtPct = (v, d = 1) => v.toFixed(d) + "%";
const fmtNum = (v, d = 2) => v.toFixed(d);

const state = {
  parityMode: "uip",
  parityUipEe: 1.37,
  parityCipSpot: 1.39,
  mfRegime: "floating",
  mfPolicy: "monetary",
  trilemma: "peg"
};

/* ── Chart Helper Factory ── */
function mkChart(svgEl) {
  const svg = svgEl;
  svg.innerHTML = "";
  const W = svg.viewBox.baseVal.width || 580;
  const H = svg.viewBox.baseVal.height || 360;
  const m = { t: 30, r: 24, b: 48, l: 58 };
  const iW = W - m.l - m.r, iH = H - m.t - m.b;

  function n(tag, a) {
    const el = document.createElementNS(NS, tag);
    if (a) for (const [k, v] of Object.entries(a)) el.setAttribute(k, String(v));
    return el;
  }

  function txt(x, y, s, a) {
    a = a || {};
    const t = n("text", {
      x, y,
      "text-anchor": a.anchor || "middle",
      fill: a.fill || "#9cb0d2",
      "font-size": a.size || 12,
      "font-weight": a.weight || "normal",
      ...(a.transform ? { transform: a.transform } : {})
    });
    t.textContent = s;
    svg.appendChild(t);
    return t;
  }

  const api = {
    W, H, m, iW, iH, n, txt, svg,
    sx(v, lo, hi) { return m.l + ((v - lo) / (hi - lo || 1)) * iW; },
    sy(v, lo, hi) { return m.t + iH - ((v - lo) / (hi - lo || 1)) * iH; },

    grid() {
      for (let i = 0; i <= 4; i++) {
        const y = m.t + (i / 4) * iH;
        svg.appendChild(n("line", { x1: m.l, y1: y, x2: W - m.r, y2: y, stroke: "rgba(156,176,210,0.10)", "stroke-width": 1 }));
      }
      return api;
    },

    axes(xLbl, yLbl) {
      svg.appendChild(n("line", { x1: m.l, y1: m.t - 4, x2: m.l, y2: H - m.b, stroke: "rgba(156,176,210,0.35)", "stroke-width": 1.5 }));
      svg.appendChild(n("line", { x1: m.l, y1: H - m.b, x2: W - m.r + 4, y2: H - m.b, stroke: "rgba(156,176,210,0.35)", "stroke-width": 1.5 }));
      svg.appendChild(n("polygon", { points: `${m.l - 4},${m.t} ${m.l + 4},${m.t} ${m.l},${m.t - 8}`, fill: "rgba(156,176,210,0.35)" }));
      svg.appendChild(n("polygon", { points: `${W - m.r},${H - m.b - 4} ${W - m.r},${H - m.b + 4} ${W - m.r + 8},${H - m.b}`, fill: "rgba(156,176,210,0.35)" }));
      txt(W / 2, H - 4, xLbl);
      txt(16, H / 2, yLbl, { transform: `rotate(-90 16 ${H / 2})` });
      return api;
    },

    curve(pts, xR, yR, color, opts) {
      opts = opts || {};
      if (pts.length < 2) return api;
      const d = pts.map(function (p, i) {
        return (i ? "L" : "M") + api.sx(p[0], xR[0], xR[1]).toFixed(1) + "," + api.sy(p[1], yR[0], yR[1]).toFixed(1);
      }).join(" ");
      svg.appendChild(n("path", {
        d: d, fill: "none", stroke: color,
        "stroke-width": opts.w || 2.5,
        "stroke-linecap": "round", "stroke-linejoin": "round",
        ...(opts.dash ? { "stroke-dasharray": "8,5" } : {}),
        opacity: opts.op || 1
      }));
      return api;
    },

    dot(x, y, xR, yR, color, opts) {
      opts = opts || {};
      const px = api.sx(x, xR[0], xR[1]), py = api.sy(y, yR[0], yR[1]);
      if (opts.toAxes) {
        svg.appendChild(n("line", { x1: px, y1: py, x2: m.l, y2: py, stroke: color, "stroke-width": 1, "stroke-dasharray": "3,3", opacity: 0.45 }));
        svg.appendChild(n("line", { x1: px, y1: py, x2: px, y2: H - m.b, stroke: color, "stroke-width": 1, "stroke-dasharray": "3,3", opacity: 0.45 }));
      }
      svg.appendChild(n("circle", { cx: px, cy: py, r: opts.r || 6, fill: opts.fill || "#0b1628", stroke: color, "stroke-width": 2.5 }));
      if (opts.label) txt(px + (opts.dx || 10), py + (opts.dy || -10), opts.label, { fill: color, weight: 700, size: 13, anchor: "start" });
      if (opts.xLbl) txt(px, H - m.b + 16, opts.xLbl, { fill: color, weight: "bold", size: 11 });
      if (opts.yLbl) txt(m.l - 6, py + 4, opts.yLbl, { fill: color, weight: "bold", size: 11, anchor: "end" });
      return api;
    },

    vLine(x, xR, yR, color, opts) {
      opts = opts || {};
      var px = api.sx(x, xR[0], xR[1]);
      svg.appendChild(n("line", {
        x1: px, y1: m.t, x2: px, y2: H - m.b, stroke: color,
        "stroke-width": opts.w || 2.5,
        ...(opts.dash ? { "stroke-dasharray": "8,5" } : {}),
        opacity: opts.op || 1
      }));
      if (opts.label) txt(px, m.t - 10, opts.label, { fill: color, weight: 700, size: 12 });
      return api;
    },

    hLine(y, xR, yR, color, opts) {
      opts = opts || {};
      var sy = api.sy(y, yR[0], yR[1]);
      svg.appendChild(n("line", {
        x1: m.l, y1: sy, x2: W - m.r, y2: sy, stroke: color,
        "stroke-width": opts.w || 2.5,
        ...(opts.dash ? { "stroke-dasharray": "8,5" } : {}),
        opacity: opts.op || 1
      }));
      if (opts.label) txt(W - m.r + 4, sy + 4, opts.label, { fill: color, weight: 700, size: 12, anchor: "start" });
      return api;
    },

    label(x, y, xR, yR, s, color, opts) {
      opts = opts || {};
      txt(api.sx(x, xR[0], xR[1]) + (opts.dx || 8), api.sy(y, yR[0], yR[1]) + (opts.dy || -8), s, { fill: color, weight: 700, size: 13, anchor: opts.anchor || "start" });
      return api;
    }
  };

  api.grid();
  return api;
}

/* ── Helper: generate curve points ── */
function linspace(a, b, n) {
  var arr = [];
  for (var i = 0; i < n; i++) arr.push(a + (b - a) * i / (n - 1));
  return arr;
}

/* ── Clamp helper ── */
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

/* =========================================================
   SECTION 1: FX MARKET — Supply & Demand
   ========================================================= */
var FX_DEMAND_BASE = 2.39;
var FX_SUPPLY_BASE = 0.39;

function updateFxMarket() {
  var dShift = +$("fx-d-shift").value;
  var sShift = +$("fx-s-shift").value;
  $("fx-d-shift-v").textContent = fmtNum(dShift, 1);
  $("fx-s-shift-v").textContent = fmtNum(sShift, 1);

  var c = mkChart($("fx-chart"));
  var xR = [0, 10], yR = [0, 3];
  c.axes("Quantity of USD", "CAD/USD (E)");

  // Original curves
  // Demand: E = 2.39 - 0.2Q  |  Supply: E = 0.39 + 0.2Q
  var pts = 50;

  if (Math.abs(dShift) > 0.05 || Math.abs(sShift) > 0.05) {
    var origD = linspace(0, 10, pts).map(function (q) { return [q, FX_DEMAND_BASE - 0.2 * q]; });
    var origS = linspace(0, 10, pts).map(function (q) { return [q, FX_SUPPLY_BASE + 0.2 * q]; });
    c.curve(origD, xR, yR, "#7dd3fc", { dash: true, op: 0.25 });
    c.curve(origS, xR, yR, "#c084fc", { dash: true, op: 0.25 });
    // Original equilibrium ghost
    c.dot(5, 1.39, xR, yR, "#fbbf24", { r: 4, fill: "rgba(251,191,36,0.15)", op: 0.3 });
  }

  // Current (shifted) curves
  var curD = linspace(0, 10, pts).map(function (q) { return [q, FX_DEMAND_BASE + dShift - 0.2 * q]; });
  // Positive sShift is a rightward supply shift: more USD supplied, lower E at each quantity.
  var curS = linspace(0, 10, pts).map(function (q) { return [q, FX_SUPPLY_BASE - sShift + 0.2 * q]; });
  c.curve(curD, xR, yR, "#7dd3fc");
  c.curve(curS, xR, yR, "#c084fc");

  // Labels at curve ends
  c.label(0.3, FX_DEMAND_BASE + dShift - 0.2 * 0.3, xR, yR, "D", "#7dd3fc", { dx: -30, dy: -6 });
  c.label(9.5, FX_SUPPLY_BASE - sShift + 0.2 * 9.5, xR, yR, "S", "#c084fc", { dx: 6, dy: -6 });

  // Equilibrium: D = S, with positive sShift interpreted as a rightward supply shift.
  var eqQ = (FX_DEMAND_BASE - FX_SUPPLY_BASE + dShift + sShift) / 0.4;
  var eqE = FX_SUPPLY_BASE - sShift + 0.2 * eqQ;

  if (eqQ > 0 && eqQ < 10 && eqE > 0 && eqE < 3) {
    c.dot(eqQ, eqE, xR, yR, "#fbbf24", { toAxes: true, label: "E*", xLbl: "Q*=" + fmtNum(eqQ, 1), yLbl: fmtNum(eqE, 2) });
  }

  $("fx-eq-e").textContent = fmtNum(eqE, 2);
  $("fx-eq-q").textContent = fmtNum(eqQ, 1);
}

/* =========================================================
   SECTION 2: MONEY → INTEREST RATES → EXCHANGE RATES
   Two-panel: Money Market (left) + FX Returns (right)
   ========================================================= */
var MM_DEFAULT_MS = 7, MM_DEFAULT_IF = 3.6, MM_DEFAULT_EE = 1.37;
var MM_MONEY_SCALE = 15.75;
var MM_SENSITIVITY = 71; // linearization slope: with E^e=1.37, gives E*≈1.389 at default rates

function updateMoneyFx() {
  var ms = +$("mm-ms").value;
  var iForeign = +$("mm-if").value;
  var eExp = +$("mm-ee").value;
  $("mm-ms-v").textContent = fmtNum(ms, 1);
  $("mm-if-v").textContent = fmtPct(iForeign);
  $("mm-ee-v").textContent = fmtNum(eExp, 2);

  // ---- LEFT PANEL: Money Market ----
  // Money demand: i = scale / M (hyperbolic), Money supply: vertical at ms
  var cL = mkChart($("mm-money-chart"));
  var xR_m = [1, 13], yR_m = [0, 10];
  cL.axes("Real Money (M/P)", "Interest Rate i (%)");

  // Money demand curve
  var mdPts = linspace(2, 12.5, 60).map(function (m) { return [m, MM_MONEY_SCALE / m]; });
  cL.curve(mdPts, xR_m, yR_m, "#fb7185");
  cL.label(11, MM_MONEY_SCALE / 11, xR_m, yR_m, "L(i,\u0232)", "#fb7185", { dx: -50, dy: -14 });

  // Ghost money supply if shifted
  var msShifted = Math.abs(ms - MM_DEFAULT_MS) > 0.15;
  if (msShifted) {
    cL.vLine(MM_DEFAULT_MS, xR_m, yR_m, "#7dd3fc", { dash: true, op: 0.25, label: "Mˢ" });
    var oldI = MM_MONEY_SCALE / MM_DEFAULT_MS;
    cL.dot(MM_DEFAULT_MS, oldI, xR_m, yR_m, "#fbbf24", { r: 4, fill: "rgba(251,191,36,0.15)" });
  }

  // Current money supply
  cL.vLine(ms, xR_m, yR_m, "#7dd3fc", { label: msShifted ? "Mˢ'" : "Mˢ" });

  // Equilibrium interest rate
  var iStar = clamp(MM_MONEY_SCALE / ms, 0.5, 10);
  cL.dot(ms, iStar, xR_m, yR_m, "#fbbf24", { toAxes: true, label: "i", yLbl: fmtPct(iStar, 2) });

  // ---- RIGHT PANEL: FX Returns Diagram ----
  // X-axis: rates of return (%), Y-axis: Exchange rate E
  // Domestic return: vertical at i*
  // Foreign expected return: R_f(E) = iForeign + SENSITIVITY * (eExp - E)
  // Pre-compute equilibrium to center the dynamic y-axis
  var eStar = eExp - (iStar - iForeign) / MM_SENSITIVITY;
  var yMid = clamp(eStar, 0.8, 1.8);
  var cR = mkChart($("mm-returns-chart"));
  var xR_r = [0, 10], yR_r = [yMid - 0.35, yMid + 0.35];
  cR.axes("Rate of Return (%)", "CAD/USD (E)");

  // Foreign return curve - generate E values and compute R_f
  var frPts = linspace(yR_r[0], yR_r[1], 60).map(function (E) {
    var Rf = iForeign + MM_SENSITIVITY * (eExp - E);
    return [Rf, E];
  });
  // Filter to visible range
  frPts = frPts.filter(function (p) { return p[0] >= -1 && p[0] <= 11; });

  // Ghost foreign return if eExp or iForeign changed
  var fxShifted = Math.abs(iForeign - MM_DEFAULT_IF) > 0.15 || Math.abs(eExp - MM_DEFAULT_EE) > 0.015;
  if (fxShifted) {
    var ghostFr = linspace(yR_r[0], yR_r[1], 60).map(function (E) {
      return [MM_DEFAULT_IF + MM_SENSITIVITY * (MM_DEFAULT_EE - E), E];
    }).filter(function (p) { return p[0] >= -1 && p[0] <= 11; });
    cR.curve(ghostFr, xR_r, yR_r, "#34d399", { dash: true, op: 0.25 });
  }

  cR.curve(frPts, xR_r, yR_r, "#34d399");
  // Label foreign return curve
  var frLabelE = eExp - 0.05;
  var frLabelR = iForeign + MM_SENSITIVITY * 0.05;
  if (frLabelR > 0 && frLabelR < 10 && frLabelE > yR_r[0]) {
    cR.label(frLabelR, frLabelE, xR_r, yR_r, "R_USD", "#34d399", { dx: 6, dy: 12 });
  }

  // Ghost domestic return if ms changed
  if (msShifted) {
    var oldI_r = clamp(MM_MONEY_SCALE / MM_DEFAULT_MS, 0.5, 10);
    cR.vLine(oldI_r, xR_r, yR_r, "#7dd3fc", { dash: true, op: 0.25, label: "R_CAD" });
    // Old equilibrium
    var oldEStar = eExp - (oldI_r - iForeign) / MM_SENSITIVITY;
    if (oldEStar > yR_r[0] && oldEStar < yR_r[1]) {
      cR.dot(oldI_r, oldEStar, xR_r, yR_r, "#fbbf24", { r: 4, fill: "rgba(251,191,36,0.15)" });
    }
  }

  // Current domestic return
  cR.vLine(iStar, xR_r, yR_r, "#7dd3fc", { label: msShifted ? "R_CAD'" : "R_CAD" });

  // eStar already computed above for y-axis centering
  if (eStar > yR_r[0] && eStar < yR_r[1]) {
    cR.dot(iStar, eStar, xR_r, yR_r, "#fbbf24", { toAxes: true, label: "E*", yLbl: fmtNum(eStar, 3) });
  }

  $("mm-rate").textContent = fmtPct(iStar, 2);
  $("mm-exchange").textContent = fmtNum(eStar, 3);
}

/* =========================================================
   SECTION 3: INTEREST RATE PARITY
   ========================================================= */
var IRP_DEFAULT_IH = 2.25, IRP_DEFAULT_IF = 3.6, IRP_DEFAULT_EE = 1.37;
var IRP_SENSITIVITY = 71;

function updateParity() {
  var iHome = +$("irp-ih").value;
  var iForeign = +$("irp-if").value;
  var parityInput = +$("irp-ee").value;
  var isCip = state.parityMode === "cip";
  if (isCip) state.parityCipSpot = parityInput;
  else state.parityUipEe = parityInput;

  $("irp-ih-v").textContent = fmtPct(iHome, 2);
  $("irp-if-v").textContent = fmtPct(iForeign);
  $("irp-ee-v").textContent = fmtNum(parityInput, 2);
  $("irp-ee-label").textContent = isCip ? "Spot CAD/USD (S)" : "Expected Future CAD/USD (Eᵉ)";
  $("irp-eq-label").textContent = isCip ? "Spot Rate Input (S)" : "UIP Benchmark Spot (E*)";
  $("irp-diff-label").textContent = isCip ? "Forward Premium (F-S)/S" : "Rate Differential (BoC − Fed)";
  $("irp-fwd-label").textContent = isCip ? "1Y CIP Forward (F)" : "Expected CAD Change (UIP)";

  var c = mkChart($("irp-chart"));
  var diff = iHome - iForeign;

  if (isCip) {
    var spot = parityInput;
    var fwd = spot * (1 + iHome / 100) / (1 + iForeign / 100);
    var premium = (fwd / spot - 1) * 100;
    var yPad = Math.max(0.04, Math.abs(fwd - spot) * 1.8);
    var yR_cip = [Math.max(0.5, Math.min(spot, fwd) - yPad), Math.min(2.0, Math.max(spot, fwd) + yPad)];
    if (yR_cip[1] - yR_cip[0] < 0.12) {
      yR_cip[0] -= 0.06;
      yR_cip[1] += 0.06;
    }
    var xR_cip = [0, 3];
    c.axes("Contract", "CAD/USD");
    c.vLine(1, xR_cip, yR_cip, "#7dd3fc", { dash: true, op: 0.18 });
    c.vLine(2, xR_cip, yR_cip, "#34d399", { dash: true, op: 0.18 });
    c.dot(1, spot, xR_cip, yR_cip, "#7dd3fc", { toAxes: true, label: "S", xLbl: "Spot", yLbl: fmtNum(spot, 3) });
    c.dot(2, fwd, xR_cip, yR_cip, "#34d399", { toAxes: true, label: "F", xLbl: "Forward", yLbl: fmtNum(fwd, 3) });
    c.txt(c.W / 2, 18, "CIP: forward is pinned by today's spot and the rate gap", { fill: "#fbbf24", weight: 700, size: 13 });

    $("irp-eq-e").textContent = fmtNum(spot, 3);
    $("irp-diff").textContent = fmtPct(premium) + (premium < 0 ? " (USD fwd discount)" : " (USD fwd premium)");
    $("irp-fwd").textContent = fmtNum(fwd, 3);
    return;
  }

  var eExp = parityInput;
  var eStarUip = eExp - diff / IRP_SENSITIVITY;
  var yMid = clamp(eStarUip, 0.8, 1.8);
  var xR = [0, 12], yR = [yMid - 0.35, yMid + 0.35];
  c.axes("Rate of Return (%)", "CAD/USD (E)");

  // Foreign return curve: R_f(E) = iForeign + SENSITIVITY * (eExp - E)
  var frPts = linspace(yR[0], yR[1], 60).map(function (E) {
    return [iForeign + IRP_SENSITIVITY * (eExp - E), E];
  }).filter(function (p) { return p[0] >= -1 && p[0] <= 13; });

  var anyShift =
    Math.abs(iHome - IRP_DEFAULT_IH) > 0.1 ||
    Math.abs(iForeign - IRP_DEFAULT_IF) > 0.15 ||
    Math.abs(eExp - IRP_DEFAULT_EE) > 0.015;

  if (anyShift) {
    var ghostFr = linspace(yR[0], yR[1], 60).map(function (E) {
      return [IRP_DEFAULT_IF + IRP_SENSITIVITY * (IRP_DEFAULT_EE - E), E];
    }).filter(function (p) { return p[0] >= -1 && p[0] <= 13; });
    c.curve(ghostFr, xR, yR, "#34d399", { dash: true, op: 0.25 });
    c.vLine(IRP_DEFAULT_IH, xR, yR, "#7dd3fc", { dash: true, op: 0.25 });
    var ghostE = IRP_DEFAULT_EE - (IRP_DEFAULT_IH - IRP_DEFAULT_IF) / IRP_SENSITIVITY;
    if (ghostE > yR[0] && ghostE < yR[1]) {
      c.dot(IRP_DEFAULT_IH, ghostE, xR, yR, "#fbbf24", { r: 4, fill: "rgba(251,191,36,0.15)" });
    }
  }

  c.curve(frPts, xR, yR, "#34d399");
  c.vLine(iHome, xR, yR, "#7dd3fc", { label: "i_CAN" });

  var lE = eExp - 0.05;
  var lR = iForeign + IRP_SENSITIVITY * 0.05;
  if (lR > 0 && lR < 12 && lE > yR[0]) {
    c.label(lR, lE, xR, yR, "R_USD", "#34d399", { dx: 6, dy: 12 });
  }

  // eStarUip already computed above for y-axis centering
  if (eStarUip > yR[0] && eStarUip < yR[1]) {
    c.dot(iHome, eStarUip, xR, yR, "#fbbf24", { toAxes: true, label: "E*", yLbl: fmtNum(eStarUip, 3) });
  }

  $("irp-eq-e").textContent = fmtNum(eStarUip, 3);
  $("irp-diff").textContent = fmtNum(diff, 2) + "pp";
  $("irp-fwd").textContent = fmtPct(diff, 2) + (diff < 0 ? " (CAD exp. to appreciate)" : diff > 0 ? " (CAD exp. to depreciate)" : " (no expected change)");
}

/* =========================================================
   SECTION 4: PPP & LONG RUN
   ========================================================= */
function updatePpp() {
  var piHome = +$("ppp-pih").value;
  var piForeign = +$("ppp-pif").value;
  var startE = +$("ppp-s").value;
  $("ppp-pih-v").textContent = fmtPct(piHome);
  $("ppp-pif-v").textContent = fmtPct(piForeign);
  $("ppp-s-v").textContent = fmtNum(startE, 2);

  var gap = piHome - piForeign;

  var c = mkChart($("ppp-chart"));
  // Compute path
  var path = [];
  for (var t = 0; t <= 10; t++) {
    path.push([t, startE * Math.pow(1 + gap / 100, t)]);
  }

  var yMin = Math.min.apply(null, path.map(function (p) { return p[1]; })) - 0.1;
  var yMax = Math.max.apply(null, path.map(function (p) { return p[1]; })) + 0.1;
  // Ensure reasonable range
  if (yMax - yMin < 0.2) { yMin -= 0.1; yMax += 0.1; }

  var xR = [0, 10], yR = [yMin, yMax];
  c.axes("Years", "CAD/USD (E)");

  // Baseline reference (flat line at starting E)
  c.hLine(startE, xR, yR, "#9cb0d2", { dash: true, op: 0.3 });

  // PPP path
  c.curve(path, xR, yR, "#fbbf24");

  // Dots at key points
  c.dot(0, path[0][1], xR, yR, "#fbbf24", { r: 5, fill: "#fbbf24", label: fmtNum(path[0][1], 2), dx: 10, dy: -10 });
  c.dot(10, path[10][1], xR, yR, "#fbbf24", { r: 6, fill: "#fbbf24", label: fmtNum(path[10][1], 2), dx: -50, dy: -10 });

  // X-axis tick labels
  for (var t2 = 0; t2 <= 10; t2 += 2) {
    c.txt(c.sx(t2, 0, 10), c.H - c.m.b + 16, t2 + "Y", { size: 10 });
  }

  $("ppp-gap").textContent = fmtPct(gap);
  $("ppp-10y").textContent = fmtNum(path[10][1], 3);
}

/* =========================================================
   SECTION 5: BALANCE OF PAYMENTS
   ========================================================= */
function updateBop() {
  var nx = +$("bop-nx").value;
  var ip = +$("bop-ip").value;
  var dep = +$("bop-dep").value;
  $("bop-nx-v").textContent = fmtNum(nx, 1);
  $("bop-ip-v").textContent = fmtPct(ip);
  $("bop-dep-v").textContent = fmtNum(dep, 0) + "%";

  // ---- LEFT: Stylized external-balance bars ----
  // Keep the CA proxy tied to trade; show the rate gap separately as financing pressure.
  var ca = nx;
  var fa = -ca; // Offsetting net capital flow in this simplified sign convention.
  var financingPressure = ip <= -1.5 ? "High" : ip < -0.5 ? "Moderate" : "Low";
  var financingNote =
    ip <= -1.5 ? "Lower Canadian yields make external financing less comfortable" :
    ip < -0.5 ? "Rate gap is a mild financing headwind" :
    "Rate gap is not a financing headwind";

  var cL = mkChart($("bop-bars"));
  var barMax = Math.max(Math.abs(ca), Math.abs(fa), 3) + 1;
  var xR_b = [0, 4], yR_b = [-barMax, barMax];
  cL.axes("", "Balance");

  // Zero line
  cL.hLine(0, xR_b, yR_b, "#9cb0d2", { w: 1, dash: true, op: 0.3 });

  // CA bar
  var caX = 1.2, faX = 2.8, bw = 70;
  var caTop = cL.sy(Math.max(ca, 0), yR_b[0], yR_b[1]);
  var caBot = cL.sy(Math.min(ca, 0), yR_b[0], yR_b[1]);
  var caH = caBot - caTop;
  cL.svg.appendChild(cL.n("rect", { x: cL.sx(caX, xR_b[0], xR_b[1]) - bw / 2, y: caTop, width: bw, height: caH, rx: 8, fill: "#7dd3fc", opacity: 0.85 }));
  cL.txt(cL.sx(caX, xR_b[0], xR_b[1]), ca >= 0 ? caTop - 8 : caBot + 16, fmtNum(ca, 1), { fill: "#e8f0ff", weight: 700, size: 13 });
  cL.txt(cL.sx(caX, xR_b[0], xR_b[1]), cL.H - 10, "CA Proxy", { size: 11 });

  // FA bar
  var faTop = cL.sy(Math.max(fa, 0), yR_b[0], yR_b[1]);
  var faBot = cL.sy(Math.min(fa, 0), yR_b[0], yR_b[1]);
  var faH = faBot - faTop;
  cL.svg.appendChild(cL.n("rect", { x: cL.sx(faX, xR_b[0], xR_b[1]) - bw / 2, y: faTop, width: bw, height: faH, rx: 8, fill: "#c084fc", opacity: 0.85 }));
  cL.txt(cL.sx(faX, xR_b[0], xR_b[1]), fa >= 0 ? faTop - 8 : faBot + 16, fmtNum(fa, 1), { fill: "#e8f0ff", weight: 700, size: 13 });
  cL.txt(cL.sx(faX, xR_b[0], xR_b[1]), cL.H - 10, "Capital Flow", { size: 11 });

  // Stylized identity label
  cL.txt(cL.W / 2, 18, "Stylized offset: CA proxy + K = 0", { fill: "#fbbf24", weight: 700, size: 14 });
  cL.txt(cL.W / 2, 36, financingNote, { fill: "#9cb0d2", size: 11 });

  // ---- RIGHT: J-Curve ----
  var cR = mkChart($("bop-jcurve"));
  var xR_j = [0, 16], yR_j = [-4, 4];
  cR.axes("Quarters After Depreciation", "Trade Balance Change");

  // Zero line
  cR.hLine(0, xR_j, yR_j, "#9cb0d2", { w: 1, dash: true, op: 0.3 });

  // J-curve: initial worsening then improvement
  // TB(t) = dep * (-shortTerm * exp(-t/2) + longTerm * (1 - exp(-t/3)))
  var shortEffect = dep * 0.12;
  var longEffect = dep * 0.08;
  var jPts = linspace(0, 16, 80).map(function (t) {
    var tb = -shortEffect * Math.exp(-t / 2.5) + longEffect * (1 - Math.exp(-t / 4));
    return [t, tb];
  });

  // Scale to visible range
  cR.curve(jPts, xR_j, yR_j, "#fbbf24", { w: 3 });

  // Mark key points
  // Trough (minimum)
  var minPt = jPts.reduce(function (a, b) { return a[1] < b[1] ? a : b; });
  if (dep > 0) {
    cR.dot(minPt[0], minPt[1], xR_j, yR_j, "#fb7185", { r: 5, fill: "#fb7185", label: "Trough", dy: 16 });
  }

  // Breakeven point
  for (var k = 1; k < jPts.length; k++) {
    if (jPts[k - 1][1] < 0 && jPts[k][1] >= 0) {
      cR.dot(jPts[k][0], 0, xR_j, yR_j, "#34d399", { r: 5, fill: "#34d399", label: "Breakeven", dy: -14 });
      break;
    }
  }

  $("bop-ca").textContent = fmtNum(ca, 1);
  $("bop-fa").textContent = fmtNum(fa, 1);
  $("bop-pressure").textContent = financingPressure;
}

/* =========================================================
   SECTION 6: MUNDELL-FLEMING IS-LM-BP
   ========================================================= */
function updateMF() {
  var regime = state.mfRegime;
  var policy = state.mfPolicy;

  var c = mkChart($("mf-chart"));
  var xR = [100, 400], yR = [0, 10];
  c.axes("Output (Y)", "Interest Rate (i)");

  // Base parameters
  var isA = 7.6, isB = 0.02;   // IS: i = isA - isB*Y
  var lmA = -2.4, lmB = 0.03;  // LM: i = lmA + lmB*Y
  var iW = 3.60;               // World interest rate (≈ Fed funds rate)
  var shift = 2.5;

  // Base equilibrium
  var Y0 = (isA - lmA) / (isB + lmB); // 200
  var i0 = isA - isB * Y0;              // 4

  // Helper: generate IS or LM points
  function isPts(a) { return linspace(100, 400, 50).map(function (Y) { return [Y, a - isB * Y]; }); }
  function lmPts(a) { return linspace(100, 400, 50).map(function (Y) { return [Y, a + lmB * Y]; }); }

  // Determine scenario
  var shiftedIsA = isA, shiftedLmA = lmA;
  var finalIsA = isA, finalLmA = lmA;
  var Y_int, i_int, Y_final, i_final;
  var isShifts = false, lmShifts = false;
  var verdict, detail;

  if (policy === "fiscal") {
    shiftedIsA = isA + shift;
    Y_int = (shiftedIsA - lmA) / (isB + lmB);
    i_int = shiftedIsA - isB * Y_int;
    isShifts = true;

    if (regime === "floating") {
      finalIsA = isA;
      finalLmA = lmA;
      Y_final = Y0;
      i_final = i0;
      verdict = "WEAK IN TEXTBOOK CASE";
      detail = "Appreciation crowds out net exports → IS shifts back";
    } else {
      finalIsA = shiftedIsA;
      Y_final = (shiftedIsA - iW) / isB;
      finalLmA = iW - lmB * Y_final;
      i_final = iW;
      verdict = "STRONG IN TEXTBOOK CASE";
      detail = "CB accommodates to defend peg → LM also shifts right";
      lmShifts = true;
    }
  } else {
    shiftedLmA = lmA - shift;
    Y_int = (isA - shiftedLmA) / (isB + lmB);
    i_int = isA - isB * Y_int;
    lmShifts = true;

    if (regime === "floating") {
      finalLmA = shiftedLmA;
      Y_final = (iW - shiftedLmA) / lmB;
      finalIsA = iW + isB * Y_final;
      i_final = iW;
      verdict = "STRONG IN TEXTBOOK CASE";
      detail = "Depreciation boosts net exports → IS also shifts right";
      isShifts = true;
    } else {
      finalIsA = isA;
      finalLmA = lmA;
      Y_final = Y0;
      i_final = i0;
      verdict = "WEAK IN TEXTBOOK CASE";
      detail = "CB defends peg → LM shifts back to original";
    }
  }

  // ---- Draw BP line (always horizontal at world rate) ----
  c.hLine(iW, xR, yR, "#34d399", { w: 2, label: "BP" });

  // ---- Draw original IS and LM (dashed if they shifted) ----
  // IS
  if (finalIsA !== isA) {
    c.curve(isPts(isA), xR, yR, "#7dd3fc", { dash: true, op: 0.3 });
    c.label(120, isA - isB * 120, xR, yR, "IS", "#7dd3fc", { op: 0.4, dy: 0, dx: -35 });
  } else if (policy === "fiscal" && regime === "floating") {
    // Fiscal floating: IS shifts right then back - show the attempted shift dashed
    c.curve(isPts(shiftedIsA), xR, yR, "#7dd3fc", { dash: true, op: 0.35 });
    c.label(120, shiftedIsA - isB * 120, xR, yR, "IS'→", "#7dd3fc", { op: 0.5, dx: -45 });
  }

  if (finalLmA !== lmA) {
    c.curve(lmPts(lmA), xR, yR, "#c084fc", { dash: true, op: 0.3 });
    c.label(350, lmA + lmB * 350, xR, yR, "LM", "#c084fc", { op: 0.4, dx: 4 });
  } else if (policy === "monetary" && regime === "fixed") {
    // Monetary fixed: LM shifts then back - show attempted shift dashed
    c.curve(lmPts(shiftedLmA), xR, yR, "#c084fc", { dash: true, op: 0.35 });
    c.label(350, shiftedLmA + lmB * 350, xR, yR, "LM'→", "#c084fc", { op: 0.5, dx: 4 });
  }

  // ---- Draw final IS and LM (solid) ----
  c.curve(isPts(finalIsA), xR, yR, "#7dd3fc");
  c.curve(lmPts(finalLmA), xR, yR, "#c084fc");

  // Final IS label
  var isLabel = (finalIsA !== isA) ? "IS'" : "IS";
  c.label(120, finalIsA - isB * 120, xR, yR, isLabel, "#7dd3fc", { dx: -35, dy: 0 });

  // Final LM label
  var lmLabel = (finalLmA !== lmA) ? "LM'" : "LM";
  c.label(350, finalLmA + lmB * 350, xR, yR, lmLabel, "#c084fc", { dx: 4 });

  // ---- Draw intermediate shifted curve (if different from final) ----
  if (policy === "fiscal" && regime === "fixed") {
    // Show intermediate IS shift (before LM accommodates)
    c.curve(isPts(shiftedIsA), xR, yR, "#7dd3fc", { dash: true, op: 0.5 });
  }
  if (policy === "monetary" && regime === "floating") {
    // Show intermediate LM shift (before IS shifts)
    c.curve(lmPts(shiftedLmA), xR, yR, "#c084fc", { dash: true, op: 0.5 });
  }

  // ---- Draw equilibrium points ----
  // Original equilibrium (faded)
  c.dot(Y0, i0, xR, yR, "#9cb0d2", { r: 4, fill: "rgba(156,176,210,0.2)" });

  // Intermediate equilibrium (if different from both original and final)
  if (Y_int !== undefined && (Math.abs(Y_int - Y0) > 1 || Math.abs(i_int - i0) > 0.1)) {
    if (Math.abs(Y_int - Y_final) > 1 || Math.abs(i_int - i_final) > 0.1) {
      c.dot(Y_int, i_int, xR, yR, "#fb7185", { r: 4, label: "A", dx: 8, dy: -6 });
      // Arrow from intermediate to final
      var ax1 = c.sx(Y_int, xR[0], xR[1]);
      var ay1 = c.sy(i_int, yR[0], yR[1]);
      var ax2 = c.sx(Y_final, xR[0], xR[1]);
      var ay2 = c.sy(i_final, yR[0], yR[1]);
      // Dashed arrow
      c.svg.appendChild(c.n("line", { x1: ax1, y1: ay1, x2: ax2, y2: ay2, stroke: "#fbbf24", "stroke-width": 1.5, "stroke-dasharray": "4,4", opacity: 0.6 }));
    }
  }

  // Final equilibrium (solid, with dashed lines to axes)
  c.dot(Y_final, i_final, xR, yR, "#fbbf24", { r: 7, toAxes: true, label: "B", xLbl: "Y=" + fmtNum(Y_final, 0), yLbl: fmtPct(i_final) });

  // ---- Update metrics ----
  $("mf-verdict").textContent = verdict;
  $("mf-y").textContent = fmtNum(Y_final, 0);
  $("mf-i").textContent = fmtPct(i_final);
}

/* =========================================================
   SECTION 7: EXCHANGE RATE OVERSHOOTING
   ========================================================= */
function updateOvershoot() {
  var dm = +$("os-dm").value;
  var speed = +$("os-sp").value;
  $("os-dm-v").textContent = dm + "%";
  $("os-sp-v").textContent = fmtNum(speed, 2);

  var c = mkChart($("os-chart"));
  var xR = [0, 10], yR;

  // Index everything to 100
  var E_LR = 100 + dm;            // Long-run exchange rate (proportional to M)
  var overshoot = dm / speed;     // Overshoot amount
  var E_peak = E_LR + overshoot;  // Initial jump

  // E(t) = E_LR + overshoot * exp(-speed * t)
  // P(t) = 100 + dm * (1 - exp(-speed * t))
  // i(t) = 5 + i_drop * exp(-speed * t)  where i_drop ≈ -dm * 0.2

  var iBase = 5;
  var iDrop = -dm * 0.2;

  var ePts = linspace(0, 10, 80).map(function (t) { return [t, E_LR + overshoot * Math.exp(-speed * t)]; });
  var pPts = linspace(0, 10, 80).map(function (t) { return [t, 100 + dm * (1 - Math.exp(-speed * t))]; });

  // Compute y range to fit all curves
  var allVals = ePts.map(function (p) { return p[1]; }).concat(pPts.map(function (p) { return p[1]; }));
  var yLo = Math.min(98, Math.min.apply(null, allVals) - 2);
  var yHi = Math.max.apply(null, allVals) + 5;
  yR = [yLo, yHi];

  c.axes("Time (periods)", "Index (100 = initial)");

  // Long-run reference lines
  c.hLine(100, xR, yR, "#9cb0d2", { w: 1, dash: true, op: 0.2 });
  c.hLine(E_LR, xR, yR, "#9cb0d2", { w: 1, dash: true, op: 0.25 });
  c.txt(c.W - c.m.r - 4, c.sy(E_LR, yR[0], yR[1]) - 6, "Stylized long-run E & P", { size: 10, fill: "#9cb0d2", anchor: "end" });

  // E path (cyan) — overshoots then settles
  c.curve(ePts, xR, yR, "#7dd3fc", { w: 3 });
  c.label(0.3, ePts[0][1], xR, yR, "E(t)", "#7dd3fc", { dx: 10, dy: -12 });

  // P path (pink) — gradually rises
  c.curve(pPts, xR, yR, "#fb7185", { w: 3 });
  c.label(8, pPts[pPts.length - 5][1], xR, yR, "P(t)", "#fb7185", { dx: 10, dy: 12 });

  // Mark the overshoot point
  c.dot(0, E_peak, xR, yR, "#7dd3fc", { r: 6, fill: "#7dd3fc", label: "Overshoot: " + fmtNum(E_peak, 1), dx: 12, dy: -6 });

  // Mark convergence
  c.dot(10, ePts[ePts.length - 1][1], xR, yR, "#7dd3fc", { r: 4, fill: "#7dd3fc" });
  c.dot(10, pPts[pPts.length - 1][1], xR, yR, "#fb7185", { r: 4, fill: "#fb7185" });

  // Time axis labels
  for (var t = 0; t <= 10; t += 2) {
    c.txt(c.sx(t, 0, 10), c.H - c.m.b + 16, "" + t, { size: 10 });
  }

  $("os-jump").textContent = fmtNum(E_peak - 100, 1) + "% (overshoot: +" + fmtNum(overshoot, 1) + "%)";
  $("os-lr").textContent = "+" + fmtNum(dm, 0) + "%";
}

/* =========================================================
   SECTION 8: IMPOSSIBLE TRINITY (TRILEMMA)
   ========================================================= */
function updateTrilemma() {
  var scenario = state.trilemma;
  var svg = $("tri-chart");
  svg.innerHTML = "";
  var W = svg.viewBox.baseVal.width || 620;
  var H = svg.viewBox.baseVal.height || 380;

  function n(tag, a) {
    var el = document.createElementNS(NS, tag);
    if (a) for (var k in a) el.setAttribute(k, String(a[k]));
    return el;
  }
  function txt(x, y, s, a) {
    a = a || {};
    var t = n("text", { x: x, y: y, "text-anchor": a.anchor || "middle", fill: a.fill || "#9cb0d2", "font-size": a.size || 13, "font-weight": a.weight || "normal" });
    t.textContent = s;
    svg.appendChild(t);
  }

  var corners = {
    fixed:    { x: W / 2, y: 52, label: "Fixed Exchange Rate" },
    mobility: { x: 110, y: 300, label: "Free Capital Mobility" },
    autonomy: { x: W - 110, y: 300, label: "Monetary Independence" }
  };

  var activeEdges = {
    peg:      ["fixed", "mobility"],
    float:    ["mobility", "autonomy"],
    controls: ["fixed", "autonomy"]
  };

  var edges = [["fixed", "mobility"], ["mobility", "autonomy"], ["fixed", "autonomy"]];

  edges.forEach(function (edge) {
    var a = corners[edge[0]], b = corners[edge[1]];
    var active = activeEdges[scenario].indexOf(edge[0]) >= 0 && activeEdges[scenario].indexOf(edge[1]) >= 0;
    svg.appendChild(n("line", {
      x1: a.x, y1: a.y, x2: b.x, y2: b.y,
      stroke: active ? "#7dd3fc" : "rgba(156,176,210,0.2)",
      "stroke-width": active ? 6 : 3,
      "stroke-linecap": "round"
    }));
  });

  Object.keys(corners).forEach(function (key) {
    var c = corners[key];
    var active = activeEdges[scenario].indexOf(key) >= 0;
    svg.appendChild(n("circle", {
      cx: c.x, cy: c.y, r: active ? 20 : 14,
      fill: active ? "#7dd3fc" : "#09101c",
      stroke: active ? "#7dd3fc" : "rgba(156,176,210,0.4)",
      "stroke-width": active ? 4 : 2
    }));
    txt(c.x, key === "fixed" ? c.y - 28 : c.y + 36, c.label, {
      fill: active ? "#e8f0ff" : "#9cb0d2",
      weight: active ? "700" : "600"
    });
  });

  // Center text: what's sacrificed
  var sacrificed = {
    peg: "Sacrificed: Monetary independence — the CB must defend the peg",
    float: "Sacrificed: Fixed exchange rate — the currency floats freely",
    controls: "Sacrificed: Free capital mobility — controls restrict flows"
  };
  txt(W / 2, H / 2 + 20, sacrificed[scenario], { size: 12, fill: "#fbbf24" });

  // Summary
  var summaries = {
    peg: "Fixed rate + free capital movement: the central bank loses independent monetary policy. It must set rates to maintain the peg, not to manage the domestic economy. Examples: Hong Kong dollar board, Eurozone members, Denmark's peg to the euro.",
    float: "Free capital movement + independent monetary policy: the exchange rate must float. This is the choice of most advanced economies (US, Canada, UK, Japan, Australia). The currency absorbs external shocks.",
    controls: "Fixed rate + independent monetary policy: capital flows must be restricted. This creates room for domestic policy but at the cost of financial openness. Examples: China (historically), Malaysia during the 1998 Asian crisis, Iceland 2008-2017."
  };
  $("tri-summary").textContent = summaries[scenario];
}

/* =========================================================
   SECTION 9: CRISIS FEEDBACK LOOP
   ========================================================= */
function updateCrisis() {
  var fundShock = +$("cr-shock").value;
  var reserves = +$("cr-res").value;
  var fxDebt = +$("cr-debt").value;

  $("cr-shock-v").textContent = fundShock + " / 10";
  $("cr-res-v").textContent = reserves + " / 10";
  $("cr-debt-v").textContent = fxDebt + "%";

  var bondSell = Math.max(0, fundShock * 0.9 + fxDebt * 0.025);
  var yieldSpike = Math.max(0, bondSell * 0.7 - reserves * 0.18);
  var currStress = Math.max(0, fundShock * 0.8 + fxDebt * 0.03 - reserves * 0.28);
  var bsStress = Math.max(0, currStress * 0.65 + fxDebt * 0.028);

  var svg = $("cr-chart");
  svg.innerHTML = "";
  var W = svg.viewBox.baseVal.width || 960;
  var H = svg.viewBox.baseVal.height || 360;

  function n(tag, a) {
    var el = document.createElementNS(NS, tag);
    if (a) for (var k in a) el.setAttribute(k, String(a[k]));
    return el;
  }
  function txt(x, y, s, a) {
    a = a || {};
    var t = n("text", { x: x, y: y, "text-anchor": a.anchor || "middle", fill: a.fill || "#9cb0d2", "font-size": a.size || 12, "font-weight": a.weight || "normal" });
    t.textContent = s;
    svg.appendChild(t);
  }

  // Arrow marker
  var defs = n("defs");
  var marker = n("marker", { id: "crArrow", markerWidth: 10, markerHeight: 10, refX: 9, refY: 3, orient: "auto", markerUnits: "strokeWidth" });
  marker.appendChild(n("path", { d: "M0,0 L0,6 L9,3 z", fill: "rgba(156,176,210,0.5)" }));
  defs.appendChild(marker);
  svg.appendChild(defs);

  var nodes = [
    { x: 130, y: 110, label: "Funding shock", value: fundShock + "/10", color: "#fb7185" },
    { x: 370, y: 90,  label: "Deleveraging", value: fmtPct(bondSell), color: "#fbbf24" },
    { x: 620, y: 110, label: "Funding spread",  value: fmtPct(yieldSpike), color: "#7dd3fc" },
    { x: 790, y: 210, label: "FX stress", value: fmtPct(currStress), color: "#c084fc" },
    { x: 500, y: 260, label: "Balance-sheet stress", value: fmtPct(bsStress), color: "#34d399" },
    { x: 220, y: 245, label: "Liquidity backstop", value: reserves + "/10", color: "#60a5fa" }
  ];

  var edgeList = [
    [0, 1, "liquidity needs"], [1, 2, "spreads widen"],
    [2, 3, "higher return demanded"], [3, 4, "FX exposure bites"],
    [4, 1, "forced deleveraging"], [5, 3, "cushion or failure"]
  ];

  edgeList.forEach(function (e) {
    var s = nodes[e[0]], t = nodes[e[1]];
    svg.appendChild(n("line", { x1: s.x, y1: s.y, x2: t.x, y2: t.y, stroke: "rgba(156,176,210,0.3)", "stroke-width": 3, "marker-end": "url(#crArrow)" }));
    txt((s.x + t.x) / 2, (s.y + t.y) / 2 - 10, e[2]);
  });

  nodes.forEach(function (nd) {
    svg.appendChild(n("circle", { cx: nd.x, cy: nd.y, r: 42, fill: nd.color, opacity: 0.14 }));
    svg.appendChild(n("circle", { cx: nd.x, cy: nd.y, r: 32, fill: "#09101c", stroke: nd.color, "stroke-width": 3 }));
    txt(nd.x, nd.y - 4, nd.label, { fill: "#e8f0ff", weight: 700, size: 11 });
    txt(nd.x, nd.y + 14, nd.value, { fill: nd.color, weight: 700, size: 12 });
  });

  var severity = Math.max(0, yieldSpike + currStress + bsStress);
  var tone = severity < 6 ? "contained" : severity < 10 ? "fragile" : "crisis-like";
  var coreSummary;
  if (severity === 0) {
    coreSummary = "No material funding, FX or balance-sheet stress appears in this calibration.";
  } else {
    coreSummary = "Funding shock " + fundShock + "/10 with " + fxDebt + "% net FX exposure generates measurable funding and balance-sheet stress.";
  }
  $("cr-summary").textContent =
    "Scenario looks " + tone + ". " + coreSummary + " Liquidity backstop credibility at " + reserves +
    "/10 " + (reserves >= 6 ? "provides a buffer" : "is insufficient to break the loop") +
    ". The FX-exposure slider compresses hedging gaps, rollover risk and USD funding dependence into one teaching number rather than a literal stock of unhedged debt.";
}

/* =========================================================
   MASTER UPDATE & EVENT WIRING
   ========================================================= */
function updateAll() {
  updateFxMarket();
  updateMoneyFx();
  updateParity();
  updatePpp();
  updateBop();
  updateMF();
  updateOvershoot();
  updateTrilemma();
  updateCrisis();
}

// Wire all slider inputs
[
  "fx-d-shift", "fx-s-shift",
  "mm-ms", "mm-if", "mm-ee",
  "irp-ih", "irp-if", "irp-ee",
  "ppp-pih", "ppp-pif", "ppp-s",
  "bop-nx", "bop-ip", "bop-dep",
  "os-dm", "os-sp",
  "cr-shock", "cr-res", "cr-debt"
].forEach(function (id) {
  $(id).addEventListener("input", updateAll);
});

// Toggle: Parity mode
$("irp-uip").addEventListener("click", function () {
  state.parityMode = "uip";
  $("irp-ee").value = state.parityUipEe;
  $("irp-uip").classList.add("is-active");
  $("irp-cip").classList.remove("is-active");
  updateParity();
});
$("irp-cip").addEventListener("click", function () {
  state.parityMode = "cip";
  $("irp-ee").value = state.parityCipSpot;
  $("irp-cip").classList.add("is-active");
  $("irp-uip").classList.remove("is-active");
  updateParity();
});

// Toggle: MF Regime
$("mf-floating").addEventListener("click", function () {
  state.mfRegime = "floating";
  $("mf-floating").classList.add("is-active");
  $("mf-fixed").classList.remove("is-active");
  updateMF();
});
$("mf-fixed").addEventListener("click", function () {
  state.mfRegime = "fixed";
  $("mf-fixed").classList.add("is-active");
  $("mf-floating").classList.remove("is-active");
  updateMF();
});

// Toggle: MF Policy
$("mf-monetary").addEventListener("click", function () {
  state.mfPolicy = "monetary";
  $("mf-monetary").classList.add("is-active");
  $("mf-fiscal").classList.remove("is-active");
  updateMF();
});
$("mf-fiscal").addEventListener("click", function () {
  state.mfPolicy = "fiscal";
  $("mf-fiscal").classList.add("is-active");
  $("mf-monetary").classList.remove("is-active");
  updateMF();
});

// Toggle: Trilemma
$("tri-peg").addEventListener("click", function () {
  state.trilemma = "peg";
  $("tri-peg").classList.add("is-active");
  $("tri-float").classList.remove("is-active");
  $("tri-controls").classList.remove("is-active");
  updateTrilemma();
});
$("tri-float").addEventListener("click", function () {
  state.trilemma = "float";
  $("tri-float").classList.add("is-active");
  $("tri-peg").classList.remove("is-active");
  $("tri-controls").classList.remove("is-active");
  updateTrilemma();
});
$("tri-controls").addEventListener("click", function () {
  state.trilemma = "controls";
  $("tri-controls").classList.add("is-active");
  $("tri-peg").classList.remove("is-active");
  $("tri-float").classList.remove("is-active");
  updateTrilemma();
});

// Boot
updateAll();
