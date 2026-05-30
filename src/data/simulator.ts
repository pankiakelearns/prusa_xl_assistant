import { GuideStep } from "../types";

export const SIMULATION_STAGES: GuideStep[] = [
  {
    id: "slicer",
    title: "Slicing in PrusaSlicer",
    description: "Prepare the digital model file for the Prusa XL. To ensure a high success rate, beginners must configure infill strength, bed-adhesion brims, and support styles correctly.",
    actionRequired: "Configure settings: Infill to 20-25%, ensure 'Brim' is checked, and Support Style is set to 'Organic'. Then click 'Slice Now'!",
    completed: false,
    userInteractableType: "click_slice",
    hint: "Setting Infill to 20%-25% increases structural strength (default is 15%). The Brim checkbox helps bed adhesion, while Organic supports are easy to remove and protect complex overhangs!"
  },
  {
    id: "power",
    title: "Printer Power-On",
    description: "Now that your G-code file is saved onto your laptop, go to the printer in the lab. Ensure things are plugged in properly and boot up the main console.",
    actionRequired: "Toggle the power rocker switch on the back of the printer chassis to flip it 'ON'.",
    completed: false,
    userInteractableType: "switch_power",
    hint: "Make sure the power cord is pushed firmly into the printer inlet. The power switch is located near the plug at the back right-hand side."
  },
  {
    id: "filament",
    title: "Loading Filament Spool",
    description: "Heat up the printer and feed your Prusament PLA filament into the active toolhead.",
    actionRequired: "Choose a Toolhead. Feed the filament line into the correct side tube (TOP tube for Toolhead 1, BOTTOM tube for Toolheads 2 & 3). Click 'Push Filament' and confirm loading.",
    completed: false,
    userInteractableType: "select_toolhead",
    hint: "Mismatching tubes causes mechanical jam sensor errors. Remember: Toolhead 1 uses the top filament tube, while Toolheads 2 & 3 use the bottom tubes!"
  },
  {
    id: "printing",
    title: "Starting the Print",
    description: "Insert your USB Thumbdrive (holding your sliced G-code file), select your print job, and initiate the Load-Cell Calibration process.",
    completed: false,
    actionRequired: "Eject your virtual USB and insert it into the slot. Choose your sliced file, select 'Continue', and click 'Print' to observe the bed calibration and print build.",
    userInteractableType: "check_brim",
    hint: "Before printing starts, the Prusa XL will automatically swap tools and perform automatic nozzle height mapping using its built-in Load Cell sensor."
  },
  {
    id: "unload-park",
    title: "Safe Tear-down & Parking",
    description: "Success! Your model has printed beautifully. Now let's safely unload filament and park the toolhead. This is crucial before turning off power to prevent calibration offset errors.",
    actionRequired: "Choose 'Unload Filament' on screen, pull the filament line gently, and select 'Park Current Tool' to place the hotend back in its secure dock. Finally, flip the printer power 'OFF'!",
    completed: false,
    userInteractableType: "park_tool",
    hint: "Warning: Moving or shutting down the carriage when a tool is out of its dock desynchronizes carriage coordinates, leading to errors on the next power-on! Always 'Park Current Tool'."
  }
];
