import { getFile } from '../utils/fileStorage';

export async function downloadFileFromPath(path, filename) {
  const file = await getFile(path);
  if (!file) {
    alert('Fichier introuvable');
    return;
  }
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 100);
}
