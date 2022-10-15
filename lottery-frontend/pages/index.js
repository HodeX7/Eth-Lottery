import Head from "next/head";
import Web3 from "web3";
import styles from "../styles/Home.module.css";
import "bulma/css/bulma.css";
import { useEffect, useState } from "react";
import lotteryContract from "../blockchain/lottery";

export default function Home() {
  const [web3, setWeb3] = useState();
  const [address, setAddress] = useState();
  const [lcContract, setLcContract] = useState();
  const [lotteryPot, setLotteryPot] = useState();
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState("");
  const [lotteryHistory, setLotteryHistory] = useState([]);
  const [lotteryID, setLotteryID] = useState();

  useEffect(() => {
    if (lcContract) {
      getPot();
      getPlayers();
      getLotteryID();
    }
  }, [lcContract]);

  const getPot = async () => {
    const pot = await lcContract.methods.getBalance().call();
    setLotteryPot(web3.utils.fromWei(pot, "ether"));
  };
  const getPlayers = async () => {
    const players = await lcContract.methods.getPlayers().call();
    setPlayers(players);
  };

  const getHistory = async (id) => {
    setLotteryHistory([]);
    for (let i = parseInt(id); i > 0; i--) {
      const winnerAddress = await lcContract.methods.lotteryHistory(i).call();
      const historyObj = {};
      historyObj.id = i;
      historyObj.address = winnerAddress;
      setLotteryHistory((lotteryHistory) => [...lotteryHistory, historyObj]);
    }
  };
  const getLotteryID = async () => {
    const lotteryID = await lcContract.methods.lotteryID().call();
    setLotteryID(lotteryID);
    await getHistory(lotteryID);
  };

  const pickWinnerHandler = async () => {
    try {
      await lcContract.methods.pickWinner().send({
        from: address,
      });
    } catch (e) {
      setError(e.message);
    }
  };

  const enterLottery = async () => {
    try {
      await lcContract.methods.getTicket().send({
        from: address,
        value: web3.utils.toWei("0.01", "ether"),
      });
    } catch (e) {
      setError(e.message);
    }
  };
  const connectWalletHandler = async () => {
    setError("");
    //check if eth wallet exists
    if (typeof window !== undefined && typeof window.ethereum !== undefined) {
      try {
        //request wallet connection
        await window.ethereum.request({ method: "eth_requestAccounts" });
        //create a web3 instance
        const web3 = new Web3(window.ethereum);
        //set web3 instance in react statee
        setWeb3(web3);
        //get list of all accounts
        const accounts = await web3.eth.getAccounts();
        //set account 1 to react state
        setAddress(accounts[0]);

        //create local contract copy
        const lc = lotteryContract(web3);
        setLcContract(lc);
      } catch (e) {
        setError(e.message);
      }
    } else {
      console.alert("PLEASE INSTALL ETH WALLET");
    }
  };
  return (
    <div>
      <Head>
        <title>ETHER LOTTERY</title>
        <meta name="description" content="Ethereum lottery dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <nav className="navbar mt-4 mb-4">
          <div className="container">
            <div className="navbar-brand">
              <h1>ETHER LOTTERY</h1>
            </div>
            <div className="navbar-end">
              <button className="button is-link" onClick={connectWalletHandler}>
                {" "}
                CONNECT WALLET
              </button>
            </div>
          </div>
        </nav>
        <div className="container">
          <section className="mt-5">
            <div className="columns">
              <div className="column is-two-thirds">
                <section className="mt-5">
                  <p>Enter lottery by sending 0.01 ETH</p>
                  <button
                    className="button is-link is-large is-light mt-3"
                    onClick={enterLottery}
                  >
                    ENTER
                  </button>
                </section>
                <section className="mt-6">
                  <p>
                    Declare Winner <b>*ADMIN ONLY</b>
                  </p>
                  <button
                    className="button is-primary is-large is-light mt-3"
                    onClick={pickWinnerHandler}
                  >
                    PICK WINNER
                  </button>
                </section>
                <section>
                  <div className="container has-text-danger mt-6">
                    <p>{error}</p>
                  </div>
                </section>
              </div>
              <div className={`${styles.lotteryInfo} column is-one-third`}>
                <section className="mt-5">
                  <div className="card">
                    <div className="card-content">
                      <div className="content">
                        <h2>Lottery History</h2>
                        {lotteryHistory &&
                          lotteryHistory.length > 0 &&
                          lotteryHistory.map((item) => {
                            if (lotteryID != item.id) {
                              return (
                                <div
                                  className="history-entry mt-3"
                                  key={item.id}
                                >
                                  <div>Lottery #{item.id} winner:</div>
                                  <div>
                                    <a
                                      href={`https://etherscan.io/address/${item.address}`}
                                      target="_blank"
                                    >
                                      {item.address}
                                    </a>
                                  </div>
                                </div>
                              );
                            }
                          })}
                      </div>
                    </div>
                  </div>
                </section>
                <section className="mt-5">
                  <div className="card">
                    <div className="card-content">
                      <div className="content">
                        <h2>Players - {players.length}</h2>
                        <div>
                          Players:
                          <ul className="ml-0">
                            {players &&
                              players.length > 0 &&
                              players.map((player, index) => {
                                return (
                                  <li key={`${player}-${index}`}>
                                    <a
                                      href={`https://etherscan.io/address/${player}`}
                                      // target="_blank"
                                    >
                                      {player}
                                    </a>
                                  </li>
                                );
                              })}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
                <section className="mt-5">
                  <div className="card">
                    <div className="card-content">
                      <div className="content">
                        <h2>POT</h2>
                        <p>{lotteryPot} ETHER</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2022 Block Explorer</p>
      </footer>
    </div>
  );
}
