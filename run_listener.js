require('dotenv').config()

const { Listener } = require("bsv-spv");

const name = "run-listener";
const ticker = "BSV";
const blockHeight = -10; // Number. If negative then it's number from the tip.
const dataDir = __dirname;
const port = 8080; // Same as Masters port above
const listener = new Listener({ name, ticker, blockHeight, dataDir });

const { metadata } = require('run-sdk').util

const { connect } = require('amqplib')

var amqp;

async function startAmqp() {

	const connection = await connect(process.env.amqp_url)

	amqp = await connection.createChannel()

	await amqp.assertExchange('powco')

}

startAmqp()

const onBlock = ({
  header,
  started,
  finished,
  size,
  height,
  txCount,
  transactions,
  startDate,
}) => {
  for (const [index, tx, pos, len] of transactions) {

	  handleTransaction(tx)
  }
};


listener.on("mempool_tx", async ({ transaction, size }) => {

	handleTransaction(transaction)

})

async function handleTransaction(transaction) {

	try {

	    const hex = transaction.toHex()

	    const txid = transaction.getTxid()

	    const runMetadata = metadata(hex)
  
	    if (runMetadata) {
	  
	      console.log({ txid })
	      console.log(JSON.stringify(runMetadata))
	    
	    } 

	    amqp.publish('powco', 'run.transaction.discovered', Buffer.from(
		JSON.stringify({ txid, runMetadata })
	    ))

	} catch(error) {

	}
}

listener.on("block_reorg", ({ height, hash }) => {
  // Re-org after height
});
listener.on("block_saved", ({ height, hash }) => {
  listener.syncBlocks(onBlock);
});

listener.syncBlocks(onBlock);
listener.connect({ port });
