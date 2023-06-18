const { Listener } = require("bsv-spv");

const axios = require('axios')

const name = "boostpow-listener-best";
const ticker = "BSV";
const blockHeight = -6 * 24 * 7; // Number. If negative then it's number from the tip.
const dataDir = __dirname;
const port = 8080; // Same as Masters port above
const listener = new Listener({ name, ticker, blockHeight, dataDir });

const {BoostPowJob, BoostPowJobProof} = require('boostpow')

async function handleTransaction(tx) {

   let hex = tx.toHex()

   const job = BoostPowJob.fromRawTransaction(hex)

   if (job) {

	   console.log('boostpow.job.discovered', job)

	   const { data } = await axios.get(`https://pow.co/api/v1/boost/jobs/${job.txid}`)
	   //
	   console.log(data)
   }

   const proof = BoostPowJobProof.fromRawTransaction(hex)
   if (proof) {

	   console.log('boostpow.proof.discovered', proof)

	   const { data } = await axios.post(`https://pow.co/api/v1/boost/proofs/${proof.txid}`)
	   //
	   console.log(data)

   }

}

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


listener.on("mempool_tx", ({ transaction, size }) => {

    handleTransaction(transaction)

   /*let hex = transaction.toHex()

   const job = BoostPowJob.fromRawTransaction(hex)
   if (job) {

	   console.log('boostpow.job.discovered', job)
   }

   const proof = BoostPowJobProof.fromRawTransaction(hex)
   if (proof) {

	   console.log('boostpow.proof.discovered', proof)
   }
   */

});
listener.on("block_reorg", ({ height, hash }) => {
  // Re-org after height
});
listener.on("block_saved", ({ height, hash }) => {
  listener.syncBlocks(onBlock);
});

listener.syncBlocks(onBlock);
listener.connect({ port });
