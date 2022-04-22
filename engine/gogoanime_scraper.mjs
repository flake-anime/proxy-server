import axios from "axios";
import cheerio from "cheerio";

class GoGoAnimeScraper {
    constructor(base_url) {
        this.base_url = base_url;
    }
    async search_anime(anime_name) {
        const search_result = await axios.get(this.base_url + "/search.html?keyword=" + anime_name);
        const $ = cheerio.load(search_result.data);
        const results = [];
        $("ul.items").find("li").each((i, elem) => {
            const anime_name = $(elem).find("a").text().trim();
            const anime_url = $(elem).find("a").attr("href");
            const anime_id = anime_url.split("/")[2];
            const anime_image = $(elem).find("img").attr("src");
            const result = {
                anime_name: anime_name,
                anime_url: anime_url,
                anime_id: anime_id,
                anime_image: anime_image
            }
            results.push(result);
        })
        return results;
    }
    async get_anime_detail(anime_id) {
        const anime_page = await axios.get(this.base_url + "/category/" + anime_id);
        const $ = cheerio.load(anime_page.data);
        const anime_name = $(".anime_info_body_bg h1").text().trim();
        const anime_type = $(".anime_info_body_bg p.type a").first().text();
        const plot_summary = $(".anime_info_body_bg p.type").eq(1).text().replace("Plot Summary:", "").trim(); 
        const genre = $(".anime_info_body_bg p.type").eq(2).text().replace("Genre:", "").trim().split(", ");
        const release_date = $(".anime_info_body_bg p.type").eq(3).text().replace("Released: ", "").trim();
        const status = $(".anime_info_body_bg p.type").eq(4).text().replace("Status: ", "").trim();
        const other_name = $(".anime_info_body_bg p.type").eq(5).text().replace("Other name: ", "").trim();
        
        const result = {
            anime_name: anime_name,
            anime_type: anime_type,
            plot_summary: plot_summary,
            genre: genre,
            release_date: release_date,
            status: status,
            other_name: other_name
        }

        return result;
    }
}

export default GoGoAnimeScraper;

