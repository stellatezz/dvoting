import * as React from "react";
import { Button, Typography } from "@mui/material";
import CoverLayout from "../components/CoverLayout";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import VotingEventManager from "../contracts/VotingEventManager.json"
import getWeb3 from "../utils/getWeb3";

export default function CoverPage() {
  const navigate = useNavigate();
  const [web3, setWeb3] = useState(null);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);

  const eventName = "Good Voting";


  const handleClick = async () => {
    if (contract) {
      const accounts = currentAccount;
      await contract.methods.createVotingEvent(eventName).send({ from: currentAccount });
    }
  };

  const loadWeb3 = async () => {
    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = VotingEventManager.networks[networkId];
      const instance = new web3.eth.Contract(
        VotingEventManager.abi,
        deployedNetwork && deployedNetwork.address
      );
      setWeb3(web3);
      setCurrentAccount(accounts[0]);
      setContract(instance);

      console.log(VotingEventManager.methods);
      console.log(VotingEventManager.abi);


      console.log("init");
      setLoading(false);

      instance.events.VotingEventCreated({}, (error, event) => {
        if (error) {
          console.error(error);
        } else {
          console.log("Voting event created with the following parameters:");
          console.log("Address:", event.returnValues.adminHost);
          console.log("Host Admin:", event.returnValues.eventName);
          console.log("Event Name:", event.returnValues.newVotingAddress);
          
          setLoading(false);

          // navigate("/home", { state: {
          //   votingContract: event.returnValues.newVotingAddress,
          //   hostAdmin: event.returnValues.adminHost,
          //   eventName: event.returnValues.eventName,
          //   web3: web3,
          //   VotingEventManagerContract: contract,
          //   currentAccount: currentAccount
          // } });

          navigate('/home',{state:{
            votingContract: event.returnValues.newVotingAddress,
            VotingEventManagerContract: contract,
            currentAccount: currentAccount
          }});
          
        }
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    loadWeb3();
  }, []);

  return (
    <CoverLayout
      sxBackground={{
        backgroundColor: "#90EE90", 
        backgroundPosition: "center",
      }}
    >
      <img
        style={{ display: "none" }}
        alt="increase priority"
      />
      <Typography color="inherit" align="center" variant="h2" marked="center">
        Blockchain Based Voting System
      </Typography>
      <Typography
        color="inherit"
        align="center"
        variant="h5"
        sx={{ mb: 4, mt: { sx: 4, sm: 10 } }}
      >
        Proctecting Your Vote with the Best Security
      </Typography>

      <Button
        color="primary"
        variant="contained"
        size="large"
        onClick={handleClick}
      >
        Host a voting event
      </Button>
    </CoverLayout>
  );
}
