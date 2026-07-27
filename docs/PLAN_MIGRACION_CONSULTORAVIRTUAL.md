# 📦 PLAN DE MIGRACIÓN: CONSULTORAVIRTUAL

**Fecha:** 2026-07-27  
**Objetivo:** Reorganizar todos los proyectos bajo la empresa matriz CONSULTORAVIRTUAL  
**Scope:** Carpetas, Git repos, scripts de sync, configuración CLI  
**Risk Level:** 🔴 ALTO (afecta git, rutas en 2 máquinas)  

---

## 📋 CAMBIOS QUE SE VAN A HACER

### **FASE 1: Reorganización de Carpetas (Local Windows)**

```
ANTES:
C:\Users\ferre\Proyectos\PROCESOS BPMN/
├─ aiprocess/
├─ docs/
└─ [otros archivos]

DESPUÉS:
C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL/
├─ /sistemaaiprocess/              ← aiprocess/ renombrado
├─ /misitioweb/                    ← nuevo (basado en landpage/)
├─ /organizacionvirtual/           ← NUEVA (agentes + organigrama)
│  ├─ /agentes/
│  │  ├─ ARQUITECTO/
│  │  ├─ DEV/
│  │  ├─ QA/
│  │  ├─ SECURITY/
│  │  ├─ PM/
│  │  ├─ LEGAL/
│  │  └─ DELIVERY/
│  ├─ MATRIZ_AGENTES.md
│  ├─ ORGANIGRAMA.md
│  └─ PROCESOS_AGENTES.md
├─ /docs/                          ← docs compartidos (empresa-wide)
│  ├─ ESTRATEGIA_AGENCIA_CONSULTORA.md
│  ├─ VISION_CONSULTORAVIRTUAL.md
│  ├─ MATRIZ_AGENTES.md
│  ├─ TOKEN_MANAGEMENT_STRATEGY.md
│  └─ migrations/
└─ .claude/CLAUDE.md               ← Coordinador master (empresa)
```

---

### **FASE 2: Git Repository Changes**

#### **Actual Setup (confuso)**
```
Local: C:\Users\ferre\Proyectos\PROCESOS BPMN\aiprocess
Remote: https://github.com/ferrerpatrixio-dot/APP-PROCESOS.git

Local: C:\Users\ferre\Documentos\APLICACIONES\antigravity\LANDPAGE\landpage
Remote: https://github.com/ferrerpatrixio-dot/landpage-IAenProceso.git
(No sincronizado en Vercel deployment)
```

#### **Objetivo: Monorepo Centralizado**
```
Local: C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL
Remote: https://github.com/ferrerpatrixio-dot/CONSULTORAVIRTUAL.git
  ├─ /sistemaaiprocess/            (subdirectorio en monorepo)
  ├─ /misitioweb/                  (subdirectorio en monorepo)
  └─ /organizacionvirtual/         (subdirectorio en monorepo)

Ventaja: Un solo repo, fácil de sincronizar, claro ownership
```

---

### **FASE 3: Vercel Deployments**

#### **Actual**
```
Proyecto 1: iaaenproceso_landingpage
URL: https://www.aiprocess.cl (LANDPAGE)
Branch: ferrerpatrixio-dot/app → LANDPAGE/

Proyecto 2: (app-procesos probablemente sin Vercel deployment clear)
```

#### **Objetivo**
```
Proyecto 1: CONSULTORAVIRTUAL-misitioweb
URL: https://www.consultoravirtual.cl (o mantener aiprocess.cl)
Branch: ferrerpatrixio-dot/CONSULTORAVIRTUAL → /misitioweb/
Root Dir: ./misitioweb

Proyecto 2: CONSULTORAVIRTUAL-sistemaaiprocess  
URL: https://app-procesos.vercel.app (mantener)
Branch: ferrerpatrixio-dot/CONSULTORAVIRTUAL → /sistemaaiprocess/
Root Dir: ./sistemaaiprocess
```

---

### **FASE 4: VPS Sync Updates**

#### **Actual**
```
VPS: /root/proyectos/aiprocess/
Cron: Auto-pull en login

Script: ~/.bashrc contiene:
  git pull origin main --ff-only
  exitaiprocess alias
```

#### **Objetivo**
```
VPS: /root/proyectos/CONSULTORAVIRTUAL/
Cron: Auto-pull en login (MISMA lógica)

Scripts actualizados:
  /root/proyectos/CONSULTORAVIRTUAL/sistemaaiprocess/
  /root/proyectos/CONSULTORAVIRTUAL/misitioweb/
  
Coordinador: Lee desde /root/proyectos/CONSULTORAVIRTUAL/.claude/CLAUDE.md
```

---

### **FASE 5: Windows PowerShell Sync**

#### **Actual**
```powershell
$PROFILE contiene:
  sync function   → cd PROCESOS\ BPMN, git status, etc.
  status function → git log
  pull function   → git pull origin main --ff-only
```

#### **Objetivo**
```powershell
$PROFILE actualizado:
  sync function   → cd CONSULTORAVIRTUAL, git status, etc.
  status function → git log (MISMA)
  pull function   → git pull origin main --ff-only (MISMA)

Ruta: C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL
```

---

### **FASE 6: Coordinador (.claude/CLAUDE.md)**

#### **Actual**
```
Ubicación: /aiprocess/.claude/CLAUDE.md
Scope: Solo AIProcess
Referencias: docs/FASE_1_STATUS.md
```

#### **Objetivo**
```
Ubicación PRINCIPAL: /CONSULTORAVIRTUAL/.claude/CLAUDE.md
Scope: CONSULTORAVIRTUAL (empresa completa)
Referencias: 
  - docs/ESTRATEGIA_AGENCIA_CONSULTORA.md
  - organizacionvirtual/MATRIZ_AGENTES.md
  - organizacionvirtual/ORGANIGRAMA.md
  
Sub-Coordinadores (opcional):
  - /sistemaaiprocess/.claude/CLAUDE.md (especializado en producto)
  - /misitioweb/.claude/CLAUDE.md (especializado en marketing site)
```

---

## 🔧 PASO A PASO: EJECUCIÓN

### **PASO 1: Backup (CRÍTICO)**
```bash
# Windows - Terminal PowerShell
Copy-Item -Path "C:\Users\ferre\Proyectos\PROCESOS BPMN" `
          -Destination "C:\Users\ferre\Proyectos\PROCESOS BPMN_BACKUP_20260727" `
          -Recurse

# Verificar backup
ls C:\Users\ferre\Proyectos\PROCESOS* 
# Debería mostrar: PROCESOS BPMN (original) + PROCESOS BPMN_BACKUP_20260727
```

---

### **PASO 2: Renombrar Carpeta Principal**
```bash
# Windows PowerShell - ADMIN
cd C:\Users\ferre\Proyectos\
Rename-Item -Path "PROCESOS BPMN" -NewName "CONSULTORAVIRTUAL"

# Verificar
ls C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL
# Debe existir
```

---

### **PASO 3: Renombrar /aiprocess → /sistemaaiprocess**
```bash
# Windows PowerShell
cd C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL\
Rename-Item -Path "aiprocess" -NewName "sistemaaiprocess"

# Verificar
ls C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL\sistemaaiprocess
# Debe existir
```

---

### **PASO 4: Crear Estructura de /organizacionvirtual**
```bash
# Windows PowerShell
cd C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL\

# Crear carpeta raíz
New-Item -ItemType Directory -Path "organizacionvirtual"

# Crear subcarpetas de agentes
$agentes = @("ARQUITECTO", "DEV", "QA", "SECURITY", "PM", "LEGAL", "DELIVERY")
foreach ($agente in $agentes) {
    New-Item -ItemType Directory -Path "organizacionvirtual\agentes\$agente"
    New-Item -ItemType File -Path "organizacionvirtual\agentes\$agente\README.md"
}

# Verificar
ls -R C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL\organizacionvirtual
```

---

### **PASO 5: Crear /misitioweb (from landpage)**
```bash
# Opción A: Copiar el sitio antiguo como base
Copy-Item -Path "C:\Users\ferre\Documentos\APLICACIONES\antigravity\LANDPAGE\landpage\index.html" `
          -Destination "C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL\misitioweb\"

# Después inicializar como Next.js project (será trabajo de DEV Agent)

# Opción B: Crear estructura Next.js limpia
mkdir C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL\misitioweb
cd C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL\misitioweb
npx create-next-app@latest . --typescript --tailwind --no-git
```

---

### **PASO 6: Consolidar /docs a Nivel Empresa**
```bash
# Copiar docs importantes
Copy-Item -Path "C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL\sistemaaiprocess\docs\*" `
          -Destination "C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL\docs\" `
          -Recurse

# Esto mueve ESTRATEGIA, FASE_1_STATUS, etc. a nivel empresa
```

---

### **PASO 7: Crear Coordinador Master**
```bash
# Crear .claude/CLAUDE.md en raíz de CONSULTORAVIRTUAL
# (Lo crearemos en siguiente paso)
```

---

### **PASO 8: Git Initialization**

#### **8.1: Cambiar remote en repo actual**
```bash
cd C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL\sistemaaiprocess

# Ver remote actual
git remote -v
# Output: origin  https://github.com/ferrerpatrixio-dot/APP-PROCESOS.git

# Cambiar a nuevo repo (PENDIENTE CREAR EN GITHUB)
git remote set-url origin https://github.com/ferrerpatrixio-dot/CONSULTORAVIRTUAL.git

# Verificar
git remote -v
```

#### **8.2: Crear nueva estructura git en raíz**
```bash
cd C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL\

# Si no hay .git, crear uno
git init
git remote add origin https://github.com/ferrerpatrixio-dot/CONSULTORAVIRTUAL.git

# Configurar archivo de git
git config user.email "ferrer.patricio@gmail.com"
git config user.name "Patricio Ferrer"

# Agregar todo
git add .

# Primer commit
git commit -m "chore: migrate to CONSULTORAVIRTUAL monorepo structure

- Rename: aiprocess → sistemaaiprocess
- Create: misitioweb (from landpage content)
- Create: organizacionvirtual (agentes + organigrama)
- Consolidate: docs to enterprise level
- Setup: CONSULTORAVIRTUAL as main org container

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"

# Push a GitHub (NECESITA QUE REPO YA EXISTA EN GITHUB)
git push -u origin main
```

---

### **PASO 9: Actualizar VPS**

#### **9.1: Renombrar en VPS**
```bash
# SSH al VPS
ssh root@[VPS_IP]

cd /root/proyectos/
mv aiprocess CONSULTORAVIRTUAL
cd CONSULTORAVIRTUAL

# Verificar
ls
# Debe mostrar: sistemaaiprocess, misitioweb, organizacionvirtual, docs
```

#### **9.2: Actualizar git remote en VPS**
```bash
cd /root/proyectos/CONSULTORAVIRTUAL/sistemaaiprocess
git remote set-url origin https://github.com/ferrerpatrixio-dot/CONSULTORAVIRTUAL.git

# Pull la estructura nueva
git pull origin main
```

#### **9.3: Actualizar ~/.bashrc en VPS**
```bash
# Editar ~/.bashrc
nano ~/.bashrc

# Cambiar:
# OLD: cd /root/proyectos/aiprocess && git pull origin main --ff-only
# NEW:
cd /root/proyectos/CONSULTORAVIRTUAL && git pull origin main --ff-only

# Guardar y salir
```

---

### **PASO 10: Actualizar Windows PowerShell $PROFILE**

```powershell
# Editar $PROFILE (ya existe desde sesión anterior)
# Cambiar rutas:

# OLD: cd "C:\Users\ferre\Proyectos\PROCESOS BPMN"
# NEW: cd "C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL"

# Guardar
```

---

### **PASO 11: Actualizar Vercel Projects**

#### **11.1: Para /misitioweb**
```
Vercel Dashboard:
- Proyecto: CONSULTORAVIRTUAL-misitioweb (nuevo)
- Root Dir: ./misitioweb
- Branch: main
- Comando build: next build
- Comando start: next start
```

#### **11.2: Para /sistemaaiprocess**
```
Vercel Dashboard:
- Proyecto: CONSULTORAVIRTUAL-sistemaaiprocess
- Root Dir: ./sistemaaiprocess
- Branch: main
- Comando build: next build
- Comando start: next start
```

---

## ✅ CHECKLIST FINAL

### **Antes de Ejecutar**
- [ ] Backup creado: `PROCESOS BPMN_BACKUP_20260727`
- [ ] GitHub repo creado: `ferrerpatrixio-dot/CONSULTORAVIRTUAL`
- [ ] Personal Access Token disponible (para git auth)
- [ ] Vercel admin access confirmado
- [ ] VPS SSH acceso disponible

### **Después de Ejecutar**
- [ ] Carpeta renombrada: PROCESOS BPMN → CONSULTORAVIRTUAL ✓
- [ ] aiprocess → sistemaaiprocess ✓
- [ ] /misitioweb/ creada ✓
- [ ] /organizacionvirtual/ creada con agentes ✓
- [ ] /docs/ consolidado ✓
- [ ] Git sync funciona (Windows → GitHub → VPS) ✓
- [ ] Coordinador CLI reconoce nueva estructura ✓
- [ ] Vercel deploys funcionan ✓
- [ ] VPS auto-pull en login funciona ✓

---

## 🎯 RESULTADO FINAL

```
✅ CONSULTORAVIRTUAL es ahora la empresa contenedora
✅ Cada proyecto (/sistemaaiprocess, /misitioweb, /organizacionvirtual) 
   es una división/producto claramente definido
✅ Un solo repo en GitHub (monorepo)
✅ Sincronización automática Windows → GitHub → VPS
✅ Coordinador CLI entiende la estructura completa
✅ Agentes pueden trabajar en paralelo en diferentes divisiones
```

---

## ⚠️ RIESGOS IDENTIFICADOS

| Riesgo | Probabilidad | Mitigación |
|--------|------------|-----------|
| Git history pierde refs | Media | Backup local + GitHub backup |
| Vercel deploy falla | Baja | Test deploy preview primero |
| VPS sync se rompe | Baja | Verificar .bashrc después |
| Coordinador CLI no sincroniza | Media | Actualizar .claude/CLAUDE.md |

---

**ESTADO:** 🟡 PLAN LISTO, PENDIENTE CONFIRMACIÓN  
**PRÓXIMO PASO:** Confirma que proceda (o si hay cambios al plan)

