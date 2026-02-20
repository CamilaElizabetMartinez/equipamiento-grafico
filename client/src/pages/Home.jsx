import { Link } from 'react-router-dom';
import Carousel from '../components/Carousel';
import './Home.css';

const brands = [
  { src: 'public/images/b-logo1.png', name: 'Roland',      desc: 'Impresión digital de gran formato líder mundial' },
  { src: 'public/images/b-logo2.png', name: 'Miller',      desc: 'Maquinaria de corte y troquelado de precisión' },
  { src: 'public/images/b-logo3.png', name: 'Wohlenberg',  desc: 'Corte y plegado profesional para producción industrial' },
  { src: 'public/images/b-logo4.png', name: 'ADAST',       desc: 'Offset compacto de alta calidad checo' },
  { src: 'public/images/b-logo5.png', name: 'KOMORI',      desc: 'Offset litográfica japonesa de máxima precisión' },
  { src: 'public/images/b-logo6.png', name: 'HEIDELBERG',  desc: 'Referente mundial en impresión offset de alta velocidad' },
];

const Home = () => (
  <div className="home">
    <Carousel />

    <section className="hero-section">
      <div className="container">
        <h1>Maquinaria Gráfica Profesional</h1>
        <p className="hero-subtitle">
          Más de 30 años de experiencia en el mercado argentino
        </p>
        <Link to="/catalogo" className="btn-primary">Ver Catálogo</Link>
      </div>
    </section>

    <section className="features-section">
      <div className="container">
        <div className="features-grid">
          {brands.map(({ src, name, desc }) => (
            <div key={name} className="feature-card">
              <div className="feature-icon">
                <img className="feature-img" src={src} alt={name} />
              </div>
              <h3>{name}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default Home;
