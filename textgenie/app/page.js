'use client'
import { ArrowUp } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
 
  const [inputText, setInputText]= useState('')
  const [outputText, setOutputText] = useState('')
  const [detectedText, setDetectedText] = useState('')
  const [processedText, setProcessedText] = useState('')


  // function to handle send button

  // const handleSend = () => {
  //   if (!inputText.trim()) {
  //     alert('Please enter some text');
  //     return;
  //   }

    // Display OutputText
    // setOutputText(inputText);

    // setDetectedLanguage('');
    // setProcessedText('');

  //  const language = await detectlanguage(inputText);
  //  setDetectedLanguage(language)
  // }

  // const detectlanguage = async (text) => {
  //    try {
  //     const response = await
  //    } catch (error) {
      
  //    }
  }



  return (
    <div className="min-h-screen ml-28 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-4">
      {/* Heading */}
      <div className=" my-8">
      <div className="flex justify-center items-center">
        <Image src="/logo.png" alt="logo" width={70} height={70} />
      <h1 className="text-3xl font-bold text-center">Hi, I'm TextGenie.</h1>
        </div>
      <p className="text-sm mt-2 text-center">How can I help you today?</p>
      </div>

      {/* Container for the Interface */}
      <div className="max-w-2xl mx-auto ">
        <p>{outputText}</p>
        <div className="mb-4 p-4">
        {detectedLanguage && (
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Detected Language: <strong>{detectedLanguage}</strong></p>
          )}
        </div>

        {/* Input Area */}
        <div className="relative">
        <textarea
            className="w-full p-4 border bg-gray-800 border-gray-500 rounded-2xl focus:outline-none text-white pr-16"
            placeholder="Enter your text here..."
            rows={5}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button
            className="absolute bottom-3 right-3 px-1 
            py-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onClick={handleSend}
          >
           <ArrowUp />
          </button>
        </div>


        {/* Action Buttons */}
        <div className="mt-4 flex justify-center gap-2">
          <button
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Summarize
          </button>
          <select
            className="p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="en">English</option>
            <option value="pt">Portuguese</option>
            <option value="es">Spanish</option>
            <option value="ru">Russian</option>
            <option value="tr">Turkish</option>
            <option value="fr">French</option>
          </select>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Translate
          </button>
        </div>

        {/* Processed Output */}
        <div className="mt-4 p-4 justify-center text-center">
          {/* <p>This is where the processed text (summary or translation) will appear.</p> */}
        </div>
      </div>
    </div>
  );
}