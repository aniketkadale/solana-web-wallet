import React, { useState } from "react";
import "./App.css";
import { generateMnemonic } from "bip39";
import { mnemonicToSeed } from "bip39";
import { derivePath } from "ed25519-hd-key";
import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";
import { FiTrash2, FiEye, FiEyeOff } from "react-icons/fi";

const App = () => {
  const [mnemonic, setMnemonic] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [publicKeys, setPublicKeys] = useState([]);
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  function generateCustomMnemonic() {
    const mn = generateMnemonic();
    setMnemonic(mn);
    console.log(mn);
  }

  function generateWallet() {
    const seed = mnemonicToSeed(mnemonic);
    const path = `m/44'/501'/${currentIndex}'/0'`;
    const derivedSeed = derivePath(path, seed.toString("hex")).key;
    const secret = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
    const keypair = Keypair.fromSecretKey(secret);
    setCurrentIndex(currentIndex + 1);
    setPublicKeys([
      ...publicKeys,
      { publicKey: keypair.publicKey, secretKey: secret },
    ]);
  }

  function togglePrivateKeyVisibility() {
    setShowPrivateKey(!showPrivateKey);
  }

  // Split the mnemonic into an array of words
  const mnemonicWords = mnemonic.split(" ");

  return (
    <>
      {/* Navbar */}
      <div className="navbar flex justify-between items-center p-5 text-white">
        <div className="flex logo justify-center items-center">
          <img
            className="w-10 h-10 mr-3"
            src="https://cdn.iconscout.com/icon/premium/png-256-thumb/solana-sol-7152167-5795323.png?f=webp&w=256"
            alt="logo"
            style  = {{height: 55, width: 55}}
          />
          <h1 className="text-3xl font-extrabold">SOL-WALLET</h1>
        </div>

        <div className="navLinks">
          <ul className="flex gap-8">
            <li className="text-lg hover:underline cursor-pointer">Pricing</li>
            <li className="text-lg hover:underline cursor-pointer">About</li>
            <li className="text-lg hover:underline cursor-pointer">Contact</li>
          </ul>
        </div>
      </div>

      {/* Main Section */}
      <div className="container mx-auto px-5 mt-15">
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-bold mb-4 text-center">
            Secret Recovery Phrase
          </h1>
          <span className="text-lg font-semibold mb-8 text-center">
            Keep these words in a safe place 🔐
          </span>

          <div className="flex flex-col items-center mb-8">
            {/* Create Seed Phrase Button */}
            <button
              className="p-4 mb-5 w-60 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-all"
              onClick={generateCustomMnemonic}
            >
              Create Seed Phrase
            </button>

            {/* Display the mnemonic in a grid of 4 words per row */}
            {mnemonic && (
              <>
                <h2 className="text-3xl font-bold mb-5">Your Seed Phrase</h2>
                <div className="grid grid-cols-4 gap-4 p-5 bg-black rounded-lg shadow-md">
                  {mnemonicWords.map((word, index) => (
                    <div
                      key={index}
                      className="p-3 border border-gray-300 rounded-md bg-white text-center text-black font-medium"
                    >
                      {word}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Secret Phrase Input and Generate Wallet Button */}
          <div className="flex  items-center w-full max-w-2xl gap-4">
            <input
              className="p-3 w-full border border-gray-400 rounded-md text-center text-slate-700"
              type="text"
              placeholder="Enter your secret phrase (or leave blank to create new)"
              value={mnemonic}
            />
            <button
              className="p-4 w-60 bg-green-500 hover:bg-green-600 text-white rounded-md transition-all"
              onClick={generateWallet}
            >
              Generate Wallet
            </button>
          </div>
        </div>

        {/* Display Generated Wallet Public Keys */}
        {publicKeys.length > 0 && (
          <div className="wallet mt-10">
            {publicKeys.map((wallet, index) => (
              <div
                key={index}
                className="p-6 bg-gray-900 text-white rounded-lg shadow-md mb-5 relative"
              >
                {/* Wallet Header with Delete Button */}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Wallet {index + 1}</h2>
                  <button onClick={() => deleteWallet(index)}>
                    <FiTrash2 className="text-red-500 hover:text-red-700 text-xl" />
                  </button>
                </div>

                {/* Public Key */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Public Key</h3>
                  <p className="text-sm font-mono break-all">
                    {wallet.publicKey.toBase58()}
                  </p>
                </div>

                {/* Private Key Section */}
                <div className="flex justify-between items-center bg-gray-800 p-3 rounded-md">
                  <div>
                    <h3 className="text-lg font-semibold">Private Key</h3>
                    <p className="text-sm font-mono">
                      {showPrivateKey
                        ? Buffer.from(wallet.secretKey).toString("hex")
                        : "•".repeat(64)}
                    </p>
                  </div>
                  <button
                    className="text-xl text-gray-400 hover:text-gray-200"
                    onClick={togglePrivateKeyVisibility}
                  >
                    {showPrivateKey ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default App;
