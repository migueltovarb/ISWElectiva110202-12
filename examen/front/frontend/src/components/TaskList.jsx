import React, { useEffect, useState } from 'react';
import api from '../services/api';
import TaskForm from './TaskForm';
import TaskItem from './TaskItem';

const TaskList = () => {
  const [tareas, setTareas] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('Todos');

  const fetchTareas = async () => {
    try {
      const res = await api.get('tareas/');
      const tareasFiltradas =
        filtroEstado === 'Todos'
          ? res.data
          : res.data.filter((t) => t.estado === filtroEstado);
      setTareas(tareasFiltradas);
    } catch (error) {
      console.error('Error al cargar tareas:', error);
    }
  };

  const eliminarTarea = async (id) => {
    await api.delete(`tareas/${id}/`);
    fetchTareas();
  };

  useEffect(() => {
    fetchTareas();
  }, [filtroEstado]);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Gestor de Tareas</h2>

      <TaskForm onSuccess={fetchTareas} />

      <div className="mb-3 mt-4">
        <label className="form-label">Filtrar por estado:</label>
        <select
          className="form-select w-auto"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="Todos">Todos</option>
          <option value="Pendiente">Pendiente</option>
          <option value="En progreso">En progreso</option>
          <option value="Completada">Completada</option>
        </select>
      </div>

      <table className="table table-bordered mt-3">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tareas.length > 0 ? (
            tareas.map((tarea) => (
              <TaskItem
                key={tarea.id}
                tarea={tarea}
                onDelete={eliminarTarea}
                onUpdate={fetchTareas}
              />
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center">
                No hay tareas.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TaskList;
