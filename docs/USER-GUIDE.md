# DLS Umpire Calculator — User Guide

**Document status:** Working guide; screenshots and final platform walkthrough remain outstanding  
**Production baseline:** Version 2.0 · Build 1.0.1  
**Previous release:** Version 1.0 · Build 0.5.4  
**Calculation standard:** ICC DLS 6.0

## 1. Introduction
- Purpose and intended users
- What the calculator does
- What the calculator does not replace
- Important umpiring responsibilities and official playing conditions

## 2. Installation and access
- Opening the web application
- Installing the PWA on Android
- Installing the PWA on iPhone and iPad
- Installing or accessing on desktop
- Updating an installed copy
- Offline availability and first-load requirements

## 3. Getting started
- Application layout
- Selecting a match type
- Standard match formats
- Custom match formats and minimum overs
- Entering match and team details

## 4. First-innings calculations
- Entering scheduled overs and first-innings score
- Recording interruptions
- Overs completed, overs lost and wickets
- Understanding the revised resources and target calculation

## 5. Second-innings calculations
- Entering second-innings interruptions
- Automatic and manual overs configuration
- Understanding par scores and resource tables
- Ball-by-ball and over-by-over tables

## 6. Match result and report
- Revised target
- Final score and wickets
- Result determination
- Optional **Captured by — Full Name** field in Additional report details
- Competition, batting team names, venue and match date
- A4 portrait narrative report with conditional interruption tables
- Printing or saving a report

## 7. Saved matches and synchronisation
- Saving a match locally
- Finding and reopening a saved match
- Local, pending and uploaded status
- Manual synchronisation
- Automatic upload and retry behaviour
- What happens when the device is offline
- Device-specific storage and cross-device limitations

## 8. Troubleshooting
- Application does not load or update
- Installed app appears to show an older build
- No internet connection
- Upload or synchronisation failure
- Invalid or incomplete match inputs
- Unexpected calculation result: checks before reporting a problem

## 9. Glossary
- DLS
- Par score
- Revised target
- Overs remaining
- Resources
- Wickets lost
- Build number
- Product version

## 10. Support and feedback
- Where to report a reproducible issue
- Information to include when reporting a problem

---

## Editorial notes / content still required

- Capture screenshots of the current Build 1.0.1 interface.
- Confirm exact menu labels and field names against the live build.
- Document the final save, report and synchronisation workflows from hands-on testing.
- Add platform-specific screenshots only after the instructions have been verified.
- Do not describe any feature as available until it has been confirmed in the current build.


## 11. Appendix A — Over Calcs (Version 2.0)

The Production application provides an **Appendix A** tab with four umpire calculation worksheets. These worksheets support manual playing-time decisions and do not replace the applicable competition playing conditions or the umpire's own calculations and judgement.

### Before entering worksheet values

1. Open **Appendix A**.
2. Select the applicable competition/match type first.
3. Confirm the time-per-over value supplied for that competition.
4. Only then enter worksheet values.

The worksheet is deliberately locked until a competition is selected. For **Other**, enter a valid positive time-per-over value before the worksheet unlocks. This prevents the calculations from running with an undefined time-per-over setting.

Configured competition values are T20 (4.25 minutes per over), Promotion League 45 (3.75), Women's League 35 (3.75), Women's T20 (3.75) and Men's Premier League (4.2). Confirm these values against the competition rules applicable to the match being umpired.

### Tables

- **Table 1** calculates revised playing time and innings/cessation times following a delay or interruption.
- **Table 2** assesses whether the first innings can continue or should be terminated based on the restart and cut-off times.
- **Table 3** calculates the second-innings allocation where the first innings is terminated.
- **Table 4** recalculates the second-innings maximum overs and amended cessation after an interruption. A restart time earlier than the interruption start is invalid and blocks the dependent calculation.

Calculated fields are read-only. Use the Reset control to clear the worksheet and begin again; the competition selection must be made again after reset.

### Bowling restrictions and Powerplays

The worksheet provides the applicable bowling-restriction lookup and separate Powerplay 1, Powerplay 2 and Powerplay 3 outputs. Competition-specific rules, including shortened Men's Premier League innings, are used where supplied. Always verify the selected competition and applicable playing conditions before relying on these values.

### Deferred recommencement feature

Recommencement Settings and Recommencement Scenarios are a future enhancement. They are hidden in Development and are not included in Version 2.0 Production.


### Match report — Build 1.0.1

In the DLS Match Report section, open **Additional report details (optional)** to enter the report preparer's full name, competition, batting team names, venue and match date. The capturer name is optional and is displayed discreetly in the report footer when supplied.

The printable report is arranged chronologically: match format and minimum overs; first innings and any interruption records; second innings and any interruption records; revised DLS target; and match result. Interruption tables are omitted when there are no interruptions. Use the browser's print dialog to print or save the report as a PDF.
