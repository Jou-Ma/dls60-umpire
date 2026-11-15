# DLS Umpire Calculator — Release Notes & Build History

**Document status:** Initial record  
**Application status:** Proof of Concept  
**Current build:** 0.5.4  
**Calculation standard:** ICC DLS 6.0  
**Product version:** Not yet formally released

## 1. Numbering policy

### Product version
- Formal product versions identify significant product releases.
- The intended first formal release is Version 1.0.
- A later major product milestone may be Version 2.0, Version 3.0, and so on.
- Decimal product versions are not required under the current project convention.

### Build number
- Every development build has its own build identifier.
- Multiple builds may belong to one product version.
- Bug fixes, functional corrections and iterative development are recorded against build numbers.
- A new build does not automatically create a new product version.

### Calculation standard
- The application currently implements ICC DLS 6.0.
- The calculation standard is recorded separately from both product version and build number.

### Display after formal release

The application should display all three identifiers, for example:

**Version 1.0 · Build 0.5.4 · ICC DLS 6.0**

Before the first formal release, the application should identify itself as a Proof of Concept and show its build number and calculation standard without implying that a formal product version has been released.

## 2. Build history

### Build 0.5.4
**Status:** Current PoC baseline  
**Calculation standard:** ICC DLS 6.0

Recorded changes and validation:
- Guard added for a zero-over segment in the calculation engine to prevent invalid numerical propagation.
- Build identifier updated to 0.5.4.
- Service-worker cache identifier advanced to v13.
- Subsequent user testing confirmed calculations in T20, standard 50-over and custom 60-over formats.
- Custom 60-over result compared with official ICC DLS 6.0 and matched.
- Custom 60-over second-innings ball-by-ball table, including an interruption in each innings, compared with official ICC DLS 6.0: 117 rows and 1,170 numerical values, with no discrepancies observed.

**Note:** This entry records the known current baseline. Earlier build history should be reconstructed from verified repository commits and project records before publication.

## 3. Formal product releases

| Product version | Release date | Release build | Status |
|---|---|---|---|
| Not yet released | — | — | PoC |

## 4. Future release entry template

For each build:
- Build identifier
- Date
- Summary of changes
- Files or components affected
- Defects fixed
- Tests performed
- Retest outcome
- Deployment and verification status

For each formal product release:
- Product version
- Release date
- Included build
- User-facing changes
- Compatibility or migration notes
- Known limitations
- Approved documentation set
