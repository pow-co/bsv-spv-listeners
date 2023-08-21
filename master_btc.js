const { Master, Worker } = require("bsv-spv");
const cluster = require("cluster");

const port = 8081; // Server that new blocks nad mempool txs are announced on

const config = {
  ticker: "BTC", // BTC, BCH, XEC, BSV
  nodes: [
      '148.251.40.218:8333',
      '82.197.206.139:8333',
      '5.39.79.142:8333'
  ], // Set to your favorite node IP addresses. Will ask for other peers after connected
  // enableIpv6: true, // Connect to ipv6 nodes
  //forceUserAgent: `Bitcoin`, // Disconnects with nodes that do not string match with user agent
  user_agent: 'Satoshi:24.0.1',
  invalidBlocks: [], // Set if you want to force a specific fork (see examples below)
  dataDir: __dirname, // Directory to store files
  pruneBlocks: 0, // Number of newest blocks you want saved to local disk. 0 to keeping all blocks back to genesis.
  blockHeight: -6 * 24 * 180, // Sync to block height. 0 to sync to genesis. Negative to sync to X blocks from current heightafter 2 hours
  mempool: 1, // Number of mempool tx threads
  blocks: 1, // Number of bitcoin block threads
};

if (cluster.isWorker) {
  const worker = new Worker();
} else if (cluster.isPrimary) {
  const master = new Master(config);
  master.startServer({ port });
}
