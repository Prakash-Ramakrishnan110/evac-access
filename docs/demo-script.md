# EvacAccess India — Guided Demonstration Script (Scenario EA-1001)

## Narrative: "Puri Coastal Inundation Emergency"

### Step 1: Login & Identity Verification
1. Open the Web Dashboard at `http://localhost:3000`.
2. Notice the prominent **DEMO / SIMULATION MODE** crisis banner.
3. Use quick-login to sign in as **Priya Sharma (Incident Coordinator - ODRF)**.

### Step 2: Situational Command Center
1. Observe the Command Center overview:
   - Incident: `ODISHA-PURI-FLOOD-2026`
   - Active Requests: 3
   - Shelters in Zone: 3
   - Freshness Status: Active (Updated 12m ago)
2. Click on **Assistance Requests** tab to review pending cases.

### Step 3: Vulnerable Citizen Case Review (`EA-1001`)
1. Open request `EA-1001` (Citizen with severe mobility impairment requiring wheelchair-accessible evacuation).
2. Click **Evaluate Route & Shelter Feasibility**.

### Step 4: Deterministic Feasibility Evaluation
1. **Candidate 1 (Puri High School Shelter)**:
   - System evaluates features.
   - Result: `UNSUITABLE`
   - Reason: "Destination shelter lacks verified step-free entrance (stairs only)."
2. **Candidate 2 (Community Hall Sector 4 via Coastal Road)**:
   - Shelter has wheelchair ramp, BUT Coastal Road segment observation shows water depth 35cm.
   - Result: `UNSUITABLE`
   - Reason: "Segment CR-02 is flooded (35cm depth). Hard barrier for wheelchair transit."
3. **Candidate 3 (Cyclone Shelter Jagannath via Station Road)**:
   - Shelter has ramp and power backup, route is elevated.
   - Result: `FEASIBLE_WITH_AVAILABLE_DATA`
   - Explanation: "All mandatory accessibility criteria verified with fresh hazard data."

### Step 5: Responder Dispatch & Audit
1. Coordinator assigns `Team Bravo (Medical Logistics)`.
2. Team status transitions from `ASSIGNED` $\rightarrow$ `ACKNOWLEDGED`.
3. Open **Audit Trail** and observe the tamper-evident log capturing the evaluator rationale and dispatch event.

### Step 6: Accessible Alert Preview
1. Open **Alerts Preview** tab.
2. Select target zone: "Sector 3 Lowlands".
3. Toggle high-contrast large font view and click **Play Audio Preview** (Hindi & English speech preview).
4. Verify notification disclaimer: "Preview mode only. Real broadcast requires authorized gateway integration."
