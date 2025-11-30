# Workout sheet builder app – specification

## High level overview

Simple web app for building printable workout sheets using an external exercise dataset.

Key ideas:

- Browser client using React + Tailwind
- Backend API that reads a JSON exercise dataset with image URLs (no image storage)
- Users can:
  - Browse and filter exercises
  - Build named workouts
  - Organize each workout into ordered sessions
  - Configure what fields appear on printouts
  - Print workouts as 2, 3, or 4 exercise blocks per page

## Core user stories

1. Browse exercises  
   - As a user I can search by name.  
   - I can filter by:
     - Primary muscle group (biceps, quads, etc)
     - Body area (upper body, lower body, full body, core, neck, back, etc)
     - Equipment (bodyweight, dumbbell, barbell, band, machine, etc)
     - Difficulty level (beginner, intermediate, advanced) if available in dataset.

2. View exercise details  
   - I can click an exercise card to see:
     - Name
     - Image (or animated media URL if available)
     - Primary and secondary muscles
     - Body area
     - Equipment
     - Description and step instructions
     - Category (strength, mobility, cardio, etc)
     - Tips or notes field (editable in my own workout context)

3. Build workouts and sessions  
   - I can create a workout with:
     - Name
     - Description (optional)
   - Within a workout I can create one or more sessions (for example: Day A, Day B).
   - Each session has:
     - Name
     - Notes (optional)
     - List of exercises in a defined order.
   - For each exercise in a session I can set:
     - Sets
     - Reps
     - Weight (text field, not numeric only, so things like “bodyweight”, “RPE 8” work)
     - Tempo (optional)
     - Rest (optional)
     - Personal tips / coaching cues (optional)

4. Save and edit  
   - I can save workouts and come back later.  
   - I can duplicate a workout.  
   - I can rename or delete workouts and sessions.  
   - I can edit exercises inside a session (change order, change sets/reps, etc).

5. Print configuration  
   - Before printing I can configure:
     - Exercises per page: 2, 3, or 4
     - Fields to show:
       - Image
       - Name
       - Description or short instructions
       - Custom tips
       - Sets / reps
       - Weight
       - Rest
     - Option to hide all per exercise details and print only the list of exercise names for that session.
   - I can choose:
     - Print a single session
     - Print an entire workout (all sessions, each session starting on a new page).
   - The print view is a clean layout designed with Tailwind that works well in both browser print and PDF export.

6. Persistence  
   - Minimum viable: save workouts in browser localStorage or IndexedDB for a single user.  
   - Optional future: user accounts with cloud persistence.

## Domain model

Use this as a base for TypeScript interfaces or backend schema.

### Exercise

Represents one exercise from the dataset.

- id: string
- name: string
- bodyArea: enum or string  
  Examples: "upper body", "lower body", "core", "neck", "back", "full body"
- primaryMuscles: string[]
- secondaryMuscles: string[]
- equipment: string[] or single string (choose what matches dataset)
- category: string (strength, cardio, mobility etc)
- level: string (beginner, intermediate, advanced)
- description: string
- instructions: string[] (each step)
- imageUrls: string[] (external URLs only)
- sourceId: string (original dataset id)
- tags: string[] (optional, for extra filtering)

### Workout

- id: string
- name: string
- description: string
- createdAt: Date
- updatedAt: Date
- sessions: Session[]

### Session

- id: string
- name: string (for example: "Day 1", "Push Day", "Legs")
- notes: string
- exercises: SessionExercise[]
- printConfigOverride: optional SessionPrintConfig, overrides workout defaults

### SessionExercise

Represents the instance of an exercise in a specific session.

- id: string
- exerciseId: string (foreign key to Exercise)
- order: number
- sets: number | null
- reps: string | null (allow "8 to 10", "AMRAP")
- weight: string | null
- tempo: string | null
- rest: string | null
- customTips: string | null

### Print configuration

Can exist at app, workout, and session level, where more specific overrides more general.

SessionPrintConfig / WorkoutPrintConfig:

- exercisesPerPage: 2 | 3 | 4
- showImage: boolean
- showName: boolean
- showDescription: boolean
- showInstructions: boolean
- showCustomTips: boolean
- showSetsReps: boolean
- showWeight: boolean
- showRest: boolean
- condenseInstructions: boolean  
  (if true, use only first instruction or short summary)

## API design

If you want a simple backend, here is a REST style API.

### Exercises

Read only.

- GET /api/exercises  
  Query params:
  - q: string (search by name)
  - bodyArea: string
  - primaryMuscle: string
  - equipment: string
  - level: string
  - category: string
  - limit: number
  - offset: number

- GET /api/exercises/:id  

Backend loads exercises from a JSON dataset into memory on startup or reads from a DB. Image URLs are served as plain URLs.

### Workouts

- GET /api/workouts  
  Return list of workouts with summary info (id, name, number of sessions).

- POST /api/workouts  
  Create workout. Body: Workout create payload.

- GET /api/workouts/:id  
  Return full workout including sessions and session exercises.

- PUT /api/workouts/:id  
  Update workout (name, description, sessions, printConfig).

- DELETE /api/workouts/:id  

Optional: routes for sessions and session exercises if you want more granular editing, but a simple approach is to always send the entire updated workout document.

### User and persistence

If you keep it local only, you can skip backend for workouts and just use localStorage. In that case, the “API” contract is just a set of local storage keys and a small data access service in the frontend.

## Frontend ui and flows (React + Tailwind)

### Main layout

- Top navigation bar
  - App logo or name
  - Links: “Exercises”, “Workouts”
  - Theme toggle (optional)
- Max-width container with responsive layout
- Tailwind base config to give modern, minimal look (rounded cards, neutral palette).

### Exercises page

Components:

1. FilterBar  
   - Text search input  
   - Select for body area  
   - Select for primary muscle  
   - Select for equipment  
   - Select for difficulty level  
   - Clear filters button  

2. ExerciseGrid  
   - Responsive grid of cards  
   - Each card shows:
     - Name
     - Small image thumbnail (first imageUrl)
     - Body area
     - Primary muscles (comma separated)
     - Equipment

   - Each card has:
     - “View” button
     - “Add to workout” button or icon

3. ExerciseDetailModal or side panel  
   - Larger image
   - Name
   - Primary / secondary muscles
   - Equipment
   - Category and level
   - Description
   - Step list

   - Action: “Add to session”  
     - Opens a selector:
       - Choose existing workout and session  
       - Or create new workout and/or session, then add.

### Workouts page

1. WorkoutsList  
   - List of workout cards  
   - Each shows:
     - Name
     - Description snippet
     - Number of sessions
   - Actions:
     - Open
     - Duplicate
     - Delete

2. WorkoutDetailView  
   Layout: left side session navigation, right side detail.

   Left column:

   - List of sessions for this workout  
   - “Add session” button  
   - Reorder sessions by drag and drop or up/down buttons.

   Right column:

   - Session header:
     - Session name (editable)  
     - Notes field  
   - Print settings section:
     - Dropdown for exercises per page  
     - Checkboxes for the fields to show  
     - Button “Reset to workout defaults”  

   - SessionExerciseList:
     - Each row shows:
       - Exercise name
       - Basic info (primary muscles, equipment)
       - Inline editable fields: sets, reps, weight, rest
       - “Custom tips” expandable textarea  
       - Drag handle for reordering
       - Remove button

   - Button row:
     - “Add exercise” (opens exercise browser dialog)  
     - “Print session”  
     - “Print workout”  

### Print view

Route example: `/print/workout/:id` or `/print/session/:id`

- Reads workout or session and active print config.
- Uses a special layout component that:
  - Renders exercises as cards with Tailwind classes for borders, spacing, font size.
  - Arranges them using CSS grid and page break rules for 2, 3, or 4 per page.
- Each card includes only the fields enabled by printConfig.

Example card layout:

- Top: exercise name
- Image (if enabled)
- Short description or first step
- Sets x reps, weight, rest (if enabled)
- Custom tips in a small italic block (if enabled)

Have a “Print” button that just calls `window.print()`. The page is styled by a dedicated `print.css` or Tailwind `@media print` rules to remove navigation and background colors.

## Tailwind design notes

You can guide the styling AI with some constraints:

- Use Tailwind utility classes only, no custom CSS except for print tweaks.
- Default font: system font stack.
- Components should use:
  - Rounded corners
  - Shadow for cards
  - Neutral background with slightly darker header areas
  - Clear hover states on interactive elements
- Use consistent spacing scale, for example `p-4`, `gap-4`, `space-y-4`.
- Stick to a small set of colors, for example:
  - Primary: `blue-600`
  - Accent: `emerald-500`
  - Background: `slate-50`
  - Text: `slate-900` with `slate-600` for secondary.

## Suggested implementation phases

If you want to feed it “piece by piece”:

1. Phase 1  
   - Load exercise dataset from JSON in backend or directly in frontend.  
   - Build Exercises page with filters and detail modal.

2. Phase 2  
   - Add Workout, Session, SessionExercise data model in frontend only.  
   - Build Workouts page and WorkoutDetailView.  
   - Persist workouts in localStorage.

3. Phase 3  
   - Implement print configuration model.  
   - Build print views and browser print support.

4. Phase 4 (optional)  
   - Add backend API and user accounts.  
   - Sync workouts to a database.
