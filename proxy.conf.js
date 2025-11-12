const PROXY_CONFIG = [
  {
    // Context is the path prefix to intercept from the Angular app
    context: ["/api"],

    // Target is your running ASP.NET Core API address
    target: "http://localhost:5129",

    // Required for the dev server
    secure: false,
    changeOrigin: true,

    // Helps with debugging; will log proxy activity to the terminal
    logLevel: "debug"

    // If your C# endpoint is ONLY /auth/register (without the /api prefix),
    // you would uncomment and use this line:
    // pathRewrite: { "^/api": "" }
  }
];

module.exports = PROXY_CONFIG;
