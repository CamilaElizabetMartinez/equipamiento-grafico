import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { getProducts, getCategories } from '../services/api';
import './Catalogo.css';

const Catalogo = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories()
      ]);

      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      setError('Error al cargar los datos. Por favor, intenta nuevamente.');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesCategory = !selectedCategory ||
      product.idcategoria?.idcategoria === selectedCategory;

    const matchesSearch = !searchTerm ||
      product.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.descripcion.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="catalogo">
      <div className="container">
        <div className="filters-section" id="productos">
          <h2 className="section-title">Nuestros Productos</h2>

          <div className="filters-row">
            <div className="filter-group">
              <label htmlFor="search">Buscar:</label>
              <input
                id="search"
                type="text"
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="filter-input"
              />
            </div>

            {categories.length > 0 && (
              <div className="filter-group">
                <label htmlFor="category">Categoría:</label>
                <select
                  id="category"
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)}
                  className="filter-select"
                >
                  <option value="">Todas las categorías</option>
                  {categories.map((category) => (
                    <option key={category.idcategoria} value={category.idcategoria}>
                      {category.nombre || category.descripcion}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Cargando productos...</p>
          </div>
        ) : error ? (
          <div className="error">
            <p>{error}</p>
            <button onClick={loadData} className="retry-btn">
              Reintentar
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="no-products">
            <p>No se encontraron productos</p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.idproduct} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Catalogo;
