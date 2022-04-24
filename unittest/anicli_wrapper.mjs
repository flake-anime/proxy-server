import { assert } from "chai"
import { describe } from "mocha";
import AnicliWrapper from "../engine/anicli_wrapper.mjs"

describe("anicli_wrapper.get_dpage_link()", function() {
    it("it should return the download page of the anime", async function() {
        const anicli_wrapper = new AnicliWrapper()
        const dpage_link = await anicli_wrapper.get_dpage_link("death-note", "1")
        assert.equal(dpage_link, "https://gogoplay5.com/streaming.php?id=MTA2MjQ=&title=Death+Note+Episode+1");
    });
})

describe("anicli_wrapper.decrypt_link()", function() {
    it("it should decrypt the download links present in the download page", async function() {
        const anicli_wrapper = new AnicliWrapper()
        const dpage_link = "https://gogoplay5.com/streaming.php?id=MTA2MjQ=&title=Death+Note+Episode+1"
        const decrypted_link = await anicli_wrapper.decrypt_link(dpage_link)
        assert.isAbove(decrypted_link.length, 0);
    })
})

describe("anicli_wrapper.total_episodes()", function() {
    it("it should return the total number of episodes of the anime", async function() {
        const anicli_wrapper = new AnicliWrapper()
        const total_episodes = await anicli_wrapper.total_episodes("death-note")
        assert.equal(total_episodes, "37");
    })
})

describe("anicli_wrapper.search_anime()", function() {
    it("it should return the search result of the anime", async function() {
        const anicli_wrapper = new AnicliWrapper()
        const search_result = await anicli_wrapper.search_anime("death-note")
        assert.isAbove(search_result.length, 0);
    })
})