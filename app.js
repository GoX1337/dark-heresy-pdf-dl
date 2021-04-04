const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const serverUrl = "https://www.fillinsheets.com/pdfs/DarkHeresy/";
const pdfFolderName = "dh-pdf";

let downloadPdfFile = async (serverUrl, pdfUrl) => {
    const filename = pdfUrl.replace("?path=&download=", "").replace(/%20/g, "_").replace(/%27/g, "");
    try{
        const downloadedFileStream = await axios({ url: serverUrl+pdfUrl, method: 'GET', responseType: 'stream' });
        const localFilePath = path.resolve(__dirname, pdfFolderName, filename);
        await downloadedFileStream.data.pipe(fs.createWriteStream(localFilePath));
        console.log("Downloaded " + filename);
    } catch(e){
        console.error("Failed to download " + filename, e);
    }
}

(async () => {
    try {
        if (!fs.existsSync(pdfFolderName)){
            fs.mkdirSync(pdfFolderName);
        }
        const response = await axios.get(serverUrl);
        const $ = cheerio.load(response.data);
        let delay = 0;

        $('a').each((i, link) => {
            const pdfUrl = $(link).attr('href');
            const paramStr = "?path=&download=";
            if (pdfUrl.indexOf(paramStr) != -1) {
                setTimeout(async () => {
                    await downloadPdfFile(serverUrl, pdfUrl);
                }, delay);
                delay += 5000;
            }
        });
    } catch (e) {
        console.error(e);
    }
})();