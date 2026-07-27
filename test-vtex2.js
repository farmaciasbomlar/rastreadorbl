const urls = [
    "https://www.saojoaofarmacias.com.br/api/catalog_system/pub/products/search?ft=AMOXIC+CLAV.POT%20400MG%2070ML%20GEN%20EURO&O=OrderByPriceASC",
    "https://www.saojoaofarmacias.com.br/api/catalog_system/pub/products/search?ft=AMOXIC CLAV POT 400MG 70ML GEN EURO&O=OrderByPriceASC",
    "https://www.saojoaofarmacias.com.br/api/catalog_system/pub/products/search?ft=AMOXIC%20CLAV%20POT%20400MG%2070ML%20GEN%20EURO&O=OrderByPriceASC"
];

const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    'Connection': 'keep-alive'
};

async function run() {
    for (const url of urls) {
        console.log("Testing:", url);
        const r = await fetch(url, { headers });
        console.log(r.status);
        console.log(await r.text());
    }
}
run();
