import {
  Box,
  Divider,
  Grid,
  Heading,
  SimpleGrid,
  Text,
  Stack,
  Container
} from '@chakra-ui/react';
import {
  Connected,
  ConnectedUserInfo,
  Connecting,
  Disconnect,
  NotExist,
  Rejected,
  WalletConnectComponent,
  Astronaut,
  ChooseChain,
  handleSelectChainDropdown,
  ChainOption,
  ConnectedShowAddress,
  Product,
  Dependency,
  WalletStatus
} from '../components';
import styles from '../styles/Home.module.css';
import { useWalletManager, useWallet } from '@cosmos-kit/react';
import { mapStatusFromCosmosWallet } from "../utils";
import { MouseEventHandler, useState } from 'react';
import Head from 'next/head';
import { chainInfos, dependencies, products } from '../config';


export default function Home() {
  const [chainId, setChainId] = useState<string | undefined>();
  const { connect, disconnect } = useWalletManager();
  const { status, error, name, address } = useWallet(chainId);
  const walletStatus = mapStatusFromCosmosWallet(status, error as Error);

  const onClickConnect: MouseEventHandler = (e) => {
    e.preventDefault();
    connect();
  };

  const onClickDisconnect: MouseEventHandler = (e) => {
    e.preventDefault();
    disconnect();
  };


  const userInfoCard = (name)
    ? (
      <ConnectedUserInfo name={name} icon={<Astronaut />} />
    )
    : <></>;

  const addressCard = (chainId && address && name)
    ? (
      <Box maxW={{ base: "100%", md: "84%" }}>
        <ConnectedShowAddress address={address} username={name} showLink={true} isLoading={false} />
      </Box>
    )
    : <></>;

  const connectWalletButton = (
    <WalletConnectComponent
      walletStatus={walletStatus}
      disconnect={
        <Disconnect buttonText="Connect Wallet" onClick={onClickConnect} />
      }
      connecting={<Connecting />}
      connected={
        <Connected buttonText="Disconnect" onClick={onClickDisconnect} />
      }
      rejected={
        <Rejected
          buttonText="Chain Rejected"
          wordOfWarning="There is not enough chain information to connect to this chain."
        />
      }
      notExist={<NotExist buttonText="Not Exist" />}
    />
  )

  const onChainChange: handleSelectChainDropdown = (
    selectedValue: ChainOption | null
  ) => {
    if (selectedValue) {
      setChainId(selectedValue.chainId);
    }
  };

  const chooseChain = (
    <ChooseChain
      chainId={chainId}
      chainInfos={chainInfos}
      onChange={onChainChange}
    />
  );

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Cosmos App</title>
        <meta name="description" content="Generated by create cosmos app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Box as={Container} maxW="5xl" mt={14} p={4}>
          <Stack spacing={10} as={Container} maxW={'5xl'}
            textAlign={'center'} alignContent={'center'} alignItems='center'>
            <Heading
              fontWeight={800}
              fontSize={{ base: '3xl', sm: '4xl', md: '6xl' }}
              lineHeight={'110%'}>
              Cosmos App Made Easy <br />
            </Heading>
            <Heading
              fontWeight={700}
              fontSize={{ base: '2xl', sm: '3xl', md: '4xl' }}
              lineHeight={'110%'}>
              <Text as={'span'}>
                Welcome to {' '}
              </Text>
              <Text as={'span'} color={'purple.500'}>
                CosmosKit.js + Telescope + Next.js
              </Text>
            </Heading>
            <Stack
              pt={30}
              spacing={{ base: 4, sm: 6 }}
              // direction={{ base: 'column', sm: walletStatus === WalletStatus.Rejected ? 'column' : 'row' }}
              direction={{ base: 'column', sm: 'column', md: 'row' }}
              alignItems="center"
              justifyContent="center"
            >
              {chooseChain}
              {connectWalletButton}
            </Stack>
            {
              (chainId && !address)
                ? <></>
                : (
                  <Stack
                    spacing={{ base: 4, sm: 6 }}
                    direction={{ base: 'column', sm: 'row' }}
                    alignItems="center"
                    justifyContent="center"
                  >
                    {(chainId && address) ? addressCard : userInfoCard}
                  </Stack>
                )
            }
          </Stack>
          <Grid
            mt={90}
            mb={70}
            templateColumns={{
              base: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            }}
            gap={{ base: '3', sm: '6', md: '8' }}>
            {products.map(product => <Product {...product} key={product.title}></Product>)}
          </Grid>
          <Divider mt={12} mb={12} />
          <SimpleGrid columns={{ base: 1, md: 2, lg: 2 }} spacing={20} mb={50}>
            {dependencies.map((dependency) => <Dependency {...dependency}></Dependency>)}
          </SimpleGrid>
        </Box>
      </main>
      <footer className={styles.footer}>
        <a
          href="https://cosmology.tech/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by @cosmology-tech
        </a>
      </footer>
    </div>
  );
}