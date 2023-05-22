// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.7.0 <0.9.0;

import "./RoleBasedControl.sol";

contract CandidateOperations is RoleBasedControl {

    struct Candidate {
        string name;
        uint voteCount;
        bool isEliminated;
        mapping(address => uint) votersWhoVotedInRoundX;
    }

    Candidate[] public candidates;

    function addCandidate(string memory name) public {
        onlyAdmin();
        Candidate storage newCandidate = candidates.push();
        newCandidate.name = name;
        newCandidate.voteCount = 0;
        newCandidate.isEliminated = false;
    }

    function getAllCandidatesInfo() public view returns (string[] memory names) {
        names = new string[](candidates.length);
        for (uint i = 0; i < candidates.length; i++) {
            names[i] = candidates[i].name;
        }
    }
}
