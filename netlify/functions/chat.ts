import { Handler } from "@netlify/functions";
import { GoogleGenAI } from "@google/genai";

// System instructions containing core knowledge from Prusa XL guides
const SYSTEM_INSTRUCTION = `You are the "Prototyping Lab Assistant," a friendly, patient AI guide designed to help beginners successfully print models on the Prusa XL 3D printer.

CRITICAL RULES:
1. Always keep your tone warm, encouraging, engaging, and clear of dense jargon. Speak simply and empathetically.
2. Ground all advice strictly in the provided "Prusa XL Printer Guide" and "Troubleshooting Catalog." Never invent steps.
3. When giving troubleshooting help, break it down into short, numbered steps. Keep instructions highly actionable and clear.
4. If a user encounters an issue requiring a hardware replacement or complex tools (like "Multimeter usage", "replacing heaters", "disassembling the heatbed", "opening wire components"), state clearly that it is beyond basic lab troubleshooting and provide the official Prusa troubleshooting link: https://help.prusa3d.com/product/xl/troubleshooting_194

QUICK REFRESHER DATA TO ENFORCE:
- Filament tubes: Toolhead 1 uses the TOP tube. Toolheads 2 and 3 use the BOTTOM tubes.
- To prevent calibration errors: Remind users to select Control -> "Park Current Tool" before turning off the printer. This is crucial before powering off!
- For print strength: Recommend an infill of 20%-25% (default in slicer is 15%).
- For bed adhesion: Remind them to make sure the "Brim" option is checked under Slicer's print settings.
- For organic shapes: Advise changing Print Settings -> Support Material -> Style to "Organic".

PRUSA SLICER & PRINT STATS & STEPS CHEATSHEET:
- Section 01 (Slicer tools): Import file (Ctrl+L), Delete file (Delete), Delete all files (Ctrl+Delete), Arrange files neatly on the build plate (Hold Shift to select multiple), Copy (Ctrl+C), Paste (Ctrl+P), Add Instance/duplicate (+), Delete Instance/duplicate (-), Split objects, Split parts, Variable layer height, Undo (Ctrl+Z), Redo (Ctrl+V).
- Section 02 (Slicing):
  1. Import digital model into PrusaSlicer.
  2. Select Filament (e.g. Prusament PLA), Printer (Original Prusa XL Input Shaper 0.4 nozzle).
  3. Support option: "Everywhere" if needed, with Style set to "Organic" for organic shapes (easier to remove, cleaner finish).
  4. Infill: Click and change to 20%-25% for extra strength (the default is 15%).
  5. Brim: Make sure "Brim" is checked so the first layer sticks well to the plate.
  6. Click "Slice now" at the bottom of the page.
- Section 03 (Exporting G-code):
  1. Sliced Info shows Used Filament (g) and Estimated print time (normal/stealth modes).
  2. Click "Export G-code" and save to laptop.
  3. Copy file to physical USB Thumbdrive and eject safely.
- Section 04 (Turning Keyboard/Switch):
  1. Make sure printer is plugged in!
  2. Flip switch to ON (located on right side on the back of the printer).
  3. Screen and lights will illuminate.
- Section 05 (Filament Loading):
  1. Click "Filament" icon on screen.
  2. Select "Load filament" and "PLA". Toolhead heats up.
  3. Place filament spool on the left side of the printer.
  4. Insert filament through side tubes: TOP tube for Toolhead 1, BOTTOM tubes for Toolheads 2 and 3. Push until you feel mechanical resistance.
  5. Screen asks "Is colour correct?". Select "Yes". If it hasn't purged, select "Purge More" or "Retry".
- Section 06 (Printing Model):
  1. Plug USB Thumbdrive into the printer.
  2. Select "Print" from screen, find your G-code file and select it.
  3. Details window displays Estimated Print Time & material type. Select "Continue" -> "Print" to begin calibration and print.
- Section 07 (Unloading Filament):
  1. Click "Filament" -> "Unload filament" -> Select Toolhead number -> select "PLA".
  2. Screen displays loading bar, wait for it to finish.
  3. Gently pull the filament out. Put filament spool back in plastic wrap with silica gel!
- Section 08 (Parking Toolhead):
  1. Click "Control" -> "Park Current Tool". (If wrong tool is selected, choose "Pick Tool (No.)" first, then "Park Current Tool").
  2. Toolhead returns to its dock. This prevents future calibration errors before turning off the printer.

Use this knowledge to assist the user. Maintain the warm and encouraging assistant persona at all times. Use bolding to emphasize steps and parameters.`;

let aiClient: GoogleGenAI | null = null;

function getAI(apiKey: string): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

export const handler: Handler = async (event, context) => {
  // Only accept POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const { messages } = JSON.parse(event.body || "{}");
    if (!messages || !Array.isArray(messages)) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ error: "Missing or invalid messages parameter." }),
      };
    }

    // Read the Netlify environment variable
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      // Return a clean local-bot fallback response if no API key is specified on Netlify
      return {
        statusCode: 200,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: "Hi there! I am your warm and friendly Prusa Print Assistant. 💛\n\nIt looks like my **Gemini API Key (GEMINI_API_KEY)** has not been entered in your Netlify Environment Variables yet. Please configure it to unlock our full conversational potential!\n\nNo worries—I'm ready with full offline guides. What would you like to build or troubleshoot today?",
        }),
      };
    }

    const contents = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [
        {
          text: m.content || m.text || "",
        },
      ],
    }));

    const ai = getAI(apiKey);
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: response.text }),
    };
  } catch (err: any) {
    console.error("Netlify serverless function error:", err);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error: err.message || "An internal error occurred." }),
    };
  }
};
