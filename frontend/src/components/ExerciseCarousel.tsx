import { useState, useEffect, useRef, useCallback } from 'react';
import type { Exercise } from '../types';
import ExerciseCarouselCard from './ExerciseCarouselCard';

interface ExerciseCarouselProps {
  exercises: Exercise[];
  onExerciseClick: (exercise: Exercise) => void;
  onAddToWorkout: (exercise: Exercise) => void;
  onToggleFavorite?: (exercise: Exercise) => void;
}

export default function ExerciseCarousel({
  exercises,
  onExerciseClick,
  onAddToWorkout,
  onToggleFavorite
}: ExerciseCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  // Navigate to next/previous card
  const goToNext = useCallback(() => {
    if (isScrollingRef.current) return;
    setCurrentIndex((prev) => (prev + 1) % exercises.length);
  }, [exercises.length]);

  const goToPrevious = useCallback(() => {
    if (isScrollingRef.current) return;
    setCurrentIndex((prev) => (prev - 1 + exercises.length) % exercises.length);
  }, [exercises.length]);

  // Handle mouse wheel scrolling
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      if (isScrollingRef.current) return;
      
      const delta = e.deltaY;
      if (Math.abs(delta) > 50) {
        isScrollingRef.current = true;
        
        if (delta > 0) {
          goToNext();
        } else {
          goToPrevious();
        }
        
        setTimeout(() => {
          isScrollingRef.current = false;
        }, 300);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [goToNext, goToPrevious]);

  // Handle touch swipe
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let startX = 0;
    let startY = 0;
    let isDragging = false;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isDragging = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isDragging) return;
      isDragging = false;

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const deltaX = startX - endX;
      const deltaY = Math.abs(startY - endY);

      // Only handle horizontal swipes
      if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          goToNext();
        } else {
          goToPrevious();
        }
      }
    };

    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [goToNext, goToPrevious]);

  // Handle keyboard arrow keys
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle arrow keys when the carousel container or its children have focus
      // Or when no input/textarea is focused
      const activeElement = document.activeElement;
      const isInputFocused = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA';
      
      if (isInputFocused) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious]);

  if (exercises.length === 0) {
    return (
      <div className="text-center py-12 text-secondary animate-fade-in">
        <p>No exercises found. Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 bg-white/90 backdrop-blur-md rounded-full p-2 sm:p-3 shadow-lg hover:shadow-xl transition-all hover:bg-white border border-border hover:scale-110"
        aria-label="Previous exercise"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={goToNext}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 bg-white/90 backdrop-blur-md rounded-full p-2 sm:p-3 shadow-lg hover:shadow-xl transition-all hover:bg-white border border-border hover:scale-110"
        aria-label="Next exercise"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div
        ref={containerRef}
        className="relative w-full overflow-hidden"
        style={{ height: '600px' }}
      >
        <div className="relative w-full h-full flex items-center justify-center">
          {exercises.map((exercise, index) => {
            const distance = index - currentIndex;
            const absDistance = Math.abs(distance);
            
            // Calculate transform based on distance from center
            // Show 3 cards on each side with barely visible edges
            // Cards further from center should be behind cards closer to center
            let translateX = 0;
            let scale = 1;
            let opacity = 1;
            // Z-index: higher for cards closer to center, lower for cards further away
            // This ensures proper stacking order
            let zIndex = 1000 - absDistance * 10;

            if (distance === 0) {
              // Center card
              translateX = 0;
              scale = 1;
              opacity = 1;
              zIndex = 1000;
            } else if (distance === -1) {
              // Card to the left (first) - barely visible edge
              translateX = -25;
              scale = 0.96;
              opacity = .8;
              zIndex = 990;
            } else if (distance === 1) {
              // Card to the right (first) - barely visible edge
              translateX = 25;
              scale = 0.96;
              opacity = .8;
              zIndex = 990;
            } else if (distance === -2) {
              // Card to the left (second) - very thin edge
              translateX = -35;
              scale = 0.94;
              opacity = 0.5;
              zIndex = 980;
            } else if (distance === 2) {
              // Card to the right (second) - very thin edge
              translateX = 35;
              scale = 0.94;
              opacity = 0.5;
              zIndex = 980;
            } else if (distance === -3) {
              // Card to the left (third) - extremely thin edge
              translateX = -46;
              scale = 0.92;
              opacity = 0.25;
              zIndex = 970;
            } else if (distance === 3) {
              // Card to the right (third) - extremely thin edge
              translateX = 46;
              scale = 0.92;
              opacity = 0.25;
              zIndex = 970;
            } else {
              // Cards further away - completely hidden
              translateX = distance * 50;
              scale = 0.9;
              opacity = 0;
              zIndex = 960 - absDistance * 10;
            }

            // Handle click to center the card
            const handleCardClick = () => {
              if (distance !== 0 && !isScrollingRef.current) {
                setCurrentIndex(index);
              }
            };

            return (
              <div
                key={exercise.id}
                className={`absolute top-1/2 left-1/2 ${
                  distance !== 0 && absDistance <= 3 ? 'cursor-pointer' : ''
                }`}
                style={{
                  width: '90%',
                  maxWidth: '500px',
                  transform: `translate(-50%, -50%) translateX(${translateX}%) scale(${scale})`,
                  transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.5s ease',
                  opacity,
                  zIndex,
                  pointerEvents: absDistance > 3 ? 'none' : 'auto'
                }}
                onClick={distance !== 0 ? handleCardClick : undefined}
              >
                <ExerciseCarouselCard
                  exercise={exercise}
                  onExerciseClick={distance === 0 ? onExerciseClick : undefined}
                  onAddToWorkout={distance === 0 ? onAddToWorkout : undefined}
                  onToggleFavorite={distance === 0 ? onToggleFavorite : undefined}
                  isActive={distance === 0}
                />
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Card indicator dots */}
      <div className="flex justify-center gap-2 mt-6">
        {exercises.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (!isScrollingRef.current) {
                setCurrentIndex(index);
              }
            }}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'w-8 bg-primary-600'
                : 'w-2 bg-primary-300'
            }`}
            aria-label={`Go to exercise ${index + 1}`}
          />
        ))}
      </div>
      
      {/* Exercise counter */}
      <div className="text-center mt-4 text-sm text-secondary">
        {currentIndex + 1} of {exercises.length}
      </div>
    </div>
  );
}
