import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import AISettingTabs from '../renderer/pages/Pile/Settings/AISettingsTabs';

jest.mock('renderer/context/AIContext', () => ({
  useAIContext: () => ({
    prompt: 'prompt',
    setPrompt: jest.fn(),
    updateSettings: jest.fn(),
    setBaseUrl: jest.fn(),
    getKey: jest.fn(),
    setKey: jest.fn(),
    deleteKey: jest.fn(),
    model: 'gpt-4o',
    setModel: jest.fn(),
    baseUrl: 'https://api.openai.com/v1',
  }),
}));

jest.mock('renderer/context/PilesContext', () => ({
  availableThemes: {
    light: { primary: '#ddd', secondary: '#fff' },
  },
  usePilesContext: () => ({
    currentTheme: 'light',
    setTheme: jest.fn(),
  }),
}));

describe('AISettingTabs', () => {
  it('does not render Ollama provider settings', () => {
    render(<AISettingTabs APIkey="" setCurrentKey={jest.fn()} />);

    expect(screen.queryByText(/Ollama API/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Setup Ollama/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Embedding model/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Base URL/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Model/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/OpenAI API key/i)).toBeInTheDocument();
  });
});
