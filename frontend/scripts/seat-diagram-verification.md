# Seat Diagram Verification Guide

This guide helps verify the seat diagram functionality for Checkpoint 8.

## Visual Verification Checklist

### Basic Layout
Test with both 3-3 and 2-4-2 configurations:

**3-3 Layout:**
- [ ] Three seats on each side (A-B-C | D-E-F)
- [ ] Clear aisle separation in the middle
- [ ] Seats properly labeled A through F
- [ ] Recommended side highlighted in blue/confidence color
- [ ] Non-recommended side in gray
- [ ] Front indicator (▲) showing aircraft direction

**2-4-2 Layout:**
- [ ] Two seats on each side (A-B | G-H)
- [ ] Four seats in middle (C-D-E-F)
- [ ] Seats properly labeled A through H
- [ ] Recommended side highlighted correctly
- [ ] Middle section always in gray
- [ ] Layout maintains proper proportions

### Recommendation Visualization

**LEFT Side Recommendation:**
- [ ] A-B-C seats highlighted (3-3) or A-B seats (2-4-2)
- [ ] Highlight color matches confidence level:
  - High: Green
  - Medium: Yellow
  - Low: Red
- [ ] Right side seats in gray
- [ ] Highlighted seats slightly larger (scale: 1.1)

**RIGHT Side Recommendation:**
- [ ] D-E-F seats highlighted (3-3) or G-H seats (2-4-2)
- [ ] Highlight color matches confidence level
- [ ] Left side seats in gray
- [ ] Highlighted seats slightly larger

**EITHER Case:**
- [ ] All seats in gray
- [ ] No scaling on any seats
- [ ] Clear visual indication of neutral recommendation

### Sun Ray Visualization

**Basic Ray:**
- [ ] Yellow line showing sun direction
- [ ] Correct angle based on relative_angle_deg
- [ ] Smooth animation when angle changes
- [ ] Proper origin point (center of diagram)

**Midpoint Ray (Optional):**
- [ ] Checkbox to toggle midpoint ray
- [ ] Dotted/faded yellow line when enabled
- [ ] Correct offset angle from main ray
- [ ] Proper visual hierarchy (less prominent)

### Stability Classification

**Visual Elements:**
- [ ] Stability level clearly displayed
- [ ] Color coding matches level:
  - High: Green text
  - Medium: Yellow text
  - Low: Red text
- [ ] Descriptive text explains stability
- [ ] Clean integration with diagram

**Test Cases:**
1. **High Stability:**
   - [ ] Green color
   - [ ] Text: "Recommendation likely to remain stable throughout the flight"
   - [ ] Clean, confident presentation

2. **Medium Stability:**
   - [ ] Yellow color
   - [ ] Text: "Recommendation may change during flight"
   - [ ] Appropriate cautionary presentation

3. **Low Stability:**
   - [ ] Red color
   - [ ] Text: "Recommendation likely to change during flight"
   - [ ] Clear warning presentation

### Technical Details Display

**Angle Information:**
- [ ] Bearing degree displayed correctly
- [ ] Sun azimuth degree displayed correctly
- [ ] Relative angle degree displayed correctly
- [ ] All angles in fixed decimal format (X.X°)
- [ ] Monospace font for better readability

### Interactive Elements

**Layout Switcher:**
- [ ] Dropdown shows both layout options
- [ ] Smooth transition between layouts
- [ ] Maintains recommendation highlighting
- [ ] Preserves sun ray angle
- [ ] Accessible keyboard navigation

**Midpoint Toggle:**
- [ ] Checkbox properly styled
- [ ] Clear label "Show midpoint"
- [ ] Immediate visual feedback
- [ ] Maintains state during updates

### Responsive Design

**Desktop View:**
- [ ] Full-size diagram with clear details
- [ ] Proper spacing and alignment
- [ ] All text easily readable
- [ ] Controls easily accessible

**Mobile View:**
- [ ] Diagram scales appropriately
- [ ] Controls stack vertically if needed
- [ ] Touch targets sufficiently large
- [ ] Text remains readable

### Integration Testing

**With Recommendation Updates:**
1. Change time using scrubber:
   - [ ] Seat highlights update
   - [ ] Sun ray animates
   - [ ] Stability updates
   - [ ] Technical details refresh

2. Switch routes:
   - [ ] All diagram elements update
   - [ ] Smooth transition
   - [ ] No visual glitches
   - [ ] Correct new values

### Performance Verification

**Render Efficiency:**
- [ ] No unnecessary re-renders
- [ ] Smooth animations
- [ ] Proper state management
- [ ] No performance warnings

**Memory Usage:**
- [ ] No memory leaks
- [ ] Clean component unmounting
- [ ] Efficient DOM updates
- [ ] Proper cleanup of listeners

### Accessibility Testing

**Keyboard Navigation:**
- [ ] Layout dropdown accessible
- [ ] Midpoint toggle accessible
- [ ] Proper tab order
- [ ] Focus indicators visible

**Screen Readers:**
- [ ] Meaningful seat labels
- [ ] Clear status announcements
- [ ] Proper ARIA attributes
- [ ] Descriptive element roles

### Error Handling

**Edge Cases:**
- [ ] Invalid angle values handled
- [ ] Missing data gracefully managed
- [ ] Layout switch during update
- [ ] Rapid interaction handling

## Test Scenarios

### Scenario 1: Delhi → Singapore, Morning Flight
1. Set departure time to 06:00
2. Verify:
   - [ ] Sun ray angle matches morning position
   - [ ] Seat recommendation clear
   - [ ] Stability indication accurate

### Scenario 2: London → New York, Evening Flight
1. Set departure time to 18:00
2. Verify:
   - [ ] Sun ray shows evening angle
   - [ ] Seat recommendation appropriate
   - [ ] Stability reflects long-haul changes

### Scenario 3: Polar Route
1. Choose high-latitude route
2. Verify:
   - [ ] Handles extreme angles
   - [ ] Stability shows uncertainty
   - [ ] Clear visual feedback

## Documentation Notes

Record for Checkpoint Report:
- Screenshots of both layouts
- Stability classification examples
- Sun ray visualization
- Any edge cases or limitations
- Performance metrics
- Accessibility compliance



