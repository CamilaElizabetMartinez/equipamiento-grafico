import './About.css';

const About = () => {
    return (
        <div className="about">
            <div className="container">
                <h2 className="page-title">Nuestra Historia en Monte Grande</h2>

                <div className="about-content">
                    <div className="about-image">
                        <img
                            src="https://via.placeholder.com/600x400/7C9692/FFFFFF?text=Equipamiento+Grafico"
                            alt="Equipamiento Gráfico"
                        />
                    </div>

                    <div className="about-info">
                        <div className="about-section">
                            <p>
                                Somos una empresa Argentina dedicada a la venta de todo tipo de máquinas gráficas.
                                Estamos en el mercado desde el año '90 llevando más de 30 años comprometidos con
                                nuestros clientes generando así confianza y satisfacción.
                            </p>
                            <p>
                                Nuestro equipo está preparado para atender las consultas de nuestros clientes y
                                orientarlos en los equipamientos más adecuados para la realización de sus trabajo.
                            </p>
                            <p className="signature">
                                <strong>Equipamiento Grafico de Carlos A. Gonzalez.</strong>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
