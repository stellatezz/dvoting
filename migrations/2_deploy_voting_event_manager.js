const VotingEventManager = artifacts.require("./VotingEventManager");

module.exports = function (deployer) {
  deployer.deploy(VotingEventManager);
};
