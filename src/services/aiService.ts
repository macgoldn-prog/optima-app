import { GoogleGenAI, Type, Schema } from '@google/genai';

const apiKey = (process.env.EXPO_PUBLIC_GEMINI_API_KEY || '').trim();

const taskBreakdownSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    goalTitle: { type: Type.STRING },
    subtasks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          durationMins: { type: Type.INTEGER, description: 'Duration in minutes' },
          priority: { type: Type.STRING, enum: ['low', 'medium', 'high', 'urgent'] },
          energyRequired: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
        },
        required: ['title', 'durationMins', 'priority', 'energyRequired'],
      },
    },
  },
  required: ['goalTitle', 'subtasks'],
};

export async function breakdownGoalWithAI(promptText: string, retries = 3, delay = 1000): Promise<any> {
  if (!apiKey) {
    throw new Error('Gemini API key is missing in .env');
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Break down this goal/task into small, non-overwhelming, bite-sized steps: "${promptText}"`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: taskBreakdownSchema,
        temperature: 0.2,
      },
    });

    if (!response.text) {
      throw new Error('Empty response from AI engine');
    }

    return JSON.parse(response.text);
  } catch (error: any) {
    console.warn(`AI request failed (status/message: ${error?.message || error}). Retries left: ${retries}`);
    
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      return breakdownGoalWithAI(promptText, retries - 1, delay * 2);
    }

    console.error('AI Breakdown Detailed Error:', error?.message || error);
    throw error;
  }
}
