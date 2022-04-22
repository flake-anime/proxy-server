import { promisify } from "util";
import { exec as exec_raw } from "child_process";
const exec = promisify(exec_raw);

class AnicliWrapper {
    async decrypt_link(dpage_url) {
        let links
        links = await exec("sh anicli/decrypt_link.sh \"" + dpage_url + "\"");
        links = links.stdout.split("\n");
        links.pop()

        let filtered_link = []
        links.forEach(link => {
            filtered_link.push(link.replace("\n", ""))
        })

        return filtered_link;
    }
    async total_episodes(anime_id) {
        let total_episodes
        total_episodes = await exec("sh anicli/total_episodes.sh " + anime_id);
        total_episodes = total_episodes.stdout.replace("\n", "");
        return total_episodes;
    }
    async get_dpage_link(anime_id, episode_number) {
        let dpage_link
        dpage_link = await exec("sh anicli/get_dpage_link.sh " + anime_id + " " + episode_number);
        dpage_link = dpage_link.stdout.replace("\n", "");
        return dpage_link;
    } 
    async search_anime(anime_name) {
        let search_result
        search_result = await exec("sh anicli/search_anime.sh \"" + anime_name + "\"");
        search_result = search_result.stdout.split("\n");
        search_result.pop()

        let filtered_result = []
        search_result.forEach(result => {
            filtered_result.push(result.replace("\n", ""))
        })
        
        return search_result;
    }
}

export default AnicliWrapper;