import express from "express"
import cors from "cors"
import got from "got"
import AnicliWrapper from "./engine/anicli_wrapper.mjs"
import path, { dirname } from 'path'
import { fileURLToPath } from "url"
import GoGoAnimeScraper from "./engine/gogoanime_scraper.mjs"
import stream from 'stream'
import m3u8Parser from 'm3u8-parser'

const port = process.env.PORT || 3000
const app = express()
app.use(cors())

const base_url = "https://gogoanime.fi"
// const anicli = new AnicliWrapper()
// const crawler = new GoGoAnimeScraper(base_url)
const Transform = stream.Transform;

app.get('/player', function(req, res) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    res.sendFile(path.join(__dirname, '/player.html'));
});

app.get('/get_streaming_sources', async (req, res) => {
    const anime_id = req.query.anime_id
    const eps_number = req.query.eps_number || 1

    if(anime_id == undefined) {
        res.send("Error: anime_id is undefined")
        return
    }

    const dpage_url = await anicli.get_dpage_link(anime_id, eps_number)
    const links = await anicli.decrypt_link(dpage_url)

    let sources = []

    await Promise.all(links.map(async link => {
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
            const streaming_url = '/stream?url=' + encodeURIComponent(link) + '&referer=' + encodeURIComponent(dpage_url)
            
            sources.push({
                src: streaming_url,
                type: 'video/mp4',
                size: quality
            })
        }
    }))
    
    res.send(sources)
})

app.get("/stream", (req, res) => {
    const url = req.query.url
    const referer = req.query.referer
    res.setHeader('Content-Type', 'video/mp4');
    got.stream(url, { headers: { "referer": referer }}).pipe(res);
})

app.get("/search", async (req, res) => {
    const anime_name = req.query.anime_name
    if (anime_name == undefined) {
        res.send("Error: anime_name is undefined")
        return
    }
    const results = await crawler.search_anime(anime_name)
    res.send(results)
})

app.get("/anime_detail", async (req, res) => {
    const anime_id = req.query.anime_id
    if (anime_id == undefined) {
        res.send("Error: anime_id is undefined")
        return
    }

    const total_episodes = await anicli.total_episodes(anime_id)
    let anime_detail = await crawler.get_anime_detail(anime_id)
    anime_detail = {
        ...anime_detail,
        total_episodes : total_episodes
    }

    res.send(anime_detail)
})

app.get('/fetch_ts', async (req, res) => {
	const url = req.query.url
	res.setHeader('content-type', 'video/mp2t');
	console.log(url)
	got.stream(url).pipe(res)
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

// app.get("/fetch_master_m3u8", async (req, res) => {
    
// })

app.listen(port, () => {
    console.log(`Proxy server running on port ${port}`)
})