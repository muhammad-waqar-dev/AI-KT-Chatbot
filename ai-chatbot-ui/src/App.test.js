import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders header title', () => {
  render(<App />);
  const headerElement = screen.getByText(/AI KT Assistant/i);
  expect(headerElement).toBeInTheDocument();
});

test('input field accepts text', () => {
  render(<App />);
  const input = screen.getByPlaceholderText(/Ask a question about Todo App/i);
  fireEvent.change(input, { target: { value: 'How does it work?' } });
  expect(input.value).toBe('How does it work?');
});

test('send button is disabled when input is empty', () => {
  render(<App />);
  const button = screen.getByRole('button');
  expect(button).toBeDisabled();
});

