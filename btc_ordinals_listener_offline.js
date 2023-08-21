require('dotenv').config()

const { Listener } = require("bsv-spv");

const { exec, spawn } = require('child_process')

const { parseWitnessFromRawTx } = require("./parse_ordinal")

const ParseOrdinal = require("./parse_ordinal")

console.log(ParseOrdinal)

const name = "run-listener-offline";
const ticker = "BTC";
const blockHeight = -6 * 24 * 8;
const dataDir = __dirname;
const port = 8081; // Same as Masters port above
const listener = new Listener({ name, ticker, blockHeight, dataDir });

var queueDepth = 0

const {S3} = require('@aws-sdk/client-s3');

const s3 = new S3({region: 'us-east-1'});

const bucket = 's3://pow.co/ordinals/btc/'

const queue = require('fastq')(handleTxid, 20)

async function handleTxid(txid, cb) {

  console.log({ txid, queueDepth })

  const parser = spawn(`docker`, ['run', '--rm', 'proofofwork/ordinals-playground', 'python3', 'inscription-parser.py', txid, '-du'])

  parser.stdout.on('data', (data) => {

    console.log(data.toString())

     var params = {
      Body: data,
      Bucket: 'pow.co',
      Key: `ordinals/btc/${txid}`, 
      ACL:'public-read'
     };
     s3.putObject(params, function(err, data) {
       if (err) console.log(err, err.stack); // an error occurred
       else     console.log(data);           // successful response

	   	 amqp.publish('powco', 'btc.ordinal.discovered', Buffer.from(
		     JSON.stringify({ txid })
	     ))
       /*
       data = {
        ETag: "\"6805f2cfc46c0f04559748bb039d69ae\"", 
        VersionId: "pSKidl4pHBiNwukdbcPXAIs.sshFFOc0"
       }
       */
     });
  })

  parser.stderr.on('data', (data) => {
    console.error(`stderr: ${ data }`)
  })

  parser.on('close', () => {
    cb();
    queueDepth -= 1;
  })

  /*exec(command, async (error, stdout, sterr) => {

    if (error) { console.error(error); return }

    console.log('stdout', stdout)
    console.log('stderr', stderr)

	   	 //amqp.publish('powco', 'btc.ordinal.discovered', Buffer.from(
		  //   JSON.stringify({ txid })
	    	 //))

  })
  */

}

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

      const witness = parseWitnessFromRawTx(hex)

      if (witness) { console.log({ witness, txid }) }

	    const txid = transaction.getTxid()

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
