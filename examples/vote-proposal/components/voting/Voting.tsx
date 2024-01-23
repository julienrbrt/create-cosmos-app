import { useState } from "react";
import { useChain } from "@cosmos-kit/react";
import {
  Proposal as IProposal,
  ProposalStatus,
  TallyResult,
} from "interchain-query/cosmos/gov/v1beta1/gov";
import {
  BasicModal,
  Box,
  GovernanceProposalItem,
  Spinner,
  Text,
  useColorModeValue,
} from "@interchain-ui/react";
import { useModal, useVotingData } from "@/hooks";
import { Proposal } from "@/components";
import { formatDate } from "@/utils";

function status(s: ProposalStatus) {
  switch (s) {
    case ProposalStatus.PROPOSAL_STATUS_UNSPECIFIED:
      return "pending";
    case ProposalStatus.PROPOSAL_STATUS_DEPOSIT_PERIOD:
      return "pending";
    case ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD:
      return "pending";
    case ProposalStatus.PROPOSAL_STATUS_PASSED:
      return "passed";
    case ProposalStatus.PROPOSAL_STATUS_REJECTED:
      return "rejected";
    case ProposalStatus.PROPOSAL_STATUS_FAILED:
      return "rejected";
    default:
      return "pending";
  }
}

function votes(result: TallyResult) {
  return {
    yes: Number(result.yes) || 0,
    no: Number(result.no) || 0,
    abstain: Number(result.abstain) || 0,
    noWithVeto: Number(result.noWithVeto) || 0,
  };
}

export type VotingProps = {
  chainName: string;
};

export function Voting({ chainName }: VotingProps) {
  const { address } = useChain(chainName);
  const [proposal, setProposal] = useState<IProposal>();
  const { data, isLoading, refetch } = useVotingData(chainName);
  const { modal, open: openModal, close: closeModal, setTitle } = useModal("");

  function onClickProposal(index: number) {
    const proposal = data.proposals![index];
    openModal();
    setProposal(proposal);
    setTitle(`#${proposal.proposalId?.toString()} ${proposal.content?.title}`);
  }

  const content = (
    <Box mt="$12">
      {data.proposals?.map((proposal, index) => (
        <Box
          my="$8"
          position="relative"
          attributes={{ onClick: () => onClickProposal(index) }}
        >
          {data.votes[proposal.proposalId.toString()]
            ? (
              <Box
                position="absolute"
                px="$4"
                py="$2"
                top="$4"
                right="$6"
                borderRadius="$md"
                backgroundColor="$green400"
              >
                <Text color="$white" fontSize="$xs" fontWeight="$bold">
                  Voted
                </Text>
              </Box>
            )
            : null}
          <GovernanceProposalItem
            id={`# ${proposal.proposalId?.toString()}`}
            key={proposal.submitTime?.getTime()}
            title={proposal.content?.title || ""}
            status={status(proposal.status)}
            votes={votes(proposal.finalTallyResult!)}
            endTime={formatDate(proposal.votingEndTime)!}
          />
        </Box>
      ))}
    </Box>
  );

  const connect = (
    <Box mt="$8" display="flex" alignItems="center" justifyContent="center">
      <Text fontSize="$lg">
        Please connect to your wallet to see the proposals.
      </Text>
    </Box>
  );

  const Loading = (
    <Box
      p="$8"
      borderRadius="$md"
      justifyContent="center"
      display={isLoading ? "flex" : "none"}
    >
      <Spinner
        size="$5xl"
        color={useColorModeValue("$blackAlpha800", "$whiteAlpha900")}
      />
    </Box>
  );

  return (
    <Box mb="$20" position="relative">
      <Text fontWeight="600" fontSize="$2xl">Proposals</Text>

      {address ? Loading : null}

      {address ? content : connect}

      <BasicModal
        title={modal.title}
        isOpen={modal.open}
        onOpen={openModal}
        onClose={closeModal}
      >
        <Proposal
          votes={data.votes}
          proposal={proposal!}
          quorum={data.quorum!}
          bondedTokens={data.bondedTokens!}
          chainName={chainName}
          onVoteSuccess={refetch}
        />
      </BasicModal>
    </Box>
  );
}
