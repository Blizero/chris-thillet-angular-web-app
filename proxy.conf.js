const PROXY_CONFIG = [
  {
    context: [
      "/uaa",
      // "/cat/facts"
    ],
    target: "http://localhost:7000",
    secure: false,
    timeout: 1200000
  }
];

module.exports = PROXY_CONFIG;
