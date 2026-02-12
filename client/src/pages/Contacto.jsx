import './Contacto.css';

const Contacto = () => {
  return (
    <div className="contacto">
      <div className="container">
        <div className="contacto-content">
          <div className="contacto-info">
            <div className="contact-details">
              <h3>Información de Contacto</h3>

              <div className="contact-item">
                <span className="contact-icon"></span>
                <div>
                  <strong>Dirección:</strong>
                  <p>Carlos Pellegrini 1055, Monte Grande, Argentina</p>
                </div>
              </div>

              <div className="contact-item">
                <span className="contact-icon"></span>
                <div>
                  <strong>Teléfono:</strong>
                  <p><a href="tel:+541161100402">+54 11 6110 0402</a></p>
                </div>
              </div>

              <div className="contact-item">
                <span className="contact-icon"></span>
                <div>
                  <strong>Email:</strong>
                  <p><a href="mailto:equipamientografico@gmail.com">equipamientografico@gmail.com</a></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacto;
