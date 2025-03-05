import { myProvider } from "@/lib/models";
import { Message, smoothStream, streamText } from "ai";
import { NextRequest } from "next/server";
import { models } from "@/lib/models";

export async function POST(request: NextRequest) {
  const {
    messages,
    selectedModelId = "sonar",
    isReasoningEnabled = true,
  }: {
    messages: Array<Message>;
    selectedModelId?: string;
    isReasoningEnabled?: boolean;
  } = await request.json();

  // Ensure we have a valid model ID
  const modelId = selectedModelId || "sonar";
  
  // Get the selected model
  const selectedModel = models.find(model => model.id === modelId);
  
  const stream = streamText({
    system:
      "you are a friendly assistant. do not use emojis in your responses.",
    providerOptions: {
      perplexity: {
        return_images: false,
      },
      google: {
        safetySettings: [
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
        ],
      },
    },
    model: myProvider.languageModel(modelId),
    experimental_transform: [
      smoothStream({
        chunking: "word",
      }),
    ],
    messages,
  });

  return stream.toDataStreamResponse({
    sendReasoning: isReasoningEnabled,
    getErrorMessage: () => {
      return `An error occurred, please try again!`;
    },
  });
}
