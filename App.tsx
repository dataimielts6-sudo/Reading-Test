
import React, { useState, useEffect, useCallback } from 'react';
import { IELTS_TEST_DATA, CORRECT_ANSWERS } from './constants';
import Header from './components/Header';
import TestArea from './components/TestArea';
import ControlPanel from './components/ControlPanel';
import ResultsModal from './components/ResultsModal';
import { Answer } from './types';

const App: React.FC = () => {
  const [currentPart, setCurrentPart] = useState(0);
  const [answers, setAnswers] = useState<Answer>({});
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes in seconds
  const [showResults, setShowResults] = useState(false);
  const [testStarted, setTestStarted] = useState(false);

  useEffect(() => {
    // FIX: Changed NodeJS.Timeout to number for browser environments.
    let timer: number;
    if (testStarted && timeLeft > 0 && !showResults) {
      timer = window.setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSubmit();
    }
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, testStarted, showResults]);

  const handleStartTest = () => {
    setTestStarted(true);
  };

  const handleAnswerChange = useCallback((questionId: number, answer: string) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: answer,
    }));
  }, []);

  const handleSubmit = useCallback(() => {
    setShowResults(true);
  }, []);

  const handleCloseResults = () => {
    setShowResults(false);
    // Optional: reset test state here if needed
  };

  if (!testStarted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-xl">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">IELTS Reading Test Simulator</h1>
          <p className="text-gray-600 mb-8">You will have 60 minutes to complete 3 sections and 40 questions.</p>
          <button
            onClick={handleStartTest}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-transform transform hover:scale-105"
          >
            Start Test
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen font-sans">
      <Header timeLeft={timeLeft} onSubmit={handleSubmit} />
      <div className="flex-grow overflow-hidden">
        <TestArea
          partData={IELTS_TEST_DATA[currentPart]}
          answers={answers}
          onAnswerChange={handleAnswerChange}
        />
      </div>
      <ControlPanel
        currentPart={currentPart}
        setCurrentPart={setCurrentPart}
        answers={answers}
      />
      {showResults && (
        <ResultsModal
          answers={answers}
          correctAnswers={CORRECT_ANSWERS}
          onClose={handleCloseResults}
        />
      )}
    </div>
  );
};

export default App;