---
name: buscaimagenes
description: Búsqueda y descarga de imágenes libres de derechos (Unsplash, Pexels, Pixabay) de forma automática o manual, parametrizada a través de diálogo en lenguaje natural.
---

# Skill: Búsqueda y Descarga de Imágenes (buscaimagenes)

Esta Habilidad (Skill) permite buscar, validar y descargar imágenes libres de derechos de autor utilizando los bancos de imágenes gratuitos **Unsplash**, **Pexels** y **Pixabay**. Soporta ejecución automatizada mediante scripts del proyecto o asistencia manual en caso de no contar con API Keys.

> [!IMPORTANT]
> Si en el proyecto actual existe una skill o regla específica para el cliente o proyecto relacionada con la búsqueda de imágenes, dale prioridad absoluta a sus directrices y utiliza esta skill genérica únicamente como estructura base o fallback.

---

## 1. Captura de Parámetros (Conversación)
Antes de iniciar cualquier búsqueda o descarga, solicita al usuario la información necesaria en una sola pregunta amigable en lenguaje natural. Los parámetros requeridos son:
1. **Tema**: ¿Qué tema o concepto deben representar las fotos?
2. **Cantidad**: Número de imágenes requeridas (máximo de 10).
3. **Finalidad**: ¿Para qué se usarán las fotos? (Ayuda a dar contexto y refinar la búsqueda).
4. **Tipo de imagen**: Preferencia visual (realista, ilustraciones, imágenes relacionadas, o solo personas).

---

## 2. Preparación del Directorio y Permisos
Las imágenes descargadas deben guardarse en la carpeta `./fotos_solicitadas/` dentro del directorio raíz del proyecto.

### Verificación y Ajuste de Permisos
1. Verifica si la carpeta del proyecto tiene permisos de escritura para crear y escribir en `./fotos_solicitadas/`.
2. Si se detecta un error de permisos de escritura:
   - Informa al usuario inmediatamente en el chat explicando el problema.
   - Solicita su autorización para ajustar los permisos desde la consola.
   - Una vez autorizado, ejecuta el comando correspondiente según el sistema operativo:
     - **Windows (PowerShell)**:
       ```powershell
       # Concede permisos de control total al usuario actual sobre el directorio actual
       icacls . /grant "${env:USERNAME}:(OI)(CI)F" /T
       ```
     - **Linux / macOS**:
       ```bash
       chmod -R u+w .
       ```

---

## 3. Método Principal: Búsqueda y Descarga Automática
Si el proyecto cuenta con el script de automatización (por ejemplo, `buscar_fotos.mjs` o equivalente) y las claves API correspondientes en el archivo `.env`, sigue este procedimiento:

### API Keys Requeridas (en `.env`)
Todas configuradas en `sistemaaiprocess/.env` (2026-07-27).

- **Pexels**: `PEXELS_API_KEY` (**principal**) -> [pexels.com/api](https://www.pexels.com/api/)
- **Unsplash**: `UNSPLASH_API_KEY` (secundaria) -> [unsplash.com/developers](https://unsplash.com/developers)
- **Pixabay**: `PIXABAY_API_KEY` (fallback, **usar con cautela**) -> [pixabay.com/api/docs](https://pixabay.com/api/docs/)

> [!IMPORTANT]
> **Orden de prioridad definido por Patricio Ferrer para CONSULTORAVIRTUAL:**
> `Pexels → Unsplash → Pixabay`
>
> **Por qué este orden y no el genérico:**
> - **Pexels** tiene material más candoroso y de operación real: bodegas, talleres,
>   oficinas chicas, gente trabajando de verdad. Es lo que necesita este proyecto.
> - **Unsplash** es más estético y editorial. Sirve, pero tiende a lo aspiracional.
> - **Pixabay** tiene más ilustraciones y stock genérico. Solo si las otras dos fallan,
>   y revisando con especial cuidado.

### Procedimiento
1. **Generación de Consultas**: A partir de las respuestas del usuario (tema, tipo y finalidad), define términos de búsqueda específicos **en inglés**. Crea un archivo de configuración temporal (ej. `queries.json`) con un término descriptivo y diferente por cada imagen para diversificar las poses, planos y encuadres.
2. **Ejecución del Script**: Ejecuta el script especificando el archivo de consultas, la carpeta de destino (`./fotos_solicitadas/`) y la fuente principal (**Pexels** en este proyecto):
   ```bash
   node buscar_fotos.mjs queries.json ./fotos_solicitadas pexels
   ```
3. **Revisión y Validación**:
   - Revisa cada imagen descargada antes de dar el trabajo por terminado.
   - Asegúrate de que no contengan marcas de agua, logos visibles, ni sean fotos de banco extremadamente artificiales.
   - Si el usuario rechaza alguna propuesta, o si no se adapta al tema/estilo, ajusta el término de búsqueda para esa imagen en `queries.json` y vuelve a ejecutar utilizando la cadena de fallback:
     - **Unsplash (Segunda opción)**:
       ```bash
       node buscar_fotos.mjs queries.json ./fotos_solicitadas unsplash
       ```
     - **Pixabay (Fallback final, revisar con cuidado)**:
       ```bash
       node buscar_fotos.mjs queries.json ./fotos_solicitadas pixabay
       ```

### 🚫 Criterio de rechazo para CONSULTORAVIRTUAL
Descarta la imagen, sin importar la fuente, si tiene:
```
❌ Gente sonriendo a la cámara con laptops en oficinas impecables
❌ Apretones de manos, equipos aplaudiendo, gráficos flotando
❌ Hologramas, cerebros digitales, cualquier cliché de "IA"
❌ Oficinas corporativas grandes o rascacielos

✅ Bodega real con cajas desordenadas, taller, mesón de atención
✅ Planillas impresas, papeles, pizarras con anotaciones a mano
✅ Espacios chicos, luz natural, algo de desorden creíble
```
El público es un dueño de PYME. Si la foto parece de una multinacional,
no se identifica y el mensaje pierde fuerza.
   - Si es necesario evitar que se repitan fotos usadas anteriormente en otros proyectos, asegúrate de activar la bandera `mirrorPhotos: true` en la configuración si el script lo soporta.

---

## 4. Método Alternativo: Búsqueda Manual
Si **no** hay API Keys configuradas en el entorno:
1. Diseña de 2 a 3 términos de búsqueda específicos **en inglés** basados en las preferencias del usuario.
2. Proporciona al usuario enlaces directos para realizar las búsquedas manualmente en los navegadores:
   - **Unsplash**: `https://unsplash.com/s/photos/<query>`
   - **Pexels**: `https://www.pexels.com/search/<query>/`
   - **Pixabay**: `https://pixabay.com/images/search/<query>/`
3. Instruye al usuario para que descargue las imágenes seleccionadas y las guarde manualmente en la subcarpeta `fotos_solicitadas/` del proyecto.
