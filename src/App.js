import React, { useEffect, useState } from 'react';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import { ethers } from 'ethers';
import contractABI from './utils/contractABI.json';
// At the very top of the file, after the other imports
import polygonLogo from './assets/polygonlogo.png';
import ethLogo from './assets/ethlogo.png';
import { networks } from './utils/networks';


// Constants
const TWITTER_HANDLE = 'ptisserand';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const tld = ".foobar";
const CONTRACT_ADDRESS = "0xb92c74AB0d6b38df90015902d05dbe828B937147";

const App = () => {

	const [currentAccount, setCurrentAccount] = useState('');
	const [domain, setDomain] = useState('');
	const [record, setRecord] = useState('');
	const [network, setNetwork] = useState('');

	const checkIfWalletIsConnected = async () => {
		const { ethereum } = window;
		if (!ethereum) {
			console.log("Make sure you have metamask");
			return;
		} else {
			console.log("We have the ethereum object", ethereum);
		}

		// check if we have access to wallete
		const accounts = await ethereum.request({ method: 'eth_accounts' });
		if (accounts.length !== 0) {
			// if there is multiple account grabd the first one
			const account = accounts[0];
			console.log("Found an account:", account);
			setCurrentAccount(account);
		} else {
			console.log("No authorized account found");
		}
		// retrieve network informations
		const chainId = await ethereum.request({ method: 'eth_chainId' });
		setNetwork(networks[chainId]);

		// react on network change
		ethereum.on('chainChanged', handleChainChanged);

		// reload page when network change

		function handleChainChanged(_chainId) {
			window.location.reload();
		}

	}

	const mintDomain = async () => {
		// Don't run if domain is empty
		if (!domain) { return }
		if (domain.length < 3) {
			alert('Domain must be at least 3 characters long!');
			return;
		}
		// Calculate price based on length of domain (change this to match your contract)	
		// 3 chars = 0.5 MATIC, 4 chars = 0.3 MATIC, 5 or more = 0.1 MATIC
		const price = domain.length === 3 ? '0.5' : domain.length === 4 ? '0.3' : '0.1';
		console.log("Minting domain", domain, "with price", price);
		try {
			const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer);

				console.log('Going to pop wallet to sign transaction');
				let tx = await contract.register(domain, { value: ethers.utils.parseEther(price) });
				const receipt = await tx.wait();
				if (receipt.status === 1) {
					console.log("Domain minted! https://mumbai.polygonscan.com/tx/" + tx.hash);

					tx = await contract.setRecord(domain, record);
					await tx.wait();
					console.log('Record set!  https://mumbai.polygonscan.com/tx/' + tx.hash);
					setDomain('');
					setRecord('');
				} else {
					alert("Transaction failed, try again");
				}
			}
		} catch (error) {
			console.log(error);
		}
	}

	const connectWallet = async () => {
		try {
			const { ethereum } = window;
			if (!ethereum) {
				alert("Metamask is required: https://metamask.io");
				return;
			}
			const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
			console.log("Connected:", accounts[0]);
			setCurrentAccount(accounts[0]);
		} catch (error) {
			console.log(error);
		}
	}
	// function to render if wallet is not connected
	const renderNotConnectedWallet = () => (
		<div className='connect-wallet-container'>
			<img src="https://media.giphy.com/media/xr7GE8l07Zw2Y/giphy.gif" alt="Robin gif" />
			<button onClick={connectWallet} className="cta-button connect-wallet-button">
				Connect Wallet
			</button>
		</div>
	);

	const renderInputForm = () => {
		// If not on Polygon Mumbai Testnet, render "Please connect to Polygon Mumbai Testnet"
		if (network !== 'Polygon Mumbai Testnet') {
			return (
				<div className="connect-wallet-container">
					<p>Please connect to the Polygon Mumbai Testnet</p>
				</div>
			);
		}

		return (
			<div className='form-container'>
				<div className='first-row'>
					<input type="text"
						value={domain}
						placeholder='domain'
						onChange={e => setDomain(e.target.value)} />
					<p className='tld'> {tld} </p>
				</div>

				<input type="text"
					value={record}
					placeholder='wazzup'
					onChange={e => setRecord(e.target.value)} />

				<div className='button-container'>
					<button className='cta-button mint-button' disabled={null} onClick={mintDomain}>
						Mint
					</button>
					{/*
					<button className='cta-button mint-button' disabled={null} onClick={null}>
						Set data
					</button>
					*/}
				</div>
			</div>
		)
	};
	useEffect(() => {
		checkIfWalletIsConnected();
	}, []);

	return (
		<div className="App">
			<div className="container">

				<div className="header-container">
					<header>
						<div className="left">
							<p className="title">🦇 Robin Name Service</p>
							<p className="subtitle">Highlander API on the blockchain!</p>
						</div>
						<div className='right'>
							<img alt="Network logo" className="logo" src={network.includes("Polygon") ? polygonLogo : ethLogo} />
							{currentAccount ? <p> Wallet: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)} </p> : <p> Not connected </p>}
						</div>
					</header>
				</div>

				{!currentAccount && renderNotConnectedWallet()}
				{currentAccount && renderInputForm()}
				<div className="footer-container">
					<img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
					<a
						className="footer-text"
						href={TWITTER_LINK}
						target="_blank"
						rel="noreferrer"
					>{`built by @${TWITTER_HANDLE}`}</a>
				</div>
			</div>
		</div>
	);
}

export default App;
