# Testing Documentation

## Tests Implementados

Este proyecto incluye tests completos para todos los componentes de la aplicación de juegos de azar.

### Componentes Testeados

1. **TumbleSlot** - Slot estilo Gates of Olympus
   - ✅ Renderizado correcto
   - ✅ Balance inicial
   - ✅ Selección de apuesta
   - ✅ Botones de auto-spin (10, 20, 50, 100)
   - ✅ Ante bet toggle
   - ✅ Compra de bonus
   - ✅ Estadísticas
   - ✅ Persistencia en localStorage

2. **SlotMachine** - Slot clásico con 25 líneas
   - ✅ Renderizado correcto
   - ✅ Balance inicial
   - ✅ Apuesta por línea
   - ✅ Líneas activas
   - ✅ Botones de auto-spin (10, 20, 50, 100)
   - ✅ Tabla de pagos
   - ✅ Estadísticas
   - ✅ Persistencia en localStorage

3. **Blackjack**
   - ✅ Renderizado correcto
   - ✅ Dealer y jugador
   - ✅ Estado de apuestas
   - ✅ Inicio de juego
   - ✅ Estadísticas
   - ✅ Historial

4. **Dado**
   - ✅ Renderizado correcto
   - ✅ Animación de lanzamiento
   - ✅ Estadísticas por número
   - ✅ Historial
   - ✅ Reinicio de contadores

5. **CaraCruz**
   - ✅ Renderizado correcto
   - ✅ Animación de lanzamiento
   - ✅ Estadísticas con porcentajes
   - ✅ Reinicio de contadores

6. **PiedraPapelTijera**
   - ✅ Renderizado correcto
   - ✅ Tres opciones de juego
   - ✅ Estadísticas

7. **Ruleta**
   - ✅ Renderizado correcto
   - ✅ Opciones de apuesta
   - ✅ Balance

8. **RuletaSimplificada**
   - ✅ Renderizado correcto
   - ✅ Botón de giro
   - ✅ Estadísticas

9. **Modal**
   - ✅ Renderizado condicional
   - ✅ Textos personalizados
   - ✅ Callbacks

## Características de Auto-Spin

### TumbleSlot y SlotMachine

Ambos slots ahora incluyen funcionalidad de auto-spin con las siguientes características:

#### Botones de Auto-Spin
- **AUTO 10**: 10 tiradas automáticas
- **AUTO 20**: 20 tiradas automáticas
- **AUTO 50**: 50 tiradas automáticas
- **AUTO 100**: 100 tiradas automáticas

#### Safeties Implementados

1. **Saldo Bajo**: El auto-spin se detiene automáticamente si el saldo es menor a 10x la apuesta actual
   - Previene que el jugador se quede sin fondos
   - Muestra sonido de alerta cuando se detiene por saldo bajo

2. **Minijuego Activado** (Solo TumbleSlot):
   - Se detiene automáticamente si se activan Free Spins (4+ Zeus)
   - Permite al jugador disfrutar del bonus sin interrupciones del auto-spin
   - Reproduce sonido de victoria al activarse

3. **Botón de Detención Manual**:
   - Aparece un botón "⏹ DETENER" cuando el auto-spin está activo
   - Permite al jugador detener el auto-spin en cualquier momento

4. **Indicador Visual**:
   - Muestra el número de tiradas restantes en tiempo real
   - "🔄 Auto-Spin: X tiradas restantes"

#### Restricciones
- Los botones de auto-spin se deshabilitan si:
  - El saldo es menor a 10x la apuesta (seguridad preventiva)
  - Ya hay un auto-spin activo
  - El juego está girando
  - Hay free spins activos (TumbleSlot)

## Ejecutar Tests

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests con UI interactiva
npm run test:ui

# Ejecutar tests con coverage
npm run test:coverage
```

## Configuración

Los tests están configurados con:
- **Vitest**: Framework de testing rápido
- **React Testing Library**: Testing de componentes React
- **jsdom**: Ambiente DOM simulado

### Archivo de Configuración
- `vitest.config.ts`: Configuración principal
- `src/test/setup.ts`: Setup global para todos los tests

## Mocks Implementados

- **localStorage**: Mock completo para pruebas de persistencia
- **HTMLMediaElement**: Mock para sonidos
- **playSound**: Mock de la función de audio

## Estructura de Tests

```
src/test/
├── setup.ts                    # Configuración global
├── TumbleSlot.test.tsx        # Tests del TumbleSlot
├── SlotMachine.test.tsx       # Tests del SlotMachine
├── Blackjack.test.tsx         # Tests del Blackjack
├── Dado.test.tsx              # Tests del Dado
├── CaraCruz.test.tsx          # Tests de Cara o Cruz
├── PiedraPapelTijera.test.tsx # Tests de PPT
├── Ruleta.test.tsx            # Tests de Ruleta
├── RuletaSimplificada.test.tsx # Tests de Ruleta Simple
└── Modal.test.tsx             # Tests del Modal
```

## Notas de Implementación

### Auto-Spin Logic

El auto-spin funciona mediante:
1. Tres estados: `autoSpinActive`, `autoSpinCount`, `autoSpinRemaining`
2. La función `spin()` verifica si debe continuar después de cada giro
3. Se detiene automáticamente si:
   - Se completan todas las tiradas
   - El saldo es insuficiente (< 10x apuesta)
   - Se activa un bonus/minijuego (TumbleSlot)
   - El usuario presiona DETENER

### Safety Checks

```javascript
// Check de saldo bajo
if (balance < totalBet * 10) {
  setAutoSpinActive(false);
  playSound('lose');
}

// Check de bonus activado (TumbleSlot)
if (triggeredBonus && autoSpinActive) {
  setAutoSpinActive(false);
  setAutoSpinRemaining(0);
}
```

## Coverage Esperado

Se espera obtener al menos:
- 80% de cobertura de líneas
- 75% de cobertura de funciones
- 70% de cobertura de branches

## Mejoras Futuras

- [ ] Tests de integración end-to-end
- [ ] Tests de performance
- [ ] Snapshots de componentes
- [ ] Tests de accesibilidad
- [ ] Tests de hooks personalizados
