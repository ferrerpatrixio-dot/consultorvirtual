# ✅ CHECKLIST MIGRACIÓN CONSULTORAVIRTUAL

**Fecha:** 2026-07-27  
**Status:** EN PROGRESO (Paso 5 de 11)

---

## 🟢 COMPLETADO

- [x] Backup creado: `PROCESOS BPMN_BACKUP_20260727`
- [x] `/organizacionvirtual/agentes/` creada (7 agentes)
- [x] MATRIZ_AGENTES.md creado
- [x] ORGANIGRAMA.md creado
- [x] Coordinador Master (.claude/CLAUDE.md) creado
- [x] README de cada agente creado

---

## 🟡 PENDIENTE: PASO 6-11

### **PASO 6: Cierra procesos abiertos** ⬅️ TÚ
```
Acciones:
- [ ] Cierra VS Code (si tiene carpeta abierta)
- [ ] Cierra cualquier terminal en PROCESOS BPMN
- [ ] Si Claude Code está corriendo: escribe `exit`
- [ ] Cierra Dropbox/OneDrive temporal sync
```

### **PASO 7: Renombrar carpeta principal** (Windows PowerShell como ADMIN)
```powershell
cd C:\Users\ferre\Proyectos\
Rename-Item -Path "PROCESOS BPMN" -NewName "CONSULTORAVIRTUAL"

# Verificar
ls CONSULTORAVIRTUAL
# Debe mostrar: organizacionvirtual, sistemaaiprocess (después), docs, .claude, etc.
```

### **PASO 8: Renombrar aiprocess → sistemaaiprocess** (Windows PowerShell)
```powershell
cd C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL\
Rename-Item -Path "aiprocess" -NewName "sistemaaiprocess"

# Verificar
ls sistemaaiprocess
```

### **PASO 9: Crear /misitioweb** (Windows PowerShell)
```powershell
cd C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL\

# Opción A: Copiar landpage como base (rápido)
Copy-Item -Path "C:\Users\ferre\Documentos\APLICACIONES\antigravity\LANDPAGE\landpage\index.html" `
          -Destination "misitioweb\"

# Opción B: Crear estructura Next.js limpia (mejor)
mkdir misitioweb
cd misitioweb
npx create-next-app@latest . --typescript --tailwind --no-git

# Elegir Opción B (mejor para futuro)
```

### **PASO 10: Actualizar PowerShell $PROFILE**
```powershell
# Editar $PROFILE (ya editado antes)
notepad $PROFILE

# Cambiar todas las referencias:
# OLD: "C:\Users\ferre\Proyectos\PROCESOS BPMN"
# NEW: "C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL"

# Guardar y cerrar notepad
# Recargar profile:
. $PROFILE
```

### **PASO 11: GitHub - Crear Repo Centralizado**
```
Acciones en GitHub (browser):
- [ ] Ir a https://github.com/ferrerpatrixio-dot
- [ ] Click "New"
- [ ] Nombre: CONSULTORAVIRTUAL
- [ ] Descripción: "Empresa consultora virtual - productos + agentes"
- [ ] Public o Private (recomendado: Private)
- [ ] Click "Create"
- [ ] Copiar URL: https://github.com/ferrerpatrixio-dot/CONSULTORAVIRTUAL.git
```

### **PASO 12: Inicializar Git en CONSULTORAVIRTUAL**
```powershell
cd C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL\

# Init repo
git init
git config user.email "ferrer.patricio@gmail.com"
git config user.name "Patricio Ferrer"

# Add remote (copiar URL de GitHub)
git remote add origin https://github.com/ferrerpatrixio-dot/CONSULTORAVIRTUAL.git

# Agregar todo
git add .

# Primer commit
git commit -m "chore: Migrate to CONSULTORAVIRTUAL monorepo

- Rename: aiprocess → sistemaaiprocess
- Create: organizacionvirtual (7 agentes)
- Create: misitioweb (from landpage)
- Create: .claude/CLAUDE.md (Coordinador master)
- Setup: Enterprise-level structure

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"

# Push
git push -u origin main
```

### **PASO 13: Actualizar VPS**
```bash
# SSH al VPS
ssh root@[VPS_IP]

cd /root/proyectos/

# Renombrar
mv aiprocess CONSULTORAVIRTUAL
cd CONSULTORAVIRTUAL

# Cambiar remote
cd sistemaaiprocess
git remote set-url origin https://github.com/ferrerpatrixio-dot/CONSULTORAVIRTUAL.git

# Pull nueva estructura
git pull origin main

# Verificar ~/.bashrc (auto-pull en login)
# Debe tener: cd /root/proyectos/CONSULTORAVIRTUAL && git pull origin main --ff-only
```

### **PASO 14: Verificar Sincronización**
```powershell
# Windows
cd C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL\
git status

# VPS
ssh root@[VPS_IP]
cd /root/proyectos/CONSULTORAVIRTUAL/
git status

# Ambos deben estar limpios (no uncommitted changes)
```

### **PASO 15: Actualizar Vercel Projects**
```
En Vercel Dashboard:
- [ ] Buscar proyecto: "iaaenproceso_landingpage"
- [ ] Settings → Root Directory → cambiar a "./misitioweb"
- [ ] Guardar (auto-redeploy)

- [ ] Crear nuevo proyecto: "CONSULTORAVIRTUAL-sistemaaiprocess"
- [ ] Root Directory: "./sistemaaiprocess"
- [ ] Branch: main
- [ ] Build: next build
- [ ] Guardar
```

---

## 📋 RESUMEN VISUAL

**Antes:**
```
C:\Users\ferre\Proyectos\PROCESOS BPMN\
├─ aiprocess/
├─ docs/
└─ [suelto]
```

**Después:**
```
C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL/
├─ /sistemaaiprocess/ (fue aiprocess)
├─ /misitioweb/ (nuevo)
├─ /organizacionvirtual/ (7 agentes)
├─ /docs/ (compartido)
├─ .claude/CLAUDE.md (Coordinador)
└─ .git (monorepo)
```

---

## 🎯 PRÓXIMOS PASOS (Después de Migración)

1. **VPS CLI:** `cd /root/proyectos/CONSULTORAVIRTUAL && claude`
2. **Windows CLI:** `cd C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL && claude`
3. **Coordinador:** Automáticamente leerá `.claude/CLAUDE.md` de la empresa
4. **Agentes:** Pueden leer `organizacionvirtual/MATRIZ_AGENTES.md` para entender sus roles

---

## ⚠️ ROLLBACK (Si falla algo)

Si algo sale mal:
1. Cierra todo
2. Delete `C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL\`
3. Rename back `C:\Users\ferre\Proyectos\PROCESOS BPMN_BACKUP_20260727\` → `C:\Users\ferre\Proyectos\PROCESOS BPMN\`
4. VPS: `mv /root/proyectos/CONSULTORAVIRTUAL_backup /root/proyectos/aiprocess` (si hiciste backup)

---

## ✅ CUANDO TERMINES TODO

```
Confirmación:
- [ ] Puedo hacer: cd C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL\
- [ ] Veo carpetas: sistemaaiprocess, misitioweb, organizacionvirtual, docs
- [ ] Claude CLI funciona: cd CONSULTORAVIRTUAL && claude
- [ ] Coordinador responde: "Revisa organizacionvirtual/MATRIZ_AGENTES.md"
- [ ] VPS funciona: cd /root/proyectos/CONSULTORAVIRTUAL/ (auto-pull en login)
- [ ] GitHub repo sincronizado: https://github.com/ferrerpatrixio-dot/CONSULTORAVIRTUAL
```

Cuando TODOS los checkmarks ✅ estén marcados → **MIGRACIÓN COMPLETADA** 🚀

---

**Avísame cuando termines PASO 6 (cerrar procesos) y seguimos.**
