'use client';
import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import Image from 'next/image';


const summarizeTextCustom = (text) => {
  const sentences = text.split(/[.!?]/).filter((s) => s.trim().length > 0);
  return sentences.slice(0, 2).join('. ') + '.';
};

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

if (typeof window !== 'undefined') {
  if (!('summarization' in self)) {
    self.summarization = mockChromeAI.summarization;
  }
  if (!('translation' in self)) {
    self.translation = mockChromeAI.translation;
  }
}

export default function Home() {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([]);
  const [detectedLanguage, setDetectedLanguage] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [error, setError] = useState('');
  const [isModelDownloading, setIsModelDownloading] = useState(false);


  useEffect(() => {
    console.log("Messages Updated:", messages);
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!inputText.trim()) {
      setError('Please enter some text.');
      return;
    }

    const userMessage = { text: inputText, sender: 'user' };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputText('');
    setError('');

    await detectLanguage(inputText);
  };


  const detectLanguage = async (text) => {
    if (typeof window === 'undefined') {
      setError('Language Detection API is not supported in this environment.');
      return;
    }

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

  const summarizeText = async () => {
    if (typeof window === 'undefined') {
      setError('Summarization API is not supported in this environment.');
      return;
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || !lastMessage.text.trim() || lastMessage.text.length <= 150) {
      setError('Text must be longer than 150 characters to summarize.');
      return;
    }

    try {
      if (!('summarization' in self) || !('createSummarizer' in self.summarization)) {
        setError('Summarization API is not supported in your browser.');
        return;
      }

      const summarizer = await self.summarization.createSummarizer();
      const summary = await summarizer.summarize(lastMessage.text);
      const summaryMessage = { text: summary, sender: 'bot' };
      setMessages((prevMessages) => [...prevMessages, summaryMessage]);
    } catch (err) {
      setError('Summarization failed. Please try again.');
      console.error(err);
    }
  };
  const translateText = async () => {
    if (typeof window === 'undefined') {
      setError('Translation API is not supported in this environment.');
      return;
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || !lastMessage.text.trim()) {
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

      const translation = await translator.translate(lastMessage.text);
      const translationMessage = { text: translation, sender: 'bot' };
      setMessages((prevMessages) => [...prevMessages, translationMessage]);
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
        <div className="">
          {messages.map((message, index) => (
            <div key={index} className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block p-3 rounded-lg ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'}`}>
                <p>{message.text}</p>
              </div>
            </div>
          ))}
          {detectedLanguage && <p className="text-sm text-gray-500 mt-2">{detectedLanguage}</p>}
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          {isModelDownloading && <p className="text-sm text-blue-500 mt-2">Downloading language detection model...</p>}
        </div>
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

        <div className="mt-4 flex flex-col md:flex-row justify-center gap-2">
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
      </div>
    </div>
  );
}