decrypt_link() {
	ajax_url="$base_url/encrypt-ajax.php"
	id=$(printf "%s" "$1" | sed -nE 's/.*id=(.*)&title.*/\1/p')
	resp=$(curl -s "$1")
	secret_key=$(printf "%s" "$resp" | sed -nE 's/.*class="container-(.*)">/\1/p' | tr -d "\n" | od -A n -t x1 | tr -d " |\n")
	iv=$(printf "%s" "$resp" | sed -nE 's/.*class="wrapper container-(.*)">/\1/p' | tr -d "\n" | od -A n -t x1 | tr -d " |\n")
	second_key=$(printf "%s" "$resp" | sed -nE 's/.*class=".*videocontent-(.*)">/\1/p' | tr -d "\n" | od -A n -t x1 | tr -d " |\n")
	token=$(printf "%s" "$resp" | sed -nE 's/.*data-value="(.*)">.*/\1/p' | base64 -d | openssl enc -d -aes256 -K "$secret_key" -iv "$iv" | sed -nE 's/.*&(token.*)/\1/p')
	ajax=$(printf '%s' "$id" | openssl enc -e -aes256 -K "$secret_key" -iv "$iv" | base64)
	data=$(curl -s -H "X-Requested-With:XMLHttpRequest" "${ajax_url}?id=${ajax}&alias=${id}&${token}" | sed -e 's/{"data":"//' -e 's/"}/\n/' -e 's/\\//g')
	printf '%s' "$data" | base64 -d | openssl enc -d -aes256 -K "$second_key" -iv "$iv" | sed -e 's/\].*/\]/' -e 's/\\//g' |
		grep -Eo 'https:\/\/[-a-zA-Z0-9@:%._\+~#=][a-zA-Z0-9][-a-zA-Z0-9@:%_\+.~#?&\/\/=]*'
}

base_url="https://goload.pro"
dpage_link="$1"
decrypt_link "$dpage_link"