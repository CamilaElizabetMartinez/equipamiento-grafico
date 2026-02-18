import { useRef, useCallback } from 'react';

const FileUploadArea = ({ onFileSelect, totalImages, maxImages }) => {
  const fileInputRef = useRef(null);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') handleClick();
  }, [handleClick]);

  return (
    <div className="file-input-wrapper">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={onFileSelect}
        className="file-input-hidden"
        style={{ display: 'none' }}
      />
      <div
        className="file-input-label"
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="file-input-icon">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Añadir imagen{totalImages > 0 ? ' (puedes añadir más)' : '...'}
        <span className="file-upload-hint">({totalImages}/{maxImages} imágenes)</span>
      </div>
    </div>
  );
};

export default FileUploadArea;
