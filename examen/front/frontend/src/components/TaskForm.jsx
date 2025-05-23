import React, { useState } from 'react';
import api from '../services/api';

const TaskForm = ({ onSuccess }) => {
  const [nombre, setNombre] = useState('');
  const [estado, setEstado] = useState('Pendiente');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre) return;
    await api.post('tareas/', { nombre, estado });
    setNombre('');
    setEstado('Pendiente');
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-2">
        <input
          className="form-control"
          placeholder="Nombre de la tarea"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
      </div>
      <div className="mb-2">
        <select className="form-select" value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option>Pendiente</option>
          <option>En progreso</option>
          <option>Completada</option>
        </select>
      </div>
      <button className="btn btn-primary" type="submit">
        Crear Tarea
      </button>
    </form>
  );
};

export default TaskForm;
