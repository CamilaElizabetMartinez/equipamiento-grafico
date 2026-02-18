import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import './Panel.css';

const Panel = () => {
  const { user, logout } = useAuth();

  // ESTADOS PRINCIPALES
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');

  // FORMULARIOS
  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  
  const [productForm, setProductForm] = useState({
    idproduct: '', titulo: '', descripcion: '', precio: '', idcategoria: ''
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [categoryForm, setCategoryForm] = useState({ id: '', nombre: '' });

  const updateImageFiles = useCallback((files) => {
    setImageFiles(files);
  }, []);

  // CARGAR DATOS
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products', { credentials: 'include' }),
        fetch('/api/categories', { credentials: 'include' })
      ]);

      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(Array.isArray(productsData) ? productsData : []);
      } else {
        setProducts([]);
      }

      if (categoriesRes.ok) {
        const categoriesResult = await categoriesRes.json();
        setCategories(categoriesResult?.data && Array.isArray(categoriesResult.data) ? categoriesResult.data : []);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      setProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // CRUD PRODUCTOS
  const saveProduct = useCallback(async (e) => {
    e.preventDefault();
    const isEditing = !!editingProduct;
    const url = isEditing ? `/api/products/${productForm.idproduct}` : '/api/products';
    const filesToUpload = [...imageFiles];

    try {
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: productForm.titulo,
          descripcion: productForm.descripcion,
          precio: productForm.precio,
          idcategoria: productForm.idcategoria
        })
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.message || error.error || 'Error guardando producto');
        return;
      }

      const result = await response.json();
      const productId = isEditing ? productForm.idproduct : result.data?.idproduct;

      // SUBIR IMÁGENES
      if (filesToUpload.length > 0 && productId) {
        const MAX_FILE_SIZE_MB = 10;
        const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
        const uploadErrors = [];

        for (const file of filesToUpload) {
          if (file.size > MAX_FILE_SIZE_BYTES) {
            uploadErrors.push(`"${file.name}" supera el límite de ${MAX_FILE_SIZE_MB}MB`);
            continue;
          }

          const formData = new FormData();
          formData.append('image', file);

          try {
            const imgRes = await fetch(`/api/products/${productId}/images`, {
              method: 'POST',
              credentials: 'include',
              body: formData
            });

            if (!imgRes.ok) {
              let reason = `HTTP ${imgRes.status}`;
              try {
                const errBody = await imgRes.json();
                reason = errBody.message || errBody.error || reason;
              } catch (_) {
                const textResponse = await imgRes.text();
                reason = textResponse || reason;
              }
              uploadErrors.push(`"${file.name}": ${reason}`);
            }
          } catch (networkError) {
            uploadErrors.push(`"${file.name}": Error de red - ${networkError.message}`);
          }
        }

        if (uploadErrors.length > 0) {
          alert('Producto guardado, pero algunas imágenes fallaron:\n' + uploadErrors.join('\n'));
        }
      }

      alert(`Producto ${isEditing ? 'actualizado' : 'creado'}`);
      resetProductForm();
      fetchData();
    } catch (error) {
      alert('Error de conexión');
    }
  }, [productForm, editingProduct, fetchData, imageFiles]);

  const deleteProduct = useCallback(async (id) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        setProducts(products.filter(p => p.idproduct !== id));
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }, [products]);
  
  // CRUD CATEGORÍAS
  const saveCategory = useCallback(async (e) => {
    e.preventDefault();
    const isEditing = !!editingCategory;
    const url = isEditing ? `/api/categories/${categoryForm.id}` : '/api/categories';
    
    try {
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: categoryForm.nombre })
      });

      if (response.ok) {
        alert(`Categoría ${isEditing ? 'actualizada' : 'creada'}`);
        resetCategoryForm();
        fetchData();
      } else {
        const error = await response.json();
        alert((error.error || 'Error guardando categoría'));
      }
    } catch (error) {
      alert('Error de conexión');
    }
  }, [categoryForm, editingCategory, fetchData]);

  const deleteCategory = useCallback(async (id) => {
    if (!confirm('¿Eliminar categoría?')) return;
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        alert('Categoría eliminada');
        fetchData();
      } else {
        const error = await response.json();
        alert((error.error || 'Error eliminando'));
      }
    } catch (error) {
      alert(' Error de conexión');
    }
  }, [fetchData]);

  // UTILIDADES
  const resetProductForm = useCallback(() => {
    setShowProductForm(false);
    setEditingProduct(null);
    setProductForm({ idproduct: '', titulo: '', descripcion: '', precio: '', idcategoria: '' });
    updateImageFiles([]);
  }, [updateImageFiles]);

  const resetCategoryForm = useCallback(() => {
    setShowCategoryForm(false);
    setEditingCategory(null);
    setCategoryForm({ id: '', nombre: '' });
  }, []);

  const openProductForm = useCallback((product = null) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        idproduct: product.idproduct,
        titulo: product.titulo,
        descripcion: product.descripcion,
        precio: product.precio,
        idcategoria: product.idcategoria?.idcategoria || ''
      });
    } else {
      resetProductForm();
    }
    setShowProductForm(true);
  }, [resetProductForm]);

  const openCategoryForm = useCallback((category = null) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({ 
        id: category.idcategoria, 
        nombre: category.nombrecategoria 
      });
    } else {
      resetCategoryForm();
    }
    setShowCategoryForm(true);
  }, [resetCategoryForm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <div className="panel-loading">Cargando...</div>;
  }

  return (
    <div className="panel-page">
      {/* HEADER */}
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
        {/* TABS */}
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

          {/* PRODUCTOS TAB */}
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

          {/* CATEGORÍAS TAB */}
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

        {/* MODALES */}
        <ProductModal
          isOpen={showProductForm}
          product={editingProduct}
          productForm={productForm}
          categories={categories}
          onClose={resetProductForm}
          onChange={setProductForm}
          onSubmit={saveProduct}
          imageFiles={imageFiles}
          onImageChange={updateImageFiles}
        />
        
        <CategoryModal
          isOpen={showCategoryForm}
          category={editingCategory}
          categoryForm={categoryForm}
          onClose={resetCategoryForm}
          onChange={setCategoryForm}
          onSubmit={saveCategory}
        />
      </div>
    </div>
  );
};

// TABLA PRODUCTOS
const ProductsTable = ({ products, onEdit, onDelete }) => (
  <div className="table-container">
    <table className="data-table">
      <thead>
        <tr>
          <th>Producto</th>
          <th>Precio</th>
          <th>Categoría</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {products.map((product) => (
          <tr key={product.idproduct}>
            <td data-label="Producto">
              <div className="product-info">
                <div className="product-title">{product.titulo}</div>
                <div className="product-desc">{product.descripcion}</div>
              </div>
            </td>
            <td data-label="Precio">
              <span className="product-price">${parseFloat(product.precio).toFixed(2)}</span>
            </td>
            <td data-label="Categoría">
              <span className="category-badge">
                {product.idcategoria?.nombrecategoria || 'Sin categoría'}
              </span>
            </td>
            <td data-label="Acciones">
              <div className="action-buttons">
                <button
                  onClick={() => onEdit(product)}
                  className="btn-edit"
                  title="Editar"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(product.idproduct || product.id)}
                  className="btn-delete"
                  title="Eliminar"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// TABLA CATEGORÍAS
const CategoriesTable = ({ categories, onEdit, onDelete }) => (
  <div className="table-container">
    <table className="data-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {categories.map(category => (
          <tr key={category.idcategoria}>
            <td data-label="ID">
              <span className="category-id">#{category.idcategoria}</span>
            </td>
            <td data-label="Nombre">
              <span className="category-name">{category.nombrecategoria}</span>
            </td>
            <td data-label="Acciones">
              <div className="action-buttons">
                <button
                  onClick={() => onEdit(category)}
                  className="btn-edit"
                  title="Editar"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => onDelete(category.idcategoria)}
                  className="btn-delete"
                  title="Eliminar"
                >
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// MODAL PRODUCTOS
const ProductModal = ({
  isOpen,
  product,
  productForm,
  categories,
  onClose,
  onChange,
  onSubmit,
  imageFiles,
  onImageChange
}) => {
  if (!isOpen) return null;

  const MAX_IMAGES = 5;
  const existingImages = product?.multimedia || [];
  const totalImages = existingImages.length + imageFiles.length;
  const canAddMore = totalImages < MAX_IMAGES;

  const handleFileSelect = useCallback((e) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const selected = Array.from(e.target.files);
    const remaining = MAX_IMAGES - totalImages;
    const toAdd = selected.slice(0, remaining);
    
    onImageChange([...imageFiles, ...toAdd]);
    e.target.value = '';
  }, [imageFiles, totalImages, onImageChange, MAX_IMAGES]);

  const removeNewImage = useCallback((index) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    onImageChange(newFiles);
  }, [imageFiles, onImageChange]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {productForm.idproduct ? 'Editar Producto' : 'Nuevo Producto'}
          </h3>
          <button className="modal-close" onClick={onClose}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={onSubmit} className="modal-form">
          <div className="form-group">
            <label>Título del Producto</label>
            <input
              type="text"
              placeholder="Ej: Impresora HP LaserJet"
              value={productForm.titulo}
              onChange={e => onChange({ ...productForm, titulo: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <textarea
              placeholder="Descripción detallada del producto..."
              rows="4"
              value={productForm.descripcion}
              onChange={e => onChange({ ...productForm, descripcion: e.target.value })}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Precio</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={productForm.precio}
                onChange={e => onChange({ ...productForm, precio: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Categoría</label>
              <select
                value={productForm.idcategoria}
                onChange={e => onChange({ ...productForm, idcategoria: e.target.value })}
                required
              >
                <option value="">Seleccionar...</option>
                {Array.isArray(categories) && categories.map(cat => (
                  <option key={cat.idcategoria} value={cat.idcategoria}>
                    {cat.nombrecategoria}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>
              Imágenes del Producto
              <span className="file-input-counter">{totalImages}/{MAX_IMAGES}</span>
            </label>
            {canAddMore && (
              <FileUploadArea 
                onFileSelect={handleFileSelect}
                totalImages={totalImages}
                maxImages={MAX_IMAGES}
              />
            )}
            {totalImages > 0 && (
              <div className="file-preview-grid">
                {existingImages.map((img, index) => (
                  <div key={`e-${index}`} className="file-preview-item">
                    <img src={img.url} alt={`Imagen ${index + 1}`} />
                    <span className="file-preview-badge">Guardada</span>
                  </div>
                ))}
                {imageFiles.map((file, index) => (
                  <div key={`n-${index}`} className="file-preview-item">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Nueva ${index + 1}`}
                    />
                    <button
                      type="button"
                      className="file-preview-remove"
                      onClick={() => removeNewImage(index)}
                      title="Quitar imagen"
                    >
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {productForm.idproduct ? 'Actualizar Producto' : 'Crear Producto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// MODAL CATEGORÍAS
const CategoryModal = ({ 
  isOpen, 
  categoryForm, 
  onClose, 
  onChange, 
  onSubmit 
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {categoryForm.id ? 'Editar Categoría' : 'Nueva Categoría'}
          </h3>
          <button className="modal-close" onClick={onClose}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={onSubmit} className="modal-form">
          <div className="form-group">
            <label>Nombre de la Categoría</label>
            <input
              type="text"
              placeholder="Ej: Impresoras"
              value={categoryForm.nombre}
              onChange={e => onChange({ ...categoryForm, nombre: e.target.value })}
              required
            />
          </div>
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              {categoryForm.id ? 'Actualizar Categoría' : 'Crear Categoría'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// COMPONENTE PARA CARGA DE ARCHIVOS
const FileUploadArea = ({ onFileSelect, totalImages, maxImages }) => {
  const fileInputRef = useRef(null);

  const handleClick = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleFileChange = useCallback((e) => {
    onFileSelect(e);
  }, [onFileSelect]);

  return (
    <div className="file-input-wrapper">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="file-input-hidden"
        style={{ display: 'none' }}
      />
      <div 
        className="file-input-label" 
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleClick();
          }
        }}
      >
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="file-input-icon">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Añadir imagen{totalImages > 0 ? ' (puedes añadir más)' : '...'}
        <span className="file-upload-hint">
          ({totalImages}/{maxImages} imágenes)
        </span>
      </div>
    </div>
  );
};

export default Panel;