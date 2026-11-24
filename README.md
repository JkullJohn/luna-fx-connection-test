# LUNA FX Intelligence

A read-only EURUSD market-analysis dashboard using Deriv's public market-data feed.

## Dashboard features

- Live EURUSD public tick and recent candlestick history
- EMA 20/50 and RSI 14 indicators
- Short-term market structure and multi-timeframe context
- Manual MT5 Bid/Ask snapshot comparison
- Feed connection diagnostics

## Timestamp conventions

Deriv tick timestamps are Unix epoch values and are treated as UTC. The dashboard displays each incoming tick in both:

- **Lagos local time (WAT, Africa/Lagos)**
- **UTC**

The feed diagnostics also show the browser's Lagos clock and the age of the latest tick relative to the device clock. A negative age is surfaced as a possible device-clock offset; check the device's automatic date, time and time-zone settings before interpreting that warning as a feed issue.

## Safety

This dashboard is informational and read-only. It does not request an MT5 login, password, API token or account access, and it cannot place trades or access trading funds. Public-feed quotes may differ from MT5 because of feed source, spread and timing.
