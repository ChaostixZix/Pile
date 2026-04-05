/* eslint react/prop-types: 0 */
import {
  useState,
  createContext,
  useContext,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import OpenAI from 'openai';
import { useElectronStore } from 'renderer/hooks/useElectronStore';
import { usePilesContext } from './PilesContext';

const OPENAI_URL = 'https://api.openai.com/v1';
const DEFAULT_PROMPT =
  'You are an AI within a journaling app. Your job is to help the user reflect on their thoughts in a thoughtful and kind manner. The user can never directly address you or directly respond to you. Try not to repeat what the user said, instead try to seed new ideas, encourage or debate. Keep your responses concise, but meaningful.';

export const AIContext = createContext();

export function AIContextProvider({ children }) {
  const { currentPile, updateCurrentPile } = usePilesContext();
  const [ai, setAi] = useState(null);
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [model, setModel] = useElectronStore('model', 'gpt-4o');
  const [baseUrl, setBaseUrl] = useElectronStore('baseUrl', OPENAI_URL);

  const cleanupLegacySettings = useCallback(async () => {
    await Promise.all([
      window.electron.settingsUnset('pileAIProvider'),
      window.electron.settingsUnset('embeddingModel'),
    ]);
  }, []);

  const setupAi = useCallback(async () => {
    const key = await window.electron.ipc.invoke('get-ai-key');
    if (!key) {
      setAi(null);
      return;
    }

    const openaiInstance = new OpenAI({
      baseURL: baseUrl,
      apiKey: key,
      dangerouslyAllowBrowser: true,
    });
    setAi({ type: 'openai', instance: openaiInstance });
  }, [baseUrl]);

  useEffect(() => {
    cleanupLegacySettings();
  }, [cleanupLegacySettings]);

  useEffect(() => {
    if (currentPile?.AIPrompt) {
      setPrompt(currentPile.AIPrompt);
    }

    setupAi();
  }, [currentPile, setupAi]);

  const generateCompletion = useCallback(
    async (context, callback) => {
      if (!ai) return;

      const stream = await ai.instance.chat.completions.create({
        model,
        stream: true,
        max_tokens: 500,
        messages: context,
      });

      const reader = async () => {
        const next = await stream.next();

        if (next.done) {
          return;
        }

        callback(next.value.choices[0].delta.content);
        await reader();
      };

      await reader();
    },
    [ai, model],
  );

  const prepareCompletionContext = useCallback(
    (thread) => {
      return [
        { role: 'system', content: prompt },
        {
          role: 'system',
          content: 'You can only respond in plaintext, do NOT use HTML.',
        },
        ...thread.map((post) => ({ role: 'user', content: post.content })),
      ];
    },
    [prompt],
  );

  const checkApiKeyValidity = useCallback(async () => {
    const key = await window.electron.ipc.invoke('get-ai-key');
    return key !== null;
  }, []);

  const setKey = useCallback(
    (secretKey) => window.electron.ipc.invoke('set-ai-key', secretKey),
    [],
  );

  const getKey = useCallback(
    () => window.electron.ipc.invoke('get-ai-key'),
    [],
  );

  const deleteKey = useCallback(
    () => window.electron.ipc.invoke('delete-ai-key'),
    [],
  );

  const updateSettings = useCallback(
    (newPrompt) => updateCurrentPile({ ...currentPile, AIPrompt: newPrompt }),
    [currentPile, updateCurrentPile],
  );

  const AIContextValue = useMemo(
    () => ({
      ai,
      baseUrl,
      setBaseUrl,
      prompt,
      setPrompt,
      setKey,
      getKey,
      validKey: checkApiKeyValidity,
      deleteKey,
      updateSettings,
      model,
      setModel,
      generateCompletion,
      prepareCompletionContext,
    }),
    [
      ai,
      baseUrl,
      setBaseUrl,
      prompt,
      setPrompt,
      setKey,
      getKey,
      checkApiKeyValidity,
      deleteKey,
      updateSettings,
      model,
      setModel,
      generateCompletion,
      prepareCompletionContext,
    ],
  );

  return (
    <AIContext.Provider value={AIContextValue}>{children}</AIContext.Provider>
  );
}

export const useAIContext = () => useContext(AIContext);
