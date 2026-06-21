"use client";
import React, { useState } from "react";
import { 
  PlayCircle, Film, Music, Search, Maximize2, Minimize2, X, AlertTriangle, 
  ChevronUp, ChevronDown, Monitor, Sparkles
} from "lucide-react";
import { themeColors } from "@/app/theme/colors";

interface CatalogItem {
  id: string;
  title: string;
  type: string;
  genre: string;
  description?: string;
  thumbnailUrl?: string;
  bannerUrl?: string;
  mediaUrl?: string;
  duration?: number;
  isFeatured?: boolean;
  isPublished?: boolean;
}

interface PlayerProps {
  importedContent: CatalogItem[];
  onSearchTMDB: (query: string) => Promise<any[]>;
}

export default function Player({ importedContent, onSearchTMDB }: PlayerProps) {
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  
  // Library Tabs: "catalog" (local DB) or "tmdb" (live TMDB search)
  const [activeLibraryTab, setActiveLibraryTab] = useState<"catalog" | "tmdb">("catalog");
  const [mediaTypeFilter, setMediaTypeFilter] = useState<"all" | "video" | "audio">("all");

  // Live TMDB Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Floating Mini Player States
  const [miniPlayerItem, setMiniPlayerItem] = useState<any | null>(null);
  const [miniPlayerSize, setMiniPlayerSize] = useState<"sm" | "md" | "minimized">("sm");

  const formatTime = (seconds?: number): string => {
    if (seconds === undefined) return "Unknown";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const filteredCatalog = importedContent.filter(item => {
    if (mediaTypeFilter === "all") return true;
    if (mediaTypeFilter === "video") {
      return item.type === "MOVIE" || item.type === "SERIES" || item.type === "TV_SHOW";
    }
    return item.type === "SONG" || item.type === "PODCAST";
  });

  const handleTmdbSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSearchError(null);
    try {
      const results = await onSearchTMDB(searchQuery);
      setSearchResults(results);
    } catch (err) {
      setSearchError("Failed loading TMDB search query results.");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSelectMiniPlayer = (item: any, type: "MOVIE" | "SERIES" | "CATALOG") => {
    let url = "";
    if (type === "CATALOG") {
      url = item.mediaUrl || "";
    } else {
      url = type === "SERIES" 
        ? `https://vidsrc.xyz/embed/tv/${item.id}` 
        : `https://vidsrc.xyz/embed/movie/${item.id}`;
    }

    setMiniPlayerItem({
      title: item.title || item.name,
      mediaUrl: url,
      type: type === "CATALOG" ? item.type : type
    });
    setMiniPlayerSize("sm");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn relative">
      
      {/* Left Column: Media Browser List */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        {/* Toggle Library Source Tabs */}
        <div 
          className="flex p-1 rounded-xl border"
          style={{ 
            backgroundColor: themeColors.tertiary.DEFAULT,
            borderColor: "rgba(255,255,255,0.04)" 
          }}
        >
          <button
            onClick={() => setActiveLibraryTab("catalog")}
            className={`flex-1 rounded-lg py-2 text-center text-xs font-bold transition-all duration-200 ${
              activeLibraryTab === "catalog" 
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            Imported Catalog
          </button>
          <button
            onClick={() => setActiveLibraryTab("tmdb")}
            className={`flex-1 rounded-lg py-2 text-center text-xs font-bold transition-all duration-200 ${
              activeLibraryTab === "tmdb" 
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" 
                : "text-slate-400 hover:text-white"
            }`}
          >
            Live TMDB Search
          </button>
        </div>

        {/* Filter controls / search box */}
        {activeLibraryTab === "catalog" ? (
          <div 
            className="p-4 border rounded-2xl flex justify-between items-center bg-slate-900/30"
            style={{ borderColor: "rgba(255, 255, 255, 0.04)" }}
          >
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Catalog Stream Library</h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Select a database source to load stream</p>
            </div>
            <select
              className="rounded px-2.5 py-1 bg-slate-950 border border-white/10 text-[10px] text-slate-300 focus:outline-none"
              value={mediaTypeFilter}
              onChange={e => setMediaTypeFilter(e.target.value as any)}
            >
              <option value="all">All Content</option>
              <option value="video">Movies / Shows</option>
              <option value="audio">Music / Tracks</option>
            </select>
          </div>
        ) : (
          <form onSubmit={handleTmdbSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search TMDB to play instantly..."
                className="w-full rounded-lg pl-10 pr-4 py-2.5 bg-slate-950 border border-white/10 text-xs focus:outline-none focus:border-cyan-500/50 text-white"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <Search size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
            </div>
            <button
              type="submit"
              disabled={searchLoading}
              className="px-4 py-2.5 bg-cyan-500 text-slate-900 hover:bg-cyan-400 font-bold text-xs uppercase rounded-lg transition-all shrink-0"
            >
              {searchLoading ? "..." : "Search"}
            </button>
          </form>
        )}

        {/* Browser list pane */}
        <div className="max-h-[450px] overflow-y-auto space-y-2.5 pr-1">
          {activeLibraryTab === "catalog" ? (
            /* CATALOG LIST */
            filteredCatalog.length > 0 ? (
              filteredCatalog.map(item => (
                <div 
                  key={item.id}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left bg-slate-950/40 border-white/5 hover:border-white/10 transition-all duration-200 ${
                    selectedItem?.id === item.id ? "border-cyan-500/20" : ""
                  }`}
                >
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="flex items-center gap-3 flex-1 text-left min-w-0"
                  >
                    {item.thumbnailUrl ? (
                      <img src={item.thumbnailUrl} alt="" className="w-10 h-10 object-cover rounded bg-slate-900 shrink-0" />
                    ) : (
                      <div className="w-10 h-10 bg-slate-900 rounded flex items-center justify-center text-xs shrink-0">
                        {item.type === "SONG" ? "🎵" : "🎬"}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                      <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-500 block mt-0.5">
                        {item.type} • {item.genre}
                      </span>
                    </div>
                  </button>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-slate-500 mr-1">{formatTime(item.duration)}</span>
                    <button
                      onClick={() => handleSelectMiniPlayer(item, "CATALOG")}
                      className="p-1.5 rounded bg-slate-900 hover:bg-cyan-500/10 text-slate-400 hover:text-cyan-400 border border-white/5 transition-all"
                      title="Watch in Mini Player"
                    >
                      <Monitor size={12} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500 border border-dashed border-white/5 rounded-xl text-xs">
                No items in library. Import content under Media tab.
              </div>
            )
          ) : (
            /* LIVE TMDB SEARCH RESULTS */
            searchError ? (
              <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-950/20 border border-amber-500/10 p-3 rounded-lg">
                <AlertTriangle size={14} />
                {searchError}
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((movie, idx) => (
                <div 
                  key={movie.id || idx}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-white/5 bg-slate-950/40 hover:border-white/10 transition-all duration-200"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <img 
                      src={movie.img || (movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=200&auto=format&fit=crop")} 
                      alt="" 
                      className="w-10 h-10 object-cover rounded bg-slate-900 shrink-0" 
                    />
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{movie.title || movie.name}</h4>
                      <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-500 block mt-0.5">
                        TMDB • {movie.type?.toUpperCase() || "MOVIE"} • ★ {movie.rate || movie.vote_average || "7.5"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => handleSelectMiniPlayer(movie, movie.type?.toUpperCase() === "SERIES" ? "SERIES" : "MOVIE")}
                      className="px-2.5 py-1.5 rounded bg-cyan-500 text-slate-950 font-bold text-[10px] uppercase hover:bg-cyan-400 transition-all flex items-center gap-1"
                    >
                      <Sparkles size={10} /> Watch Mini
                    </button>
                  </div>
                </div>
              ))
            ) : (
              searchQuery && !searchLoading ? (
                <p className="text-[11px] text-slate-500 text-center">No live TMDB results found.</p>
              ) : null
            )
          )}
        </div>
      </div>

      {/* Right Column: Dynamic HTML5 Media Player */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        {selectedItem ? (
          <div className="space-y-6 animate-fadeIn">
            {/* Player Container */}
            <div 
              className="border rounded-2xl overflow-hidden shadow-2xl relative bg-black border-cyan-500/10"
            >
              {selectedItem.type === "SONG" ? (
                /* Audio Music Card design */
                <div className="p-12 flex flex-col items-center justify-center bg-gradient-to-b from-indigo-950/20 via-slate-950/40 to-black text-center space-y-6 min-h-[300px]">
                  <div className="relative">
                    <div 
                      className="w-32 h-32 rounded-full flex items-center justify-center border-4 border-cyan-500/20 animate-spin shadow-2xl overflow-hidden bg-slate-900"
                      style={{ animationDuration: "12s" }}
                    >
                      {selectedItem.thumbnailUrl ? (
                        <img src={selectedItem.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Music className="text-cyan-400" size={42} />
                      )}
                    </div>
                    {/* Glowing vinyl center hole */}
                    <div className="w-6 h-6 rounded-full bg-black border border-white/10 absolute top-[52px] left-[52px] shadow-inner flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-cyan-400" />
                    </div>
                  </div>

                  <div className="space-y-1.5 max-w-sm">
                    <h3 className="text-base font-bold text-white leading-tight">{selectedItem.title}</h3>
                    <p className="text-xs text-cyan-400 uppercase tracking-widest font-semibold">{selectedItem.genre}</p>
                    <p className="text-[10px] text-slate-400">{selectedItem.description}</p>
                  </div>

                  {/* HTML5 Audio Tag */}
                  <audio
                    src={selectedItem.mediaUrl || ""}
                    controls
                    className="w-full max-w-md h-9 outline-none border-t border-white/5 pt-2 text-white"
                    autoPlay
                  />
                </div>
              ) : (
                /* Video Movie Stream Player design (Iframe for TMDB embeds, Video tag for local files) */
                <div className="aspect-video w-full bg-black">
                  {selectedItem.mediaUrl && (selectedItem.mediaUrl.includes("embed") || selectedItem.mediaUrl.includes("vidsrc")) ? (
                    <iframe
                      src={selectedItem.mediaUrl}
                      className="w-full h-full border-0"
                      allowFullScreen
                      allow="autoplay; encrypted-media; picture-in-picture"
                      sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
                    />
                  ) : (
                    <video
                      src={selectedItem.mediaUrl || ""}
                      controls
                      className="w-full h-full object-contain"
                      poster={selectedItem.bannerUrl || selectedItem.thumbnailUrl || ""}
                      autoPlay
                    />
                  )}
                </div>
              )}
            </div>

            {/* Media Metadata Details */}
            <div 
              className="p-6 rounded-2xl border bg-slate-900/20 space-y-4"
              style={{ borderColor: "rgba(255, 255, 255, 0.04)" }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-base text-white">{selectedItem.title}</h3>
                  <span className="text-[10px] uppercase font-bold text-cyan-400 mt-1 inline-block bg-cyan-500/10 px-2 py-0.5 rounded">
                    {selectedItem.type}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-semibold uppercase">{selectedItem.genre} Gateway</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-3">
                {selectedItem.description || "No description catalog info available for this stream node."}
              </p>

              <div className="text-[10px] space-y-2 border-t border-white/5 pt-3 text-slate-500">
                <div className="flex justify-between">
                  <span>Stream Source Link:</span>
                  <span className="font-mono truncate max-w-[280px] text-slate-300" title={selectedItem.mediaUrl}>
                    {selectedItem.mediaUrl || "None"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Duration Node:</span>
                  <span className="text-slate-300 font-semibold">{formatTime(selectedItem.duration)} ({selectedItem.duration}s)</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty / Unselected state placeholder */
          <div 
            className="flex-1 min-h-[350px] border border-dashed rounded-2xl flex flex-col items-center justify-center p-8 text-center space-y-3"
            style={{ borderColor: "rgba(255, 255, 255, 0.06)" }}
          >
            <div className="p-4 rounded-full bg-slate-950/60 border border-white/5 text-slate-600">
              <PlayCircle size={36} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-300">No stream source selected</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs leading-normal">
                Click any movie, show, or music track from the stream catalog panel to load the HTML5 player.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Draggable/Drifting Floating Mini Player Window in the Bottom-Right Corner */}
      {miniPlayerItem && (
        <div 
          className={`fixed bottom-6 right-6 z-50 rounded-2xl shadow-2xl overflow-hidden border border-cyan-500/20 bg-slate-950 flex flex-col transition-all duration-300 ${
            miniPlayerSize === "minimized" 
              ? "w-72 h-14" 
              : miniPlayerSize === "md" 
                ? "w-[480px] h-[300px]" 
                : "w-[360px] h-[240px]"
          }`}
        >
          {/* Mini Player Window Bar Header */}
          <div className="px-4 py-3 bg-slate-900 border-b border-white/5 flex justify-between items-center shrink-0">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 truncate max-w-[180px]" title={miniPlayerItem.title}>
              Mini Stream: {miniPlayerItem.title}
            </span>
            <div className="flex items-center gap-1.5 text-slate-400">
              {miniPlayerSize !== "minimized" ? (
                <button 
                  onClick={() => setMiniPlayerSize("minimized")}
                  className="hover:text-white p-1 rounded" 
                  title="Minimize Player"
                >
                  <ChevronDown size={14} />
                </button>
              ) : (
                <button 
                  onClick={() => setMiniPlayerSize("sm")}
                  className="hover:text-white p-1 rounded" 
                  title="Expand Player"
                >
                  <ChevronUp size={14} />
                </button>
              )}
              {miniPlayerSize !== "md" && miniPlayerSize !== "minimized" && (
                <button 
                  onClick={() => setMiniPlayerSize("md")}
                  className="hover:text-white p-1 rounded" 
                  title="Scale Up Player"
                >
                  <Maximize2 size={12} />
                </button>
              )}
              {miniPlayerSize === "md" && (
                <button 
                  onClick={() => setMiniPlayerSize("sm")}
                  className="hover:text-white p-1 rounded" 
                  title="Scale Down Player"
                >
                  <Minimize2 size={12} />
                </button>
              )}
              <button 
                onClick={() => setMiniPlayerItem(null)}
                className="hover:text-red-400 p-1 rounded" 
                title="Dismiss Player"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Mini Player Embed Screen */}
          {miniPlayerSize !== "minimized" && (
            <div className="flex-1 w-full bg-black relative">
              {miniPlayerItem.type === "SONG" ? (
                <div className="w-full h-full flex items-center justify-center p-6 bg-gradient-to-b from-indigo-950/20 to-black text-center flex-col space-y-3">
                  <Music className="text-cyan-400 animate-pulse" size={28} />
                  <p className="text-[10px] font-bold text-slate-300 leading-tight max-w-[250px] truncate">{miniPlayerItem.title}</p>
                  <audio
                    src={miniPlayerItem.mediaUrl || ""}
                    controls
                    className="w-full max-w-[280px] h-8 mt-2"
                    autoPlay
                  />
                </div>
              ) : (
                <iframe
                  src={miniPlayerItem.mediaUrl}
                  className="w-full h-full border-0"
                  allowFullScreen
                  allow="autoplay; encrypted-media; picture-in-picture"
                  sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
                />
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
