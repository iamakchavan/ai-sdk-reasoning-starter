"use client";

import cn from "classnames";
import { toast } from "sonner";
import { useChat } from "@ai-sdk/react";
import { useState, useMemo, useEffect, useRef } from "react";
import { Messages } from "./messages";
import { models } from "@/lib/models";
import { Footnote } from "./footnote";
import { ArrowUpIcon, CheckedSquare, StopIcon, UncheckedSquare, ChevronDownIcon } from "./icons";
import { Input } from "./input";

// Add this import for remark-gfm
import remarkGfm from 'remark-gfm';

export function Chat() {
  const [input, setInput] = useState<string>("");
  const [selectedModelId, setSelectedModelId] = useState<string>("gemini-2.0-flash");
  const [isReasoningEnabled, setIsReasoningEnabled] = useState<boolean>(true);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Group models by provider
  const modelsByProvider = useMemo(() => {
    const grouped = models.reduce((acc, model) => {
      if (!acc[model.provider]) {
        acc[model.provider] = [];
      }
      acc[model.provider].push(model);
      return acc;
    }, {} as Record<string, typeof models>);
    
    return grouped;
  }, []);
  
  // Dynamically select the model based on reasoning toggle for Perplexity
  const effectiveModelId = useMemo(() => {
    const selectedModel = models.find(model => model.id === selectedModelId);
    
    // Only apply reasoning toggle logic for Perplexity models
    if (selectedModel?.provider === "perplexity" && isReasoningEnabled) {
      return "sonar-reasoning";
    }
    
    return selectedModelId;
  }, [selectedModelId, isReasoningEnabled]);

  const selectedModel = models.find((model) => model.id === selectedModelId);

  const { messages, append, status, stop } = useChat({
    id: "primary",
    body: {
      selectedModelId: effectiveModelId,
      isReasoningEnabled,
    },
    onError: () => {
      toast.error("An error occurred, please try again!");
    },
  });

  const isGeneratingResponse = ["streaming", "submitted"].includes(status);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div
      className={cn(
        "px-4 md:px-0 pb-4 pt-8 flex flex-col h-dvh items-center w-full",
        {
          "justify-between": messages.length > 0,
          "justify-center gap-4": messages.length === 0,
        },
      )}
    >
      {messages.length > 0 ? (
        <Messages messages={messages} status={status} />
      ) : (
        <div className="flex flex-col gap-0.5 sm:text-2xl text-xl md:w-1/2 w-full">
          <div className="flex flex-row gap-2 items-center">
            <div>Welcome to Blue Chat.</div>
          </div>
          <div className="dark:text-zinc-500 text-zinc-400">
            What would you like me to think about today?
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 md:w-1/2 w-full">
        <div className="w-full relative p-3 dark:bg-zinc-800 rounded-2xl flex flex-col gap-1 bg-zinc-100">
          <Input
            input={input}
            setInput={setInput}
            selectedModelId={selectedModelId}
            isGeneratingResponse={isGeneratingResponse}
            isReasoningEnabled={isReasoningEnabled}
          />

          <div className="absolute bottom-2.5 left-2.5">
            <div
              className={cn(
                "relative w-fit text-sm p-1.5 rounded-lg flex flex-row items-center gap-2 dark:hover:bg-zinc-600 hover:bg-zinc-200 cursor-pointer",
                {
                  "dark:bg-zinc-600 bg-zinc-200": isReasoningEnabled,
                },
              )}
              onClick={() => {
                setIsReasoningEnabled(!isReasoningEnabled);
              }}
            >
              {isReasoningEnabled ? <CheckedSquare /> : <UncheckedSquare />}
              <div>Reasoning</div>
            </div>
          </div>

          <div className="absolute bottom-2.5 right-2.5 flex flex-row gap-2">
            <div 
              ref={dropdownRef}
              className="relative w-fit text-sm p-1.5 rounded-lg flex flex-row items-center gap-0.5 dark:hover:bg-zinc-700 hover:bg-zinc-200 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setIsModelDropdownOpen(!isModelDropdownOpen);
              }}
            >
              <div>
                {selectedModel ? selectedModel.name : "Models Unavailable!"}
              </div>
              <div className="text-zinc-500">
                <ChevronDownIcon />
              </div>
              
              {isModelDropdownOpen && (
                <div className="absolute bottom-full right-0 mb-1 w-64 bg-white dark:bg-zinc-900 rounded-lg shadow-lg z-10 overflow-hidden max-h-[300px] overflow-y-auto">
                  {Object.entries(modelsByProvider).map(([provider, providerModels]) => (
                    <div key={provider} className="border-b border-zinc-200 dark:border-zinc-700 last:border-0">
                      <div className="px-3 py-2 text-xs font-semibold uppercase text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 sticky top-0">
                        {provider.charAt(0).toUpperCase() + provider.slice(1)}
                      </div>
                      <div>
                        {providerModels.map((model) => (
                          <div
                            key={model.id}
                            className={cn(
                              "px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer",
                              {
                                "bg-zinc-100 dark:bg-zinc-800": model.id === selectedModelId,
                              }
                            )}
                            onClick={() => {
                              setSelectedModelId(model.id);
                              setIsModelDropdownOpen(false);
                            }}
                          >
                            <div className="font-medium">{model.name}</div>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2">
                              {model.description}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              className={cn(
                "size-8 flex flex-row justify-center items-center dark:bg-zinc-100 bg-zinc-900 dark:text-zinc-900 text-zinc-100 p-1.5 rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-300 hover:scale-105 active:scale-95 transition-all",
                {
                  "dark:bg-zinc-200 dark:text-zinc-500":
                    isGeneratingResponse || input === "",
                },
              )}
              onClick={() => {
                if (input === "") {
                  return;
                }

                if (isGeneratingResponse) {
                  stop();
                } else {
                  append({
                    role: "user",
                    content: input,
                    createdAt: new Date(),
                  });
                }

                setInput("");
              }}
            >
              {isGeneratingResponse ? <StopIcon /> : <ArrowUpIcon />}
            </button>
          </div>
        </div>

        <Footnote />
      </div>
    </div>
  );
}
