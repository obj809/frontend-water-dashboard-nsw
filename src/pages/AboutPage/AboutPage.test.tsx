// src/pages/AboutPage/AboutPage.test.tsx
import { render, screen } from '@testing-library/react';
import AboutPage from './AboutPage';


describe('AboutPage', () => {
  it('renders heading and content', () => {
    render(<AboutPage />);
    expect(screen.getByRole('heading', { name: /about this project/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/about page/i)).toBeInTheDocument();
    expect(screen.getByText(/WaterNSW manages key dams/i)).toBeInTheDocument();
  });

  it('includes the footer', () => {
    render(<AboutPage />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
