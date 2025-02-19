'use client';
import { useState } from 'react';
import { ArrowUp } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [summary, setSummary] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [error, setError] = useState('');

  // Detect language using Chrome AI API
  const detectLanguage = async (text) => {
    if (!text.trim()) {
      setDetectedLanguage('not sure what language this is');
      return;
    }

    try {
      if (!('translation' in self) || !('createDetector' in self.translation)) {
        setError('Language detection is not supported in your browser.');
        return;
      }

      const detector = await self.translation.createDetector();
      const [{ detectedLanguage, confidence }] = await detector.detect(text);
      const languageName = new Intl.DisplayNames(['en'], { type: 'language' }).of(detectedLanguage);
      setDetectedLanguage(`${(confidence * 100).toFixed(1)}% sure that this is ${languageName}`);
    } catch (err) {
      setError('Language detection failed. Please try again.');
      console.error(err);
    }
  };

  // Summarize text using Chrome AI API
  const summarizeText = async () => {
    if (!outputText.trim() || outputText.length <= 150) {
      setError('Text must be longer than 150 characters to summarize.');
      return;
    }

    try {
      if (!('summarization' in self) || !('createSummarizer' in self.summarization)) {
        setError('Summarization is not supported in your browser.');
        return;
      }

      const summarizer = await self.summarization.createSummarizer();
      const summary = await summarizer.summarize(outputText);
      setSummary(summary);
    } catch (err) {
      setError('Summarization failed. Please try again.');
      console.error(err);
    }
  };

  // Translate text using Chrome AI API
  const translateText = async () => {
    if (!outputText.trim()) {
      setError('Please enter text to translate.');
      return;
    }

    try {
      if (!('translation' in self) || !('createTranslator' in self.translation)) {
        setError('Translation is not supported in your browser.');
        return;
      }

      const translator = await self.translation.createTranslator({
        sourceLanguage: 'en',
        targetLanguage: selectedLanguage,
      });
      const translation = await translator.translate(outputText);
      setTranslatedText(translation);
    } catch (err) {
      setError('Translation failed. Please try again.');
      console.error(err);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!inputText.trim()) {
      setError('Please enter some text.');
      return;
    }

    setOutputText(inputText);
    setInputText('');
    setError('');
    setSummary('');
    setTranslatedText('');

    // Detect language
    await detectLanguage(inputText);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-4 md:pl-64">
      <div className="my-8">
        <div className="flex justify-center items-center">
          <Image src="/logo.png" alt="logo" width={70} height={70} className="w-12 h-12 md:w-16 md:h-16" />
          <h1 className="text-2xl md:text-3xl font-bold text-center ml-2">Hi, I'm TextGenie.</h1>
        </div>
        <p className="text-sm mt-2 text-center">How can I help you today?</p>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Output Area */}
        <div className="mb-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p>{outputText}</p>
          {detectedLanguage && <p className="text-sm text-gray-500 mt-2">{detectedLanguage}</p>}
          {summary && (
            <div className="mt-4">
              <p className="font-semibold">Summary:</p>
              <p className="text-gray-700 dark:text-gray-300">{summary}</p>
            </div>
          )}
          {translatedText && (
            <div className="mt-4">
              <p className="font-semibold">Translated Text:</p>
              <p className="text-gray-700 dark:text-gray-300">{translatedText}</p>
            </div>
          )}
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-col md:flex-row justify-center gap-2">
          {outputText.length > 150 && detectedLanguage.includes('English') && (
            <button
              onClick={summarizeText}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Summarize
            </button>
          )}
          <select
            className="p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="pt">Portuguese</option>
            <option value="es">Spanish</option>
            <option value="ru">Russian</option>
            <option value="tr">Turkish</option>
            <option value="fr">French</option>
          </select>
          <button
            onClick={translateText}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Translate
          </button>
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="relative mt-4">
          <textarea
            className="w-full p-4 border bg-gray-800 border-gray-500 rounded-2xl focus:outline-none text-white pr-16"
            placeholder="Enter your text here..."
            rows={5}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button
            type="submit"
            className="absolute bottom-3 right-3 px-2 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <ArrowUp size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}