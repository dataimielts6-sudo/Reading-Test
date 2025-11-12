import React, { useState, useEffect, useCallback } from 'react';
import { ALL_TESTS, TestDefinition } from './constants';
import Header from './components/Header';
import TestArea from './components/TestArea';
import ControlPanel from './components/ControlPanel';
import ResultsModal from './components/ResultsModal';
import { Answer, QuestionType } from './types';

const TestSelectionScreen: React.FC<{ onSelectTest: (test: TestDefinition) => void }> = ({ onSelectTest }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
    <div className="w-full max-w-2xl text-center p-8 bg-white rounded-lg shadow-xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">IELTS Reading Test Simulator</h1>
      <p className="text-gray-600 mb-8">Please select a practice test to begin. You will have 60 minutes to complete 3 sections and 40 questions.</p>
      <div className="space-y-4">
        {ALL_TESTS.map(test => (
          <div key={test.id} className="p-4 border rounded-lg flex justify-between items-center bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-700">{test.name}</h2>
            <button
              onClick={() => onSelectTest(test)}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-transform transform hover:scale-105"
            >
              Start Test
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
);


const App: React.FC = () => {
  const [currentPart, setCurrentPart] = useState(0);
  const [answers, setAnswers] = useState<Answer>({});
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes in seconds
  const [showResults, setShowResults] = useState(false);
  const [selectedTest, setSelectedTest] = useState<TestDefinition | null>(null);
  const [focusedQuestionId, setFocusedQuestionId] = useState<number | null>(null);
  const [scrollToQuestion, setScrollToQuestion] = useState<number | null>(null);


  useEffect(() => {
    let timer: number;
    if (selectedTest && timeLeft > 0 && !showResults) {
      timer = window.setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleSubmit();
    }
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, selectedTest, showResults]);

  const handleSelectTest = (test: TestDefinition) => {
    setSelectedTest(test);
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

  const handleQuestionSelect = useCallback((questionId: number) => {
    if (!selectedTest) return;

    let targetQuestionId = questionId;
    let partIndex = -1;

    for (let i = 0; i < selectedTest.data.length; i++) {
        const part = selectedTest.data[i];
        for (const qGroup of part.questions) {
            const q_ids = qGroup.questions.map(q => q.q_id);
            if (q_ids.includes(questionId)) {
                partIndex = i;
                if (qGroup.type === QuestionType.MULTIPLE_CHOICE_MULTIPLE) {
                    targetQuestionId = q_ids[0];
                }
                break;
            }
        }
        if (partIndex !== -1) break;
    }
    
    if (partIndex !== -1) {
      if (currentPart !== partIndex) {
        setCurrentPart(partIndex);
        setTimeout(() => setScrollToQuestion(targetQuestionId), 100);
      } else {
        setScrollToQuestion(targetQuestionId);
      }
    }
  }, [currentPart, selectedTest]);

  const handleCloseResults = () => {
    setShowResults(false);
    // Optional: reset test state here if needed
  };
  
  const handleExitTest = () => {
    setSelectedTest(null);
    setAnswers({});
    setTimeLeft(3600);
    setCurrentPart(0);
    setShowResults(false);
    setFocusedQuestionId(null);
  }

  if (!selectedTest) {
    return <TestSelectionScreen onSelectTest={handleSelectTest} />;
  }

  return (
    <div className="flex flex-col h-screen font-sans">
      <Header timeLeft={timeLeft} onSubmit={handleSubmit} onExit={handleExitTest} testName={selectedTest.name} />
      <div className="flex-grow overflow-hidden">
        {selectedTest.data.map((partData, index) => (
            <div 
                key={partData.part} 
                style={{ display: currentPart === index ? 'flex' : 'none' }} 
                className="h-full"
            >
                <TestArea
                    partData={partData}
                    answers={answers}
                    onAnswerChange={handleAnswerChange}
                    focusedQuestionId={focusedQuestionId}
                    setFocusedQuestionId={setFocusedQuestionId}
                    scrollToQuestion={scrollToQuestion}
                    setScrollToQuestion={setScrollToQuestion}
                />
            </div>
        ))}
      </div>
      <ControlPanel
        currentPart={currentPart}
        setCurrentPart={setCurrentPart}
        answers={answers}
        testParts={selectedTest.data}
        onQuestionSelect={handleQuestionSelect}
        onSubmit={handleSubmit}
        focusedQuestionId={focusedQuestionId}
      />
      {showResults && (
        <ResultsModal
          answers={answers}
          correctAnswers={selectedTest.answers}
          onClose={handleCloseResults}
        />
      )}
    </div>
  );
};

export default App;
