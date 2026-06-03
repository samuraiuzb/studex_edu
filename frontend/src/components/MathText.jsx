import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

/**
 * Enhanced MathText component that supports both Markdown and LaTeX.
 * Uses remark-math to parse $...$ and $$...$$ and rehype-katex to render them.
 * 
 * @param {string} text - The content with Markdown and LaTeX.
 * @param {string} className - Optional container class.
 */
export default function MathText({ text, className = '' }) {
    if (!text) return null;

    return (
        <div className={`math-text-container ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                    // Prevent markdown paragraphs from adding excessive spacing in small cards/inline usage
                    p: ({ node, children }) => <span className="m-0">{children}</span>,
                    // Ensure links open in new tabs
                    a: ({ node, children, ...props }) => (
                        <a {...props} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                            {children}
                        </a>
                    ),
                }}
            >
                {text}
            </ReactMarkdown>
        </div>
    );
}
