import { useAuth } from '../context/AuthContext';
import { usePanel } from '../hooks/usePanel';
import ProductsTable from '../components/panel/ProductsTable';
import CategoriesTable from '../components/panel/CategoriesTable';
import ProductModal from '../components/panel/ProductModal';
import CategoryModal from '../components/panel/CategoryModal';
import './Panel.css';

const Panel = () => {
  const { user, logout } = useAuth();
  const {
    products, categories, loading,
    activeTab, setActiveTab,
    showProductForm, showCategoryForm,
    editingProduct,
    productForm, setProductForm,
    imageFiles, setImageFiles,
    categoryForm, setCategoryForm,
    saveProduct, deleteProduct,
    saveCategory, deleteCategory,
    openProductForm, resetProductForm,
    openCategoryForm, resetCategoryForm,
    deleteImage,
  } = usePanel();

  if (loading) {
    return <div className="panel-loading">Cargando...</div>;
  }

  return (
    <div className="panel-page">
      <header className="panel-header">
        <div className="container">
          <div className="panel-header-content">
            <div className="panel-header-info">
              <h1 className="panel-title">Panel de Administración</h1>
              <p className="panel-welcome">Bienvenido, <span>{user?.nombre}</span></p>
            </div>
            <button onClick={logout} className="btn-logout-panel">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      <div className="panel-content container">
        <div className="panel-tabs">
          <nav className="tabs-nav">
            <button
              onClick={() => setActiveTab('products')}
              className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
            >
              <svg className="tab-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Productos <span className="tab-count">({products.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`tab-button ${activeTab === 'categories' ? 'active' : ''}`}
            >
              <svg className="tab-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Categorías <span className="tab-count">({categories.length})</span>
            </button>
          </nav>

          {activeTab === 'products' && (
            <div className="tab-content">
              <div className="tab-header">
                <h2 className="tab-title">Gestión de Productos</h2>
                <button onClick={() => openProductForm()} className="btn-primary">
                  <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nuevo Producto
                </button>
              </div>
              <ProductsTable
                products={products}
                categories={categories}
                onEdit={openProductForm}
                onDelete={deleteProduct}
              />
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="tab-content">
              <div className="tab-header">
                <h2 className="tab-title">Gestión de Categorías</h2>
                <button onClick={() => openCategoryForm()} className="btn-primary">
                  <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nueva Categoría
                </button>
              </div>
              <CategoriesTable
                categories={categories}
                onEdit={openCategoryForm}
                onDelete={deleteCategory}
              />
            </div>
          )}
        </div>

        {showProductForm && (
          <ProductModal
            product={editingProduct}
            productForm={productForm}
            categories={categories}
            onClose={resetProductForm}
            onChange={setProductForm}
            onSubmit={saveProduct}
            imageFiles={imageFiles}
            onImageChange={setImageFiles}
            onDeleteImage={deleteImage}
          />
        )}

        <CategoryModal
          isOpen={showCategoryForm}
          categoryForm={categoryForm}
          onClose={resetCategoryForm}
          onChange={setCategoryForm}
          onSubmit={saveCategory}
        />
      </div>
    </div>
  );
};

export default Panel;
