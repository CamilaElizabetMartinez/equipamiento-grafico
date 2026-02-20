import { ICONS, CONTACT, SOCIALS } from '../constants/data';
import './Contacto.css';

const Icon = ({ d, d2 }) => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={d} />
    {d2 && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={d2} />}
  </svg>
);

const ContactItem = ({ d, d2, children }) => (
  <div className="contact-item">
    <span className="contact-icon"><Icon d={d} d2={d2} /></span>
    <div>{children}</div>
  </div>
);

const Contacto = () => (
  <div className="contacto">
    <div className="container">
      <h2 className="page-title">CONTACTO</h2>
      <div className="contacto-grid">

        <div className="contact-card">
          <h3 className="card-title">Información de Contacto</h3>
          <ContactItem d={ICONS.location} d2={ICONS.location2}>
            <strong>Dirección</strong>
            <p>{CONTACT.address}</p>
          </ContactItem>
          <ContactItem d={ICONS.phone}>
            <strong>Teléfono</strong>
            {CONTACT.phones.map(({ href, display, name }) => (
              <p key={href}><a href={href}>{display}</a> — {name}</p>
            ))}
          </ContactItem>
          <ContactItem d={ICONS.mail}>
            <strong>Email</strong>
            <p><a href={CONTACT.email.href}>{CONTACT.email.display}</a></p>
          </ContactItem>
        </div>

        <div className="contact-card">
          <h3 className="card-title">Redes Sociales</h3>
          <div className="social-grid">
            {SOCIALS.map(({ href, label, d }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="social-card-item">
                <svg width="24" height="24" fill="#7C9692" viewBox="0 0 24 24"><path d={d} /></svg>
                {label}
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  </div>
);

export default Contacto;
