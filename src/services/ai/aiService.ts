import { AIProvider } from './types';
import { demoProvider } from './demoProvider';
import { ollamaProvider, getOllamaConfig } from './ollamaProvider';

export { getOllamaConfig };

export const getProviders = (): AIProvider[] => {
  return [ollamaProvider, demoProvider];
};

export const getSelectedProviderId = (): 'ollama' | 'demo' => {
  const saved = localStorage.getItem('studybuddy_active_provider');
  if (saved === 'ollama' || saved === 'demo') {
    return saved;
  }
  return 'demo'; // Default to offline demo to ensure seamless zero-config first load
};

export const setSelectedProviderId = (id: 'ollama' | 'demo') => {
  localStorage.setItem('studybuddy_active_provider', id);
};

export const getActiveProvider = (): AIProvider => {
  const id = getSelectedProviderId();
  if (id === 'ollama') return ollamaProvider;
  return demoProvider;
};
