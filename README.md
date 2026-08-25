# LEGO 2026 Retirement Tracker

Live site: https://hotteacup-rgb.github.io/lego-retirement-tracker/

A visual U.S. retirement-and-buying decision tracker for LEGO sets currently expected to retire during 2026. The default catalog remains ordered by retirement timing and grouped by theme, with an image and decision card for every tracked set.

## Decision features

- Retirement month, target date and countdown
- 0–100 Buy Priority Score
- Separate price-quality, collector-demand, supply/sellout-risk and post-retirement-outlook scores
- Best Deals, Buy Immediately, Retiring Next and Appreciation Candidate dashboard sections
- Clearance + Retiring within 90 days view
- Personal browser watchlist stored locally on the device
- Sort by retirement, discount, buy score, popularity, appreciation outlook and current price
- Mobile-first collapsed cards with the image, countdown, score and winning retailer price visible immediately
- Historical low, current-vs-low gap and best verified discount
- Retirement-date change warnings when a tracked date moves
- Per-price last-checked display and stock-status field
- Retirement evidence section that only reports exact source agreement when it has actually been stored
- Winning-retailer shopping button; the card still shows only the cheapest qualifying verified retailer

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

## Scoring caveat

Buy Priority and post-retirement outlook scores are decision aids built from retirement urgency, verified price quality, popularity and appreciation context. They are not guarantees of future resale value. The tracker deliberately labels missing retailer history, stock timestamps and per-set source agreement as unverified instead of fabricating data.

## Maintenance

The site is split into maintainable HTML/CSS/JS files, compressed catalog chunks, metadata corrections, retirement removals/change history and a separate verified-price patch layer. The deployment workflow validates the catalog before publishing.