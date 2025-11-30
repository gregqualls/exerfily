import { describe, it, expect, beforeEach } from 'vitest';
import {
  getWorkouts,
  saveWorkout,
  deleteWorkout,
  duplicateWorkout,
  getWorkoutById
} from '../workoutStorage';
import type { Workout } from '../../types';

describe('workoutStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return empty array when no workouts exist', () => {
    expect(getWorkouts()).toEqual([]);
  });

  it('should save and retrieve a workout', () => {
    const workout: Workout = {
      id: 'test-1',
      name: 'Test Workout',
      description: 'Test Description',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sessions: []
    };

    saveWorkout(workout);
    const workouts = getWorkouts();

    expect(workouts).toHaveLength(1);
    expect(workouts[0]).toMatchObject({
      id: 'test-1',
      name: 'Test Workout',
      description: 'Test Description'
    });
  });

  it('should update existing workout', () => {
    const workout: Workout = {
      id: 'test-1',
      name: 'Test Workout',
      description: 'Original',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sessions: []
    };

    saveWorkout(workout);
    
    const updated: Workout = {
      ...workout,
      name: 'Updated Workout',
      description: 'Updated'
    };

    saveWorkout(updated);
    const workouts = getWorkouts();

    expect(workouts).toHaveLength(1);
    expect(workouts[0].name).toBe('Updated Workout');
    expect(workouts[0].description).toBe('Updated');
  });

  it('should delete a workout', () => {
    const workout: Workout = {
      id: 'test-1',
      name: 'Test Workout',
      description: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sessions: []
    };

    saveWorkout(workout);
    expect(getWorkouts()).toHaveLength(1);

    deleteWorkout('test-1');
    expect(getWorkouts()).toHaveLength(0);
  });

  it('should duplicate a workout', () => {
    const workout: Workout = {
      id: 'test-1',
      name: 'Original',
      description: 'Description',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sessions: [{
        id: 'session-1',
        name: 'Session 1',
        notes: '',
        exercises: [{
          id: 'ex-1',
          exerciseId: 'exercise-1',
          order: 0,
          sets: 3,
          reps: '10',
          weight: null,
          tempo: null,
          rest: null,
          customTips: null
        }]
      }]
    };

    saveWorkout(workout);
    const duplicated = duplicateWorkout(workout);

    expect(duplicated.id).not.toBe(workout.id);
    expect(duplicated.name).toBe('Original (Copy)');
    expect(duplicated.sessions[0].id).not.toBe(workout.sessions[0].id);
    expect(duplicated.sessions[0].exercises[0].id).not.toBe(workout.sessions[0].exercises[0].id);

    const workouts = getWorkouts();
    expect(workouts).toHaveLength(2);
  });

  it('should get workout by id', () => {
    const workout: Workout = {
      id: 'test-1',
      name: 'Test Workout',
      description: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sessions: []
    };

    saveWorkout(workout);

    const found = getWorkoutById('test-1');
    expect(found).toMatchObject({ id: 'test-1', name: 'Test Workout' });

    const notFound = getWorkoutById('non-existent');
    expect(notFound).toBeNull();
  });
});

