import express from "express"
import cors from "cors"
import got from "got"
import m3u8Parser from 'm3u8-parser'
import AnicliWrapper from "./engine/anicli_wrapper.mjs"
import { Transform } from 'stream'
import { fileURLToPath } from "url"
import path, { dirname } from 'path'
import fetch from "node-fetch"

const PORT = process.env.PORT || 4000

const app = express()
const anicli = new AnicliWrapper()

function validURL(str) {
    var pattern = /https?:\\?/i; // fragment locator
    return !!pattern.test(str);
  }

app.use(cors())

app.get('/player', function(req, res) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    res.sendFile(path.join(__dirname, '/player.html'));
});

app.get('/get_streaming_source', async (req, res) => {
    const player_link = req.query.player_link
    
    if (player_link === undefined) {
        return res.status(400).send('player_link is required')
    }

    if (!validURL(player_link)) {
        return res.status(400).send('player_link is invalid')
    }

    const decrypted_link = await anicli.decrypt_link(player_link)
    console.log(decrypted_link)

    let sources = []

    await Promise.all(decrypted_link.map(async link => {
        if (link.includes(".m3u8")) {
            sources.push({
                url: "/fetch_master_m3u8?url=" + encodeURIComponent(link),
                type: 'application/x-mpegURL',
                quality: 'original'
            })
        }

        if (link.includes(".mp4")) {
            const quality_extrator_regex = /.(\d+)p.mp4/
            const quality = link.match(quality_extrator_regex)[1]
            const streaming_url = '/stream?url=' + encodeURIComponent(link) + '&referer=' + encodeURIComponent(player_link)
            
            sources.push({
                url: streaming_url,
                type: 'video/mp4',
                size: quality
            })
        }
    }))
    
    console.log(sources)

    res.send(sources)
})

app.get('/fetch_master_m3u8', async (req, res) => {
    const url = req.query.url
    const base_url = url.split('/').slice(0, -1).join('/')
    const m3u8_file = await fetch(url).then(res => res.text())

    const regex = /(^.*\b\.m3u8\b.*)/gm
    const is_valid_url = m3u8_file.match(regex).some(validURL)
    const m3u8_file_filtered = m3u8_file.replace(regex, is_valid_url ? `fetch_m3u8?url=$1` : `/fetch_m3u8?url=${base_url}/$1`); 
    
    res.setHeader('content-type', 'application/x-mpegURL');
    res.send(m3u8_file_filtered);
})

app.get('/fetch_m3u8', async (req, res) => {
	const url = req.query.url
	const base_url = url.split('/').slice(0, -1).join('/')
    
    const m3u8_file = await fetch(url).then(res => res.text())
    const regex = /(^.*\b\.ts\b.*)/gm
    const is_valid_url = m3u8_file.match(regex).some(validURL)
    const m3u8_file_filtered = m3u8_file.replace(regex, is_valid_url ? `fetch_ts?url=$1` : `/fetch_ts?url=${base_url}/$1`); 
    
	res.setHeader('content-type', 'application/x-mpegURL');
    res.send(m3u8_file_filtered);
})

app.get('/fetch_ts', async (req, res) => {
	const url = req.query.url
	res.setHeader('content-type', 'video/mp2t');
	console.log(url)
	got.stream(url).pipe(res)
})

app.get("/stream", (req, res) => {
    const url = req.query.url
    const referer = req.query.referer
    res.setHeader('Content-Type', 'video/mp4');
    got.stream(url, { headers: { "referer": referer }}).pipe(res);
})

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
})