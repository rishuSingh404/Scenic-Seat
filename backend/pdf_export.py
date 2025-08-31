# PDF export functionality using reportlab
import base64
import io
from typing import Optional
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from api_schemas import RecommendationResponse


def create_seat_diagram_svg(side: str, layout: str = "3-3") -> str:
    """Create a simple SVG seat diagram highlighting the recommended side."""
    
    if layout == "3-3":
        # Standard narrow-body layout
        width, height = 200, 120
        seats_left = [(20, 30), (20, 50), (20, 70)]  # Window, Middle, Aisle
        seats_right = [(160, 30), (160, 50), (160, 70)]  # Aisle, Middle, Window
        aisle_x = 100
    else:  # 2-4-2 wide-body layout
        width, height = 280, 120
        seats_left = [(20, 40), (20, 60)]  # Window, Aisle
        seats_center = [(90, 30), (90, 50), (90, 70), (90, 90)]  # Center section
        seats_right = [(240, 40), (240, 60)]  # Aisle, Window
        aisle_x = 60
    
    # Determine highlight color based on recommendation
    if side == "LEFT":
        left_color = "#FFD700"  # Gold for recommended
        right_color = "#E0E0E0"  # Gray for not recommended
    elif side == "RIGHT":
        left_color = "#E0E0E0"
        right_color = "#FFD700"
    else:  # EITHER
        left_color = "#F0F0F0"  # Light gray for both
        right_color = "#F0F0F0"
    
    svg_parts = [
        f'<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">',
        f'<rect width="{width}" height="{height}" fill="white" stroke="black"/>',
        f'<text x="{width//2}" y="15" text-anchor="middle" font-size="12" font-weight="bold">Aircraft Seat Map</text>',
    ]
    
    # Draw seats
    if layout == "3-3":
        # Left side seats
        for i, (x, y) in enumerate(seats_left):
            color = left_color if i == 0 else "#E0E0E0"  # Only window seat highlighted
            svg_parts.append(f'<rect x="{x}" y="{y}" width="15" height="15" fill="{color}" stroke="black"/>')
        
        # Right side seats  
        for i, (x, y) in enumerate(seats_right):
            color = right_color if i == 2 else "#E0E0E0"  # Only window seat highlighted
            svg_parts.append(f'<rect x="{x}" y="{y}" width="15" height="15" fill="{color}" stroke="black"/>')
        
        # Aisle
        svg_parts.append(f'<line x1="{aisle_x}" y1="25" x2="{aisle_x}" y2="95" stroke="blue" stroke-width="2"/>')
        svg_parts.append(f'<text x="{aisle_x}" y="110" text-anchor="middle" font-size="10">Aisle</text>')
    
    # Add labels
    svg_parts.append('<text x="10" y="110" font-size="10">Left</text>')
    svg_parts.append(f'<text x="{width-30}" y="110" font-size="10">Right</text>')
    
    # Add recommendation text
    rec_text = f"Recommended: {side} window"
    svg_parts.append(f'<text x="{width//2}" y="{height-5}" text-anchor="middle" font-size="11" font-weight="bold">{rec_text}</text>')
    
    svg_parts.append('</svg>')
    return ''.join(svg_parts)


def generate_pdf(recommendation: RecommendationResponse, map_png_base64: Optional[str] = None) -> bytes:
    """Generate PDF report with recommendation data and optional map."""
    
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=0.5*inch, bottomMargin=0.5*inch)
    
    # Get styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        spaceAfter=20,
        alignment=TA_CENTER,
        textColor=colors.darkblue
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'], 
        fontSize=14,
        spaceAfter=10,
        textColor=colors.darkblue
    )
    
    # Build content
    content = []
    
    # Title
    content.append(Paragraph("Scenic Seat Recommendation Report", title_style))
    content.append(Spacer(1, 20))
    
    # Recommendation Summary
    content.append(Paragraph("Recommendation Summary", heading_style))
    
    summary_data = [
        ["Recommended Side", recommendation.side],
        ["Confidence Level", recommendation.confidence],
        ["Flight Bearing", f"{recommendation.bearing_deg:.1f}°"],
        ["Sun Azimuth", f"{recommendation.sun_azimuth_deg:.1f}°"],
        ["Relative Angle (Δ)", f"{recommendation.relative_angle_deg:.1f}°"],
        ["Golden Hour", "Yes" if recommendation.golden_hour else "No"],
        ["Stability", recommendation.stability]
    ]
    
    summary_table = Table(summary_data, colWidths=[2.5*inch, 2*inch])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ]))
    
    content.append(summary_table)
    content.append(Spacer(1, 20))
    
    # Solar Information
    content.append(Paragraph("Solar Phase Times", heading_style))
    
    phase_data = [
        ["Civil Dawn", recommendation.phase_times.civil_dawn],
        ["Sunrise", recommendation.phase_times.sunrise],
        ["Sunset", recommendation.phase_times.sunset],
        ["Civil Dusk", recommendation.phase_times.civil_dusk]
    ]
    
    phase_table = Table(phase_data, colWidths=[2*inch, 2.5*inch])
    phase_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    
    content.append(phase_table)
    content.append(Spacer(1, 20))
    
    # Route Midpoint Information
    content.append(Paragraph("Route Analysis", heading_style))
    
    route_data = [
        ["Midpoint Latitude", f"{recommendation.midpoint.lat:.2f}°"],
        ["Midpoint Longitude", f"{recommendation.midpoint.lon:.2f}°"],
        ["Sun Azimuth at Midpoint", f"{recommendation.midpoint.sun_azimuth_deg:.1f}°"],
        ["Route Stability", recommendation.stability]
    ]
    
    route_table = Table(route_data, colWidths=[2.5*inch, 2*inch])
    route_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    
    content.append(route_table)
    content.append(Spacer(1, 20))
    
    # Add seat diagram
    content.append(Paragraph("Seat Diagram", heading_style))
    
    # Create simple text-based seat diagram since we can't easily embed SVG
    if recommendation.side == "LEFT":
        diagram_text = """
        [🟨] [ ] [ ]    [ ] [ ] [ ]
         W   M   A      A   M   W
        
        🟨 = Recommended window seat
        W = Window, M = Middle, A = Aisle
        """
    elif recommendation.side == "RIGHT":
        diagram_text = """
        [ ] [ ] [ ]    [ ] [ ] [🟨]
         W   M   A      A   M   W
        
        🟨 = Recommended window seat  
        W = Window, M = Middle, A = Aisle
        """
    else:
        diagram_text = """
        [?] [ ] [ ]    [ ] [ ] [?]
         W   M   A      A   M   W
        
        ? = Either window seat (low confidence)
        W = Window, M = Middle, A = Aisle
        """
    
    content.append(Paragraph(diagram_text.replace('\n', '<br/>'), styles['Normal']))
    content.append(Spacer(1, 20))
    
    # Add map if provided
    if map_png_base64 and map_png_base64.startswith('data:image/png;base64,'):
        try:
            # Extract base64 data
            base64_data = map_png_base64.split(',')[1]
            image_data = base64.b64decode(base64_data)
            
            # Create image
            img_buffer = io.BytesIO(image_data)
            img = Image(img_buffer)
            
            # Scale image to fit (max 4 inches wide)
            img.drawWidth = min(4*inch, img.imageWidth)
            img.drawHeight = img.imageHeight * (img.drawWidth / img.imageWidth)
            
            content.append(Paragraph("Route Map", heading_style))
            content.append(img)
            content.append(Spacer(1, 10))
            
        except Exception as e:
            # If image processing fails, add note
            content.append(Paragraph("Route Map", heading_style))
            content.append(Paragraph("Map image could not be processed.", styles['Normal']))
            content.append(Spacer(1, 10))
    else:
        content.append(Paragraph("Route Map", heading_style))
        content.append(Paragraph("Map not available - image not provided or invalid format.", styles['Normal']))
        content.append(Spacer(1, 10))
    
    # Add notes and methodology
    content.append(Paragraph("Notes & Methodology", heading_style))
    content.append(Paragraph(recommendation.notes, styles['Normal']))
    content.append(Spacer(1, 10))
    
    methodology_text = """
    This recommendation is based on:
    • Great-circle route calculation between origin and destination
    • Solar position calculation using astronomical algorithms
    • Departure time snapshot (sun position may change during flight)
    • Generic seat map assumption (actual aircraft configuration may vary)
    • Embedded city database (no live geocoding)
    """
    
    content.append(Paragraph(methodology_text, styles['Normal']))
    content.append(Spacer(1, 20))
    
    # Footer
    footer_text = f"Generated on {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC by Scenic Seat API v1.0.0"
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=8,
        alignment=TA_CENTER,
        textColor=colors.grey
    )
    content.append(Paragraph(footer_text, footer_style))
    
    # Build PDF
    doc.build(content)
    
    # Get PDF bytes
    buffer.seek(0)
    return buffer.read()



