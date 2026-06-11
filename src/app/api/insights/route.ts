import { type NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { z } from 'zod';
import { generateTips } from '@/lib/tips-engine';
import { footprintInputSchema, footprintResultSchema } from '@/lib/schemas';

const requestSchema = z.object({
  input: footprintInputSchema,
  result: footprintResultSchema,
});

const _SYSTEM_INSTRUCTION = `You are a concise, encouraging sustainability coach. Given a person's annual carbon footprint breakdown (kg CO2e), produce a short summary and 2-4 specific, realistic actions that target their largest emission sources. Each action must include an estimated annual saving in kg CO2e. Be practical and non-judgmental. Effort must be "low", "medium", or "high". Categories must be one of: "transport", "home", "food", "consumption".`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { input, result } = parsed.data;

    // Attempt Gemini call via Vertex AI using ADC (Application Default Credentials)
    const project = process.env.GOOGLE_CLOUD_PROJECT;
    const location = process.env.GOOGLE_CLOUD_REGION;

    if (project && location) {
      try {
        const ai = new GoogleGenAI({
          vertexai: true,
          project,
          location
        });
        const prompt = `Carbon footprint breakdown (kg CO2e per year):
${JSON.stringify(result.details)}
Total: ${result.totalKg} kg/yr.
Diet: ${input.food.diet}. Car fuel: ${input.transport.carFuel}.
Give tailored advice to reduce the largest sources.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            systemInstruction: _SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING },
                recommendations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      category: { type: Type.STRING, description: 'transport, home, food, or consumption' },
                      title: { type: Type.STRING },
                      description: { type: Type.STRING },
                      estimatedSavingKg: { type: Type.NUMBER },
                      effort: { type: Type.STRING, description: 'low, medium, or high' }
                    },
                    required: ['id', 'category', 'title', 'description', 'estimatedSavingKg', 'effort']
                  }
                }
              },
              required: ['summary', 'recommendations']
            },
            temperature: 0.4,
          }
        });

        if (response.text) {
          const payload = JSON.parse(response.text);
          if (!payload.recommendations || payload.recommendations.length === 0) {
            throw new Error('AI returned empty recommendations');
          }
          return NextResponse.json({
            summary: payload.summary,
            recommendations: payload.recommendations.slice(0, 4),
            source: 'gemini',
          });
        }
      } catch (geminiError) {
        console.warn('Gemini generation failed, falling back to rules:', geminiError);
      }
    } else {
      console.warn('Google Cloud project/region not configured. Using rule-based fallback.');
    }

    // Fallback to rules
    const tips = generateTips(input, result, { limit: 4 });
    return NextResponse.json({
      summary: 'Here is your personalized reduction plan based on your inputs.',
      recommendations: tips,
      source: 'rules',
    });
  } catch (error) {
    console.error('Error in insights API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
