import React, { useEffect, useState } from 'react';
import './SelectCharacter.css';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformCharacterData } from '../../constants';
import myEpicGame from '../../utils/MyEpicGame.json';
import LoadingIndicator from '../LoadingIndicator';

/*
* Don't worry about setCharacterNFT just yet - you'll talk about it soon
*/
const SelectCharacter = ({ setCharacterNFT }) => {

  // Action
  const mintCharacterNFTAction = (characterId) => async () => {
    try {
      if (gameContract) {
        /*
        * Show your loading indicator
        */
        setMintingCharacter(true);
        console.log('Minting character in progress...');
        const mintTxn = await gameContract.mintCharacterNFT(characterId);
        await mintTxn.wait();
        console.log(mintTxn);
        /*
        * Hide your loading indicator when minting is finished
        */
        setMintingCharacter(false);
      }
    } catch (error) {
      console.warn('MintCharacterAction Error:', error);
      /*
      * If there is a problem, hide the loading indicator as well
      */
      setMintingCharacter(false);
    }
  };

  const [characters, setCharacters] = useState([]);
  const [gameContract, setGameContract] = useState(null);

  /*
  * New minting state property you will be using
  */
  const [mintingCharacter, setMintingCharacter] = useState(false);

  // UseEffect
useEffect(() => {
  const { ethereum } = window;

  if (ethereum) {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const gameContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      myEpicGame.abi,
      signer
    );

    /*
    * This is the big difference. Set your gameContract in state
    */
    setGameContract(gameContract);
  } else {
    console.log('Ethereum object not found');
  }
}, []);

useEffect(() => {
  const getCharacters = async () => {
    try {
      console.log('Getting contract characters to mint');

      /*
      * Call contract to get all mint-able characters
      */
      const charactersTxn = await gameContract.getAllDefaultCharacters();
      console.log('charactersTxn:', charactersTxn);

      /*
      * Go through all of our NFT characters and transform the data
      */
      const characters = charactersTxn.map((characterData) =>
        transformCharacterData(characterData)
      );

      /*
      * Set all mint-able characters in state
      */
      setCharacters(characters);
    } catch (error) {
      console.error('Something went wrong fetching characters:', error);
    }
  };

  /*
  * Add a callback method that will fire when this event is received
  */
  const onCharacterMint = async (sender, tokenId, characterIndex) => {
    console.log(
      `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
      
    );

    /*
    * Once a character NFT is minted, you can fetch the metadata from the smart contract
    * And then set it in state to move onto the Arena
    */
    if (gameContract) {
      const characterNFT = await gameContract.checkIfUserHasNFT();
      console.log('CharacterNFT: ', characterNFT);
      setCharacterNFT(transformCharacterData(characterNFT));
    }
  };

  /*
  * If the gameContract is ready, let's get the NFT characters!
  */
  if (gameContract) {
    getCharacters();

    /*
    * Set up NFT Minted Listener
    */
    gameContract.on('CharacterNFTMinted', onCharacterMint);
  }

  return () => {
    /*
    * When your component unmounts, then make sure to clean up this listener
    */
    if (gameContract) {
      gameContract.off('CharacterNFTMinted', onCharacterMint);
      // alert(`Your NFT is all done -- see it here: https://testnets.opensea.io/assets/${gameContract}/${tokenId.toNumber()}`)
    }
  };
}, [gameContract]);


// Render Methods
const renderCharacters = () =>
characters.map((character, index) => (
  <div className="character-item" key={character.name}>
    <div className="name-container">
      <p>{character.name}</p>
    </div>
    <img src={character.imageURI} alt={character.name} />
    <button
      type="button"
      className="character-mint-button"
      onClick={mintCharacterNFTAction(index)}
      >{`Mint ${character.name}`}</button>
  </div>
));

  return (
    <div className="select-character-container">
    <h2>Mint Your Toon Slayer. Choose wisely.</h2>
    {/* Only show this when there are characters in state */}
    {characters.length > 0 && (
      <div className="character-grid"> {renderCharacters()}</div>
    )}
    {/* Only show your loading state if mintingCharacter is true */}
    {mintingCharacter && (
      <div className="loading">
        <div className="indicator">
          <LoadingIndicator />
          <p>Minting In Progress...</p>
        </div>
        <img
        src="https://media.giphy.com/media/adikIKGu30u6A/giphy.gif"
        alt="Minting loading indicator"
        />
      </div>
    )}
    </div>
  );
};

export default SelectCharacter;