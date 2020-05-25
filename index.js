const proxyChecker = require('./proxy-checker');

(async () => {
    let [a, b, protocol, address, port, login, password] = process.argv

    await proxyChecker.initialize(protocol, address, port, login, password);
    await proxyChecker.accessSpeedTestSite();
    await proxyChecker.end();
})();
