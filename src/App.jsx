import React, { useState, useEffect } from 'react';
import { 
  Download, Link2, Youtube, Music, Film, 
  CheckCircle2, AlertCircle, Clock, ChevronRight, 
  Loader2, Play, HardDriveDownload
} from 'lucide-react';

export default function App() {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [videoData, setVideoData] = useState(null);
  const [activeTab, setActiveTab] = useState('video');
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('yt_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history");
      }
    }
  }, []);

  const extractVideoId = (urlStr) => {
    const match = urlStr.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]{11})/);
    return match ? match[1] : null;
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    
    const videoId = extractVideoId(url);
    if (!videoId) {
      setError('Please enter a valid YouTube URL');
      return;
    }

    setError('');
    setIsAnalyzing(true);
    setVideoData(null);

    try {
      const response = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
      const data = await response.json();

      const fetchedData = {
        id: videoId,
        title: data.title || "YouTube Video",
        channel: data.author_name || "YouTube Channel",
        duration: "Ready", 
        views: "N/A", 
        thumbnail: data.thumbnail_url || `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
        url: url,
        formats: {
          video: [
            { id: 'v1', quality: '4K (2160p)', size: '420 MB', format: 'MP4', icon: <Film size={16} /> },
            { id: 'v2', quality: 'HD (1080p)', size: '156 MB', format: 'MP4', icon: <Film size={16} /> },
            { id: 'v3', quality: 'SD (720p)', size: '84 MB', format: 'MP4', icon: <Film size={16} /> },
          ],
          audio: [
            { id: 'a1', quality: 'High (320kbps)', size: '12 MB', format: 'MP3', icon: <Music size={16} /> },
            { id: 'a2', quality: 'Standard (128kbps)', size: '5 MB', format: 'MP3', icon: <Music size={16} /> },
          ]
        }
      };

      setVideoData(fetchedData);
      
      const newHistory = [fetchedData, ...history.filter(h => h.id !== fetchedData.id)].slice(0, 4);
      setHistory(newHistory);
      localStorage.setItem('yt_history', JSON.stringify(newHistory));
      
    } catch (err) {
      setError('Failed to fetch video details. Please check the URL.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownload = (formatId) => {
    setDownloadingId(formatId);
    setDownloadProgress(0);

    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setDownloadingId(null), 1000);
          return 100;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#05050A] text-slate-200 font-sans selection:bg-pink-500/30 overflow-x-hidden relative">
      <div className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-700/20 rounded-full mix-blend-screen filter blur-[140px] opacity-70 pointer-events-none animate-pulse duration-1000"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-pink-700/10 rounded-full mix-blend-screen filter blur-[140px] opacity-70 pointer-events-none"></div>

      <nav className="relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
              <HardDriveDownload size={22} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Nexus<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400">DL</span>
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Features</a>
            <a href="#" className="hover:text-white transition-colors">Supported Sites</a>
            <button className="px-5 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-white">
              Upgrade to Pro
            </button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            v2.0 Engine Now Live
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-6">
            Download Any Video. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
              Instantly.
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Paste your link below to extract high-quality video or audio formats. 
            Fast, secure, and built for the modern web.
          </p>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-3 shadow-2xl mb-12">
          <form onSubmit={handleAnalyze} className="relative flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow flex items-center">
              <Link2 className="absolute left-5 text-slate-500" size={24} />
              <input 
                type="text" 
                placeholder="Paste YouTube video URL here..." 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full h-16 bg-black/40 border border-white/5 rounded-2xl pl-14 pr-6 text-lg text-white placeholder-slate-500 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/50 transition-all"
                disabled={isAnalyzing}
              />
            </div>
            <button 
              type="submit" 
              disabled={isAnalyzing || !url.trim()}
              className="h-16 px-8 rounded-2xl bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-semibold text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_30px_-5px_rgba(236,72,153,0.4)]"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Analyzing...
                </>
              ) : (
                <>
                  Extract
                  <ChevronRight size={20} />
                </>
              )}
            </button>
          </form>
          {error && (
            <div className="mt-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle size={18} />
              {error}
            </div>
          )}
        </div>

        {videoData && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
            <div className="bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-2/5 p-6 md:border-r border-white/10 bg-black/20">
                  <div className="relative rounded-2xl overflow-hidden aspect-video mb-4 group cursor-pointer">
                    <img src={videoData.thumbnail} alt={videoData.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                          <Play className="text-white ml-1" fill="white" size={20} />
                       </div>
                    </div>
                    <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-2 py-1 rounded-md text-xs font-medium text-white">
                      {videoData.duration}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white line-clamp-2 leading-snug mb-2">{videoData.title}</h3>
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span className="flex items-center gap-1.5"><Youtube size={16} className="text-pink-500"/> {videoData.channel}</span>
                    <span>{videoData.views} views</span>
                  </div>
                </div>

                <div className="w-full md:w-3/5 p-6">
                  <div className="flex p-1 bg-black/30 rounded-xl mb-6">
                    <button 
                      onClick={() => setActiveTab('video')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'video' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
                    >
                      <Film size={18} /> Video
                    </button>
                    <button 
                      onClick={() => setActiveTab('audio')}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'audio' ? 'bg-white/10 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
                    >
                      <Music size={18} /> Audio Only
                    </button>
                  </div>

                  <div className="space-y-3">
                    {videoData.formats[activeTab].map((format) => (
                      <div key={format.id} className="group relative overflow-hidden flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/[0.07] transition-all">
                        {downloadingId === format.id && (
                           <div 
                              className="absolute left-0 top-0 bottom-0 bg-indigo-500/20 transition-all duration-300"
                              style={{ width: `${downloadProgress}%` }}
                           ></div>
                        )}
                        
                        <div className="relative z-10 flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activeTab === 'video' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-pink-500/20 text-pink-400'}`}>
                            {format.icon}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-200">{format.quality}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">{format.format} • {format.size}</div>
                          </div>
                        </div>

                        <button 
                          onClick={() => handleDownload(format.id)}
                          disabled={downloadingId !== null}
                          className="relative z-10 w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white hover:bg-indigo-500 hover:shadow-[0_0_20px_-5px_rgba(99,102,241,0.5)] transition-all disabled:opacity-50 disabled:hover:bg-white/10"
                        >
                          {downloadingId === format.id ? (
                            downloadProgress >= 100 ? <CheckCircle2 size={20} className="text-green-400" /> : <span className="text-xs font-bold">{downloadProgress}%</span>
                          ) : (
                            <Download size={20} />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}

        {history.length > 0 && !videoData && (
          <div className="mt-16 animate-in fade-in duration-1000">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Clock size={20} className="text-indigo-400" /> Recent Downloads
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {history.map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer" onClick={() => setUrl(item.url)}>
                  <img src={item.thumbnail} alt="thumb" className="w-24 h-16 object-cover rounded-lg" />
                  <div className="flex flex-col justify-center">
                    <h4 className="text-sm font-medium text-slate-200 line-clamp-1">{item.title}</h4>
                    <span className="text-xs text-slate-500 mt-1">{item.channel}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
