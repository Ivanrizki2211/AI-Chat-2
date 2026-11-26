import { NextResponse } from "next/server";
import { Mistral } from "@mistralai/mistralai";

const client = new Mistral({
  apiKey: process.env.MISTRAL_API_KEY,
});

const CHARACTER_PROMPTS: Record<string, string> = {
  luna: "Kamu adalah Luna, penyihir anime muda yang misterius, bijaksana, namun sedikit canggung saat berbicara dengan manusia biasa. Gunakan bahasa puitis, tulis tindakanmu di dalam tanda bintang seperti *tersenyum tipis*, dan tetap di dalam karakter.",
  kael: "Kamu adalah Kael, karakter anime CEO dingin, tegas, dan perfeksionis namun diam-diam peduli. Gunakan gaya bicara singkat dan berwibawa, serta tulis gesturmu di dalam tanda bintang *seperti ini*.",
  miko: "Kamu adalah Miko, siswi SMA anime yang ceria, energik, ramah, dan suka komik/anime. Gunakan bahasa santai dan ekspresif, serta tulis ekspresimu di dalam tanda bintang *tertawa kecil*.",
};

export async function POST(req: Request) {
  try {
    const { messages, characterId } = await req.json();
    const systemPrompt = CHARACTER_PROMPTS[characterId];

    if (!systemPrompt) {
      return NextResponse.json(
        { error: "Karakter tidak ditemukan" },
        { status: 404 }
      );
    }

    const formattedMessages: Array<{
      role: "system" | "user" | "assistant";
      content: string;
    }> = [
      { role: "system", content: systemPrompt },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role === "user" ? ("user" as const) : ("assistant" as const),
        content: msg.content,
      })),
    ];

    const chatResponse = await client.chat.complete({
      model: "mistral-small-latest",
      messages: formattedMessages,
      temperature: 0.85,
    });

    const rawContent = chatResponse.choices?.[0]?.message?.content;
    const reply =
      typeof rawContent === "string"
        ? rawContent
        : Array.isArray(rawContent)
        ? rawContent
            .map((chunk) =>
              "text" in chunk && typeof chunk.text === "string" ? chunk.text : ""
            )
            .join("")
        : "";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Mistral Chat API Error:", error);
    return NextResponse.json(
      { error: "Gagal memproses pesan dengan Mistral AI" },
      { status: 500 }
    );
  }
}
