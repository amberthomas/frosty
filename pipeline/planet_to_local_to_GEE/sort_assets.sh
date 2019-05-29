#/bin/sh
if [[ -d "$1" ]]; then
  path="$1"
  last_char="${path: -1}"
  if [[ "$last_char" != '/' ]]; then
    path="$1/"
  fi

  echo "Searching $path for data to sort"
  exts=$(find $path -type f | sed -rn 's|.*/[^/]+\.([^/.]+)$|\1|p' | sort -u)
  for e in $exts; do
      mkdir "$path$e"
      echo "$path$e"
      for file in "$path"*.$e; do
          echo "$file"
          mv "$file" "$path$e"
      done
  done
  echo "Found and sorted: "
  echo "$exts"
else
   echo "The given path does not appear to be a valid directory."
fi
