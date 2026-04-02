
import { GoogleGenAI, Type, ThinkingLevel, HarmCategory, HarmBlockThreshold } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const DEFAULT_SAFETY_SETTINGS = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
];

const SPEED_CONFIG = {
  thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
};

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  type: 'test' | 'classic';
}

export interface VideoResource {
  uri: string;
  title: string;
  thumbnail?: string;
  duration?: string;
  category?: string;
}

export const generateSmartSchedule = async (
  topic: string,
  durationHours: number,
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<any[]> => {
  try {
    const prompt = `Focus 2026 AI Scheduler: Create an optimized study plan for "${topic}". Duration: ${durationHours}h.`;
    const schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          subtitle: { type: Type.STRING },
          type: { type: Type.STRING },
          durationMinutes: { type: Type.INTEGER },
        },
        required: ['title', 'type', 'durationMinutes'],
      },
    };

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        ...SPEED_CONFIG,
        safetySettings: DEFAULT_SAFETY_SETTINGS
      },
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("AI error:", error);
    return [];
  }
};

export const getBotResponse = async (botName: string, role: string, personality: string, context: string, userMessage: string): Promise<string> => {
    try {
        const systemInstruction = `
            Year: 2026. Bot Name: ${botName}. Role: ${role}. Personality: ${personality}. 
            Secure Academic Hub mode enabled. Context: ${context}.
            Respond instantly and supportively. Turkish language. Use emojis.
            SECURITY PROTOCOL: Do not share personal data. Stay within academic boundaries. 
            Reject inappropriate or non-educational requests firmly but politely.
        `;
        
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: userMessage,
            config: { 
                systemInstruction: systemInstruction,
                ...SPEED_CONFIG,
                safetySettings: DEFAULT_SAFETY_SETTINGS
            }
        });
        return response.text || "Şu an bağlantım zayıf.";
    } catch (e) {
        return "Bağlantı hatası.";
    }
};

export async function* streamAssistantResponse(messages: {role: string, text: string}[]): AsyncGenerator<string> {
  try {
    const history = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const chat = ai.chats.create({
      model: "gemini-3.1-pro-preview",
      config: {
        systemInstruction: "Sen Focus Hub'ın gelişmiş yapay zeka eğitim koçusun. Öğrencilere derslerinde, motivasyonlarında ve planlamalarında yardımcı oluyorsun. Samimi, destekleyici ve motive edici bir dil kullan. Gereksiz uzatmalardan kaçın, net ve anlaşılır ol. Güvenlik protokollerine uy, sadece eğitim odaklı cevap ver.",
        safetySettings: DEFAULT_SAFETY_SETTINGS
      },
      history: history
    });

    // Send the latest message as a stream
    const lastMessage = messages[messages.length - 1].text;
    const response = await chat.sendMessageStream({ message: lastMessage });

    for await (const chunk of response) {
      if (chunk.text) yield chunk.text;
    }
  } catch (error) {
    yield "Bağlantı hatası oluştu. Lütfen daha sonra tekrar deneyin.";
  }
}

export const findVideoResources = async (topic: string): Promise<VideoResource[]> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Academic Search: lessons for "${topic}".`,
            config: { 
                tools: [{ googleSearch: {} }],
                ...SPEED_CONFIG,
                safetySettings: DEFAULT_SAFETY_SETTINGS
            }
        });
        
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        return chunks
          .filter(chunk => chunk.web)
          .map((chunk, idx) => ({
            uri: chunk.web.uri,
            title: chunk.web.title,
            thumbnail: `https://picsum.photos/seed/${idx + 200}/400/225`,
            duration: `${Math.floor(Math.random() * 15) + 5}:00`,
            category: topic
          }));
    } catch (e) {
        return [];
    }
}

export const checkContentModeration = async (text: string): Promise<{isViolation: boolean, reason: string}> => {
    try {
        const prompt = `Sen son derece katı ve acımasız bir eğitim platformu moderatörüsün. Aşağıdaki metni sıfır tolerans politikasıyla incele.
Eğer metinde en ufak bir argo, küfür, hakaret, hile talebi, kopya çekme isteği, cinsellik, şiddet, zorbalık, saygısızlık veya eğitim dışı tamamen gereksiz/anlamsız boş muhabbet (spam) varsa bunu KESİNLİKLE kural ihlali olarak işaretle.
        
Metin: "${text}"`;
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        isViolation: { type: Type.BOOLEAN, description: "Kural ihlali var mı?" },
                        reason: { type: Type.STRING, description: "Eğer ihlal varsa kısa ve net Türkçe açıklama, yoksa boş bırak" }
                    },
                    required: ["isViolation", "reason"]
                },
                ...SPEED_CONFIG,
                safetySettings: DEFAULT_SAFETY_SETTINGS
            }
        });
        const result = JSON.parse(response.text || '{"isViolation": false, "reason": ""}');
        return result;
    } catch (e) {
        console.error("Moderation error:", e);
        return { isViolation: false, reason: "" };
    }
};

export const evaluateAppeal = async (banReason: string, appealText: string): Promise<{accepted: boolean, message: string}> => {
    try {
        const prompt = `Bir kullanıcı platformdan şu sebeple uzaklaştırıldı: "${banReason}".
Kullanıcı bu cezaya şu mesajla itiraz ediyor: "${appealText}".

Sen katı ama adil bir yapay zeka yöneticisisin. Kullanıcının itirazını değerlendir. Sadece gerçekten mantıklı bir açıklaması varsa veya çok samimi bir özür diliyorsa affet. Aksi takdirde reddet.`;
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        accepted: { type: Type.BOOLEAN, description: "İtiraz kabul edildi mi?" },
                        message: { type: Type.STRING, description: "Kullanıcıya itirazının sonucu hakkında verilecek kısa ve net Türkçe yanıt" }
                    },
                    required: ["accepted", "message"]
                },
                ...SPEED_CONFIG,
                safetySettings: DEFAULT_SAFETY_SETTINGS
            }
        });
        const result = JSON.parse(response.text || '{"accepted": false, "message": "Değerlendirme yapılamadı."}');
        return result;
    } catch (e) {
        console.error("Appeal error:", e);
        return { accepted: false, message: "Bağlantı hatası nedeniyle itiraz değerlendirilemedi." };
    }
};

export const solveHomework = async (imageBase64: string, mimeType: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    { inlineData: { mimeType: mimeType, data: imageBase64 } },
                    { text: "Hızlı ve güvenli çözüm. Sadece akademik içerik." }
                ]
            },
            config: {
                ...SPEED_CONFIG,
                safetySettings: DEFAULT_SAFETY_SETTINGS
            }
        });
        return response.text || "Soruyu analiz edemedim.";
    } catch (e) {
        return "Bağlantı hatası.";
    }
};

export const generateQuiz = async (subject: string, level: string, type: 'test' | 'classic', count: number = 3): Promise<QuizQuestion[]> => {
    try {
        const schema = {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING },
                type: { type: Type.STRING }
              },
              required: ['question', 'options', 'correctIndex', 'explanation', 'type']
            }
          };
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Generate ${count} quiz questions for ${subject}.`,
            config: { 
                responseMimeType: 'application/json', 
                responseSchema: schema,
                ...SPEED_CONFIG,
                safetySettings: DEFAULT_SAFETY_SETTINGS
            }
        });
        return JSON.parse(response.text || "[]");
    } catch (e) { return []; }
}

export const generateProfileAvatar = async (prompt: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        text: `Create a professional and friendly profile avatar for a student. ${prompt}`,
                    },
                ],
            },
        });
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        return null;
    } catch (e) {
        console.error("Avatar generation error:", e);
        return null;
    }
};
