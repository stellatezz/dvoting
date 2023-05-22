const { expect } = require("chai");
const ethers = require('ethers');
const { BN, ether, expectEvent, expectRevert } = require("@openzeppelin/test-helpers");
const VotingEventManager = artifacts.require("./VotingEventManager");
const GoodVoting = artifacts.require("./GoodVoting");

contract("Vote Verification Test", function (accounts) {
    const deployer = accounts[0];
    const admin = accounts[1];
    const voter1 = accounts[2];
    const voter2 = accounts[3];
    const voter3 = accounts[4];
    const voter4 = accounts[5];
    const voter5 = accounts[6];

    beforeEach(async function () {
        this.votingEventManager = await VotingEventManager.new({ from: deployer });
        const tx = await this.votingEventManager.createVotingEvent("Test Election", { from: admin });

        const votingEventAddress = tx.logs[0].args.newVotingAddress;
        this.GoodVoting = await GoodVoting.at(votingEventAddress);

        await this.GoodVoting.addCandidate("Candidate 1", { from: admin });
        await this.GoodVoting.addCandidate("Candidate 2", { from: admin });
        await this.GoodVoting.addCandidate("Candidate 3", { from: admin });
    });
  
    it("should allow voter verify is their vote counted", async function () {
      await this.GoodVoting.registerVoter(voter1, { from: admin });
      await this.GoodVoting.registerVoter(voter2, { from: admin });
  
      await this.GoodVoting.vote([0, 1], { from: voter1 });
      await this.GoodVoting.vote([0, 1], { from: voter2 });

      await this.GoodVoting.endVoting({ from: admin });

      const verifyResult = await this.GoodVoting.verifyVote({ from: voter1 });
      expect(verifyResult).equal(true, "The vote should be counted");
    });

    it("should not allow unvoted voter verify their vote", async function () {
        await this.GoodVoting.registerVoter(voter1, { from: admin });
        await this.GoodVoting.registerVoter(voter2, { from: admin });
    
        await this.GoodVoting.vote([0, 1], { from: voter1 });
        await this.GoodVoting.vote([0, 1], { from: voter2 });
  
        await this.GoodVoting.endVoting({ from: admin });

        await expectRevert(
            this.GoodVoting.verifyVote({ from: voter3 }),
            "NV"
        );
    });
});
