import { useState, useEffect, useCallback, useMemo, useReducer } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ProductDetail.css';

const WHATSAPP_NUMBER = '541161100402';
const PLACEHOLDER_IMG = 'https://via.placeholder.com/600x600/7C9692/FFFFFF?text=Producto';

// 🧠 STATE MACHINE CON REDUCER
const productReducer = (state, action) => {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true, error: null };
    case 'SUCCESS':
      return { ...state, product: action.payload, loading: false };
    case 'ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'TOGGLE_MODAL':
      return { ...state, isModalOpen: !state.isModalOpen };
    case 'SET_IMAGE':
      return { ...state, currentImageIndex: action.payload };
    default:
      return state;
  }
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(productReducer, {
    product: null,
    loading: true,
    error: null,
    currentImageIndex: 0,
    isModalOpen: false
  });

  //LOAD DATA - UNA SOLA FUNCIÓN
  useEffect(() => {
    const loadProduct = async () => {
      dispatch({ type: 'LOADING' });
      try {
        const res = await fetch(`/api/products/${id}`, { credentials: 'include' });
        if (!res.ok) throw new Error('Producto no encontrado');
        const result = await res.json();
        dispatch({ type: 'SUCCESS', payload: result.data });
      } catch (err) {
        dispatch({ type: 'ERROR', payload: err.message });
      }
    };
    loadProduct();
  }, [id]);

  //COMPUTED VALUES - useMemo
  const images = useMemo(() => state.product?.multimedia || [], [state.product]);
  const hasMultipleImages = images.length > 1;

  //HANDLERS - MÍNIMOS
  const navigateImage = useCallback((direction) => {
    if (!hasMultipleImages) return;
    const nextIndex = direction === 'next'
      ? state.currentImageIndex === images.length - 1 ? 0 : state.currentImageIndex + 1
      : state.currentImageIndex === 0 ? images.length - 1 : state.currentImageIndex - 1;
    dispatch({ type: 'SET_IMAGE', payload: nextIndex });
  }, [images.length, hasMultipleImages, state.currentImageIndex]);

  const toggleModal = useCallback(() => dispatch({ type: 'TOGGLE_MODAL' }), []);

  //SHARED UTILITIES
  const utils = useMemo(() => ({
    formatPrice: (price) => new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price),
    getImageUrl: (url) => url || PLACEHOLDER_IMG
  }), []);

  const { product, loading, error, isModalOpen, currentImageIndex } = state;

  //RENDERS OPTIMIZADOS
  if (loading) return <LoadingView />;
  if (error || !product) return <ErrorView error={error} onBack={() => navigate('/catalogo')} />;

  return (
    <ProductDetailLayout
      product={product}
      images={images}
      currentIndex={currentImageIndex}
      isModalOpen={isModalOpen}
      onBack={() => navigate('/catalogo')}
      onWhatsApp={() => {
        const message = `Hola! Estoy interesado en:\n*${product.titulo}*\n${utils.formatPrice(product.precio)}\n\n¿Más info?`;
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
      }}
      onNavigateImage={navigateImage}
      onToggleModal={toggleModal}
      onSetImageIndex={(index) => dispatch({ type: 'SET_IMAGE', payload: index })}
      utils={utils}
    />
  );
};

//LAYOUT PRINCIPAL
const ProductDetailLayout = ({
  product, images, currentIndex, isModalOpen,
  onBack, onWhatsApp, onNavigateImage, onToggleModal, onSetImageIndex, utils
}) => (
  <div className="product-detail">
    <div className="container">
      <BackButton onClick={onBack} />

      <div className="detail-content">
        <ImageSection
          images={images}
          currentIndex={currentIndex}
          onNavigate={onNavigateImage}
          onImageClick={onToggleModal}
          onImageIndexChange={onSetImageIndex}
          getImageUrl={utils.getImageUrl}
        />
        <InfoSection product={product} formatPrice={utils.formatPrice} onWhatsApp={onWhatsApp} />
      </div>

      {isModalOpen && (
        <ImageModalFull
          images={images}
          currentIndex={currentIndex}
          onClose={onToggleModal}
          onNavigate={onNavigateImage}
          onImageIndexChange={onSetImageIndex}
          getImageUrl={utils.getImageUrl}
          title={product.titulo}
        />
      )}
    </div>
  </div>
);

//COMPONENTES ATÓMICOS (sin lógica)
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

const ImageSection = ({ images, currentIndex, onNavigate, onImageClick, onImageIndexChange, getImageUrl }) => (
  <div className="detail-image-section">
    <ImageGallery {...{ images, currentIndex, onNavigate, onImageClick, onImageIndexChange, getImageUrl }} />
  </div>
);

const InfoSection = ({ product, formatPrice, onWhatsApp }) => (
  <div className="detail-info-section">
    <h1 className="detail-title">{product.titulo}</h1>
    {product.idcategoria && (
      <span className="detail-category">{product.idcategoria.nombre || product.idcategoria.descripcion}</span>
    )}
    <div className="detail-price">{formatPrice(product.precio)}</div>
    <div className="detail-description">
      <h2>Descripción</h2>
      <p>{product.descripcion}</p>
    </div>
    <button className="btn-contact-detail" onClick={onWhatsApp}>
      Consultar por este producto
    </button>
  </div>
);

//GALLERY + MODAL REUTILIZABLES
const ImageGallery = ({ images, currentIndex, onNavigate, onImageClick, onImageIndexChange, getImageUrl }) => {
  if (!images.length) {
    return <img src={getImageUrl()} alt="Sin imagen" className="detail-image" />;
  }

  const currentImage = images[currentIndex];
  const hasMultipleImages = images.length > 1;

  return (
    <div className="detail-image-container">
      <img
        src={getImageUrl(currentImage?.url)}
        alt="Producto"
        className="detail-image"
        onClick={onImageClick}
        onError={(e) => e.target.src = getImageUrl()}
      />
      {hasMultipleImages && (
        <>
          <NavButton className="detail-nav prev" onClick={() => onNavigate('prev')}>‹</NavButton>
          <NavButton className="detail-nav next" onClick={() => onNavigate('next')}>›</NavButton>
          <ImageIndicators images={images} currentIndex={currentIndex} onChange={onImageIndexChange} />
        </>
      )}
    </div>
  );
};

const ImageModalFull = ({ images, currentIndex, onClose, onNavigate, onImageIndexChange, getImageUrl, title }) => (
  <div className="image-modal" onClick={onClose}>
    <div className="content-modal
    " onClick={(e) => e.stopPropagation()}>
      <button className="modal-close" onClick={onClose}>×</button>
      <img
        src={getImageUrl(images[currentIndex]?.url)}
        alt={title}
        className="modal-image"
        onError={(e) => e.target.src = getImageUrl()}
      />
      {images.length > 1 && (
        <>
          <NavButton className="modal-nav prev" onClick={() => onNavigate('prev')}>‹</NavButton>
          <NavButton className="modal-nav next" onClick={() => onNavigate('next')}>›</NavButton>
          <ImageIndicators images={images} currentIndex={currentIndex} onChange={onImageIndexChange} />
        </>
      )}
    </div>
  </div>
);

//PRIMITIVOS
const NavButton = ({ className, onClick, children, ...props }) => (
  <button className={className} onClick={onClick} {...props}>{children}</button>
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

export default ProductDetail;