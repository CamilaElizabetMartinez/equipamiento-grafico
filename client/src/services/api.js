// Servicio API para comunicarse con el backend Symfony

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Obtener todos los productos con filtros opcionales
 * @param {Object} filters - Filtros opcionales (categoria, search, sort, page)
 * @returns {Promise<Array>} Lista de productos
 */
export const getProducts = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();

    if (filters.categoria) queryParams.append('idcategoria', filters.categoria);
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.sort) queryParams.append('sort', filters.sort);
    if (filters.page) queryParams.append('page', filters.page);

    const url = `${API_URL}/api/productos${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener productos:', error);
    throw error;
  }
};

/**
 * Obtener un producto por ID
 * @param {number} id - ID del producto
 * @returns {Promise<Object>} Producto
 */
export const getProductById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/api/productos/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error al obtener producto ${id}:`, error);
    throw error;
  }
};

/**
 * Obtener todas las categorías
 * @returns {Promise<Array>} Lista de categorías
 */
export const getCategories = async () => {
  try {
    const response = await fetch(`${API_URL}/api/categorias`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    throw error;
  }
};

/**
 * Enviar consulta de contacto
 * @param {Object} contactData - Datos del contacto
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const sendContact = async (contactData) => {
  try {
    const response = await fetch(`${API_URL}/api/contacto`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(contactData),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al enviar contacto:', error);
    throw error;
  }
};

export default {
  getProducts,
  getProductById,
  getCategories,
  sendContact,
};
