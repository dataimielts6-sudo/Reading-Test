import React, { useState, useRef, MouseEvent, useCallback, useEffect } from 'react';
import { Passage as PassageType } from '../types';

interface PassageProps {
  passage: PassageType;
}

interface ContextMenuState {
  x: number;
  y: number;
  visible: boolean;
  range: Range | null;
}

const Passage: React.FC<PassageProps> = ({ passage }) => {
  const passageRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ x: 0, y: 0, visible: false, range: null });

  const handleMouseUp = (e: MouseEvent<HTMLDivElement>) => {
    // Prevent context menu if clicking on an existing annotation
    const target = e.target as HTMLElement;
    if (target.closest('.bg-yellow-300') || target.closest('.has-note')) {
        setContextMenu(prev => ({ ...prev, visible: false, range: null }));
        return;
    }

    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const range = selection.getRangeAt(0);
      const containerRect = passageRef.current?.getBoundingClientRect();

      if (containerRect && passageRef.current) {
         setContextMenu({
            x: e.clientX - containerRect.left,
            y: e.clientY - containerRect.top + passageRef.current.scrollTop + 10,
            visible: true,
            range: range
        });
      }
    } else {
       if (contextMenu.visible) {
           setContextMenu(prev => ({ ...prev, visible: false, range: null }));
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
            parent.normalize(); // Merges adjacent text nodes
        }
    }
  };

  const handleClickOutside = useCallback((event: globalThis.MouseEvent) => {
    if (contextMenu.visible && passageRef.current && !passageRef.current.contains(event.target as Node)) {
        setContextMenu({ x: 0, y: 0, visible: false, range: null });
    }
  }, [contextMenu.visible]);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  const handleHighlight = () => {
    const { range } = contextMenu;
    if (range) {
      const span = document.createElement('span');
      span.className = 'bg-yellow-300 cursor-pointer';
      span.title = 'Click to remove highlight';
      try {
          range.surroundContents(span);
          window.getSelection()?.removeAllRanges();
      } catch (e) {
          console.error("Could not surround contents, likely due to partial node selection.", e);
      }
    }
    setContextMenu({ x: 0, y: 0, visible: false, range: null });
  };

  const handleNote = () => {
    const { range } = contextMenu;
    if (!range || range.collapsed) return;

    const noteText = window.prompt("Enter your note:");
    if (noteText) {
      const span = document.createElement('span');
      span.className = 'has-note';
      span.title = noteText;
      
      const icon = document.createElement('i');
      icon.className = 'fas fa-comment-dots note-icon';
      icon.setAttribute('aria-hidden', 'true');
      
      try {
        const contents = range.extractContents();
        span.appendChild(contents);
        span.appendChild(icon);
        range.insertNode(span);
        window.getSelection()?.removeAllRanges();
      } catch (e) {
        console.error("Could not create note, likely due to partial node selection.", e);
      }
    }
    setContextMenu({ x: 0, y: 0, visible: false, range: null });
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
          <button onClick={handleHighlight} className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            <i className="fas fa-highlighter mr-2"></i>Highlight
          </button>
          <button onClick={handleNote} className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            <i className="fas fa-comment-dots mr-2"></i>Note
          </button>
        </div>
      )}
    </div>
  );
};

export default Passage;