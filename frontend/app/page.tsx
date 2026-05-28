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
  const [selectedGen, setSelectedGen] = useState<Generation | null>(null);

  // Auto-refresh pending generations
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
        method: 'GET',
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
        setMessage(endpoint === 'register' ? 'Account created!' : 'Login successful!');
        setTimeout(() => fetchGenerations(), 300);
      } else {
        setMessage(data.detail || 'Authentication error');
      }
    } catch {
      setMessage('Connection error');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setMessage('Please select a valid image');
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
      setMessage('Please log in, upload an image and draw the mask');
      return;
    }
    setIsProcessing(true);
    setMessage('Enviando para processamento...');

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
        setMessage('Processing started with LaMa!');
        setOriginalImage(null);
        setOriginalFile(null);
        setMaskBase64('');
        setTimeout(() => fetchGenerations(), 500);
      } else {
        setMessage('Error sending image');
      }
    } catch {
      setMessage('Server connection error');
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteGeneration = async (id: number) => {
    if (!token) return;
    try {
      await fetch(`http://localhost:8000/generations/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchGenerations();
    } catch {}
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-5xl mx-auto p-6">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Cleanly</h1>
          <p className="text-zinc-400 mt-2">
            AI Watermark Removal • LaMa Inpainting
          </p>
        </header>

        {/* Auth */}
        {!token && (
          <div className="mb-8 p-6 bg-zinc-900 rounded-2xl border border-zinc-800">
            <h2 className="text-lg font-semibold mb-4">Access your account</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2 text-sm"
              />
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-2 text-sm"
              />
              <button
                onClick={() => handleAuth('register')}
                className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm font-medium"
              >
                Criar conta
              </button>
              <button
                onClick={() => handleAuth('login')}
                className="px-6 py-2 bg-white text-black hover:bg-zinc-200 rounded-lg text-sm font-medium"
              >
                Entrar
              </button>
            </div>
            {message && <p className="mt-3 text-sm text-zinc-400">{message}</p>}
          </div>
        )}

        {token && (
          <>
            {/* Upload + Mask Editor */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Remover Marca d'Água</h2>
                <button
                  onClick={() => {
                    setToken('');
                    setGenerations([]);
                  }}
                  className="text-sm text-zinc-400 hover:text-white"
                >
                  Sair
                </button>
              </div>

              {!originalImage ? (
                <label className="block w-full border-2 border-dashed border-zinc-700 hover:border-zinc-500 rounded-2xl p-12 text-center cursor-pointer bg-zinc-900 transition-colors">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <div className="text-lg">Clique ou arraste uma imagem</div>
                  <p className="text-sm text-zinc-500 mt-1">PNG ou JPG</p>
                </label>
              ) : (
                <div className="space-y-6">
                  <MaskCanvas
                    backgroundImage={originalImage}
                    onMaskChange={setMaskBase64}
                  />

                  <div className="flex gap-4">
                    <button
                      onClick={processImage}
                      disabled={isProcessing || !maskBase64}
                      className="flex-1 py-3 bg-white text-black font-medium rounded-xl hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      {isProcessing ? 'Processing with LaMa...' : 'Remove Watermark'}
                    </button>
                    <button
                      onClick={() => {
                        setOriginalImage(null);
                        setOriginalFile(null);
                        setMaskBase64('');
                      }}
                      className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl"
                    >
                      Cancelar
                    </button>
                  </div>

                  {message && <p className="text-sm text-center text-zinc-400">{message}</p>}
                </div>
              )}
            </div>

            {/* Gallery */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">History</h2>
                <button
                  onClick={fetchGenerations}
                  className="text-sm px-4 py-1.5 bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-700"
                >
                  Atualizar
                </button>
              </div>

              {generations.length === 0 && (
                <p className="text-zinc-500 text-sm">Nenhum processamento ainda.</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {generations.map((gen) => (
                  <div
                    key={gen.id}
                    className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden cursor-pointer hover:border-zinc-600 transition"
                    onClick={() => setSelectedGen(gen)}
                  >
                    {gen.thumbnail_path ? (
                      <img
                        src={`http://localhost:8000/results/${gen.thumbnail_path.split('/').pop()}`}
                        alt="Resultado"
                        className="w-full h-48 object-cover bg-black"
                      />
                    ) : (
                      <div className="h-48 bg-zinc-950 flex items-center justify-center text-zinc-600 text-sm">
                        {gen.status === 'done' ? 'Processado' : gen.status}
                      </div>
                    )}
                    <div className="p-4 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-400">{gen.original_filename}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          gen.status === 'done' ? 'bg-emerald-500/10 text-emerald-400' :
                          gen.status === 'failed' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {gen.status}
                        </span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteGeneration(gen.id); }}
                        className="text-xs text-red-400 hover:text-red-500 mt-2"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Modal */}
        {selectedGen && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setSelectedGen(null)}>
            <div className="bg-zinc-900 rounded-2xl max-w-4xl w-full overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                <div>
                  <div className="font-medium">{selectedGen.original_filename}</div>
                  <div className="text-xs text-zinc-500">Status: {selectedGen.status}</div>
                </div>
                <button onClick={() => setSelectedGen(null)} className="text-zinc-400 hover:text-white">Fechar</button>
              </div>

              {selectedGen.result_path && (
                <div className="p-6 bg-black flex justify-center">
                  <img
                    src={`http://localhost:8000/results/${selectedGen.result_path.split('/').pop()}`}
                    alt="Resultado"
                    className="max-h-[70vh] object-contain rounded-lg"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
