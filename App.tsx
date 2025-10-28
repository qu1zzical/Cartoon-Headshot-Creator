
import React, { useState, useCallback, ChangeEvent } from 'react';
import { generateCartoonImage } from './services/geminiService';
import { ImageData } from './types';

// SVG Icons defined as React components

const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 01.75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 019.75 22.5a.75.75 0 01-.75-.75v-4.131A15.838 15.838 0 016.382 15H2.25a.75.75 0 01-.75-.75 6.75 6.75 0 017.815-6.666zM15 6.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" clipRule="evenodd" />
    <path d="M5.26 17.242a.75.75 0 10-1.06-1.06 7.5 7.5 0 00-1.06 1.06.75.75 0 101.06 1.06 7.5 7.5 0 001.06-1.06z" />
  </svg>
);

const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center h-full">
    <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-purple-500"></div>
  </div>
);

// Helper function to extract base64 and mimeType from data URL
const dataURLToImageData = (dataUrl: string): ImageData | null => {
    const match = dataUrl.match(/^data:(image\/\w+);base64,(.*)$/);
    if (!match) return null;
    return {
        mimeType: match[1],
        base64: match[2],
    };
}


const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError("Please upload a valid image file (PNG, JPG, etc.).");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setGeneratedImage(null);
        setError(null);
      };
      reader.onerror = () => {
        setError("Failed to read the image file.");
      }
      reader.readAsDataURL(file);
    }
  }, []);

  const handleGenerate = async () => {
    if (!originalImage) {
      setError('Please upload an image first.');
      return;
    }

    const imageData = dataURLToImageData(originalImage);
    if (!imageData) {
        setError('Invalid image data format.');
        return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const generatedBase64 = await generateCartoonImage(imageData, prompt);
      setGeneratedImage(`data:image/png;base64,${generatedBase64}`);
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const downloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = 'cartoon-headshot.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-10">
            <div className="inline-block bg-purple-500/10 p-4 rounded-full mb-4">
                <SparklesIcon className="h-10 w-10 text-purple-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
            Cartoon Headshot Creator
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">
            Transform your photos into stunning cartoon avatars with AI. Upload your image, describe your desired style, and let Gemini work its magic.
            </p>
        </header>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative mb-6 max-w-4xl mx-auto" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Controls Column */}
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 backdrop-blur-sm flex flex-col space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">1. Upload Your Headshot</label>
              <label htmlFor="file-upload" className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md cursor-pointer hover:border-purple-500 transition-colors duration-300">
                <div className="space-y-1 text-center">
                  {originalImage ? (
                     <div className="relative group mx-auto h-40 w-40">
                        <img src={originalImage} alt="Original upload preview" className="h-full w-full rounded-full object-cover shadow-lg border-4 border-gray-700 group-hover:opacity-50 transition-opacity duration-300"/>
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <UploadIcon className="h-10 w-10 text-white"/>
                            <p className="text-white text-sm font-semibold mt-2">Change Image</p>
                        </div>
                     </div>
                  ) : (
                    <>
                      <UploadIcon className="mx-auto h-12 w-12 text-gray-500"/>
                      <p className="text-sm text-gray-400">
                        <span className="font-semibold text-purple-400">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </>
                  )}
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                </div>
              </label>
            </div>

            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-300">2. Describe Your Style (Optional)</label>
              <div className="mt-1">
                <textarea
                  id="prompt"
                  name="prompt"
                  rows={3}
                  className="shadow-sm block w-full sm:text-sm border-gray-600 rounded-md bg-gray-900/50 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  placeholder="e.g., 'Pixar style', 'add a space background', 'make it pop art'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <button
                onClick={handleGenerate}
                disabled={isLoading || !originalImage}
                className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-gray-900 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 group"
            >
                {isLoading ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                    </>
                ) : (
                    <>
                      <SparklesIcon className="w-5 h-5 mr-2 -ml-1 group-hover:scale-110 transition-transform"/>
                      Generate Headshot
                    </>
                )}
            </button>
          </div>

          {/* Result Column */}
          <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 flex flex-col items-center justify-center min-h-[300px] lg:min-h-full">
            <div className="w-full max-w-md aspect-square">
              {isLoading ? (
                <LoadingSpinner />
              ) : generatedImage ? (
                <div className="flex flex-col items-center space-y-4 h-full">
                   <img src={generatedImage} alt="Generated cartoon headshot" className="w-full h-full object-contain rounded-lg shadow-2xl"/>
                   <button onClick={downloadImage} className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 focus:ring-offset-gray-900 transition-colors">
                      Download Image
                   </button>
                </div>
              ) : (
                <div className="text-center text-gray-500 flex flex-col items-center justify-center h-full">
                    <SparklesIcon className="w-16 h-16 mb-4 text-gray-600" />
                    <h3 className="text-xl font-semibold text-gray-400">Your cartoon will appear here</h3>
                    <p className="mt-1 text-sm">Upload an image and click "Generate" to see the result.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
