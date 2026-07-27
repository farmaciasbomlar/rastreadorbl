const calculateMatchScore = (productName, searchTerm) => {
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

const findBestMatch = (data, searchTerm) => {
    if (!data || data.length === 0) return null;
    if (!searchTerm) return data[0];

    let bestScore = -1;
    let bestProduct = data[0];

    for (const product of data) {
        const productName = product.productName || product.brand || '';
        const score = calculateMatchScore(productName, searchTerm);
        // We only update if score > bestScore.
        // So the first one with the best score wins (which is the cheapest among them).
        if (score > bestScore) {
            bestScore = score;
            bestProduct = product;
        }
    }

    return bestProduct;
};

const data = [
    { productName: "Seringa 500mg" },
    { productName: "Dipirona Sódica 500mg 10 Comprimidos EMS Genérico" },
    { productName: "Dipirona Monoidratada 500mg/ml Gotas 10ml Farmace Genérico" }
];

console.log(findBestMatch(data, "dipirona 500mg"));
