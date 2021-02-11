// SPDX-License-Identifier: MIT
pragma solidity ^0.6;
pragma experimental ABIEncoderV2;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/access/AccessControl.sol';
import '@openzeppelin/contracts/utils/EnumerableSet.sol';

contract Daoctor is Ownable, AccessControl {
  enum VotingActions { Adopt, Dismiss }

  bytes32 public constant ROLE_VOTER = keccak256('ROLE_VOTER');
  bytes32 public constant ROLE_VOTER_ADMIN = keccak256('ROLE_VOTER_ADMIN');

  struct Voting {
    address candidate;
    VotingActions action;
    address[] upvotes;
    address[] downvotes;
    uint256 openUntil;
    bool settled;
  }

  //a list of candidate addresses we're voting about
  EnumerableSet.AddressSet private ongoingVotings;
  mapping(address => Voting) votings;

  event VotingOpened(address indexed voter, address indexed candidate, VotingActions action);

  event Voted(address indexed voter, address indexed candidate, bool opinion);

  event VotingSettled(address indexed settler, address indexed candidate, VotingActions action, bool outcome);

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
    if (ongoingVotings.contains(candidate)) {
      revert('a voting on this candidate is already ongoing.');
    }
    votings[candidate].action = action;
    votings[candidate].candidate = candidate;
    votings[candidate].upvotes = [msg.sender];
    votings[candidate].settled = false;
    votings[candidate].openUntil = block.timestamp + 2 minutes;

    ongoingVotings.add(candidate);

    emit VotingOpened(msg.sender, candidate, action);
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

  function closeVoting(Voting storage voting, bool outcome) internal {
    voting.settled = true;
    ongoingVotings.remove(voting.candidate);
    emit VotingSettled(msg.sender, voting.candidate, voting.action, outcome);
  }

  function vote(address candidate, bool opinion) public {
    require(hasRole(ROLE_VOTER, msg.sender), 'youre not a voter');
    require(ongoingVotings.contains(candidate), 'no voting going on about that candidate');
    require(votings[candidate].settled == false, 'the voting is closed');
    if (alreadyVoted(votings[candidate], msg.sender)) {
      revert('you already voted for this suggestion');
    }

    if (opinion) {
      votings[candidate].upvotes.push(msg.sender);
    } else {
      votings[candidate].downvotes.push(msg.sender);
    }
  }

  function getVoting(address candidate) public view returns (Voting memory voting) {
    return votings[candidate];
  }

  function allOngoingVotings() public view returns (Voting[] memory) {
    Voting[] memory ret = new Voting[](ongoingVotings.length());
    for (uint256 i = 0; i < ongoingVotings.length(); i++) {
      ret[i] = votings[ongoingVotings.at(i)];
    }
    return ret;
  }

  function settleVoting(address candidate) public {
    require(ongoingVotings.contains(candidate), 'no voting going on about that candidate');
    require(msg.sender == candidate || hasRole(ROLE_VOTER, msg.sender), 'youre not a voter or the candidate');

    Voting storage voting = votings[candidate];
    require(voting.settled == false, 'the voting is closed');

    // check if timelock is expired
    require(voting.openUntil < block.timestamp, 'the voting time lock has not expired yet');

    // check whether we reached a quorum
    // check the quorum's outcome
    uint256 allVotersCount = getRoleMemberCount(ROLE_VOTER);
    if (100 * voting.upvotes.length < ((100 * allVotersCount) / 2)) {
      closeVoting(voting, false);
      return;
    }

    //execute the quorum's will
    if (voting.action == VotingActions.Adopt) {
      this.grantRole(ROLE_VOTER, voting.candidate);
    } else if (voting.action == VotingActions.Dismiss) {
      this.revokeRole(ROLE_VOTER, voting.candidate);
    }
    closeVoting(voting, true);
  }
}
