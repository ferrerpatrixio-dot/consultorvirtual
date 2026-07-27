# ✅ SUITE DE PRUEBAS — SITIO PÚBLICO aiprocess.cl

**Se corre completa antes de cada despliegue a producción.** Ningún ítem se marca sin ejecutar
el comando. Si algo falla, no se despliega: se arregla o se documenta la excepción con nombre y
fecha.

**Duración:** ~15 min automatizado + ~10 min manual.
**Dueño:** QA. **VB final:** PM.

---

## 0 · PREPARAR

```bash
cd C:/Users/ferre/Proyectos/CONSULTORAVIRTUAL/sistemaaiprocess
npm run build && npx next start -p 3002
export BASE=http://localhost:3002     # producción: export BASE=https://aiprocess.cl
export PAGS="/ /test /patricio-ferrer /preguntas-frecuentes /sercotec-mejorar-procesos /privacy /terms /disclaimer"
```

Todo lo que sigue asume `$BASE` y `$PAGS` definidos. **La suite se corre contra `next start`, no
contra `npm run dev`**: en dev el `metadataBase` se reescribe a localhost y los tamaños de JS no
son los reales.

✅ El build termina sin errores de TypeScript ni de ESLint.

---

## 1 · BLOQUEANTES — si uno falla, no se despliega

### 1.1 Canonical autorreferente en cada página

```bash
for p in $PAGS; do
  echo -n "$p → "; curl -s "$BASE$p" | grep -o 'rel="canonical" href="[^"]*"'
done
```

**Esperado:** cada página apunta a **su propia** URL absoluta, con `https://aiprocess.cl`, sin
`www`, sin barra final, sin parámetros.
**Falla conocida (2026-07-27):** `/privacy`, `/terms` y `/disclaimer` devolvían
`href="https://aiprocess.cl"` (la home) por heredar el `alternates` del layout raíz. Ver C-1.

### 1.2 Ningún marcador `[[ ]]` en producción

```bash
for p in $PAGS; do
  n=$(curl -s "$BASE$p" | grep -o '\[\[[^]]*\]\]' | grep -v '\\"' | wc -l)
  echo "$p → $n"
done
curl -s $BASE/llms.txt | grep '\[\['
```

**Esperado:** `0` en todas y **sin salida** en `llms.txt`.
**Nota:** el payload RSC de Next contiene `[[` como sintaxis JSON. Por eso el filtro busca el par
`[[…]]` completo y descarta las líneas escapadas. Ante duda, abrir la página en el navegador.

### 1.3 Títulos y descripciones únicos y dentro de límite

```bash
for p in $PAGS; do
  h=$(curl -s "$BASE$p")
  t=$(echo "$h" | grep -oP '(?<=<title>).*?(?=</title>)')
  d=$(echo "$h" | grep -oP '(?<=name="description" content=")[^"]*')
  echo "$p | ${#t} | $t"
  echo "     desc ${#d}"
done
```

**Esperado:** `title` ≤ 60, `description` ≤ 155, y **ninguno repetido entre páginas**.
Los valores aprobados están en `docs/SEO-GEO-WEB-NUEVA.md §3`.

### 1.4 Un solo H1 y jerarquía sin saltos

```bash
for p in $PAGS /no-existe; do
  echo -n "$p → "; curl -s "$BASE$p" | grep -oE '<h[1-6][ >]' | tr -d '<> ' | tr '\n' ' '; echo
done
```

**Esperado:** exactamente un `h1`, al principio, y ningún salto (`h1→h3` sin `h2` de por medio)
**dentro del contenido**. Los `h3` finales son los del footer.

### 1.5 El contenido existe sin ejecutar JavaScript

```bash
curl -s $BASE/ | grep -c "perdiendo plata"
curl -s $BASE/preguntas-frecuentes | grep -c "No cotizo a ciegas"
curl -s $BASE/patricio-ferrer | grep -c "Universidad Técnica Federico Santa María"
```

**Esperado:** ≥1 en las tres. Si da 0, el copy depende de JS y los rastreadores de IA no lo leen.

---

## 2 · VERACIDAD — la categoría que más ha costado

### 2.1 Certificaciones, normas y cumplimiento

```bash
for p in $PAGS; do
  curl -s "$BASE$p" | grep -oiE "iso [0-9]+|soc ?2|pci|hipaa|gdpr|certificad[oa]s?|acreditad[oa]|premiad[oa]|cumplimos|cumple la ley|conforme a la ley" | sort -u | sed "s|^|$p → |"
done
```

**Esperado:** vacío, **o** cada coincidencia con VB escrito de LEGAL registrado en
`organizacionvirtual/agentes/LEGAL/REGLA-CLAIMS-PUBLICOS.md`.
Recordar la distinción de esa regla: una certificación del proveedor se menciona **atribuida**,
nunca en primera persona.

### 2.2 Cifras de resultado, casos y testimonios

```bash
for p in $PAGS; do
  curl -s "$BASE$p" | grep -oE "[0-9]+ ?%|[0-9]+ (clientes|empresas|proyectos|casos)|ahorr[oó] [0-9]|redu(jo|cción) de [0-9]" | sed "s|^|$p → |"
done
```

**Esperado:** vacío. **No hay clientes**: cualquier cifra de resultado es inventada por
definición. Excepción legítima: cifras de fuentes externas en `/sercotec-mejorar-procesos`,
que deben ir con fuente y fecha visibles en la misma página.

### 2.3 Precios

```bash
for p in $PAGS; do curl -s "$BASE$p" | grep -oE '\$ ?[0-9][0-9.,]*|UF ?[0-9]' | sed "s|^|$p → |"; done
```

**Esperado:** vacío. El sitio no publica precios (decisión de producto, no de SEO).

### 2.4 Promesas de resultado

Revisión manual, no hay comando. Leer el copy nuevo del despliegue y buscar: *garantizamos,
te aseguro, vas a ahorrar, en X semanas tendrás*. Reformular a lo que efectivamente se entrega.

### 2.5 Coherencia de la frase de entidad

```bash
grep -c "consultora chilena de optimización de procesos" \
  src/lib/site.ts public/llms.txt
curl -s $BASE/patricio-ferrer | grep -c "consultora chilena de optimización de procesos"
```

**Esperado:** ≥1 en los tres. Debe ser **literalmente** la misma redacción en el JSON-LD, en
`llms.txt`, en `/patricio-ferrer` y en `/preguntas-frecuentes`. Tres redacciones distintas de lo
mismo le enseñan al modelo que no estamos seguros de qué somos.

---

## 3 · LENGUAJE

```bash
for p in $PAGS; do
  curl -s "$BASE$p" | sed 's/<script[^>]*>.*<\/script>//g; s/<[^>]*>/ /g' \
  | grep -oiE "transformación digital|sinergia|escalabilidad|innovación|solución integral|partner estratégico|quick wins" \
  | sed "s|^|$p → |"
done
```

**Esperado:** vacío.
**Ojo:** `src/lib/curated-library.ts` y `src/lib/guide.ts` contienen "quick wins" para el
back-office. Hoy no llega a la web pública; si alguna vez se importan desde una página pública,
esta prueba lo va a cazar.

---

## 4 · DATOS ESTRUCTURADOS

### 4.1 Todo el JSON-LD parsea

```bash
for p in $PAGS; do
  curl -s "$BASE$p" | grep -oP '(?<=<script type="application/ld\+json">).*?(?=</script>)' \
  | while read -r j; do echo "$j" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const o=JSON.parse(s);console.log("  OK",JSON.stringify(o["@type"]||(o["@graph"]||[]).map(x=>x["@type"])))}catch(e){console.log("  ERROR",e.message)}})'; done | sed "s|^|$p|"
done
```

**Esperado:** `OK` en todos. Tipos esperados: `[Organization, ProfessionalService]`, `Person`,
`Service`, `WebSite` en todas; `FAQPage` además en `/preguntas-frecuentes` y `/sercotec-mejorar-procesos`.

### 4.2 El FAQPage coincide **literalmente** con el texto visible

```bash
node -e '
const B=process.env.BASE;
(async()=>{for(const p of ["/preguntas-frecuentes","/sercotec-mejorar-procesos"]){
 const h=await (await fetch(B+p)).text();
 const faq=[...h.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
   .map(m=>JSON.parse(m[1])).find(b=>b["@type"]==="FAQPage");
 const vis=h.replace(/<script[\s\S]*?<\/script>/g,"").replace(/<[^>]+>/g," ")
   .replace(/&#x27;/g,"\u0027").replace(/&amp;/g,"&").replace(/&quot;/g,"\u0022")
   .replace(/&#([0-9]+);/g,(m,d)=>String.fromCharCode(d)).replace(/\s+/g," ");
 let bad=0;
 for(const q of faq.mainEntity){
   if(!vis.includes(q.name)){console.log("  PREGUNTA NO VISIBLE:",q.name);bad++}
   if(!vis.includes(q.acceptedAnswer.text)){console.log("  RESPUESTA NO COINCIDE:",q.name);bad++}
 }
 console.log(p,faq.mainEntity.length,"preguntas,",bad,"diferencias");
}})()'
```

**Esperado:** `0 diferencias`. Marcar preguntas que no están en la página, o con la respuesta
distinta, es motivo de acción manual de Google.
**Baseline 2026-07-27:** 17 preguntas y 4 preguntas, 0 diferencias.

### 4.3 Propiedades que deben estar

```bash
curl -s $BASE/ | grep -oP '(?<=<script type="application/ld\+json">).*?(?=</script>)' \
| node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{
 const g=JSON.parse(s)["@graph"];
 for(const n of g){const t=[].concat(n["@type"]).join("+");
  const falta=["logo","image","sameAs"].filter(k=>t.includes("Organization")&&!n[k])
   .concat(["image","sameAs","jobTitle"].filter(k=>t==="Person"&&!n[k]));
  console.log(t, falta.length?"FALTA: "+falta.join(", "):"completo");}})'
```

**Esperado:** `completo` en `Organization` y `Person`. Baseline 2026-07-27: `Organization`
faltaba `logo`, `image` y `sameAs` (hallazgo A-7).

### 4.4 Validadores externos (manual, día del despliegue)

- Prueba de resultados enriquecidos de Google: `https://search.google.com/test/rich-results`
- Validador de Schema.org: `https://validator.schema.org/`
- Depurador de enlaces de LinkedIn (Open Graph): debe mostrar título, descripción e imagen 1200×630

**Esperado:** cero errores. Las advertencias se anotan en el informe, no se ignoran en silencio.

---

## 5 · CRAWL E INDEXACIÓN

### 5.1 robots.txt

```bash
curl -s $BASE/robots.txt
```

**Esperado:** `Allow: /`; `Disallow` para `/api/ /dashboard /nuevo /proyectos/ /actividad`; los 11
rastreadores de IA permitidos a propósito; `Sitemap:` apuntando a `https://aiprocess.cl/sitemap.xml`.
Debe coincidir con `SEO-GEO-WEB-NUEVA.md §5.5`.

### 5.2 sitemap.xml

```bash
curl -s $BASE/sitemap.xml | grep -oP '(?<=<loc>)[^<]*'
```

**Esperado:** exactamente las 8 URLs públicas. **Cero** ocurrencias de `/dashboard`, `/nuevo`,
`/proyectos`, `/actividad`, `/api`. Toda URL del sitemap tiene que ser canónica de sí misma
(cruzar con 1.1: si una está en el sitemap y su canonical apunta a otra parte, es incoherencia).

### 5.3 Rutas internas fuera del índice

```bash
for r in /dashboard /nuevo /actividad; do
  echo -n "$r → "; curl -s -o /dev/null -w "%{http_code} " "$BASE$r"
  curl -sL "$BASE$r" | grep -c noindex
done
```

**Esperado:** `307`/`302` (redirige a login o a `/`) **o** `200` con `noindex` presente.
Un `200` sin `noindex` es un fallo.

### 5.4 404 real

```bash
curl -s -o /tmp/404.html -w "%{http_code}\n" "$BASE/no-existe"
grep -o 'name="robots" content="[^"]*"' /tmp/404.html
grep -c 'href="/test"' /tmp/404.html
```

**Esperado:** código **404** (no 200), `noindex`, y salida al inicio y al test.

### 5.5 Enlaces internos

```bash
for p in $PAGS; do curl -s "$BASE$p" | grep -oE 'href="/[^"#?]*"' | sed 's/href="//;s/"//'; done \
| grep -v '^/_next' | sort -u \
| while read u; do echo "$(curl -s -o /dev/null -w '%{http_code}' "$BASE$u") $u"; done | grep -v '^200'
```

**Esperado:** sin salida (todo 200).

```bash
grep -rn "app-procesos.vercel.app" src/ public/
```

**Esperado:** sin salida. Nunca se enlaza al dominio de Vercel desde el sitio público.

### 5.6 Dominio y protocolo (solo en producción)

```bash
curl -sI http://www.aiprocess.cl  | grep -iE '^HTTP|^location'
curl -sI http://aiprocess.cl      | grep -iE '^HTTP|^location'
curl -sI https://aiprocess.cl/test/ | grep -iE '^HTTP|^location'
```

**Esperado:** `301` a `https://aiprocess.cl/…` en los tres casos (www → apex, http → https,
barra final → sin barra final). No verificable en local.

---

## 6 · MÓVIL (375 px)

Pegar en la consola del navegador con la ventana en 375×812, una vez por página:

```js
(()=>{const de=document.documentElement;
const chico=[...document.querySelectorAll('p,li,span,dd,dt,td,th,a')]
  .filter(e=>e.textContent.trim()&&parseFloat(getComputedStyle(e).fontSize)<16);
const taps=[...document.querySelectorAll('a,button,input,select')]
  .map(e=>({t:e.textContent.trim().slice(0,30),h:Math.round(e.getBoundingClientRect().height)}))
  .filter(x=>x.h>0&&x.h<44);
return {desborde: de.scrollWidth-375, texto_bajo_16px: chico.length, tap_bajo_44px: taps.length, taps};})()
```

| Comprobación | Esperado | Baseline 2026-07-27 |
|---|---|---|
| `desborde` | **0** | 0 en las 9 páginas ✅ |
| `texto_bajo_16px` | 0 ideal | 35–49 por página (14 px y 12 px) ⚠️ M-2 |
| `tap_bajo_44px` | 0 ideal | 16–23 por página (nav 17 px, footer 17 px) ⚠️ A-6 |

Cualquier valor **peor que el baseline** es una regresión y bloquea el despliegue. Igualarlo se
acepta mientras A-6 y M-2 sigan abiertos.

Manual, con el celular real: recorrer `/` y `/test` completos y hacer el test de principio a fin.

---

## 7 · RENDIMIENTO

### 7.1 Peso de las imágenes

```bash
ls -l public/fotos/ public/marca/ | awk '$5>200000 {print "PESA DE MÁS:",$9,$5}'
find public src/app -name "*.png" -o -name "*.jpg" -o -name "*.webp" | xargs ls -l | awk '{print $5, $9}' | sort -rn | head
```

**Esperado:** ninguna sobre 200 KB. Baseline: 126 / 85 / 65 / 51 KB, todas WebP. ✅

### 7.2 JavaScript servido por página

```bash
for p in / /test /privacy; do js=0
  for s in $(curl -s "$BASE$p" | grep -oE 'src="/_next/static/[^"]+\.js"' | sed 's/src="//;s/"//' | sort -u); do
    js=$((js+$(curl -s -H "Accept-Encoding: gzip" "$BASE$s" | wc -c))); done
  echo "$p → ${js} B gzip"; done
```

**Baseline 2026-07-27:** `/` 197 KB · `/test` 200 KB · `/privacy` 193 KB.
**Esperado:** no crecer más de ~10 % sobre el baseline. Si sube, buscar un `'use client'` nuevo:

```bash
grep -rln "use client" src/ | grep -v "(app)"
```

Baseline: solo `error.tsx`, `global-error.tsx`, `test/TestClient.tsx`, `components/ProcessMap.tsx`.

### 7.3 Core Web Vitals (manual, día del despliegue)

PageSpeed Insights **en móvil** sobre `/` y `/test`. Objetivo: LCP < 2,5 s · CLS < 0,1 · INP < 200 ms.
**Anotar los números en el informe, no la impresión.** Si no se corrió, se escribe "no medido".

---

## 8 · ACCESIBILIDAD

```bash
for p in $PAGS; do
  echo -n "$p imgs sin alt → "; curl -s "$BASE$p" | grep -o '<img[^>]*>' | grep -vc 'alt='
done
```

**Esperado:** `0`. `alt=""` solo en decorativas.

Manual:
- Recorrer `/` y `/test` **solo con `Tab`**: el foco tiene que verse siempre y el orden ser lógico.
- Cada campo del test con `<label for>`, `aria-label` o `<fieldset>`+`<legend>`.
  **Falla conocida:** `TestClient.tsx:185,189` — `<label>` huérfano sobre grupos de botones (M-6).
- Lighthouse → Accesibilidad ≥ 90. Anotar el número.
- Consola del navegador sin advertencias de contenido mixto.

---

## 9 · EL DÍA DEL DESPLIEGUE

```
□ Suite 1-8 completa, sin bloqueantes abiertos
□ VB de LEGAL sobre cualquier texto público nuevo (REGLA-CLAIMS-PUBLICOS)
□ VB de PM
□ Desplegar
□ Repetir §1, §5 y §7.3 contra https://aiprocess.cl (no contra localhost)
□ Sitemap enviado en Google Search Console
□ Sitemap enviado en Bing Webmaster Tools
□ Compartir la home en LinkedIn y verificar la tarjeta OG
□ Anotar en el informe de QA los números de PageSpeed y Lighthouse obtenidos
```

```
RESULTADO — Fecha ____ · Commit ____ · Ejecutó ____
§1 Bloqueantes __ · §2 Veracidad __ (VB LEGAL ____) · §3 Lenguaje __
§4 Datos estruct. __ (FAQ __/__ coinciden) · §5 Crawl __
§6 Móvil: desborde __ texto<16px __ tap<44px __
§7 JS: / __ KB · /test __ KB · LCP __ CLS __ INP __ · §8 a11y __
VEREDICTO: □ APTO  □ APTO CON RESERVAS (____)  □ NO APTO
```

---

*Dueño: agente QA · Se actualiza cuando se agrega una página pública nueva*
