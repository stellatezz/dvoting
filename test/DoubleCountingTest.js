const { expect } = require("chai");
const ethers = require('ethers');
const { BN, ether, expectEvent, expectRevert } = require("@openzeppelin/test-helpers");
const VotingEventManager = artifacts.require("./VotingEventManager");
const GoodVoting = artifacts.require("./GoodVoting");

contract("Double Counting Test", function (accounts) {
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
  
    it("should not allow double counting of votes", async function () {
      await this.GoodVoting.registerVoter(voter1, { from: admin });
      await this.GoodVoting.registerVoter(voter2, { from: admin });
  
      await this.GoodVoting.vote([0, 1], { from: voter1 });
      await this.GoodVoting.vote([0, 1], { from: voter2 });
  
      await expectRevert(this.GoodVoting.vote([0, 1], { from: voter1 }), "AV");
  
      await this.GoodVoting.endVoting({ from: admin });
  
      const candidate1 = await this.GoodVoting.candidates(0);
      const candidate2 = await this.GoodVoting.candidates(1);
      const candidate3 = await this.GoodVoting.candidates(2);
        
      expect(candidate1.voteCount).to.be.bignumber.equal(new BN(2), "Candidate 1 vote count is incorrect");
      expect(candidate2.voteCount).to.be.bignumber.equal(new BN(0), "Candidate 2 vote count is incorrect");
      expect(candidate3.voteCount).to.be.bignumber.equal(new BN(0), "Candidate 3 vote count is incorrect");
    });
});
