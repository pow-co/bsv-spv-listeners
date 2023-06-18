require('dotenv').config()

//@ts-ignore
import { Actor } from 'rabbi'

const exchange = 'powco'

const routingkey = 'chat.message'

import axios from 'axios'

export async function main() {

	try {

		const actor = Actor.create({
			exchange,
			routingkey,
			queue: 'repost_bitchats_to_rocketchat'
		})
		
		console.log(actor)

		actor.start(async (channel: any, msg: any, json: any) => {

			console.log(msg.content.toString())

			console.log(json)

			try {

				const result = await postToRocketchat({
					channel: json.bitchat_channel,
					message: json.content_text,
					author: json.bmap.MAP[0].paymail
				})

				console.log(result)

			} catch(error) {

				console.error(error)

			}

		})

	} catch(error) {

		console.error(error)

	}

}

interface BitchatMessage {
	channel: string;
	message: string;
	author: string;
}

async function postToRocketchat({ channel, message, author }: BitchatMessage) {

	if (channel === 'powco') {

		const { data } = await axios.post(String(process.env.bitchat_hook_powco), {
			text: `${author} in pow.co/chat/${channel} ${message}`
		})

		console.log(data)

	}

	const { data } = await axios.post(String(process.env.bitchat_hook_all), {
		text: `${author} in pow.co/chat/${channel} ${message}`
	})

	console.log(data)

	return data
}

main()

