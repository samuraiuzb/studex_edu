/**
 * MathText.jsx
 * Matnni ko'rsatadi va ichidagi LaTeX formulalarini KaTeX bilan render qiladi.
 * 
 * Qo'llanish:
 *   Satr ichida: $x^2 + y^2 = z^2$
 *   Blok ko'rinishda: $$\frac{-b \pm \sqrt{b^2-4ac}}{2a}$$
 */
import React from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

/**
 * Matnni parchalaydi: oddiy matn va LaTeX qismlariga bo'ladi.
 * $$...$$ → blok formula
 * $...$ → satr ichidagi formula
 */
function parseMath(text) {
    if (!text) return [{ type: 'text', content: '' }];

    const parts = [];
    // Avval $$...$$ ni toping, keyin $...$
    const blockRegex = /\$\$([\s\S]+?)\$\$/g;
    const inlineRegex = /\$((?:[^$\\]|\\.)+?)\$/g;

    let lastIndex = 0;
    let combined = [];

    // $$...$$ blok formulalarni ajratish
    let match;
    const segments = [];
    const blockMatches = [];

    // Barcha $$...$$ pozitsiyalarini to'playmiz
    while ((match = blockRegex.exec(text)) !== null) {
        blockMatches.push({ start: match.index, end: match.index + match[0].length, content: match[1], type: 'block' });
    }

    // Bloklar orasidagi matn va $...$ ni qayta ishlaymiz
    let pos = 0;
    for (const bm of blockMatches) {
        if (pos < bm.start) {
            // Blokdan oldingi matnni $...$ ga bo'lamiz
            const segment = text.slice(pos, bm.start);
            splitInline(segment, parts);
        }
        parts.push({ type: 'block', content: bm.content });
        pos = bm.end;
    }
    // Oxirgi qismni ham qayta ishlaymiz
    if (pos < text.length) {
        splitInline(text.slice(pos), parts);
    }

    return parts;
}

function splitInline(segment, parts) {
    const inlineRegex = /\$((?:[^$\\]|\\.)+?)\$/g;
    let lastIdx = 0;
    let match;
    while ((match = inlineRegex.exec(segment)) !== null) {
        if (match.index > lastIdx) {
            parts.push({ type: 'text', content: segment.slice(lastIdx, match.index) });
        }
        parts.push({ type: 'inline', content: match[1] });
        lastIdx = match.index + match[0].length;
    }
    if (lastIdx < segment.length) {
        parts.push({ type: 'text', content: segment.slice(lastIdx) });
    }
}

/**
 * Asosiy MathText komponenti
 * @param {string} text - Ko'rsatiladigan matn (LaTeX formulalar bilan)
 * @param {string} className - Qo'shimcha CSS class
 */
export default function MathText({ text, className = '' }) {
    if (!text) return null;

    const parts = parseMath(text);

    return (
        <span className={`math-text ${className}`}>
            {parts.map((part, i) => {
                if (part.type === 'block') {
                    return (
                        <span key={i} className="math-block">
                            <BlockMath
                                math={part.content}
                                renderError={(err) => <span className="math-error" title={err.message}>{part.content}</span>}
                            />
                        </span>
                    );
                }
                if (part.type === 'inline') {
                    return (
                        <InlineMath
                            key={i}
                            math={part.content}
                            renderError={(err) => <span className="math-error" title={err.message}>${part.content}$</span>}
                        />
                    );
                }
                return <span key={i}>{part.content}</span>;
            })}
        </span>
    );
}
