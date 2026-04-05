/* eslint-disable react/prop-types */
import React from 'react';
import { useAIContext } from 'renderer/context/AIContext';
import styles from './AISettingTabs.module.scss';

export default function AISettingTabs({ APIkey, setCurrentKey }) {
  const { setBaseUrl, model, setModel, baseUrl } = useAIContext();

  const handleInputChange = (setter) => (e) => setter(e.target.value);

  return (
    <div className={styles.providers}>
      <div className={styles.pitch}>
        Create an API key in your OpenAI account and paste it here to start
        using GPT AI models in Pile.
      </div>

      <div className={styles.group}>
        <label className={styles.fieldset} htmlFor="openai-base-url">
          <span className={styles.label}>Base URL</span>
          <input
            id="openai-base-url"
            className={styles.input}
            onChange={handleInputChange(setBaseUrl)}
            value={baseUrl}
            placeholder="https://api.openai.com/v1"
          />
        </label>
        <label className={styles.fieldset} htmlFor="openai-model">
          <span className={styles.label}>Model</span>
          <input
            id="openai-model"
            className={styles.input}
            onChange={handleInputChange(setModel)}
            value={model}
            placeholder="gpt-4o"
          />
        </label>
      </div>
      <label className={styles.fieldset} htmlFor="openai-api-key">
        <span className={styles.label}>OpenAI API key</span>
        <input
          id="openai-api-key"
          className={styles.input}
          onChange={handleInputChange(setCurrentKey)}
          value={APIkey}
          placeholder="Paste an OpenAI API key to enable AI reflections"
        />
      </label>
      <div className={styles.disclaimer}>
        Remember to manage your spend by setting up a budget in the API service
        you choose to use.
      </div>
    </div>
  );
}
