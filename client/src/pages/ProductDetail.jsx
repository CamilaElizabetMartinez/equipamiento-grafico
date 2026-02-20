import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ProductDetail.css';

const WHATSAPP_NUMBER = '541156347845';
const PLACEHOLDER_IMG = 'https://via.placeholder.com/600x600/7C9692/FFFFFF?text=Producto';

const formatPrice = (price) => new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS'
}).format(price);

const getImageUrl = (url) => {
  if (!url) return PLACEHOLDER_IMG;
  return url.startsWith('/') ? url : '/' + url;
};

// ── SUBCOMPONENTES ───────────────────────────

const BackButton = ({ onClick }) => (
  <button className="btn-back" onClick={onClick}>← Volver al catálogo</button>
);

const LoadingView = () => (
  <div className="product-detail">
    <div className="container">
      <div className="loading">
        <div className="spinner" />
        <p>Cargando producto...</p>
      </div>
    </div>
  </div>
);

const ErrorView = ({ error, onBack }) => (
  <div className="product-detail">
    <div className="container">
      <div className="error">
        <p>{error}</p>
        <BackButton onClick={onBack} />
      </div>
    </div>
  </div>
);

const ImageIndicators = ({ images, currentIndex, onChange }) => (
  <div className="detail-indicators">
    {images.map((_, i) => (
      <button
        key={i}
        className={`indicator-dot ${i === currentIndex ? 'active' : ''}`}
        onClick={() => onChange(i)}
        aria-label={`Imagen ${i + 1}`}
      />
    ))}
  </div>
);

const ImageGallery = ({ images, currentIndex, onNavigate, onImageClick, onImageIndexChange }) => {
  if (!images.length) {
    return <img src={getImageUrl()} alt="Sin imagen" className="detail-image" />;
  }

  return (
    <div className="detail-image-container">
      <img
        src={getImageUrl(images[currentIndex]?.url)}
        alt="Producto"
        className="detail-image"
        onClick={onImageClick}
        onError={(e) => e.target.src = getImageUrl()}
      />
      {images.length > 1 && (
        <>
          <button className="detail-nav prev" onClick={() => onNavigate('prev')}>‹</button>
          <button className="detail-nav next" onClick={() => onNavigate('next')}>›</button>
          <ImageIndicators images={images} currentIndex={currentIndex} onChange={onImageIndexChange} />
        </>
      )}
    </div>
  );
};

const ImageModalFull = ({ images, currentIndex, onClose, onNavigate, onImageIndexChange, title }) => (
  <div className="image-modal" onClick={onClose}>
    <div className="content-modal" onClick={(e) => e.stopPropagation()}>
      <button className="modal-close" onClick={onClose}>×</button>
      <img
        src={getImageUrl(images[currentIndex]?.url)}
        alt={title}
        className="modal-image"
        onError={(e) => e.target.src = getImageUrl()}
      />
      {images.length > 1 && (
        <>
          <button className="modal-nav prev" onClick={() => onNavigate('prev')}>‹</button>
          <button className="modal-nav next" onClick={() => onNavigate('next')}>›</button>
          <ImageIndicators images={images} currentIndex={currentIndex} onChange={onImageIndexChange} />
        </>
      )}
    </div>
  </div>
);

// ── COMPONENTE PRINCIPAL ─────────────────────

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen]   = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/products/${id}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Producto no encontrado');
        const result = await res.json();
        setProduct(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadProduct();
  }, [id]);

  const images = useMemo(() => product?.multimedia || [], [product]);

  const navigateImage = (direction) => {
    setCurrentImageIndex(prev =>
      direction === 'next'
        ? prev === images.length - 1 ? 0 : prev + 1
        : prev === 0 ? images.length - 1 : prev - 1
    );
  };

  if (loading) return <LoadingView />;
  if (error || !product) return <ErrorView error={error} onBack={() => navigate('/catalogo')} />;

  const handleWhatsApp = () => {
    const message = `Hola! Estoy interesado en:\n*${product.titulo}*\n${formatPrice(product.precio)}\n\n¿Más info?`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="product-detail">
      <div className="container">
        <BackButton onClick={() => navigate('/catalogo')} />

        <div className="detail-content">
          <div className="detail-image-section">
            <ImageGallery
              images={images}
              currentIndex={currentImageIndex}
              onNavigate={navigateImage}
              onImageClick={() => setIsModalOpen(true)}
              onImageIndexChange={setCurrentImageIndex}
            />
          </div>

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
            <button className="btn-contact-detail" onClick={handleWhatsApp}>
              Consultar por este producto
            </button>
          </div>
        </div>

        {isModalOpen && (
          <ImageModalFull
            images={images}
            currentIndex={currentImageIndex}
            onClose={() => setIsModalOpen(false)}
            onNavigate={navigateImage}
            onImageIndexChange={setCurrentImageIndex}
            title={product.titulo}
          />
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
