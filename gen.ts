import { GoogleGenAI } from "@google/genai";
import fs from "fs";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function generate() {
  console.log("Generating agent...");
  const agentResp = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: 'A cool, realistic portrait of a secret agent in a dark suit, sunglasses, cinematic lighting, profile picture',
    config: {
      imageConfig: { aspectRatio: "1:1", imageSize: "512px" }
    }
  });
  
  for (const part of agentResp.candidates![0].content.parts) {
    if (part.inlineData) {
      fs.writeFileSync('public/agent.png', Buffer.from(part.inlineData.data, 'base64'));
      console.log("Agent saved.");
    }
  }

  console.log("Generating king...");
  const kingResp = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: 'A realistic portrait of a majestic king with a golden crown, regal attire, cinematic lighting, profile picture',
    config: {
      imageConfig: { aspectRatio: "1:1", imageSize: "512px" }
    }
  });

  for (const part of kingResp.candidates![0].content.parts) {
    if (part.inlineData) {
      fs.writeFileSync('public/king.png', Buffer.from(part.inlineData.data, 'base64'));
      console.log("King saved.");
    }
  }
}

generate().catch(console.error);
