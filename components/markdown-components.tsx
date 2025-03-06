import { Components } from "react-markdown";
import Link from "next/link";
import { useState } from "react";
import { Highlight, themes } from "prism-react-renderer";

// Copy button component for code blocks
const CopyButton = ({ content }: { content: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute right-2 top-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 rounded px-2 py-1 text-xs transition-colors"
      aria-label="Copy code"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
};

// Define the type for code component props
interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// Type for children with props
interface ChildWithProps {
  props?: {
    children?: string;
    className?: string;
  };
  type?: string;
}

// Helper function to check if children contain block elements
const containsBlockElement = (children: React.ReactNode): boolean => {
  if (!children) return false;
  
  if (Array.isArray(children)) {
    return children.some(child => 
      typeof child === 'object' && 
      child !== null && 
      'type' in child && 
      ['div', 'pre', 'table', 'ul', 'ol', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote'].includes(String(child.type))
    );
  }
  
  return false;
};

export const markdownComponents: Partial<Components> = {
  // Special paragraph handling to avoid nesting issues
  p: ({ children, ...props }) => {
    // If children contain block elements, render without wrapping p tag
    if (containsBlockElement(children)) {
      return <>{children}</>;
    }
    
    // Otherwise render as normal paragraph
    return <p className="leading-6 mb-4" {...props}>{children}</p>;
  },
  pre: ({ children, ...props }) => {
    // Extract code content for the copy button
    let codeContent = "";
    let language = "typescript"; // Default to typescript
    
    // Safely type check and extract properties
    const childWithProps = children as ChildWithProps;
    
    if (
      childWithProps &&
      typeof childWithProps === "object" &&
      childWithProps !== null &&
      childWithProps.props
    ) {
      // Get code content
      if (childWithProps.props.children) {
        codeContent = childWithProps.props.children;
      }
      
      // Get language from className
      if (childWithProps.props.className) {
        const match = /language-(\w+)/.exec(childWithProps.props.className);
        if (match) {
          language = match[1];
        }
      }
    }

    return (
      <div className="relative my-4">
        <div className="flex items-center justify-between bg-zinc-200 dark:bg-zinc-700 px-4 py-1 text-xs rounded-t-lg">
          <span className="font-mono">{language}</span>
          <CopyButton content={codeContent} />
        </div>
        {children}
      </div>
    );
  },
  // @ts-ignore - Ignoring type issues with the code component
  code: ({ node, inline, className, children, ...props }) => {
    if (inline) {
      return (
        <code
          className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-sm"
          {...props}
        >
          {children}
        </code>
      );
    }
    
    const match = /language-(\w+)/.exec(className || "");
    const lang = match ? match[1] : "typescript";
    const code = String(children || "").replace(/\n$/, "");
    
    return (
      <Highlight
        theme={themes.vsDark}
        code={code}
        language={lang as any}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <div className="overflow-x-auto rounded-b-lg modern-scrollbar bg-[#1E1E1E]">
            <pre className="p-4 text-sm font-mono" style={style}>
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })} className="token-line">
                  <span className="inline-block w-8 text-right mr-4 text-gray-500 select-none opacity-50">
                    {i + 1}
                  </span>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </pre>
          </div>
        )}
      </Highlight>
    );
  },
  ol: ({ children, ...props }) => {
    return (
      <ol className="list-decimal list-outside ml-6 mb-4" {...props}>
        {children}
      </ol>
    );
  },
  li: ({ children, ...props }) => {
    return (
      <li className="py-1" {...props}>
        {children}
      </li>
    );
  },
  ul: ({ children, ...props }) => {
    return (
      <ul className="list-disc list-outside ml-6 mb-4" {...props}>
        {children}
      </ul>
    );
  },
  strong: ({ children, ...props }) => {
    return (
      <span className="font-semibold" {...props}>
        {children}
      </span>
    );
  },
  em: ({ children, ...props }) => {
    return (
      <span className="italic" {...props}>
        {children}
      </span>
    );
  },
  blockquote: ({ children, ...props }) => {
    return (
      <blockquote 
        className="border-l-4 border-zinc-300 dark:border-zinc-700 pl-4 py-1 my-4 text-zinc-700 dark:text-zinc-300 italic"
        {...props}
      >
        {children}
      </blockquote>
    );
  },
  a: ({ children, ...props }) => {
    return (
      // @ts-expect-error - Link component expects href prop from markdown-parsed anchor tags
      <Link
        className="text-blue-500 hover:underline"
        target="_blank"
        rel="noreferrer"
        {...props}
      >
        {children}
      </Link>
    );
  },
  h1: ({ children, ...props }) => {
    return (
      <h1 className="text-3xl font-semibold mt-6 mb-4 text-cyan-500" {...props}>
        {children}
      </h1>
    );
  },
  h2: ({ children, ...props }) => {
    return (
      <h2 className="text-2xl font-semibold mt-6 mb-3 text-cyan-500" {...props}>
        {children}
      </h2>
    );
  },
  h3: ({ children, ...props }) => {
    return (
      <h3 className="text-xl font-semibold mt-5 mb-3 text-cyan-500" {...props}>
        {children}
      </h3>
    );
  },
  h4: ({ children, ...props }) => {
    return (
      <h4 className="text-lg font-semibold mt-4 mb-2 text-cyan-500" {...props}>
        {children}
      </h4>
    );
  },
  h5: ({ children, ...props }) => {
    return (
      <h5 className="text-base font-semibold mt-4 mb-2 text-cyan-500" {...props}>
        {children}
      </h5>
    );
  },
  h6: ({ children, ...props }) => {
    return (
      <h6 className="text-sm font-semibold mt-4 mb-2 text-cyan-500" {...props}>
        {children}
      </h6>
    );
  },
  // Table components
  table: ({ children, ...props }) => {
    return (
      <div className="overflow-x-auto my-6 modern-scrollbar">
        <table className="min-w-full border-collapse border border-zinc-300 dark:border-zinc-700" {...props}>
          {children}
        </table>
      </div>
    );
  },
  thead: ({ children, ...props }) => {
    return (
      <thead className="bg-zinc-100 dark:bg-zinc-800" {...props}>
        {children}
      </thead>
    );
  },
  tbody: ({ children, ...props }) => {
    return <tbody {...props}>{children}</tbody>;
  },
  tr: ({ children, ...props }) => {
    return (
      <tr 
        className="border-b border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900/50" 
        {...props}
      >
        {children}
      </tr>
    );
  },
  th: ({ children, ...props }) => {
    return (
      <th 
        className="px-4 py-3 text-left font-semibold border-r last:border-r-0 border-zinc-300 dark:border-zinc-700"
        {...props}
      >
        {children}
      </th>
    );
  },
  td: ({ children, ...props }) => {
    return (
      <td 
        className="px-4 py-2 border-r last:border-r-0 border-zinc-300 dark:border-zinc-700"
        {...props}
      >
        {children}
      </td>
    );
  },
  hr: () => {
    return <hr className="my-6 border-zinc-300 dark:border-zinc-700" />;
  },
};
