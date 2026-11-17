# DLS 6.0 Umpire Calculator — Version 2.0

**Release:** Version 2.0  
**Included build:** 1.0.0  
**Calculation model:** DLS 6.0  
**Application type:** Offline-first Progressive Web App (PWA)

A responsive umpire calculator for DLS 6.0 match scenarios. The application runs its calculations locally in the browser and can be installed on supported desktop and mobile devices.

## Version 2.0 release scope

Version 2.0 builds on the Version 1.0 DLS calculator and adds the Appendix A umpire calculation worksheets described below. The DLS calculation engine remains based on the previously released Build 0.5.4 baseline; this release does not claim exhaustive validation of every possible DLS input combination.

### Calculator
- Match selector for ODI, T20, Other presets and Custom match formats.
- First- and second-innings interruption inputs, supporting multiple events in chronological order.
- Cricket overs notation (for example, `17.3` means 17 overs and 3 balls).
- Automatic second-innings overs allocation from first-innings interruption losses, with a manual override.
- Minimum-overs settings and No Result handling.
- Revised target, lambda and adjustment-factor outputs.
- Over-by-over and ball-by-ball par-score tables for 0–9 wickets.
- CSV export of the displayed par-score table.

### Match reports and records
- DLS match report generation for different match outcomes.
- Optional match metadata and capturer details.
- Local match saving in the current browser/device.
- JSON export and import of match records.
- Optional upload of saved match records to the separately configured private archive.
- Offline upload queue and manual Sync now action; pending records can upload when connectivity returns.

### Installation and offline use
The application is hosted at:

https://jou-ma.github.io/dls60-umpire/

- Android / Chrome: open the app and choose Install app or Add to Home screen.
- iPhone / iPad: open the app in Safari, tap Share, then Add to Home Screen.
- Windows / supported desktop browsers: use the browser's Install option when available.

Open the app online at least once so the service worker can cache the application shell. Test offline operation on the device before relying on it at a match venue. Clearing browser site data can remove the offline cache and locally saved matches.

Saved matches are device/browser-local unless uploaded to the separately configured private archive. Installing the PWA on another device does not automatically transfer local records.

## Appendix A — umpire calculation worksheets

The application provides three top-level tabs: **DLS 6.0**, **Appendix A** and **Help**. Appendix A contains four linked worksheets:

- **Table 1:** first-innings delay/interruption and revised playing time, overs and cessation times.
- **Table 2:** restart/cut-off comparison to determine whether the first innings can continue or should be terminated.
- **Table 3:** second-innings allocation and scheduled cessation following first-innings termination.
- **Table 4:** second-innings interruption, elapsed time, overs lost and amended cessation. A restart time earlier than the interruption start is rejected and dependent outputs are cleared.

The competition selector is mandatory before any worksheet values can be entered. The configured time-per-over values are T20 (4.25 minutes), Promotion League 45 (3.75), Women's League 35 (3.75), Women's T20 (3.75) and Men's Premier League (4.2). **Other** requires a valid positive custom value.

Appendix A also provides a bowling-restriction lookup and separate Powerplay 1, Powerplay 2 and Powerplay 3 outputs. Competition-specific allocations are used where supplied, including shortened-innings Men's Premier League allocations. Confirm the relevant competition playing conditions before use.

Recommencement Settings and Recommencement Scenarios are deferred and are not included in Version 2.0.

## Validation summary

The DLS engine baseline (Build 0.5.4, included in Version 1.0) was tested by the project owner against selected outputs from the supplied official DLS 6.0 application/JAR. Appendix A was separately tested manually in Development before promotion to Version 2.0.

Recorded checks include:
- Ten reference target scenarios.
- A multiple-interruption comparison covering 41 over-by-over rows and 241 ball-by-ball rows, with no mismatches recorded in that comparison.
- A later comparison of 117 ball-by-ball rows across 10 wicket columns (1,170 numerical values) for a custom 60-over scenario with a second-innings interruption; no discrepancies were observed in the supplied comparison.
- Additional T20, 50-over and custom 60-over scenarios, including the zero-resource interruption case that previously caused a `NaN` adjustment factor. The guard for that case was added in Build 0.5.4 and the user reported successful retesting.

These are targeted comparisons and user tests, not an exhaustive proof across every possible score, overs limit, wicket state, event ordering, competition condition or device/browser combination. Continue to cross-check official match decisions with the authorised DLS application and the applicable playing conditions.

## Development and test locally

Requires Node.js for the test command. To preview the PWA, serve the directory over HTTP:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080` in a modern browser. Service workers are supported on localhost.

Run the available regression tests with:

```bash
npm test
```

The recorded regression set includes 10 reference match scenarios, overs-and-balls notation checks, `A` overs-loss parsing, terminal-row rounding and reference par-table checks. The historical build record contains additional manual comparisons.

## Important DLS and licensing notice

DLS is proprietary. This is an independent application developed using a JavaScript implementation reconstructed and tested against outputs from a DLS 6.0 application supplied by the project owner. The supplied original `DLS60.jar` is not redistributed in this repository.

This application is not an ICC product and is not certified, endorsed or approved by the ICC. Publishing this repository does not grant any right to redistribute DLS software, tables or derived implementations. The project owner must ensure that any use or distribution complies with applicable ICC permissions and licensing requirements.

For official match decisions, use the authorised DLS application and the competition's applicable playing conditions. This calculator is an umpiring aid and should not be treated as a substitute for the authorised application.

## Build and release records

The full chronological development record, including failed fixes, test outcomes, known evidence limitations and commit references, is maintained in [docs/RELEASE-HISTORY.md](docs/RELEASE-HISTORY.md).

Version numbering and build numbering are separate:
- **Version 1.0** is the first formal product release.
- **Build 0.5.4** identifies the tested development build included in this release.
- Future fixes and development iterations will receive new build identifiers and be recorded in the release history.
