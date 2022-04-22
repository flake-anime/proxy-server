import express from "express"
import cors from "cors"
import got from "got"
import m3u8Parser from 'm3u8-parser'
import AnicliWrapper from "./engine/anicli_wrapper.mjs"
import { Transform } from 'stream'
import { fileURLToPath } from "url"
import path, { dirname } from 'path'

const PORT = process.env.PORT || 3000

const app = express()
const anicli = new AnicliWrapper()

app.use(cors())

app.get('/player', function(req, res) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    res.sendFile(path.join(__dirname, '/player.html'));
});

app.get('/get_streaming_source', async (req, res) => {
    const player_link = req.query.player_link
    const decrypted_link = await anicli.decrypt_link(player_link)

    let sources = []

    await Promise.all(decrypted_link.map(async link => {
        if (link.includes(".m3u8")) {
            const m3u8_file = await got(link)
            const parser = new m3u8Parser.Parser()
            parser.push(m3u8_file.body)
            parser.end()

            parser.manifest.playlists.forEach(async playlist => {
                const base_link = link.substring(0, link.lastIndexOf('/'));
                const playlist_uri = "/fetch_m3u8?url=" + base_link + "/" + playlist.uri
                
                const quality_extrator_regex = /.(\d+).m3u8/
                const quality = playlist.uri.match(quality_extrator_regex)[1]

                const source = {
                    url: playlist_uri,
                    type: 'application/x-mpegURL',
                    quality: quality
                }

                sources.push(source)
            })
        }

        if (link.includes(".mp4")) {
            const quality_extrator_regex = /.(\d+)p.mp4/
            const quality = link.match(quality_extrator_regex)[1]
            const streaming_url = '/stream?url=' + encodeURIComponent(link) + '&referer=' + encodeURIComponent(player_link)
            
            sources.push({
                src: streaming_url,
                type: 'video/mp4',
                size: quality
            })
        }
    }))
    
    res.send(sources)
})

app.get('/fetch_m3u8', async (req, res) => {
	const url = req.query.url
	const base_url = url.split('/').slice(0, -1).join('/')
	const parser = new Transform();

	res.setHeader('content-type', 'application/x-mpegURL');

	parser._transform = function(data, encoding, done) {
		const regex = /([a-z0-9./-]*.ts)/gm
		const m3u8_filtered = Buffer.from(
			data.toString()
			    .replace(regex, `/fetch_ts?url=${base_url}/$1`)
		)
		this.push(m3u8_filtered)
		done();
	};

	got.stream(url).pipe(parser).pipe(res);
})

app.get('/fetch_ts', async (req, res) => {
	const url = req.query.url
	res.setHeader('content-type', 'video/mp2t');
	console.log(url)
	got.stream(url).pipe(res)
})

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})