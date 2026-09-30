import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

const candidateModels = [
  "gemini-3.8-flash",
  "gemini-flash-latest",
  "gemini-2.5-flash-lite",
  "gemini-3.1-flash-lite-preview",
  "gemini-flash-lite-latest",
];

async function findWorkingModel() {
  for (const m of candidateModels) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Tes koneksi OCR MyUPL. Balas 'OK SIAP'." }] }],
        }),
      });

      console.log(`Model [${m}]: HTTP ${res.status}`);
      if (res.ok) {
        const d = await res.json() as any;
        console.log(`>>> SUCCESS with [${m}]:`, d?.candidates?.[0]?.content?.parts?.[0]?.text?.trim());
        return m;
      }
    } catch (e: any) {
      console.log(`Model [${m}] error:`, e.message);
    }
  }
}

findWorkingModel().catch(console.error);
