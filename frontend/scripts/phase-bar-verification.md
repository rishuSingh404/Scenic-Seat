# Phase Bar and Time Scrubber Verification Guide

This guide helps verify the phase bar and time scrubber functionality for Checkpoint 7.

## Visual Verification Checklist

### Phase Bar Near Sunrise
Test with Delhi → Singapore, 06:00 departure (sunrise time):

**Expected Visual Elements:**
- [ ] Timeline shows dark blue/gray for night period (left side)
- [ ] Light gray for civil dawn period  
- [ ] **Golden orange highlight** around sunrise time (±45 minutes)
- [ ] Light blue for day period
- [ ] Current time marker (red line) positioned near sunrise
- [ ] Solar event times listed below timeline:
  - Civil Dawn: ~05:40 AM
  - Sunrise: ~06:04 AM  
  - Sunset: ~06:32 PM
  - Civil Dusk: ~06:56 PM

**Screenshot Requirements:**
- Take screenshot showing phase bar with golden hour highlighted
- Red time marker should be positioned in/near golden orange section
- Timeline should show smooth color transitions

### Phase Bar Near Noon  
Test with London → Cairo, 12:00 departure (midday time):

**Expected Visual Elements:**
- [ ] Timeline shows full day progression
- [ ] Current time marker positioned in middle (blue day section)
- [ ] No golden hour highlighting at current position
- [ ] Morning golden hour visible on left side of timeline
- [ ] Evening golden hour visible on right side of timeline
- [ ] All solar times clearly labeled

**Screenshot Requirements:**
- Take screenshot showing midday positioning
- Red marker in blue day section (not golden hour)
- Both morning and evening golden hours visible but not active

### Time Scrubber Interaction

**Drag Behavior:**
- [ ] Slider starts at center position (0 offset)
- [ ] Can drag ±3 hours (-180 to +180 minutes)
- [ ] Shows preview time while dragging
- [ ] Shows offset description (e.g., "+1h 30m", "-45m")
- [ ] "Release to update" message appears during drag
- [ ] Does NOT trigger API call until drag ends

**Interaction End Behavior:**
- [ ] API call triggered only when slider is released
- [ ] Map animation starts after new recommendation received
- [ ] Phase bar updates with new time position
- [ ] Loading state shows during recomputation
- [ ] All components update consistently

### Golden Hour Highlighting Verification

**Test Cases:**
1. **Delhi → Singapore at 05:30** (30 min before sunrise)
   - [ ] Golden hour section highlighted in orange
   - [ ] Time marker in golden hour section
   - [ ] "Golden Hour" badge visible in decision card

2. **Delhi → Singapore at 07:00** (1 hour after sunrise)
   - [ ] No golden hour highlighting at current time
   - [ ] Time marker in day section (blue)
   - [ ] No golden hour badge in decision card

3. **London → Cairo at 18:00** (around sunset)
   - [ ] Evening golden hour highlighted
   - [ ] Time marker in/near golden section
   - [ ] Golden hour badge visible if within ±45 minutes

### Time Scrubber Edge Cases

**Boundary Testing:**
- [ ] Drag to -3h limit: Shows "-3h" offset, earliest time
- [ ] Drag to +3h limit: Shows "+3h" offset, latest time  
- [ ] Drag to center: Shows "Current time", original departure time
- [ ] 15-minute increments: Slider snaps to quarter-hour marks

**Timezone Handling:**
- [ ] All times displayed in origin city timezone
- [ ] Timezone label shows correctly (e.g., "Asia/Kolkata")
- [ ] Time calculations respect DST if applicable

## Performance Verification

### Re-render Counting
Open browser console and watch for performance logs:

**Expected Behavior:**
- PhaseBar should render 1-2 times per recommendation
- TimeScrubber should render 2-3 times during interaction
- MapView should animate only when scrubber interaction ends
- No continuous re-rendering during slider drag

**Console Output to Look For:**
```
🔄 PhaseBar render #1 (+0ms) - Initial render
🔄 TimeScrubber render #1 (+0ms) - Initial render  
🔄 TimeScrubber render #2 (+500ms) - Interaction end
🔄 MapView render #3 (+800ms) - Animation trigger
```

### Animation Performance
- [ ] Smooth 60fps animation during map updates
- [ ] No jank or stuttering during scrubber interaction
- [ ] Reduced motion respected (test with accessibility setting enabled)
- [ ] Animation duration feels appropriate (~800ms)

## Integration Testing

### Full Workflow Test
1. **Initial State**: Load page, select Delhi → Singapore, 06:00
2. **First Recommendation**: Verify phase bar shows golden hour
3. **Scrubber Interaction**: Drag to +2h (08:00)
4. **Recomputation**: Verify new recommendation and map animation
5. **Phase Bar Update**: Verify time marker moved, no golden hour
6. **Scrubber Reset**: Drag back to center, verify returns to original

### Cross-Component Updates
When scrubber changes time, verify these update correctly:
- [ ] Decision card shows new recommendation
- [ ] Facts panel shows updated angles and times
- [ ] Phase bar repositions time marker
- [ ] Map animates sun ray to new position
- [ ] All displayed times use same timezone consistently

## Accessibility Testing

### Keyboard Navigation
- [ ] Slider accessible via Tab key
- [ ] Arrow keys adjust slider value
- [ ] Enter/Space keys work for interaction
- [ ] Screen reader announces time changes

### Reduced Motion
Enable "Reduce motion" in browser settings:
- [ ] Map animation disabled during scrubber updates
- [ ] Phase bar transitions still work (they're not motion-based)
- [ ] Slider still functions normally
- [ ] No accessibility warnings in console

## Error Handling

### API Failure During Scrubber Use
1. Stop backend server
2. Use time scrubber to change time
3. Verify proper error handling:
   - [ ] Error message appears
   - [ ] Scrubber remains functional
   - [ ] Previous data remains visible
   - [ ] Retry functionality works

### Invalid Time Ranges
Test edge cases:
- [ ] Very early times (polar regions)
- [ ] Times that cause POLAR_DAY errors
- [ ] Verify graceful error handling
- [ ] Scrubber resets to safe position if needed

## Documentation Notes

Record observations for Checkpoint Report:
- Screenshot of phase bar near sunrise with golden hour
- Screenshot of phase bar near noon without golden hour  
- Performance metrics from console logs
- Any issues or edge cases discovered
- Verification that golden hour highlighting works correctly



