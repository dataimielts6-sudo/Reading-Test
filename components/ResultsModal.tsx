
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
    // FIX: Iterate over keys and parse to number to correctly access answers.
    for (const qId in correctAnswers) {
      const numericQId = parseInt(qId, 10);
      if (answers[numericQId] && answers[numericQId].toLowerCase().trim() === correctAnswers[numericQId].toLowerCase().trim()) {
        score++;
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
            {/* FIX: Use Object.keys to iterate and avoid type issues with Object.entries on number-keyed objects. */}
            {Object.keys(correctAnswers).map((qId) => {
              const numericQId = parseInt(qId, 10);
              const correctAns = correctAnswers[numericQId];
              const userAnswer = answers[numericQId] || 'No Answer';
              const isCorrect = userAnswer.toLowerCase().trim() === correctAns.toLowerCase().trim();
              return (
                <div key={qId} className={`p-3 rounded-lg border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <p className="font-bold text-gray-700">Question {qId}</p>
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