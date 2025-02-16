import Image from "next/image";

export default function Home() {
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
        {/* Output Area */}
        <div className="mb-4 p-4">
          <p>This is where the output text will appear.</p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Detected Language: <strong>English</strong></p>
        </div>

        {/* Input Area */}
        <div className="relative">
        <textarea
            className="w-full p-4 border bg-gray-800 border-gray-500 rounded-2xl focus:outline-none text-white pr-16"
            placeholder="Enter your text here..."
            rows={4}
          />
          <button
            className="absolute bottom-3 right-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Send
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
          <p>This is where the processed text (summary or translation) will appear.</p>
        </div>
      </div>
    </div>
  );
}