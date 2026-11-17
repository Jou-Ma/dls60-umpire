# DLS Umpire Calculator — Technical Documentation

**Document status:** Working technical reference; detailed implementation inventory remains in progress  
**Production baseline:** Version 1.0 · Build 0.5.4  
**Development target:** Version 2.0 (build identifier not assigned)  
**Calculation standard:** ICC DLS 6.0

## 1. System overview
- Application purpose and scope
- Supported deployment model
- Current operational baseline

## 2. Architecture
- Progressive Web App (PWA)
- Application shell and user interface
- Calculation engine
- Match record and report modules
- Service worker and cached assets
- Local persistence
- Archive upload service

## 3. Calculation engine
- ICC DLS 6.0 reference standard
- Engine module boundaries
- Input model and validation
- Resource calculations
- Interruption and segment handling
- Lambda and adjustment-factor handling
- Target and par-score generation
- Ball-by-ball and over-by-over output
- Numerical precision and rounding

**Important:** This section must describe the implemented code accurately. It must not reproduce or infer proprietary ICC methodology beyond what is necessary to document the application's implementation and observed behaviour.

## 4. Match data and reports
- Match input structure
- Interruption/event representation
- Result determination
- Report generation
- Match record schema and schema version
- Application build metadata

## 5. Offline and PWA behaviour
- Web app manifest
- Service worker
- Cache strategy and cache versioning
- First installation and subsequent updates
- Offline operation and its limits

## 6. Local storage
- What is stored on the device
- Match lifecycle and status
- Data retention and deletion behaviour
- Device-specific nature of local records
- Backup and recovery considerations

## 7. Archive upload service
- Architecture and data flow
- Cloudflare Worker responsibilities
- Authentication model
- GitHub private archive repository
- Record naming and storage structure
- CORS and request validation
- Retry and idempotency behaviour
- Operational limits and failure handling
- Security considerations

**Security note:** The GitHub personal access token must remain server-side as a Cloudflare secret. Any shared access code embedded in a public client application must be treated as extractable, not as a confidential secret.

## 8. Build and deployment process
- Source repository and branch
- Files forming the application
- Build identification
- Service-worker cache updates
- Deployment to GitHub Pages
- Verification after deployment
- Rollback considerations

## 9. Maintenance and future changes
- Calculation engine changes
- Regression testing requirements
- Data schema compatibility
- Archive service maintenance
- Formal product-version policy

## 10. Technical appendices
- Repository file inventory
- Data structures
- Endpoint contracts
- Configuration inventory (excluding secret values)
- Known limitations

---

## Editorial notes / content still required

- Verify every architectural statement against the current source code and deployed Worker.
- Record exact storage APIs, keys and schema fields from the implementation.
- Document actual endpoint responses and error cases.
- Do not include access codes, tokens or other credentials.
- Distinguish verified behaviour from design intent and known limitations.


## 11. Appendix A worksheet module — Version 2.0 Development

The Appendix A module is a separate umpire worksheet area and does not replace the DLS calculation engine. It contains four linked tables for playing-time and innings-restart calculations.

- **Table 1:** derives effective playing time lost, remaining playing time, overs per side and revised innings/cessation times from the entered match timings and adjustments.
- **Table 2:** compares the proposed restart time with the rescheduled cut-off and determines whether the first innings may continue or must be terminated under the worksheet rule.
- **Table 3:** calculates the second-innings allocation and scheduled cessation when Table 2 indicates first-innings termination.
- **Table 4:** calculates elapsed innings time, interruption duration, time lost, overs lost, adjusted maximum overs, revised innings duration and amended cessation. A restart earlier than the interruption start is rejected and dependent outputs are cleared.

Competition-specific parameters are supplied through the Over Calcs competition selector. Configured time-per-over values include T20 (4.25), Promotion League 45 (3.75), Women's League 35 (3.75), Women's T20 (3.75) and Men's Premier League (4.2). Other requires a manually entered positive value. Units are minutes per over.

The competition selector is a mandatory input gate. Worksheet inputs and scenario controls are disabled until a configured competition is selected or a valid custom rate is supplied for Other. This prevents calculations being attempted with an undefined time-per-over value.

The bowling-restriction and Powerplay lookup exposes three outputs (Powerplay 1, Powerplay 2 and Powerplay 3). Competition-specific allocations must be sourced from the relevant competition playing conditions; no generic allocation is assumed where a rule has not been provided.

**Deferred:** Recommencement Settings and Recommencement Scenarios were prototyped but are hidden and excluded from the current release scope. Their logic remains subject to further requirements analysis.

**Environment separation:** The source development branch is `dev` in `Jou-Ma/dls60-umpire`. The separate Development hosting repository is `Jou-Ma/dls60-umpire-dev`. Production remains the `main` branch and the blue-header deployment. Development-only configuration must not be copied into Production, particularly the intentionally blank local archive-upload configuration in the Development hosting repository.
