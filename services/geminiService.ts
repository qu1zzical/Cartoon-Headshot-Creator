
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import { ImageData } from '../types';

export async function generateCartoonImage(
  baseImage: ImageData,
  prompt: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

  const fullPrompt = `Generate a cartoon-style headshot based on the provided image. The style should be vibrant, friendly, and suitable for a profile picture. Apply the following user instructions: "${prompt}". If no specific instructions are provided, create a standard, high-quality cartoon version.`;
  
  const imagePart = {
    inlineData: {
      data: baseImage.base64,
      mimeType: baseImage.mimeType,
    },
  };

  const textPart = {
    text: fullPrompt,
  };

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [imagePart, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    
    throw new Error("No image data found in the API response.");

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate image: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the image.");
  }
}
