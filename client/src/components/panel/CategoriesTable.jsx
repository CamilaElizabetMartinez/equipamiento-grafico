const EditIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const DeleteIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

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
                <button onClick={() => onEdit(category)} className="btn-edit" title="Editar">
                  <EditIcon />
                </button>
                <button onClick={() => onDelete(category.idcategoria)} className="btn-delete" title="Eliminar">
                  <DeleteIcon />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default CategoriesTable;
