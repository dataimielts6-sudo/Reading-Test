
import React from 'react';
import { Answer } from '../types';

interface ControlPanelProps {
  currentPart: number;
  setCurrentPart: (part: number) => void;
  answers: Answer;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ currentPart, setCurrentPart, answers }) => {
  const getPartProgress = (startQ: number, endQ: number) => {
    const total = endQ - startQ + 1;
    let answered = 0;
    for (let i = startQ; i <= endQ; i++) {
      if (answers[i]) {
        answered++;
      }
    }
    return `${answered}/${total}`;
  };

  return (
    <footer className="bg-white shadow-top p-4 flex justify-center items-center sticky bottom-0 z-20">
      <div className="flex space-x-4">
        {[0, 1, 2].map(partIndex => (
          <button
            key={partIndex}
            onClick={() => setCurrentPart(partIndex)}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors text-center ${
              currentPart === partIndex
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Part {partIndex + 1}
            <span className="block text-xs font-normal">
              {partIndex === 0 && getPartProgress(1, 13)}
              {partIndex === 1 && getPartProgress(14, 26)}
              {partIndex === 2 && getPartProgress(27, 40)}
            </span>
          </button>
        ))}
      </div>
    </footer>
  );
};

export default ControlPanel;
