# Publicar en GitHub Pages

## Opcion recomendada (repo principal)
1. Ve a GitHub y abre el repositorio.
2. Entra en Settings -> Pages.
3. En "Build and deployment", selecciona:
   - Source: Deploy from a branch
   - Branch: main
   - Folder: / (root)
4. Guarda y espera a que termine el deploy.

La web quedara publicada en:
`https://TU_USUARIO.github.io/NOMBRE_REPO/`

## Comprobar
- Abre el enlace de Pages y verifica que carga `index.html`.
- Si no carga, revisa que el archivo se llame `index.html`.

## Notas
- GitHub Pages sirve contenido estatico. No hay backend real.
- Si actualizas archivos, solo haz commit y push; Pages se actualiza solo.
