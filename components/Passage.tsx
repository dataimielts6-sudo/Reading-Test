import React, { useState, useRef, MouseEvent, useCallback, useEffect } from 'react';
import { Passage as PassageType } from '../types';

interface PassageProps {
  passage: PassageType;
}

interface ContextMenuState {
  x: number;
  y: number;
  visible: boolean;
}

const Passage: React.FC<PassageProps> = ({ passage }) => {
  const passageRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ x: 0, y: 0, visible: false });

  const handleMouseUp = (e: MouseEvent<HTMLDivElement>) => {
    // Prevent context menu if clicking on an existing highlight
    if ((e.target as HTMLElement).tagName === 'SPAN' && (e.target as HTMLElement).classList.contains('bg-yellow-300')) {
        setContextMenu(prev => ({ ...prev, visible: false }));
        return;
    }

    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const containerRect = passageRef.current?.getBoundingClientRect();

      if (containerRect) {
         setContextMenu({
            x: e.clientX - containerRect.left,
            y: e.clientY - containerRect.top + 10,
            visible: true
        });
      }
    } else {
       if (contextMenu.visible) {
           setContextMenu(prev => ({ ...prev, visible: false }));
       }
    }
  };
  
  const handlePassageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'SPAN' && target.classList.contains('bg-yellow-300')) {
        const parent = target.parentNode;
        if (parent) {
            while (target.firstChild) {
                parent.insertBefore(target.firstChild, target);
            }
            parent.removeChild(target);
        }
    }
  };

  const handleClickOutside = useCallback((event: globalThis.MouseEvent) => {
    if (contextMenu.visible && passageRef.current && !passageRef.current.contains(event.target as Node)) {
        setContextMenu(prev => ({ ...prev, visible: false }));
    }
  }, [contextMenu.visible]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  const handleHighlight = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      span.className = 'bg-yellow-300 cursor-pointer';
      span.title = 'Click to remove highlight';
      try {
          range.surroundContents(span);
      } catch (e) {
          console.error("Could not surround contents, likely due to partial node selection.", e);
      }
      selection.removeAllRanges();
    }
    setContextMenu(prev => ({...prev, visible: false}));
  };

  return (
    <div className="bg-white p-6 overflow-y-auto h-full relative" ref={passageRef} onMouseUp={handleMouseUp} onClick={handlePassageClick}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">{passage.subtitle}</h2>
      </div>
      
      <div className="prose max-w-none text-gray-700 leading-relaxed">
        {passage.content.map((item, index) => {
          if (item.type === 'h') {
            return <h3 key={index} className="font-semibold italic text-lg mt-4">{item.text}</h3>;
          }
          return <p key={index}>{item.text}</p>;
        })}
      </div>

      {contextMenu.visible && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="absolute bg-white border border-gray-300 rounded-md shadow-lg py-1 z-30"
        >
          <button onClick={handleHighlight} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            <i className="fas fa-highlighter mr-2"></i>Highlight
          </button>
        </div>
      )}
    </div>
  );
};

export default Passage;