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
  self.summarization = self.summarization || mockChromeAI.summarization;
  self.translation = self.translation || mockChromeAI.translation;
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
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || !lastMessage.text.trim() || lastMessage.text.length <= 150) {
      setError('Text must be longer than 150 characters to summarize.');
      return;
    }

    try {
      const summarizer = await self.summarization.createSummarizer();
      const summary = await summarizer.summarize(lastMessage.text);
      setMessages((prevMessages) => [...prevMessages, { text: summary, sender: 'bot' }]);
    } catch (err) {
      setError('Summarization failed. Please try again.');
      console.error(err);
    }
  };

  const translateText = async () => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || !lastMessage.text.trim()) {
      setError('Please enter text to translate.');
      return;
    }

    try {
      const translator = await self.translation.createTranslator({
        sourceLanguage: detectedLanguage || 'en',
        targetLanguage: selectedLanguage,
      });
      const translation = await translator.translate(lastMessage.text);
      setMessages((prevMessages) => [...prevMessages, { text: translation, sender: 'bot' }]);
    } catch (err) {
      setError('Translation failed. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-4 md:pl-64">
      <div className="my-8 flex justify-center items-center">
        <Image src="/logo.png" alt="logo" width={70} height={70} className="w-12 h-12 md:w-16 md:h-16" />
        <h1 className="text-2xl md:text-3xl font-bold text-center ml-2">Hi, I'm TextGenie.</h1>
      </div>
      <div className="max-w-2xl mx-auto">
        <div>
          {messages.map((message, index) => (
            <div key={index} className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block p-3 rounded-lg ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'}`}>{message.text}</div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="relative mt-4">
          <textarea className="w-full p-4 border bg-gray-800 border-gray-500 rounded-2xl focus:outline-none text-white pr-16" placeholder="Enter your text here..." rows={5} value={inputText} onChange={(e) => setInputText(e.target.value)} />
          <button type="submit" className="absolute bottom-3 right-3 px-2 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"><ArrowUp size={18} /></button>
        </form>
      </div>
    </div>
  );
}
