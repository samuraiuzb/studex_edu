/**
 * MathEditor.jsx
 * LaTeX formulalar yozish imkoniyati bilan kengaytirilgan textarea.
 * - Toolbar: tez-tez ishlatiladigan formulalar
 * - Real-time preview
 */
import React, { useState, useRef } from 'react';
import MathText from './MathText';
import './MathEditor.css';

const FORMULA_BUTTONS = [
    { label: 'x²', insert: 'x^{2}', title: 'Daraja' },
    { label: '√x', insert: '\\sqrt{x}', title: 'Ildiz' },
    { label: 'xₙ', insert: 'x_{n}', title: 'Pastki indeks' },
    { label: 'a/b', insert: '\\frac{a}{b}', title: 'Kasrli son' },
    { label: '∑', insert: '\\sum_{i=1}^{n}', title: 'Yig\'indilik belgisi' },
    { label: '∫', insert: '\\int_{a}^{b}', title: 'Integral' },
    { label: 'π', insert: '\\pi', title: 'Pi' },
    { label: '≤', insert: '\\leq', title: 'Kichik yoki teng' },
    { label: '≥', insert: '\\geq', title: 'Katta yoki teng' },
    { label: '≠', insert: '\\neq', title: 'Teng emas' },
    { label: '±', insert: '\\pm', title: 'Musbat/manfiy' },
    { label: '∞', insert: '\\infty', title: 'Cheksizlik' },
    { label: 'α', insert: '\\alpha', title: 'Alpha' },
    { label: 'β', insert: '\\beta', title: 'Beta' },
    { label: 'θ', insert: '\\theta', title: 'Theta' },
    { label: '$…$', insert: '$formula$', title: 'Satr ichida formula', isWrapper: true },
    { label: '$$…$$', insert: '$$formula$$', title: 'Blok formula', isWrapper: true },
];

/**
 * MathEditor — LaTeX yozish uchun textarea + preview
 * @param {string}   value       - Joriy qiymat
 * @param {function} onChange    - qiymat o'zgarganda (yangi matn bilan)
 * @param {string}   placeholder - placeholder matni
 * @param {number}   rows        - textarea satrlari soni
 * @param {string}   name        - input nomi
 * @param {boolean}  required    - majburiy maydon
 */
export default function MathEditor({
    value = '',
    onChange,
    placeholder = 'Matn yoki LaTeX formula kiriting...',
    rows = 4,
    name,
    required = false,
}) {
    const [showPreview, setShowPreview] = useState(false);
    const textareaRef = useRef(null);

    /** Kursorga formula qo'yish */
    function insertFormula(insert, isWrapper) {
        const ta = textareaRef.current;
        if (!ta) return;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const selected = value.slice(start, end);

        let toInsert;
        if (isWrapper) {
            // Faqat $ yoki $$ wrapperlar: tanlangan matnni ichiga oladi
            if (insert === '$formula$') {
                toInsert = selected ? `$${selected}$` : '$formula$';
            } else {
                toInsert = selected ? `$$${selected}$$` : '$$formula$$';
            }
        } else {
            toInsert = insert;
        }

        const newVal = value.slice(0, start) + toInsert + value.slice(end);
        onChange({ target: { name, value: newVal } });

        // Kursorni to'g'ri joyga o'tkazish
        setTimeout(() => {
            ta.focus();
            const newCursor = start + toInsert.length;
            ta.setSelectionRange(newCursor, newCursor);
        }, 0);
    }

    return (
        <div className="math-editor">
            {/* Toolbar */}
            <div className="math-toolbar">
                <span className="math-toolbar-label">∑ Formula:</span>
                <div className="math-toolbar-buttons">
                    {FORMULA_BUTTONS.map((btn, i) => (
                        <button
                            key={i}
                            type="button"
                            title={btn.title}
                            className="math-btn"
                            onClick={() => insertFormula(btn.insert, btn.isWrapper)}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
                <button
                    type="button"
                    className={`math-preview-toggle ${showPreview ? 'active' : ''}`}
                    onClick={() => setShowPreview(p => !p)}
                >
                    {showPreview ? '✕ Preview' : '👁 Preview'}
                </button>
            </div>

            {/* Textarea */}
            <textarea
                ref={textareaRef}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                rows={rows}
                required={required}
                className="math-textarea"
                spellCheck={false}
            />

            {/* Preview */}
            {showPreview && (
                <div className="math-preview">
                    <div className="math-preview-label">Ko'rinishi:</div>
                    <div className="math-preview-content">
                        {value ? (
                            <MathText text={value} />
                        ) : (
                            <span className="math-preview-empty">Preview uchun matn kiriting...</span>
                        )}
                    </div>
                </div>
            )}

            <p className="math-hint">
                💡 Formula yozish: <code>$x^2$</code> → satr ichida, <code>$$\frac{'{'}{'}'}$$</code> → alohida blokda
            </p>
        </div>
    );
}
