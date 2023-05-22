const { expect } = require("chai");
const ethers = require('ethers');
const { BN, ether, expectEvent, expectRevert } = require("@openzeppelin/test-helpers");
const VotingEventManager = artifacts.require("./VotingEventManager");
const GoodVoting = artifacts.require("./GoodVoting");

contract("Proxy Voting Test", function (accounts) {
    const deployer = accounts[0];
    const admin = accounts[1];
    const voter1 = accounts[2];
    const voter2 = accounts[3];
    const voter3 = accounts[4];
    const voter4 = accounts[5];
    const voter5 = accounts[6];
    const voter6 = accounts[7];
    const voter7 = accounts[8];

    beforeEach(async function () {
        this.votingEventManager = await VotingEventManager.new({ from: deployer });
        const tx = await this.votingEventManager.createVotingEvent("Test Election", { from: admin });

        const votingEventAddress = tx.logs[0].args.newVotingAddress;
        this.GoodVoting = await GoodVoting.at(votingEventAddress);

        await this.GoodVoting.registerVoter(voter1, { from: admin });
        await this.GoodVoting.registerVoter(voter2, { from: admin });
        await this.GoodVoting.registerVoter(voter3, { from: admin });
        await this.GoodVoting.registerVoter(voter4, { from: admin });
        await this.GoodVoting.registerVoter(voter5, { from: admin });
        await this.GoodVoting.registerVoter(voter6, { from: admin });

        await this.GoodVoting.addCandidate("Tom", { from: admin });
        await this.GoodVoting.addCandidate("Ben", { from: admin });
        await this.GoodVoting.addCandidate("Edward", { from: admin });
    });
  
    it("should count votes of proxy", async function () {    
        await this.GoodVoting.grantProxy(voter2, { from: voter3 });
        await this.GoodVoting.grantProxy(voter2, { from: voter4 });
        
        await this.GoodVoting.vote([0, 1], { from: voter1 });
        await this.GoodVoting.vote([1, 2], { from: voter2 });
    
        await this.GoodVoting.endVoting({ from: admin });
    
        const winners = await this.GoodVoting.getWinners();
        expect(winners.length).equal(1, "Number of winners should be 1");

        const winner = await this.GoodVoting.winners(0);
        expect(winner).to.be.bignumber.equal(new BN(1), "The winner should be candidate 1 Ben");

        const candidate1 = await this.GoodVoting.candidates(1);
          
        expect(candidate1.voteCount).to.be.bignumber.equal(new BN(3), "Ben should has total 3 votes");  
    });

    it("should count votes of complex proxy", async function () {    
        await this.GoodVoting.grantProxy(voter2, { from: voter3 });
        await this.GoodVoting.grantProxy(voter2, { from: voter4 });

        await this.GoodVoting.grantProxy(voter5, { from: voter2 });
        await this.GoodVoting.grantProxy(voter2, { from: voter6 });
        
        await this.GoodVoting.vote([0, 1], { from: voter1 });
        await this.GoodVoting.vote([1, 2], { from: voter5 });
    
        await this.GoodVoting.endVoting({ from: admin });
    
        const winners = await this.GoodVoting.getWinners();
        expect(winners.length).equal(1, "Number of winners should be 1");

        const winner = await this.GoodVoting.winners(0);
        expect(winner).to.be.bignumber.equal(new BN(1), "The winner should be candidate 1 Ben");

        const candidate1 = await this.GoodVoting.candidates(1);
          
        expect(candidate1.voteCount).to.be.bignumber.equal(new BN(5), "Ben should has total 5 votes");  
    });

    it("should not allow delegate to self", async function () {    
        await expectRevert(
            this.GoodVoting.grantProxy(voter2, { from: voter2 }),
            "Self D"
        );
    });

    it("should not allow delegate to unregistered voter", async function () {    
        await expectRevert(
            this.GoodVoting.grantProxy(voter7, { from: voter2 }),
            "NV"
        );
    });
});
