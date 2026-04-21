import { useState, useEffect } from 'react';
import {
  resolveProductImageUrl,
  isVideoMultimediaUrl,
} from '../utils/productImageUrl';

const ProductMultimedia = ({
  url,
  alt = '',
  className,
  placeholderEmpty,
  placeholderError,
  onClick,
  videoStopsParentClick = false,
  showVideoControls = false,
  autoPlayVideo = true,
}) => {
  const [loadFailed, setLoadFailed] = useState(false);
  const resolved = resolveProductImageUrl(url, placeholderEmpty);
  const isVideo = isVideoMultimediaUrl(url);
  const fallback = placeholderError ?? placeholderEmpty;

  useEffect(() => {
    setLoadFailed(false);
  }, [url]);

  if (loadFailed) {
    return (
      <img
        src={fallback}
        alt={alt}
        className={className}
        onClick={onClick}
      />
    );
  }

  if (isVideo) {
    return (
      <video
        src={resolved}
        className={className}
        muted
        playsInline
        loop
        autoPlay={autoPlayVideo}
        controls={showVideoControls}
        onClick={videoStopsParentClick ? (e) => e.stopPropagation() : onClick}
        onError={() => setLoadFailed(true)}
      />
    );
  }

  return (
    <img
      src={resolved}
      alt={alt}
      className={className}
      onClick={onClick}
      onError={() => setLoadFailed(true)}
    />
  );
};

export default ProductMultimedia;
