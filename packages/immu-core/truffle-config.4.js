module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 7545,
      network_id: '*' // Match any network id
    }
  },
  contracts_directory: "./contracts/0.4",
  compilers: {
    solc: {
      version: "^0.4"
    }
  }

};
