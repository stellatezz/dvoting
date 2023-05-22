// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "./GoodVoting.sol";

contract VotingEventManager {
    struct VotingEvent {
        string name;
        address votingContract;
        address hostAdmin;
        uint[] winners;
        uint winnerVoteCount;
        bool isVotingEnded;
    }

    VotingEvent[] public votingEvents;
    event VotingEventCreated(address newVotingAddress, address adminHost, string eventName);

    function createVotingEvent(string memory eventName) public {
        GoodVoting newGoodVoting = new GoodVoting(this);
        newGoodVoting.grantRole(newGoodVoting.ADMIN_ROLE(), msg.sender);
        newGoodVoting.revokeRole(newGoodVoting.DEFAULT_ADMIN_ROLE(), address(this));
        
        VotingEvent storage newVotingEvent = votingEvents.push();
        newVotingEvent.name = eventName;
        newVotingEvent.votingContract = address(newGoodVoting);
        newVotingEvent.hostAdmin = msg.sender;
        newVotingEvent.isVotingEnded = false;

        emit VotingEventCreated(address(newGoodVoting), msg.sender, eventName);
    }

    function setWinner(address votingContract, uint[] memory _winners, uint _winnerVoteCount) external {
        for (uint i = 0; i < votingEvents.length; i++) {
            if (votingEvents[i].votingContract == votingContract) {
                require(msg.sender == votingEvents[i].votingContract, "NA.");
                votingEvents[i].winners = _winners;
                votingEvents[i].winnerVoteCount = _winnerVoteCount;
                votingEvents[i].isVotingEnded = true;
            }
        }
    }
    
}
