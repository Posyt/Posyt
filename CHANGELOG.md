## v1.0
After a much too long hiatus we're back!

- New app icon!
- Brand new simplified design with more gesture support
- Complete rebuild from scratch: faster, easier to use, prettier?
- Simplified signup with phone or facebook
- Massively simplified swiping
  - Time to first swipe is < 30 seconds
  - No need to write a posyt before you can swipe
  - Swiping backed by powerful search engine for incredible speed and relevance based on the posyts you write
- NEWS FEEDS!
  - Medium, Hacker News, Imgur, Product Hunt, The Verge, New York Times, Dribbble, and more to come!
  - Toggle specific news feeds on and off. Toggle them all off if you only want to see posyts
  - Swipe news just like posyts and get matched on shared news interests!
- Tap to expand images and open articles in web browser
- Simple posyt page
  - This got a facelift, but otherwise did not change much
  - You have 200 characters to share an idea
  - Once it's shared it flys anonymously off into the interest graph
  - If someone likes your posyt then you have a higher chance of matching
- Points
  - Points give your posyts a boost the first few hours after you share them
  - Writing posyts gives you points
  - Getting likes on the posyts you write gives you points
  - Getting reports on the posyts your write LOOSES you points, so don't write spam or clickbait
- Sharing via web and deeplink!
  - All articles and posyts have a corresponding webpage that will deeplink into the app
  - Swipe up to share
- More advanced matching algorithm backed by graph database
  - Our goal is to provide highly relevant matches with limited noise. This means we have to filter through all possible matches on every swipe and only return the best one. Posyt can now sift through that interest graph in he time it takes you to swipe.
  - Only return the most relevant person or no one at all
  - No more than 1 match per swipe
- Improved chat
  - Delivered and read receipts
  - Green online dot
  - Improved chat UI
  - Posyts and news articles inlined in chat history
    - Links open in browser when tapped

If you like the new update please support Posyt by leaving a rating in the App Store.


## v1.0.1
- Update App Store icon


## v1.0.2
- Change minimum iOS version from 9.3 to 9.0
- Fix phone login
### internal
- update codepush to v1.16.1-beta
- add Staging build for easy switching between Debug, Release, and Staging env vars
- add bugsnag
- add sentry


## v1.0.3
- Login bug fix
- Add a switch to toggle all feeds on/off
### internal
- change codepush installMode


## v1.0.5
### internal
- codepush seems to be fixed in production. TestFlight gets production codepush updates


## v1.0.6
- add shortcut to settings dialog: swipe offscreen beyond the cards and conversations tabs
