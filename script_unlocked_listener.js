require('dotenv').config()

const { Listener } = require("bsv-spv");

const { getChannel } = require('rabbi')

const name = "powco-unlocks";
const ticker = "BSV";
const blockHeight = -10; // Number. If negative then it's number from the tip.
const dataDir = __dirname;
const port = 8080; // Same as Masters port above
const listener = new Listener({ name, ticker, blockHeight, dataDir });

async function publish(exchange, routingkey, json) {

  const channel = await getChannel()

  channel.publish(exchange, routingkey, Buffer.from(JSON.stringify(json)))

}

const onBlock = async ({
  header,
  started,
  finished,
  size,
  height,
  txCount,
  transactions,
  startDate,
}) => {
  for (const [index, transaction, pos, len] of transactions) {

    for (let input of transaction.inputs) {

      const outpoint = `${input.prevTxId.toString('hex')}_${input.vout}`

      const inpoint = `${transaction.getTxid()}_${input.vin}`

      const unlock = {
        lock: outpoint,
        unlock: inpoint
      }

      await publish('powco', 'tx.unlock', unlock)

      await publish('powco', `tx.unlock.${outpoint}`, unlock)

    }

  }
};

listener.on("mempool_tx", async ({ transaction, size }) => {

    for (let input of tx.inputs) {

      const outpoint = `${input.prevTxId.toString('hex')}_${input.vout}`

      const inpoint = `${transaction.getTxid()}_${input.vin}`

      const unlock = {
        lock: outpoint,
        unlock: inpoint
      }

      await publish('powco', 'tx.unlock', unlock)

      await publish('powco', `tx.unlock.${outpoint}`, unlock)



    }

});
listener.on("block_reorg", ({ height, hash }) => {
  // Re-org after height
});
listener.on("block_saved", ({ height, hash }) => {
  listener.syncBlocks(onBlock);
});

listener.syncBlocks(onBlock);
listener.connect({ port });
