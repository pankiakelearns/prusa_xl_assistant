import { TroubleshootingCard } from "../types";

export const TROUBLESHOOTING_CATALOG: TroubleshootingCard[] = [
  {
    id: "bed-adhesion",
    title: "First Layer Peeling / Poor Bed Adhesion",
    category: "adhesion",
    symptom: "Print edges or corner lines peel off, warp, or the model detaches completely from the heatbed.",
    steps: [
      "Wait for the heatbed to cool completely to room temperature before touching.",
      "Clean the PEI flexible steel sheet with 90%+ Isopropyl Alcohol (IPA) using a clean lint-free paper towel.",
      "In PrusaSlicer, make sure the 'Brim' option is checked (helps secure the first layer firmly).",
      "Decrease print speed for the initial layer if needed, and double-check bed levelling (runs automatically via Load Cell).",
      "Keep hands off the print surface — skin oils are the primary enemy of heatbed adhesion!"
    ],
    requiresHardwareReplacement: false,
    requiresSupportLink: false,
    advice: "PLA adheres perfectly to clean smooth/textured PEI sheets when wiped clean of any oils."
  },
  {
    id: "filament-clog",
    title: "Filament Jam or Extrusion Failures",
    category: "extrusion",
    symptom: "Extruder clicks or slips, little to no plastic comes out of the nozzle, or filament doesn't purge.",
    steps: [
      "Heat up the active toolhead to the loading temperature of the filament (PLA is usually 215°C - 230°C).",
      "From the printer dashboard, click 'Filament' -> select 'Unload filament' and gently remove the current spool line.",
      "If the filament does not purge, select 'Purge More' or 'Retry' on the LCD dashboard screen.",
      "Attempt a 'Cold Pull' using a piece of cleaning filament to clear micro-debris inside the nozzle.",
      "If a physical clog is stuck in the Nextruder gears, do not force it - contact a lab administrator."
    ],
    requiresHardwareReplacement: false,
    requiresSupportLink: false,
    advice: "Always let the printer finish its heating cycle before feeding or pulling filament."
  },
  {
    id: "tube-mismatch",
    title: "Wrong Filament Tube Feed Error",
    category: "extrusion",
    symptom: "Filament sensor reports no material or fails feed commands; active toolhead remains hungry.",
    steps: [
      "Verify which toolhead you are attempting to load.",
      "For Toolhead 1: Always load your filament line into the TOP side tube.",
      "For Toolheads 2 & 3: Feed through the BOTTOM side tubes.",
      "Push filament line through the tube until you feel mechanical resistance inside the toolhead sensor.",
      "Click 'Retry' on the printer LCD to trigger the auto-loading drive gear."
    ],
    requiresHardwareReplacement: false,
    requiresSupportLink: false,
    advice: "Feeding the wrong tube leads to toolhead hunger and friction sensor calibration alerts."
  },
  {
    id: "calibration-fail",
    title: "Toolhead Calibration Homing Error",
    category: "calibration",
    symptom: "Carriage collides, makes deep vibrating noises, or reports toolhead coordinate alignment errors on startup.",
    steps: [
      "Before turning off the printer, ALWAYS make sure the active toolhead is safely returned to its dock.",
      "To do this, navigate to Control -> 'Park Current Tool' on the printer LCD.",
      "If a different toolhead is active, navigate to 'Pick Tool (No.)' first, pick it, then select 'Park Current Tool'.",
      "Check that the multi-tool rails and contacts are free of plastic whiskers, dust, or strings.",
      "Re-calibrate the XYZ offsets under the printer's Calibration menu."
    ],
    requiresHardwareReplacement: false,
    requiresSupportLink: false,
    advice: "Powering off the Prusa XL without parking current tools triggers carriage position offsets when turned back on!"
  },
  {
    id: "heater-malfunction",
    title: "Heater Cartridge Failure / Thermal Runaway Error",
    category: "hardware",
    symptom: "Screen flashes 'Heater Error', 'MAXTEMP/MINTEMP', or the toolhead stays cold while trying to preheat.",
    steps: [
      "Turn off the printer immediately and unplug the power cable from the wall outlet.",
      "Check the physical cabling leading to the malfunctioning Nextruder toolhead for burns or frayed insulation.",
      "Investigating this require electrical checking tools (using a Multimeter to test resistance) or disassembling core electrical elements."
    ],
    requiresHardwareReplacement: true,
    requiresSupportLink: true,
    advice: "Cabling and heater block failures are beyond basic lab troubleshooting. Do not attempt complex rewiring yourself due to burn and electrical hazards."
  },
  {
    id: "load-cell-error",
    title: "Load Cell Sensor Calibration Failure",
    category: "calibration",
    symptom: "Automatic bed leveling hits down too hard, fails during Z-probing, or displays Load Cell errors.",
    steps: [
      "Ensure there is NO residual plastic blobbing under the nozzle tip - even a small solid bead fools the sensor.",
      "Carefully clean the nozzle tip with a brass wire brush while it is hot (approx 200°C).",
      "Ensure the PEI steel sheet is resting perfectly flat on the magnetic heatbed studs with nothing underneath.",
      "Run the full Load Cell self-test under the Calibration -> Diagnostics path."
    ],
    requiresHardwareReplacement: false,
    requiresSupportLink: false,
    advice: "The load cell is extremely sensitive. Clean nozzle tips are a prerequisite for faultless bed level scans!"
  }
];
