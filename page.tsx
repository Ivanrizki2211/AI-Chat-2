"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, ArrowLeft } from "lucide-react";

interface Character {
  id: string;
  name: string;
  tagline: string;
  avatar: string;
  greeting: string;
  tags: string[];
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const CHARACTERS: Character[] = [
  {
    id: "luna",
    name: "Luna",
    tagline: "Penyihir anime misterius dari hutan bintang.",
    avatar:
      "https://api.dicebear.com/9.x/adventurer/svg?seed=Luna&hair=long01&hairColor=7e3af2",
    greeting:
      "*Menatapmu dari balik buku mantra tuanya, matanya bersinar lembut.* Oh, seorang pengelana tersesat di menaraku? Siapa namamu?",
    tags: ["Anime", "Fantasi", "Misterius"],
  },
  {
    id: "kael",
    name: "Kael",
    tagline: "CEO anime dingin yang diam-diam perhatian.",
    avatar:
      "https://api.dicebear.com/9.x/adventurer/svg?seed=Kael&hair=short04&hairColor=1f2937",
    greeting:
      "*Melonggarkan dasinya sambil menatap layar laptop, tanpa menoleh.* Kamu terlambat 3 menit. Ada perlu apa?",
    tags: ["Anime", "Romansa", "Tsundere"],
  },
  {
    id: "miko",
    name: "Miko",
    tagline: "Teman sekelas anime yang ceria dan suka komik.",
    avatar:
      "https://api.dicebear.com/9.x/adventurer/svg?seed=Miko&hair=long12&hairColor=ec4899",
    greeting:
      "*Melambaikan tangan dengan penuh semangat sambil berlari kecil ke arahmu.* Hei! Akhirnya kamu datang juga!",
    tags: ["Anime", "Slice of Life", "Ceria"],
  },
];

export default function AICharacterPlatform() {
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectCharacter = (char: Character) => {
    setSelectedChar(char);
    setMessages([{ role: "assistant", content: char.greeting }]);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !selectedChar || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          characterId: selectedChar.id,
        }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatRoleplayText = (text: string) => {
    const parts = text.split(/(\*[^*]+\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith("*") && part.endsWith("*")) {
        return (
          <span key={index} className="italic text-purple-300/90">
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col">
      <header className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between bg-neutral-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="text-purple-500 w-6 h-6" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            EmochiClone AI
          </h1>
        </div>
        {selectedChar && (
          <button
            onClick={() => setSelectedChar(null)}
            className="text-sm text-neutral-400 hover:text-white flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> Ganti Karakter
          </button>
        )}
      </header>

      {!selectedChar ? (
        <main className="max-w-5xl mx-auto w-full p-6 flex-1">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Temukan Karakter Anime</h2>
            <p className="text-neutral-400 text-sm">
              Pilih karakter anime untuk memulai cerita dan obrolan interaktif.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {CHARACTERS.map((char) => (
              <div
                key={char.id}
                onClick={() => handleSelectCharacter(char)}
                className="group relative rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-purple-500/50 transition-all cursor-pointer flex flex-col"
              >
                <div className="aspect-[4/5] w-full overflow-hidden relative">
                  <img
                    src={char.avatar}
                    alt={`Avatar anime ${char.name}`}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white">{char.name}</h3>
                    <p className="text-xs text-neutral-300 line-clamp-2 mt-1">
                      {char.tagline}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {char.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      ) : (
        <main className="flex-1 max-w-3xl w-full mx-auto flex flex-col h-[calc(100vh-65px)]">
          <div className="p-4 border-b border-neutral-800 flex items-center gap-3 bg-neutral-900/30">
            <img
              src={selectedChar.avatar}
              alt={`Avatar anime ${selectedChar.name}`}
              className="w-12 h-12 rounded-full object-cover object-top border-2 border-purple-500"
            />
            <div>
              <h2 className="font-bold text-lg">{selectedChar.name}</h2>
              <p className="text-xs text-neutral-400">{selectedChar.tagline}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-end gap-2.5 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <img
                    src={selectedChar.avatar}
                    alt={selectedChar.name}
                    className="w-8 h-8 rounded-full object-cover object-top border border-neutral-700 shrink-0"
                  />
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-purple-600 text-white rounded-br-none"
                      : "bg-neutral-800 text-neutral-100 rounded-bl-none border border-neutral-700"
                  }`}
                >
                  {formatRoleplayText(msg.content)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2.5 justify-start">
                <img
                  src={selectedChar.avatar}
                  alt={selectedChar.name}
                  className="w-8 h-8 rounded-full object-cover object-top border border-neutral-700 shrink-0"
                />
                <div className="bg-neutral-800 text-neutral-400 text-xs px-4 py-3 rounded-2xl rounded-bl-none animate-pulse">
                  {selectedChar.name} sedang mengetik...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form
            onSubmit={sendMessage}
            className="p-4 border-t border-neutral-800 bg-neutral-950 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Kirim pesan ke ${selectedChar.name}... (gunakan *tindakan* untuk roleplay)`}
              className="flex-1 bg-neutral-900 border border-neutral-700 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-purple-500 text-white"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white p-3 rounded-full transition-colors flex items-center justify-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </main>
      )}
    </div>
  );
}
