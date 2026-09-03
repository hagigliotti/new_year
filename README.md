# new_year 🎆🎄

Página con la cuenta regresiva y los tuits de Año Nuevo **y Navidad** listos para programar, zona horaria por zona horaria — más una pestaña de referencia con las fechas exactas de otros calendarios (Año Nuevo chino, judío, islámico, persa, etíope, tailandés).

Sitio: `https://hagigliotti.github.io/new_year/`

## Cómo publicarla en GitHub Pages

1. En GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, elegí la rama (`main`) y la carpeta `/ (root)`.
2. Guardá. GitHub te va a dar la URL de arriba (puede tardar un par de minutos la primera vez).
3. Cada vez que corrijas una ciudad, solo tenés que reemplazar `data.json` y hacer commit — el `index.html` no necesita tocarse.

## Estructura

- `index.html` — la página: countdown en vivo, 3 pestañas (Año Nuevo / Navidad / Otros calendarios), un cuadro de texto para editar el saludo (se guarda en el navegador de quien lo edite, vía `localStorage`), y la lista de zonas con botón de copiar por tuit. Los tuits se arman **en el momento, en el navegador** — a partir de `data.json` + el saludo — así que el año del saludo por defecto (`#HappyNewYear XX` / `#FelizNavidad XX`) se actualiza solo cada año, sin tocar el código.
- `data.json` — solo los datos crudos: por cada zona horaria el offset y la lista de ciudades/países ya ordenada alfabéticamente. Está en orden descendente, de UTC+14 a UTC-12.
- `Ciudades_Uso_Horario_2027_CORREGIDO.xlsx` / `Tuits_Año_Nuevo_2027.txt` — una foto exportada (saludo de Año Nuevo 2027 por defecto) para revisar o programar tuits sin abrir la página.

## Si querés actualizar los datos

`data.json` es una lista de objetos, ordenada de UTC+14 a UTC-12:

```json
{ "offset": -3, "cities": ["🇦🇷 Buenos Aires / Córdoba / Rosario - Argentina (Argentina)", "..."] }
```

Podés editarlo a mano. El formato de cada ciudad es siempre: `<bandera> <ciudad en idioma local> (<ciudad en inglés>) - <país en idioma local> (<país en inglés>)` — si el país ya está en inglés, no se repite.

## Otros calendarios

La tercera pestaña (`OTHER_CALENDARS` en `index.html`) es una lista fija con las próximas fechas de Rosh Hashaná, Año Nuevo chino, Nowruz, Enkutatash (etíope), Songkran (tailandés) y el Año Nuevo islámico, cada una con su conversión a hora de Italia y Argentina. Como no son eventos que crucen las 37 zonas horarias (son un momento puntual en su propio calendario), no generan un tuit por zona sino uno solo por celebración. Hay que actualizar esas fechas a mano una vez que pasan (el Hijri islámico en particular se confirma por avistamiento lunar, así que su fecha es aproximada).
