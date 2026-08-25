# LEGO 2026 Retirement Tracker

Live site: https://hotteacup-rgb.github.io/lego-retirement-tracker/

A visual U.S. tracker for LEGO sets currently expected to retire during 2026. The catalog is ordered by retirement timing and grouped by theme, with an image and decision card for every tracked set.

## What each card tracks

- Set number, name, theme and image
- Current expected retirement date and confidence
- LEGO U.S. MSRP
- Cheapest currently verified qualifying retailer price
- Historical verified low when available
- Popularity and post-retirement appreciation potential
- Retirement risk, target buy price and BUY / WATCH / WAIT guidance

## Retail-price rules

Current prices are checked across LEGO, Target, Best Buy, Barnes & Noble, Amazon, Walmart and additional legitimate retailers where applicable. Only the cheapest qualifying verified retailer is displayed on the card.

- Amazon only qualifies when the item is sold by Amazon.com and shipped by Amazon.
- Walmart only qualifies when the item is sold and shipped by Walmart.com.
- Third-party marketplace sellers, used/open-box sets, rewards-point values and obvious pricing errors are excluded.
- A price is not labeled a sale unless it is actually below MSRP.
- If a current retailer winner cannot be directly verified, the tracker says `Not verified today` rather than estimating.

## Research sources

The tracker intentionally uses multiple independent sources rather than relying on one retirement database. Source groups currently include LEGO.com U.S., Brick Domain, Brick Fanatics, Brickset, BrickEconomy, Toys N Bricks, Master the Bricks, Brick Scouts, Team Bricks, Jay's Brick Blog, Brick Ranker, Brick Sleuth, Brickfall, Amazon, Walmart, Target, Best Buy, Barnes & Noble, Macy's, GameStop, Costco, Sam's Club, BrickLink and PriceCharting.

LEGO's own U.S. store is weighted highest for official MSRP, availability and Retiring Soon / Last Chance status. Future retirement dates can change, so fan/community retirement calendars are cross-referenced and treated as current estimates rather than immutable official dates.

## Maintenance

The site is split into maintainable HTML/CSS/JS files, compressed catalog chunks, metadata corrections and a separate verified-price patch layer. This allows retirement-date or retailer-price updates without rebuilding the whole catalog.