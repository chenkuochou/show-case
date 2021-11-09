/*
* You are going to need to use state now. Don't forget to import useState
*/
import React, { useEffect, useState} from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformCharacterData } from './constants';
import myEpicGame from './utils/MyEpicGame.json';

import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import SelectCharacter from './Components/SelectCharacter';
import Arena from './Components/Arena';
import LoadingIndicator from './Components/LoadingIndicator';

// Constants
const TWITTER_HANDLE = 'chenkuochou';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  /*
  * This is just a 'State' variable you use to store our user's public wallet. Don't forget to import useState
  */
  const [currentAccount, setCurrentAccount] = useState(null);

  /*
  * This new state property can be setup right under current account
  */
  const [characterNFT, setCharacterNFT] = useState(null);

  /*
  * New state property added here
  */
  const [isLoading, setIsLoading] = useState(false);

  /*
  * Start by creating a new action that you'll run on component load
  */
  // Actions
  // Since this method will take some time, make sure to declare it as async
  const checkIfWalletIsConnected = async () => {
    
    try {
      /*
      * First make sure you have access to window.ethereum
      */
      const { ethereum } = window;
      
      if (!ethereum) {
        console.log('Make sure you have MetaMask!');
        return;
      } else {
        console.log('We have the ethereum object', ethereum);
      }

      /*
      * Check if you're authorized to access the user's wallet
      */
      const accounts = await ethereum.request({ method: 'eth_accounts' });

      /*
      * User can have multiple authorized accounts - you grab the first one if it's there
      */
      if (accounts.legnth !== 0) {
        const account = accounts[0];
        console.log('Found an authorized account:', account);
        setCurrentAccount(account);
      } else {
        console.log('No authorized account found');
      }
  } catch (error) {
    console.log(error);
  }
};

/*
* Implement your connectWallet method here
*/
const connectWalletAction = async () => {
  try {
    const { ethereum } = window;

    if (!ethereum) {
      alert('Get MetaMask!');
      return;
    }

    /*
    * A fancy method to request access to account
    */
    const accounts = await ethereum.request({
      method: 'eth_requestAccounts',
    });

    /*
    * Boom! This should print your public wallet address, once you authorize MetaMask
    */
    console.log('Connected', accounts[0]);
    setCurrentAccount(accounts[0]);
  } catch (error) {
    console.log(error);
  }
};

useEffect(() => {
  checkIfWalletIsConnected();
}, [])

  /*
  * this runs your function when the page loads
  */
  useEffect(() => {
    /*
    * Anytime our component mounts, make sure to immediately set our loading state
    */
    setIsLoading(false);
    checkIfWalletIsConnected();
  }, []);

  /*
  * Add this useEffect right under the other useEffect where you are calling checkIfWalletIsConnected
  */
  useEffect(() => {
    /*
    * This is the function you will call, that interacts with your smart contract
    */
    const fetchNFTMetadata = async () => {
      console.log('Checking for Character NFT on address:', currentAccount);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      /* const txn = await gameContract.checkIfUserHasNFT();
      if (txn.name) { {{DEFUNCT}} */

      const characterNFT = await gameContract.checkIfUserHasNFT();
      if (characterNFT.name) {
        console.log('User has character NFT');
        setCharacterNFT(transformCharacterData(characterNFT));
      }

      /*
      * Once you are done with all the fetching, set loading state to false
      */
      setIsLoading(false);
    };

    /*
    * You only want to run this if you have a connected wallet
    */
    if (currentAccount) {
      console.log('CurrenctAccount:', currentAccount);
      fetchNFTMetadata();
    }
  }, [currentAccount]);

  // Render Methods
    const renderContent = () => {

      /*
      * If the app is currently loading, just render out Loading Indicator
      */

      if (isLoading) {
        return <LoadingIndicator />;
      }

      /*
      * Scenario #1
      */
      if (!currentAccount) {
        return (
          <div className="connect-wallet-container">
          <img
            src="https://www.beano.com/wp-content/uploads/legacy/46326_fox-giphy.gif"
            alt="Kid Buu Gif"
          />
          <button
            className="cta-button connect-wallet-button"
            onClick={connectWalletAction}
          >
            Connect Wallet
          </button>
        </div>
        );
        /*
        * Scenario #2
        */
      } else if (currentAccount && !characterNFT) {
        return <SelectCharacter setCharacterNFT={setCharacterNFT} />;
        /*
        * Scenario #3
        * If there is a connected wallet and characterNFT, it's time to battle!
        */
      } else if (currentAccount && characterNFT) {
        return (
          <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} />
        );
      }
    };
    

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">⚔️ Baseball Battle⚔️</p>
          <p className="sub-text">Protect the Metaverse!</p>
          {/*
          * This is where your button and image code used to be (see defunct code below)
          * Remember that is has since been moved into the render method
          */}
          {renderContent()}
          {/* {{DEFUNCT CODE}}
          <div className="connect-wallet-container">
            <img
              src="https://i.imgur.com/W8M6ly7.gif"
              alt="Kid Buu Gif"
            />

            //
            * Button that you will use to trigger wallet connect
            * Don't forget to add the onClick event to call your method
            //

            <button
            className="cta-button connect-wallet-button"
            onClick={connectWalletAction}
            >
              Connect Wallet
            </button>
          </div>
          */}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`made by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
