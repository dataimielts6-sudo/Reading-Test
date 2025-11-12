
import React from 'react';
import { Answer, TestPart } from '../types';

interface ControlPanelProps {
  currentPart: number;
  answers: Answer;
  testParts: TestPart[];
  onQuestionSelect: (questionId: number) => void;
  onSubmit: () => void;
  focusedQuestionId: number | null;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  currentPart,
  answers,
  testParts,
  onQuestionSelect,
  onSubmit,
  focusedQuestionId,
}) => {
  const questionRanges = testParts.map(part =>
    part.questions.flatMap(qGroup => qGroup.questions.map(q => q.q_id))
  );

  return (
    <footer className="bg-white sticky bottom-0 z-20 border-t shadow-[0_-2px_5px_rgba(0,0,0,0.05)]">
      <div className="p-3 pr-0 flex justify-between items-stretch">
        <div className="flex-grow flex flex-wrap items-center gap-x-4 gap-y-2 pr-4">
          {questionRanges.map((qIds, partIndex) => (
            <React.Fragment key={partIndex}>
              <div className="flex items-center gap-x-2">
                <button
                  onClick={() => onQuestionSelect(qIds[0])}
                  className={`font-bold text-base md:text-lg transition-colors ${
                    currentPart === partIndex ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  aria-label={`Go to Part ${partIndex + 1}`}
                >
                  Part {partIndex + 1}
                </button>
              </div>
              {qIds.map(qId => (
                <button
                  key={qId}
                  onClick={() => onQuestionSelect(qId)}
                  className={`w-7 h-7 rounded flex items-center justify-center text-xs font-semibold transition-all duration-150 border ${
                    focusedQuestionId === qId
                      ? 'ring-2 ring-offset-1 ring-blue-500 border-blue-500'
                      : answers[qId]
                      ? 'bg-gray-700 text-white border-gray-700'
                      : 'bg-white text-gray-600 hover:bg-gray-200 border-gray-300'
                  }`}
                  aria-label={`Go to Question ${qId}`}
                >
                  {qId}
                </button>
              ))}
              {partIndex < questionRanges.length - 1 && (
                  <div className="h-6 w-px bg-gray-300 mx-1 self-center"></div>
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="pl-4 flex-shrink-0">
            <button
                onClick={onSubmit}
                className="bg-gray-100 h-full px-5 flex items-center justify-center rounded-l-md hover:bg-gray-200 transition-colors"
                aria-label="Submit test"
            >
                <i className="fas fa-check text-2xl text-gray-700"></i>
            </button>
        </div>
      </div>
    </footer>
  );
};

export default ControlPanel;