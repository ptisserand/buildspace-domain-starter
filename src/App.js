import React, { useEffect, useState } from 'react';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';

// Constants
const TWITTER_HANDLE = 'ptisserand';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const tld = ".foobar";
const CONTRACT_ADDRESS = "0xb92c74AB0d6b38df90015902d05dbe828B937147";

const App = () => {

	const [currentAccount, setCurrentAccount] = useState('');
	const [domain, setDomain] = useState('');
	const [record, setRecord] = useState('');

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
	}

	const mint = async () => {
		// Don't run if domain is empty
		
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
					<button className='cta-button mint-button' disabled={null} onClick={null}>
						Mint
					</button>
					<button className='cta-button mint-button' disabled={null} onClick={null}>
						Set data
					</button>
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
					>{`built with @${TWITTER_HANDLE}`}</a>
				</div>
			</div>
		</div>
	);
}

export default App;
