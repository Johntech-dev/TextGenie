'use client';
import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import Image from 'next/image';

// Custom summarization logic
const summarizeTextCustom = (text) => {
  const sentences = text.split(/[.!?]/).filter((s) => s.trim().length > 0);
  return sentences.slice(0, 2).join('. ') + '.';
};

// Mock Chrome AI API
const mockChromeAI = {
  summarization: {
    createSummarizer: async () => ({
      summarize: async (text) => summarizeTextCustom(text),
    }),
  },
  translation: {
    createTranslator: async ({ targetLanguage }) => ({
      translate: async (text) => {
        if (targetLanguage === 'en') {
          return text;
        }
        return `Translated to ${targetLanguage}: ${text}`;
      },
    }),
  },
};

// Use the mock API if the real Chrome API is not available
if (!('summarization' in self)) {
  self.summarization = mockChromeAI.summarization;
}
if (!('translation' in self)) {
  self.translation = mockChromeAI.translation;
}

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [summary, setSummary] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [translatedSummary, setTranslatedSummary] = useState('');
  const [error, setError] = useState('');
  const [isModelDownloading, setIsModelDownloading] = useState(false);
  const [originalText, setOriginalText] = useState('');

  // Debugging: Log outputText changes
  useEffect(() => {
    console.log("Output Text Updated:", outputText);
    console.log("Output Text Length:", outputText.length);
  }, [outputText]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!inputText.trim()) {
      setError('Please enter some text.');
      return;
    }

    console.log("Input Text:", inputText); // Debugging
    console.log("Input Text Length:", inputText.length); // Debugging

    setOutputText(inputText);
    setOriginalText(inputText);
    setInputText('');
    setError('');
    setSummary('');
    setTranslatedText('');
    setTranslatedSummary('');

    console.log("Output Text:", outputText); // Debugging
    console.log("Output Text Length:", outputText.length); // Debugging

    await detectLanguage(inputText);
  };

  // Detect language using the Language Detector API
  const detectLanguage = async (text) => {
    if (!text.trim()) {
      setDetectedLanguage('not sure what language this is');
      return;
    }

    try {
      if (!('ai' in self) || !('languageDetector' in self.ai)) {
        setError('Language Detection API is not supported in your browser.');
        return;
      }

      const capabilities = await self.ai.languageDetector.capabilities();
      if (capabilities.capabilities === 'no') {
        setError('Language Detection API is not usable at the moment.');
        return;
      }

      let detector;
      if (capabilities.capabilities === 'readily') {
        detector = await self.ai.languageDetector.create();
      } else if (capabilities.capabilities === 'after-download') {
        setIsModelDownloading(true);
        detector = await self.ai.languageDetector.create({
          monitor(m) {
            m.addEventListener('downloadprogress', (e) => {
              console.log(`Downloaded ${e.loaded} of ${e.total} bytes.`);
            });
          },
        });
        await detector.ready;
        setIsModelDownloading(false);
      }

      const results = await detector.detect(text);
      if (results.length > 0) {
        const { detectedLanguage, confidence } = results[0];
        const languageName = new Intl.DisplayNames(['en'], { type: 'language' }).of(detectedLanguage);
        setDetectedLanguage(`${(confidence * 100).toFixed(1)}% sure that this is ${languageName}`);
      } else {
        setDetectedLanguage('Language detection failed.');
      }
    } catch (err) {
      setError('Language detection failed. Please try again.');
      console.error(err);
    }
  };

  // Summarize text using the custom implementation
  const summarizeText = async () => {
    if (!outputText.trim() || outputText.length <= 150) {
      setError('Text must be longer than 150 characters to summarize.');
      return;
    }

    try {
      if (!('summarization' in self) || !('createSummarizer' in self.summarization)) {
        setError('Summarization API is not supported in your browser.');
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

  // Translate text using the Translator API
  const translateText = async () => {
    if (!outputText.trim()) {
      setError('Please enter text to translate.');
      return;
    }

    try {
      if (!('translation' in self) || !('createTranslator' in self.translation)) {
        setError('Translation API is not supported in your browser.');
        return;
      }

      const translator = await self.translation.createTranslator({
        sourceLanguage: detectedLanguage || 'en',
        targetLanguage: selectedLanguage,
      });

      const translation = await translator.translate(outputText);
      setTranslatedText(translation);

      if (summary) {
        const translatedSummary = await translator.translate(summary);
        setTranslatedSummary(translatedSummary);
      }
    } catch (err) {
      setError('Translation failed. Please try again.');
      console.error(err);
    }
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
          {translatedSummary && (
            <div className="mt-4">
              <p className="font-semibold">Translated Summary:</p>
              <p className="text-gray-700 dark:text-gray-300">{translatedSummary}</p>
            </div>
          )}
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          {isModelDownloading && <p className="text-sm text-blue-500 mt-2">Downloading language detection model...</p>}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-col md:flex-row justify-center gap-2">
          {/* Always show the Summarize button */}
          <button
            onClick={summarizeText}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Summarize
          </button>
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