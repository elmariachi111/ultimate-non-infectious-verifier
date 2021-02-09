// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/EnumerableSet.sol';
import '@openzeppelin/contracts/access/AccessControl.sol';

contract Daoctor is Ownable, AccessControl {
  using EnumerableSet for EnumerableSet.AddressSet;

  enum VotingActions { Adopt, Dismiss }

  bytes32 public constant ROLE_VOTER = keccak256('ROLE_VOTER');

  EnumerableSet.AddressSet private voters;

  struct Voting {
    address candidate;
    VotingActions action;
    uint32[] votes;
  }

  mapping(uint32 => Voting) suggestions;

  //   constructor() public {
  //     grantRole(ROLE_VOTER, msg.sender);
  //   }

  function proposeVoterAction(address candidate, VotingActions action) public {
    require(hasRole(ROLE_VOTER, msg.sender));
    suggestions.push(Voting(candidate, Adopt));
  }

  function proposeDismissVoter(address candidate) public {}

  function vote(uint32 voting) public {
    require(hasRole(ROLE_VOTER, msg.sender));
  }
}
