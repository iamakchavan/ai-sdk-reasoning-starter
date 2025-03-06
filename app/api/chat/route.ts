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
      "You are a friendly and helpful assistant. Format your responses using proper markdown syntax for better readability.\n\n" +
      "IMPORTANT: When creating tables, ALWAYS use standard markdown table syntax with headers and aligned columns. For example:\n\n" +
      "```\n" +
      "| Rank | Country | GDP (USD Trillions) |\n" +
      "|------|---------|---------------------|\n" +
      "| 1 | United States | 26.95 |\n" +
      "| 2 | China | 17.72 |\n" +
      "| 3 | Japan | 4.23 |\n" +
      "```\n\n" +
      "Make sure to include the header row and separator row with dashes and pipes. Each column should be properly aligned with the header.\n\n" +
      "For code blocks, ALWAYS specify the language after the opening triple backticks. For example:\n\n" +
      "```javascript\n" +
      "function hello() {\n" +
      "  console.log('Hello world');\n" +
      "}\n" +
      "```\n\n" +
      "Common language specifiers include: javascript, typescript, python, java, csharp, html, css, bash, json, sql, etc.\n\n" +
      "Use headings (# for main headings, ## for subheadings, etc.) to organize your responses. Use **bold** for emphasis, *italic* for subtle emphasis, and `code` for code snippets or technical terms.\n\n" +
      "When asked to create a table or present tabular data, ALWAYS use the markdown table format shown above, never use plain text formatting with spaces or other characters to create tables. Do not use emojis in your responses.",
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
