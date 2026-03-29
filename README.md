# International Capital Markets — Interactive Guide

An interactive, client-side reference for university-level international economics and finance. Every section uses **Canada 🇨🇦 as the domestic country** and the **USA 🇺🇸 as the foreign country**, with slider defaults calibrated to approximately March 2026 official releases. Textbook diagrams are presented as teaching benchmarks, not as fitted forecasts.

**Live site:** [Deployed on Vercel]

---

## Sections

| # | Section | Key Concept |
|---|---------|-------------|
| 1 | FX Market | Supply & demand for CAD/USD |
| 2 | Money → Interest Rates → FX | Two-panel monetary transmission |
| 3 | Interest Rate Parity (UIP / CIP) | Arbitrage equilibrium |
| 4 | Purchasing Power Parity | Long-run inflation anchor |
| 5 | Balance of Payments | Stylized current-account proxy; J-curve |
| 6 | Mundell-Fleming (IS-LM-BP) | Policy effectiveness under floating vs fixed |
| 7 | Overshooting | Dornbusch sticky-price dynamics |
| 8 | Impossible Trinity | Trilemma regime choice |
| 9 | Currency Crises | Funding and liquidity stress feedback loops |
| 10 | Synthesis | Full Canada–US macro chain |

## Current-Events Case Studies

Each section includes a **🔬 Try This** walkthrough referencing:
- **US tariffs and trade-policy uncertainty** — export, investment and CAD pressure
- **Middle East energy volatility** — terms-of-trade gains versus risk-off USD demand
- **Household and mortgage strain** — growth and policy-rate sensitivity
- **Non-bank / private-credit repricing** — funding and liquidity channels
- **LNG diversification** — medium-term export upside

## Reference Data

[`canada-usa-reference.md`](canada-usa-reference.md) contains the full economic data snapshot, interpretation caveats, source notes and section-by-section slider mappings used to calibrate the defaults.

## Stack

- Pure HTML / CSS / JavaScript — no framework, no build step
- SVG charts rendered client-side via a custom `mkChart()` factory
- Deployed as a static site on [Vercel](https://vercel.com)

## Conceptual Sources

Krugman & Obstfeld *International Economics*, Mundell-Fleming model, Dornbusch (1976) overshooting.
