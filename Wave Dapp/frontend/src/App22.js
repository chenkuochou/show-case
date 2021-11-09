import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json";

const getContract = () => {
  const contractAddress = "0x2800794B52af1B7aA9be450f7A15357CF5B6Afb7";
  const contractABI = abi.abi;
  
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();

  return new ethers.Contract(contractAddress, contractABI, signer);
}

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have Metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts'});
      
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account: ", account);
        setCurrentAccount(account)
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }
  
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch(error) {
      console.log(error)
    }
  }

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const waveportalContract = getContract();

        let count = await waveportalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        const waveTxn = await waveportalContract.wave();
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await waveportalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't count");
      }
    } catch(error) {
      console.log(error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  const [count, setCount] = React.useState();

  useEffect(() => {
    const getCount = async () => {
      
      
      const waveportalContract = getContract();

      const totalCount = await waveportalContract.getTotalWaves();
      setCount(totalCount);
    }
    getCount();
  })

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        🐶 Henlo I'm Romeo
        </div>

        <div className="bio">
        My hooman make this web3 dapp thing. Such neat, yes?
        <br />
        <br />Connect your Ethereum wallet and woof at me!
        <br />
        <br />Total woofs so far: ${count} (what i have here isn't compiling... waiting on discord help) ??
        </div>

        <button className="waveButton" onClick={wave}>
          Woof at Me
        </button>

        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect wallet
          </button>
        )}
      </div>
    </div>
  );
}

export default App