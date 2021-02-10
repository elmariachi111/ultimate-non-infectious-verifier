// SPDX-License-Identifier: MIT
pragma solidity ^0.6;

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
    address[] upvotes;
    address[] downvotes;
    bool settled;
  }

  mapping(uint32 => Voting) suggestions;
  uint32 latest_suggestion = 0;

  constructor() public Ownable() AccessControl() {
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    _setupRole(ROLE_VOTER, msg.sender);
  }

  function proposeVoterAdopt(address candidate) public {
    require(hasRole(ROLE_VOTER, msg.sender));

    suggestions[latest_suggestion].candidate = candidate;
    suggestions[latest_suggestion].action = VotingActions.Adopt;
    suggestions[latest_suggestion].upvotes = [msg.sender];
    suggestions[latest_suggestion].settled = false;

    latest_suggestion++;
  }

  function proposeVoterDismiss(address candidate) public {
    require(hasRole(ROLE_VOTER, msg.sender));
    require(voters.contains(candidate), 'candidate is not a voter');

    suggestions[latest_suggestion].candidate = candidate;
    suggestions[latest_suggestion].action = VotingActions.Dismiss;
    suggestions[latest_suggestion].upvotes = [msg.sender];
    suggestions[latest_suggestion].settled = false;

    latest_suggestion++;
  }

  function vote(uint32 voting, bool opinion) public {
    require(hasRole(ROLE_VOTER, msg.sender));
    require(suggestions[voting].settled == false, 'the voting is closed');
    if (opinion) {
      suggestions[voting].upvotes.push(msg.sender);
    } else {
      suggestions[voting].downvotes.push(msg.sender);
    }
  }

  function settleVoting(uint32 voting) public {
    require(hasRole(ROLE_VOTER, msg.sender));

    //check if timelock is expired
    //check whether we reachead a quorum
    //check the quorum's outcome
    //execute the quorum's will
  }
}
