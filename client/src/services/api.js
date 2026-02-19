/**
 * Servicio API para comunicarse con el backend Symfony
 * Arquitectura modular con Service Layer pattern
 */

// ============================================
// CONFIGURACIÓN
// ============================================

const API_URL = import.meta.env.VITE_API_URL || '';

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// ============================================
// HELPER: Cliente HTTP centralizado
// ============================================

/**
 * Función helper para hacer peticiones HTTP
 * Centraliza el manejo de errores y configuración
 * Soporta tanto formato antiguo como nuevo formato estandarizado
 */
const fetchAPI = async (endpoint, options = {}) => {
  try {
    const config = {
      headers: DEFAULT_HEADERS,
      ...options,
    };

    // Agregar credentials si está especificado
    if (options.credentials) {
      config.credentials = options.credentials;
    }

    const response = await fetch(`${API_URL}${endpoint}`, config);
    const result = await response.json();

    // Manejo de errores HTTP
    if (!response.ok) {
      // Nuevo formato: {status: 'fail'|'error', message: '...'}
      // Formato antiguo: {error: '...'}
      const errorMessage = result.message || result.error || `Error ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    // Extraer data del wrapper si existe (nuevo formato)
    // Si no existe, devolver resultado completo (retrocompatibilidad)
    if (result && typeof result === 'object' && result.status === 'success') {
      // Nuevo formato: {status: 'success', data: ..., message: ...}
      return result.data !== undefined ? result.data : result;
    }

    // Formato antiguo o sin wrapper
    return result;
  } catch (error) {
    console.error(`[API Error] ${endpoint}:`, error.message);
    throw error;
  }
};

// ============================================
// PRODUCTS API
// ============================================

export const productsAPI = {
  /**
   * Obtener todos los productos con filtros opcionales
   * @param {Object} filters - Filtros: { categoria, search, sort, page }
   * @returns {Promise<Array>} Lista de productos
   */
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();

    if (filters.categoria) params.append('idcategoria', filters.categoria);
    if (filters.search) params.append('search', filters.search);
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.page) params.append('page', filters.page);

    const queryString = params.toString();
    const endpoint = `/api/products${queryString ? '?' + queryString : ''}`;

    return fetchAPI(endpoint);
  },

  /**
   * Obtener un producto por ID
   * @param {number} id - ID del producto
   * @returns {Promise<Object>} Producto
   */
  getById: async (id) => {
    return fetchAPI(`/api/products/${id}`);
  },

  /**
   * Crear un nuevo producto (requiere autenticación)
   * @param {Object} data - Datos del producto
   * @returns {Promise<Object>} Respuesta del servidor
   */
  create: async (data) => {
    return fetchAPI('/api/products', {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(data),
    });
  },

  /**
   * Actualizar un producto existente (requiere autenticación)
   * @param {number} id - ID del producto
   * @param {Object} data - Datos actualizados
   * @returns {Promise<Object>} Respuesta del servidor
   */
  update: async (id, data) => {
    return fetchAPI(`/api/products/${id}`, {
      method: 'PUT',
      credentials: 'include',
      body: JSON.stringify(data),
    });
  },

  /**
   * Eliminar un producto (requiere autenticación)
   * @param {number} id - ID del producto
   * @returns {Promise<Object>} Respuesta del servidor
   */
  delete: async (id) => {
    return fetchAPI(`/api/products/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  },
};

// ============================================
// CATEGORIES API
// ============================================

export const categoriesAPI = {
  /**
   * Obtener todas las categorías
   * @returns {Promise<Array>} Lista de categorías
   */
  getAll: async () => {
    return fetchAPI('/api/categories');
  },

  /**
   * Crear una nueva categoría (requiere autenticación)
   * @param {Object} data - Datos de la categoría
   * @returns {Promise<Object>} Respuesta del servidor
   */
  create: async (data) => {
    return fetchAPI('/api/categories', {
      method: 'POST',
      credentials: 'include',
      body: JSON.stringify(data),
    });
  },

  /**
   * Actualizar una categoría existente (requiere autenticación)
   * @param {number} id - ID de la categoría
   * @param {Object} data - Datos actualizados
   * @returns {Promise<Object>} Respuesta del servidor
   */
  update: async (id, data) => {
    return fetchAPI(`/api/categories/${id}`, {
      method: 'PUT',
      credentials: 'include',
      body: JSON.stringify(data),
    });
  },

  /**
   * Eliminar una categoría (requiere autenticación)
   * @param {number} id - ID de la categoría
   * @returns {Promise<Object>} Respuesta del servidor
   */
  delete: async (id) => {
    return fetchAPI(`/api/categories/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
  },
};

// ============================================
// CONTACT API
// ============================================

export const contactAPI = {
  /**
   * Enviar consulta de contacto
   * @param {Object} contactData - Datos del contacto
   * @returns {Promise<Object>} Respuesta del servidor
   */
  send: async (contactData) => {
    return fetchAPI('/api/contacto', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  },
};

// ============================================
// EXPORTACIONES DE COMPATIBILIDAD
// Para mantener compatibilidad con código existente
// ============================================

export const getProducts = productsAPI.getAll;
export const getProductById = productsAPI.getById;
export const getCategories = categoriesAPI.getAll;
export const sendContact = contactAPI.send;

// ============================================
// EXPORTACIÓN POR DEFECTO
// ============================================

export default {
  products: productsAPI,
  categories: categoriesAPI,
  contact: contactAPI,
  // Métodos legacy

  getProducts,
  getProductById,
  getCategories,
  sendContact,
};
