import React from 'react';
import { Answer } from '../types';

interface ResultsModalProps {
  answers: Answer;
  correctAnswers: Answer;
  onClose: () => void;
}

const ResultsModal: React.FC<ResultsModalProps> = ({ answers, correctAnswers, onClose }) => {
  const calculateScore = () => {
    let score = 0;
    for (const qId in correctAnswers) {
      const numericQId = parseInt(qId, 10);
      const userAnswer = (answers[numericQId] || '').toLowerCase().trim();
      const correctAns = (correctAnswers[numericQId] || '').toLowerCase().trim();

      if (!userAnswer) continue;

      // Handle multi-select answers (e.g., "A,C")
      if (correctAns.includes(',')) {
        const userAnswerSorted = userAnswer.split(',').sort().join(',');
        const correctAnsSorted = correctAns.split(',').sort().join(',');
        if (userAnswerSorted === correctAnsSorted) {
          // A bit of a hack: since multi-choice questions have 2 q_ids but 1 answer,
          // we check if the next question has the same answer to credit both.
          const nextQId = numericQId + 1;
          if (correctAnswers[nextQId] && correctAnswers[nextQId].toLowerCase().trim().split(',').sort().join(',') === correctAnsSorted) {
            score += 2;
          } else {
            score++;
          }
        }
      } else if (userAnswer === correctAns) {
         // Skip scoring for the second part of a multi-choice question that's already been scored
        const prevQId = numericQId - 1;
        if (correctAnswers[prevQId] && correctAnswers[prevQId].includes(',')) {
          // This is the second ID of a multi-choice question, it was handled above.
        } else {
          score++;
        }
      }
    }
    return score;
  };

  const score = calculateScore();
  const totalQuestions = Object.keys(correctAnswers).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Your Results</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
        </div>
        <div className="p-6 text-center bg-gray-50">
          <p className="text-lg text-gray-600">You scored</p>
          <p className="text-5xl font-bold text-blue-600 my-2">{score} / {totalQuestions}</p>
        </div>
        <div className="overflow-y-auto p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.keys(correctAnswers).map((qId) => {
              const numericQId = parseInt(qId, 10);
              const correctAns = correctAnswers[numericQId];
              const userAnswer = answers[numericQId] || 'No Answer';
              
              let isCorrect = false;
              if (correctAns.includes(',')) {
                const userAnswerSorted = userAnswer.toLowerCase().trim().split(',').sort().join(',');
                const correctAnsSorted = correctAns.toLowerCase().trim().split(',').sort().join(',');
                isCorrect = userAnswerSorted === correctAnsSorted;
              } else {
                isCorrect = userAnswer.toLowerCase().trim() === correctAns.toLowerCase().trim();
              }
              
              // Don't render the second question ID for multi-choice
              const prevQId = numericQId - 1;
              if (correctAnswers[prevQId] && correctAnswers[prevQId].includes(',')) {
                  return null;
              }
              
              const displayQId = (correctAnswers[numericQId].includes(',') && correctAnswers[numericQId+1]) ? `${qId}-${numericQId+1}` : qId;

              return (
                <div key={qId} className={`p-3 rounded-lg border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <p className="font-bold text-gray-700">Question {displayQId}</p>
                  <p className="text-sm">Your answer: <span className="font-semibold">{userAnswer}</span></p>
                  {!isCorrect && <p className="text-sm">Correct answer: <span className="font-semibold text-green-700">{correctAns}</span></p>}
                </div>
              );
            })}
          </div>
        </div>
        <div className="p-4 border-t bg-gray-50 text-right">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsModal;