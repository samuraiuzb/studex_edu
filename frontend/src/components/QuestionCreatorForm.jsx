// QuestionCreatorForm.jsx
// O'qituvchi uchun savollarni yaratish/tahrirlash formasi

import React, { useState, useEffect } from 'react';
import './QuestionCreatorForm.css';
import MathEditor from './MathEditor';
import MathText from './MathText';
import InteractiveGraph from './InteractiveGraph';
import FunctionPlot from './FunctionPlot';

const QuestionCreatorForm = ({ testId, existingQuestion = null, onSuccess }) => {
  const [questionType, setQuestionType] = useState('multiple_choice');
  const [formData, setFormData] = useState({
    text: '',
    image: null,
    file: null,
    difficulty: 'medium',
    order: 1,
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: '',
    correct_answer_text: '',
    explanation: ''
  });

  const [matchingPairs, setMatchingPairs] = useState([]);
  const [newPair, setNewPair] = useState({ left_item: '', right_item: '', order: 1 });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (existingQuestion) {
      setQuestionType(existingQuestion.question_type);
      setFormData({
        text: existingQuestion.text,
        image: null,
        file: null,
        difficulty: existingQuestion.difficulty,
        order: existingQuestion.order,
        option_a: existingQuestion.option_a || '',
        option_b: existingQuestion.option_b || '',
        option_c: existingQuestion.option_c || '',
        option_d: existingQuestion.option_d || '',
        correct_option: existingQuestion.correct_option || '',
        correct_answer_text: existingQuestion.correct_answer_text || '',
        explanation: existingQuestion.explanation || ''
      });
      if (existingQuestion.matching_pairs) {
        setMatchingPairs(existingQuestion.matching_pairs);
      }
    }
  }, [existingQuestion]);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddPair = async () => {
    if (!newPair.left_item.trim() || !newPair.right_item.trim()) {
      setMessage('⚠️ Ikkala elementni ham to\'ldiring!');
      return;
    }

    if (!existingQuestion) {
      setMessage('⚠️ Avval savolni saqlang!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/teacher/questions/${existingQuestion.id}/matching-pairs/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            left_item: newPair.left_item,
            right_item: newPair.right_item,
            order: matchingPairs.length + 1
          })
        }
      );

      if (response.ok) {
        const pair = await response.json();
        setMatchingPairs([...matchingPairs, pair]);
        setNewPair({ left_item: '', right_item: '', order: 1 });
        setMessage('✓ Juftlik qo\'shildi!');
      } else {
        setMessage('✗ Xatolik yuz berdi');
      }
    } catch (error) {
      setMessage('✗ Tarmoq xatosi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePair = async (pairId) => {
    if (!window.confirm('Ushbu juftlikni o\'chirmoqchisiz?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/teacher/matching-pairs/${pairId}/`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setMatchingPairs(matchingPairs.filter(p => p.id !== pairId));
        setMessage('✓ Juftlik o\'chirildi!');
      } else {
        setMessage('✗ O\'chirishda xatolik');
      }
    } catch (error) {
      setMessage('✗ Tarmoq xatosi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();

    // Validasyon
    if (!formData.text.trim()) {
      setMessage('⚠️ Savol matni majburiy!');
      return;
    }

    if (questionType === 'multiple_choice') {
      if (!formData.option_a.trim() || !formData.option_b.trim() ||
        !formData.option_c.trim() || !formData.option_d.trim()) {
        setMessage('⚠️ Barcha variantlar majburiy!');
        return;
      }
      if (!formData.correct_option) {
        setMessage('⚠️ To\'g\'ri javobni tanlang!');
        return;
      }
    }

    if ((questionType === 'draw_graph' || questionType === 'find_equation') && !formData.correct_answer_text.trim()) {
      setMessage('⚠️ To\'g\'ri javob matnini (yoki nuqtalarni) kiriting!');
      return;
    }

    if (questionType === 'matching_pairs' && matchingPairs.length < 2) {
      setMessage('⚠️ Kamida 2 ta juftlik kerak!');
      return;
    }

    setLoading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('question_type', questionType);
      formDataObj.append('text', formData.text);
      formDataObj.append('difficulty', formData.difficulty);
      formDataObj.append('order', formData.order);

      if (formData.image) formDataObj.append('image', formData.image);
      if (formData.file) formDataObj.append('file', formData.file);

      if (questionType === 'multiple_choice') {
        formDataObj.append('option_a', formData.option_a);
        formDataObj.append('option_b', formData.option_b);
        formDataObj.append('option_c', formData.option_c);
        formDataObj.append('option_d', formData.option_d);
        formDataObj.append('correct_option', formData.correct_option);
        formDataObj.append('explanation', formData.explanation);
      } else if (questionType === 'draw_graph' || questionType === 'find_equation') {
        formDataObj.append('correct_answer_text', formData.correct_answer_text);
        if (questionType === 'find_equation') {
          formDataObj.append('option_a', formData.option_a); // option_a handles the graph equation for frontend
        }
        formDataObj.append('explanation', formData.explanation);
      }

      const url = existingQuestion
        ? `/api/teacher/questions/${existingQuestion.id}/`
        : `/api/teacher/tests/${testId}/questions/`;

      const method = existingQuestion ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        body: formDataObj
      });

      if (response.ok) {
        const question = await response.json();
        setMessage('✓ Savol muvaffaqiyatli saqlandi!');
        if (onSuccess) onSuccess(question);
      } else {
        const error = await response.json();
        setMessage('✗ Xatolik: ' + JSON.stringify(error));
      }
    } catch (error) {
      setMessage('✗ Tarmoq xatosi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="question-form-container">
      <h2>{existingQuestion ? 'Savolni tahrirlash' : 'Yangi savol yaratish'}</h2>

      {message && (
        <div className={`message ${message.includes('✓') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmitQuestion} encType="multipart/form-data">
        {/* Savol Turi */}
        <div className="form-group">
          <label>Savol turi *</label>
          <select
            value={questionType}
            onChange={(e) => setQuestionType(e.target.value)}
            disabled={!!existingQuestion}
          >
            <option value="multiple_choice">Koʻp variantli (A, B, C, D)</option>
            <option value="matching_pairs">Juftlashtirish (Matching Pairs)</option>
            <option value="draw_graph">Grafik chizish (Interaktiv)</option>
            <option value="find_equation">Funksiya grafigi (Graph Render)</option>
          </select>
        </div>

        {/* Savol Matni */}
        <div className="form-group">
          <label>Savol matni * <span style={{ fontSize: '11px', color: '#6366f1', fontWeight: 600 }}>($LaTeX$ qo'llab-quvvatlaydi)</span></label>
          <MathEditor
            name="text"
            value={formData.text}
            onChange={handleInputChange}
            placeholder="Savol matini kiriting... Masalan: $x^2 + y^2 = z^2$"
            rows={4}
            required
          />
        </div>

        {/* Qiyinlik Darajasi */}
        <div className="form-row">
          <div className="form-group">
            <label>Qiyinlik darajasi</label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleInputChange}
            >
              <option value="easy">Oson</option>
              <option value="medium">O'rtacha</option>
              <option value="hard">Qiyin</option>
            </select>
          </div>

          <div className="form-group">
            <label>Tartib raqami</label>
            <input
              type="number"
              name="order"
              value={formData.order}
              onChange={handleInputChange}
              min="1"
            />
          </div>
        </div>

        {/* Fayl Yuklamalari */}
        <div className="form-row">
          <div className="form-group">
            <label>Savol rasmi (ixtiyoriy)</label>
            <input
              type="file"
              name="image"
              onChange={handleInputChange}
              accept="image/*"
            />
          </div>

          <div className="form-group">
            <label>Qo'shimcha fayl (PDF, Doc) (ixtiyoriy)</label>
            <input
              type="file"
              name="file"
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Multiple Choice Opsiyalari */}
        {questionType === 'multiple_choice' && (
          <>
            <div className="divider">Javob variantlari</div>

            <div className="options-grid">
              {['a', 'b', 'c', 'd'].map(opt => (
                <div className="form-group" key={opt}>
                  <label>
                    Variant {opt.toUpperCase()} *
                    {formData[`option_${opt}`] && (
                      <span style={{ marginLeft: 8, fontSize: '12px', color: '#6366f1' }}>
                        → <MathText text={formData[`option_${opt}`]} />
                      </span>
                    )}
                  </label>
                  <MathEditor
                    name={`option_${opt}`}
                    value={formData[`option_${opt}`]}
                    onChange={handleInputChange}
                    placeholder={`${opt.toUpperCase()} variantini kiriting`}
                    rows={2}
                    required
                  />
                </div>
              ))}
            </div>

            <div className="form-group">
              <label>To'g'ri javob *</label>
              <div className="radio-group">
                {['A', 'B', 'C', 'D'].map(option => (
                  <label key={option} className="radio-label">
                    <input
                      type="radio"
                      name="correct_option"
                      value={option}
                      checked={formData.correct_option === option}
                      onChange={handleInputChange}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Tushuntirish (ixtiyoriy)</label>
              <MathEditor
                name="explanation"
                value={formData.explanation}
                onChange={handleInputChange}
                placeholder="O'quvchi noto'g'ri javob bersa ko'rsatiladigan tushuntirish..."
                rows={3}
              />
            </div>
          </>
        )}

        {/* Matching Pairs Opsiyalari */}
        {questionType === 'matching_pairs' && (
          <>
            <div className="divider">Juftliklarni qo'shish</div>

            <div className="matching-pairs-editor">
              <div className="form-row">
                <div className="form-group">
                  <label>Chap element</label>
                  <input
                    type="text"
                    value={newPair.left_item}
                    onChange={(e) => setNewPair({ ...newPair, left_item: e.target.value })}
                    placeholder="Masalan: Terapiya"
                  />
                </div>

                <div className="form-group">
                  <label>O'ng element</label>
                  <input
                    type="text"
                    value={newPair.right_item}
                    onChange={(e) => setNewPair({ ...newPair, right_item: e.target.value })}
                    placeholder="Masalan: Kasalliklarni davolash"
                  />
                </div>

                <button
                  type="button"
                  className="btn-add-pair"
                  onClick={handleAddPair}
                  disabled={loading}
                >
                  + Qo'shish
                </button>
              </div>

              <div className="pairs-list">
                <h4>Qo'shilgan juftliklar ({matchingPairs.length}):</h4>
                {matchingPairs.length === 0 ? (
                  <p className="no-pairs">Hali juftlik qo'shilmadi</p>
                ) : (
                  <div className="pairs-items">
                    {matchingPairs.map((pair, index) => (
                      <div key={pair.id} className="pair-item">
                        <span className="pair-number">{index + 1}.</span>
                        <span className="pair-left">{pair.left_item}</span>
                        <span className="pair-arrow">←→</span>
                        <span className="pair-right">{pair.right_item}</span>
                        <button
                          type="button"
                          className="btn-delete-pair"
                          onClick={() => handleDeletePair(pair.id)}
                          disabled={loading}
                          title="O'chirish"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Graph Options */}
        {questionType === 'draw_graph' && (
          <div className="divider">Interaktiv Grafik</div>
        )}
        {questionType === 'draw_graph' && (
          <div className="form-group">
            <label>Javob liniyasini torting (Bu to'g'ri javob sifatida olinadi)</label>
            <InteractiveGraph
              onChange={(val) => setFormData({ ...formData, correct_answer_text: val })}
              initialP1={[-2, -2]} initialP2={[2, 2]}
            />
            <p style={{ marginTop: '10px' }}>Joriy javob kodi: <strong>{formData.correct_answer_text}</strong></p>
          </div>
        )}

        {questionType === 'find_equation' && (
          <>
            <div className="divider">Funksiya Grafigi (Find Equation)</div>
            <div className="form-group">
              <label>Chizilishi kerak bo'lgan funksiya (masalan: <b>x^2 - 4</b>)</label>
              <input
                type="text"
                name="option_a"
                value={formData.option_a}
                onChange={handleInputChange}
                placeholder="x^2 - 4"
                required
              />
              <p>Oldindan ko'rish:</p>
              {formData.option_a && <FunctionPlot equation={formData.option_a} />}
            </div>
            <div className="form-group">
              <label>O'quvchidan kutayotgan javobingiz *</label>
              <input
                type="text"
                name="correct_answer_text"
                value={formData.correct_answer_text}
                onChange={handleInputChange}
                placeholder="x^2 - 4"
                required
              />
            </div>
          </>
        )}

        {/* Submit Buttons */}
        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '⏳ Saqlash...' : '💾 Saqlash'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => window.history.back()}>
            Bekor qilish
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionCreatorForm;
