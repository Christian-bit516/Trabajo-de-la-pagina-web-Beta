// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

/**
 * Hook personalizado para debounce (retrasar) un valor.
 * Útil para retrasar la ejecución de funciones costosas como búsquedas o filtros
 * hasta que el usuario haya dejado de escribir por un tiempo determinado.
 *
 * @param value El valor a debounced.
 * @param delay El tiempo de retraso en milisegundos.
 * @returns El valor debounced.
 */
function useDebounce<T>(value: T, delay: number): T {
  // Estado para guardar el valor debounced
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Configurar un temporizador para actualizar el valor debounced
    // solo después de que el valor original no haya cambiado durante el 'delay' especificado.
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpiar el temporizador si el valor cambia (antes de que el delay termine)
    // o si el componente se desmonta.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Solo re-ejecutar el efecto si 'value' o 'delay' cambian

  return debouncedValue;
}

export default useDebounce;