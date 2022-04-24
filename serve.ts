const handler = require('serve-handler');
const http = require('http');
const net = require('net');
const minimist = require('minimist');
const argv = require('minimist')(process.argv.slice(2));
(async () => {
    await launchWebServer(argv.p ? parseInt(argv.p) : 3030);
})();

async function launchWebServer(defaultPort = 3030) {
    let server = http.createServer((request, response) => {
        // You pass two more arguments for config and middleware
        // More details here: https://github.com/zeit/serve-handler#options
        return handler(request, response, {
            cleanUrls: true,
            headers: [
                {
                    "source": "**/*",
                    "headers": [{
                        "key": "Access-Control-Allow-Origin",
                        "value": "*",
                    }]
                }
            ]
        });
    });
    const port = await getAvailablePort(defaultPort);
    server = require('http-shutdown')(server);
    server.listen(port, () => {
        console.log('Running at http://localhost:' + port);
    });
}

function getAvailablePort(startingAt) {
    function getNextAvailablePort(currentPort, cb) {
        const server = net.createServer();
        server.listen(currentPort, _ => {
            server.once('close', _ => {
                cb(currentPort);
            });
            server.close();
        });
        server.on('error', _ => {
            getNextAvailablePort(++currentPort, cb);
        });
    }
    return new Promise(resolve => {
        getNextAvailablePort(startingAt, resolve);
    });
}