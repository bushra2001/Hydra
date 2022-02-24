# HYDRA:
Hydra is a very basic personalized P2P (Peer to Peer) blockchain network.

## How to Use:
```
git clone https://github.com/bushra2001/Hydra.git
npm install crypto discovery-swarm dat-swarm-defaults get-port
--save
```
To run the code from the clone library on GitHub, navigate to the code, follow
these Terminal commands to install the libraries, and run a node.js instance
attaching our p2p.js code:
```
cd [location]/Hydra
npm install
node p2p.js
```
## Tools:
It is implemented using;
- Nodejs
- Visual Studio Code

## Functionalities:
This network is capable of doing following:

- Send and receive messages and include blocks in these messages.
- Register and unregister miners using PoS consensus mechanism.
- Create new blocks and sent them between the peers.
- Store blocks using name-value LevelDB database. 
![](blob:https://web.whatsapp.com/d7635149-c5b0-400e-96d8-b03eac091957)
## Communication:
In this project, I have also created a wallet, that consists of private-public key pairs.
Hydra communicate via API services and the CLI.
