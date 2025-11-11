const PROXY_CONFIG = [
  {
    "/api": {
      "target": "http://localhost:5129",
      "secure": false,
      "changeOrigin": true,
      "logLevel": "debug"
    }
  }
];

module.exports = PROXY_CONFIG;
