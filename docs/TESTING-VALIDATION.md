# DLS Umpire Calculator — Testing & Validation Report

**Document status:** Initial test record; ongoing  
**Application baseline:** PoC Build 0.5.4  
**Calculation standard:** ICC DLS 6.0  
**Product version:** Not yet formally released

## 1. Purpose

Record reproducible tests of the application and comparisons against the official ICC DLS 6.0 calculator. The official calculator is the reference for numerical validation.

A successful test demonstrates agreement for the specific inputs tested. It does not, by itself, establish correctness for every possible match scenario.

## 2. Test method

For each comparison, record:
- Application build
- Match format and minimum overs
- Complete first-innings inputs and interruptions
- Complete second-innings inputs and interruptions
- Relevant official DLS 6.0 output
- Application output
- Comparison method
- Number of rows and numerical cells compared
- Discrepancies, if any
- Tester and test date

Distinguish manual visual comparison from automated comparison.

## 3. Recorded validation results

### 3.1 Build 0.5.4 — 50-over resource-table comparison

**Recorded outcome:** No discrepancies found in manual comparison.

- Over-by-over table: 10 rows × 10 wicket columns = 100 numerical values.
- Ball-by-ball table: 51 rows × 10 wicket columns = 510 numerical values.
- Total: 610 numerical values compared.
- Overs bowled, overs remaining and unavailable (--) cells also matched.

**Qualification:** This was a manual visual comparison of the supplied output, not an automated test. Preserve the original complete input scenario and reference output when available.

### 3.2 Build 0.5.4 — zero overs remaining after an interruption

The application was exercised with a T20 configuration, a standard 50-over configuration and a custom 60-over configuration with a 25-over minimum.

**Recorded outcome:**
- The application calculated without the previously observed NaN adjustment factor in all three configurations.
- The custom 60-over result was compared with the official ICC DLS 6.0 calculator and produced the same result.

**Known input details from the recorded test:**
- Custom match: 60 scheduled overs; 25-over minimum.
- First-innings score: 187.
- First-innings interruption entered at 18 overs.
- Five wickets down.
- Two overs lost.

**Qualification:** The complete event sequence and exact official output have not yet been transcribed into this document.

### 3.3 Build 0.5.4 — custom 60-over match with interruptions in both innings

**Recorded outcome:** The application ball-by-ball table matched the official ICC DLS 6.0 output in the supplied comparison.

- Overs scheduled: 60.
- Minimum overs: 25.
- Second-innings interruption also included.
- Rows compared: 117.
- Wicket columns: 10.
- Numerical values compared: 1,170.
- Discrepancies observed: 0.
- Unavailable (--) cells and overs remaining also aligned.

**Qualification:** The comparison was made from the two pasted tables. The complete match inputs, test date and a machine-readable comparison file still need to be captured. The comparison should not be described as automated.

## 4. Regression test catalogue

Maintain a separate reproducible test case for each of the following:
- Standard 50-over match
- T20 match
- Custom match type
- First-innings interruption
- Multiple first-innings interruptions
- Second-innings interruption
- Multiple second-innings interruptions
- Interruptions in both innings
- Zero overs remaining after an interruption
- Minimum-overs boundary
- All-out scenarios
- Chasing side reaches target
- Match tied
- Defending side wins
- No Result
- Ball-by-ball resource table
- Over-by-over resource table
- Saved match and report consistency
- Offline save and subsequent upload

## 5. Defect and retest log

| Reference | Build found | Description | Fix build | Retest result |
|---|---|---|---|---|
| To be assigned | — | — | — | — |

## 6. Known limitations and outstanding validation

- The currently recorded comparisons cover selected scenarios, not the complete DLS 6.0 scenario space.
- Some historical test inputs and outputs still need to be captured in reproducible form.
- Manual comparisons should be labelled as manual until an independent automated comparison process exists.

## 7. Test evidence register

For each test, retain the input sheet, official reference output, application output and a short comparison record. Do not rely solely on a statement that two results matched.


## 8. Appendix A Development validation — 15–17 November 2026

**Environment:** Development only  
**Product target:** Version 2.0 development  
**Build identifier:** Not assigned  
**Tester:** Project owner/user  
**Method:** Manual worksheet scenario testing and review of calculated outputs; not an automated exhaustive test suite.

### 8.1 Tables 1–4

The user reported that all four Appendix A tables had been exercised with multiple constructed scenarios and were working as expected. These tests were performed without live match conditions. Table 1 had also previously been used in a real T20 International context.

| Area | Validation performed | Recorded result |
|---|---|---|
| Table 1 | Multiple playing-time, delay and interruption scenarios | User reported working as expected |
| Table 2 | Restart/cut-off comparison and first-innings continuation/termination decision | User reported working as expected |
| Table 3 | Second-innings allocation after first-innings termination | User reported working as expected |
| Table 4 | Second-innings interruption, elapsed duration, overs lost and amended cessation | User reported working as expected |
| Table 4 invalid restart | Restart earlier than interruption start | Error shown; dependent calculations cleared; user confirmed correction |
| Worksheet reset | Reset after selecting a competition and entering values | Competition returns to unselected state and worksheet relocks |

### 8.2 Competition gate — missing match type/time per over

A scenario exposed that Over Calcs could be left without a known time-per-over value if the competition/match type was not selected. The worksheet could not correctly derive the overs result in that condition.

The correction requires a competition selection before any calculation input can be captured. For **Other**, a valid positive custom time-per-over value is also required.

**Control test case:**

| Field | Value |
|---|---:|
| Competition | Men's Premier League |
| Time per over | 4.2 minutes |
| A | 420 |
| B | 202 |
| C | 88 |
| D | 0 |
| E | 10 |
| F | 78 |
| G | 342 |
| H | 81.43 |
| I | 41 |

Calculation check: H = 342 ÷ 4.2 = 81.428… overs (displayed to two decimal places as 81.43); I = ceiling(81.428… ÷ 2) = 41 overs per team. The user confirmed the competition-selection gate works after implementation.

### 8.3 Competition-specific Powerplay and bowling restrictions

The Development worksheet was checked against the supplied competition-specific bowling-restriction and Powerplay allocations. The implementation presents Powerplay 1, Powerplay 2 and Powerplay 3 as three separate outputs and uses the applicable innings-duration lookup. Men's Premier League shortened-innings Powerplay rules were added. The user reported the supplied Powerplay rules were correctly represented in the worksheet during iterative review.

### 8.4 Deferred recommencement scenarios

The recommencement scenario prototype is not accepted for this release. The user determined that its decision logic requires further consideration and that manual calculations are sufficient for the present. The settings/table are hidden in Development and must not be promoted. No acceptance claim is made for this prototype.

### 8.5 Validation limitations

- These Appendix A checks were manual and scenario-based.
- The constructed scenarios do not constitute a full real-match validation of every competition rule or time boundary.
- No automated oracle or exhaustive comparison suite exists for Appendix A.
- The recommencement prototype is explicitly unaccepted and excluded.
- This report records the user's test observations; it does not claim independent certification.
