// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

//import "@openzeppelin/contracts/access/AccessControl.sol";
import "../node_modules/@openzeppelin/contracts/access/AccessControl.sol";

contract RoleBasedControl is AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VOTER_ROLE = keccak256("VOTER_ROLE");

    function onlyAdmin() public view {
        require(hasRole(ADMIN_ROLE, msg.sender), "NA");
    }

    function onlyVoter() public view {
        require(hasRole(VOTER_ROLE, msg.sender), "NV");
    }

    function isAdmin(address account) public view returns (bool) {
        return hasRole(ADMIN_ROLE, account);
    }

    function isVoter(address account) public view returns (bool) {
        return hasRole(VOTER_ROLE, account);
    }
}