import { useState } from 'react';

// Barra que aparece solo con tareas seleccionadas. Elegir una carpeta no asigna nada:
// la asignación ocurre únicamente al pulsar "Asignar".
export default function SelectionBar({ count, folders, onAssign, onClear }) {
  const [destino, setDestino] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    if (!destino) return;
    onAssign(destino);
  }

  return (
    <form
      className="seleccion"
      data-testid="selection-bar"
      onSubmit={handleSubmit}
      aria-label="Tareas seleccionadas"
    >
      <span data-testid="selection-count" className="seleccion-conteo">
        {count === 1 ? '1 seleccionada' : `${count} seleccionadas`}
      </span>
      <label htmlFor="asignar-carpeta" className="oculto">
        Asignar a carpeta
      </label>
      <select
        id="asignar-carpeta"
        name="asignar-carpeta"
        value={destino}
        onChange={(e) => setDestino(e.target.value)}
      >
        <option value="" disabled>
          Asignar a carpeta…
        </option>
        {folders.map((folder) => (
          <option key={folder.id} value={folder.id}>
            {folder.nombre}
          </option>
        ))}
      </select>
      <button type="submit" data-testid="assign-folder" disabled={!destino}>
        Asignar
      </button>
      <button type="button" className="secundario" onClick={onClear}>
        Deseleccionar
      </button>
    </form>
  );
}
