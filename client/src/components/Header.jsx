import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <h1>Equipamiento Gráfico</h1>
            <p className="subtitle">Monte Grande</p>
          </Link>

          <nav className="nav">
            <Link to="/" className="nav-link">Inicio</Link>
            <Link to="/catalogo" className="nav-link">Catálogo</Link>
            <Link to="/nosotros" className="nav-link">Nosotros</Link>
            <Link to="/contacto" className="nav-link">Contacto</Link>

            {user ? (
              <div className="user-menu">
                <span className="user-name">Hola, {user.nombre}</span>
                <button onClick={handleLogout} className="btn-logout">
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-login">
                Iniciar Sesión
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
