import React, { useState, useRef, useCallback, useEffect } from 'react';
import Passage from './Passage';
import Questions from './Questions';
import { TestPart, Answer } from '../types';

interface TestAreaProps {
  partData: TestPart;
  answers: Answer;
  onAnswerChange: (questionId: number, answer: string) => void;
}

const TestArea: React.FC<TestAreaProps> = ({ partData, answers, onAnswerChange }) => {
  const [passageWidth, setPassageWidth] = useState(50); // Initial width in percentage
  const containerRef = useRef<HTMLDivElement>(null);
  const isResizingRef = useRef(false);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    isResizingRef.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const handleMouseUp = useCallback(() => {
    if (isResizingRef.current) {
        isResizingRef.current = false;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizingRef.current || !containerRef.current) {
      return;
    }
    const containerRect = containerRef.current.getBoundingClientRect();
    const newPassageWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
    
    // Add constraints to prevent panels from becoming too small (20%) or too large (80%)
    if (newPassageWidth > 20 && newPassageWidth < 80) {
      setPassageWidth(newPassageWidth);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);
  
  return (
    <div className="flex h-full overflow-hidden" ref={containerRef}>
      <div 
        className="h-full flex-shrink-0"
        style={{ width: `${passageWidth}%` }}
        id="passage-panel"
      >
        <Passage passage={partData.passage} />
      </div>
      
      <div 
        onMouseDown={handleMouseDown}
        className="w-2 bg-gray-200 hover:bg-blue-400 cursor-col-resize flex-shrink-0 transition-colors duration-200"
        title="Drag to resize"
        role="separator"
        aria-orientation="vertical"
        aria-controls="passage-panel questions-panel"
      />

      <div 
        className="flex-1 h-full min-w-0"
        id="questions-panel"
      >
        <Questions 
          questionsData={partData.questions}
          answers={answers}
          onAnswerChange={onAnswerChange}
        />
      </div>
    </div>
  );
};

export default TestArea;