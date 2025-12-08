const PROXY_CONFIG = [
  {
    context: [
      "/uaa",
    ],
    target: "http://localhost:5000",
    secure: false,
    timeout: 1200000
  }
];

module.exports = PROXY_CONFIG;
