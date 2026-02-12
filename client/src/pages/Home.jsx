import { Link } from 'react-router-dom';
import Carousel from '../components/Carousel';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      <Carousel />

      <section className="hero-section">
        <div className="container">
          <h1>Equipamiento Gráfico Profesional</h1>
          <p className="hero-subtitle">
            Más de 30 años de experiencia en el mercado argentino
          </p>
          <Link to="/catalogo" className="btn-primary">
            Ver Catálogo
          </Link>
        </div>
      </section>
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <img src="public/images/b-logo1.png" alt="Roland" />
              </div>
              <h3>Roland</h3>
              <p>Impresión digital de gran formato líder mundial</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <img src="public/images/b-logo2.png" alt="Miller" />
              </div>
              <h3>Miller</h3>
              <p>Maquinaria de corte y troquelado de precisión</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <img src="public/images/b-logo3.png" alt="Wohlenberg" />
              </div>
              <h3>Wohlenberg</h3>
              <p>Corte y plegado profesional para producción industrial</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <img src="public/images/b-logo4.png" alt="ADAST" />
              </div>
              <h3>ADAST</h3>
              <p>Offset compacto de alta calidad checo</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <img src="public/images/b-logo5.png" alt="Komori" />
              </div>
              <h3>KOMORI</h3>
              <p>Offset litográfica japonesa de máxima precisión</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <img src="public/images/b-logo6.png" alt="Heidelberg" />
              </div>
              <h3>HEIDELBERG</h3>
              <p>Referente mundial en impresión offset de alta velocidad</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
