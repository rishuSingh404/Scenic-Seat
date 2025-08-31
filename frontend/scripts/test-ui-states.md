# UI States Verification Guide

This document outlines the different UI states that should be manually verified for Checkpoint 5.

## Test Scenarios

### 1. Empty State
- **How to test**: Navigate to `/tool` without making any requests
- **Expected**: Welcome message with sun icon, "Ready for takeoff" message
- **Elements to verify**:
  - Sun icon is visible
  - "Ready for takeoff" heading
  - "Enter your flight details to get a window seat recommendation" text

### 2. Form Interaction
- **How to test**: Interact with the form elements
- **Expected behaviors**:
  - City autocomplete shows suggestions after 2+ characters
  - Preset routes populate form fields when clicked
  - Date/time picker shows timezone label when origin is selected
  - Submit button is disabled until all fields are filled
  - Radio buttons for sunrise/sunset work correctly

### 3. Loading State
- **How to test**: Submit a valid form (requires backend running)
- **Expected**: 
  - Loading spinner with airplane icon
  - "Calculating recommendation..." message
  - Animated dots
  - Form submit button shows loading state

### 4. Success State - Decision Card
- **How to test**: Complete a successful request
- **Expected elements**:
  - Large emoji showing recommended side (👈 👉 🤷)
  - Side recommendation text (LEFT/RIGHT/EITHER Window)
  - Confidence badge (HIGH/MEDIUM/LOW with appropriate colors)
  - Stability badge (HIGH/MEDIUM/LOW with appropriate colors)
  - Golden Hour badge (if applicable)
  - Rationale text explaining the recommendation
  - Technical notes section

### 5. Success State - Facts Panel
- **How to test**: Scroll down after successful request
- **Expected sections**:
  - **Flight Data**: Bearing, Sun Azimuth, Relative Angle, Golden Hour status
  - **Solar Times**: Civil Dawn, Sunrise, Sunset, Civil Dusk
  - **Route Analysis**: Midpoint coordinates, Sun at midpoint, Stability
  - **Confidence Bands**: Color-coded explanation of confidence levels

### 6. Error States
- **How to test**: Try various error scenarios
- **GEO_ERROR**: Enter a non-existent city name
  - Expected: 🗺️ icon, "Location Not Found" title, helpful message
- **NETWORK_ERROR**: Stop backend server and try request
  - Expected: 📡 icon, "Connection Error" title, connection help text
- **VALIDATION_ERROR**: Submit malformed data
  - Expected: ⚠️ icon, "Invalid Input" title, validation message

### 7. Responsive Design
- **How to test**: Resize browser window or test on mobile
- **Expected**:
  - Form sidebar stacks on mobile (lg:col-span-1)
  - Results area adapts to mobile layout (lg:col-span-2)
  - Grid layouts in Facts panel stack appropriately (md:grid-cols-2, md:grid-cols-3)

### 8. Accessibility
- **How to test**: Use keyboard navigation and screen reader
- **Expected**:
  - All interactive elements focusable with Tab
  - Form labels properly associated
  - ARIA attributes on autocomplete
  - Semantic headings (h1, h2, h3)
  - Proper color contrast ratios

## Manual Testing Checklist

### Form Functionality
- [ ] Preset routes populate form correctly
- [ ] City autocomplete shows relevant suggestions
- [ ] City autocomplete handles keyboard navigation (arrow keys, enter, escape)
- [ ] Date/time picker works and shows timezone
- [ ] Radio buttons for interest selection work
- [ ] Submit button enables/disables appropriately
- [ ] Form validation prevents empty submissions

### API Integration
- [ ] Loading state appears during requests
- [ ] Successful responses populate decision card and facts panel
- [ ] Error responses show appropriate error displays
- [ ] Retry functionality works from error state

### UI Polish
- [ ] Animations are smooth (loading spinner, hover effects)
- [ ] Color coding is consistent (confidence/stability badges)
- [ ] Typography hierarchy is clear
- [ ] Spacing and layout look professional
- [ ] Icons and emojis render correctly

### Data Display
- [ ] Angles display with proper formatting (±XX.X°)
- [ ] Times display in readable format (12-hour with AM/PM)
- [ ] Coordinates show appropriate precision
- [ ] Compass directions show for bearings
- [ ] Confidence bands explanation is clear

## Browser Testing

Test in multiple browsers to ensure compatibility:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari (if available)
- [ ] Edge

## Performance

- [ ] Initial page load is fast
- [ ] Form interactions are responsive
- [ ] No visible layout shifts during loading
- [ ] API requests complete in reasonable time

## Notes

- Backend server must be running on `http://localhost:8000` for full testing
- Use browser dev tools to simulate mobile devices
- Check console for any JavaScript errors
- Verify all images/icons load correctly



