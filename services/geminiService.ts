import { GoogleGenAI, Type, Schema } from "@google/genai";

const apiKey = process.env.API_KEY || ''; // Injected by environment
const ai = new GoogleGenAI({ apiKey });

export const generateSmartSchedule = async (
  topic: string,
  durationHours: number,
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<any[]> => {
  try {
    const prompt = `
      Create a study schedule for the topic: "${topic}".
      Total duration: ${durationHours} hours.
      Difficulty level: ${difficulty}.
      Break it down into 45-minute study sessions and 15-minute breaks.
      Return a JSON array of objects with fields: 'title', 'subtitle', 'type' (study or break), 'durationMinutes'.
    `;

    const schema: Schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          subtitle: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['study', 'break'] },
          durationMinutes: { type: Type.INTEGER },
        },
        required: ['title', 'type', 'durationMinutes'],
      },
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash", 
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return [];
  } catch (error) {
    console.error("Gemini schedule generation error:", error);
    return [];
  }
};

export const askAssistant = async (question: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `You are a helpful study assistant. Answer this question concisely for a student: ${question}`,
    });
    return response.text || "I couldn't generate an answer.";
  } catch (error) {
    console.error("Gemini assistant error:", error);
    return "Sorry, I encountered an error.";
  }
};

// --- NEW FEATURES ---

export interface QuizQuestion {
  question: string;
  options: string[]; // Empty if classic
  correctIndex: number; // -1 if classic
  explanation: string; // Answer for classic
  type: 'test' | 'classic';
}

export const generateQuiz = async (subject: string, level: string, type: 'test' | 'classic'): Promise<QuizQuestion[]> => {
    try {
        let prompt = "";
        let schema: Schema;

        if (type === 'test') {
            prompt = `Generate 5 multiple choice questions about "${subject}" at a "${level}" level. 
            Return JSON with: 'question', 'options' (array of 4 strings), 'correctIndex' (0-3), 'explanation'.`;
            
            schema = {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } },
                        correctIndex: { type: Type.INTEGER },
                        explanation: { type: Type.STRING },
                        type: { type: Type.STRING, enum: ['test'] }
                    },
                    required: ['question', 'options', 'correctIndex', 'explanation']
                }
            };
        } else {
            prompt = `Generate 5 classic open-ended exam questions about "${subject}" at a "${level}" level.
            Return JSON with: 'question', 'explanation' (the model answer). Leave options empty.`;

            schema = {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        options: { type: Type.ARRAY, items: { type: Type.STRING } }, // Empty array
                        correctIndex: { type: Type.INTEGER }, // -1
                        explanation: { type: Type.STRING },
                        type: { type: Type.STRING, enum: ['classic'] }
                    },
                    required: ['question', 'explanation']
                }
            };
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: schema
            }
        });

        if (response.text) {
            const data = JSON.parse(response.text);
            // Ensure type is set correctly in returned data just in case
            return data.map((q: any) => ({
                ...q, 
                type: type, 
                options: q.options || [], 
                correctIndex: q.correctIndex ?? -1
            }));
        }
        return [];
    } catch (e) {
        console.error("Quiz Error", e);
        return [];
    }
}

export const solveHomework = async (imageBase64: string, mimeType: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: {
                parts: [
                    { inlineData: { mimeType: mimeType, data: imageBase64 } },
                    { text: "Bu resimdeki soruyu veya ödevi adım adım, açıklayıcı bir şekilde çöz. Öğrencinin anlayacağı dilde Türkçe anlat." }
                ]
            }
        });
        return response.text || "Çözüm üretilemedi.";
    } catch (e) {
        console.error("Homework Solver Error", e);
        return "Bir hata oluştu. Lütfen tekrar dene.";
    }
};

export interface VideoResource {
    title: string;
    uri: string;
}

export const findVideoResources = async (topic: string): Promise<VideoResource[]> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: `Find the best YouTube video tutorials for learning about: "${topic}". Return a list of 3-5 specific video titles and their URLs.`,
            config: {
                tools: [{ googleSearch: {} }]
            }
        });

        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        const resources: VideoResource[] = [];

        if (chunks) {
            chunks.forEach(chunk => {
                if (chunk.web) {
                    resources.push({
                        title: chunk.web.title || 'Video Kaynağı',
                        uri: chunk.web.uri || '#'
                    });
                }
            });
        }
        
        return resources.filter((v,i,a)=>a.findIndex(t=>(t.uri === v.uri))===i).slice(0, 5);
        
    } catch (e) {
        console.error("Video Search Error", e);
        return [];
    }
}
