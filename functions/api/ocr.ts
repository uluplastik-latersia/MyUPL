// Cloudflare Pages Functions - V8 Edge Runtime
// Strictly uses native fetch, Web Request, and Web Response

interface Env {
  GEMINI_API_KEY: string;
}

export interface KtpOcrResult {
  nik: string;
  no_kk: string;
  nama: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  jenis_kelamin: "LAKI-LAKI" | "PEREMPUAN" | "";
  alamat: string;
  agama: string;
  status_perkawinan: string;
  pekerjaan: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const apiKey = context.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "GEMINI_API_KEY environment variable is not configured on Cloudflare Pages.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const body = (await context.request.json()) as {
      image?: string; // base64 string
      mimeType?: string;
    };

    if (!body?.image) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing image base64 data in request body.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Clean base64 string if it contains data URL prefix
    let base64Data = body.image;
    let mimeType = body.mimeType || "image/jpeg";

    if (base64Data.startsWith("data:")) {
      const parts = base64Data.split(",");
      const match = parts[0].match(/:(.*?);/);
      if (match) {
        mimeType = match[1];
      }
      base64Data = parts[1];
    }

    // Strict system prompt for accurate Indonesian e-KTP & Kartu Keluarga OCR
    const systemInstruction = `You are a high-precision Indonesian Identity Document (e-KTP & Kartu Keluarga) OCR Engine.
Extract the text fields from the provided ID card image with maximum accuracy.
CRITICAL EXTRACTION RULES:
1. "nik": Must be exactly 16 numeric digits. Correct common OCR mistakes (e.g., letter 'O', 'D' to '0'; 'I', 'l' to '1'; 'B' to '8'; 'S' to '5'). If not visible or invalid, return "".
2. "no_kk": 16 digits if visible, else "".
3. "nama": Full legal name in uppercase without typos.
4. "tempat_lahir": City/Regency of birth.
5. "tanggal_lahir": Strict ISO format "YYYY-MM-DD". Indonesian dates like "25-08-1994" must be converted to "1994-08-25".
6. "jenis_kelamin": Must be strictly "LAKI-LAKI" or "PEREMPUAN".
7. "alamat": Full address (Alamat, RT/RW, Kel/Desa, Kecamatan, Kota/Kabupaten).
8. "agama": Religion (ISLAM, KRISTEN, KATOLIK, HINDU, BUDDHA, KONGHUCU).
9. "status_perkawinan": Marital status (BELUM KAWIN, KAWIN, CERAI HIDUP, CERAI MATI).
10. "pekerjaan": Occupation listed on the card.

OUTPUT REQUIREMENT:
Return ONLY a valid JSON object matching the JSON schema. Do not enclose in markdown code blocks like \`\`\`json.`;

    const candidateModels = [
      "gemini-3.5-flash-lite",
      "gemini-3.8-flash",
      "gemini-3.5-flash",
      "gemini-flash-lite-latest",
    ];

    const requestPayload = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: "Extract all identity information from this Indonesian KTP/KK card into pure JSON schema.",
            },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data,
              },
            },
          ],
        },
      ],
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1024,
        responseMimeType: "application/json",
      },
    };

    let geminiRes: Response | null = null;
    let geminiData: any = null;
    let lastError = "";

    for (const model of candidateModels) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
      });

      if (res.ok) {
        geminiRes = res;
        geminiData = await res.json();
        break;
      } else {
        lastError = await res.text();
      }
    }

    if (!geminiRes || !geminiData) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Gemini API error: ${lastError}`,
        }),
        { status: 502, headers: { "Content-Type": "application/json" } }
      );
    }

    const rawCandidateText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawCandidateText) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Empty response from OCR engine.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Sanitization logic: strip accidental markdown fences or extraneous whitespace
    let sanitizedJson = rawCandidateText.trim();
    if (sanitizedJson.startsWith("```json")) {
      sanitizedJson = sanitizedJson
        .replace(/^```json\s*/, "")
        .replace(/\s*```$/, "");
    } else if (sanitizedJson.startsWith("```")) {
      sanitizedJson = sanitizedJson.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    const parsed: KtpOcrResult = JSON.parse(sanitizedJson);

    // Normalization & Fallbacks
    const cleanResult: KtpOcrResult = {
      nik: (parsed.nik || "").replace(/\D/g, "").slice(0, 16),
      no_kk: (parsed.no_kk || "").replace(/\D/g, "").slice(0, 16),
      nama: (parsed.nama || "").toUpperCase().trim(),
      tempat_lahir: (parsed.tempat_lahir || "").toUpperCase().trim(),
      tanggal_lahir: parsed.tanggal_lahir || "",
      jenis_kelamin:
        parsed.jenis_kelamin === "LAKI-LAKI" ||
        parsed.jenis_kelamin === "PEREMPUAN"
          ? parsed.jenis_kelamin
          : parsed.jenis_kelamin?.toUpperCase().includes("PEREM")
          ? "PEREMPUAN"
          : parsed.jenis_kelamin?.toUpperCase().includes("LAKI")
          ? "LAKI-LAKI"
          : "",
      alamat: (parsed.alamat || "").toUpperCase().trim(),
      agama: (parsed.agama || "").toUpperCase().trim(),
      status_perkawinan: (parsed.status_perkawinan || "").toUpperCase().trim(),
      pekerjaan: (parsed.pekerjaan || "").toUpperCase().trim(),
    };

    return new Response(
      JSON.stringify({
        success: true,
        data: cleanResult,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Failed to process OCR request.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
