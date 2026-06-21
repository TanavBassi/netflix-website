"use client";
import React, { useState } from "react";
import { Film, Music, Search, Trash2, Globe, AlertTriangle, UploadCloud, CheckCircle2, Loader2 } from "lucide-react";
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

interface MediaProps {
  importedContent: CatalogItem[];
  onImportContent: (item: any) => Promise<void>;
  onDeleteContent: (id: string) => Promise<void>;
  onSearchTMDB: (query: string) => Promise<any[]>;
  onSearchJioSaavn: (query: string) => Promise<any[]>;
  onUploadContent: (formData: FormData) => Promise<any>;
}

const VALID_GENRES = [
  "Action",
  "Comedy",
  "Drama",
  "Horror",
  "Sci-Fi",
  "Thriller",
  "Romance",
  "Documentary",
  "Animation",
  "Fantasy",
  "Mystery",
  "Adventure",
  "Pop",
  "Rock",
  "Classical",
  "Jazz",
  "Hip-Hop",
  "Electronic",
  "R&B",
  "Country",
  "Indie",
  "Metal",
  "Folk",
  "World",
  "Other"
];

export default function Media({ 
  importedContent, 
  onImportContent, 
  onDeleteContent,
  onSearchTMDB,
  onSearchJioSaavn,
  onUploadContent
}: MediaProps) {
  const [tmdbQuery, setTmdbQuery] = useState("");
  const [jioQuery, setJioQuery] = useState("");
  const [tmdbLoading, setTmdbLoading] = useState(false);
  const [jioLoading, setJioLoading] = useState(false);

  const [tmdbList, setTmdbList] = useState<any[]>([]);
  const [jioList, setJioList] = useState<any[]>([]);
  
  const [errTmdb, setErrTmdb] = useState<string | null>(null);
  const [errJio, setErrJio] = useState<string | null>(null);

  // Media Tab state
  const [activeMediaTab, setActiveMediaTab] = useState<"tmdb" | "jiosaavn" | "upload">("tmdb");

  // Custom Upload states
  const [upTitle, setUpTitle] = useState("");
  const [upDescription, setUpDescription] = useState("");
  const [upType, setUpType] = useState("MOVIE");
  const [upGenre, setUpGenre] = useState("Action");
  const [upDuration, setUpDuration] = useState("");
  const [upIsFeatured, setUpIsFeatured] = useState(false);
  const [upIsPublished, setUpIsPublished] = useState(true);

  // File pickers
  const [upThumbnailFile, setUpThumbnailFile] = useState<File | null>(null);
  const [upBannerFile, setUpBannerFile] = useState<File | null>(null);
  const [upMediaFile, setUpMediaFile] = useState<File | null>(null);

  // Feedback states
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleTmdbSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tmdbQuery.trim()) return;
    setTmdbLoading(true);
    setErrTmdb(null);
    try {
      const results = await onSearchTMDB(tmdbQuery);
      setTmdbList(results);
    } catch (err: any) {
      setErrTmdb("Failed searching movies from TMDB API.");
    } finally {
      setTmdbLoading(false);
    }
  };

  const handleJioSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jioQuery.trim()) return;
    setJioLoading(true);
    setErrJio(null);
    try {
      const results = await onSearchJioSaavn(jioQuery);
      setJioList(results);
    } catch (err: any) {
      setErrJio("Failed searching soundtracks from JioSaavn API.");
    } finally {
      setJioLoading(false);
    }
  };

  const formatDuration = (seconds: any): string => {
    if (!seconds) return "3:30";
    const secs = parseInt(seconds, 10);
    if (isNaN(secs)) return String(seconds);
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? "0" : ""}${remainingSecs}`;
  };

  const getArtistName = (song: any): string => {
    if (song.artists?.primary && Array.isArray(song.artists.primary) && song.artists.primary.length > 0) {
      return song.artists.primary.map((a: any) => a.name).join(", ");
    }
    return song.artist || "Unknown Artist";
  };

  const getImageUrl = (song: any): string => {
    if (song.image && Array.isArray(song.image) && song.image.length > 0) {
      return song.image[2]?.url || song.image[1]?.url || song.image[0]?.url || "";
    }
    return song.thumbnail || "";
  };

  const getDownloadUrl = (song: any): string => {
    if (song.downloadUrl && Array.isArray(song.downloadUrl) && song.downloadUrl.length > 0) {
      return song.downloadUrl[4]?.url || song.downloadUrl[3]?.url || song.downloadUrl[2]?.url || song.downloadUrl[1]?.url || song.downloadUrl[0]?.url || "";
    }
    return song.url || "";
  };

  const handleImport = async (item: any, type: "MOVIE" | "SONG") => {
    // Construct database schema matching payload
    const payload = type === "MOVIE" ? {
      title: item.title,
      type: item.type?.toUpperCase() === "SERIES" ? "SERIES" : "MOVIE",
      description: item.overview || `Imported metadata for ${item.title}`,
      genre: item.genre || "Action",
      thumbnailUrl: item.img || (item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : ""),
      bannerUrl: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : (item.img || ""),
      mediaUrl: item.mediaUrl || (item.type?.toUpperCase() === "SERIES" 
        ? `https://vidsrc.xyz/embed/tv/${item.id}` 
        : `https://vidsrc.xyz/embed/movie/${item.id}`),
      duration: item.runtime ? parseInt(item.runtime, 10) * 60 : 7200,
      isFeatured: false,
      isPublished: true
    } : {
      title: item.name || item.title || item.song_name,
      type: "SONG",
      description: `Album: ${item.album?.name || item.album || "Single"} by ${getArtistName(item)}`,
      genre: item.language || "Music",
      thumbnailUrl: getImageUrl(item),
      mediaUrl: getDownloadUrl(item),
      duration: item.duration ? parseInt(item.duration, 10) : 210,
      isFeatured: false,
      isPublished: true
    };

    await onImportContent(payload);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upTitle.trim()) {
      setUploadError("Title is required.");
      return;
    }
    if (!upMediaFile) {
      setUploadError("Media file (video or audio) is required.");
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadSuccess(false);
    setUploadProgress("Preparing content metadata...");

    try {
      const formData = new FormData();
      formData.append("title", upTitle.trim());
      formData.append("description", upDescription.trim());
      formData.append("type", upType);
      formData.append("genre", upGenre);
      
      const durationVal = parseInt(upDuration, 10);
      let seconds = 0;
      if (!isNaN(durationVal) && durationVal > 0) {
        seconds = (upType === "MOVIE" || upType === "SERIES" || upType === "TV_SHOW") 
          ? durationVal * 60 
          : durationVal;
      }
      formData.append("duration", String(seconds));
      formData.append("isFeatured", String(upIsFeatured));
      formData.append("isPublished", String(upIsPublished));

      if (upThumbnailFile) {
        formData.append("thumbnail", upThumbnailFile);
      }
      if (upBannerFile) {
        formData.append("banner", upBannerFile);
      }
      formData.append("media", upMediaFile);

      setUploadProgress("Uploading media file to platform (this may take a few moments)...");
      await onUploadContent(formData);
      
      setUploadSuccess(true);
      // Reset form
      setUpTitle("");
      setUpDescription("");
      setUpDuration("");
      setUpThumbnailFile(null);
      setUpBannerFile(null);
      setUpMediaFile(null);
      setUpIsFeatured(false);
    } catch (err: any) {
      console.error(err);
      setUploadError(err?.response?.data?.message || err?.message || "Failed uploading file media to gateway. Try again.");
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Tab Selector */}
      <div 
        className="flex p-1 rounded-xl border max-w-md mx-auto"
        style={{ 
          backgroundColor: themeColors.tertiary.DEFAULT,
          borderColor: "rgba(255,255,255,0.04)" 
        }}
      >
        <button
          onClick={() => {
            setActiveMediaTab("tmdb");
            setUploadError(null);
            setUploadSuccess(false);
          }}
          className={`flex-1 rounded-lg py-2.5 text-center text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
            activeMediaTab === "tmdb" 
              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-md" 
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Film size={14} />
          Movies (TMDB)
        </button>
        <button
          onClick={() => {
            setActiveMediaTab("jiosaavn");
            setUploadError(null);
            setUploadSuccess(false);
          }}
          className={`flex-1 rounded-lg py-2.5 text-center text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
            activeMediaTab === "jiosaavn" 
              ? "bg-pink-500/10 text-pink-400 border border-pink-500/20 shadow-md" 
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Music size={14} />
          Music (Saavn)
        </button>
        <button
          onClick={() => {
            setActiveMediaTab("upload");
            setUploadError(null);
            setUploadSuccess(false);
          }}
          className={`flex-1 rounded-lg py-2.5 text-center text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
            activeMediaTab === "upload" 
              ? "bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-md" 
              : "text-slate-400 hover:text-white"
          }`}
        >
          <UploadCloud size={14} />
          Upload Content
        </button>
      </div>

      {/* Conditionally Render Portal Views */}
      <div className="min-h-[300px]">
        {activeMediaTab === "tmdb" && (
          <div className="p-6 rounded-2xl border bg-slate-900/20 space-y-4 max-w-2xl mx-auto border-white/5">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold flex items-center gap-2 text-white"><Film size={18} className="text-cyan-400" /> TMDB Movies API</h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-bold">LIVE METADATA SEARCH</span>
            </div>
            
            <form onSubmit={handleTmdbSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search TMDB database..."
                  className="w-full rounded-lg pl-10 pr-4 py-2.5 bg-slate-950 border border-white/10 text-xs focus:outline-none focus:border-cyan-500/50 text-white"
                  value={tmdbQuery}
                  onChange={e => setTmdbQuery(e.target.value)}
                />
                <Search size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
              </div>
              <button
                type="submit"
                disabled={tmdbLoading}
                className="px-4 py-2.5 bg-cyan-500 text-slate-900 hover:bg-cyan-400 font-bold text-xs uppercase rounded-lg transition-all"
              >
                {tmdbLoading ? "..." : "Search"}
              </button>
            </form>

            {errTmdb && (
              <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-950/20 border border-amber-500/10 p-2.5 rounded-lg">
                <AlertTriangle size={14} />
                {errTmdb}
              </div>
            )}

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {tmdbList.length > 0 ? (
                tmdbList.map((movie, idx) => (
                  <div key={movie.id || idx} className="flex gap-3 p-2 rounded-lg bg-slate-950/60 border border-white/5 items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        src={movie.img || (movie.poster_path ? `https://image.tmdb.org/t/p/w200${movie.poster_path}` : "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=200&auto=format&fit=crop")} 
                        alt="" 
                        className="w-10 h-10 object-cover rounded-lg bg-slate-800" 
                      />
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">{movie.title}</p>
                        <p className="text-[10px] text-slate-400">★ {movie.rate || movie.vote_average || "7.5"} • {movie.release || movie.release_date?.split("-")[0] || "2025"}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleImport(movie, "MOVIE")}
                      className="px-2.5 py-1.5 rounded bg-cyan-500 text-slate-950 font-bold text-[10px] uppercase hover:bg-cyan-400 transition-all shrink-0"
                    >
                      Import
                    </button>
                  </div>
                ))
              ) : (
                tmdbQuery && !tmdbLoading && <p className="text-[11px] text-slate-500 text-center">No live TMDB results found.</p>
              )}
            </div>
          </div>
        )}

        {activeMediaTab === "jiosaavn" && (
          <div className="p-6 rounded-2xl border bg-slate-900/20 space-y-4 max-w-2xl mx-auto border-white/5">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold flex items-center gap-2 text-white"><Music size={18} className="text-pink-400" /> JioSaavn Soundtrack API</h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-pink-500/20 text-pink-400 font-bold">LIVE MUSIC SEARCH</span>
            </div>
            
            <form onSubmit={handleJioSearchSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search JioSaavn library..."
                  className="w-full rounded-lg pl-10 pr-4 py-2.5 bg-slate-950 border border-white/10 text-xs focus:outline-none focus:border-pink-500/50 text-white"
                  value={jioQuery}
                  onChange={e => setJioQuery(e.target.value)}
                />
                <Search size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
              </div>
              <button
                type="submit"
                disabled={jioLoading}
                className="px-4 py-2.5 bg-pink-500 text-white hover:bg-pink-400 font-bold text-xs uppercase rounded-lg transition-all"
              >
                {jioLoading ? "..." : "Search"}
              </button>
            </form>

            {errJio && (
              <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-950/20 border border-amber-500/10 p-2.5 rounded-lg">
                <AlertTriangle size={14} />
                {errJio}
              </div>
            )}

            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              {jioList.length > 0 ? (
                jioList.map((song, idx) => (
                  <div key={song.id || idx} className="flex gap-3 p-2 rounded-lg bg-slate-950/60 border border-white/5 items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getImageUrl(song) && (
                        <img src={getImageUrl(song)} alt="" className="w-10 h-10 object-cover rounded bg-slate-900" />
                      )}
                      <div>
                        <p className="text-xs font-bold text-white">{song.name || song.title}</p>
                        <p className="text-[10px] text-slate-400">
                          {getArtistName(song)} • {song.album?.name || song.album || "Single Track"} • {formatDuration(song.duration)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleImport(song, "SONG")}
                      className="px-2.5 py-1.5 rounded bg-pink-500 text-white font-bold text-[10px] uppercase hover:bg-pink-400 transition-all shrink-0"
                    >
                      Import
                    </button>
                  </div>
                ))
              ) : (
                jioQuery && !jioLoading && <p className="text-[11px] text-slate-500 text-center">No live JioSaavn results found.</p>
              )}
            </div>
          </div>
        )}

        {/* Manual content upload form container */}
        {activeMediaTab === "upload" && (
          <div className="p-6 rounded-2xl border bg-slate-900/20 space-y-5 max-w-2xl mx-auto border-white/5 relative">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold flex items-center gap-2 text-white"><UploadCloud size={18} className="text-purple-400" /> Upload Content Stream</h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold">MULTIPART FILE GATEWAY</span>
            </div>

            {uploadError && (
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/20 border border-red-500/10 p-2.5 rounded-lg">
                <AlertTriangle size={14} />
                {uploadError}
              </div>
            )}

            {uploadSuccess && (
              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/20 border border-emerald-500/10 p-2.5 rounded-lg">
                <CheckCircle2 size={14} />
                Media asset uploaded and registered in database catalog successfully!
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Content Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. My Movie / Song Name"
                    className="w-full rounded-lg px-3 py-2 bg-slate-950 border border-white/10 text-xs focus:outline-none focus:border-purple-500/50 text-white"
                    value={upTitle}
                    onChange={e => setUpTitle(e.target.value)}
                    required
                    disabled={uploading}
                  />
                </div>

                {/* Duration */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    Duration {upType === "SONG" ? "(Seconds)" : "(Minutes)"}
                  </label>
                  <input
                    type="number"
                    placeholder={upType === "SONG" ? "e.g. 180" : "e.g. 120"}
                    className="w-full rounded-lg px-3 py-2 bg-slate-950 border border-white/10 text-xs focus:outline-none focus:border-purple-500/50 text-white"
                    value={upDuration}
                    onChange={e => setUpDuration(e.target.value)}
                    disabled={uploading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Type */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Content Type *</label>
                  <select
                    className="w-full rounded-lg px-3 py-2 bg-slate-950 border border-white/10 text-xs focus:outline-none focus:border-purple-500/50 text-slate-300"
                    value={upType}
                    onChange={e => {
                      setUpType(e.target.value);
                      setUpMediaFile(null); // reset selected media file to align with type
                    }}
                    disabled={uploading}
                  >
                    <option value="MOVIE">MOVIE</option>
                    <option value="SONG">SONG</option>
                    <option value="SERIES">SERIES</option>
                    <option value="TV_SHOW">TV SHOW</option>
                    <option value="PODCAST">PODCAST</option>
                  </select>
                </div>

                {/* Genre */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Genre *</label>
                  <select
                    className="w-full rounded-lg px-3 py-2 bg-slate-950 border border-white/10 text-xs focus:outline-none focus:border-purple-500/50 text-slate-300"
                    value={upGenre}
                    onChange={e => setUpGenre(e.target.value)}
                    disabled={uploading}
                  >
                    {VALID_GENRES.map(genre => (
                      <option key={genre} value={genre}>{genre}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Description / Info</label>
                <textarea
                  rows={2}
                  placeholder="Enter content plot description or artist credits..."
                  className="w-full rounded-lg px-3 py-2 bg-slate-950 border border-white/10 text-xs focus:outline-none focus:border-purple-500/50 text-white resize-none"
                  value={upDescription}
                  onChange={e => setUpDescription(e.target.value)}
                  disabled={uploading}
                />
              </div>

              {/* File selectors */}
              <div className="space-y-4">
                {/* Media File Picker */}
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Streaming Media File *</label>
                  <div className="border border-dashed border-white/10 rounded-lg p-4 bg-slate-950 flex flex-col items-center justify-center text-center cursor-pointer hover:border-purple-500/50 transition-all relative">
                    <input
                      type="file"
                      accept={upType === "SONG" ? "audio/*" : "video/*"}
                      onChange={e => setUpMediaFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={uploading}
                    />
                    <UploadCloud size={24} className="text-purple-400 mb-1.5" />
                    <span className="text-xs font-bold text-slate-200">
                      {upMediaFile ? upMediaFile.name : "Choose streaming file or drag here"}
                    </span>
                    <span className="text-[9px] text-slate-500 mt-0.5">
                      {upType === "SONG" ? "Audio Tracks (MP3, WAV, FLAC, max 1 GB)" : "Video Files (MP4, WEBM, MKV, max 1 GB)"}
                    </span>
                  </div>
                </div>

                {/* Artwork Pickers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Thumbnail */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Thumbnail Image (Square / Poster)</label>
                    <div className="border border-dashed border-white/10 rounded-lg p-3 bg-slate-950 flex flex-col items-center justify-center text-center cursor-pointer hover:border-cyan-500/50 transition-all relative min-h-[90px]">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => setUpThumbnailFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={uploading}
                      />
                      <span className="text-[11px] font-semibold text-slate-300">
                        {upThumbnailFile ? upThumbnailFile.name : "Select Thumbnail"}
                      </span>
                      <span className="text-[8px] text-slate-500 mt-0.5">PNG / JPG (max 5 MB)</span>
                    </div>
                  </div>

                  {/* Banner */}
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Wide Banner Artwork</label>
                    <div className="border border-dashed border-white/10 rounded-lg p-3 bg-slate-950 flex flex-col items-center justify-center text-center cursor-pointer hover:border-pink-500/50 transition-all relative min-h-[90px]">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => setUpBannerFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        disabled={uploading}
                      />
                      <span className="text-[11px] font-semibold text-slate-300">
                        {upBannerFile ? upBannerFile.name : "Select Banner"}
                      </span>
                      <span className="text-[8px] text-slate-500 mt-0.5">PNG / JPG (max 5 MB)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Switches */}
              <div className="flex gap-6 items-center pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={upIsFeatured}
                    onChange={e => setUpIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded border-white/10 bg-slate-950 text-purple-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    disabled={uploading}
                  />
                  Featured Content
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={upIsPublished}
                    onChange={e => setUpIsPublished(e.target.checked)}
                    className="w-4 h-4 rounded border-white/10 bg-slate-950 text-purple-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    disabled={uploading}
                  />
                  Publish Instantly
                </label>
              </div>

              {/* Upload action btn */}
              <button
                type="submit"
                disabled={uploading}
                className="w-full mt-4 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase rounded-xl tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20"
              >
                {uploading ? (
                  <>
                    <Loader2 className="animate-spin text-white" size={16} />
                    <span>{uploadProgress || "Uploading Assets..."}</span>
                  </>
                ) : (
                  <>
                    <UploadCloud size={16} />
                    <span>Create & Upload Content</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Database Catalog Table */}
      <div 
        className="p-6 rounded-2xl border bg-slate-900/30 space-y-4" 
        style={{ borderColor: "rgba(255, 255, 255, 0.04)" }}
      >
        <div className="flex justify-between items-center pb-2 border-b border-white/5">
          <h3 className="font-bold text-sm text-cyan-400">Imported Dynamic Database Catalog ({importedContent.length})</h3>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Active Streams</span>
        </div>
        
        {importedContent.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">No media content imported to database catalog.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-1">
            {importedContent.map(item => (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-white/5 transition-all hover:border-cyan-500/20"
              >
                <div className="flex items-center gap-3">
                  {item.thumbnailUrl ? (
                    <img src={item.thumbnailUrl} alt="" className="w-10 h-10 object-cover rounded bg-slate-900" />
                  ) : (
                    <div className="w-10 h-10 bg-slate-900 rounded flex items-center justify-center text-[10px] font-bold text-slate-500">
                      {item.type === "SONG" ? "🎵" : "🎬"}
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-bold text-white block leading-tight">{item.title}</span>
                    <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-400">
                      {item.type} • {item.genre} {item.description ? `• ${item.description}` : ""}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onDeleteContent(item.id)}
                  className="p-2 text-slate-500 hover:text-red-400 rounded hover:bg-red-500/10 transition-all"
                  title="Remove Content"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
