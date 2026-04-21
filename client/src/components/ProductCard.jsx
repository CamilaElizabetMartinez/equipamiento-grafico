import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PLACEHOLDER_CARD_EMPTY,
  PLACEHOLDER_CARD_ERROR,
} from '../utils/productImageUrl';
import ProductMultimedia from './ProductMultimedia';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = useMemo(() => {
    const rawItems = product.multimedia || [];
    return rawItems.filter((item) => item?.url && String(item.url).trim());
  }, [product.multimedia]);

  const hasMultipleImages = images.length > 1;

  useEffect(() => {
    setCurrentImageIndex((previousIndex) => {
      if (images.length === 0) return 0;
      return previousIndex >= images.length ? 0 : previousIndex;
    });
  }, [images]);

  const nextImage = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      images.length === 0 ? 0 : prev === images.length - 1 ? 0 : prev + 1
    );
  }, [images.length]);

  const prevImage = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) =>
      images.length === 0
        ? 0
        : prev === 0
          ? images.length - 1
          : prev - 1
    );
  }, [images.length]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleCardClick = useCallback(() => {
    navigate(`/producto/${product.idproduct}`);
  }, [navigate, product.idproduct]);

  return (
    <div className="product-card" onClick={handleCardClick}>
      <div className="product-image-container">
        {images.length > 0 ? (
          <>
            <ProductMultimedia
              url={images[currentImageIndex]?.url}
              alt={product.titulo}
              className="product-image"
              placeholderEmpty={PLACEHOLDER_CARD_EMPTY}
              placeholderError={PLACEHOLDER_CARD_ERROR}
              videoStopsParentClick
            />
            {hasMultipleImages && (
              <>
                <button className="img-nav prev" onClick={prevImage}>‹</button>
                <button className="img-nav next" onClick={nextImage}>›</button>
                <div className="image-indicators">
                  {images.map((imageEntry, imageIndex) => (
                    <span
                      key={imageEntry.id ?? `img-${imageIndex}`}
                      className={`indicator-dot ${imageIndex === currentImageIndex ? 'active' : ''}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <img
            src={PLACEHOLDER_CARD_EMPTY}
            alt={product.titulo}
            className="product-image"
          />
        )}
      </div>

      <div className="product-info">
        <h3 className="product-title">{product.titulo}</h3>

        {product.idcategoria && (
          <span className="product-category">
            {product.idcategoria.nombre || product.idcategoria.descripcion}
          </span>
        )}

        <p className="product-description">
          {product.descripcion.length > 100
            ? `${product.descripcion.substring(0, 100)}...`
            : product.descripcion}
        </p>

        <div className="product-footer">
          <span className="product-price">{formatPrice(product.precio)}</span>
          <button className="btn-contact">Consultar</button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
