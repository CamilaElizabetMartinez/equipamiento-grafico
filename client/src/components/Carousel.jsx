import { useState, useEffect } from 'react';
import './Carousel.css';

const Carousel = ({ images = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Usar placeholder si no hay imágenes
  const defaultImages = [
    'https://via.placeholder.com/1200x400/7C9692/FFFFFF?text=Equipamiento+Grafico+Monte+Grande'
  ];

  const carouselImages = images.length > 0 ? images : defaultImages;

  useEffect(() => {
    if (carouselImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000); // Cambia cada 5 segundos

      return () => clearInterval(interval);
    }
  }, [carouselImages.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? carouselImages.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === carouselImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="carousel">
      <div className="carousel-inner">
        {carouselImages.map((image, index) => (
          <div
            key={index}
            className={`carousel-item ${index === currentIndex ? 'active' : ''}`}
          >
            <img
              src={image}
              alt={`Slide ${index + 1}`}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/1200x400/7C9692/FFFFFF?text=Equipamiento+Grafico';
              }}
            />
            <div className="carousel-overlay">
              <div className="container">
                <h2>Equipamiento Gráfico Profesional</h2>
                <p>La mejor calidad para tu negocio</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {carouselImages.length > 1 && (
        <>
          <button className="carousel-control prev" onClick={goToPrevious}>
            ‹
          </button>
          <button className="carousel-control next" onClick={goToNext}>
            ›
          </button>

          <div className="carousel-indicators">
            {carouselImages.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Carousel;
