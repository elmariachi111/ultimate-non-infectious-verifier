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
    address[] votes;
  }

  mapping(uint32 => Voting) suggestions;
  uint32 latest_suggestion = 0;

  //   constructor() public {
  //     grantRole(ROLE_VOTER, msg.sender);
  //   }

  function proposeVoterAdopt(address candidate) public {
    require(hasRole(ROLE_VOTER, msg.sender));

    suggestions[latest_suggestion].candidate = candidate;
    suggestions[latest_suggestion].action = VotingActions.Adopt;
    suggestions[latest_suggestion].votes = [msg.sender];

    latest_suggestion++;
  }

  function proposeDismissVoter(address candidate) public {}

  function vote(uint32 voting) public {
    require(hasRole(ROLE_VOTER, msg.sender));
  }
}
