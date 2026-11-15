# DLS 6.0 Umpire Calculator — Enhancement Roadmap

**Document status:** Proposed roadmap; requirements to be refined before implementation  
**Prepared:** 15 November 2026  
**Current production release:** Version 1.0 · Build 0.5.4  
**Next major product version:** Version 2.0  
**Development build numbering:** Build 1.x.x  
**Calculation reference:** ICC DLS 6.0

## 1. Purpose

This document records the planned enhancements for Version 2.0. It is a planning document, not an implementation specification or approval to change Production.

Version 1.0 remains the current Production baseline while it is being evaluated by two members of the Titans Umpire Executive. Version 2.0 work will be developed and tested separately in the Development environment.

## 2. Enhancement workstreams

### 2.1 Titans-inspired visual refresh

**Objective:** Give the application a stronger, more polished visual identity inspired by the Titans' colours and visual style.

Planned areas for review:
- Application colour palette, including Titans-inspired blue, gold and white.
- Header, typography and visual hierarchy.
- Buttons, tabs, active states and input controls.
- Calculation panels, spacing and alignment.
- Consistency across desktop, Android and iOS/iPadOS layouts.

The visual refresh must retain the project's preference for a clean, functional interface. Decorative elements that do not improve clarity or usability should not be added.

The design may be inspired by the Titans identity but must not imply official endorsement or affiliation unless separately authorised.

### 2.2 DLS Match Report presentation redesign

**Objective:** Improve the readability and visual organisation of the existing DLS report.

The current report content is considered functionally correct and is not being proposed for removal. The issue identified is that the information is difficult to read and does not flow clearly.

The redesign should focus on:
- Clear visual hierarchy for the most important match and DLS figures.
- Logical grouping of match details, interruptions, calculation information and match outcome.
- Improved spacing, alignment, typography and table presentation.
- Easier scanning so an umpire can locate key figures quickly.
- A clean print/PDF layout, including sensible page breaks.

**Content principle:** Preserve the existing report information unless a separate, explicit requirement is agreed. The objective is to improve presentation, not silently remove useful data or alter calculation results.

### 2.3 Time-based interruption calculations

**Objective:** Add support for calculating DLS interruptions using time lost, in addition to the existing overs-based interruption workflow.

The project owner has the complete calculation information in four forms. These forms will be supplied and reviewed before the time-based calculation design is finalised. The applicable calculations will vary according to the Playing Conditions (PCs) for the relevant competitions and games.

Planned work:
- Review and document all four supplied calculation forms.
- Identify the applicable Playing Conditions and differences between them.
- Define how the umpire selects the applicable calculation/PC set.
- Design the time-based interruption input workflow, including the proposed tabbed interface for overs-based and time-based calculations.
- Define handling for multiple interruptions and the relevant match/innings conditions.
- Implement the calculation logic and interface in Development.
- Validate results against the supplied forms and the authorised ICC DLS 6.0 reference.

**Open design decisions:**
- Whether the overs/time choice is made once for the match or can vary by individual interruption.
- How the applicable PC set is selected and displayed.
- Exact input fields, validation rules and treatment of multiple interruptions.

These decisions must be resolved from the supplied forms and applicable PCs. Do not assume a universal minutes-to-overs conversion or invent calculation rules.

## 3. Development and release sequence

The workstreams above form the Version 2.0 roadmap. Their detailed order and build allocation will be agreed as requirements are clarified.

The following controls apply to every enhancement:

1. Record and agree the requirement before implementation.
2. Implement the change in Development only.
3. Test the change in Development, including relevant regression tests against existing functionality.
4. Record test evidence, outcomes and any known limitations.
5. Complete the required Change Control documentation and obtain approval.
6. Complete Release Management documentation and obtain release approval.
7. Promote to Production only after Development testing is complete and the project owner's explicit approval has been given.
8. Verify the Production deployment and record the outcome.

**Production protection rule:** No changes are to be made to Production while the corresponding implementation and testing in Development are incomplete. A successful Development test does not, by itself, authorise a Production deployment.

## 4. Version and build numbering

The next major product release is **Version 2.0**.

Development builds belonging to Version 2.0 will use the **1.x.x** build-number series. Product version and build number remain separate identifiers. A build increment does not automatically create a new product version.

No Version 2.0 release date or final release build is assigned by this roadmap.

## 5. Current status and dependencies

| Item | Current status |
|---|---|
| Version 1.0 · Build 0.5.4 | Current Production release |
| Version 1.0 evaluation | Two Titans Umpire Executive members are testing |
| Titans-inspired visual refresh | Proposed; design ideas to be reviewed |
| DLS report presentation redesign | Proposed; existing content to be retained |
| Time-based interruption calculations | Proposed; awaiting review of four calculation forms and applicable PCs |
| Version 2.0 Development implementation | Not yet started under this roadmap |
| Production promotion | Not authorised by this roadmap |

## 6. Scope and change control

This roadmap captures the enhancements discussed to date. It does not freeze detailed requirements, prescribe unprovided calculation rules, or constitute approval for implementation or release.

Additional design ideas and feedback from Version 1.0 testing may be added through controlled updates to this document. Changes to the roadmap do not authorise Production changes.

All calculation changes must remain aligned with ICC DLS 6.0 and the applicable Playing Conditions. Where competition-specific PCs differ, the implementation must reflect the correct applicable rules and must not silently apply one competition's assumptions to another.

---

**Document owner:** Project owner / Change Authority  
**Implementation environment:** Development  
**Production release authority:** Explicit project-owner approval required
