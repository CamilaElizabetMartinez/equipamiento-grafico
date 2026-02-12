import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ProductDetail.css';

const WHATSAPP_NUMBER = '541161100402';
const API_BASE_URL = 'http://localhost:8000';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/productos/${id}`);
      if (!response.ok) throw new Error('Producto no encontrado');

      const data = await response.json();
      setProduct(data);
    } catch (err) {
      setError(err.message || 'Error al cargar el producto');
      console.error('Error loading product:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageNavigation = (direction) => {
    const images = product?.multimedia || [];
    if (images.length === 0) return;

    setCurrentImageIndex((prev) => {
      if (direction === 'next') {
        return prev === images.length - 1 ? 0 : prev + 1;
      }
      return prev === 0 ? images.length - 1 : prev - 1;
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleWhatsAppContact = () => {
    const message = `Hola! Estoy interesado en el producto:\n*${product.titulo}*\n${formatPrice(product.precio)}\n\n¿Podrían brindarme más información?`;
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const getImageUrl = (imageUrl) => {
    return imageUrl ? `${API_BASE_URL}/${imageUrl}` : 'https://via.placeholder.com/600x600/7C9692/FFFFFF?text=Producto';
  };

  if (loading) {
    return (
      <div className="product-detail">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Cargando producto...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-detail">
        <div className="container">
          <div className="error">
            <p>{error}</p>
            <button onClick={() => navigate('/catalogo')} className="btn-back">
              Volver al catálogo
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const images = product.multimedia || [];
  const hasMultipleImages = images.length > 1;
  const currentImage = images[currentImageIndex];

  return (
    <div className="product-detail">
      <div className="container">
        <button onClick={() => navigate('/catalogo')} className="btn-back">
          ← Volver al catálogo
        </button>

        <div className="detail-content">
          {/* Sección de imagen */}
          <div className="detail-image-section">
            <ImageGallery
              images={images}
              currentIndex={currentImageIndex}
              onNavigate={handleImageNavigation}
              onImageClick={() => setIsModalOpen(true)}
              onImageIndexChange={setCurrentImageIndex}
              getImageUrl={getImageUrl}
            />
          </div>

          {/* Sección de información */}
          <div className="detail-info-section">
            <h1 className="detail-title">{product.titulo}</h1>

            {product.idcategoria && (
              <span className="detail-category">
                {product.idcategoria.nombre || product.idcategoria.descripcion}
              </span>
            )}

            <div className="detail-price">{formatPrice(product.precio)}</div>

            <div className="detail-description">
              <h2>Descripción</h2>
              <p>{product.descripcion}</p>
            </div>

            <button className="btn-contact-detail" onClick={handleWhatsAppContact}>
              Consultar por este producto
            </button>
          </div>
        </div>

        {/* Modal de imagen completa */}
        {isModalOpen && (
          <ImageModal
            images={images}
            currentIndex={currentImageIndex}
            onClose={() => setIsModalOpen(false)}
            onNavigate={handleImageNavigation}
            onImageIndexChange={setCurrentImageIndex}
            getImageUrl={getImageUrl}
            productTitle={product.titulo}
          />
        )}
      </div>
    </div>
  );
};

// Componente de galería de imágenes
const ImageGallery = ({ images, currentIndex, onNavigate, onImageClick, onImageIndexChange, getImageUrl }) => {
  const hasMultipleImages = images.length > 1;
  const currentImage = images[currentIndex];

  if (images.length === 0) {
    return (
      <img
        src="https://via.placeholder.com/600x600/7C9692/FFFFFF?text=Sin+Imagen"
        alt="Sin imagen"
        className="detail-image"
      />
    );
  }

  return (
    <div className="detail-image-container">
      <img
        src={getImageUrl(currentImage?.url)}
        alt="Producto"
        className="detail-image"
        onClick={onImageClick}
        onError={(e) => {
          e.target.src = 'https://via.placeholder.com/600x600/7C9692/FFFFFF?text=Producto';
        }}
      />

      {hasMultipleImages && (
        <>
          <button
            className="detail-nav prev"
            onClick={() => onNavigate('prev')}
            aria-label="Imagen anterior"
          >
            ‹
          </button>
          <button
            className="detail-nav next"
            onClick={() => onNavigate('next')}
            aria-label="Imagen siguiente"
          >
            ›
          </button>

          <div className="detail-indicators">
            {images.map((_, index) => (
              <button
                key={index}
                className={`indicator-dot ${index === currentIndex ? 'active' : ''}`}
                onClick={() => onImageIndexChange(index)}
                aria-label={`Ver imagen ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Componente de modal para imagen completa
const ImageModal = ({ images, currentIndex, onClose, onNavigate, onImageIndexChange, getImageUrl, productTitle }) => {
  const hasMultipleImages = images.length > 1;
  const currentImage = images[currentIndex];

  return (
    <div className="image-modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">
          ×
        </button>

        <img
          src={getImageUrl(currentImage?.url)}
          alt={productTitle}
          className="modal-image"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/1200x1200/7C9692/FFFFFF?text=Producto';
          }}
        />

        {hasMultipleImages && (
          <>
            <button
              className="modal-nav prev"
              onClick={() => onNavigate('prev')}
              aria-label="Imagen anterior"
            >
              ‹
            </button>
            <button
              className="modal-nav next"
              onClick={() => onNavigate('next')}
              aria-label="Imagen siguiente"
            >
              ›
            </button>

            <div className="modal-indicators">
              {images.map((_, index) => (
                <button
                  key={index}
                  className={`indicator-dot ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => onImageIndexChange(index)}
                  aria-label={`Ver imagen ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
