const { expect } = require("chai");
const ethers = require('ethers');
const { BN, ether, expectEvent, expectRevert } = require("@openzeppelin/test-helpers");
const VotingEventManager = artifacts.require("./VotingEventManager");
const GoodVoting = artifacts.require("./GoodVoting");

contract("Instant Runoff Voting Test", (accounts) => {
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
        const tx = await this.votingEventManager.createVotingEvent("Test Instant Runoff Voting", { from: admin });

        const votingEventAddress = tx.logs[0].args.newVotingAddress;
        this.GoodVoting = await GoodVoting.at(votingEventAddress);

        await this.GoodVoting.registerVoter(voter1, { from: admin });
        await this.GoodVoting.registerVoter(voter2, { from: admin });
        await this.GoodVoting.registerVoter(voter3, { from: admin });
        await this.GoodVoting.registerVoter(voter4, { from: admin });
        await this.GoodVoting.registerVoter(voter5, { from: admin });
        await this.GoodVoting.registerVoter(voter6, { from: admin });
        await this.GoodVoting.registerVoter(voter7, { from: admin });

        await this.GoodVoting.addCandidate("Tom", { from: admin });
        await this.GoodVoting.addCandidate("Ben", { from: admin });
        await this.GoodVoting.addCandidate("Edward", { from: admin });
    });

    it("Instant Runoff Voting should let the candidate with the majority win", async function () {
        await this.GoodVoting.vote([0, 1], { from: voter1 });
        await this.GoodVoting.vote([0, 1], { from: voter2 });
        await this.GoodVoting.vote([2, 0], { from: voter3 });
        await this.GoodVoting.vote([0, 2], { from: voter4 });  

        await this.GoodVoting.endVoting({ from: admin });

        const winners = await this.GoodVoting.getWinners();
        expect(winners.length).equal(1, "Number of winners should be 1");

        const winner = await this.GoodVoting.winners(0);
        expect(winner).to.be.bignumber.equal(new BN(0), "The winner should be candidate 0 Tom");
    });


    it("Instant Runoff Voting should eliminate candidates and transfer votes until a majority is reached", async function () {
        await this.GoodVoting.vote([0, 2], { from: voter1 });
        await this.GoodVoting.vote([1, 2], { from: voter2 });
        await this.GoodVoting.vote([1, 0], { from: voter3 });
        await this.GoodVoting.vote([2, 0], { from: voter4 });
        await this.GoodVoting.vote([2, 0], { from: voter5 });

        await this.GoodVoting.endVoting({ from: admin });

        const winners = await this.GoodVoting.getWinners();
        expect(winners.length).equal(1, "Number of winners should be 1");

        const winner = await this.GoodVoting.winners(0);
        expect(winner).to.be.bignumber.equal(new BN(2), "The winner should be candidate 2 Edward");
    });

    it("Instant Runoff Voting should handle tie", async function () {
        await this.GoodVoting.vote([1, 2], { from: voter1 });
        await this.GoodVoting.vote([1, 2], { from: voter2 });
        await this.GoodVoting.vote([2, 0], { from: voter3 });
        await this.GoodVoting.vote([2, 0], { from: voter4 });

        await this.GoodVoting.endVoting({ from: admin });

        const winners = await this.GoodVoting.getWinners();
        expect(winners.length).equal(2, "Number of winners should be 2");

        const winner1 = await this.GoodVoting.winners(0);
        const winner2 = await this.GoodVoting.winners(1);
        expect(winner1).to.be.bignumber.equal(new BN(1), "The winner1 should be candidate 1 Ben");
        expect(winner2).to.be.bignumber.equal(new BN(2), "The winner2 should be candidate 2 Edward");
    });

    it("Instant Runoff Voting should handle voters not using all available preferences", async function () {
        await this.GoodVoting.vote([1], { from: voter1 });
        await this.GoodVoting.vote([0, 1], { from: voter2 });
        await this.GoodVoting.vote([1], { from: voter3 });
        await this.GoodVoting.vote([1, 2], { from: voter4 });

        await this.GoodVoting.endVoting({ from: admin });

        const winners = await this.GoodVoting.getWinners();
        expect(winners.length).equal(1, "Number of winners should be 1");

        const winner = await this.GoodVoting.winners(0);
        expect(winner).to.be.bignumber.equal(new BN(1), "The winner should be candidate 1 Ben");
    });

    it("Instant Runoff Voting should handle no voters", async function () {
        await this.GoodVoting.endVoting({ from: admin });

        await expectRevert(
            this.GoodVoting.getWinners(),
            "N Ended"
          );
    });
});






