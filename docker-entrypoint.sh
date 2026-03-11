#!/bin/sh
set -e

# Recreate config file
rm -rf /usr/share/nginx/html/env-config.js
touch /usr/share/nginx/html/env-config.js

# Add assignment 
echo "window._env_ = {" >> /usr/share/nginx/html/env-config.js
# Read each line in .env file
# Each line represents key=value pairs
while read -r line || [[ -n "$line" ]];
do
  # Split env variables by character `=`
  if printf '%s\n' "$line" | grep -q -e '='; then
    varname=$(printf '%s\n' "$line" | sed -e 's/=.*//')
    varvalue=$(printf '%s\n' "$line" | sed -e 's/^[^=]*=//' | sed 's/\r//')
  fi

  # Read value of current variable if exists as Environment variable
  eval "value=\$$varname"
  # Otherwise use value from .env file
  [[ -z $value ]] && value=${varvalue}

  echo "  $varname: \"$value\"," >> /usr/share/nginx/html/env-config.js
done < /usr/share/nginx/html/.env

echo "}" >> /usr/share/nginx/html/env-config.js
nginx -g "daemon off;"
