# new_year 🎆

Página con la cuenta regresiva y los tuits de Año Nuevo listos para programar, zona horaria por zona horaria (31/12/2026 → 1/1/2027, según el horario de invierno de Italia).

## Cómo publicarla en GitHub Pages

1. Copiá los archivos `index.html` y `data.json` a la raíz de tu repo **new_year** (o a una carpeta `/docs` si preferís).
2. En GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**, elegí la rama (`main`) y la carpeta (`/root` o `/docs` según dónde los hayas puesto).
3. Guardá. GitHub te va a dar una URL del tipo `https://TU_USUARIO.github.io/new_year/`.
4. Cada vez que corrijas una ciudad o un tuit, solo tenés que reemplazar `data.json` y hacer commit — el `index.html` no necesita tocarse.

## Estructura

- `index.html` — la página (countdown en vivo + lista desplegable de las 37 zonas, con botón de copiar por tuit).
- `data.json` — los datos: por cada zona horaria, el offset, las ciudades/países ya ordenados y el texto de cada tuit ya armado (con el saludo, el UTC y el corte en varias partes cuando no entra en 280 caracteres).

## Si querés actualizar los datos

`data.json` es una lista de objetos:

```json
{
  "offset": -3,
  "utc": "UTC-3",
  "cities": ["🇦🇷 Buenos Aires - Argentina (Argentina)", "..."],
  "tweets": ["texto completo del tuit 1", "texto completo del tuit 2 si hizo falta partirlo"]
}
```

Podés editarlo a mano o regenerarlo desde el Excel (`Ciudades_Uso_Horario_2027_CORREGIDO.xlsx`, hoja "Tuits listos").
