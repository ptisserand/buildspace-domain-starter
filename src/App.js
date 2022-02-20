import React, { useEffect } from 'react';
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';

// Constants
const TWITTER_HANDLE = 'ptisserand';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {

	const checkIfWalletIsConnected = () => {
		const { ethereum } = window;
		if (!ethereum) {
			console.log("Make sure you have metamask");
			return;
		} else {
			console.log("We have the ethereum object", ethereum);
		}
	}

	// function to render if wallet is not connected
	const renderNotConnectedWallet = () => (
		<div className='connect-wallet-container'>
			<img src="https://media.giphy.com/media/xr7GE8l07Zw2Y/giphy.gif" alt="Robin gif" />
			<button className="cta-button connect-wallet-button">
				Connect Wallet
			</button>
		</div>
	);

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

				{renderNotConnectedWallet()}
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
