import { customProvider } from "ai";
import { perplexity } from "@ai-sdk/perplexity";
import { google } from "@ai-sdk/google";

export const myProvider = customProvider({
  languageModels: {
    "sonar-small-online": perplexity("sonar-small-online"),
    "sonar-medium-online": perplexity("sonar-medium-online"),
    "sonar-large-online": perplexity("sonar-large-online"),
    "sonar-pro": perplexity("sonar-pro"),
    "sonar": perplexity("sonar"),
    "sonar-reasoning": perplexity("sonar-reasoning"),
    "gemini-1.5-pro": google("gemini-1.5-pro-latest"),
    "gemini-1.5-flash": google("gemini-1.5-flash-latest"),
    "gemini-1.5-flash-8b": google("gemini-1.5-flash-8b-latest"),
    "gemini-2.0-flash": google("gemini-2.0-flash"),
  },
});

interface Model {
  id: string;
  name: string;
  description: string;
  provider: "perplexity" | "google";
}

export const models: Array<Model> = [
  {
    id: "sonar-pro",
    name: "Sonar Pro",
    description:
      "Perplexity's most powerful model that combines real-time web search with natural language processing, providing detailed citations.",
    provider: "perplexity",
  },
  {
    id: "sonar",
    name: "Sonar",
    description:
      "Perplexity's standard model that combines web search with language processing.",
    provider: "perplexity",
  },
  {
    id: "sonar-reasoning",
    name: "Sonar Reasoning",
    description:
      "Perplexity's model with enhanced reasoning capabilities, providing step-by-step thinking.",
    provider: "perplexity",
  },
  {
    id: "sonar-large-online",
    name: "Sonar Large Online",
    description:
      "A powerful model that combines web search capabilities with advanced language processing.",
    provider: "perplexity",
  },
  {
    id: "sonar-medium-online",
    name: "Sonar Medium Online",
    description:
      "A balanced model offering good performance with web search capabilities.",
    provider: "perplexity",
  },
  {
    id: "sonar-small-online",
    name: "Sonar Small Online",
    description:
      "A lightweight model with web search capabilities, ideal for simple queries.",
    provider: "perplexity",
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    description:
      "Google's latest Gemini model optimized for speed and performance with state-of-the-art capabilities.",
    provider: "google",
  },
  {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    description:
      "Google's most capable model, with strong performance across language, code, and multimodal tasks.",
    provider: "google",
  },
  {
    id: "gemini-1.5-flash",
    name: "Gemini 1.5 Flash",
    description:
      "A faster version of Gemini 1.5 with excellent performance and lower latency.",
    provider: "google",
  },
  {
    id: "gemini-1.5-flash-8b",
    name: "Gemini 1.5 Flash 8B",
    description:
      "A lightweight version of Gemini 1.5 Flash optimized for efficiency.",
    provider: "google",
  },
];
