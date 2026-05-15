import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-2.5-flash";

async function callGateway(body: unknown): Promise<any> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY belum dikonfigurasi");
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    if (res.status === 429) throw new Error("Permintaan terlalu sering, coba lagi sebentar.");
    if (res.status === 402) throw new Error("Kuota AI habis, silakan tambah saldo workspace.");
    console.error("AI gateway error", res.status, text);
    throw new Error("AI sedang sibuk, coba lagi.");
  }
  return res.json();
}

function extractToolJson(data: any): any {
  const msg = data?.choices?.[0]?.message;
  const call = msg?.tool_calls?.[0];
  if (call?.function?.arguments) {
    try { return JSON.parse(call.function.arguments); } catch {}
  }
  // fallback: try parsing content
  const content = msg?.content;
  if (typeof content === "string") {
    const m = content.match(/\{[\s\S]*\}/);
    if (m) { try { return JSON.parse(m[0]); } catch {} }
  }
  throw new Error("Format respons AI tidak dikenali");
}

/* ---------------- Konten Pintar ---------------- */
export const generateContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ imageUrl: z.string().url(), note: z.string().max(300).optional() }).parse(input),
  )
  .handler(async ({ data }) => {
    const system =
      "Kamu adalah asisten pemasaran untuk UMKM Indonesia. Lihat foto produk yang diberikan dan buat konten promosi dalam Bahasa Indonesia yang menarik, alami, dan persuasif.";
    const userText = `Buatkan konten promosi untuk produk pada gambar ini.${
      data.note ? ` Catatan tambahan dari pemilik: ${data.note}` : ""
    }`;

    const result = await callGateway({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: [
            { type: "text", text: userText },
            { type: "image_url", image_url: { url: data.imageUrl } },
          ],
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "buat_konten",
            description: "Hasilkan caption, deskripsi, dan hashtag untuk produk UMKM",
            parameters: {
              type: "object",
              properties: {
                captions: {
                  type: "array",
                  description: "3 caption Instagram/WhatsApp dengan tone berbeda: santai, formal, persuasif",
                  items: { type: "string" },
                  minItems: 3,
                  maxItems: 3,
                },
                description: { type: "string", description: "Deskripsi produk 2-3 kalimat" },
                hashtags: {
                  type: "array",
                  description: "10 hashtag relevan tanpa simbol #",
                  items: { type: "string" },
                  minItems: 5,
                  maxItems: 12,
                },
              },
              required: ["captions", "description", "hashtags"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "buat_konten" } },
    });

    const json = extractToolJson(result);
    return {
      captions: (json.captions as string[]).slice(0, 3),
      description: String(json.description ?? ""),
      hashtags: (json.hashtags as string[]).map((h) => h.replace(/^#/, "")).slice(0, 12),
    };
  });

/* ---------------- Kasir Ngobrol ---------------- */
const TxSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().int().nonnegative(),
  category: z.enum(["penjualan", "bahan baku", "operasional", "lainnya"]),
  description: z.string().max(200),
});

export const recordFinance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ text: z.string().min(2).max(500) }).parse(input))
  .handler(async ({ data, context }) => {
    const system =
      "Kamu adalah asisten keuangan UMKM Indonesia. Pengguna memberi teks tentang transaksi (jual/beli) dalam bahasa sehari-hari. Ekstrak setiap transaksi terpisah. Konversi singkatan rupiah: 'rb'/'k' = 1000, 'jt' = 1000000. Contoh: 'jual 3 keripik 20rb' => income 20000. Jika pengguna menyebut harga per pcs, hitung totalnya.";
    const result = await callGateway({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: data.text },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "catat_transaksi",
            description: "Catat satu atau lebih transaksi yang diekstrak dari teks pengguna",
            parameters: {
              type: "object",
              properties: {
                transactions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["income", "expense"] },
                      amount: { type: "integer", description: "Jumlah dalam Rupiah, total" },
                      category: {
                        type: "string",
                        enum: ["penjualan", "bahan baku", "operasional", "lainnya"],
                      },
                      description: { type: "string" },
                    },
                    required: ["type", "amount", "category", "description"],
                    additionalProperties: false,
                  },
                  minItems: 1,
                },
              },
              required: ["transactions"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "catat_transaksi" } },
    });

    const parsed = extractToolJson(result);
    const items = z.array(TxSchema).parse(parsed.transactions ?? []);
    if (items.length === 0) throw new Error("Tidak ada transaksi terdeteksi");

    const { supabase, userId } = context;
    const rows = items.map((t) => ({ ...t, user_id: userId }));
    const { data: inserted, error } = await supabase
      .from("transactions")
      .insert(rows)
      .select();
    if (error) throw new Error(error.message);
    return { transactions: inserted };
  });

/* ---------------- Balas Pelanggan ---------------- */
export const generateReplies = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ question: z.string().min(2).max(800) }).parse(input))
  .handler(async ({ data }) => {
    const system =
      "Kamu adalah asisten layanan pelanggan UMKM Indonesia. Berikan balasan dalam Bahasa Indonesia yang sopan, hangat, dan natural seperti chat WhatsApp. Maksimal 2 kalimat per balasan.";
    const result = await callGateway({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: `Pertanyaan dari pembeli: "${data.question}"` },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "buat_balasan",
            description: "Buat 3 opsi balasan dengan tone berbeda",
            parameters: {
              type: "object",
              properties: {
                replies: {
                  type: "array",
                  description: "3 balasan dengan tone: ramah, profesional, singkat",
                  items: { type: "string" },
                  minItems: 3,
                  maxItems: 3,
                },
              },
              required: ["replies"],
              additionalProperties: false,
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "buat_balasan" } },
    });
    const parsed = extractToolJson(result);
    return { replies: (parsed.replies as string[]).slice(0, 3) };
  });
