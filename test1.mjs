import AnicliWrapper from "./engine/anicli_wrapper.mjs"

async function main() {
    const anicli_wrapper = new AnicliWrapper()
    const dpage_link = "https://goload.pro/streaming.php?id=MTA3NjI4&title=%22Eiyuu%22+Kaitai&typesub=SUB&sub=&cover=Y292ZXIvZWl5dXUta2FpdGFpLnBuZw=="
    // const dpage_link = "https://goload.pro/streaming.php?id=MTA3NjI4&title=%22Eiyuu%22+Kaitai&typesub=SUB&sub=&cover=Y292ZXIvZWl5dXUta2FpdGFpLnBuZw=="
    const decrypted_link = await anicli_wrapper.decrypt_link(dpage_link)
    console.log(decrypted_link)
}

main()