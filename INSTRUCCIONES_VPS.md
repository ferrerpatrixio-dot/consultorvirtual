# 🖥️ INSTRUCCIONES PARA VPS

**Fecha:** 2026-07-27  
**Objetivo:** Sincronizar VPS con nueva estructura CONSULTORAVIRTUAL

---

## 📋 PASOS EN VPS

### **PASO 1: SSH al VPS**
```bash
ssh root@[TU_IP_VPS]
```

### **PASO 2: Backup de estructura antigua**
```bash
cd /root/proyectos/
mv aiprocess aiprocess_backup_20260727
ls
# Debe mostrar: aiprocess_backup_20260727 (viejo)
```

### **PASO 3: Clone de GitHub CONSULTORAVIRTUAL**
```bash
# Clone monorepo
git clone https://github.com/ferrerpatrixio-dot/CONSULTORAVIRTUAL.git
cd CONSULTORAVIRTUAL

# Verificar estructura
ls
# Debe mostrar:
# organizacionvirtual/
# sistemaaiprocess/
# misitioweb/
# docs/
# .claude/
```

### **PASO 4: Actualizar ~/.bashrc**

Edita `~/.bashrc`:
```bash
nano ~/.bashrc
```

Busca la línea que dice:
```bash
cd /root/proyectos/aiprocess && git pull origin main --ff-only
```

Reemplázala por:
```bash
cd /root/proyectos/CONSULTORAVIRTUAL && git pull origin main --ff-only
```

Guarda (Ctrl+O, Enter, Ctrl+X) y recarga:
```bash
source ~/.bashrc
```

### **PASO 5: Verificar Auto-Pull**

```bash
# Salir del VPS y volver a entrar
exit

ssh root@[TU_IP_VPS]

# Debe auto-pullear automáticamente
# Veras: "Already up to date" o cambios nuevos
```

### **PASO 6: Verificar Coordinador en VPS**

```bash
cd /root/proyectos/CONSULTORAVIRTUAL
ls -la .claude/

# Debe mostrar: CLAUDE.md
cat .claude/CLAUDE.md | head -20
```

### **PASO 7: Iniciar Claude CLI en VPS**

```bash
cd /root/proyectos/CONSULTORAVIRTUAL
claude

# Debería entrar al Coordinador master
# Prueba: "Revisa organizacionvirtual/MATRIZ_AGENTES.md"
```

---

## ✅ CHECKLIST VPS

- [ ] SSH al VPS funciona
- [ ] Backup de aiprocess_backup creado
- [ ] CONSULTORAVIRTUAL clonado desde GitHub
- [ ] ~/.bashrc actualizado con nueva ruta
- [ ] Auto-pull en login funciona
- [ ] .claude/CLAUDE.md existe en VPS
- [ ] Claude CLI inicia desde CONSULTORAVIRTUAL
- [ ] Coordinador responde correctamente

---

## 🔗 SINCRONIZACIÓN BIDIRECCIONAL

**Windows → GitHub → VPS**

```
1. Windows: Cambios locales
   └─ git add + git commit + git push origin main

2. GitHub: Repositorio central
   └─ feererpatrixio-dot/CONSULTORAVIRTUAL (main branch)

3. VPS: Auto-pull en login
   └─ git pull origin main --ff-only
```

---

## 🚀 ONCE COMPLETE

Una vez que todo esté sincronizado en VPS:

1. **Windows:**
   ```powershell
   cd C:\Users\ferre\Proyectos\CONSULTORAVIRTUAL
   consultor  # Function: cd + claude
   ```

2. **VPS:**
   ```bash
   cd /root/proyectos/CONSULTORAVIRTUAL
   claude
   ```

**Ambos ven:**
- Mismos archivos (via git)
- Mismo Coordinador (.claude/CLAUDE.md)
- Mismos agentes (organizacionvirtual/)
- Mismos productos (sistemaaiprocess, misitioweb)

---

## 🚨 TROUBLESHOOTING

### **Error: "git remote not configured"**
```bash
cd /root/proyectos/CONSULTORAVIRTUAL/sistemaaiprocess
git remote add origin https://github.com/ferrerpatrixio-dot/CONSULTORAVIRTUAL.git
git pull origin main
```

### **Error: "Permission denied (publickey)"**
Configurar SSH key en GitHub:
```bash
cat ~/.ssh/id_rsa.pub
# Copiar y agregar en GitHub → Settings → SSH Keys
```

### **Auto-pull no funciona**
Editar `~/.bashrc` y verificar que la línea esté correcta:
```bash
grep "git pull" ~/.bashrc
```

---

**Estado:** 🟢 LISTO PARA VPS  
**Ejecuta pasos cuando tengas acceso VPS**
