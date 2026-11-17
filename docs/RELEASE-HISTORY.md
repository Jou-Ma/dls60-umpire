# DLS Umpire Calculator — Release Notes & Build History

**Document status:** Living development and release record; reconstructed from project conversations and available Git history  
**Application status:** Version 2.0 released  
**Production baseline:** Version 2.0 · Build 1.0.2  
**Previous release:** Version 1.0 · Build 0.5.4  
**Calculation standard:** ICC DLS 6.0  
**Current product version:** 2.0  
**History coverage:** Initial prototype through Version 2.0 · Build 1.0.2 (17 November 2026)

> **Record-keeping note:** The early builds (0.1.0–0.5.0) were developed and discussed in the project conversation. The GitHub repository does not preserve a complete, one-commit-per-build source history for those early iterations; some source files were uploaded in batches. Their entries below are therefore reconstructed from contemporaneous project notes and user testing, not represented as verified individual Git commits. Git commit timestamps are recorded where available. All dates are 15 November 2026 (South African local date); exact times are shown only where supported by Git commit timestamps.

## 1. Numbering policy

### Product version
- Formal product versions identify significant product releases.
- The first formal product release is **Version 1.0**, based on the tested Build 0.5.4 baseline.
- A later major product milestone may be **Version 2.0**, **Version 3.0**, and so on.
- The project convention does not require decimal product versions such as 1.1 or 1.2.

### Build number
- Every development build has its own build identifier.
- Multiple builds may belong to one product version.
- Development iterations, bug fixes and functional corrections are tracked by build number.
- A new build does not automatically create a new product version.

### Calculation standard
- The current implementation uses **ICC DLS 6.0**.
- The calculation standard is recorded separately from both product version and build number.
- ICC DLS 6.0 is the accepted reference standard for this project. No work on a hypothetical later DLS version is in scope unless the project direction changes.

### Identifiers to display
The formal release display identifies the product version, included build and calculation standard, for example:

**Version 1.0 · Build 0.5.4 · ICC DLS 6.0**

## 2. Chronological build history

### Build 0.1.0 — Initial working prototype

**Date:** 15 November 2026 (project conversation; exact source commit date not established)  
**Status:** Initial prototype

**Purpose:** Establish a working, offline-capable DLS 6.0 umpire calculator.

**Implemented capabilities recorded at the time:**
- Initial DLS 6.0 calculation engine and calculator interface.
- First-innings and second-innings interruption inputs, including multiple interruptions.
- Overs and balls notation, including handling of the all-out ('A') notation in the relevant input workflow.
- Revised target calculation.
- Over-by-over and ball-by-ball par-score tables.
- CSV output.
- Local match/scenario saving.
- JSON import and export.
- PWA/offline application shell and caching.

**Validation recorded:**
- 10 of 10 target test scenarios matched the supplied official DLS 6.0 JAR reference results.
- A multiple-interruption comparison covering both innings recorded 41 over-by-over rows and 241 ball-by-ball rows with no mismatches in the compared output.

**Outstanding at this stage:**
- Physical-device testing on Android and iPhone/iPad had not been completed.
- Airplane-mode/offline behaviour still required direct device verification.
- Broader regression testing was still required.

**Evidence qualification:** The test counts and outcomes are retained from the contemporaneous development record. The full original test input/output pack should be preserved separately if recovered.

### Build 0.2.0 — Match types and innings allocation

**Date:** 15 November 2026 (project conversation; exact source commit date not established)  
**Status:** Feature build; deployed for user testing

**Changes introduced:**
- Added match-type selection for ODI, T20, Other and Custom formats.
- Added minimum-overs-per-side configuration.
- Recorded defaults/options included ODI 50 overs with a 20-over minimum; T20 20 overs with a 5-over minimum; Other presets; and a Custom option.
- The Other format's minimum overs needed to remain editable.
- Added automatic second-innings overs allocation based on overs lost in the first innings.
- Retained a manual override for second-innings overs.
- Added clearer labels to interruption input fields.

**Example allocation used during development:** A 50-over match with first-innings losses of 4.0 and 2.3 overs resulted in 43.3 overs allocated for the chase.

**Validation recorded:**
- Existing reference tests continued to pass.
- A partial-over automatic allocation case was added to the checks.

**Outstanding at this stage:**
- Interactive browser testing was not yet complete.
- The user had begun checking the deployed application on Android; a full platform test matrix was still outstanding.

### Build 0.3.0 — Match report and minimum-overs rules

**Date:** 15 November 2026 (project conversation; exact source commit date not established)  
**Status:** Feature build

**Changes introduced:**
- Added a DLS Match Report workflow.
- Added minimum-overs validation and No Result handling.
- ODI minimum overs defaulted to 20; T20 defaulted to 5; Other/custom minimum overs remained configurable.
- Retained support for multiple interruptions in both innings.
- Added report readiness logic. In this iteration, report availability was too restrictive: it was initially tied to the chasing side reaching the target.

**Validation recorded:**
- Ten DLS reference scenarios.
- Multiple interruptions in both innings.
- A comparison set containing 41 over-by-over rows and 241 ball-by-ball rows.
- No mismatches were recorded in those numerical comparisons.

**Known defect carried forward:** The second-innings resource tables did not correctly restrict their displayed range after overs were lost in the chase. The report readiness rule also needed later refinement.

### Build 0.3.1 — Attempted second-innings table boundary correction

**Date:** 15 November 2026 (project conversation; exact source commit date not established)  
**Status:** Superseded; attempted fix was unsuccessful

**Intended change:**
- Correct the second-innings over-by-over and ball-by-ball table boundaries so the tables reflected the revised chase length after interruptions.

**Test scenario used:**
- First-innings interruptions at 10 and 20 overs, each with 10 overs lost.
- Second-innings interruptions at 10 overs (75 runs, 4 wickets, 8 overs lost) and 18 overs (150 runs, 4 wickets, 2 overs lost).
- Revised target recorded as 262.

**Outcome:**
- The attempted correction did not resolve the problem.
- The user confirmed that the second-innings tables still showed the original 0–30-over range rather than the revised chase range.
- An earlier claim that the fix had worked was withdrawn. This build must not be recorded as a successful correction.

### Build 0.3.2 — Second-innings table boundary fix

**Date:** 15 November 2026 (project conversation; exact source commit date not established)  
**Status:** Successful correction; user comparison confirmed

**Changes introduced:**
- Corrected the second-innings table boundary logic.
- Tables now stopped at the revised chase length rather than continuing to the original scheduled overs.
- Correctly handled the two-interruption-per-innings test case described under Build 0.3.1.

**Validation recorded:**
- In the test scenario, the revised chase length ended at 20 overs.
- Over-by-over output contained 3 rows (18.0–20.0).
- Ball-by-ball output contained 13 rows (18.0–20.0, including individual balls).
- All 13 ball-by-ball rows and all 3 over-by-over rows matched the official DLS 6.0 reference values in the user's comparison.
- The revised target remained 262.

**Outcome:** User confirmed the corrected tables matched the official DLS 6.0 output for this scenario.

### Build 0.4.0 — Match report workflow iteration

**Date:** 15 November 2026 (project conversation; exact source commit date not established)  
**Status:** Intermediate report implementation

**Recorded scope:**
- Continued development of the DLS Match Report workflow introduced in Build 0.3.0.
- Report generation and availability were still being refined against different match outcomes.

**Known issue identified during this iteration:**
- A report could be unavailable when the chasing side had not won or reached the target.
- This made report availability dependent on the match outcome rather than simply on the required report information being supplied.

**Evidence limitation:** The surviving project notes do not provide a reliable, complete file-by-file change list for this build. Do not infer additional functionality or claim a specific fix beyond the report workflow iteration described here.

### Build 0.4.1 — Match report available regardless of outcome

**Date:** 15 November 2026 (project conversation; exact source commit date not established)  
**Status:** User-confirmed correction

**Changes introduced:**
- Corrected report readiness so a report could be generated once the required report details were captured, regardless of whether the chasing side won.
- Removed the unintended dependency on the chasing side reaching the target.

**Scenarios explicitly covered in the user confirmation:**
- Chasing side wins.
- Chasing side finishes below the target.
- Chasing side is all out.
- Match is No Result.

**Outcome:** User confirmed the report was working as expected.

### Build 0.5.0 — Local match records and private archive upload (initial implementation)

**Date:** 15 November 2026 (project conversation; exact source commit date not established)  
**Status:** Major workflow implementation; initial service setup and live verification followed

**Purpose:** Allow match records to be retained locally and uploaded to a separate private archive without making the public application repository a match-data store.

**Specified/implemented workflow:**
- Save match records locally on the device.
- Keep records pending when offline.
- Upload automatically when the application is active and an internet connection is available.
- Provide a manual **Sync Now** action.
- Track upload status per match.
- Retry failed/pending uploads.
- Include match inputs, interruption details, targets/results, par-score tables and application build information in the archive record.

**Capturer identity requirement at initial design:**
- The user required the person capturing the match to enter Name and Surname.
- In the initial 0.5.0 specification these fields were mandatory and blocked calculation if missing.
- Capturer details were intended to appear in saved match data, reports and uploaded records. This requirement was relaxed in Build 0.5.1.

**Archive architecture:**
- Public application repository: `Jou-Ma/dls60-umpire`.
- Separate private match archive repository: `Jou-Ma/dls60-match-archive`.
- Cloudflare Worker used as the server-side bridge between the PWA and GitHub.
- GitHub personal access token held as a Cloudflare Worker secret, not in the browser application.
- Shared upload access code used by the small umpire group.

**Initial implementation/setup limitations:**
- The first upload implementation had only been exercised against a simulated GitHub API; the real private repository and Worker still required setup and live testing.
- Initial archive synchronisation did not result in a stored match because the private repository needed its initial commit/repository setup completed.
- The user then completed the private repository and Worker configuration and tested the live service.

**Important distinction:** The 0.5.0 feature specification and initial implementation should not be confused with the later confirmed live upload milestone. Live Worker health and upload testing were completed during the subsequent 0.5.2 setup/refinement work.

### Build 0.5.1 — Capturer details made optional and moved into report

**Date:** 15 November 2026  
**Git commit sequence:** 09:46:46–09:46:52 UTC (11:46:46–11:46:52 South African time)  
**Status:** Deployed; user confirmed update on Windows and Android

**User-requested changes:**
- Name and Surname were no longer mandatory.
- Capturer Name and Surname fields were moved to the DLS Match Report section, under additional report details.
- The report fields used default Name/Surname values rather than blocking match calculation.
- Capturer details remained available for inclusion in the report, saved match and uploaded record when entered.

**Files/components recorded as changed:** `app.js`, `index.html`, `match-record.js` and `sw.js`.

**PWA update:**
- Service-worker cache advanced from `dls60-umpire-shell-v9` to `dls60-umpire-shell-v10`.

**Validation/deployment:**
- User deployed/refreshed the update.
- Ctrl+F5 on Windows refreshed the application successfully.
- Closing and reopening the Android PWA also loaded the updated build.

**Git commits:**
- `b041a92c4c58b9133eeb671c86eca7bc509ad4c8`
- `d279cdc27b1135003993b7df6b46c61d05c46ca2`
- `89abc8acd73ad1bb270cda2e892f7202c0e3bf2e`
- `7b62d8a68fa7ef48c75edabe54420ab73ede5a3f`

### Build 0.5.2 — Preconfigured private archive and simplified synchronisation

**Date:** 15 November 2026  
**Git commit timestamps:** 10:26:54–10:26:56 UTC (12:26:54–12:26:56 South African time)  
**Status:** Live archive service tested

**Changes introduced:**
- Preconfigured the PWA with the Cloudflare Worker endpoint and shared umpire-group upload code.
- Removed the need for each user to enter and save the upload endpoint and access code.
- Removed the upload connection settings panel.
- Simplified the saved-match upload status message.
- Changed the manual action label to **Sync now**.
- Retained automatic upload when online and pending-match synchronisation.
- Updated the stored scenario application version to 0.5.2.

**Security/architecture note:**
- The shared access code is bundled in the public client code for convenience within the small trusted group; it must be treated as extractable, not confidential.
- The GitHub personal access token remains a Cloudflare Worker secret and must never be placed in the PWA.
- The archive remains a separate private repository; match records are not committed to the public application repository.

**Files/components confirmed by Git diffs:** `app.js`, `index.html`; service-worker cache and match-record version updates were also committed as part of the 0.5.2 sequence.

**PWA update:**
- Service-worker cache advanced from `dls60-umpire-shell-v10` to `dls60-umpire-shell-v11`.

**Validation/deployment:**
- Worker health endpoint returned `{ "service": "dls-match-archive", "ready": true }`.
- Live match uploads were tested successfully from the app, including on a phone.
- Saved records were confirmed to upload to the private archive.

**Git commits:**
- `efe3212d50639901625cc6588e0ebe333165d108` — preconfigure private archive upload.
- `0ac1d27276bd696d95a90e8d6111da45d744d8d6` — simplify archive upload UI.
- `a548a892e8` — match-record application version update (short SHA; full SHA to be confirmed from Git history).
- `9257ff7d9c` — service-worker cache refresh (short SHA; full SHA to be confirmed from Git history).

### Build 0.5.3 — Interface simplification and match report presentation

**Date:** 15 November 2026  
**Git commit timestamps:** 10:47:00–10:47:09 UTC (12:47:00–12:47:09 South African time)  
**Status:** Deployed; initial user check positive; colleague testing awaited

**User's design direction:** Remove elements that are not required. Retain the black application header and install option; remove redundant explanatory material and notices.

**Interface changes:**
- Retained the black header, application identity and install option.
- Removed the redundant introductory block, including the `DLS 6.0 · UMPIRE EDITION` heading, promotional tagline and explanatory paragraph.
- Removed the repeated offline-ready/feature notice.
- Kept the calculator interface more compact and focused.

**Report changes:**
- Removed lambda and adjustment factor from the printable DLS Match Report. These values remained available in the calculator metrics; they were removed from the report only.
- Reworked the result wording to show the DLS target, chasing team's final score and concise match outcome.
- When the chasing team reaches the target and wickets are known, the report states the wickets remaining.
- When wickets are not supplied, the report states that the team won without inventing a wicket margin.
- When the defending side wins, the report calculates the run margin as target minus final score minus one.
- A score exactly one run short of the target is reported as a tie.
- No Result is explicitly identified as such.
- Actual team names are passed into the outcome wording rather than generic team labels.

**Files/components confirmed by Git diffs:** `index.html`, `app.js`, `report.js`, `match-record.js`, `sw.js`.

**PWA update:**
- Service-worker cache advanced from `dls60-umpire-shell-v11` to `dls60-umpire-shell-v12`.

**Validation/deployment:**
- Repository contents were re-fetched and checked after the changes.
- Verification confirmed the intro was removed, install button retained, calculator metrics remained available, report parameters were removed, team names were passed to the outcome function, and application/match-record build metadata was updated.
- User performed an initial check and reported that it appeared correct.
- Further colleague testing was still awaited at the time of the project notes.

**Git commits:**
- `5f6d70ea495221503b5c0a6a3ab8b6f6f3f3b82b` — simplify landing layout and bump build.
- `2a2b73937fbf175faaf0ca7ed6437564033c5914` — remove technical DLS parameters from report.
- `dd6497cbe73d841450a6eef687c1a3208c9fe31d` — concise cricket result wording.
- `9e0cf4d1799796886114d812e37a991051670d60` — match-record version update.
- `0a85e225e06845703cbf6fb725bbe9bf3a5560e5` — service-worker cache refresh.
- `7bc26eba161caea90d12134bd2e04e3e3393a899` — preserve calculator metrics and pass actual defending team.

### Build 0.5.4 — Zero-resource interruption calculation guard

**Date:** 15 November 2026  
**Git commit timestamps:** 12:37:54–12:38:14 UTC (14:37:54–14:38:14 South African time)  
**Status:** Current PoC build; user testing and official-reference comparisons reported successful

**Problem reported:**
- An interruption scenario could cause the adjustment factor to display as `NaN`.
- The issue was first noticed in a T20 scenario and then also tested in a 50-over scenario.
- Investigation identified a zero-over resource segment as a calculation path requiring explicit handling.

**Code change:**
- Added a guard in `engine.js` so an event segment with zero or fewer overs contributes zero resources instead of evaluating the zero-over resource expression and propagating an invalid numerical result.

**Other build updates:**
- Application footer/build identifier changed to Build 0.5.4.
- Service-worker cache advanced from `dls60-umpire-shell-v12` to `dls60-umpire-shell-v13`.

**Files changed:** `engine.js`, `index.html`, `sw.js`.

**Git commits:**
- `60c4b935557a011383b23f43af21a7e2b5a9c281` — calculation guard.
- `36f8605fcb552e16a4b8378b3f54c7adb01779fd` — build identifier.
- `3c4283eee26247a4388fd628058147ff0c6f3a58` — service-worker cache refresh.

**Validation recorded after the build:**
- User confirmed the calculation worked in T20 and 50-over scenarios.
- A custom 60-over match with a 25-over minimum and the same zero-over interruption condition calculated successfully and matched the official ICC DLS 6.0 result.
- A second-innings interruption was then added to the custom 60-over match.
- The application ball-by-ball table was compared with the official DLS 6.0 table:
  - 117 rows.
  - 10 wicket columns.
  - 1,170 numerical values.
  - No discrepancies observed.
  - Overs bowled, overs remaining and unavailable (--) cells also aligned.

**Comparison qualification:** The table comparison was a manual comparison of the outputs supplied in the project conversation, not an automated independent test. It validates the supplied scenario; it does not prove every possible DLS scenario.

## 3. Build summary index

| Build | Main purpose/change | Outcome/status |
|---|---|---|
| 0.1.0 | Initial DLS 6.0 calculator prototype | Initial reference tests passed; device/offline testing outstanding |
| 0.2.0 | Match types, minimum overs, automatic chase overs, clearer interruption labels | Reference checks passed; interactive testing still in progress |
| 0.3.0 | Match report and minimum-overs/No Result handling | Feature added; report readiness and table-boundary issues remained |
| 0.3.1 | Attempted second-innings table boundary fix | **Unsuccessful**; defect confirmed by user |
| 0.3.2 | Corrected second-innings table range | **Successful** in supplied official comparison |
| 0.4.0 | Match report workflow iteration | Outcome-dependent report availability issue remained |
| 0.4.1 | Report readiness independent of match outcome | **User confirmed working as expected** |
| 0.5.0 | Local match records and private archive upload workflow | Initial implementation; live service setup/testing followed |
| 0.5.1 | Capturer details optional and moved into report | Deployed; Windows and Android refresh confirmed |
| 0.5.2 | Preconfigured archive connection and simplified sync UI | Live Worker health and match upload tested successfully |
| 0.5.3 | Simplified interface and revised report wording | Repository checks and initial user check positive; colleague test awaited |
| 0.5.4 | Zero-resource interruption guard | User compared T20, 50-over and custom 60-over results with official DLS 6.0; latest 1,170-value table comparison had no discrepancies |

## 4. Known gaps in the historical record

The following information should be added if recovered; it must not be guessed:

1. Exact creation dates/times and source snapshots for Builds 0.1.0 through 0.5.0.
2. Full file-by-file change lists for Builds 0.1.0 through 0.4.1.
3. The exact implementation details of Build 0.4.0.
4. Full Git commit SHAs for the two abbreviated 0.5.2 commits.
5. The original complete inputs and official reference outputs for the early DLS test scenarios.
6. Exact build-by-build deployment and device-test evidence for early builds.

The repository's current Git history contains reliable individual commits for the 0.5.1–0.5.4 work described above, but early iterations were uploaded in batches and cannot safely be reconstructed from commit metadata alone.

## 5. Formal product releases

| Product version | Release date | Release build | Status |
|---|---|---|---|
| 1.0 | 15 November 2026 | 0.5.4 | Released; first formal product release |
| 2.0 | 17 November 2026 | 1.0.0 | Initial release; Appendix A umpire worksheets and mandatory competition gate |
| 2.0 | 17 November 2026 | 1.0.1 | Maintenance build; redesigned match report and full-name capturer field |
| 2.0 | 17 November 2026 | 1.0.2 | Production UI refinement; automatic calculation workflow, streamlined match setup and innings inputs |

## 6. Required entry format for future builds

Every future build entry must record:

- Build identifier.
- Date and time (South African time; include UTC if sourced from Git).
- Reason for the change / problem addressed.
- Exact changes made.
- Files or components affected.
- Git commit SHA(s).
- Tests performed and reference standard used.
- Test outcome, including failures and limitations.
- Deployment status and user confirmation.
- Any known issue carried forward.

A failed or superseded fix must remain in the history. Do not delete it merely because a later build corrected the problem; recording unsuccessful attempts is essential for future diagnosis.

## 7. Formal release entry format

For each formal product release, record:

- Product version.
- Release date.
- Included build.
- User-facing changes.
- Compatibility or migration notes.
- Known limitations.
- Approved documentation set.
- Release acceptance/approval.


### Version 1.0 — First formal product release

**Release date:** 15 November 2026  
**Included development build:** 0.5.4  
**Calculation standard:** ICC DLS 6.0  
**Release baseline:** Build 0.5.4, including the zero-resource interruption guard.

**Release decision:** The project owner accepted the current build for the first formal product release after testing multiple scenarios. The only reported calculation error of concern was the `NaN` adjustment-factor issue, which was corrected in Build 0.5.4 and retested.

**Included functionality:**
- DLS 6.0 target and resource calculations for supported match formats.
- Multiple first- and second-innings interruption handling.
- Minimum-overs rules and No Result handling.
- Over-by-over and ball-by-ball par-score tables.
- Match reports, local match records, JSON import/export and CSV export.
- Offline-capable PWA installation and private match-archive upload workflow.

**Validation evidence:** The user reported successful testing across multiple scenarios. Recorded comparisons include 10 reference target scenarios; 41 over-by-over rows and 241 ball-by-ball rows with no mismatches in the earlier comparison; and a later 1,170-value ball-by-ball comparison for a custom 60-over interrupted match with no discrepancies observed. These results are scenario-specific and are not an exhaustive validation of every possible input combination.

**Known limitations and cautions:**
- The implementation has not been exhaustively validated across every possible input combination or competition condition.
- Official match decisions must be cross-checked using the authorised DLS application and applicable playing conditions.
- DLS is proprietary. This independent tool is not an ICC product and is not certified, endorsed or approved by the ICC. Distribution and use remain subject to applicable permissions and licensing requirements.
- Local saved records are device/browser-specific unless uploaded to the separately configured private archive.

**Release metadata:** The application footer and release-facing documentation identify the release as **Version 1.0 · Build 0.5.4 · ICC DLS 6.0**. The calculation logic remains the Build 0.5.4 implementation; the release metadata does not represent a new calculation build.


## 8. Version 2.0 — Development record (not yet released)

**Development period recorded:** 15–17 November 2026  
**Production baseline:** Version 1.0 · Build 0.5.4  
**Included build:** 1.0.0  
**Calculation standard:** ICC DLS 6.0  
**Status:** Released to Production on 17 November 2026.

### 8.1 Development objectives and application navigation

The Version 2.0 work began by restructuring the application into navigable sections:

- **DLS 6.0** — the existing DLS calculator, retained as the primary calculator.
- **Appendix A** — umpire calculation worksheets supporting playing-time, bowling-restriction and Powerplay calculations.
- **Help** — supporting guidance.

The unused Appendix B–D tabs were removed from the initial navigation proposal. The tab navigation was made accessible and responsive. The Development environment uses an orange header to distinguish it from the blue Production environment; the Production theme is not changed by this Development work.

### 8.2 Appendix A — umpire calculation worksheets

Appendix A was implemented as four linked calculation tables. The worksheets are intended to assist umpires with the manual playing-time calculations required under the applicable competition playing conditions. They do not replace the umpire's responsibility to apply those conditions and verify the inputs.

**Table 1 — First-innings delay/interruption and revised playing time**

The worksheet captures the available playing time, innings time already used, playing time lost, additional time and interval adjustments. It calculates effective time lost, remaining playing time, the resulting maximum overs per team, and the revised innings and cessation times. The worksheet includes the calculation of the second-innings start and cessation times.

**Table 2 — Decision on whether the first innings can continue**

The worksheet compares the proposed restart and the rescheduled cut-off, calculates the intervening time and potential overs, and compares those overs with the overs already faced. The result identifies whether the first innings can continue under the worksheet's decision rule or whether the first innings is terminated and Table 3 is applicable. The applicable decision outcome is visually highlighted.

**Table 3 — Second-innings allocation following first-innings termination**

The worksheet carries forward the overs determined by Table 2, calculates the corresponding scheduled innings duration and cessation time, and records the second-innings start time.

**Table 4 — Second-innings interruption and amended cessation**

The worksheet calculates elapsed innings time, interruption duration, additional time, time lost, overs lost, adjusted maximum overs, revised innings duration and amended cessation time. The elapsed innings duration is calculated automatically and is read-only. A restart time earlier than the interruption start is invalid: the worksheet displays an error and clears dependent outputs rather than continuing with an invalid duration. Reset clears the worksheet and restores the competition selector to its unselected state.

### 8.3 Competition-specific time and bowling-restriction calculations

The Over Calcs worksheet includes competition selection and competition-specific time-per-over values. The Development configuration recorded in the application is:

| Competition | Time per over |
|---|---:|
| T20 | 4.25 minutes |
| Promotion League 45 | 3.75 minutes |
| Women's League 35 | 3.75 minutes |
| Women's T20 | 3.75 minutes |
| Men's Premier League | 4.2 minutes |
| Other | User-entered positive value |

The competition selection is now mandatory before any Over Calcs worksheet input can be entered. All worksheet inputs and scenario controls start disabled. Selecting a configured competition supplies its time-per-over value and unlocks the worksheet. Selecting **Other** does not unlock the worksheet until a valid positive custom time-per-over value is entered. Calculated/read-only outputs become available after the gate is satisfied.

Appendix A also includes a bowling-restriction lookup and three distinct Powerplay outputs: Powerplay 1, Powerplay 2 and Powerplay 3. The lookup uses the applicable innings duration and the competition's supplied bowling-restriction allocation. Shortened-innings Powerplay allocations were added for the Men's Premier League. No generic 50-over Powerplay allocation is inferred where the applicable competition rule has not been supplied.

### 8.4 Recommencement scenario enhancement — deferred and excluded

A recommencement-time scenario table was prototyped in Development to show candidate restart times, time available, possible overs and whether the minimum-overs outcome could be achieved. The user concluded that the scenario logic requires further consideration and that the calculations can be performed manually in the meantime.

**Release treatment:** Recommencement Settings and the Recommencement Scenarios table are a future enhancement. They are hidden in the Development interface pending further design and are expressly excluded from the current Production promotion. Their prototype code is not part of the approved release scope.

### 8.5 Development validation and user acceptance

The user reported that Tables 1–4 had been tested across multiple constructed scenarios to the extent possible without live match conditions and were working as expected. Table 1 had also previously been exercised in a real T20 International context. The user separately tested the mandatory match-type gate and confirmed that it was working.

A defect was identified during Table 1 testing when a Premier League scenario was entered without first selecting the match type/time-per-over. The worksheet could not calculate the expected result because the time-per-over value was missing. The gate was introduced to prevent any worksheet data entry until the competition and required time-per-over value are established.

**Recorded gate test case:**
- Competition: Men's Premier League.
- Time per over: 4.2 minutes.
- A = 420; B = 202; C = 88; D = 0; E = 10; F = 78; G = 342.
- H = G ÷ 4.2 = 81.43 overs (displayed to two decimal places).
- I = ceiling(H ÷ 2) = 41 overs per team.

The user confirmed that the revised gate works. This scenario is recorded as a control/validation example; it is not represented as a full independent test suite.

### 8.6 Source and deployment record

The application source changes for the initial Version 2.0 navigation and Appendix A structure were committed to the `dev` branch of `Jou-Ma/dls60-umpire`. The separately hosted Development application is maintained in `Jou-Ma/dls60-umpire-dev`, branch `main`. Development hosting changes include the Appendix A worksheets, competition-specific rules, Table 4 validation, recommencement prototype and the mandatory competition-selection gate.

Representative source-repository commits:
- `64c9d93d9152` — V2 tab navigation and Appendix A prototype.
- `e5b19307c52b` — enable application tab navigation.
- `7c8e9ecb79a3` / `7fb58d3f1702` — Version 2.0 enhancement roadmap.
- `991a5df459fd` — record initial V2 tab and Appendix A prototype status.
- `51b8f98a6f56` — document recommencement-time scenario prototype.

Representative Development-hosting commits:
- `ac24b580f93e` — competition-specific time-per-over settings.
- `7dcab9b77cd6` / `78fa1fd6f4e6` — competition-specific Powerplay calculations and Men's Premier League shortened-innings Powerplays.
- `549fbda8099e` — automatic Appendix A formula calculations.
- `44f64fc3468b` / `88ede9964589` — three Powerplay outputs and lookup.
- `33c3b6ec2976` / `d1e1bb8afe57` — Table 4 elapsed-time calculation and restart validation.
- `ee72830116be` — reset competition selection.
- `4680f1f0a103` — recommencement scenario prototype.
- `05034e4f1fe7` / `b42388bb2668` / `2fc2fb3e0163` — mandatory competition gate and valid custom-rate handling.
- `9a9dc53e29ed` — hide recommencement scenarios pending future enhancement.

The Development hosting service-worker cache was advanced as required during the iterations. The latest hidden-scenario update uses the Development cache namespace v20. The Production service-worker cache was advanced from v14 to v15 during promotion. Production remains blue-themed and retains its existing private archive upload configuration; the blank local-only upload configuration from the Development hosting repository was not copied into Production.

**Production promotion commits (17 November 2026):**
- `0bc05ebd2adb` — Version 2.0 · Build 1.0.0 interface and tabs.
- `7e3e5b96ae6f` — Appendix A calculations and mandatory competition gate, with recommencement code excluded.
- `6722479b7a55` — Production tab and worksheet styling.
- `8375211becf8` — saved-match build metadata updated to 1.0.0.
- `4d62acb1320d` — Production service-worker cache v15.

### 8.7 Approved Production release scope

The approved and promoted Version 2.0 scope includes the completed tab navigation, Appendix A Tables 1–4, competition-specific time-per-over selection, bowling-restriction and Powerplay calculations, Table 4 validation and the mandatory competition-selection gate.

The following are not included:
- Recommencement Settings or Recommencement Scenarios.
- Any unassigned or untested future enhancement.
- Any change to the DLS 6.0 calculation engine unless separately documented and approved.

The Production release must retain the Production blue header and its existing private archive configuration. The Development hosting repository's blank local-only upload configuration must not be copied over the Production configuration. Production is now identified as Version 2.0 · Build 1.0.0. The Version 1.0 · Build 0.5.4 release remains the previous formal release baseline.

### 8.8 Release approval and implementation record

The user stated that completion of the release documentation was the condition for approving this promotion and that, once completed, the release would be approved. The documentation was completed before the Production changes were committed. The user's explicit release approval therefore applies to the scope in section 8.7, and the Production promotion commits are recorded in section 8.6. No signature or separately signed form is fabricated. The GitHub Pages publication and hands-on browser/PWA smoke test have not been independently verified in this record and remain post-deployment checks.


### Version 2.0 — Appendix A umpire calculation worksheets

**Release date:** 17 November 2026  
**Included build:** 1.0.0  
**Calculation standard:** ICC DLS 6.0  
**Previous release:** Version 1.0 · Build 0.5.4

**Release decision:** Approved by the project owner after completion of the release documentation, as expressly stated in the project conversation. The approved scope is the Production promotion boundary in section 8.7.

**Included functionality:**
- Accessible top-level navigation for DLS 6.0, Appendix A and Help.
- Appendix A Tables 1–4 for playing-time, first-innings continuation/termination, second-innings allocation and second-innings interruption calculations.
- Competition-specific time-per-over settings.
- Mandatory competition/match-type selection before worksheet entry; Other requires a valid positive custom rate.
- Bowling-restriction lookup and three separate Powerplay outputs (Powerplay 1, Powerplay 2 and Powerplay 3), including the supplied shortened-innings Men's Premier League allocations.
- Table 4 restart-time validation and worksheet reset behaviour.
- Production blue theme and existing private match-archive upload configuration retained.

**Explicit exclusions:**
- Recommencement Settings and Recommencement Scenarios are deferred future enhancements. They are hidden in Development and no recommencement UI, logic or styles were promoted.
- No change was made to the DLS 6.0 calculation engine as part of this release.

**Validation summary:** The project owner reported that Tables 1–4 had been exercised across multiple constructed scenarios and were working as expected; Table 1 had also previously been used in a real T20 International context. The competition gate was separately tested and confirmed working. These were manual user tests, not an exhaustive automated test suite. The production code passed static promotion checks for required tabs, all four tables, the competition gate, production archive configuration, blue theme, build metadata and absence of recommencement code. No automated browser test was performed as part of this promotion.

**Post-deployment action:** The project owner should perform a browser/PWA smoke test on the Production URL, including tab navigation, Appendix A calculations, competition gate, match save/archive upload and installed-PWA cache refresh. The release is promoted; this final hands-on production verification is outstanding.


### Build 1.0.1 — Match report presentation refinement

**Date:** 17 November 2026  
**Product version:** 2.0  
**Status:** Approved for Production; Development report reviewed and accepted by the project owner.

**Changes introduced:**
- Replaced the card/tile-style printable report with a concise chronological A4 portrait match report.
- Retained the report header and match identity details.
- Consolidated match format and minimum-overs information into one line.
- Presented first- and second-innings details as readable narrative sections, with interruption tables shown only when interruptions exist.
- Removed repeated allocation facts and unnecessary technical calculation parameters from the report.
- Kept the revised DLS target, result and report disclaimer.
- Displayed the report preparer's name in a single **Captured by — Full Name** field and discreetly in the report footer.
- Preserved compatibility when loading saved scenarios that contain the earlier separate first-name and surname fields.

**Files changed:** `app.js`, `index.html`, `match-record.js`, `sw.js`, release and validation documentation.

**Production Git commits:**
- `3472e253f42246b5f468e43e8058777dd8638496` — single full-name capturer field and Build 1.0.1 release label.
- `29d1191771f659c7add88f59b8d9838ce430e121` — approved narrative report layout and legacy scenario compatibility.
- `0ac4ee29267b8d6774cb80cd742c4353c6feb1c4` — full-name archive metadata.
- `51a52e69e1ee3d3f2408c6d1735c587b7db9b200` — Production service-worker cache v16.
- `1ceffd44f2fa08adcc1462697d9aab39f177f1fd` — release history update.
- `53f300589785a27dabf0ddebe33f50a90be8861e` — validation record.
- `ff21cf8142b050a8db8814301ae95bcf9c9dc7d3` — README update.
- `9bdfddd48ae9faad91f4764024134e5abb2c25b4` — archive full-name validation regex correction.
- `20358b4ee26b46ef7d6ead59c4ec0a24d3dbbdd9` — normalize legacy saved scenarios to the optional full-name field.
- `9b59c9f16acf5bc589d68fbfa02843db438e4aa8` — preserve blank legacy capturer values in archive records.
- `8aeefb9856dbcb8e57ac1a592e5ba3d9fa19d7fa` — hide the legacy blank-name placeholder in saved-match listings.
- `8e0f2bd1b9dc1d71aa9cf82879186655a0f39f56` — update the user guide.
- `93fb2288fe1ea261d5c6587ea922629eccdc17da` — update technical documentation.
- `7f2dc0746515728b6365e91aee91edec16ccc38f` — update documentation index and document control.

**Calculation impact:** No change to the DLS 6.0 calculation engine, target calculation, par-score tables or Appendix A calculations.

**Validation and approval:**
- The project owner reviewed the generated report in Development and confirmed that the new layout was intuitive and easy to read.
- Source-level checks were performed for the report structure, conditional interruption tables, full-name capture, saved-scenario compatibility, Production archive configuration and service-worker cache update.
- No automated browser/PDF rendering test was performed by the developer. Production browser/PWA smoke testing remains a post-deployment check.

**Production release:** Version 2.0 · Build 1.0.1. The formal product version remains 2.0; this is a maintenance build under the project's separate build-numbering policy.


### Build 1.0.2 — Match worksheet and interface refinement

**Date:** 17 November 2026  
**Product version:** 2.0  
**Status:** Approved for Production.

**Changes introduced:**
- Removed the redundant **Required** badge from Match Setup.
- Made Match Type the sole field in the first setup row; moved innings inputs into their relevant sections.
- Moved **Reset form** to the Match Setup heading.
- Removed the **Calculate / refresh DLS** button and redundant general status/error messages; calculation remains automatic and field-level validation remains.
- Removed redundant first-innings lambda and adjustment-factor presentation.
- Removed the visible second-innings overs override and displays the calculated second-innings allocation after chase interruption entries.
- Retained one penalty-runs field, clearly describing the award to Team 1 while Team 2 is batting.
- Ensured one blank interruption row is available for each innings on a new or reset form; untouched blank rows do not affect calculations.
- Retained the approved A4 chronological match report and single full-name capturer field.
- Updated Production styling to match the approved Development layout while retaining the Production blue identity.
- Advanced the Production service-worker cache to `dls60-umpire-shell-v17`.

**Explicitly excluded:** Recommencement Settings / Recommencement Scenarios remain deferred and are not included in this Production build.

**Calculation impact:** The DLS 6.0 engine and Appendix A formulas are unchanged. This build updates worksheet presentation, input handling and automatic allocation display.

**Validation:** Static source checks passed for the updated form, report, blank interruption rows, Production archive configuration, blue Production branding and cache v17. No automated browser interaction or PDF-rendering test was performed by the developer. Production smoke testing remains required.

**Production release:** Version 2.0 · Build 1.0.2.
