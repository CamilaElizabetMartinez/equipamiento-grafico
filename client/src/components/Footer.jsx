import { ICONS, CONTACT, SOCIALS } from '../constants/data';
import './Footer.css';

const navLinks = [
  ['/', 'Inicio'], ['/catalogo', 'Catálogo'], ['/nosotros', 'Nosotros'],
  ['/contacto', 'Contacto'], ['/login', 'Iniciar Sesión'],
];

const Icon = ({ d, d2 }) => (
  <svg className="footer-icon" fill="none" stroke="white" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={d} />
    {d2 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={d2} />}
  </svg>
);

const Footer = () => (
  <footer className="footer">
    <div className="footer-container">
      <div className="footer-section">
        <h3 className="footer-title">Equipamiento Gráfico Monte Grande</h3>
        <p>Conseguimos y vendemos maquinaria gráfica profesional</p>
      </div>
      <div className="footer-section">
        <h3 className="footer-title">Contacto</h3>
        <div className="footer-info">
          <div className="footer-item">
            <Icon d={ICONS.location} d2={ICONS.location2} />
            <span>{CONTACT.address}</span>
          </div>
          {CONTACT.phones.map(({ href, display, name }) => (
            <div key={href} className="footer-item">
              <Icon d={ICONS.phone} />
              <a href={href} className="footer-link">+(54) {display.replace('+54 ', '')} — {name}</a>
            </div>
          ))}
          <div className="footer-item">
            <Icon d={ICONS.mail} />
            <a href={CONTACT.email.href} className="footer-link">{CONTACT.email.display}</a>
          </div>
        </div>
      </div>
      <div className="footer-section">
        <h3 className="footer-title">Redes Sociales</h3>
        <div className="footer-social">
          {SOCIALS.map(({ href, label, d }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="social-link" aria-label={label}>
              <svg className="social-icon" fill="white" viewBox="0 0 24 24"><path d={d} /></svg>
            </a>
          ))}
        </div>
      </div>
      <div className="footer-section">
        <h3 className="footer-title">Explorar</h3>
        <nav className="footer-nav">
          {navLinks.map(([href, label]) => (
            <a key={href} className="footer-nav-link" href={href}>{label}</a>
          ))}
        </nav>
      </div>
    </div>
    <div className="footer-bottom">
      <p>© 2026 Equipamiento Gráfico Monte Grande. Todos los derechos reservados.</p>
    </div>
  </footer>
);

export default Footer;