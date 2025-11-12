import React from 'react';
import { Question, QuestionType, Answer } from '../types';

interface QuestionsProps {
  questionsData: Question[];
  answers: Answer;
  onAnswerChange: (questionId: number, answer: string) => void;
}

const Questions: React.FC<QuestionsProps> = ({ questionsData, answers, onAnswerChange }) => {

  const renderQuestionType = (qGroup: Question) => {
    switch (qGroup.type) {
      case QuestionType.TRUE_FALSE_NOT_GIVEN:
        const options = qGroup.instructions.includes("YES") ? ["YES", "NO", "NOT GIVEN"] : ["TRUE", "FALSE", "NOT GIVEN"];
        return qGroup.questions.map(q => (
          <div key={q.q_id} className="mb-4 p-3 bg-gray-50 rounded-lg">
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
          <div key={q.q_id} className="mb-2 flex items-center">
             <p className="whitespace-pre-wrap">{q.q_id}. {q.text}</p>
             <input
                type="text"
                value={answers[q.q_id] || ''}
                onChange={(e) => onAnswerChange(q.q_id, e.target.value)}
                className="border-b-2 border-gray-400 focus:border-blue-500 outline-none w-28 mx-2 text-center"
              />
              {q.subtext && <p>{q.subtext}</p>}
          </div>
        ));
      case QuestionType.MULTIPLE_CHOICE:
        return qGroup.questions.map(q => (
          <div key={q.q_id} className="mb-4 p-3 bg-gray-50 rounded-lg">
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
                    className="form-radio"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ));
      case QuestionType.MATCHING_HEADINGS:
      case QuestionType.MATCHING_PEOPLE:
      case QuestionType.SENTENCE_COMPLETION:
         const optionValues = qGroup.type === QuestionType.MATCHING_HEADINGS ? ['A', 'B', 'C', 'D', 'E', 'F', 'G'] : qGroup.options?.map(o => o.split(' ')[0]) || [];
        return qGroup.questions.map(q => (
          <div key={q.q_id} className="flex items-center justify-between mb-2 p-3 bg-gray-50 rounded-lg">
            <label htmlFor={`q_select_${q.q_id}`} className="flex-1">{q.q_id}. {q.text}</label>
            <select
              id={`q_select_${q.q_id}`}
              value={answers[q.q_id] || ''}
              onChange={(e) => onAnswerChange(q.q_id, e.target.value)}
              className="border border-gray-300 rounded-md p-1"
            >
              <option value="">Select...</option>
              {optionValues.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        ));
      default:
        return <p>Unsupported question type.</p>;
    }
  };

  return (
    <div className="bg-gray-50 p-6 overflow-y-auto h-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Questions</h2>
      {questionsData.map(qGroup => (
        <div key={qGroup.id} className="mb-8 p-4 border rounded-lg bg-white shadow">
          {qGroup.instructions && <p className="text-sm text-gray-600 mb-4 whitespace-pre-wrap font-semibold">{qGroup.instructions}</p>}
          {qGroup.questionGroupTitle && <h3 className="text-lg font-bold mb-3">{qGroup.questionGroupTitle}</h3>}
          {qGroup.options && qGroup.type !== QuestionType.MULTIPLE_CHOICE && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
               {qGroup.options.map((opt, i) => <p key={i} className="text-sm">{opt}</p>)}
            </div>
          )}
          {renderQuestionType(qGroup)}
        </div>
      ))}
    </div>
  );
};

export default Questions;