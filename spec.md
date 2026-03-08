# Flash USDT Scam Investigation Trainer

## Current State
A basic Flash USDT UI demo with a send animation. No educational or investigative content.

## Requested Changes (Diff)

### Add
- Multi-section training app for CIB/security engineer presentations
- Section 1: What is Flash USDT -- explanation of the scam concept, how it works technically
- Section 2: Live Demo Simulation -- visual walkthrough of how the scam appears to a victim (UI only, no real transactions)
- Section 3: Red Flags -- checklist of warning signs investigators and victims should watch for
- Section 4: On-Chain Investigation Steps -- forensic analysis workflow (blockchain explorer steps, wallet tracing, transaction verification)
- Section 5: Evidence Collection -- documentation checklist for legal proceedings
- Section 6: Solution & Prevention -- recommendations for victims, exchanges, and law enforcement
- Navigation between sections (sidebar or tab-based)
- Progress tracker so presenter can see where they are in the session
- Print/export summary button for report generation

### Modify
- Replace the existing flash send demo UI with a contained "Demo" section inside the training module

### Remove
- Standalone flash send app as the primary interface

## Implementation Plan
1. Backend: store training module progress, session notes, and checklist completion state per session
2. Frontend: multi-section layout with sidebar navigation, section content components, interactive checklists, step-by-step investigation workflow, demo simulation panel, and summary/export view
