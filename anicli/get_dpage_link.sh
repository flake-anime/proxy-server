get_dpage_link() {
	anime_id="$1"
	ep_no="$2"

	curl -s "$base_url/videos/${anime_id}${ep_no}" | sed -nE 's_^[[:space:]]*<iframe src="([^"]*)".*_\1_p' |
		sed 's/^/https:/g'
}

base_url="https://goload.pro"
anime_id="$1"
ep_no="$2"
dpage_link="$(get_dpage_link "$anime_id" "$ep_no")"
echo "$dpage_link"