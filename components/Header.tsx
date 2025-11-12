
import React from 'react';

interface HeaderProps {
  timeLeft: number;
  onSubmit: () => void;
}

const Header: React.FC<HeaderProps> = ({ timeLeft, onSubmit }) => {
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <header className="bg-white shadow-md p-4 flex justify-between items-center sticky top-0 z-20">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800">IELTS Reading Practice Test</h1>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
          <i className="far fa-clock text-gray-600"></i>
          <span className="font-semibold text-lg text-gray-700">{formatTime(timeLeft)}</span>
        </div>
        <button
          onClick={onSubmit}
          className="bg-red-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          Submit
        </button>
      </div>
    </header>
  );
};

export default Header;
