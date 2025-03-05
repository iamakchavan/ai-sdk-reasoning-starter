"use client";

import cn from "classnames";
import Markdown from "react-markdown";
import { markdownComponents } from "./markdown-components";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, SpinnerIcon } from "./icons";
import { UIMessage } from "ai";
import { UseChatHelpers } from "@ai-sdk/react";

interface ReasoningPart {
  type: "reasoning";
  reasoning: string;
  details: Array<{ type: "text"; text: string }>;
}

interface ReasoningMessagePartProps {
  part: ReasoningPart;
  isReasoning: boolean;
}

export function ReasoningMessagePart({
  part,
  isReasoning,
}: ReasoningMessagePartProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const variants = {
    collapsed: {
      height: 0,
      opacity: 0,
      marginTop: 0,
      marginBottom: 0,
    },
    expanded: {
      height: "auto",
      opacity: 1,
      marginTop: "1rem",
      marginBottom: 0,
    },
  };

  return (
    <div className="flex flex-col">
      {isReasoning ? (
        <div className="flex flex-row gap-2 items-center">
          <div className="font-medium text-sm">Reasoning</div>
          <div className="animate-spin">
            <SpinnerIcon />
          </div>
        </div>
      ) : (
        <div className="flex flex-row gap-2 items-center">
          <div className="font-medium text-sm">Reasoned for a few seconds</div>
          <button
            className={cn(
              "cursor-pointer rounded-full dark:hover:bg-zinc-800 hover:bg-zinc-200",
              {
                "dark:bg-zinc-800 bg-zinc-200": isExpanded,
              },
            )}
            onClick={() => {
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? <ChevronDownIcon /> : <ChevronUpIcon />}
          </button>
        </div>
      )}

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="reasoning"
            className="text-sm dark:text-zinc-400 text-zinc-600 flex flex-col gap-4 border-l pl-3 dark:border-zinc-800"
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={variants}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            {part.details.map((detail, detailIndex) =>
              detail.type === "text" ? (
                <Markdown key={detailIndex} components={markdownComponents}>
                  {detail.text}
                </Markdown>
              ) : (
                "<redacted>"
              ),
            )}

            {/* <Markdown components={markdownComponents}>{reasoning}</Markdown> */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface TextMessagePartProps {
  text: string;
  isStreaming: boolean;
}

export function TextMessagePart({ text, isStreaming }: TextMessagePartProps) {
  // Check if we're in the middle of a thinking tag
  const isInThinkingTag = text.includes("<think>") && !text.includes("</think>");
  const hasCompletedThinkingTag = text.includes("<think>") && text.includes("</think>");
  
  // If we're streaming and in the middle of a thinking tag, show the thinking UI
  if (isStreaming && isInThinkingTag) {
    const thinkingContent = text.split("<think>")[1].trim();
    return (
      <div className="flex flex-col gap-4 w-full">
        <StreamingThinkingPart thinkingContent={thinkingContent} />
      </div>
    );
  }
  
  // If we have completed thinking tags
  if (hasCompletedThinkingTag) {
    // Extract thinking content and final answer
    const thinkingMatch = text.match(/<think>([\s\S]*?)<\/think>/);
    const thinkingContent = thinkingMatch ? thinkingMatch[1].trim() : "";
    const finalAnswer = text.replace(/<think>[\s\S]*?<\/think>/, "").trim();

    return (
      <div className="flex flex-col gap-4 w-full">
        {thinkingContent && (
          <ThinkingMessagePart thinkingContent={thinkingContent} />
        )}
        {finalAnswer && (
          <div className="flex flex-col gap-4">
            <Markdown components={markdownComponents}>{finalAnswer}</Markdown>
          </div>
        )}
      </div>
    );
  }
  
  // Regular text without thinking tags
  return (
    <div className="flex flex-col gap-4">
      <Markdown components={markdownComponents}>{text}</Markdown>
    </div>
  );
}

interface StreamingThinkingPartProps {
  thinkingContent: string;
}

export function StreamingThinkingPart({ thinkingContent }: StreamingThinkingPartProps) {
  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-row gap-2 items-center">
        <div className="font-medium text-sm">Thinking</div>
        <div className="animate-spin">
          <SpinnerIcon />
        </div>
      </div>
      
      <div className="text-sm dark:text-zinc-400 text-zinc-600 flex flex-col gap-4 border-l pl-3 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/50 p-4 rounded-lg mt-2">
        <Markdown components={markdownComponents}>{thinkingContent}</Markdown>
      </div>
    </div>
  );
}

interface ThinkingMessagePartProps {
  thinkingContent: string;
}

export function ThinkingMessagePart({ thinkingContent }: ThinkingMessagePartProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const variants = {
    collapsed: {
      height: 0,
      opacity: 0,
      marginTop: 0,
      marginBottom: 0,
    },
    expanded: {
      height: "auto",
      opacity: 1,
      marginTop: "1rem",
      marginBottom: "1rem",
    },
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-row gap-2 items-center">
        <div className="font-medium text-sm">Thinking</div>
        <button
          className={cn(
            "cursor-pointer rounded-full dark:hover:bg-zinc-800 hover:bg-zinc-200",
            {
              "dark:bg-zinc-800 bg-zinc-200": isExpanded,
            },
          )}
          onClick={() => {
            setIsExpanded(!isExpanded);
          }}
        >
          {isExpanded ? <ChevronDownIcon /> : <ChevronUpIcon />}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="thinking"
            className="text-sm dark:text-zinc-400 text-zinc-600 flex flex-col gap-4 border-l pl-3 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800/50 p-4 rounded-lg"
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={variants}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <Markdown components={markdownComponents}>{thinkingContent}</Markdown>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface MessagesProps {
  messages: Array<UIMessage>;
  status: UseChatHelpers["status"];
}

export function Messages({ messages, status }: MessagesProps) {
  const messagesRef = useRef<HTMLDivElement>(null);
  const messagesLength = useMemo(() => messages.length, [messages]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messagesLength]);

  return (
    <div
      className="flex flex-col gap-8 overflow-y-scroll items-center w-full"
      ref={messagesRef}
    >
      {messages.map((message, messageIndex) => (
        <div
          key={message.id}
          className={cn(
            "flex flex-col gap-4 last-of-type:mb-12 first-of-type:mt-16 md:w-1/2 w-full",
          )}
        >
          <div
            className={cn("flex flex-col gap-4", {
              "dark:bg-zinc-800 bg-zinc-200 p-2 rounded-xl w-fit ml-auto":
                message.role === "user",
              "": message.role === "assistant",
            })}
          >
            {message.parts.map((part, partIndex) => {
              if (part.type === "text") {
                const isStreaming = 
                  status === "streaming" && 
                  messageIndex === messages.length - 1 && 
                  partIndex === message.parts.length - 1;
                
                return (
                  <TextMessagePart
                    key={`${message.id}-${partIndex}`}
                    text={part.text}
                    isStreaming={isStreaming}
                  />
                );
              }

              if (part.type === "reasoning") {
                return (
                  <ReasoningMessagePart
                    key={`${message.id}-${partIndex}`}
                    // @ts-expect-error export ReasoningUIPart
                    part={part}
                    isReasoning={
                      status === "streaming" &&
                      messageIndex === messages.length - 1 &&
                      partIndex === message.parts.length - 1
                    }
                  />
                );
              }
            })}
          </div>
        </div>
      ))}

      {status === "submitted" && (
        <div className="text-zinc-500 mb-12 md:w-1/2 w-full">Hmm...</div>
      )}
    </div>
  );
}
