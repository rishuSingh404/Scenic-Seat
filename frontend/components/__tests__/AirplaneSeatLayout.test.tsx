import { render, screen } from '@testing-library/react';
import { AirplaneSeatLayout } from '../AirplaneSeatLayout';

describe('AirplaneSeatLayout', () => {
  const defaultProps = {
    flightDirection: 90, // Eastward flight
    currentTime: '2024-01-01T10:00:00Z',
    departureTime: 'Montreal',
    arrivalTime: 'Toronto',
    flightDuration: '5h 12m',
    flightStatus: 'On Time'
  };

  it('renders flight status header correctly', () => {
    render(<AirplaneSeatLayout {...defaultProps} />);
    
    expect(screen.getByText('Montreal → Toronto')).toBeInTheDocument();
    expect(screen.getByText('5h 12m • On Time')).toBeInTheDocument();
    expect(screen.getByText('90°')).toBeInTheDocument();
  });

  it('renders airplane seat layout title', () => {
    render(<AirplaneSeatLayout {...defaultProps} />);
    
    expect(screen.getByText('AIRPLANE SEAT LAYOUT')).toBeInTheDocument();
  });

  it('renders seat recommendation section', () => {
    render(<AirplaneSeatLayout {...defaultProps} />);
    
    expect(screen.getByText('SEAT RECOMMENDATION')).toBeInTheDocument();
  });

  it('renders legend section', () => {
    render(<AirplaneSeatLayout {...defaultProps} />);
    
    expect(screen.getByText('LEGEND')).toBeInTheDocument();
    expect(screen.getByText('Sunrise seats (Yellow)')).toBeInTheDocument();
    expect(screen.getByText('Sunset seats (Orange)')).toBeInTheDocument();
    expect(screen.getByText('Window seats')).toBeInTheDocument();
    expect(screen.getByText('Aisle seats')).toBeInTheDocument();
  });

  it('shows sunrise recommendation for eastward flights', () => {
    render(<AirplaneSeatLayout {...defaultProps} />);
    
    expect(screen.getByText('BEST CHOICE: Left Window Seats (A)')).toBeInTheDocument();
    expect(screen.getByText('Perfect sunrise viewing experience!')).toBeInTheDocument();
    expect(screen.getByText('Sun Position: Left side of aircraft')).toBeInTheDocument();
  });

  it('shows sunset recommendation for westward flights', () => {
    render(<AirplaneSeatLayout {...defaultProps} flightDirection={270} />);
    
    expect(screen.getByText('BEST CHOICE: Right Window Seats (H)')).toBeInTheDocument();
    expect(screen.getByText('Perfect sunset viewing experience!')).toBeInTheDocument();
    expect(screen.getByText('Sun Position: Right side of aircraft')).toBeInTheDocument();
  });

  it('renders cockpit and galley sections', () => {
    render(<AirplaneSeatLayout {...defaultProps} />);
    
    expect(screen.getByText('Cockpit')).toBeInTheDocument();
    expect(screen.getByText('Galley/Lavatories')).toBeInTheDocument();
  });
});


