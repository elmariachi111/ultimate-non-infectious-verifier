// SPDX-License-Identifier: MIT
pragma solidity ^0.6;
pragma experimental ABIEncoderV2;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/access/AccessControl.sol';

contract Daoctor is Ownable, AccessControl {
  enum VotingActions { Adopt, Dismiss }

  bytes32 public constant ROLE_VOTER = keccak256('ROLE_VOTER');
  bytes32 public constant ROLE_VOTER_ADMIN = keccak256('ROLE_VOTER_ADMIN');

  struct Voting {
    address candidate;
    VotingActions action;
    address[] upvotes;
    address[] downvotes;
    bool settled;
  }

  mapping(address => bool) ongoingVotings;
  mapping(uint32 => Voting) suggestions;
  uint32 latest_suggestion = 0;

  constructor() public Ownable() AccessControl() {
    _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    //todo: drop ADMIN_ROLE when we trust this contract.

    _setRoleAdmin(ROLE_VOTER, ROLE_VOTER_ADMIN);
    _setupRole(ROLE_VOTER_ADMIN, address(this));
    _setupRole(ROLE_VOTER, msg.sender);
  }

  function proposeVoter(address candidate, VotingActions action) public {
    require(hasRole(ROLE_VOTER, msg.sender), 'youre not a voter.');
    if (action == VotingActions.Dismiss) {
      require(hasRole(ROLE_VOTER, candidate), 'candidate is not a voter');
    }
    if (ongoingVotings[candidate] == true) {
      revert('a voting on this candidate is already ongoing.');
    }
    suggestions[latest_suggestion].action = action;
    suggestions[latest_suggestion].candidate = candidate;
    suggestions[latest_suggestion].upvotes = [msg.sender];
    suggestions[latest_suggestion].settled = false;

    ongoingVotings[candidate] = true;
    latest_suggestion++;
  }

  function alreadyVoted(Voting memory voting, address voter) internal pure returns (bool) {
    for (uint256 i = 0; i < voting.upvotes.length; i++) {
      if (voting.upvotes[i] == voter) {
        return true;
      }
    }
    for (uint256 i = 0; i < voting.downvotes.length; i++) {
      if (voting.downvotes[i] == voter) {
        return true;
      }
    }

    return false;
  }

  function vote(uint32 voting, bool opinion) public {
    require(hasRole(ROLE_VOTER, msg.sender), 'youre not a voter');
    require(suggestions[voting].settled == false, 'the voting is closed');
    if (alreadyVoted(suggestions[voting], msg.sender)) {
      revert('you already voted for this suggestion');
    }

    if (opinion) {
      suggestions[voting].upvotes.push(msg.sender);
    } else {
      suggestions[voting].downvotes.push(msg.sender);
    }
  }

  function getSuggestion(uint32 voting) public view returns (Voting memory suggestion) {
    return suggestions[voting];
  }

  function settleVoting(uint32 votingId) public {
    require(hasRole(ROLE_VOTER, msg.sender));
    Voting storage voting = suggestions[votingId];

    require(voting.settled == false, 'this voting has settled already');
    //todo: check if timelock is expired

    //check whether we reached a quorum
    //check the quorum's outcome
    uint256 allVotersCount = getRoleMemberCount(ROLE_VOTER);
    if (100 * voting.upvotes.length < ((100 * allVotersCount) / 2)) {
      voting.settled = true;
      return;
      //revert('the majority has not been reached');
    }

    //execute the quorum's will
    if (voting.action == VotingActions.Adopt) {
      _setupRole(ROLE_VOTER, voting.candidate);
    } else if (voting.action == VotingActions.Dismiss) {
      //won't work since msg.sender isn't ROLE_VOTER_ADMIN
      //todo: https://forum.openzeppelin.com/t/accesscontrol-using-a-quorum-to-let-a-smart-contract-grant-revoke-roles/5747
      revokeRole(ROLE_VOTER, voting.candidate);
    }
    ongoingVotings[voting.candidate] = false;
    voting.settled = true;
  }
}
