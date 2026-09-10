import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Ergonomic AI consultation endpoint
  app.post("/api/ergonomia/consultar", async (req, res) => {
    try {
      const { pergunta, contexto } = req.body;

      if (!pergunta || typeof pergunta !== "string") {
        return res.status(400).json({ error: "A pergunta é obrigatória." });
      }

      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        // High-quality fallback if no API key is provided
        return res.json({
          resposta: `**Orientação Ergonômica:**\n\nCom base nas diretrizes da NR-17 e ergonomia preventiva do trabalho com computador:\n\n1. **Ajuste de Alturas:** Mantenha a borda superior da tela alinhada com a altura dos seus olhos. Seus cotovelos devem ficar a cerca de 90° apoiados, com os punhos retos.\n2. **Apoio Lombar e Pés:** Seus pés devem ficar totalmente apoiados no piso ou em um apoio inclinado com regulagem (10° a 20°). A coluna lombar deve estar bem acomodada no encosto.\n3. **Pausas e Movimento:** Aplique a regra 20-20-20 (a cada 20 minutos olhe a 6 metros por 20 segundos) e levante-se por 3 a 5 minutos a cada hora.\n\n*Para análise de dores persistentes, procure avaliação médica ou fisioterapêutica especializada.*`,
          origem: "base_conhecimento_offline",
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      const systemPrompt = `Você é um Fisioterapeuta e Ergonomista sênior especializado em Ergonomia de Escritório, Home Office e conformidade com a Norma Regulamentadora 17 (NR-17 do Brasil) e padrões da OSHA.
Sua missão é dar orientações práticas, didáticas, acolhedoras e altamente aplicáveis sobre:
- Ajuste e regulagem correta de cadeiras, mesas, monitores, teclado, mouse e suportes de notebook.
- Prevenção de LER/DORT (Lesões por Esforços Repetitivos / Distúrbios Osteomusculares Relacionados ao Trabalho), cervicalgia, lombalgia, síndrome do túnel do carpo e fadiga visual.
- Soluções práticas com itens domésticos (como livros para elevar tela, toalha enrolada para suporte lombar) quando a pessoa não tem equipamento regulável.
- Exercícios de ginástica laboral, alongamento e pausas ativas.

Estruture sua resposta de forma visual e clara:
- Diagnóstico rápido do problema/dúvida
- Ações imediatas (Passo a passo prático)
- Dica de ouro para prevenção
- Alerta médico com moderação (quando procurar um profissional de saúde se houver dormência contínua ou dor aguda).
Responda sempre em Português do Brasil com tom profissional, empático e resolutivo.`;

      let promptText = `Pergunta do usuário: ${pergunta}`;
      if (contexto) {
        promptText += `\n\nContexto do posto de trabalho e usuário: ${JSON.stringify(contexto, null, 2)}`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: promptText,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.7,
        },
      });

      const resposta = response.text || "Não foi possível gerar uma resposta detalhada no momento.";

      return res.json({
        resposta,
        origem: "gemini_ia",
      });
    } catch (error: any) {
      console.error("Erro na consulta ergonômica:", error);
      return res.status(500).json({
        error: "Falha ao processar a consulta ergonômica.",
        detalhes: error?.message || "Erro desconhecido",
      });
    }
  });

  // Setup Vite in development or serve static in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor de Ergonomia rodando na porta ${PORT}`);
  });
}

startServer();
