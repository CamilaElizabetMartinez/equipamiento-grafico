import { useState, useEffect } from 'react';
import './Carousel.css';

const Carousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    fetch('/carousel-config.json')
      .then(res => res.json())
      .then(data => {
        setSlides(data.slides);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error cargando carousel config:', err);
        setSlides([{
          image: 'https://via.placeholder.com/1200x400/7C9692/FFFFFF?text=Equipamiento+Grafico',
          title: 'Equipamiento Gráfico Profesional',
          description: 'La mejor calidad para tu negocio'
        }]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (slides.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex === slides.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToPrevious = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? slides.length - 1 : prevIndex - 1
    );
  };

  const goToNext = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prevIndex) =>
      prevIndex === slides.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleImageError = (index) => {
    setImageErrors(prev => ({ ...prev, [index]: true }));
  };

  const getImageUrl = (slide, index) => {
    if (imageErrors[index]) {
      return `https://via.placeholder.com/1200x400/7C9692/FFFFFF?text=${encodeURIComponent(slide.title)}`;
    }
    return slide.image;
  };

  if (loading || slides.length === 0) {
    return null;
  }

  return (
    <div className="carousel">
      <div className="carousel-inner">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`carousel-item ${index === currentIndex ? 'active' : ''}`}
          >
            <img
              src={getImageUrl(slide, index)}
              alt={slide.title}
              onError={() => handleImageError(index)}
            />
            <div className="carousel-overlay">
              <div className="container">
                <h2>{slide.title}</h2>
                <p>{slide.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <button className="carousel-control prev" onClick={goToPrevious} aria-label="Anterior">
            ‹
          </button>
          <button className="carousel-control next" onClick={goToNext} aria-label="Siguiente">
            ›
          </button>

          <div className="carousel-indicators">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`indicator ${index === currentIndex ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Ir a slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Carousel;
