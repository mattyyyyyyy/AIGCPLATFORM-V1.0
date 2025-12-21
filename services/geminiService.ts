import { GoogleGenAI, Modality, Type } from "@google/genai";

const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY as string });
};

const handleApiError = (error: any, context: string) => {
  console.error(`${context} Error:`, error);
  if (error.status === 403 || error.message?.includes('Region not supported')) {
    throw new Error("您的地区暂不支持 Gemini API。");
  }
  throw error;
};

export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) { binary += String.fromCharCode(bytes[i]); }
  return btoa(binary);
};

/**
 * Transcribe Audio using Gemini 3 Flash
 */
export const transcribeAudio = async (audioBase64: string, mimeType: string) => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      // Fix: Ensure contents follows the correct { parts: [...] } structure
      contents: {
        parts: [
          { inlineData: { mimeType, data: audioBase64 } },
          { text: 'Please transcribe this audio into text accurately.' }
        ]
      },
    });
    // Fix: Access .text property directly
    return response.text || '';
  } catch (error) {
    return handleApiError(error, "Transcription");
  }
};

/**
 * Generate Speech using Gemini TTS model
 */
export const generateSpeech = async (text: string, voiceName: string = 'Kore') => {
  const ai = getAIClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Say: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });
    
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio;
  } catch (error) {
    return handleApiError(error, "Speech Generation");
  }
};

/**
 * Perform Speaker Diarization using Gemini 3 Flash
 */
export const analyzeConversation = async (audioBase64: string, mimeType: string) => {
  const ai = getAIClient();
  const prompt = `
    请分析这段音频并识别其中的说话人（Speaker Diarization）。
    请识别出不同的说话人，并按对话顺序提供转录文本，包括每个句子的开始和结束时间（秒）。
    
    输出格式必须是严格的 JSON 数组：
    [
      {"speaker": "Speaker 1", "text": "...", "startTime": 0, "endTime": 5},
      ...
    ]
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      // Fix: Ensure contents follows the correct { parts: [...] } structure
      contents: {
        parts: [
          { inlineData: { mimeType, data: audioBase64 } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              speaker: { type: Type.STRING },
              text: { type: Type.STRING },
              startTime: { type: Type.NUMBER },
              endTime: { type: Type.NUMBER }
            },
            required: ["speaker", "text", "startTime", "endTime"]
          }
        }
      }
    });
    
    // Fix: Access .text property directly
    return JSON.parse(response.text || "[]");
  } catch (error) {
    return handleApiError(error, "Diarization Analysis");
  }
};

/**
 * Helper to convert PCM base64 to a playable WAV Blob
 */
export const pcmToWavBlob = (base64Pcm: string, sampleRate: number = 24000) => {
  const binaryString = atob(base64Pcm);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  const buffer = new ArrayBuffer(44 + bytes.length);
  const view = new DataView(buffer);
  
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 32 + bytes.length, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); 
  view.setUint16(22, 1, true); 
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); 
  view.setUint16(32, 2, true); 
  view.setUint16(34, 16, true); 
  writeString(36, 'data');
  view.setUint32(40, bytes.length, true);
  
  const data = new Uint8Array(buffer, 44);
  data.set(bytes);
  
  return new Blob([buffer], { type: 'audio/wav' });
};