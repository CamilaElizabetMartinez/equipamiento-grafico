import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user } = useAuth(); // Solo user, SIN logout
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo" onClick={closeMenu}>
            <img src="/images/logo/logo.png" alt="Equipamiento Gráfico" className="logo-image" />
          </Link>

          <button
            className={`hamburger ${isMenuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            aria-label="Menú"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <nav className={`nav ${isMenuOpen ? 'active' : ''}`}>
            <Link to="/" className="nav-link" onClick={closeMenu}>Inicio</Link>
            <Link to="/catalogo" className="nav-link" onClick={closeMenu}>Catálogo</Link>
            <Link to="/nosotros" className="nav-link" onClick={closeMenu}>Nosotros</Link>
            <Link to="/contacto" className="nav-link" onClick={closeMenu}>Contacto</Link>

            {user && (
              <Link to="/panel" className="nav-link nav-link-panel" onClick={closeMenu}>
                <svg className="panel-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
                Panel
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;