import React, { useState } from 'react';
import api from '../services/api';

const TaskItem = ({ tarea, onDelete, onUpdate }) => {
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(tarea.nombre);
  const [estado, setEstado] = useState(tarea.estado);

  const handleUpdate = async () => {
    await api.put(`tareas/${tarea.id}/`, { nombre, estado });
    setEditando(false);
    onUpdate();
  };

  return (
    <tr>
      <td>
        {editando ? (
          <input
            className="form-control"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        ) : (
          tarea.nombre
        )}
      </td>
      <td>
        {editando ? (
          <select
            className="form-select"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
          >
            <option>Pendiente</option>
            <option>En progreso</option>
            <option>Completada</option>
          </select>
        ) : (
          tarea.estado
        )}
      </td>
      <td>
        {editando ? (
          <>
            <button className="btn btn-success btn-sm me-2" onClick={handleUpdate}>
              Guardar
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setEditando(false)}>
              Cancelar
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-primary btn-sm me-2" onClick={() => setEditando(true)}>
              Editar
            </button>
            <button className="btn btn-danger btn-sm" onClick={() => onDelete(tarea.id)}>
              Eliminar
            </button>
          </>
        )}
      </td>
    </tr>
  );
};

export default TaskItem;
