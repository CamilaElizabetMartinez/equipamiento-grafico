import { useCallback } from 'react';
import FileUploadArea from './FileUploadArea';

const MAX_IMAGES = 5;

const CloseIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ProductModal = ({
  isOpen,
  product,
  productForm,
  categories,
  onClose,
  onChange,
  onSubmit,
  imageFiles,
  onImageChange,
  onDeleteImage
}) => {
  const existingImages = product?.multimedia || [];
  const totalImages = existingImages.length + imageFiles.length;
  const canAddMore = totalImages < MAX_IMAGES;

  const handleFileSelect = useCallback((e) => {
    if (!e.target.files?.length) return;
    const remaining = MAX_IMAGES - totalImages;
    const toAdd = Array.from(e.target.files).slice(0, remaining);
    onImageChange([...imageFiles, ...toAdd]);
    e.target.value = '';
  }, [imageFiles, totalImages, onImageChange]);

  const removeNewImage = useCallback((index) => {
    onImageChange(imageFiles.filter((_, i) => i !== index));
  }, [imageFiles, onImageChange]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {productForm.idproduct ? 'Editar Producto' : 'Nuevo Producto'}
          </h3>
          <button className="modal-close" onClick={onClose}>
            <CloseIcon />
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
                    <button
                      type="button"
                      className="file-preview-remove"
                      onClick={() => onDeleteImage(productForm.idproduct, img.id)}
                      title="Eliminar imagen"
                    >
                      <CloseIcon />
                    </button>
                  </div>
                ))}
                {imageFiles.map((file, index) => (
                  <div key={`n-${index}`} className="file-preview-item">
                    <img src={URL.createObjectURL(file)} alt={`Nueva ${index + 1}`} />
                    <button
                      type="button"
                      className="file-preview-remove"
                      onClick={() => removeNewImage(index)}
                      title="Quitar imagen"
                    >
                      <CloseIcon />
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

export default ProductModal;
