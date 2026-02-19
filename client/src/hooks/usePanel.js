import { useState, useEffect, useCallback } from 'react';

const INITIAL_PRODUCT_FORM = { idproduct: '', titulo: '', descripcion: '', precio: '', idcategoria: '' };
const INITIAL_CATEGORY_FORM = { id: '', nombre: '' };

const uploadImages = async (productId, files) => {
  const MAX_BYTES = 10 * 1024 * 1024;
  const errors = [];

  for (const file of files) {
    if (file.size > MAX_BYTES) {
      errors.push(`"${file.name}" supera el límite de 10MB`);
      continue;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`/api/products/${productId}/images`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (!res.ok) {
        let reason = `HTTP ${res.status}`;
        try {
          const body = await res.json();
          reason = body.message || body.error || reason;
        } catch (_) {
          reason = (await res.text()) || reason;
        }
        errors.push(`"${file.name}": ${reason}`);
      }
    } catch (err) {
      errors.push(`"${file.name}": Error de red - ${err.message}`);
    }
  }

  return errors;
};

export const usePanel = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');

  const [showProductForm, setShowProductForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  const [productForm, setProductForm] = useState(INITIAL_PRODUCT_FORM);
  const [imageFiles, setImageFiles] = useState([]);
  const [categoryForm, setCategoryForm] = useState(INITIAL_CATEGORY_FORM);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/products', { credentials: 'include' }),
        fetch('/api/categories', { credentials: 'include' })
      ]);

      if (productsRes.ok) {
        const data = await productsRes.json();
        setProducts(Array.isArray(data) ? data : []);
      } else {
        setProducts([]);
      }

      if (categoriesRes.ok) {
        const result = await categoriesRes.json();
        setCategories(Array.isArray(result?.data) ? result.data : []);
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

  const resetProductForm = useCallback(() => {
    setShowProductForm(false);
    setEditingProduct(null);
    setProductForm(INITIAL_PRODUCT_FORM);
    setImageFiles([]);
  }, []);

  const resetCategoryForm = useCallback(() => {
    setShowCategoryForm(false);
    setEditingCategory(null);
    setCategoryForm(INITIAL_CATEGORY_FORM);
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
      setCategoryForm({ id: category.idcategoria, nombre: category.nombrecategoria });
    } else {
      resetCategoryForm();
    }
    setShowCategoryForm(true);
  }, [resetCategoryForm]);

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

      if (filesToUpload.length > 0 && productId) {
        const errors = await uploadImages(productId, filesToUpload);
        if (errors.length > 0) {
          alert('Producto guardado, pero algunas imágenes fallaron:\n' + errors.join('\n'));
        }
      }

      alert(`Producto ${isEditing ? 'actualizado' : 'creado'}`);
      resetProductForm();
      fetchData();
    } catch {
      alert('Error de conexión');
    }
  }, [productForm, editingProduct, imageFiles, fetchData, resetProductForm]);

  const deleteImage = useCallback(async (productId, imageId) => {
    try {
      const res = await fetch(`/api/products/${productId}/images/${imageId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.message || 'Error al eliminar la imagen');
        return;
      }
      setEditingProduct(prev => ({
        ...prev,
        multimedia: prev.multimedia.filter(m => m.id !== imageId)
      }));
    } catch {
      alert('Error de conexión');
    }
  }, []);

  const deleteProduct = useCallback(async (id) => {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        setProducts(prev => prev.filter(p => p.idproduct !== id));
      }
    } catch (error) {
      console.error('Error eliminando producto:', error);
    }
  }, []);

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
        alert(error.error || 'Error guardando categoría');
      }
    } catch {
      alert('Error de conexión');
    }
  }, [categoryForm, editingCategory, fetchData, resetCategoryForm]);

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
        alert(error.error || 'Error eliminando');
      }
    } catch {
      alert('Error de conexión');
    }
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
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
  };
};
