import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the home', () => {
  render(<App />);
  const linkElement = screen.getByText(/IPTV/);
  expect(linkElement).toBeInTheDocument();
});
