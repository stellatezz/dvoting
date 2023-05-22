import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Vote from "./Vote";
import { useLocation } from "react-router-dom";
import Admin from "./Admin";
import GoodVoting from "../contracts/GoodVoting.json";
import VotingEventManager from "../contracts/VotingEventManager.json"
import getWeb3 from "../utils/getWeb3";

export default function Home({ }) {
  const [role, setRole] = useState(1);
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState();
  const [votingContract, setVotingContract] = useState();
  const location = useLocation();

  const loadWeb3 = async () => {
    console.log(location, " useLocation Hook");
    console.log(location.state, " useLocation Hook");
    console.log(location.state.votingContract, " useLocation Hook");
    setVotingContract(location.state.votingContract);
    console.log(votingContract, " votingContract");

    try {
      const web3 = await getWeb3();
      const accounts = await web3.eth.getAccounts();
      const networkId = await web3.eth.net.getId();
      const instance = new web3.eth.Contract(GoodVoting.abi, votingContract);

      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const getRole = async () => {
    if (contract) {
      const isAdmin = await contract.methods.isAdmin(currentAccount).call();
      if (isAdmin) {
        setRole(1);
      }
      else {
        const isVoter = await contract.methods.isVoter(currentAccount).call();
        if (isVoter) setRole(2);
      }

      console.log("role:");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeb3();
  }, []);

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        color: "text.primary",
        height: "100vh",
      }}
    >
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "80vh",
          }}
        >
          Loading...
        </Box>
      ) : (
        <Box>
          {role === 1 && (
            <Admin
              votingContract={location.state.votingContract} 
            />
          )}

          {role === 2 && (
            <Vote
              votingContract={location.state.votingContract}
            />
          )}

          {role === 3 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "80vh",
              }}
            >
              Unauthorized User
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
