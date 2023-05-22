import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import { TextField, Button, List, ListItem, ListItemText } from "@mui/material";
import './style.css'
import getWeb3 from "../utils/getWeb3";


export default function Vote({ votingContract }) {
  const [electionState, setElectionState] = useState(0);
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [web3, setWeb3] = useState(null);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [contract, setContract] = useState(null);

  const [candidateName, setCandidateName] = useState("");
  const [candidatesList, setCandidatesList] = useState([]);

  const [open, setOpen] = useState(false);

  const handleCandidateNameChange = (event) => {
    setCandidateName(event.target.value);
  };

  const handleVoteCandidateClick = async () => {
    console.log(contract);
    if (contract) {
      await contract.methods.addCandidate(candidateName).send({ from: currentAccount });
      const candidates = await contract.methods.vote(candidateName).call();
      console.log(candidates, "candidates");
      setCandidatesList(candidates);
      setCandidateName("");
    }
  };


  useEffect(() => {
    initializeWeb3();
  }, []);

  const initializeWeb3 = async () => {
    console.log(votingContract, "votingContract");
    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      setWeb3(web3);
      setCurrentAccount(accounts[0]);

      const GoodVotingContract = new web3.eth.Contract(GoodVoting, votingContract);
      setContract(GoodVotingContract);
      console.log(GoodVotingContract, "GoodVotingContract");

      console.log(contract, "contract");
      const candidates = await GoodVotingContract.methods.getAllCandidatesInfo().call();
      console.log(candidates, "candidates");

      setCandidatesList(candidates);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box>
      <nav className="navbar navbar-default">
      <div className="container">
        <div className="navbar-header">
          <button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#myNavbar">
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>                        
          </button>
          <a className="navbar-brand" href="#">Election</a>
        </div>
      </div>
    </nav>

    <div className="container-fluid bg-1 text-center">
      <div className="list-group">
        {candidatesList.map((candidate, index) => (
          <ListItem key={index}>
            <ListItemText primary={candidate.name} />
          </ListItem>
        ))}
      </div>
    </div>



    <h3 className="margin">SELECT THE CANDIDATE YOU WANT TO VOTE</h3>
  
    <TextField label="Candidate Name" value={candidateName} onChange={handleVoteCandidateClick} />
      <br></br>
      <br></br>

      <Button variant="contained" color="primary" onClick={handleVoteCandidateClick}>
        Vote Candidate
      </Button>
    </Box>
  );
}
