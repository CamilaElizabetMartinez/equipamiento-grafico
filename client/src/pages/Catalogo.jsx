import { useState, useEffect, useCallback, useMemo } from 'react';
import ProductCard from '../components/ProductCard';
import { getProducts, getCategories } from '../services/api';
import './Catalogo.css';

const PRODUCTS_PER_PAGE = 10;

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
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const loadCategories = useCallback(async () => {
    try {
      const categoriesData = await getCategories();
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(true);
    }
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);

      const productsResponse = await getProducts({
        search: filters.searchTerm,
        categoria: filters.selectedCategory,
        page: currentPage,
        limit: PRODUCTS_PER_PAGE,
      });

      if (Array.isArray(productsResponse)) {
        setProducts(productsResponse);
        setPagination(null);
        return;
      }

      setProducts(Array.isArray(productsResponse?.data) ? productsResponse.data : []);
      setPagination(productsResponse?.pagination ?? null);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(true);
      setProducts([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [filters.searchTerm, filters.selectedCategory, currentPage]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const updateFilters = useCallback((newFilters) => {
    setFilters((prevFilters) => ({ ...prevFilters, ...newFilters }));
    setCurrentPage(1);
  }, []);

  const totalPages = useMemo(() => pagination?.totalPages ?? 1, [pagination?.totalPages]);

  const pageItems = useMemo(() => {
    if (totalPages <= 1) return [];

    const siblingCount = 2;
    const firstPage = 1;
    const lastPage = totalPages;

    const startPage = Math.max(firstPage + 1, currentPage - siblingCount);
    const endPage = Math.min(lastPage - 1, currentPage + siblingCount);

    const items = [firstPage];

    if (startPage > firstPage + 1) items.push('…');

    for (let pageNumber = startPage; pageNumber <= endPage; pageNumber += 1) {
      items.push(pageNumber);
    }

    if (endPage < lastPage - 1) items.push('…');

    items.push(lastPage);
    return items;
  }, [currentPage, totalPages]);

  const goToPage = useCallback((nextPage) => {
    setCurrentPage(nextPage);
  }, []);

  const canGoPrev = useMemo(() => currentPage > 1, [currentPage]);
  const canGoNext = useMemo(() => currentPage < totalPages, [currentPage, totalPages]);

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
          <ErrorState onRetry={loadProducts} />
        ) : products.length === 0 ? (
          <NoProductsState />
        ) : (
          <>
            <ProductsGrid products={products} />

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  type="button"
                  className="pagination-btn pagination-btn--text"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={!canGoPrev}
                >
                  Anterior
                </button>

                <div className="pagination-pages" role="navigation" aria-label="Paginación">
                  {pageItems.map((pageItem, pageItemIndex) => {
                    if (pageItem === '…') {
                      return (
                        <span key={`ellipsis-${pageItemIndex}`} className="pagination-ellipsis" aria-hidden="true">
                          …
                        </span>
                      );
                    }

                    const pageNumber = pageItem;
                    const isActive = pageNumber === currentPage;

                    return (
                      <button
                        key={pageNumber}
                        type="button"
                        className={`pagination-btn ${isActive ? 'active' : ''}`}
                        onClick={() => goToPage(pageNumber)}
                        disabled={isActive}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  className="pagination-btn pagination-btn--text"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={!canGoNext}
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Catalogo;
