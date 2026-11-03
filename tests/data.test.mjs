// Revisa que data.json tenga la forma que espera index.html.
// Se corre con: npm run test:data
import { readFileSync } from 'node:fs';

const data = JSON.parse(readFileSync(new URL('../data.json', import.meta.url), 'utf8'));
const errors = [];
const fail = (msg) => errors.push(msg);

if (!Array.isArray(data) || data.length === 0) fail('data.json debe ser una lista no vacía');

const seenOffsets = new Set();
let prev = Infinity;
for (const [i, z] of data.entries()) {
  const where = `zona #${i}`;
  if (typeof z.offset !== 'number' || !Number.isFinite(z.offset)) { fail(`${where}: offset no numérico`); continue; }
  if (z.offset < -12 || z.offset > 14) fail(`${where}: offset ${z.offset} fuera de rango (-12…+14)`);
  if ((z.offset * 4) % 1 !== 0) fail(`${where}: offset ${z.offset} no es múltiplo de 15 min`);
  if (seenOffsets.has(z.offset)) fail(`${where}: offset ${z.offset} repetido`);
  seenOffsets.add(z.offset);
  if (z.offset >= prev) fail(`${where}: no está en orden descendente (${prev} → ${z.offset})`);
  prev = z.offset;

  if (!Array.isArray(z.cities) || z.cities.length === 0) { fail(`${where} (UTC${z.offset}): sin ciudades`); continue; }
  const seen = new Set();
  for (const c of z.cities) {
    if (typeof c !== 'string' || !c.trim()) fail(`UTC${z.offset}: ciudad vacía o no es texto`);
    else {
      if (seen.has(c)) fail(`UTC${z.offset}: ciudad repetida «${c}»`);
      seen.add(c);
      if (/[<>]/.test(c)) fail(`UTC${z.offset}: «${c}» tiene < o >, revisar`);
      if (!c.includes(' - ')) fail(`UTC${z.offset}: «${c}» no sigue el formato «ciudad - país»`);
    }
  }
}

if (errors.length) {
  console.error(`✗ data.json: ${errors.length} problema(s)\n  - ` + errors.join('\n  - '));
  process.exit(1);
}
console.log(`✓ data.json: ${data.length} husos horarios, ${data.reduce((n, z) => n + z.cities.length, 0)} ciudades, todo en orden`);
