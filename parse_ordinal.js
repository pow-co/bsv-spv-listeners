
const { Transaction } = require('bitcoinjs-lib')

const rawtx = '02000000000101ba1e1c3597014e14c7d188d75c1515d22e0edc84e8bdf6c7794b871c5439c8f90000000000fdffffff022202000000000000225120097f759e691cb0acf7e4c22ea2f970f469d3be770b31fef31ed8b441d8a18add2b09000000000000160014903dc088b2aabd1d929ea90845d8824dc6e267fb03402e3785bf0e6766ea11ef375bf2f37e7fba98f3f6a668241375c6866f0f223d5da07bfe7ad84f0723f036fa219b57fae6803510701f86cf32c709f3b5212c65528820117f692257b2331233b5705ce9c682be8719ff1b2b64cbca290bd6faeb54423eac06ca40c00b8901750063036f7264010118746578742f706c61696e3b636861727365743d7574662d38003a7b2270223a226272632d3230222c226f70223a227472616e73666572222c227469636b223a2278696e67222c22616d74223a223130303030227d6821c0117f692257b2331233b5705ce9c682be8719ff1b2b64cbca290bd6faeb54423e00000000'

module.exports.parseWitnessFromRawTx = function(rawtx) {

  var tx = Transaction.fromHex(rawtx);

  var witnessInput;

  for (let input of tx.ins) {

    console.log(input)

    if (!input.witness || input.witness.length == 0) { return }

    console.log(input)

    const witness = input.witness.reduce((result, witness) => {
      return `${result}${witness.toString('hex')}`
    }, "")

    console.log(witness)

  }

}

