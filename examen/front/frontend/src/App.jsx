import 'bootstrap/dist/css/bootstrap.min.css';
import TaskList from './components/TaskList';

function App() {
  return (
    <div className="App">
      <h1 className="text-center mt-4">Gestor de Tareas</h1>
      <TaskList />
    </div>
  );
}

export default App;
