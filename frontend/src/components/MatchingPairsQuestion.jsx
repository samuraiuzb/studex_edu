/**
 * MatchingPairsQuestion — Drag & Drop Style
 *
 * Right-side tiles can be DRAGGED onto left-side drop zones.
 * Click-based matching still works as a fallback.
 * Matched pairs show a shared color. Submit button appears when all matched.
 */
import React, { useState, useEffect, useRef } from 'react';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const PAIR_COLORS = [
  { bg: '#fef9c3', text: '#713f12', border: '#fbbf24' }, // yellow
  { bg: '#dbeafe', text: '#1e3a8a', border: '#60a5fa' }, // blue
  { bg: '#dcfce7', text: '#14532d', border: '#4ade80' }, // green
  { bg: '#fce7f3', text: '#831843', border: '#f472b6' }, // pink
  { bg: '#ede9fe', text: '#3b0764', border: '#a78bfa' }, // purple
  { bg: '#ffedd5', text: '#7c2d12', border: '#fb923c' }, // orange
];

export default function MatchingPairsQuestion({
  question,
  onAnswerSubmit,
  disabled = false,
  initialMatchings = null,
}) {
  const [leftTiles, setLeftTiles] = useState([]);
  const [rightTiles, setRightTiles] = useState([]);
  // matchings: { leftId: rightId }
  const [matchings, setMatchings] = useState({});
  const [pairColors, setPairColors] = useState({});
  const [result, setResult] = useState(null);
  // For click-based fallback: which right tile is "selected" to be placed
  const [selectedRight, setSelectedRight] = useState(null);
  // Drag state
  const [draggedRightId, setDraggedRightId] = useState(null);
  const [dragOverLeftId, setDragOverLeftId] = useState(null);

  useEffect(() => {
    if (!question?.matching_pairs?.length) return;
    const pairs = question.matching_pairs;
    setLeftTiles(pairs.map(p => ({ id: p.id, text: p.left_item, pairId: p.id })));
    setRightTiles(shuffle(pairs.map(p => ({ id: p.id, text: p.right_item, pairId: p.id }))));
    setSelectedRight(null);
    setDraggedRightId(null);
    setDragOverLeftId(null);
    setResult(null);

    if (initialMatchings) {
      setMatchings(initialMatchings);
      const colors = {};
      Object.entries(initialMatchings).forEach(([lId], idx) => {
        colors[lId] = idx % PAIR_COLORS.length;
      });
      setPairColors(colors);
    } else {
      setMatchings({});
      setPairColors({});
    }
  }, [question]);

  const pairs = question?.matching_pairs || [];
  const totalPairs = pairs.length;
  const matchedCount = Object.keys(matchings).length;
  const allMatched = matchedCount === totalPairs;

  // Which right tile is currently placed in a left slot
  const getRightMatchedOnLeft = (leftId) => matchings[leftId] ?? null;
  const getLeftForRight = (rightId) =>
    Object.entries(matchings).find(([, rId]) => String(rId) === String(rightId))?.[0] ?? null;

  function doMatch(leftId, rightId) {
    if (disabled || result) return;

    setMatchings(prev => {
      const next = { ...prev };
      // Remove rightId from any existing left slot
      Object.entries(next).forEach(([lId, rId]) => {
        if (String(rId) === String(rightId)) delete next[lId];
      });
      // Place it in the new left slot
      next[leftId] = rightId;
      return next;
    });

    setPairColors(prev => {
      const next = { ...prev };
      if (!next[leftId] && next[leftId] !== 0) {
        next[leftId] = Object.keys(matchings).length % PAIR_COLORS.length;
      }
      return next;
    });
  }

  function unmatchLeft(leftId) {
    if (disabled || result) return;
    setMatchings(prev => { const n = { ...prev }; delete n[leftId]; return n; });
    setPairColors(prev => { const n = { ...prev }; delete n[leftId]; return n; });
  }

  // --- Drag handlers (right tiles) ---
  function onDragStart(e, rightId) {
    if (disabled || result) return;
    setDraggedRightId(rightId);
    e.dataTransfer.effectAllowed = 'move';
  }

  function onDragEnd() {
    setDraggedRightId(null);
    setDragOverLeftId(null);
  }

  // --- Drop handlers (left slots) ---
  function onDragOver(e, leftId) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverLeftId(leftId);
  }

  function onDragLeave() {
    setDragOverLeftId(null);
  }

  function onDrop(e, leftId) {
    e.preventDefault();
    setDragOverLeftId(null);
    if (draggedRightId == null) return;
    doMatch(leftId, draggedRightId);
    setDraggedRightId(null);
    setSelectedRight(null);
  }

  // --- Click fallback ---
  function onRightClick(rightId) {
    if (disabled || result) return;
    if (selectedRight === rightId) {
      setSelectedRight(null);
    } else {
      setSelectedRight(rightId);
    }
  }

  function onLeftClick(leftId) {
    if (disabled || result) return;
    if (selectedRight != null) {
      doMatch(leftId, selectedRight);
      setSelectedRight(null);
    } else {
      // Click matched left to unplace its right
      if (getRightMatchedOnLeft(leftId) != null) {
        unmatchLeft(leftId);
      }
    }
  }

  function handleSubmit() {
    const res = {};
    Object.entries(matchings).forEach(([lId, rId]) => {
      res[lId] = String(lId) === String(rId);
    });
    setResult(res);
    onAnswerSubmit(matchings);
  }

  if (!question?.matching_pairs?.length) {
    return <div className="text-slate-400 text-center py-4">Juftliklar topilmadi</div>;
  }

  // Color for a left tile
  const colorFor = (leftId) => {
    const ci = pairColors[leftId];
    return ci != null ? PAIR_COLORS[ci] : null;
  };

  // Which right tiles are still unplaced (in the right pool)
  const placedRightIds = new Set(Object.values(matchings).map(String));
  const unplacedRight = rightTiles.filter(t => !placedRightIds.has(String(t.id)));

  return (
    <div className="select-none space-y-4">
      {/* Header */}
      {!result && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="font-semibold text-blue-600">{matchedCount}</span>
            <span>/</span>
            <span className="font-semibold">{totalPairs}</span>
            <span>juft topildi</span>
          </div>
          {selectedRight != null && (
            <div className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full font-medium">
              📌 Chap tomondan joy tanlang
            </div>
          )}
        </div>
      )}

      {/* Progress bar */}
      {!result && (
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${totalPairs > 0 ? (matchedCount / totalPairs) * 100 : 0}%`,
              background: 'linear-gradient(to right, #f59e0b, #f97316)',
            }}
          />
        </div>
      )}

      {/* Instruction */}
      {!result && matchedCount === 0 && selectedRight == null && (
        <div className="text-xs text-center text-slate-400 italic">
          O'ng tomondagi kartochkani <strong>suring</strong> yoki <strong>bosing</strong>, so'ng chap tomonga qo'ying
        </div>
      )}

      {/* Main layout: left drop zones + right pool */}
      <div className="grid grid-cols-2 gap-4">

        {/* LEFT COLUMN — drop targets */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mb-1">
            CHAP ↓
          </div>
          {leftTiles.map(tile => {
            const placedRightId = getRightMatchedOnLeft(tile.id);
            const placedRight = rightTiles.find(r => String(r.id) === String(placedRightId));
            const color = colorFor(tile.id);
            const isDropTarget = dragOverLeftId === tile.id;
            const isDraggingOver = isDropTarget && draggedRightId != null;

            // Result state
            let correct = null;
            if (result) correct = result[tile.id];

            const baseLeft = {
              borderRadius: 14,
              border: '2.5px solid',
              minHeight: 80,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: disabled || result ? 'default' : 'pointer',
              transition: 'all 0.18s ease',
              padding: '8px 10px',
              textAlign: 'center',
              fontWeight: 600,
              fontSize: 13,
              userSelect: 'none',
              position: 'relative',
              gap: 6,
            };

            // Styles
            let leftBg, leftBorder, leftColor;
            if (result) {
              leftBg = correct ? '#d1fae5' : '#fee2e2';
              leftBorder = correct ? '#34d399' : '#f87171';
              leftColor = correct ? '#065f46' : '#991b1b';
            } else if (isDraggingOver) {
              leftBg = '#eff6ff'; leftBorder = '#3b82f6'; leftColor = '#1e40af';
            } else if (color && placedRight) {
              leftBg = color.bg; leftBorder = color.border; leftColor = color.text;
            } else {
              leftBg = '#f1f5f9'; leftBorder = '#cbd5e1'; leftColor = '#475569';
            }

            return (
              <div
                key={tile.id}
                style={{
                  ...baseLeft, background: leftBg, borderColor: leftBorder, color: leftColor,
                  boxShadow: isDraggingOver ? '0 0 0 3px #93c5fd80' : undefined,
                }}
                onDragOver={e => onDragOver(e, tile.id)}
                onDragLeave={onDragLeave}
                onDrop={e => onDrop(e, tile.id)}
                onClick={() => onLeftClick(tile.id)}
              >
                {/* Left label */}
                <div style={{ fontSize: 13, fontWeight: 700 }}>{tile.text}</div>

                {/* Answer slot */}
                {placedRight && !result && (
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.7)',
                      border: `1.5px solid ${color?.border || '#94a3b8'}`,
                      borderRadius: 8,
                      padding: '3px 10px',
                      fontSize: 12,
                      fontWeight: 600,
                      color: color?.text || '#334155',
                      marginTop: 2,
                    }}
                  >
                    {placedRight.text}
                  </div>
                )}
                {result && placedRight && (
                  <div style={{ fontSize: 12, marginTop: 2 }}>
                    {correct ? '✅' : '❌'} {placedRight.text}
                  </div>
                )}

                {/* Empty drop hint */}
                {!placedRight && !result && (
                  <div style={{
                    fontSize: 11,
                    color: isDraggingOver ? '#3b82f6' : '#94a3b8',
                    fontStyle: 'italic',
                    fontWeight: 400,
                  }}>
                    {isDraggingOver ? '⬇ Bu yerga qo\'ying' : '— bu yerga tashlang —'}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* RIGHT COLUMN — draggable pool */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mb-1">
            O'NG ↓
          </div>

          {/* Unplaced right tiles */}
          {unplacedRight.map(tile => {
            const isSel = selectedRight === tile.id;
            const isDragging = draggedRightId === tile.id;
            return (
              <div
                key={tile.id}
                draggable={!disabled && !result}
                onDragStart={e => onDragStart(e, tile.id)}
                onDragEnd={onDragEnd}
                onClick={() => onRightClick(tile.id)}
                style={{
                  borderRadius: 14,
                  border: `2.5px solid ${isSel ? '#f59e0b' : '#94a3b8'}`,
                  minHeight: 80,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: disabled || result ? 'default' : 'grab',
                  transition: 'all 0.18s ease',
                  padding: '10px',
                  textAlign: 'center',
                  fontWeight: 600,
                  fontSize: 13,
                  userSelect: 'none',
                  background: isSel ? '#fef3c7' : isDragging ? '#e0f2fe' : '#e2e8f0',
                  color: isSel ? '#92400e' : '#334155',
                  opacity: isDragging ? 0.5 : 1,
                  boxShadow: isSel ? '0 0 0 3px #fbbf2450' : isDragging ? '0 4px 12px rgba(0,0,0,0.15)' : undefined,
                  transform: isDragging ? 'scale(1.04)' : undefined,
                }}
                className={!disabled && !result && !isSel ? 'hover:border-blue-400 hover:bg-blue-50 hover:text-blue-800' : ''}
              >
                {tile.text}
              </div>
            );
          })}

          {/* Already-placed right tiles (shown as dim placeholders) */}
          {rightTiles.filter(t => placedRightIds.has(String(t.id))).map(tile => {
            const leftId = getLeftForRight(tile.id);
            const color = leftId ? colorFor(leftId) : null;
            return (
              <div
                key={tile.id}
                draggable={!disabled && !result}
                onDragStart={e => onDragStart(e, tile.id)}
                onDragEnd={onDragEnd}
                onClick={() => {
                  if (disabled || result) return;
                  // Picking up a placed tile: unplace it and select it
                  if (leftId) unmatchLeft(leftId);
                  setSelectedRight(tile.id);
                }}
                style={{
                  borderRadius: 14,
                  border: `2.5px dashed ${color?.border || '#94a3b8'}`,
                  minHeight: 80,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: disabled || result ? 'default' : 'grab',
                  transition: 'all 0.18s ease',
                  padding: '10px',
                  textAlign: 'center',
                  fontWeight: 500,
                  fontSize: 12,
                  userSelect: 'none',
                  background: color ? color.bg + '55' : '#f8fafc',
                  color: color?.text || '#94a3b8',
                  opacity: 0.65,
                }}
              >
                {tile.text}
              </div>
            );
          })}
        </div>
      </div>

      {/* Submit button */}
      {!disabled && !result && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!allMatched}
          className={[
            'w-full py-3 rounded-xl font-bold text-sm transition-all duration-200',
            allMatched
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg hover:shadow-orange-400/40 hover:scale-[1.01] cursor-pointer'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed',
          ].join(' ')}
        >
          {allMatched
            ? '✅ Javobni tekshirish'
            : `⊘ Barcha juftlarni to'ldiring (${matchedCount}/${totalPairs})`}
        </button>
      )}

      {/* Result summary */}
      {result && (
        <div className={[
          'rounded-xl border px-4 py-3 text-sm font-semibold text-center',
          Object.values(result).every(Boolean)
            ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
            : 'bg-red-50 border-red-400 text-red-700',
        ].join(' ')}>
          {Object.values(result).every(Boolean)
            ? `✅ Barcha ${totalPairs} juft to'g'ri!`
            : `❌ ${Object.values(result).filter(Boolean).length}/${totalPairs} juft to'g'ri`}
        </div>
      )}

      {/* Correct answers when wrong */}
      {result && !Object.values(result).every(Boolean) && (
        <div className="space-y-1">
          <div className="text-xs text-slate-400 font-semibold uppercase tracking-wide">To'g'ri juftlar:</div>
          {pairs.map(p => (
            <div
              key={p.id}
              className={`flex items-center gap-2 text-xs rounded-lg px-3 py-2 ${result[p.id] ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}
            >
              <span>{result[p.id] ? '✅' : '❌'}</span>
              <span className="font-semibold">{p.left_item}</span>
              <span className="text-slate-400">→</span>
              <span>{p.right_item}</span>
            </div>
          ))}
        </div>
      )}

      {disabled && !result && (
        <div className="text-center py-2 text-sm font-semibold text-emerald-600">
          ✅ Javob saqlangan
        </div>
      )}
    </div>
  );
}
