
import "./App.css";

function App() {
  return (
    <div className="app">
      <aside className="sidebar">
        <h1 className="logo">Voice Note</h1>

        <nav className="navigation">
          <button>Inicio</button>
          <button>Explorar</button>
          <button>Mensajes</button>
          <button>Notificaciones</button>
          <button>Perfil</button>
          <button>Configuración</button>
        </nav>
      </aside>

      <main className="main-content">
        <h2>Inicio</h2>
        <p>Bienvenido a Voice Note.</p>
      </main>
    </div>
  );
}

export default App;
