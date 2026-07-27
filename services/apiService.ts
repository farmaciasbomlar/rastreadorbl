
import { ExecucaoItem, StoreType, MetodoBuscaType } from "../types";

const PROXY_URL = "/api/proxy?url=";

const sanitizeSearchTerm = (term: string) => {
    return term.replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
};

const calculateMatchScore = (productName: string, searchTerm: string): number => {
    const nameTokens = productName.toLowerCase().split(/[\s\W]+/).filter(Boolean);
    const searchTokens = searchTerm.toLowerCase().split(/[\s\W]+/).filter(Boolean);
    
    let score = 0;
    for (const token of searchTokens) {
        if (nameTokens.includes(token)) {
            score += 1;
        } else if (nameTokens.some(n => n.includes(token))) {
            score += 0.5;
        }
    }
    return score;
};

const findBestMatch = (data: any[], searchTerm: string) => {
    if (!data || data.length === 0) return null;
    if (!searchTerm) return data[0];

    let bestScore = -1;
    let bestProduct = data[0];

    for (const product of data) {
        const productName = product.productName || product.brand || '';
        const score = calculateMatchScore(productName, searchTerm);
        if (score > bestScore) {
            bestScore = score;
            bestProduct = product;
        }
    }

    return bestProduct;
};

const storeConfig = {
    saojoao: {
        name: 'São João' as const,
        baseUrl: "https://www.saojoaofarmacias.com.br",
    },
    venancio: {
        name: 'Venancio' as const,
        baseUrl: "https://www.drogariavenancio.com.br",
    }
};

const API_ENDPOINT = "/api/catalog_system/pub/products/search";

const SAO_JOAO_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json',
    'Referer': 'https://www.saojoaofarmacias.com.br/'
};

interface SearchTerm {
    ean?: string;
    name?: string;
}

const parseProduct = (product: any, metodo: MetodoBuscaType, store: 'saojoao' | 'venancio', originalSearchTerm: SearchTerm): ExecucaoItem | null => {
    try {
        if (!product || !product.items || product.items.length === 0) return null;

        const config = storeConfig[store];
        const firstItem = product.items[0];
        const seller = firstItem.sellers?.[0];
        const offer = seller?.commertialOffer;
        
        const price = offer?.Price;
        const listPrice = offer?.ListPrice;
        const availableQuantity = offer?.AvailableQuantity ?? 0;

        const categories = (product.categories?.[0] || '').split('/').filter(Boolean);
        const productName = product.productName || product.brand || 'Nome não encontrado';
        const brand = product.brand || 'Marca não informada';

        let discount = '0%';
        if (typeof price === 'number' && typeof listPrice === 'number' && listPrice > price) {
            const discountValue = ((listPrice - price) / listPrice) * 100;
            discount = `${discountValue.toFixed(0)}%`;
        }
        
        const link = product.link || '#';
        let correctLink = link;
        if (!link.startsWith('http')) {
            correctLink = config.baseUrl + (link.startsWith('/') ? link : `/${link}`);
        }

        return {
            EAN: firstItem.ean || 'N/A',
            NOME: productName,
            Preco: typeof price === 'number' ? `R$ ${price.toFixed(2).replace('.', ',')}` : 'Indisponível',
            PrecoOriginal: typeof listPrice === 'number' ? `R$ ${listPrice.toFixed(2).replace('.', ',')}` : 'Indisponível',
            Desconto: discount,
            Marca: brand,
            Disponivel: availableQuantity > 0 ? 'SIM' : 'NÃO',
            Link: correctLink,
            Classificacao: categories.join(' > ') || 'Não classificado',
            Observacao: '—', 
            metodo_busca: metodo,
            loja: config.name,
            DescricaoBusca: originalSearchTerm.name || '',
        };
    } catch (e) {
        console.error("Error parsing product data:", e, product);
        return null;
    }
};

const searchSaoJoaoProduct = async (term: SearchTerm): Promise<ExecucaoItem> => {
    const config = storeConfig.saojoao;
    const API_BASE_URL = `${config.baseUrl}${API_ENDPOINT}`;
    const originalEan = term.ean || "";
    let productData: any | null = null;
    let metodo: MetodoBuscaType = 'NÃO_ENCONTRADO';

    const fetchData = async (url: string) => {
        try {
            const response = await fetch(`${PROXY_URL}${encodeURIComponent(url)}`, { headers: SAO_JOAO_HEADERS });
            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0 && data[0].items) {
                    return data;
                }
            } else {
                 console.error(`São João search failed for ${url} with status: ${response.status}`);
            }
        } catch (e) {
            console.error(`Fetch failed for URL ${url}:`, e);
        }
        return null;
    };

    // 1. Precise EAN Search
    if (term.ean && /^\d{12,14}$/.test(term.ean)) {
        const url = `${API_BASE_URL}?fq=alternateIds_Ean:${term.ean}`;
        const data = await fetchData(url);
        if (data) {
            const match = data.find((p: any) => p.items?.some((item: any) => item.ean === term.ean));
            if (match) {
                productData = match;
                metodo = 'EAN';
            }
        }
    }

    // 2. Full name search
    if (!productData && term.name && term.name.length > 3) {
        const cleanName = sanitizeSearchTerm(term.name);
        const url = `${API_BASE_URL}?ft=${encodeURIComponent(cleanName)}&O=OrderByPriceASC`;
        const data = await fetchData(url);
        if (data) {
            productData = findBestMatch(data, cleanName);
            metodo = 'DESCRIÇÃO';
        }
    }
    
    // 3. EAN as term search
    if (!productData && term.ean) {
        const url = `${API_BASE_URL}?ft=${term.ean}&O=OrderByPriceASC`;
        const data = await fetchData(url);
        if (data) {
            productData = data[0];
            metodo = 'EAN_COMO_TERMO';
        }
    }

    // 4. Partial name search
    if (!productData && term.name && term.name.split(' ').length > 2) {
        const cleanName = sanitizeSearchTerm(term.name);
        const partialName = cleanName.split(' ').slice(0, 3).join(' ');
        const url = `${API_BASE_URL}?ft=${encodeURIComponent(partialName)}&O=OrderByPriceASC`;
        const data = await fetchData(url);
        if (data) {
            productData = findBestMatch(data, partialName);
            metodo = 'NOME_PARCIAL';
        }
    }

    if (productData) {
        const parsed = parseProduct(productData, metodo, 'saojoao', term);
        if (parsed) return { ...parsed, EAN: originalEan || parsed.EAN };
    }
    
    return {
        EAN: originalEan,
        NOME: `Busca por "${term.name || originalEan}"`,
        DescricaoBusca: term.name || '',
        Preco: 'Não encontrado',
        PrecoOriginal: '—',
        Desconto: '—',
        Marca: '—',
        Disponivel: 'NÃO',
        Link: '#',
        Classificacao: 'Não classificado',
        Observacao: 'Sem resultados',
        metodo_busca: 'NÃO_ENCONTRADO',
        loja: config.name,
    };
};

const searchVenancioProduct = async (term: SearchTerm): Promise<ExecucaoItem> => {
    let productData: any | null = null;
    let metodo: MetodoBuscaType = 'NÃO_ENCONTRADO';
    const originalEan = term.ean || "";
    const config = storeConfig.venancio;
    const API_BASE_URL = `${config.baseUrl}${API_ENDPOINT}`;

    try {
        // 1. Precise EAN Search
        if (term.ean && /^\d{12,14}$/.test(term.ean)) {
            const eanSearchUrl = `${API_BASE_URL}?fq=alternateIds_Ean:${term.ean}`;
            const response = await fetch(`${PROXY_URL}${encodeURIComponent(eanSearchUrl)}`);
            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                    const match = data.find((p: any) => p.items?.some((item: any) => item.ean === term.ean));
                    if (match) {
                        productData = match;
                        metodo = 'EAN';
                    }
                }
            }
        }

        // 2. Fallback to Text Search
        if (!productData && term.name) {
            const cleanName = sanitizeSearchTerm(term.name);
            const textSearchUrl = `${API_BASE_URL}?ft=${encodeURIComponent(cleanName)}&O=OrderByPriceASC`;
            const response = await fetch(`${PROXY_URL}${encodeURIComponent(textSearchUrl)}`);
            if (!response.ok) throw new Error(`API responded with status: ${response.status}`);
            const data = await response.json();
            
            if (data && data.length > 0) {
                productData = findBestMatch(data, cleanName);
                metodo = 'DESCRIÇÃO';
            }
        }
        
        if (productData && (metodo === 'EAN' || metodo === 'DESCRIÇÃO')) {
            const parsed = parseProduct(productData, metodo, 'venancio', term);
            if (parsed) return { ...parsed, EAN: originalEan || parsed.EAN };
        }

    } catch (e) {
        console.error(`Search failed for term "${term.ean || term.name}" in store venancio:`, e);
    }
    
    return {
        EAN: originalEan,
        NOME: `Busca por "${term.name || originalEan}"`,
        DescricaoBusca: term.name || '',
        Preco: 'Não encontrado',
        PrecoOriginal: '—',
        Desconto: '—',
        Marca: '—',
        Disponivel: 'NÃO',
        Link: '#',
        Classificacao: 'Não classificado',
        Observacao: 'Sem resultados',
        metodo_busca: 'NÃO_ENCONTRADO',
        loja: config.name,
    };
};

export const searchProducts = async (
    terms: SearchTerm[],
    store: StoreType,
    onProgress?: (processed: number, total: number) => void
): Promise<ExecucaoItem[]> => {
    const results: ExecucaoItem[] = [];
    const total = terms.length;

    if (store === 'todas') {
         for (let i = 0; i < total; i++) {
            const term = terms[i];
            if(!term) continue;
            
            const searchPromises = [
                searchSaoJoaoProduct(term),
                searchVenancioProduct(term)
            ];
            const storeResults = await Promise.all(searchPromises);
            results.push(...storeResults);

            if (onProgress) {
                onProgress(i + 1, total);
            }
        }
    } else {
        const searchFn = store === 'saojoao' ? searchSaoJoaoProduct : searchVenancioProduct;
        for (let i = 0; i < total; i++) {
            const term = terms[i];
            if(!term) continue;
            const result = await searchFn(term);
            results.push(result);
            if (onProgress) {
                onProgress(i + 1, total);
            }
        }
    }
    return results;
};
