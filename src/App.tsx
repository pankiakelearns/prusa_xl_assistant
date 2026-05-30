import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Wrench, 
  Bot, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  Printer, 
  RotateCcw, 
  Sparkles, 
  Usb, 
  Activity, 
  Clock, 
  Power, 
  ArrowRight, 
  Layers,
  Flame,
  HelpCircle,
  Hash,
  Send,
  ExternalLink,
  Info,
  ChevronRight,
  Sparkle
} from "lucide-react";
import { Message, SlicerStats, TroubleshootingCard } from "./types";
import { TROUBLESHOOTING_CATALOG } from "./data/troubleshooting";

// Interface for streaming text helper
interface StreamState {
  messageId: string;
  contentPlayed: string;
}

export default function App() {
  // Theme configuration is modern, clean, high-contrast crisp white minimalist, with Prusa classic orange highlights.
  
  // AI Chat states
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hi there! 💛 I'm your **Prusa Print Assistant from TO**. Welcome to the Prusa XL support zone. What can I help you with today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Active streaming feedback
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState("");
  const streamIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Quick Slicing reference inputs inside the sidebar for beginner prototyping calculations
  const [protoWeight, setProtoWeight] = useState<number>(35);
  const [protoInfill, setProtoInfill] = useState<number>(20);
  const [protoBrim, setProtoBrim] = useState<boolean>(true);
  const [protoSupport, setProtoSupport] = useState<"Organic" | "Grid" | "Snug">("Organic");
  
  // Simulated error lookup item
  const [activeErrorDetail, setActiveErrorDetail] = useState<TroubleshootingCard | null>(null);

  // Sidebar controls
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Scroll chat target
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText, isChatLoading]);

  // Clean intervals on unmount
  useEffect(() => {
    return () => {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    };
  }, []);

  // Word-by-word streaming animation helper
  const streamResultContent = (fullText: string, messageId: string) => {
    if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
    
    setStreamingMessageId(messageId);
    setStreamingText("");
    
    const words = fullText.split(" ");
    let currentWordIndex = 0;
    let accumulatedText = "";

    streamIntervalRef.current = setInterval(() => {
      if (currentWordIndex < words.length) {
        accumulatedText += (currentWordIndex === 0 ? "" : " ") + words[currentWordIndex];
        setStreamingText(accumulatedText);
        currentWordIndex++;
      } else {
        if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
        // After streaming is completed, append it to messages and clear streaming state
        setMessages(prev => {
          const exists = prev.some(m => m.id === messageId);
          if (exists) {
            return prev.map(m => m.id === messageId ? { ...m, content: fullText } : m);
          } else {
            return [...prev, {
              id: messageId,
              role: "assistant",
              content: fullText,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }];
          }
        });
        setStreamingMessageId(null);
        setStreamingText("");
      }
    }, 45); // highly responsive instant streams
  };

  // Base chat handler calling the server endpoint
  const handleSendMessage = async (textToSend?: string) => {
    const rawContent = (textToSend || userInput).trim();
    if (!rawContent) return;

    if (!textToSend) {
      setUserInput("");
    }

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: rawContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsChatLoading(true);

    // If streaming was ongoing, finalize it
    if (streamingMessageId) {
      if (streamIntervalRef.current) clearInterval(streamIntervalRef.current);
      setStreamingMessageId(null);
      setStreamingText("");
    }

    const currentMsgId = `ai-stream-${Date.now()}`;

    try {
      // Collect message history to send to server
      const chatHistory = [...messages, userMsg].map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatHistory })
      });

      if (!res.ok) {
        throw new Error("Chat request failed");
      }

      const data = await res.json();
      setIsChatLoading(false);
      streamResultContent(data.text, currentMsgId);
    } catch (err) {
      console.error(err);
      setIsChatLoading(false);
      
      // Smart Fallback stream based on trigger terms
      let fallbackText = "Oh! My connection to the Google GenAI server is currently paused. No worries! Here's immediate assistance from my local knowledge bank:\n\n";
      
      const lower = rawContent.toLowerCase();
      if (lower.includes("tube") || lower.includes("filament") || lower.includes("loading")) {
        fallbackText += "**FILAMENT TUBE DESIGNATIONS:**\n- **Toolhead 1** must feed into the **TOP tube**.\n- **Toolheads 2 and 3** must use the **BOTTOM tubes**.\n- To load: navigate to the screen and press `Filament` -> `Load Filament` -> Select PLA/PETG. Wait for heat-up, insert filament until gears lock, then tap 'Yes' once purged correctly!";
      } else if (lower.includes("stick") || lower.includes("adhesion") || lower.includes("peel") || lower.includes("warp")) {
        fallbackText += "**PRINT NOT STICKING FIXES:**\n1. Wait for the bed to cool before handling the print sheet.\n2. Clean the flexible PEI plate utilizing 90%+ Isopropyl Alcohol (IPA) and a clean paper towel.\n3. Make sure to tick the **Brim checkbox** in PrusaSlicer settings before exporting G-code. This increases the contact surface line of the first layer firmly!";
      } else if (lower.includes("support") || lower.includes("organic")) {
        fallbackText += "**ORGANIC SUPPORTS ADVOCACY:**\n- Navigate to Print Settings -> Support Material -> change style to **Organic**.\n- Organic style supports branch off beautifully, have very low printing footprints (saving material), and break away cleanly without complex cutting tools. Highly recommended for overhangs and organic shapes!";
      } else if (lower.includes("error") || lower.includes("calibration") || lower.includes("code") || lower.includes("park")) {
        fallbackText += "**AVOIDING CALIBRATION ERRORS:**\n- Before flipping the rear power switch to OFF, always choose: **Control -> Park Current Tool**.\n- This safely docks the Nextruder carriage. If you switch off power with tools unparked, carriage registration shifts, causing XYZ offset errors on the next initial boot!";
      } else {
        fallbackText += "For standard PLA prototyping models, make sure your **Infill is set to 20%-25%** for maximum structural stiffness, always check the **Brim** box for bed hold, and choose **Organic** style supports for pristine surface overhang outputs. \n\nWhat other part details or printing issues are you handling today?";
      }

      streamResultContent(fallbackText, currentMsgId);
    }
  };

  // Quick Side-button Triggers
  const handleQuickClick = (type: "started" | "loading" | "bed" | "errors") => {
    if (type === "started") {
      const userMsg: Message = {
        id: `user-started-${Date.now()}`,
        role: "user",
        content: "🚀 I want to get started with printing on the Prusa XL!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      const welcomeQuestionMsg: Message = {
        id: `getstarted-${Date.now()}`,
        role: "assistant",
        content: "Awesome choice! Let's get your first 3D print ready for our **Prusa XL multi-toolhead machine**. 🛠️\n\n**Do you have your 3D model file (usually .STL, .OBJ, or .3MF format) ready on your computer?**\n\nSelect an option below to proceed:",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        interactiveType: "get_started_question"
      };
      setMessages(prev => [...prev, userMsg, welcomeQuestionMsg]);
      return;
    }

    if (type === "errors") {
      const userMsg: Message = {
        id: `user-errs-${Date.now()}`,
        role: "user",
        content: "🚨 Show me how to troubleshoot Prusa XL error codes.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      const selectErrorMsg: Message = {
        id: `errorselect-${Date.now()}`,
        role: "assistant",
        content: "No worries! Let's find your solution. **What error message or mechanical symptom are you seeing on the Prusa XL screen?**\n\nSelect a common issue below for immediate assistance:",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        interactiveType: "error_codes_question"
      };
      setMessages(prev => [...prev, userMsg, selectErrorMsg]);
      return;
    }

    if (type === "loading") {
      const userMsg: Message = {
        id: `user-load-${Date.now()}`,
        role: "user",
        content: "How do I load filament with the Prusa XL correctly?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      const loadingGuideMsg: Message = {
        id: `loadingguide-${Date.now()}`,
        role: "assistant",
        content: "Loading filament on the **Prusa XL** is unique due to its modular **multi-tool head system** and side tube guide routing!\n\nHere are the precise loading protocols to follow:\n\n1. **Locate Filament Tubes on the side panels**:\n- **Toolhead 1** must feed into the **TOP tube**.\n- **Toolheads 2 and 3** must use the **BOTTOM tubes**.\n- **Toolheads 4 and 5** (if equipped) feed through the lower side paths.\n\n2. **Run Screen Commands**:\n- Tap the screen Dial -> Select \`Filament\` -> Select \`Load Filament\`.\n- Choose which toolhead number you are loading and select the material (e.g. **PLA** or **PETG**). Wait for the Nextruder nozzle block to heat up.\n\n3. **Insert Filament**:\n- Place the spool on the physical side rack.\n- Insert filament into the correct side tube on the frame. Push the filament in with light resistance until the internal drive gears grab and auto-feed it.\n\n4. **Confirm Purge**:\n- The print head will move out and extrude a small test purge line. Screen will prompt: *Is the color correct?* Tap **Yes** if the material is flowing clean and uniform!\n\nBelow is the official Prusa XL multi-tool routing guide:",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        interactiveType: "filament_images"
      };
      setMessages(prev => [...prev, userMsg, loadingGuideMsg]);
      return;
    }

    // Default to "bed" adhesion
    const prompt = "My first layer of PLA print is not sticking to the bed! How do I clean and prepare the plate for better adhesion?";
    handleSendMessage(prompt);
  };

  const handleGetStartedAnswer = (hasFile: boolean) => {
    if (hasFile) {
      const userMsg: Message = {
        id: `user-ans-yes-${Date.now()}`,
        role: "user",
        content: "Yes, I have the model file ready! Let's slice it.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, userMsg]);
      setIsChatLoading(true);

      const targetMsgId = `ai-stepby-step-${Date.now()}`;
      const systemGuide = `Fantastic! Let's slice your 3D model together in **PrusaSlicer** so it prints perfectly. Follow our first-time beginner instructions:

1. **Launch the PrusaSlicer App**
   Open **PrusaSlicer** on your laptop. Click **File -> Import -> Import STL/OBJ/3MF** (or press \`Ctrl + I\`) and load your file.

2. **Select Printer Profile**
   On the top-right Configuration Panel, change Printer preset to: **Original Prusa XL Input Shaper (0.4mm nozzle)**.

3. **Select your Print Settings Profile**
   Select **0.20mm structural** for general prototyping models, as it balances visual surface finish & fast print speed.

4. **Strength & Adhesion Tuning (TO Recommends)**:
   - **Infill**: Select the Infill dropdown on the right panel and set it to **20% or 25%** for extra prototyping strength. (The default 15% can sometimes warp or break under physical stress).
   - **Brim**: Check the **Brim checkbox**! This prints a 5mm adhesive strip around the outer footprint of your design automatically, dramatically increasing bed adhesion.
   - **Supports**: If your design features long overhangs or floating parts, click *Support Material* on the left sidebar menus, select *Everywhere*, and change Support Style to **Organic** inside the dropdown settings window. It uses minimal filament and snaps off safely without clipping tools!

5. **Let's Slice!**
   Click the orange **Slice now** button in the bottom right corner of PrusaSlicer. 

6. **Save & Export**:
   Verify print time and material usage on the HUD. Click **Export G-code**, and save the file onto your USB thumbdrive. 

Put the USB stick into the front of the Prusa XL machine, choose your file, and begin your calibration preheat! You are all set! 🚀`;

      setTimeout(() => {
        setIsChatLoading(false);
        streamResultContent(systemGuide, targetMsgId);
      }, 400);

    } else {
      const userMsg: Message = {
        id: `user-ans-no-${Date.now()}`,
        role: "user",
        content: "No, I don't have a 3D model file downloaded yet. Guide me.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, userMsg]);
      setIsChatLoading(true);

      const targetMsgId = `ai-where-to-${Date.now()}`;
      const sourcingGuide = `No problem at all! Let's get a beautiful file to test first. Here is exactly where and how to obtain high quality 3D prints as a beginner:

1. **Visit Printables.com**
   Go to [Printables.com](https://www.printables.com) - Prusa’s authorized, clean catalog of safe community models that print perfectly.

2. **Search for a beginner test piece**
   We recommend searching for a simple, quick item:
   - **Calibration Cat ("3DBenchy" or "Calicat")**
   - **Prusa XL Nozzle Storage Bin**
   - **Desk Phone Stand or Cable Clip**

3. **Download File**
   Click the green **Download** button on Printables. Always download the RAW file format (which ends in \`.STL\` or \`.3MF\`).

Once downloaded and stored on your laptop, hit the **Get Started** button on our sidebar again, select **Yes**, and I'll walk you through PrusaSlicer step-by-step! ⚙️`;

      setTimeout(() => {
        setIsChatLoading(false);
        streamResultContent(sourcingGuide, targetMsgId);
      }, 400);
    }
  };

  const handleErrorCodeAnswer = (errType: string) => {
    let responseText = "";
    let userMessageText = "";

    if (errType === "xyz") {
      userMessageText = "I see a 🔴 XYZ Calibration Fail (Err: 17301) on the screen.";
      responseText = `## Troubleshooting 🔴 XYZ Calibration Fail (Err: 17301)

On the Prusa XL, this usually triggers when a toolhead carriage limit mechanical switch fails to click, or belt loose slippage exists! Here are the steps:

1. **Verify Toolhead Dock Parking status**:
   - Power off. Always make sure the toolheads inside the docks are fully seated. If a head is loosely docked, the carriage collision testing fails.
2. **Clear mechanical obstacles**:
   - Check the linear rails and back belt paths for any stray filament blobs or zip-ties.
3. **Belt tension examination**:
   - Make sure your belts can bend slightly without extreme play. 

Need complex hardware parts swapped? Check out Prusa's manual: https://help.prusa3d.com/product/xl/troubleshooting_194`;
    } else if (errType === "loadcell") {
      userMessageText = "I see a 🟠 Load Cell Nozzle Sensor Homing Error.";
      responseText = `## Troubleshooting 🟠 Load Cell / Nozzle Sensor Error

The Nextruder uses an advanced **Load Cell sensor** to gauge physical nozzle contact on the steel heatbed. To correct a Load Cell offset trigger:

1. **Clean Nozzle Tip**:
   - Gently clean off any plastic residue or hair stringing from the tip using a brass wire brush. A cold blob registers false contact.
2. **Zero Tension Check**:
   - Avoid touching, nudging, or pulling on the PTFE tube or wiring harness while the calibration sequences or print starts!
3. **Cable slot seating**:
   - Ensure the Nextruder board connections are clicked in fully on the back carriage box.`;
    } else if (errType === "thermal") {
      userMessageText = "I see a 🟡 Hotend Thermal Runaway (Err: 17204) trigger.";
      responseText = `## Troubleshooting 🟡 Thermal Runaway (Err: 17204)

This signifies a safe shutdown when heater sensors read unrealistic temperatures or rapid cold drops.

1. **Draft Check**:
   - Ensure room windows aren't creating heavy cold drafts on the exposed heatbed.
2. **Silicon Sock usage**:
   - Verify the hotend block has the clean black/grey **Silicon Sock** installed to insulate heat.
3. **Plug Verification**:
   - Verify the Dwarf board thermistor plug is securely positioned in the socket on the Nextruder.`;
    } else if (errType === "canbus") {
      userMessageText = "I see a 🔵 Toolhead CAN communication Error on the display.";
      responseText = `## Troubleshooting 🔵 Toolhead CAN Communication Error

The XL utilizes high-speed CAN communication protocol between the Buddy motherboard and each Nextruder.

1. **Full Power Reset**:
   - Turn the back power switch to OFF, wait 10 seconds, and turn back ON.
2. **Cable integrity check**:
   - Inspect the durable flat tool cables leading to any unresponding toolhead for visual tears or sharp crimping.
3. **Buddy board slot**:
   - Ensure cable socket connections are plugged tight on both ends.`;
    } else {
      userMessageText = "I have an unlisted or other Error Code.";
      responseText = `For generic warnings or custom firmware error integers on the Prusa XL:

1. **Search with Code**:
   - Look up the exact error code at the official Prusa Help Desk.
2. **Firmware Reload**:
   - Check if your XL is running updated firmware via USB dashboard.
3. **Authorized Guides**:
   - Visit the authorized help desk: https://help.prusa3d.com/product/xl/troubleshooting_194 to look up custom components!`;
    }

    const userMsg: Message = {
      id: `user-err-${Date.now()}`,
      role: "user",
      content: userMessageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setIsChatLoading(true);

    const targetMsgId = `ai-err-resolve-${Date.now()}`;
    setTimeout(() => {
      setIsChatLoading(false);
      streamResultContent(responseText, targetMsgId);
    }, 400);
  };

  // Lightweight slicer calculations inside the left reference sidebar
  const calcWeight = protoWeight * (1 + (protoInfill - 15) * 0.02) * (protoBrim ? 1.05 : 1.0) * (protoSupport === "Organic" ? 1.15 : 1.05);
  const costPLA = (calcWeight * 0.032).toFixed(2);
  const metersPLA = (calcWeight * 0.336).toFixed(1);
  const estimateHours = Math.max(1, Math.round(calcWeight * 3.5)); // in minutes approx, converted
  const printHours = Math.floor(estimateHours / 60);
  const printMins = estimateHours % 60;

  return (
    <div className="min-h-screen bg-[#fafaf9] text-zinc-800 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      
      {/* Upper Top Navbar - clean white minimalist */}
      <header className="bg-white border-b border-zinc-200/80 px-6 py-4 sticky top-0 z-40 transition shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500 hover:bg-orange-600 flex items-center justify-center text-white transition-colors">
              <Printer className="w-4 h-4 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-500">
                  Prusa XL Suite
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-ping"></span>
              </div>
              <h1 className="text-sm font-semibold text-zinc-900 tracking-tight">TO Prototyping Lab Assistant</h1>
            </div>
          </div>

        </div>
      </header>

      {/* Main Column Grid */}
      <div className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 md:grid-cols-12 gap-0 h-[calc(100vh-68px)] overflow-hidden">
        
        {/* LEFT SIDEBAR: "Quick Click" beginner buttons & stats reference */}
        <aside className="md:col-span-4 xl:col-span-3 bg-white border-r border-zinc-200 p-6 flex flex-col justify-between overflow-y-auto gap-6 shrink-0">
          
          <div className="flex flex-col gap-6">
            
            {/* Short introductory guidelines */}
            <div>
              <h2 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Active Guidelines
              </h2>
              <div className="bg-orange-50/50 rounded-xl p-3.5 border border-orange-100 text-xs text-zinc-650 leading-relaxed space-y-1.5 shadow-2xs">
                <p className="font-medium text-orange-850 flex items-center gap-1.5">
                  <Sparkle className="w-3.5 h-3.5 text-orange-500 shrink-0" /> Welcome to the Lab!
                </p>
                <p>
                  I'm your TO printing companion to guide you through slicing with our <strong>Prusa XL Multi-Toolhead machine</strong>. Tap any quick button to begin troubleshooting!
                </p>
              </div>
            </div>

            {/* Beginner Quick Click Buttons requested */}
            <div>
              <div className="flex items-center justify-between mb-3 border-b border-zinc-100 pb-1">
                <h3 className="text-xs font-extrabold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-orange-500" /> Quick Fix
                </h3>
                <span className="text-[10px] text-zinc-400 font-mono font-bold text-orange-500">Beginner Issues</span>
              </div>
              
              <div className="space-y-2">
                <button
                  id="btn-get-started"
                  onClick={() => handleQuickClick("started")}
                  className="w-full text-left bg-[#fafaf9] hover:bg-orange-50/40 text-zinc-700 hover:text-orange-950 font-medium py-3 px-3.5 rounded-xl border border-zinc-200/80 hover:border-orange-200 transition-all flex items-center justify-between group shadow-2xs whitespace-nowrap cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-orange-100 group-hover:bg-orange-200 flex items-center justify-center text-orange-650 text-xs transition">
                      <Sparkles className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-xs tracking-tight">Get Started</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-orange-500 transition-transform group-hover:translate-x-0.5" />
                </button>

                <button
                  id="btn-filament-loading"
                  onClick={() => handleQuickClick("loading")}
                  className="w-full text-left bg-[#fafaf9] hover:bg-orange-50/40 text-zinc-700 hover:text-orange-950 font-medium py-3 px-3.5 rounded-xl border border-zinc-200/80 hover:border-orange-200 transition-all flex items-center justify-between group shadow-2xs cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-orange-100 group-hover:bg-orange-205 flex items-center justify-center text-orange-650 text-xs transition">
                      <Flame className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-xs tracking-tight">Filament Loading</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-orange-500 transition-transform group-hover:translate-x-0.5" />
                </button>

                <button
                  id="btn-print-not-sticking"
                  onClick={() => handleQuickClick("bed")}
                  className="w-full text-left bg-[#fafaf9] hover:bg-orange-50/40 text-zinc-700 hover:text-orange-950 font-medium py-3 px-3.5 rounded-xl border border-zinc-200/80 hover:border-orange-200 transition-all flex items-center justify-between group shadow-2xs cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-blue-50 group-hover:bg-blue-150 flex items-center justify-center text-blue-600 text-xs transition">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-xs tracking-tight">Print Not Sticking</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-orange-500 transition-transform group-hover:translate-x-0.5" />
                </button>

                <button
                  id="btn-error-codes"
                  onClick={() => handleQuickClick("errors")}
                  className="w-full text-left bg-[#fafaf9] hover:bg-orange-50/40 text-zinc-700 hover:text-orange-950 font-medium py-3 px-3.5 rounded-xl border border-zinc-200/80 hover:border-orange-200 transition-all flex items-center justify-between group shadow-2xs cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-red-50 group-hover:bg-red-150 flex items-center justify-center text-red-650 text-xs transition">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-xs tracking-tight">Error Codes</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-orange-500 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>

            {/* Quick Estimates Config Card block */}
            <div className="border border-zinc-150 bg-[#fafaf9] rounded-2xl p-4 space-y-3 shadow-3xs">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                <span className="text-xs font-extrabold text-zinc-800 uppercase tracking-tight flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-orange-500" /> Slicer Sandbox
                </span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded">
                  Estimate
                </span>
              </div>

              <div className="space-y-2.5">
                {/* Weight slider */}
                <div>
                  <div className="flex justify-between text-[11px] text-zinc-650 mb-1">
                    <span>Base Model Dry Weight:</span>
                    <span className="font-mono text-zinc-900 font-semibold">{protoWeight}g</span>
                  </div>
                  <input 
                    type="range" 
                    min="5" 
                    max="150" 
                    value={protoWeight}
                    onChange={(e) => setProtoWeight(Number(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                </div>

                {/* Infill Strength Configurer */}
                <div>
                  <div className="flex justify-between text-[11px] text-zinc-650 mb-1">
                    <span>Strength Infill:</span>
                    <span className={`font-mono font-semibold ${protoInfill >= 20 ? "text-emerald-600" : "text-amber-600"}`}>
                      {protoInfill}% {protoInfill >= 20 ? "💪" : "⚙️"}
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="45" 
                    step="5"
                    value={protoInfill}
                    onChange={(e) => setProtoInfill(Number(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                  <p className="text-[9px] text-zinc-400 mt-0.5 leading-tight">
                    *Default in slicer is 15%. Recommend 20%-25% for high print strength.
                  </p>
                </div>

                {/* Brim adhesion switch */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-zinc-650">Brim Adhesion:</span>
                  <button 
                    onClick={() => setProtoBrim(!protoBrim)}
                    className={`px-2 py-1 text-[10px] rounded font-bold transition flex items-center gap-1 cursor-pointer border ${
                      protoBrim 
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                        : "bg-zinc-100 border-zinc-200 text-zinc-400"
                    }`}
                  >
                    {protoBrim ? "Checked ✓" : "Off ✗"}
                  </button>
                </div>

                {/* Support Material style option override */}
                <div>
                  <span className="text-[11px] text-zinc-650 block mb-1">Underhang Support Style:</span>
                  <div className="grid grid-cols-3 gap-1">
                    {(["Grid", "Snug", "Organic"] as const).map(style => (
                      <button
                        key={style}
                        onClick={() => setProtoSupport(style)}
                        className={`py-1 text-[9px] font-bold rounded cursor-pointer transition ${
                          protoSupport === style 
                            ? "bg-orange-500 text-white" 
                            : "bg-zinc-100 hover:bg-zinc-200 text-zinc-650"
                        }`}
                      >
                        {style} {style === "Organic" && "🍀"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Estimate Result Panel */}
                <div className="bg-white border border-zinc-200/60 p-3 rounded-xl mt-2 space-y-1 text-[11px] font-mono leading-relaxed">
                  <span className="text-[9px] font-bold tracking-tight text-zinc-400 block font-sans">ESTIMATED EXTRUSION METRICS:</span>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Filament weight:</span>
                    <span className="text-zinc-800 font-bold">{calcWeight.toFixed(1)}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Length needed:</span>
                    <span className="text-zinc-800 font-medium">{metersPLA} meters</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Filament cost:</span>
                    <span className="text-emerald-600 font-bold">${costPLA}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-dashed border-zinc-200 text-[11px]">
                    <span className="text-zinc-500 font-sans">Print duration:</span>
                    <span className="text-orange-600 font-bold font-mono">
                      {printHours > 0 ? `${printHours}h ` : ""}{printMins}m
                    </span>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Catalog help reference list */}
          <div className="pt-4 border-t border-zinc-200/80 text-[11px] text-zinc-400 space-y-2">
            <div className="flex items-center gap-1">
              <Info className="w-3 h-3 text-orange-500 shrink-0" />
              <span className="font-semibold text-zinc-700">Lab Assistant Protocols</span>
            </div>
            <p className="leading-snug">
              Consulting hardware replacement errors? I will direct you back to authorized official Prusa guides. Keep hands safe!
            </p>
          </div>

        </aside>

        {/* RIGHT SIDEBAR / WORKSPACE: CLEAN MINIMALIST CHAT CONSOLE */}
        <main className="md:col-span-8 xl:col-span-9 flex flex-col bg-[#fdfdfd] h-full overflow-hidden">
          
          {/* Chat Window Top Guide Header */}
          <section className="bg-white border-b border-zinc-200/80 px-6 py-4 flex items-center justify-between shadow-3xs shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-base text-zinc-800">🛠️</span>
              <h2 className="text-sm font-bold text-zinc-900 tracking-tight">Prototyping Lab Guide</h2>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="inline-flex w-2.5 h-2.5 rounded-full bg-orange-500"></span>
              <span className="text-xs font-mono font-medium text-zinc-500">Prusa XL OS online</span>
            </div>
          </section>

          {/* Conversational Stream Frame */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-custom">
            
            {messages.map((m) => {
              const isAi = m.role === "assistant";
              return (
                <div 
                  key={m.id} 
                  className={`flex gap-3 max-w-3xl ${isAi ? "mr-auto" : "ml-auto flex-row-reverse"}`}
                >
                  {/* Icon profile */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    isAi ? "bg-orange-500 text-white" : "bg-zinc-800 text-zinc-200"
                  }`}>
                    {isAi ? <Bot className="w-4 h-4" /> : <div className="text-[10px] font-mono">USER</div>}
                  </div>

                  <div className="space-y-1">
                    <div className={`rounded-2xl p-4 ${
                      isAi 
                        ? "bg-white border border-zinc-200/80 text-zinc-800 shadow-3xs" 
                        : "bg-zinc-800 text-zinc-100 shadow-md"
                    }`}>
                      {/* Sub-formatting system advice content */}
                      <div className="text-xs md:text-sm leading-relaxed whitespace-pre-line">
                        {renderMessageContent(m.content, isAi)}
                      </div>

                      {/* Interactive Get Started Choice */}
                      {isAi && m.interactiveType === "get_started_question" && (
                        <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-zinc-100">
                          <button
                            onClick={() => handleGetStartedAnswer(true)}
                            className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg cursor-pointer transition shadow-2xs flex items-center gap-1"
                          >
                            Yes, I have it ready! 👍
                          </button>
                          <button
                            onClick={() => handleGetStartedAnswer(false)}
                            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold px-3.5 py-1.5 rounded-lg cursor-pointer transition border border-zinc-200"
                          >
                            No, not yet. 🔍
                          </button>
                        </div>
                      )}

                      {/* Interactive Error Code Selection Grid */}
                      {isAi && m.interactiveType === "error_codes_question" && (
                        <div className="mt-4 space-y-2 pt-3 border-t border-zinc-100">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <button
                              onClick={() => handleErrorCodeAnswer("xyz")}
                              className="text-left bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-medium p-2 rounded-lg cursor-pointer border border-red-100 transition"
                            >
                              🔴 XYZ Calibration Fail (Err: 17301)
                            </button>
                            <button
                              onClick={() => handleErrorCodeAnswer("loadcell")}
                              className="text-left bg-orange-50 hover:bg-orange-100 text-orange-700 text-[11px] font-medium p-2 rounded-lg cursor-pointer border border-orange-100 transition"
                            >
                              🟠 Load Cell Nozzle Sensor Homing Fail
                            </button>
                            <button
                              onClick={() => handleErrorCodeAnswer("thermal")}
                              className="text-left bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-medium p-2 rounded-lg cursor-pointer border border-amber-100 transition"
                            >
                              🟡 Hotend Thermal Runaway (Err: 17204)
                            </button>
                            <button
                              onClick={() => handleErrorCodeAnswer("canbus")}
                              className="text-left bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-medium p-2 rounded-lg cursor-pointer border border-blue-100 transition"
                            >
                              🔵 Toolhead CAN communication Error
                            </button>
                          </div>
                          <button
                            onClick={() => handleErrorCodeAnswer("other")}
                            className="w-full text-center bg-zinc-100 hover:bg-zinc-200 text-zinc-650 text-[11px] font-medium py-1.5 rounded-lg cursor-pointer transition border border-zinc-200"
                          >
                            ⚪ Other / Unknown Error Code
                          </button>
                        </div>
                      )}

                      {/* Interactive Filament Loading Schematic */}
                      {isAi && m.interactiveType === "filament_images" && (
                        <div className="mt-4 bg-zinc-50 border border-zinc-200 rounded-xl p-3.5 space-y-3">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-600 block">
                            Prusa XL physical Side Feeding routing
                          </span>
                          
                          {/* Tactile map illustration */}
                          <div className="grid grid-cols-12 gap-2 items-center text-center">
                            
                            {/* Spools */}
                            <div className="col-span-4 space-y-1.5">
                              <div className="bg-orange-50 text-orange-800 p-2 font-mono text-[9px] font-bold rounded-lg border border-orange-200">
                                spool 1 (PLA)
                              </div>
                              <div className="bg-zinc-100 text-zinc-600 p-2 font-mono text-[9px] font-semibold rounded-lg border border-zinc-200">
                                spool 2 (PETG)
                              </div>
                              <div className="bg-zinc-100 text-zinc-600 p-2 font-mono text-[9px] font-semibold rounded-lg border border-zinc-200">
                                spool 3 (Flex)
                              </div>
                            </div>

                            {/* Tube arrows */}
                            <div className="col-span-4 flex flex-col justify-around h-full space-y-2">
                              <div className="flex flex-col items-center">
                                <span className="bg-emerald-500 text-white font-mono font-bold px-1.5 py-0.5 text-[8px] rounded uppercase">Top Tube</span>
                                <span className="text-zinc-600 font-bold text-[9px] leading-tight">➡️ Toolhead 1</span>
                              </div>
                              <div className="flex flex-col items-center">
                                <span className="bg-orange-400 text-white font-mono font-bold px-1.5 py-0.5 text-[8px] rounded uppercase">Bottom Tube</span>
                                <span className="text-zinc-600 font-bold text-[9px] leading-tight">➡️ Toolhead 2</span>
                              </div>
                            </div>

                            {/* Nextruder Blocks */}
                            <div className="col-span-4 space-y-1.5">
                              <div className="bg-orange-500 text-white p-2 font-mono text-[9px] font-bold rounded-lg shadow-3xs">
                                Nextruder #1
                              </div>
                              <div className="bg-zinc-700 text-zinc-100 p-2 font-mono text-[9px] font-semibold rounded-lg">
                                Nextruder #2
                              </div>
                              <div className="bg-zinc-700 text-zinc-100 p-2 font-mono text-[9px] font-semibold rounded-lg">
                                Nextruder #3
                              </div>
                            </div>

                          </div>

                          <div className="p-2.5 bg-amber-50 rounded-lg text-[10px] text-amber-800 leading-normal border border-amber-100">
                            💡 <strong>Rule Check:</strong> Feeding spool 1 or 2 into wrong corresponding level paths triggers physical feed friction or calibration drift fault! Check twice before you feed!
                          </div>
                        </div>
                      )}

                    </div>
                    <div className={`text-[10px] text-zinc-400 font-mono px-2 flex gap-2 ${isAi ? "justify-start" : "justify-end"}`}>
                      <span>{m.timestamp}</span>
                      {isAi && <span>• Handled locally</span>}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Currently streaming live display */}
            {streamingMessageId && (
              <div className="flex gap-3 max-w-3xl mr-auto">
                <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="bg-white border border-orange-200/80 rounded-2xl p-4 text-zinc-800 shadow-xs relative">
                    <div className="text-xs md:text-sm leading-relaxed whitespace-pre-line">
                      {renderMessageContent(streamingText, true)}
                    </div>
                    {/* Pulsing end cursor indicating typing activity */}
                    <span className="inline-block w-2.5 h-4 ml-1 bg-orange-500 animate-pulse align-middle" />
                  </div>
                  <div className="text-[10px] text-orange-600 font-mono px-2 flex items-center gap-1">
                    <Activity className="w-3 h-3 animate-spin" />
                    <span>Streaming answers instantly...</span>
                  </div>
                </div>
              </div>
            )}

            {/* loading state */}
            {isChatLoading && (
              <div className="flex gap-3 mr-auto max-w-3xl">
                <div className="w-8 h-8 rounded-full bg-zinc-400 text-white flex items-center justify-center shrink-0 animate-bounce">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-zinc-100/55 rounded-2xl p-4 text-zinc-500 text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce delay-100"></span>
                  <span className="w-2 h-2 rounded-full bg-zinc-400 animate-bounce delay-200 font-sans">Consulting Prusa XL Expert Database...</span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Chat entry bar */}
          <div className="bg-white border-t border-zinc-200 p-4 shrink-0">
            <div className="max-w-4xl mx-auto flex gap-2">
              <input
                type="text"
                placeholder="Ask about PEI cleanings, Toolhead 1 tubes, calibration offset parking, support material style..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 bg-[#fafaf9] border border-zinc-200 text-zinc-800 text-xs md:text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-shadow focus:border-orange-500"
              />
              <button
                onClick={() => handleSendMessage()}
                className="bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-xl transition cursor-pointer shrink-0 shadow-2xs flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-1.5 justify-center mt-2.5 text-[10px] text-zinc-400">
              <Info className="w-3 h-3 text-orange-400" />
              <span>Feel free to type questions directly or interact via the Left Sidebar Help panels!</span>
            </div>
          </div>

        </main>

      </div>

    </div>
  );
}

/**
 * Renders bold Markdown text manually to avoid heavy visual breaks
 */
function renderMessageContent(text: string, isAi: boolean = true) {
  // A lightweight custom renderer that supports bold markdown **text**, bullet points and official troubleshooting URLs or normal lines.
  const parts = text.split("\n");
  const textColorClass = isAi ? "text-zinc-700" : "text-zinc-100";
  const boldColorClass = isAi ? "text-zinc-900 border-b border-orange-200/50" : "text-white border-b border-orange-400/50";
  const codeBgClass = isAi ? "bg-zinc-100 text-orange-600" : "bg-zinc-750 text-orange-300";

  return (
    <>
      {parts.map((line, i) => {
        let trimmed = line.trim();
        
        // Bullet list checks
        const isBullet = trimmed.startsWith("- ") || trimmed.startsWith("* ");
        const isNumbered = /^\d+\.\s/.test(trimmed);

        let content = line;
        if (isBullet) {
          content = trimmed.substring(2);
        } else if (isNumbered) {
          const match = trimmed.match(/^(\d+\.\s)(.*)/);
          content = match ? match[2] : trimmed;
        }

        // Render bold text parts inside line
        const subParts = content.split(/\*\*([\s\S]*?)\*\*/g);

        const renderedLine = subParts.map((sub, idx) => {
          if (idx % 2 === 1) {
            return <strong key={idx} className={`font-extrabold ${boldColorClass}`}>{sub}</strong>;
          }
          
          // Render inline code backticks or warnings
          const backticks = sub.split(/`([\s\S]*?)`/g);
          return backticks.map((bk, bIdx) => {
            if (bIdx % 2 === 1) {
              return <code key={bIdx} className={`${codeBgClass} px-1 py-0.5 rounded font-mono text-xs`}>{bk}</code>;
            }
            // Parse Prusa Help Center link if present
            if (bk.includes("https://help.prusa3d.com/")) {
              return (
                <a 
                  key={bIdx} 
                  href="https://help.prusa3d.com/product/xl/troubleshooting_194" 
                  target="_blank" 
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold underline pl-1"
                >
                  Official Prusa Troubleshooting Help Desk <ExternalLink className="w-3 h-3" />
                </a>
              );
            }
            return bk;
          });
        });

        if (isBullet) {
          return (
            <li key={i} className={`ml-4 list-disc ${textColorClass} py-0.5`}>
              <span>{renderedLine}</span>
            </li>
          );
        }

        if (isNumbered) {
          const numberLabel = trimmed.match(/^(\d+)/)?.[1] || "1";
          return (
            <div key={i} className="flex gap-2 py-1 items-start">
              <span className="font-bold font-mono text-orange-500 mt-0.5">{numberLabel}.</span>
              <span className={textColorClass}>{renderedLine}</span>
            </div>
          );
        }

        return (
          <p key={i} className={trimmed ? `mb-2 ${textColorClass}` : "h-2"}>
            {renderedLine}
          </p>
        );
      })}
    </>
  );
}
