import { useState } from 'react';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Manejar múltiples imágenes si las hay
  const images = product.multimedia || [];
  const hasMultipleImages = images.length > 1;

  const nextImage = (e) => {
    e.preventDefault();
    setCurrentImageIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = (e) => {
    e.preventDefault();
    setCurrentImageIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="product-card">
      <div className="product-image-container">
        {images.length > 0 ? (
          <>
            <img
              src={`http://localhost:8000/${images[currentImageIndex]?.url || images[0]?.url}`}
              alt={product.titulo}
              className="product-image"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/300x300/7C9692/FFFFFF?text=Producto';
              }}
            />
            {hasMultipleImages && (
              <>
                <button className="img-nav prev" onClick={prevImage}>‹</button>
                <button className="img-nav next" onClick={nextImage}>›</button>
                <div className="image-indicators">
                  {images.map((_, index) => (
                    <span
                      key={index}
                      className={`indicator-dot ${index === currentImageIndex ? 'active' : ''}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <img
            src="https://via.placeholder.com/300x300/7C9692/FFFFFF?text=Sin+Imagen"
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
