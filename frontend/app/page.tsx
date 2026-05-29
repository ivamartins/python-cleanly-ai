'use client';

import { useState, useEffect } from 'react';
import MaskCanvas from '../components/MaskCanvas';

interface Generation {
  id: number;
  status: string;
  original_filename: string | null;
  result_path: string | null;
  thumbnail_path: string | null;
  created_at: string;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    done: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    failed: 'bg-red-500/10 text-red-400 border-red-500/20',
    queued: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    processing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    pending: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  };

  return (
    <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${styles[status] || styles.pending}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function CleanlyWatermark() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [maskBase64, setMaskBase64] = useState('');
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [selectedGen, setSelectedGen] = useState<Generation | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const showMessage = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 4000);
  };

  useEffect(() => {
    if (!token) return;
    const hasPending = generations.some(g => ['queued', 'processing'].includes(g.status));
    if (!hasPending) return;

    const interval = setInterval(() => {
      fetchGenerations();
    }, 4000);
    return () => clearInterval(interval);
  }, [generations, token]);

  const fetchGenerations = async () => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:8000/generations/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setGenerations(data);
      }
    } catch {}
  };

  const handleAuth = async (endpoint: string) => {
    try {
      const res = await fetch(`http://localhost:8000/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.access_token) {
        setToken(data.access_token);
        showMessage(
          endpoint === 'register' ? 'Account created successfully!' : 'Login successful!',
          'success'
        );
        setTimeout(() => fetchGenerations(), 300);
      } else {
        showMessage(data.detail || 'Authentication error', 'error');
      }
    } catch {
      showMessage('Server connection error', 'error');
    }
  };

  const handleImageUpload = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showMessage('Please select a valid image (PNG or JPG)', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setOriginalImage(event.target?.result as string);
      setOriginalFile(file);
      setMaskBase64('');
    };
    reader.readAsDataURL(file);
  };

  const processImage = async () => {
    if (!token || !originalFile || !maskBase64) {
      showMessage('Please log in, upload an image, and draw the mask', 'error');
      return;
    }
    setIsProcessing(true);
    showMessage('Sending for processing...', 'info');

    const formData = new FormData();
    formData.append('image', originalFile);
    formData.append('mask_base64', maskBase64);

    try {
      const res = await fetch('http://localhost:8000/generations/', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        showMessage('Image sent! Processing has started.', 'success');
        setOriginalImage(null);
        setOriginalFile(null);
        setMaskBase64('');
        setTimeout(() => fetchGenerations(), 500);
      } else {
        showMessage('Error sending image', 'error');
      }
    } catch {
      showMessage('Server connection error', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteGeneration = async (id: number) => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:8000/generations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setGenerations(prev => prev.filter(g => g.id !== id));
        showMessage('Record deleted', 'success');
      }
    } catch {}
  };

  const handleLogout = () => {
    setToken('');
    setGenerations([]);
    setOriginalImage(null);
    setOriginalFile(null);
    setMaskBase64('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !token) {
      handleAuth(authMode);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-500/20">
              C
            </div>
            <span className="font-semibold text-lg tracking-tight">Cleanly</span>
          </div>
          {token && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-500 hidden sm:block">
                {email}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm px-4 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Hero / Auth */}
        {!token ? (
          <div className="min-h-[80vh] flex items-center justify-center">
            <div className="w-full max-w-md">
              <div className="text-center mb-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-2xl mx-auto shadow-2xl shadow-emerald-500/20 mb-6">
                  C
                </div>
                <h1 className="text-3xl font-bold tracking-tight">Cleanly</h1>
                <p className="text-zinc-500 mt-2">
                  Intelligent watermark removal with local AI
                </p>
              </div>

              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 shadow-xl backdrop-blur-sm">
                <div className="flex gap-1 mb-8 bg-zinc-800/50 rounded-xl p-1">
                  <button
                    onClick={() => setAuthMode('login')}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition ${
                      authMode === 'login'
                        ? 'bg-zinc-950 text-white shadow'
                        : 'text-zinc-500 hover:text-white'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setAuthMode('register')}
                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition ${
                      authMode === 'register'
                        ? 'bg-zinc-950 text-white shadow'
                        : 'text-zinc-500 hover:text-white'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                <div className="space-y-4" onKeyDown={handleKeyDown}>
                  <div>
                    <label className="block text-sm text-zinc-500 mb-1.5">Email</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition placeholder:text-zinc-700"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-500 mb-1.5">Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition placeholder:text-zinc-700"
                    />
                  </div>
                  <button
                    onClick={() => handleAuth(authMode)}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 rounded-xl text-sm font-semibold transition shadow-lg shadow-emerald-500/20"
                  >
                    {authMode === 'login' ? 'Sign In' : 'Create Account'}
                  </button>
                </div>

                {message && (
                  <div className={`mt-6 p-3 rounded-xl text-sm text-center backdrop-blur-sm ${
                    messageType === 'success'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : messageType === 'error'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                      : 'bg-zinc-800/50 text-zinc-400'
                  }`}>
                    {message}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Upload + Mask Section */}
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">Remove Watermark</h2>
                  <p className="text-sm text-zinc-500 mt-0.5">
                    Upload, paint the area, and process with AI
                  </p>
                </div>
              </div>

              {!originalImage ? (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => { e.preventDefault(); setDragOver(false); handleImageUpload(e.dataTransfer.files[0]); }}
                  className={`relative border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all ${
                    dragOver
                      ? 'border-emerald-500 bg-emerald-500/5'
                      : 'border-zinc-800 hover:border-zinc-600 bg-zinc-900/30 hover:bg-zinc-900/50'
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-zinc-800/50 flex items-center justify-center">
                      <svg className="w-6 h-6 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-300">
                        <span className="text-emerald-400">Click</span> to select or drag an image
                      </p>
                      <p className="text-xs text-zinc-600 mt-1">PNG or JPG</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-sm text-zinc-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V3.75a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v15.75A1.5 1.5 0 003.75 21z" />
                      </svg>
                      {originalFile?.name}
                    </div>
                    <span className="text-xs text-zinc-600">
                      Paint over the watermark area
                    </span>
                  </div>

                  <MaskCanvas
                    backgroundImage={originalImage}
                    onMaskChange={setMaskBase64}
                  />

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={processImage}
                      disabled={isProcessing || !maskBase64}
                      className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-semibold text-sm transition shadow-lg shadow-emerald-500/10"
                    >
                      {isProcessing ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        'Remove Watermark'
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setOriginalImage(null);
                        setOriginalFile(null);
                        setMaskBase64('');
                      }}
                      className="px-6 py-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl text-sm font-medium transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </section>

            {/* Gallery */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold">History</h2>
                  <p className="text-sm text-zinc-500 mt-0.5">
                    {generations.length} {generations.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
                <button
                  onClick={fetchGenerations}
                  className="text-sm px-4 py-2 bg-zinc-900/50 hover:bg-zinc-800/50 rounded-xl border border-zinc-800 transition flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                  </svg>
                  Refresh
                </button>
              </div>

              {message && (
                <div className={`mb-6 p-3 rounded-xl text-sm backdrop-blur-sm ${
                  messageType === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : messageType === 'error'
                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                    : 'bg-zinc-800/50 text-zinc-400'
                }`}>
                  {message}
                </div>
              )}

              {generations.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl">
                  <div className="w-12 h-12 rounded-xl bg-zinc-900/50 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.16a15.53 15.53 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                    </svg>
                  </div>
                  <p className="text-zinc-600 text-sm font-medium">No items yet</p>
                  <p className="text-zinc-700 text-xs mt-1">Upload an image to get started</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {generations.map((gen) => (
                    <div
                      key={gen.id}
                      className="group bg-zinc-900/30 border border-zinc-800 rounded-xl overflow-hidden cursor-pointer hover:border-zinc-600 hover:bg-zinc-900/50 transition-all"
                      onClick={() => setSelectedGen(gen)}
                    >
                      <div className="aspect-[4/3] bg-zinc-950 overflow-hidden relative">
                        {gen.thumbnail_path ? (
                          <img
                            src={`http://localhost:8000/results/${gen.thumbnail_path.split('/').pop()}`}
                            alt=""
                            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {gen.status === 'queued' || gen.status === 'processing' ? (
                              <svg className="animate-spin h-8 w-8 text-zinc-700" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                            ) : (
                              <svg className="w-8 h-8 text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 001.5-1.5V3.75a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v15.75A1.5 1.5 0 003.75 21z" />
                              </svg>
                            )}
                          </div>
                        )}
                        <div className="absolute top-2 right-2">
                          <StatusBadge status={gen.status} />
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm text-zinc-400 truncate flex-1">
                            {gen.original_filename || 'Unnamed'}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteGeneration(gen.id); }}
                            className="text-xs text-zinc-600 hover:text-red-400 transition shrink-0"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.157-2.086-2.273A51.964 51.964 0 0012 3.25c-1.148 0-2.278.08-3.38.235-.602.066-1.135.396-1.435.986v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* Modal */}
      {selectedGen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedGen(null)}
        >
          <div
            className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <StatusBadge status={selectedGen.status} />
                <span className="font-medium truncate max-w-[300px]">
                  {selectedGen.original_filename || 'Image'}
                </span>
              </div>
              <button
                onClick={() => setSelectedGen(null)}
                className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {selectedGen.result_path ? (
              <div className="bg-zinc-950 flex items-center justify-center p-6">
                <img
                  src={`http://localhost:8000/results/${selectedGen.result_path.split('/').pop()}`}
                  alt="Result"
                  className="max-h-[70vh] object-contain rounded-xl"
                />
              </div>
            ) : selectedGen.status === 'failed' ? (
              <div className="p-16 text-center text-zinc-600">
                <svg className="w-12 h-12 mx-auto mb-4 text-red-500/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <p className="text-sm">Processing failed.</p>
                <p className="text-xs mt-1">Please try again with a different image.</p>
              </div>
            ) : (
              <div className="p-16 flex flex-col items-center justify-center text-zinc-600">
                <svg className="animate-spin h-10 w-10 mb-4 text-zinc-700" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-sm">Processing...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
