const HTTP = require('http');
const HOSTNAME = '127.0.0.1';
const PORT = 3000;

function parseUrl(url) {
    let splitedUrl = url.split('/');
    splitedUrl.splice(0, 2);
    if (splitedUrl.length === 1) {
        splitedUrl[0] = splitedUrl[0].split('?');
        splitedUrl = splitedUrl[0];
        if (splitedUrl.length > 1) {
            arr = splitedUrl[1].split('&');
            for (let el of arr) {
                splitedUrl.push(el);
            }
            splitedUrl.splice(1, 1);
        }
        return [true, splitedUrl];
    } else {
        return [false, splitedUrl];
    }
}

HTTP.createServer((req, res) => {

    if (req.url) {
        if (req.method === 'GET') {
            let splitedUrl = parseUrl(req.url);
        }

        if (req.method === 'POST') {
            let splitedUrl = req.url.split('/');
            splitedUrl.splice(0, 2);

            new Promise((resolve, rej) => {
                req.on('data', chunk => {
                    console.log(`Data chunk available: ${chunk}`)
                    dt = 'dumnezeu';
                    resolve();
                })
            }).then(() => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ Status: 'ok' }));
                console.log(dt);
            })
        }

        if (req.method === 'DELETE') {
            let splitedUrl = req.url.split('/');
            splitedUrl.splice(0, 2);
        }

        if (req.method === 'PUT') {
            let splitedUrl = req.url.split('/');
            splitedUrl.splice(0, 2);
        }
    }

}).listen(PORT, HOSTNAME, () => {
    console.log('Server running!');
});