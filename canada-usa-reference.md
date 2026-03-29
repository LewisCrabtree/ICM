# Canada-USA Reference Snapshot

Refreshed: March 29, 2026

This file documents the data anchors used in the site after the late-March 2026 refresh. The guide is still a teaching tool, not a live model, so some schematic sections round or simplify the source values for readability.

## Current Snapshot

- Bank of Canada policy rate: `2.25%`
  Source: Bank of Canada policy decision, March 18, 2026
- Federal Reserve target range: `3.50% to 3.75%`
  Source: Federal Reserve implementation note, March 18, 2026
- Canada CPI, February 2026: `1.8% y/y`
- Canada CPI excluding indirect taxes, February 2026: `1.9% y/y`
  Source: Statistics Canada CPI release, March 16, 2026
- U.S. CPI, February 2026: `2.4% y/y`
  Source: BLS CPI release, March 11, 2026
- Canada unemployment rate, February 2026: `6.7%`
  Source: Statistics Canada Labour Force Survey, March 13, 2026
- USD/CAD: `1.3844`
- Government of Canada 5Y benchmark yield: `3.19%`
- U.S. 5Y Treasury yield: `4.08%`
  Source: market-close data for March 26, 2026, using the latest common close available across the Bank of Canada and U.S. Treasury sources when this file was refreshed
- Canada's current account balance, Q4 2025: `-C$0.7 billion`
- Canada's 2025 current account balance: `-C$30.4 billion`
  Source: Statistics Canada balance of payments release, February 26, 2026
- Canada's net international investment position, Q4 2025: `+C$1,801.1 billion`
  Source: Statistics Canada international investment position release, March 13, 2026

## How The Site Uses These Values

- Sections 1-3 use the current policy-rate backdrop and a rounded spot range near `1.38-1.39` as teaching defaults.
- The Fed slider uses `3.6%` as a rounded midpoint proxy for the `3.50%-3.75%` target range.
- Section 5 PPP uses Canada CPI `1.8%`, U.S. CPI `2.4%`, and a rounded starting spot of `1.38`.
- Sections 12-18 use the late-March market anchors more directly:
  - USD/CAD `1.3844`
  - U.S. 5Y Treasury `4.08%`
  - GoC 5Y benchmark `3.19%`

## Important Caveats

- Canada's February 2026 headline CPI was temporarily lowered by the GST/HST base-year effect. The tax-adjusted measure was `1.9%`, not `1.8%`.
- PPP is shown as a rough long-run directional anchor, not a fair-value model.
- UIP and CIP are benchmark pricing conditions. They are not treated here as high-frequency forecasting tools.
- The balance-of-payments section simplifies external adjustment into a trade proxy plus financing flow. It does not reproduce the full current account.
- Canada's NIIP is currently positive, so the site should not describe Canada as a net foreign debtor in the current snapshot.

## Official Sources

- Bank of Canada policy decision, March 18, 2026:
  `https://www.bankofcanada.ca/2026/03/fad-press-release-2026-03-18/`
- Federal Reserve implementation note, March 18, 2026:
  `https://www.federalreserve.gov/monetarypolicy/files/monetary20260318a1.pdf`
- Statistics Canada CPI, February 2026:
  `https://www150.statcan.gc.ca/n1/daily-quotidien/260316/dq260316a-eng.htm`
- BLS CPI, February 2026:
  `https://www.bls.gov/news.release/pdf/cpi.pdf`
- Statistics Canada Labour Force Survey, February 2026:
  `https://www150.statcan.gc.ca/n1/daily-quotidien/260313/dq260313a-eng.htm`
- Statistics Canada balance of payments, fourth quarter 2025:
  `https://www150.statcan.gc.ca/n1/daily-quotidien/260226/dq260226a-eng.htm`
- Statistics Canada international investment position, fourth quarter 2025:
  `https://www150.statcan.gc.ca/n1/daily-quotidien/260313/dq260313b-eng.htm`
- Bank of Canada USD/CAD daily exchange rate:
  `https://www.bankofcanada.ca/valet/observations/FXUSDCAD/json?start_date=2026-03-26&end_date=2026-03-26`
- Bank of Canada 5Y benchmark yield lookup:
  `https://www.bankofcanada.ca/stats/results/csv?rangeType=dates&lP=lookup_bond_yields.php&sR=2016-03-29&se=L_V39053&dF=2026-03-20&dT=2026-03-29`
- U.S. Treasury daily par yield curve rates:
  `https://home.treasury.gov/resource-center/data-chart-center/interest-rates/TextView?field_tdr_date_value=202603&type=daily_treasury_yield_curve`
