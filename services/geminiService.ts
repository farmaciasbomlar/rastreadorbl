
import { GoogleGenAI } from "@google/genai";
import { ExecucaoItem } from "../types";
import { marked } from 'marked';

// IMPORTANT: Do not hardcode the API key. It should be provided as an environment variable.
// We assume `process.env.API_KEY` is available in the execution environment.
const getGenAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes a list of product results using Gemini for insights.
 */
export const analyzeResultsWithGemini = async (results: ExecucaoItem[]): Promise<string> => {
    const ai = getGenAI();

    const foundItems = results.filter(item => item.metodo_busca !== 'NÃO_ENCONTRADO');
    const notFoundCount = results.length - foundItems.length;

    if (foundItems.length === 0) {
        return "Nenhum produto foi encontrado, então não há dados para analisar.";
    }

    const prompt = `
        Você é um especialista em análise de dados de farmácia. Analise os seguintes resultados de busca de produtos e forneça um resumo conciso e útil.

        Dados dos Produtos Encontrados (campos incluem EAN, NOME do produto encontrado, Preco, PrecoOriginal, Desconto, Marca, Disponivel, etc.):
        ${JSON.stringify(foundItems, null, 2)}

        Total de produtos buscados: ${results.length}
        Total de produtos encontrados: ${foundItems.length}
        Total de produtos não encontrados: ${notFoundCount}

        Sua análise deve seguir este formato, usando Markdown:
        
        ### Análise Geral dos Resultados
        - **Resumo:** Forneça um resumo de uma frase sobre os resultados.
        - **Taxa de Sucesso:** Calcule e comente a porcentagem de produtos encontrados.
        - **Destaque de Preço e Desconto:** Identifique o produto mais caro, o mais barato e o com maior desconto percentual.
        - **Disponibilidade:** Comente sobre a disponibilidade geral dos produtos.
        
        ### Observações Importantes
        - Comente sobre as marcas mais frequentes.
        - Comente sobre as categorias de produtos mais comuns encontradas.

        Seja claro, objetivo e use formatação Markdown para melhorar a legibilidade (negrito, listas).
    `;

    try {
        const response = await ai.models.generateContent({
            // FIX: Updated model name to align with coding guidelines.
            model: 'gemini-flash-lite-latest',
            contents: prompt,
        });
        const text = response.text ?? '';
        const htmlContent = marked.parse(text);
        return htmlContent as string;
    } catch (error) {
        console.error("Gemini API call failed:", error);
        throw new Error("Failed to analyze results with Gemini.");
    }
};


/**
 * Sends a message to the Gemini chatbot and gets a response.
 */
export const sendChatToGemini = async (message: string, history: { sender: string, text: string }[]): Promise<string> => {
    const ai = getGenAI();
    
    // Simple history formatting. For a real app, use the specific 'role' and 'parts' structure.
    const historyContext = history.map(msg => `${msg.sender}: ${msg.text}`).join('\n');

    const prompt = `
        Você é um assistente virtual para o app "Rastreador de Preços São João".
        Seu objetivo é ser prestativo e amigável.
        Você pode responder a perguntas sobre o app, sobre os produtos listados, ou conhecimento geral.
        Use o Google Search para informações atuais quando necessário.

        Histórico da conversa:
        ${historyContext}

        Nova Pergunta do Usuário:
        user: ${message}

        Sua Resposta:
    `;

    try {
         const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview', // Pro for better chat experience
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}], // Use search grounding for up-to-date info
            }
        });
        const text = response.text ?? '';
        const htmlContent = marked.parse(text);
        return htmlContent as string;
    } catch (error) {
        console.error("Gemini chat API call failed:", error);
        throw new Error("Failed to get a response from the chatbot.");
    }
};
