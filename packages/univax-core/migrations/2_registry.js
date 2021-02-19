var Registry = artifacts.require("EthereumDIDRegistry");

module.exports = function(deployer) {
  deployer.deploy(Registry);
}