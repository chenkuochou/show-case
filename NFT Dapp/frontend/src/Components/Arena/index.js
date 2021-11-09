import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformCharacterData } from '../../constants';
import myEpicGame from '../../utils/MyEpicGame.json';
import './Arena.css';
import LoadingIndicator from '../LoadingIndicator';

/*
* You pass in your characterNFT metadata, so that you can pick a cool card in the UI
* You now need to update your character NFT - therefore setCharacterNFT here
* And make sure to pass it in your Arena component in App.js
*/
const Arena = ({ characterNFT, setCharacterNFT }) => {
  // State
  const [gameContract, setGameContract] = useState(null);

  /*
  * State that will hold the boss metadata
  */
  // const [boss, setBoss] = useState(null);

  // useEffects
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

      setGameContract(gameContract);
    } else {
      console.log('Ethereum object not found');
    }
   }, []);

   // State
    // {{DEFUNCT -- already declared above}} const [gameContract, setGameContract] = useState(null);
    /*
    * State that will hold your boss metadata
    */
    const [boss, setBoss] = useState(null);

    // useEffects
    useEffect(() => {
      /*
      * Set up async function that will get the boss from your contract - and set in state
      */
      const fetchBoss = async () => {
        const bossTxn = await gameContract.getBigBoss();
        console.log('Boss:', bossTxn);
        setBoss(transformCharacterData(bossTxn));
      };

      /*
      * Set up logic when this event is fired off
      */
      const onAttackComplete = (newBossHp, newPlayerHp) => {
        const bossHp = newBossHp.toNumber();
        const playerHp = newPlayerHp.toNumber();

        console.log(`AttackComplete: Boss Hp: ${bossHp} Player Hp: ${playerHp}`);

        /*
        * Update both player and boss Hp
        */
        setBoss((prevState) => {
          return { ...prevState, hp: bossHp };
        });

        setCharacterNFT((prevState) => {
          return { ...prevState, hp: playerHp };
        });
      };

      if (gameContract) {
        /*
        * gamecontract is ready to go! Let's fetch our boss
        */
        fetchBoss();
        gameContract.on('AttackComplete', onAttackComplete);
      }

      /*
      * Make sure to clean up this event when this component is removed
      */
      return () => {
        if (gameContract) {
          gameContract.off('AttackComplete', onAttackComplete);
        }
      }
    }, [gameContract]);
    

    const [showToast, setShowToast] = useState(false);

    /*
    * We're going to use this to add a bit of fancy animations during attacks
    */
    const [attackState, setAttackState] = useState('');

    // setAttackState is used to add some animations during attack plays (similar to Pokémon on Gameboy Color)
    // It will have 3 different states
    // 1. attacking - when we are waiting for the transaction to finish/complete
    // 2. hit - when we land a hit on the boss
    // '' - default state where we don't want anything to happen

    // Actions
    const runAttackAction = async () => {
      try {
        if (gameContract) {
          setAttackState('attacking');
          console.log('Attacking boss...');

          // const attackTxn = await gameContract.attackBoss();
          const txn = await gameContract.attackBoss();

          // await attackTxn.wait();
          await txn.wait();

          // console.log('attackTxn:', attackTxn);
          console.log(txn);

          setAttackState('hit');

          /*
          * Set your toast state to true, and then false 5 seconds later
          */
          setShowToast(true);
          setTimeout(() => {
            setShowToast(false);
          }, 5000);
        }
      } catch (error) {
        console.error('Error attacking boss:', error);
        setAttackState('');
      }
    };


  return (
    <div className="arena-container">
      {/* Add your toast HTML right here */}
      {boss && (
        <div id="toast" className="show">
          <div id="desc">{`💥 ${boss.name} was hit for ${characterNFT.attackDamage}!`}</div>
        </div>
      )}


      {/* Replace boss UI with this: Boss */}
      {boss && (
        <div className="boss-container">
          {/* Add attackState to the className. After all, it's just class names */}
          <div className={`boss-content ${attackState}`}>
            <h2>🔥 {boss.name} 🔥</h2>
            <div className="image-content">
              <img src={boss.imageURI} alt={`Boss ${boss.name}`} />
              <div className="health-bar">
                <progress value={boss.hp} max={boss.maxHp} />
                <p>{`${boss.hp} / ${boss.maxHp} HP`}</p>
            </div>
          </div>
        </div>
        <div className="attack-container">
          <button className="cta-button" onClick={runAttackAction}>
          {`💥 Attack ${boss.name}`}
          </button>
        </div>
        {/* Add this right under your attack button */}
        {attackState === 'attacking' && (
          <div className="loading-indicator">
            <LoadingIndicator />
            <p>Attacking ⚔️</p>
          </div>
        )}
      </div>
    )}

    {/* Replace your Character UI with this: Character NFT */}
    {characterNFT && (
      <div className="players-container">
        <div className="player-container">
          <h2>Your Character</h2>
          <div className="player">
            <div className="image-content">
              <h2>{characterNFT.name}</h2>
              <img
                src={characterNFT.imageURI}
                alt={`Character ${characterNFT.name}`}
              />
              <div className="health-bar">
                <progress value={characterNFT.hp} max={characterNFT.maxHp} />
                <p>{`${characterNFT.hp} / ${characterNFT.maxHp} HP`}</p>
              </div>
            </div>
            <div className="stats">
              <h4>{`⚔️ Attack Damage: ${characterNFT.attackDamage}`}</h4>
            </div>
          </div>
        </div>
        {/* <div className="active-players">
          <h2>Active Players</h2>
          <div className="players-list">{renderActivePlayersList()}</div>
        </div> */}
      </div>
    )}
  </div>
);

}

export default Arena;