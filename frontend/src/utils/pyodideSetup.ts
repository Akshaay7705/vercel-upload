import { loadPyodide } from 'pyodide';

export async function setupPyodide() {
  const pyodide = await loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/',
  });
  await pyodide.loadPackage('micropip');
  try {
    await pyodide.runPythonAsync(`
      import micropip
      await micropip.install('qiskit==0.45.0', keep_going=True)  # Try an older version
    `);
  } catch (e) {
    console.error('Qiskit install failed:', e);
    // Fallback to minimal setup if needed
  }
  return pyodide;
}