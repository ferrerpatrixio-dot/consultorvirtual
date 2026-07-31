# 🔄 SOP: BACKUP & RECOVERY — CONSULTORAVIRTUAL

**Propósito:** Asegurar recuperabilidad de datos, código e infraestructura ante fallos.  
**Actualizado:** 2026-07-31  
**Responsables:** DELIVERY (rollback infraestructura), SECURITY (auditoría integridad)

---

## 1. BACKUP STRATEGY (¿Qué respaldar?)

### A. Código & Configuración
| Componente | Storage | Frecuencia | RPO | Responsable |
|-----------|---------|-----------|-----|-------------|
| Git repos (sistemaaiprocess, misitioweb) | GitHub | Continuo (push) | 0 min | DEV/DELIVERY |
| .claude/ configs (agents, CLAUDE.md, etc.) | GitHub | Con cada cambio | 0 min | PMcoordinador |
| Supabase schema + migrations | Git (SQL files) | Cada deploy | 1 hora | DEV/DELIVERY |
| Vercel deployments | Vercel (auto) | Auto (12 últimas) | N/A | DELIVERY |
| Environment variables (.env) | 1Password/Vault | Manual (Patricio) | 24h | SECURITY |

### B. Datos (Bases de datos)
| Componente | Storage | Frecuencia | RPO | Responsable |
|-----------|---------|-----------|-----|-------------|
| Supabase PostgreSQL (AIProcess) | Supabase automated backups | Diario | 24h | DELIVERY |
| Supabase relational data | Supabase PITR (point-in-time restore) | 7 días | Varies | DELIVERY |
| User data (Ley 19.628) | Encrypted in Supabase | Audited | 24h | SECURITY |

### C. Artifacts & Documentación
| Componente | Storage | Frecuencia | RPO | Responsable |
|-----------|---------|-----------|-----|-------------|
| BITACORA-CAMBIOS.md | GitHub | Con cada auditoría | 1 semana | PMcoordinador |
| Memory files (/memory/) | GitHub | Sesión a sesión | 1 día | PMcoordinador |
| Design assets (UI) | sistemaaiprocess/design-system/ | Con cada cambio | 0 min | DISEÑADOR-UX |

---

## 2. RECOVERY PROCEDURES (¿Cómo volver atrás?)

### A. Git Rollback (Código)
**Escenario:** "Hicimos un commit malo y necesitamos revertir"

**Responsable:** DEV  
**SLA:** 15 minutos (si es en desarrollo), 30 minutos (si es en producción)

**Pasos:**
```bash
# 1. Identificar commit a revertir
git log --oneline | head -20

# 2. Opción A: Revert (crear nuevo commit que deshace cambios)
git revert <commit-hash>
git push

# 3. Opción B: Reset (si commit aún no está en producción)
git reset --hard <commit-anterior>
git push --force  # CUIDADO: solo en rama de desarrollo

# 4. Verificar
git log --oneline | head -5
```

**Validación posterior:** QA debe ejecutar smoke tests (5 min).

### B. Vercel Deployment Rollback
**Escenario:** "Deploy a producción broke the site"

**Responsable:** DELIVERY  
**SLA:** 5 minutos

**Pasos:**
1. Ir a Vercel dashboard
2. Deployments → Select previous working deployment
3. Click "Promote to Production"
4. QA valida en producción inmediatamente

**Verificación:**
```bash
# Ping site
curl -I https://misitioweb.cl  # Should return 200
curl -I https://aiprocess.cl   # Should return 200
```

### C. Supabase Data Recovery (Base de datos)
**Escenario:** "Datos se corrompieron o usuario borró información crítica"

**Responsable:** DELIVERY  
**SLA:** 1 hora (restore a point-in-time)  
**Retention:** 7 días (Supabase free tier), 30 días (paid)

**Pasos:**
1. Acceder Supabase dashboard
2. Database → Backups → Point-in-time recovery
3. Seleccionar fecha/hora anterior al incidente
4. Initiate restore
5. SECURITY valida: Ley 19.628 compliance

**Validación post-restore:**
```sql
-- Sample queries para verificar integridad
SELECT COUNT(*) FROM usuarios;
SELECT COUNT(*) FROM proyectos;
SELECT MAX(created_at) FROM audit_log;
```

### D. Complete Disaster Recovery (Todo perdido)
**Escenario:** "Servidor destruido, necesitamos reconstruir"

**Responsable:** DELIVERY + ARQUITECTO  
**SLA:** 8 horas  
**Steps:**
1. Clonar repo desde GitHub
2. Restaurar database desde Supabase backups (7 días atrás máximo)
3. Re-deploy a Vercel
4. Valida: QA + SECURITY

---

## 3. PREVENTION (¿Cómo evitar desastres?)

### A. Change Management
- Todos los cambios → commit a git (no overwrite sin log)
- Deployments → DELIVERY valida (test en staging primero)
- Datos sensibles → SECURITY audita acceso

### B. Monitoring & Alerts
| Métrica | Alert Threshold | Responsable |
|---------|-----------------|-------------|
| Supabase backup age | >24h sin backup | DELIVERY |
| Vercel deployment status | Failed deploy | DELIVERY |
| Git push frequency | No commits en 7 días | PMcoordinador |
| Database size | >90% quota | DEV |
| Ley 19.628 audit | Missed monthly audit | SECURITY |

### C. Testing
- **Staging environment:** Todos los deploys → test en staging ANTES de producción
- **Smoke tests:** Después de rollback o recovery
- **Data validation:** Después de database restore

---

## 4. BACKUP VERIFICATION (¿Están los backups realmente OK?)

**Tarea mensual (DELIVERY + SECURITY):**

**Checklist:**
- [ ] Supabase: Verify last backup timestamp (<24h)
- [ ] Supabase: Test point-in-time restore (no producción)
- [ ] Vercel: Verify deployment history (>5 previous available)
- [ ] GitHub: Verify all branches synced
- [ ] Encryption: Verify secrets are NOT in git
- [ ] Documentation: BITACORA-CAMBIOS.md updated with recovery tests

**Report:** Send summary to Patricio + PMcoordinador

---

## 5. CONTACTS & ESCALATION

**If disaster happens:**

1. **Immediate:** Contact DELIVERY (infraestructura)
2. **If data loss:** Contact SECURITY (compliance validation)
3. **If cascading failure:** Escalate to Patricio

**Contact:** ferrer.patricio@gmail.com

---

## 6. TESTING SCHEDULE

| Test | Frequency | Responsable | Next Due |
|------|-----------|-------------|----------|
| Git rollback (sandbox) | Monthly | DEV | 2026-08-31 |
| Vercel rollback (staging) | Monthly | DELIVERY | 2026-08-31 |
| Supabase restore (test DB) | Quarterly | DELIVERY | 2026-10-31 |
| Full disaster recovery simulation | Yearly | DELIVERY + ARQUITECTO | 2027-07-31 |

---

*Versión: 1.0*  
*Última actualización: 2026-07-31*  
*Próxima revisión: 2026-08-31*
