const url = "https://www.drogariavenancio.com.br/api/catalog_system/pub/products/search?ft=dipirona%20500mg&O=OrderByPriceASC";
const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    'Connection': 'keep-alive'
};

fetch(url, { headers }).then(r => {
    return r.json();
}).then(data => {
    data.forEach(p => {
        let price = p.items[0]?.sellers[0]?.commertialOffer?.Price;
        console.log(`${p.productName} - R$ ${price}`);
    });
}).catch(console.error);
