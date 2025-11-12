
import React, { useState, useRef, MouseEvent, useCallback, useEffect } from 'react';
import { Question, QuestionType, Answer } from '../types';

interface QuestionsProps {
  questionsData: Question[];
  answers: Answer;
  onAnswerChange: (questionId: number, answer: string) => void;
  focusedQuestionId: number | null;
  setFocusedQuestionId: (id: number | null) => void;
  scrollToQuestion: number | null;
  setScrollToQuestion: (id: number | null) => void;
}

interface ContextMenuState {
  x: number;
  y: number;
  visible: boolean;
  range: Range | null;
}

const Questions: React.FC<QuestionsProps> = ({ 
  questionsData, 
  answers, 
  onAnswerChange,
  focusedQuestionId,
  setFocusedQuestionId,
  scrollToQuestion,
  setScrollToQuestion
}) => {
  const questionsRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ x: 0, y: 0, visible: false, range: null });

  useEffect(() => {
    if (scrollToQuestion !== null) {
      const element = document.getElementById(`q-wrapper-${scrollToQuestion}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setScrollToQuestion(null); // Reset after attempting to scroll
    }
  }, [scrollToQuestion, setScrollToQuestion]);


  const handleMouseUp = (e: MouseEvent<HTMLDivElement>) => {
    // Prevent context menu if clicking on an existing annotation, or an input/select element
    const target = e.target as HTMLElement;
    if (
        target.closest('.bg-yellow-300') ||
        target.closest('.has-note') ||
        ['INPUT', 'SELECT', 'LABEL'].includes(target.tagName)
    ) {
        setContextMenu(prev => ({ ...prev, visible: false, range: null }));
        return;
    }

    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const range = selection.getRangeAt(0);
      const containerRect = questionsRef.current?.getBoundingClientRect();

      if (containerRect && questionsRef.current) {
         setContextMenu({
            x: e.clientX - containerRect.left,
            y: e.clientY - containerRect.top + questionsRef.current.scrollTop + 10,
            visible: true,
            range: range
        });
      }
    } else {
       if (contextMenu.visible) {
           setContextMenu(prev => ({ ...prev, visible: false, range: null }));
       }
    }
  };

  const handleQuestionsClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'SPAN' && target.classList.contains('bg-yellow-300')) {
        const parent = target.parentNode;
        if (parent) {
            while (target.firstChild) {
                parent.insertBefore(target.firstChild, target);
            }
            parent.removeChild(target);
            parent.normalize();
        }
    }
  };

  const handleClickOutside = useCallback((event: globalThis.MouseEvent) => {
    if (contextMenu.visible && questionsRef.current && !questionsRef.current.contains(event.target as Node)) {
        setContextMenu({ x: 0, y: 0, visible: false, range: null });
    }
  }, [contextMenu.visible]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  const handleHighlight = () => {
    const { range } = contextMenu;
    if (range) {
      const span = document.createElement('span');
      span.className = 'bg-yellow-300 cursor-pointer';
      span.title = 'Click to remove highlight';
      try {
          range.surroundContents(span);
          window.getSelection()?.removeAllRanges();
      } catch (e) {
          console.error("Could not surround contents, likely due to partial node selection.", e);
      }
    }
    setContextMenu({ x: 0, y: 0, visible: false, range: null });
  };
  
  const handleNote = () => {
    const { range } = contextMenu;
    if (!range || range.collapsed) return;

    const noteText = window.prompt("Enter your note:");
    if (noteText) {
      const span = document.createElement('span');
      span.className = 'has-note';
      span.title = noteText;
      
      try {
        const contents = range.extractContents();
        span.appendChild(contents);
        range.insertNode(span);
        window.getSelection()?.removeAllRanges();
      } catch (e) {
        console.error("Could not create note, likely due to partial node selection.", e);
      }
    }
    setContextMenu({ x: 0, y: 0, visible: false, range: null });
  };


  const renderQuestionType = (qGroup: Question) => {
    switch (qGroup.type) {
      case QuestionType.TRUE_FALSE_NOT_GIVEN:
        const options = qGroup.instructions.includes("YES") ? ["YES", "NO", "NOT GIVEN"] : ["TRUE", "FALSE", "NOT GIVEN"];
        return qGroup.questions.map(q => (
          <div key={q.q_id} id={`q-wrapper-${q.q_id}`} className={`mb-4 p-3 rounded-lg transition-colors ${focusedQuestionId === q.q_id ? 'bg-blue-100' : 'bg-gray-50'}`}>
            <p className="mb-2">{q.q_id}. {q.text}</p>
            <div className="flex space-x-4">
              {options.map(opt => (
                <label key={opt} className="flex items-center space-x-1 cursor-pointer">
                  <input
                    type="radio"
                    name={`q_${q.q_id}`}
                    value={opt}
                    checked={answers[q.q_id] === opt}
                    onChange={(e) => onAnswerChange(q.q_id, e.target.value)}
                    onFocus={() => setFocusedQuestionId(q.q_id)}
                    onBlur={() => setFocusedQuestionId(null)}
                    className="form-radio"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ));
      case QuestionType.NOTE_COMPLETION:
      case QuestionType.SUMMARY_COMPLETION:
        return qGroup.questions.map(q => (
          <div key={q.q_id} id={`q-wrapper-${q.q_id}`} className={`mb-2 flex items-baseline p-2 rounded-lg transition-colors ${focusedQuestionId === q.q_id ? 'bg-blue-100' : ''}`}>
             <p className="whitespace-pre-wrap">{q.q_id}. {q.text}</p>
             <input
                type="text"
                value={answers[q.q_id] || ''}
                onChange={(e) => onAnswerChange(q.q_id, e.target.value)}
                onFocus={() => setFocusedQuestionId(q.q_id)}
                onBlur={() => setFocusedQuestionId(null)}
                className="border-b-2 border-gray-400 focus:border-blue-500 outline-none w-28 mx-2 text-center bg-transparent"
              />
              {q.subtext && <p>{q.subtext}</p>}
          </div>
        ));
      case QuestionType.MULTIPLE_CHOICE:
        return qGroup.questions.map(q => (
          <div key={q.q_id} id={`q-wrapper-${q.q_id}`} className={`mb-4 p-3 rounded-lg transition-colors ${focusedQuestionId === q.q_id ? 'bg-blue-100' : 'bg-gray-50'}`}>
            <p className="mb-2 font-semibold">{q.q_id}. {q.text}</p>
            <div className="flex flex-col space-y-2">
              {q.options?.map(opt => (
                <label key={opt} className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-100">
                  <input
                    type="radio"
                    name={`q_${q.q_id}`}
                    value={opt.substring(0, 1)}
                    checked={answers[q.q_id] === opt.substring(0, 1)}
                    onChange={(e) => onAnswerChange(q.q_id, e.target.value)}
                    onFocus={() => setFocusedQuestionId(q.q_id)}
                    onBlur={() => setFocusedQuestionId(null)}
                    className="form-radio"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ));
        case QuestionType.MULTIPLE_CHOICE_MULTIPLE: {
          const q_ids = qGroup.questions.map(q => q.q_id);
          const first_q_id = q_ids[0]; // Use the first q_id for storing combined answer
          const handleMultiChoiceChange = (option: string) => {
              const currentAnswers = (answers[first_q_id] || '').split(',').filter(Boolean);
              const newAnswers = currentAnswers.includes(option)
                  ? currentAnswers.filter(o => o !== option)
                  : [...currentAnswers, option];
              onAnswerChange(first_q_id, newAnswers.sort().join(','));
          };
          // Apply active style if any of the related questions are active
          const isActive = q_ids.some(id => focusedQuestionId === id);

          return (
              <div id={`q-wrapper-${first_q_id}`} className={`p-3 rounded-lg transition-colors ${isActive ? 'bg-blue-100' : 'bg-gray-50'}`}>
                  {qGroup.options?.map(opt => {
                      const optionLetter = opt.substring(0, 1);
                      return (
                          <label key={opt} className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-100">
                              <input
                                  type="checkbox"
                                  name={`q_${first_q_id}`}
                                  value={optionLetter}
                                  checked={(answers[first_q_id] || '').split(',').includes(optionLetter)}
                                  onChange={() => handleMultiChoiceChange(optionLetter)}
                                  onFocus={() => setFocusedQuestionId(first_q_id)}
                                  onBlur={() => setFocusedQuestionId(null)}
                                  className="form-checkbox"
                              />
                              <span>{opt}</span>
                          </label>
                      );
                  })}
              </div>
          );
      }
      case QuestionType.MATCHING_HEADINGS:
      case QuestionType.MATCHING_PEOPLE:
      case QuestionType.SENTENCE_COMPLETION:
      case QuestionType.SUMMARY_COMPLETION_OPTIONS:
        const optionValues = qGroup.type === QuestionType.SUMMARY_COMPLETION_OPTIONS ? qGroup.options?.map(o => o.split(' ')[0]) : qGroup.options?.map(o => o.split(' ')[0]) || ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
        return qGroup.questions.map(q => (
          <div key={q.q_id} id={`q-wrapper-${q.q_id}`} className={`flex items-baseline mb-2 p-3 rounded-lg transition-colors ${focusedQuestionId === q.q_id ? 'bg-blue-100' : 'bg-gray-50'}`}>
            <label htmlFor={`q_select_${q.q_id}`} className="flex-1 whitespace-pre-wrap">{q.q_id}. {q.text}</label>
            <select
              id={`q_select_${q.q_id}`}
              value={answers[q.q_id] || ''}
              onChange={(e) => onAnswerChange(q.q_id, e.target.value)}
              onFocus={() => setFocusedQuestionId(q.q_id)}
              onBlur={() => setFocusedQuestionId(null)}
              className="border border-gray-300 rounded-md p-1 ml-2 bg-white"
            >
              <option value="">Select...</option>
              {optionValues.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
             {q.subtext && <p>{q.subtext}</p>}
          </div>
        ));
      default:
        return <p>Unsupported question type.</p>;
    }
  };

  return (
    <div className="bg-gray-50 p-6 overflow-y-auto h-full relative" ref={questionsRef} onMouseUp={handleMouseUp} onClick={handleQuestionsClick}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Questions</h2>
      </div>
      {questionsData.map(qGroup => (
        <div key={qGroup.id} className="mb-8 p-4 border rounded-lg bg-white shadow">
          {qGroup.instructions && <p className="text-sm text-gray-600 mb-4 whitespace-pre-wrap font-semibold">{qGroup.instructions}</p>}
          {qGroup.questionGroupTitle && <h3 className="text-lg font-bold mb-3">{qGroup.questionGroupTitle}</h3>}
          {(qGroup.type === QuestionType.MATCHING_PEOPLE || qGroup.type === QuestionType.SUMMARY_COMPLETION_OPTIONS || qGroup.type === QuestionType.SENTENCE_COMPLETION) && qGroup.options && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
               {qGroup.options.map((opt, i) => <p key={i} className="text-sm">{opt}</p>)}
            </div>
          )}
          {renderQuestionType(qGroup)}
        </div>
      ))}
      {contextMenu.visible && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="absolute bg-white border border-gray-300 rounded-md shadow-lg py-1 z-30"
        >
          <button onClick={handleHighlight} className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            <i className="fas fa-highlighter mr-2"></i>Highlight
          </button>
          <button onClick={handleNote} className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            <i className="fas fa-comment-dots mr-2"></i>Note
          </button>
        </div>
      )}
    </div>
  );
};

export default Questions;