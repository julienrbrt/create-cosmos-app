import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Text,
  Flex,
  Center,
  NumberInput,
  NumberInputField,
  useMediaQuery,
  useColorModeValue,
} from '@chakra-ui/react';
import { Pool } from './provide-liquidity';
import { LargeButton } from './modal-components';
import { useTransactionToast } from './hooks';
import { convertDollarValueToShares, getSymbolForDenom } from '../../utils';
import { PriceHash } from '../../utils/types';
import { truncDecimals } from './pool-detail-modal';
import BigNumber from 'bignumber.js';
import { FEES, osmosis } from 'osmojs';
import { useChain } from '@cosmos-kit/react';
import { chainName } from '../../config/defaults';
import Long from 'long';
import { Peroid, TransactionResult } from '../types';

const { lockTokens } = osmosis.lockup.MessageComposer.withTypeUrl;

export const daysToSeconds = (days: string) => {
  return (Number(days) * 24 * 60 * 60).toString();
};

const BondSharesModal = ({
  isOpen,
  onClose,
  currentPool,
  prices,
  updatePoolsData,
  period,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentPool: Pool;
  prices: PriceHash;
  updatePoolsData: () => void;
  period: Peroid;
}) => {
  const [inputShares, setInputShares] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { getSigningStargateClient, address } = useChain(chainName);
  const { showToast } = useTransactionToast();
  const [isMobile] = useMediaQuery('(max-width: 480px)');

  const poolName = currentPool?.poolAssets.map(({ token }) =>
    getSymbolForDenom(token!.denom)
  );

  const unbondedShares = convertDollarValueToShares(
    currentPool?.myLiquidity || 0,
    currentPool,
    prices
  );

  const isAmountEmpty = new BigNumber(inputShares || 0).lte(0);
  const isAmountInsufficient = new BigNumber(inputShares || 0).gt(
    unbondedShares
  );

  const btnText = isAmountEmpty
    ? 'Amount is empty'
    : isAmountInsufficient
    ? 'Insufficient amount'
    : 'Bond';

  const closeModal = () => {
    onClose();
    setInputShares('');
  };

  const handleClick = async () => {
    setIsLoading(true);

    const stargateClient = await getSigningStargateClient();

    if (!stargateClient || !address) {
      console.error('stargateClient undefined or address undefined.');
      return;
    }

    const coins = [
      {
        amount: new BigNumber(inputShares).shiftedBy(18).toString(),
        denom: `gamm/pool/${currentPool.id.low}`,
      },
    ];

    const msg = lockTokens({
      coins,
      owner: address,
      duration: { seconds: Long.fromString(daysToSeconds(period)), nanos: 0 },
    });

    const fee = FEES.osmosis.lockTokens('low');

    try {
      const res = await stargateClient.signAndBroadcast(address, [msg], fee);
      stargateClient.disconnect();
      setIsLoading(false);
      showToast(res.code);
      closeModal();
      updatePoolsData();
    } catch (error) {
      console.log(error);
      stargateClient.disconnect();
      setIsLoading(false);
      showToast(TransactionResult.Failed);
    }
  };

  const titleColor = useColorModeValue('#697584', '#A7B4C2');
  const statColor = useColorModeValue('#2C3137', '#EEF2F8');
  const bgColor = useColorModeValue('#EEF2F8', '#1D2024');
  const borderColor = useColorModeValue('#D1D6DD', '#434B55');

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      isCentered
      size={isMobile ? 'xs' : { sm: 'sm', md: 'md', lg: 'lg' }}
    >
      <ModalOverlay bg="blackAlpha.800" />
      <ModalContent bg={useColorModeValue('#FFF', '#2C3137')}>
        <ModalHeader>
          <Text fontWeight="600" fontSize="20px" color={statColor}>
            Bond LP Tokens
          </Text>
          <Text fontWeight="400" fontSize="14px" color={titleColor}>
            {poolName?.join(' / ')}
          </Text>
        </ModalHeader>
        <ModalCloseButton color={titleColor} />
        <ModalBody>
          <Flex
            justifyContent="space-between"
            color={titleColor}
            mx="auto"
            mb="12px"
            mt="10px"
          >
            <Text fontWeight="600" fontSize="18px" lineHeight="shorter">
              Amount to bond
            </Text>
            <Flex
              flexDir={
                isMobile ? 'column' : { sm: 'column', md: 'column', lg: 'row' }
              }
              alignItems="flex-end"
            >
              <Text fontSize="14px">
                Available&nbsp;{isMobile && 'shares'}{' '}
              </Text>
              <Text fontWeight="600" fontSize="14px">
                {truncDecimals(unbondedShares, 12)} {!isMobile && 'shares'}
              </Text>
            </Flex>
          </Flex>

          <Flex h="68px" position="relative" mx="auto" mb="24px">
            <NumberInput
              h="100%"
              w="100%"
              bgColor={bgColor}
              border={`1px solid ${borderColor}`}
              borderRadius="6px"
              value={inputShares}
              onChange={(val) => setInputShares(val)}
            >
              <NumberInputField
                border="none"
                borderRadius="6px"
                h="100%"
                pl="18px"
                fontWeight="semibold"
                fontSize="18px"
                color={statColor}
              />
            </NumberInput>
          </Flex>

          <Center mb="32px">
            <LargeButton
              btnText={btnText}
              handleClick={handleClick}
              isLoading={isLoading}
              disabled={isAmountEmpty || isAmountInsufficient}
              width="512px"
            />
          </Center>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default BondSharesModal;
