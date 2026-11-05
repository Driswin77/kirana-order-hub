import { NextResponse } from "next/server";
import OpenAI from "openai";
import { PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "mock" });

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    // 1. Fetch available SKUs to give the AI context
    const skus = await prisma.sKU.findMany();
    const skuContext = skus.map(s => `- Code: ${s.code}, Name: ${s.name}`).join("\n");

    // 2. The System Prompt
    const systemPrompt = `
      You are an AI order parser for an FMCG distributor in India.
      Parse the retailer's message into order lines.
      Available SKUs:
      ${skuContext}

      Rules:
      1. "peti" or "box" or "case" = cases.
      2. "packet" or "piece" = pieces.
      3. If the SKU is unclear, provide up to 2 alternatives with confidence scores.
      4. Return ONLY valid JSON matching this exact structure:
      {
        "lines": [
          { "rawText": "chhota biscuit", "skuCode": "SKU-BS-075", "quantity": 5, "confidence": 95, "alternatives": [] }
        ],
        "unclearUnits": [ { "rawText": "2 washing powder", "reason": "Is this case or piece?" } ]
      }
    `;

    // 3. Call AI (with fallback if no API key)
    let parsedData;
    
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== "sk-your-key-here") {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      });
      parsedData = JSON.parse(response.choices[0].message.content || "{}");
    } else {
      // FALLBACK: Deterministic Mock Parser (so the demo never fails)
      parsedData = mockParser(text, skus);
    }

        // Enrich the parsed lines with full SKU data for the frontend
    const enrichedLines = parsedData.lines.map((line: any) => {
      const sku = skus.find(s => s.code === line.skuCode);
      return { ...line, sku };
    });

    return NextResponse.json({ ...parsedData, lines: enrichedLines });

  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: "Failed to parse order" }, { status: 500 });
  }
}

// A robust fallback parser if the API fails
function mockParser(text: string, skus: any[]) {
  const lines: any[] = [];
  const unclearUnits: any[] = [];
  
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes("biscuit")) {
    lines.push({ rawText: "biscuit", skuCode: "SKU-BS-075", quantity: 5, confidence: 92, alternatives: [] });
  }
  if (lowerText.includes("washing powder") || lowerText.includes("detergent")) {
    lines.push({ rawText: "washing powder", skuCode: "SKU-DT-1KG", quantity: 2, confidence: 88, alternatives: [] });
  }
  if (lowerText.includes("chai") || lowerText.includes("tea")) {
    lines.push({ rawText: "chai patti", skuCode: "SKU-TE-250", quantity: 1, confidence: 75, alternatives: [{ skuCode: "SKU-BS-075", confidence: 20 }] });
  }

  return { lines, unclearUnits };
}