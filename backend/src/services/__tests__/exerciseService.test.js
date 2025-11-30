import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getExercises, getExerciseById } from '../exerciseService.js';

// Mock fetch globally
global.fetch = vi.fn();

describe('exerciseService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(async () => {
    // Clear module cache to reset internal cache state
    vi.resetModules();
  });

  it('should map ExerciseDB response to domain model', async () => {
    const mockExerciseDB = {
      id: '0001',
      name: 'Barbell Curl',
      bodyPart: 'biceps',
      target: 'biceps',
      equipment: 'barbell',
      category: 'strength',
      instructions: [
        'Stand up straight with a barbell in your hands',
        'Curl the barbell up to your chest'
      ],
      gifUrl: 'https://example.com/gif.gif'
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [mockExerciseDB]
    });

    const result = await getExercises({});

    expect(result.exercises).toHaveLength(1);
    expect(result.exercises[0]).toMatchObject({
      name: 'Barbell Curl',
      bodyArea: 'upper body',
      primaryMuscles: ['biceps'],
      equipment: ['barbell'],
      category: 'strength'
    });
    expect(result.exercises[0].instructions).toHaveLength(2);
    expect(result.exercises[0].imageUrls).toContain('https://example.com/gif.gif');
  });

  it('should filter exercises by body area', async () => {
    // Reload module to get fresh cache
    await vi.resetModules();
    const { getExercises: getExercisesFresh } = await import('../exerciseService.js');
    
    const mockExercises = [
      {
        id: '1',
        name: 'Chest Exercise',
        bodyPart: 'chest',
        target: 'chest',
        equipment: 'dumbbell',
        instructions: []
      },
      {
        id: '2',
        name: 'Leg Exercise',
        bodyPart: 'legs',
        target: 'quadriceps',
        equipment: 'barbell',
        instructions: []
      }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockExercises
    });

    const result = await getExercisesFresh({ bodyArea: 'upper body' });

    expect(result.exercises).toHaveLength(1);
    expect(result.exercises[0].name).toBe('Chest Exercise');
  });

  it('should filter exercises by search query', async () => {
    // Reload module to get fresh cache
    await vi.resetModules();
    const { getExercises: getExercisesFresh } = await import('../exerciseService.js');
    
    const mockExercises = [
      {
        id: '1',
        name: 'Barbell Curl',
        bodyPart: 'biceps',
        target: 'biceps',
        equipment: 'barbell',
        instructions: []
      },
      {
        id: '2',
        name: 'Dumbbell Press',
        bodyPart: 'chest',
        target: 'chest',
        equipment: 'dumbbell',
        instructions: []
      }
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockExercises
    });

    const result = await getExercisesFresh({ q: 'curl' });

    expect(result.exercises).toHaveLength(1);
    expect(result.exercises[0].name).toBe('Barbell Curl');
  });

  it('should handle API errors gracefully', async () => {
    // Reload module to get fresh cache
    await vi.resetModules();
    const { getExercises: getExercisesFresh } = await import('../exerciseService.js');
    
    global.fetch.mockRejectedValueOnce(new Error('API Error'));

    await expect(getExercisesFresh({})).rejects.toThrow();
  });
});
