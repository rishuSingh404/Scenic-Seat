import './globals.css';
import { ApiProbe } from '@/components/ApiProbe';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DebugDrawer } from '@/components/DebugDrawer';
import { MethodLimits } from '@/components/MethodLimits';

export const metadata = {
  title: 'Scenic Seat',
  description: 'Find the best window seat for your flight',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <ApiProbe />
          {children}
          <ThemeToggle />
          <DebugDrawer />
          <MethodLimits />
        </ThemeProvider>
      </body>
    </html>
  )
}
