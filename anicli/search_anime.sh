search_anime () {
	# get anime name along with its id for search term
	search=$(printf '%s' "$1" | tr ' ' '-' )
	curl -s "$base_url//search.html" -G -d "keyword=$search" |
		sed -n -E 's_^[[:space:]]*<a href="/category/([^"]*)" title="([^"]*)".*_\1_p'
}

base_url=$(curl -s -L -o /dev/null -w "%{url_effective}\n" https://gogoanime.cm)
search_anime "$1"