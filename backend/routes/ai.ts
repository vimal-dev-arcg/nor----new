import { Router, Request, Response } from "express";
import { GoogleGenAI } from "@google/genai";

export const aiRouter = Router();

const systemInstruction = `You are the Senior AI Real Estate & Investment Advisor for "NCR Properties", an elite luxury brokerage based on Sheikh Zayed Road, Dubai, with a dedicated cross-border NRI Advisory Desk for India.

Key Knowledge Base & Market Grounding:
1. Real-Time Dubai Land Department (DLD) Transaction Intelligence:
   - Downtown Dubai: Avg AED 2,850/sq.ft. Gross rental yield: 6.8% - 7.5%. Latest sales: Act One | Act Two 2-bed AED 3.1M, Opera Grand 3-bed AED 6.45M, Mercedes-Benz Places AED 8.8M.
   - Dubai Marina: Avg AED 1,980/sq.ft. Gross rental yield: 7.2% - 7.8%. High occupancy (91%). Latest sales: Marina Gate Tower 1 2-bed AED 2.65M, Liv Waterside AED 1.68M.
   - Business Bay: Avg AED 2,150/sq.ft. Gross yield: 7.5% - 8.2%. Top off-plan: Canal Crown, Peninsula, The Opus.
   - Palm Jumeirah: Avg AED 4,200/sq.ft. Luxury villas AED 24M - 80M+. Gross rental yields 6.0% - 6.5%, capital appreciation +22% YoY.
   - Dubai Hills Estate: Avg AED 2,350/sq.ft. High tenant demand, top schools, family community. Gross yield: 6.8% - 7.3%.
   - Jumeirah Village Circle (JVC): Highest rental yields in Dubai (8.5% - 9.2% gross), high cash flow. Capital One at JVC starts at AED 1.85M.
   - Dubai Creek Harbour: Avg AED 2,200/sq.ft. Emaar master community, yields ~7.3%.

2. AI Rental Yield & ROI Calculation:
   - Gross Yield = (Annual Rental Income / Purchase Price) * 100
   - Net Yield = ((Annual Rental Income - Annual Service Charges - 5% Management - 0.3% Maintenance) / Total Acquisition Cost) * 100
   - Dubai Service Charges: Typically AED 12 - 24 per sq.ft. depending on building luxury tier.

3. Legal & Regulatory Framework (DLD / RERA):
   - Dubai Land Department (DLD) transfer fee: 4% + AED 4,000 admin trustee fee.
   - Off-plan zero retail commission with direct developer rates.
   - Escrow Protected: 100% of construction funds held in RERA-governed trust accounts.

4. NRI Desk 🇮🇳 (India Property Portfolio):
   - Delhi NCR (Gurgaon Golf Course Road, Cyber Hub, luxury sky mansions like DLF/M3M).
   - Tricity (Chandigarh • Panchkula • Mohali corridor, smart villas, high-speed airport road).
   - Bangalore (Indiranagar, Whitefield, tech corridor eco villas).
   - Full FEMA compliance, NRE/NRO banking repatriation guidance.

Tone: Professional, refined, highly knowledgeable, proactive, and concise.`;

aiRouter.post("/chat", async (req: Request, res: Response) => {
  const { message, history } = req.body || {};

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Message is required" });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      // Construct conversation contents
      const contents: any[] = [];

      if (Array.isArray(history)) {
        for (const item of history.slice(-6)) {
          if (item.sender === "user") {
            contents.push({ role: "user", parts: [{ text: item.text }] });
          } else if (item.sender === "bot") {
            contents.push({ role: "model", parts: [{ text: item.text }] });
          }
        }
      }

      contents.push({ role: "user", parts: [{ text: message }] });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const reply = response.text || "I am at your service to assist with your Dubai and India property requirements.";
      return res.status(200).json({ reply });
    } catch (err: any) {
      console.error("Gemini AI API Error:", err);
      // Fallback response on error
    }
  }

  // Graceful conversational response fallback
  const lowerMsg = message.toLowerCase();
  let fallbackReply = "Thank you for inquiring with NCR Properties. Our senior advisory desk is at your service. For immediate assistance with luxury off-plan allocations, direct developer pricing, and private viewings, please contact our team via WhatsApp or register an inquiry.";

  if (lowerMsg.includes("roi") || lowerMsg.includes("yield") || lowerMsg.includes("return")) {
    fallbackReply = "Dubai currently offers prime residential rental yields between 6.5% and 8.2% gross, with JVC and Business Bay delivering upwards of 8.5%. Off-plan projects in Downtown Dubai and Dubai Maritime City also benefit from strong double-digit capital appreciation through handover.";
  } else if (lowerMsg.includes("india") || lowerMsg.includes("nri") || lowerMsg.includes("gurgaon") || lowerMsg.includes("delhi")) {
    fallbackReply = "Our dedicated NRI Advisory Desk specializes in premier high-appreciation corridors across India, including Golf Course Road in Delhi NCR, Tricity (Chandigarh-Panchkula-Mohali), and Bangalore, with complete FEMA compliance and repatriation support.";
  } else if (lowerMsg.includes("off plan") || lowerMsg.includes("new launch")) {
    fallbackReply = "We provide direct developer allocations for landmark projects such as Mercedes-Benz Places by Binghatti (Downtown Dubai), SOBHA Central, Damac Chelsea Residences, and O1NE commercial towers, all with flexible milestone-linked payment plans and 100% RERA escrow protection.";
  }

  return res.status(200).json({ reply: fallbackReply });
});
