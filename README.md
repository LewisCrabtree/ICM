# International Capital Markets — Interactive Guide

An interactive, client-side reference for university-level international economics and finance. Every section uses **Canada 🇨🇦 as the domestic country** and the **USA 🇺🇸 as the foreign country**, with slider defaults calibrated to approximately March 2026 values.

**Live site:** [Deployed on Vercel]

---

## Sections

| # | Section | Key Concept |
|---|---------|-------------|
| 1 | FX Market | Supply & demand for CAD/USD |
| 2 | Money → Interest Rates → FX | Two-panel monetary transmission |
| 3 | Interest Rate Parity (UIP / CIP) | Arbitrage equilibrium |
| 4 | Purchasing Power Parity | Long-run inflation anchor |
| 5 | Balance of Payments | CA + FA = 0 identity; J-curve |
| 6 | Mundell-Fleming (IS-LM-BP) | Policy effectiveness under floating vs fixed |
| 7 | Overshooting | Dornbusch sticky-price dynamics |
| 8 | Impossible Trinity | Trilemma regime choice |
| 9 | Currency Crises | Feedback loop mechanics |
| 10 | Synthesis | Full Canada–US macro chain |

## Current-Events Case Studies

Each section includes a **🔬 Try This** walkthrough referencing:
- **BoC vs Fed divergence** — 175bp gap driving CAD weakness
- **Iran war / oil shock** — commodity terms-of-trade effects
- **AI bubble concerns** — risk-off capital flow dynamics
- **Private credit unwind** — shadow banking feedback loops
- **US tariff threats** — trade balance and exchange rate response

## Reference Data

[`canada-usa-reference.md`](canada-usa-reference.md) contains the full economic data snapshot (rates, inflation, FX, debt exposure) and section-by-section slider mappings used to calibrate the defaults.

## Stack

- Pure HTML / CSS / JavaScript — no framework, no build step
- SVG charts rendered client-side via a custom `mkChart()` factory
- Deployed as a static site on [Vercel](https://vercel.com)

## Conceptual Sources

Krugman & Obstfeld *International Economics*, Mundell-Fleming model, Dornbusch (1976) overshooting.
