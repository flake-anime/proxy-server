search_eps () {
	# get available episodes for anime_id
	anime_id="$1"
	curl -s "$base_url/category/$anime_id" |
	sed -n -E '
		/^[[:space:]]*<a href="#" class="active" ep_start/{
		s/.* '\''([0-9]*)'\'' ep_end = '\''([0-9]*)'\''.*/\2/p
		q
		}
		'
}

# gogoanime likes to change domains but keep the olds as redirects
base_url=$(curl -s -L -o /dev/null -w "%{url_effective}\n" https://gogoanime.cm)
anime_id="$1"
search_eps "$anime_id"