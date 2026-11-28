# LUNA FX Intelligence

A read-only EURUSD market-analysis dashboard using Deriv's public market-data feed.

## Dashboard features

- Live EURUSD public tick and recent candlestick history
- EMA 20/50 and RSI 14 indicators
- Swing-confirmed support and resistance, higher highs/lows and lower highs/lows
- Close-confirmed Break of Structure (BOS) and Change of Character (CHoCH)
- Market-structure context across M1, M5, M15 and H1
- Manual MT5 Bid/Ask snapshot comparison
- Feed connection diagnostics

## Support and resistance interpretation

Support and resistance zones are grouped from confirmed swing highs and lows in recent candles. The dashboard reports how many historical touches contribute to each zone and how far the zone is from the latest close. The strength label is descriptive of those historical touches; it is not a probability, forecast, or trade signal.

## Timestamp conventions

Deriv tick timestamps are Unix epoch values and are treated as UTC. The dashboard displays each incoming tick in both:

- **Lagos local time (WAT, Africa/Lagos)**
- **UTC**

The feed diagnostics also show the browser's Lagos clock and the age of the latest tick relative to the device clock. A negative age is surfaced as a possible device-clock offset; check the device's automatic date, time and time-zone settings before interpreting that warning as a feed issue.

## Safety

This dashboard is informational and read-only. It does not request an MT5 login, password, API token or account access, and it cannot place trades or access trading funds. Public-feed quotes may differ from MT5 because of feed source, spread and timing.
