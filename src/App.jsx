import React, { useState, useEffect, useRef } from 'react';
import { Tv, Music, Download, Clock, AlertCircle, Loader2 } from 'lucide-react';

const App = () => {
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState('mp4');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [history, setHistory] = useState([]);
  const iframeRef = useRef(null);

  // Load history on mount
  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem('yt_history')) || [];
    setHistory(savedHistory);
  }, []);

  // Simple URL parser to extract Video ID for thumbnails
  const extractVideoId = (link) => {
    const match = link.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/);
    return match ? match[1] : null;
  };

  const fetchMetadata = async (videoUrl) => {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) throw new Error("Invalid YouTube URL");
    
    // In a production environment, use a CORS-friendly proxy or your own backend.
    // For this implementation, we use the universally available standard YT thumbnail route.
    return {
      title: "Video Metadata Proxied Title", // Requires actual proxy backend to fetch title
      thumbnail: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
      id: videoId,
      url: videoUrl
    };
  };

  const handleProcess = async (e) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError(null);
    setMetadata(null);

    try {
      // 1. Fetch Metadata
      const data = await fetchMetadata(url);
      setMetadata(data);

      // 2. Trigger Background Conversion Engine (e.g., Oceansaver or Custom backend)
      // This is a placeholder for your actual API call. 
      // Replace with your CORS-aware server-side bridge fetch.
      const downloadLink = await mockConversionAPI(data.id, format);

      // 3. Trigger Native Download via Hidden Iframe
      if (iframeRef.current) {
        iframeRef.current.src = downloadLink;
      }

      // 4. Update History (keep last 4)
      const newHistory = [data, ...history.filter(h => h.id !== data.id)].slice(0, 4);
      setHistory(newHistory);
      localStorage.setItem('yt_history', JSON.stringify(newHistory));

    } catch (err) {
      setError(err.message || "Failed to process the video. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // MOCK API: Replace this with your actual conversion API logic
  const mockConversionAPI = (id, format) => {
    return new Promise((resolve) => {
      // Actual implementation shouldn't simulate time, but wait for the real server response.
      // This timeout simply mimics waiting for the server-side extraction.
      setTimeout(() => {
        resolve(`https://your-server.com/api/download?id=${id}&format=${format}`);
      }, 2500); 
    });
  };

  return (
    <div className="min-h-screen bg-[#05050A] text-white font-sans selection:bg-purple-500/30 flex flex-col items-center justify-center p-4 sm:p-8">
      
      {/* Invisible Iframe for triggering native downloads without redirects */}
      <iframe ref={iframeRef} className="hidden" title="download-trigger" />

      <main className="w-full max-w-2xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
            Extract & Download
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-md mx-auto">
            High-performance engine. Zero redirects. Pure native speeds.
          </p>
        </div>

        {/* Main Glassmorphism Card */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
          
          <form onSubmit={handleProcess} className="space-y-6">
            {/* Input Field */}
            <div className="relative">
              <input
                type="url"
                required
                placeholder="Paste YouTube URL here..."
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-lg"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Format Selection Tabs */}
            <div className="flex bg-black/40 rounded-xl p-1 border border-white/5">
              <button
                type="button"
                onClick={() => setFormat('mp4')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all ${
                  format === 'mp4' ? 'bg-white/10 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Tv size={18} /> Video (MP4)
              </button>
              <button
                type="button"
                onClick={() => setFormat('mp3')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all ${
                  format === 'mp3' ? 'bg-white/10 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Music size={18} /> Audio (MP3)
              </button>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-center gap-3 text-sm">
                <AlertCircle size={18} className="shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Download Action Button */}
            <button
              type="submit"
              disabled={loading || !url}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg py-4 rounded-2xl shadow-[0_0_40px_-10px_rgba(168,85,247,0.5)] transition-all flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Extracting...
                </>
              ) : (
                <>
                  <Download size={24} />
                  Download Now
                </>
              )}
            </button>
          </form>

          {/* Current Metadata Display */}
          {metadata && !loading && (
            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-4 bg-black/30 p-3 rounded-2xl border border-white/5">
                <img src={metadata.thumbnail} alt="Thumbnail" className="w-24 h-16 object-cover rounded-xl" />
                <div className="overflow-hidden">
                  <p className="text-white font-medium truncate text-sm">Ready: {format.toUpperCase()}</p>
                  <p className="text-gray-400 text-xs truncate mt-1">Check your browser's download manager.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* History Section */}
        {history.length > 0 && (
          <div className="mt-10">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock size={16} /> Recent Extractions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {history.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => setUrl(item.url)}
                  className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/5 transition-colors p-2 rounded-xl text-left"
                >
                  <img src={item.thumbnail} alt="" className="w-16 h-10 object-cover rounded-lg" />
                  <div className="overflow-hidden flex-1">
                    <p className="text-gray-300 text-xs truncate">youtu.be/{item.id}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Decorative Background Elements */}
      <div className="fixed top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-pink-600/10 blur-[120px] pointer-events-none" />
    </div>
  );
};

export default App;
