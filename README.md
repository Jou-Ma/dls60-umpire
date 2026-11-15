DLS 6.0 Umpire Calculator – private validation build
A responsive, offline-first Progressive Web App (PWA) for local DLS scenario calculations. The supplied original `DLS60.jar` is not redistributed in this project. `engine.js` is a JavaScript port of the model calculations reconstructed from the user-supplied JAR bytecode.
Current functionality
Match selector matching the DLS 6.0 desktop application: ODI (50 overs; 20-over minimum), Twenty20 (20 overs; 5-over minimum), Other presets (50/10, 45/20, 40/10) and custom settings.
First- and second-innings inputs.
Automatic second-innings overs allocation from the first-innings overs lost, with manual override. Partial overs are retained in cricket notation, e.g. a 50-over match losing 4.0 and 2.3 overs allocates 43.3 overs to the chase.
Explicit, always-visible labels and examples on every interruption field, including on narrow phone screens.
Chronological interruption-event rows for both innings.
Overs bowled entered in cricket notation (`17.3` = 17 overs and 3 balls).
Individual overs-lost entries, including `A`/`a` for all remaining overs at that event after earlier event losses.
Revised second-innings target, fitted lambda and adjustment factor.
Over-by-over par-score table (0–9 wickets).
Ball-by-ball par-score table (0–9 wickets).
CSV export of either table.
Local saved matches, JSON export/import.
PWA shell caching for offline operation after the first successful online visit/install.
No login, remote API, analytics or cloud database.
Run locally for development
Requires Node.js only for the test command. To preview the PWA, serve the directory over HTTP:
```bash
python -m http.server 8080
```
Then open `http://localhost:8080` in a modern browser. Service workers are supported on localhost. For phones and tablets, deploy the static files to an HTTPS origin, open the app once while online, then use the browser's Add to Home Screen / Install action. After the app shell is cached, the app and calculation engine run locally without a network connection.
Tests
```bash
npm test
```
The regression set currently includes 10 reference match scenarios checked against the original JAR, overs-and-balls notation checks, `A` overs-loss parsing, terminal-row rounding, and reference par-table checks. A two-interruption-per-innings comparison was also made against the JAR for every cell in:
41 over-by-over rows (10 wicket columns each)
241 ball-by-ball rows (10 wicket columns each)
No cell mismatches were found in that comparison.
These are targeted reference tests, not an exhaustive proof across every possible score, overs limit, wicket state, event ordering or competition condition. The app should remain a validation build until further scenario coverage and user acceptance testing are completed.
Important DLS and licensing note
DLS is proprietary. This is a privately prepared validation tool based on the user's supplied DLS 6.0 application. It is not an ICC product, not certified or endorsed by the ICC, and does not grant rights to redistribute DLS software, tables or derived implementations. Confirm applicable permissions before sharing this build or its calculation engine with colleagues.
For official match decisions, cross-check with the authorised DLS application and the competition's playing conditions until this implementation has completed the required validation and permissions review.
Install for offline use
The PWA must first be served from `localhost` or an HTTPS website so the browser can install its service worker. Once installed and opened successfully online, its app shell and calculation engine are cached on the device.
Android / Chrome: open the HTTPS app URL, choose Install app or Add to Home screen.
iPhone / Safari: open the HTTPS app URL, tap Share, then Add to Home Screen.
Windows / Edge or Chrome: open the HTTPS app URL and choose the browser's Install option.
Open the installed app once while online, then test it in airplane mode before relying on it at a match venue. Clearing the browser's site data can remove the offline cache and locally saved matches.

Version 0.3.0 additions
ODI minimum overs defaults to 20 per side (locked by format).
T20 minimum overs defaults to 5 per side (locked by format).
Other preset and custom match types expose an editable minimum-overs field.
The chase allocation is checked after second-innings interruptions. If the available chase overs are below the selected minimum, the calculation is marked NO RESULT; a theoretical DLS target and par tables remain visible for reference.
The printable DLS match report is gated until the chasing team's final score reaches the calculated target and the minimum-overs rule is satisfied.
Report output includes match metadata, both innings' interruption records, DLS target, lambda, adjustment factor, and the chasing team's final score.
