import './About.css';

const About = () => {
    return (
        <div className="about">
            <div className="container">
                <div className="about-layout">
                    <div className="about-story">
                        <h2 className="page-title">NUESTRA HISTORIA</h2>

                        <div className="about-info">
                            <div className="about-section">
                                <p>
                                    Con más de 30 años de trayectoria en el rubro gráfico, nos especializamos en la compra y venta de máquinas para imprenta, brindando asesoramiento serio y personalizado a cada cliente.
                                    Trabajamos con equipos de primera línea: máquinas offset, guillotinas, troqueladoras y otros insumos esenciales para el funcionamiento y crecimiento de su taller gráfico. Cada equipo es seleccionado con criterio, priorizando calidad, rendimiento y confiabilidad.
                                </p>
                                <p>
                                    Nuestra experiencia nos permite entender las necesidades reales del sector, acompañando tanto a quienes se inician como a empresas en expansión que buscan optimizar su producción.
                                    Si está buscando equipamiento gráfico o desea vender su maquinaria, no dude en contactarnos. Transparencia, compromiso y conocimiento al servicio de su inversión.
                                </p>
                                <p className="signature">
                                    <strong>Equipamiento Gráfico Comiter de Carlos Alfredo Gonzalez y Lionel Setton</strong>
                                </p>

                            </div>
                        </div>
                    </div>

                    <div className="about-gallery">
                        <div className="about-photo-frame">
                            <div className="about-photo-inner">
                                <img
                                    className="about-photo-img"
                                    src="/images/contact/carlos.jpeg"
                                    alt="Carlos Alfredo Gonzalez, Equipamiento Gráfico Comiter"
                                />
                            </div>
                        </div>
                        <div className="about-photo-frame">
                            <div className="about-photo-inner">
                                <img
                                    className="about-photo-img"
                                    src="/images/contact/lionel.jpeg"
                                    alt="Lionel Setton, Equipamiento Gráfico Comiter"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
