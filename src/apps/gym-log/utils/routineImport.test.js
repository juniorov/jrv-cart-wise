import { describe, expect, it } from 'vitest'
import { parseRoutinesFile } from './routineImport'

describe('parseRoutinesFile', () => {
  it('parsea un archivo con el wrapper "routines"', () => {
    const text = JSON.stringify({
      routines: [
        { name: 'Push Day A', exercises: [{ name: 'Press banca', targetSets: 4, targetReps: '8-10' }] },
      ],
    })
    const routines = parseRoutinesFile(text)
    expect(routines).toHaveLength(1)
    expect(routines[0].name).toBe('Push Day A')
    expect(routines[0].exercises[0]).toMatchObject({
      name: 'Press banca',
      metric: 'reps',
      targetSets: 4,
      targetReps: '8-10',
      muscleGroup: '',
    })
  })

  it('marca metric "time" y usa targetSeconds si el ejercicio trae metric: "time"', () => {
    const text = JSON.stringify({
      routines: [
        {
          name: 'Core',
          exercises: [{ name: 'Plancha', metric: 'time', targetSets: 3, targetSeconds: 40 }],
        },
      ],
    })
    const [routine] = parseRoutinesFile(text)
    expect(routine.exercises[0]).toMatchObject({ metric: 'time', targetSeconds: 40, targetReps: '' })
  })

  it('infiere metric "time" si trae targetSeconds sin "metric" explícito', () => {
    const text = JSON.stringify({
      routines: [{ name: 'Core', exercises: [{ name: 'Plancha', targetSeconds: 40 }] }],
    })
    const [routine] = parseRoutinesFile(text)
    expect(routine.exercises[0].metric).toBe('time')
  })

  it('normaliza supersetGroup a string, o null si no viene', () => {
    const text = JSON.stringify({
      routines: [
        {
          name: 'Piernas',
          exercises: [
            { name: 'Sentadilla', supersetGroup: 'A' },
            { name: 'Zancadas', supersetGroup: 1 },
            { name: 'Puente' },
          ],
        },
      ],
    })
    const [routine] = parseRoutinesFile(text)
    expect(routine.exercises[0].supersetGroup).toBe('A')
    expect(routine.exercises[1].supersetGroup).toBe('1')
    expect(routine.exercises[2].supersetGroup).toBeNull()
  })

  it('acepta una sola rutina como objeto raíz (sin wrapper)', () => {
    const text = JSON.stringify({ name: 'Pull Day', exercises: [{ name: 'Remo' }] })
    const routines = parseRoutinesFile(text)
    expect(routines).toHaveLength(1)
    expect(routines[0].name).toBe('Pull Day')
  })

  it('lanza error si el JSON es inválido', () => {
    expect(() => parseRoutinesFile('{not json')).toThrow('El archivo no es un JSON válido')
  })

  it('lanza error si una rutina no tiene name', () => {
    const text = JSON.stringify({ routines: [{ exercises: [{ name: 'X' }] }] })
    expect(() => parseRoutinesFile(text)).toThrow(/no tiene "name"/)
  })

  it('lanza error si una rutina no tiene exercises', () => {
    const text = JSON.stringify({ routines: [{ name: 'Solo' }] })
    expect(() => parseRoutinesFile(text)).toThrow(/no tiene "exercises"/)
  })

  it('lanza error si un ejercicio no tiene nombre', () => {
    const text = JSON.stringify({ routines: [{ name: 'Push', exercises: [{ targetSets: 3 }] }] })
    expect(() => parseRoutinesFile(text)).toThrow(/ejercicio sin nombre/)
  })
})
