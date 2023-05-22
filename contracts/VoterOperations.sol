// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

//import "@openzeppelin/contracts/access/AccessControl.sol";
import "./RoleBasedControl.sol";

contract VoterOperations is RoleBasedControl {
    struct Voter {
        uint weight;
        bool isDelegated;
        bool isVoted;
        uint8[] preferences;
        bytes32 preferencesHash;
        address proxy;
    }

    mapping(address => Voter) public voters;
    address[] public registeredVoters;

    event VoterRegistered(address indexed voter);
    event RegisteredVotersPrinted(address[] registeredVoters);

    function registerVoter(address voter) public {
        onlyAdmin();
        require(!hasRole(VOTER_ROLE, voter), "NV");
        require(!voters[voter].isVoted, "AV");
        
        _setupRole(VOTER_ROLE, voter);

        voters[voter].isDelegated = false;
        voters[voter].isVoted = false;
        voters[voter].weight = 1;
        voters[voter].preferences =  new uint8[](0);

        registeredVoters.push(voter);

        emit VoterRegistered(voter);
    }

    function grantProxy(address to) public {
        onlyVoter();
        require(hasRole(VOTER_ROLE, to), "NV");
        Voter storage sender = voters[msg.sender];

        require(!sender.isDelegated, "AD");
        require(!sender.isVoted, "AV");
        require(to != msg.sender, "Self D");

        while (voters[to].proxy != address(0)) {
            to = voters[to].proxy;
            require(to != msg.sender, "Loop");
        }

        sender.isDelegated = true;
        sender.proxy = to;

        Voter storage proxy = voters[to];
        proxy.weight += sender.weight;
    }
}
