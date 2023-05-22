// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "./VoterOperations.sol";
import "./CandidateOperations.sol";
import "./VotingEventManager.sol";
import "./RoleBasedControl.sol";

contract GoodVoting is RoleBasedControl, VoterOperations, CandidateOperations {
    uint public winner;
    bool public isVotingEnded;

    VotingEventManager private votingEventManager;

    uint[] public winners;
    
    event VotingResult(uint[] winners, uint voteCount);
    event VoteReceived(address indexed voter, bytes32 preferencesHash);
    event CandidatesPrinted(uint i, string name, uint voteCount, bool isEliminated, uint requiredVotes);

    constructor(VotingEventManager _votingEventManager) {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        votingEventManager = _votingEventManager;
        isVotingEnded = false;
    }

    function vote(uint8[] memory preferences) public {
        Voter storage sender = voters[msg.sender];
        onlyVoter();
        require(!sender.isVoted, "AV");
        require(!sender.isDelegated, "D");
        require(preferences.length <= 2, "UP2C");

        for (uint i = 0; i < preferences.length; i++) {
            require(preferences[i] < candidates.length, "OCI");
        }

        sender.isVoted = true;
        sender.preferences = preferences;
        sender.preferencesHash = keccak256(abi.encodePacked(preferences));
        emit VoteReceived(msg.sender, sender.preferencesHash);
    }

    function verifyVote() public view returns (bool) {
        require(voters[msg.sender].isVoted, "NV");
        require(isVotingEnded, "N Ended");

        uint8 firstPreference = voters[msg.sender].preferences[0];

        return candidates[firstPreference].votersWhoVotedInRoundX[msg.sender] > 0 && 
        voters[msg.sender].preferencesHash == keccak256(abi.encodePacked(voters[msg.sender].preferences));
    }

    function hasMajorityVotes() private view returns (bool, uint, uint) {
        uint totalVotes = 0;

        for (uint i = 0; i < candidates.length; i++) {
            totalVotes += candidates[i].voteCount;
        }

        uint requiredVotes = totalVotes / 2;

        for (uint i = 0; i < candidates.length; i++) {
            if (candidates[i].voteCount > requiredVotes) {
                return (true, i, candidates[i].voteCount);
            }
        }

        return (false, 0, 0);
    }

    function countVotesByPreferences(uint round) private {
        for (uint i = 0; i < candidates.length; i++) {
            candidates[i].voteCount = 0;
        }

        for (uint i = 0; i < registeredVoters.length; i++) {
            Voter storage voter = voters[registeredVoters[i]];
            if (voter.isVoted && !voter.isDelegated) {
                for (uint rank = 0; rank < voter.preferences.length; rank++) {
                    uint curPreference = voter.preferences[rank];
                    if (!candidates[curPreference].isEliminated) {
                        candidates[curPreference].voteCount += voter.weight;
                        candidates[curPreference].votersWhoVotedInRoundX[registeredVoters[i]] = round;
                        break;
                    }
                }
            }
        }
    }

    function checkIfTie(uint minVoteCount) private view returns (bool) {
        for (uint i = 0; i < candidates.length; i++) {
            if (!candidates[i].isEliminated && candidates[i].voteCount != minVoteCount) {
                return false;
            }
        }
        return true;
    }

    function eliminateCandidates(uint minVoteCount) private {
        for (uint i = 0; i < candidates.length; i++) {
            if (!candidates[i].isEliminated && candidates[i].voteCount == minVoteCount) {
                candidates[i].isEliminated = true;
            }
        }
    }

    function endVoting() public {
        onlyAdmin();
        require(!isVotingEnded, "Ended");

        bool hasWinner = false;
        uint winningVoteCount = 0;
        uint round = 0;
        bool isTie = false;
        
        while (true) {
            countVotesByPreferences(++round);
            (hasWinner, winner, winningVoteCount) = hasMajorityVotes();

            if (hasWinner) {
                winners = new uint[](1);
                winners[0] = winner;
                break;
            }

            uint minVoteCount = findLastPlaceVoteCount();

            isTie = checkIfTie(minVoteCount);

            if (isTie){ 
                
                winningVoteCount = minVoteCount;
                
                uint count;
                for (uint i = 0; i < candidates.length; i++) {
                    count += !candidates[i].isEliminated ? 1 : 0;
                }

                winners = new uint[](count);
                count = 0;
                for (uint i = 0; i < candidates.length; i++) {
                    if (!candidates[i].isEliminated) {
                        winners[count++] = i;
                    }
                }

                break;
            }

            eliminateCandidates(minVoteCount);
        }

        if (winningVoteCount == 0) {
            winners = new uint[](0);
        } else {
            isVotingEnded = true;
            VotingEventManager(votingEventManager).setWinner(address(this), winners, winningVoteCount);
        }
        emit VotingResult(winners, winningVoteCount);
    }

    function findLastPlaceVoteCount() private view returns (uint) {
        uint lastPlaceVoteCount = type(uint).max;
        for (uint i = 0; i < candidates.length; i++) {
            if (!candidates[i].isEliminated && candidates[i].voteCount < lastPlaceVoteCount) {
                lastPlaceVoteCount = candidates[i].voteCount;
            }
        }
        return lastPlaceVoteCount;
    }

    function getWinners() public view returns (uint[] memory) {
        require(isVotingEnded, "N Ended");
        return winners;
    }
}
