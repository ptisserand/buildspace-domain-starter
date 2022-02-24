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
const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS;

const App = () => {

	const [currentAccount, setCurrentAccount] = useState('');
	const [domain, setDomain] = useState('');
	const [record, setRecord] = useState('');
	const [network, setNetwork] = useState('');
	const [loading, setLoading] = useState(false);
	const [editing, setEditing] = useState(false);
	const [mints, setMints] = useState([]);


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

	const fetchMints = async () => {
		try {
			const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer);

				const names = await contract.getAllNames();

				// For each name , get record and address
				const mintRecords = await Promise.all(names.map(async (name) => {
					const mintRecord = await contract.records(name);
					const owner = await contract.domains(name);
					return {
						id: names.indexOf(name),
						name: name,
						record: mintRecord,
						owner: owner,
					}
				}));
				console.log('MINTS fetched', mintRecords);
				setMints(mintRecords);
			}
		} catch (error) {
			console.log(error);
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
					// call fetchMints after 2 seconds
					setTimeout(() => {
						fetchMints();
					}, 2000);
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

	const updateDomain = async () => {
		if (!record || !domain) { return; }
		setLoading(true);
		console.log("Updating domain", domain, "with record", record);
		try {
			const { ethereum } = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI.abi, signer);

				console.log('Going to pop wallet to sign transaction');
				let tx = await contract.setRecord(domain, record);
				await tx.wait();
				console.log("Record set https://mumbai.polygonscan.com/tx/" + tx.hash);
				fetchMints();
				setRecord('');
				setDomain('');
			}
		} catch (error) {
			console.log(error);
		}
		setLoading(false);
	}

	const cancelUpdateDomain = async () => {
		setRecord('');
		setDomain('');
		setEditing(false);
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

	const switchNetwork = async () => {
		if (window.ethereum) {
			try {
				await window.ethereum.request({
					method: 'wallet_switchEthereumChain',
					params: [{ chainId: '0x13881' }],
				});
			} catch (error) {
				if (error.code === 4092) {
					// thhis error code means that chain has not been added to metamask
					try {
						await window.ethereum.request({
							method: 'wallet_addEthereumChain',
							params: [
								{
									chainId: '0x13881',
									chainName: 'Polygon Mumbai Testnet',
									rpcUrls: ['https://rpc-mumbai.maticvigil.com/'],
									nativeCurrency: {
										name: "Mumbai Matic",
										symbol: "MATIC",
										decimals: 18
									},
									blockExplorerUrls: ["https://mumbai.polygonscan.com/"]
								}
							]
						})
					} catch (error) {
						console.log(error);
					}
				}
				console.log(error);
			}
		} else {
			alert('MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html');
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

	// This will take us into edit mode and show us the edit buttons!
	const editRecord = (name) => {
		console.log("Editing record for", name);
		setEditing(true);
		setDomain(name);
	}

	const renderMints = () => {
		if (currentAccount && mints.length > 0) {
			return (
				<div className="mint-container">
					<p className="subtitle"> Recently minted domains!</p>
					<div className="mint-list">
						{mints.map((mint, index) => {
							return (
								<div className="mint-item" key={index}>
									<div className='mint-row'>
										<a className="link" href={`https://testnets.opensea.io/assets/mumbai/${CONTRACT_ADDRESS}/${mint.id}`} target="_blank" rel="noopener noreferrer">
											<p className="underlined">{' '}{mint.name}{tld}{' '}</p>
										</a>
										{/* If mint.owner is currentAccount, add an "edit" button*/}
										{mint.owner.toLowerCase() === currentAccount.toLowerCase() ?
											<button className="edit-button" onClick={() => editRecord(mint.name)}>
												<img className="edit-icon" src="https://img.icons8.com/metro/26/000000/pencil.png" alt="Edit button" />
											</button>
											:
											null
										}
									</div>
									<p> {mint.record} </p>
								</div>)
						})}
					</div>
				</div>);
		}
	};

	const renderInputForm = () => {
		// If not on Polygon Mumbai Testnet, render "Please connect to Polygon Mumbai Testnet"
		if (network !== 'Polygon Mumbai Testnet') {
			return (
				<div className="connect-wallet-container">
					<p>Please switch to the Polygon Mumbai Testnet</p>
					<button className='cta-button mint-button' onClick={switchNetwork}>Click here to switch</button>
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
				{editing ? (
					<div className='button-container'>
						{ /* This will call the updateDomain function we just made */}
						<button className='cta-button mint-button' disabled={loading} onClick={updateDomain}>
							Set record
						</button>
						{ /*} This will let us get out of editing mode by setting editing to false */}
						<button className='cta-button mint-button' onClick={cancelUpdateDomain}>
							Cancel
						</button>
					</div>
				) : (
					<button className='cta-button mint-button' disabled={null} onClick={mintDomain}>
						Mint
					</button>
				)}
			</div>
		)
	};
	useEffect(() => {
		checkIfWalletIsConnected();
	}, []);
	useEffect(() => {
		if (network === 'Polygon Mumbai Testnet') {
			fetchMints();
		}
	}, [currentAccount, network]);

	return (
		<div className="App">
			<div className="container">

				<div className="header-container">
					<header>
						<div className="left">
							<p className="title">🦇 Robin Name Service</p>
							<p className="subtitle">Highlander API on the blockchain!</p>
						</div>
						<div className='right ethereum-address'>
							<img alt="Network logo" className="logo" src={network.includes("Polygon") ? polygonLogo : ethLogo} />
							{currentAccount ? <p> Wallet: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)} </p> : <p> Not connected </p>}
						</div>
					</header>
				</div>

				{!currentAccount && renderNotConnectedWallet()}
				{currentAccount && renderInputForm()}
				{mints && renderMints()}
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
