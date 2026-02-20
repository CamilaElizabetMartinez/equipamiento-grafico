import { useState, useEffect, useCallback, useMemo } from 'react';
import ProductCard from '../components/ProductCard';
import { getProducts, getCategories } from '../services/api';
import './Catalogo.css';

const LoadingState = () => (
  <div className="loading">
    <div className="spinner"></div>
    <p>Cargando productos...</p>
  </div>
);

const ErrorState = ({ onRetry }) => (
  <div className="error">
    <p>Error al cargar los datos. Por favor, intenta nuevamente.</p>
    <button onClick={onRetry} className="retry-btn">Reintentar</button>
  </div>
);

const NoProductsState = () => (
  <div className="no-products">
    <p>No se encontraron productos</p>
  </div>
);

const ProductsGrid = ({ products }) => (
  <div className="products-grid">
    {products.map(product => (
      <ProductCard key={product.idproduct} product={product} />
    ))}
  </div>
);

const Catalogo = () => {
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(false);
  const [filters, setFilters]       = useState({ searchTerm: '', selectedCategory: null });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const [productsData, categoriesData] = await Promise.all([
        getProducts(),
        getCategories()
      ]);
      setProducts(Array.isArray(productsData) ? productsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredProducts = useMemo(() => {
    const { searchTerm, selectedCategory } = filters;
    return products.filter(product => {
      const matchesCategory = !selectedCategory ||
        product.idcategoria?.idcategoria == selectedCategory;
      const matchesSearch = !searchTerm ||
        product.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, filters]);

  const updateFilters = (newFilters) => setFilters(prev => ({ ...prev, ...newFilters }));

  return (
    <div className="catalogo">
      <div className="container">
        <div className="filters-section" id="productos">
          <h2 className="section-title">NUESTROS PRODUCTOS</h2>
          <div className="filters-row">
            <div className="filter-group">
              <label htmlFor="search">Buscar:</label>
              <input
                id="search"
                type="text"
                placeholder="Buscar productos..."
                value={filters.searchTerm}
                onChange={(e) => updateFilters({ searchTerm: e.target.value })}
                className="filter-input"
                aria-label="Buscar productos"
              />
            </div>
            {categories.length > 0 && (
              <div className="filter-group">
                <label htmlFor="category">Categoría:</label>
                <select
                  id="category"
                  value={filters.selectedCategory || ''}
                  onChange={(e) => updateFilters({
                    selectedCategory: e.target.value ? parseInt(e.target.value) : null
                  })}
                  className="filter-select"
                  aria-label="Seleccionar categoría"
                >
                  <option value="">Todas las categorías</option>
                  {categories.map(category => (
                    <option key={category.idcategoria} value={category.idcategoria}>
                      {category.nombrecategoria || category.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState onRetry={loadData} />
        ) : filteredProducts.length === 0 ? (
          <NoProductsState />
        ) : (
          <ProductsGrid products={filteredProducts} />
        )}
      </div>
    </div>
  );
};

export default Catalogo;
