
import React from 'react';

const DigitalHumanPage: React.FC = () => {
  return (
    <div className="w-full h-full bg-black relative flex flex-col overflow-hidden animate-in fade-in duration-1000">
      <iframe 
        src="https://newshuziren.vercel.app/" 
        title="AI Digital Human"
        className="w-full h-full border-none"
        allow="camera; microphone; display-capture; autoplay; clipboard-write"
        allowFullScreen
      />
    </div>
  );
};

export default DigitalHumanPage;
