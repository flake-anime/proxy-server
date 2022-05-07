get_dpage_link() {
	anime_id="$1"
	ep_no="$2"
	agent="$3"

	curl -A "$agent" -s "$base_url/videos/${anime_id}${ep_no}" | sed -nE 's_^[[:space:]]*<iframe src="([^"]*)".*_\1_p' |
		sed 's/^/https:/g'
}

agent="Mozilla/5.0 (X11; Linux x86_64; rv:99.0) Gecko/20100101 Firefox/99.0"
base_url="https://goload.pro"
anime_id="$1"
ep_no="$2"
dpage_link="$(get_dpage_link "$anime_id" "$ep_no" "$agent")"
echo "$dpage_link"