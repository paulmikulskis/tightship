
const config = require ("dotenv").config({ path: `${process.env.ENVIRONMENT}` });
console.log('dashboard config:', config.parsed);
module.exports = {
  env: config.parsed,
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/app/:any*',
        destination: '/app',
      },
    ];
  },

}
