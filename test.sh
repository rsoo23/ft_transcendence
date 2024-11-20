#!/bin/bash

stty icrnl
trap "trap - SIGTERM && trap - SIGINT && kill -- -$$" SIGINT SIGTERM EXIT
escape_char=$(printf "\u1b")
username=""
password=""
refresh_token=""
access_token=""
website_url="http://localhost:8000"

function post_request {
  curl --request POST \
  -s \
  -b "refresh_token=${refresh_token}" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer ${access_token}" \
  --data "${2}" \
  -i "${website_url}${1}"
}

read -p "Website URL (leave blank for debug localhost): " newurl
if [ "${newurl}" != "" ]; then
  website_url="${newurl}"
fi
read -p "Username: " username
read -p "Password: " -s password
echo

echo "Logging in, please wait..."
response="$(\
  post_request \
    "/api/token/" \
    "{\"username\": \"${username}\", \"password\": \"${password}\"}" \
)"

if [ "$(grep -e 'access' <<< "${response}")" == "" ]; then
  echo "Invalid credentials."
  exit
fi

refresh_token="$(grep -e 'refresh_token=' <<< "${response}" | sed 's/.*refresh_token=//; s/;.*//')"
access_token="$(grep -e '"access":' <<< "${response}" | sed 's/.*"access":"//; s/"\}.*//')"
match_id=""
# echo ">>>REFRESH<<<"
# echo $refresh_token
# echo ">>>ACCESS<<<"
# echo $access_token

function ping_match {
  while [ 1 ]; do
    if [ "${match_id}" != "" ]; then
      content="$(post_request "/api/pong/ping_match/${match_id}/")"
      if [ "$(grep -e '"success": true' <<< "${content}")" == "" ]; then
        break
      fi
    fi
    sleep 5
  done
}

echo ">>> ACCESS GRANTED <<<"
while [ 1 ]; do
  args=''
  read -e -p '> ' args
  if [ "${args}" == "" ]; then
    continue
  fi

  history -s "${args}"
  command="$(awk '{print $1}' <<< "${args}")"
  arg1="$(awk '{print $2}' <<< "${args}")"
  arg2="$(awk '{print $3}' <<< "${args}")"

  if [ "${command}" == "help" ]; then
    echo "=== Command List ==="
    echo "join <match_id>"
    echo "input"
    echo "exit"
  elif [ "${command}" == "join" ]; then
    if [ "${arg1}" == "" ]; then
      echo "Usage: join <match_id>"
      continue
    fi

    echo "Attempting to join match..."
    join_match_data=$(post_request "/api/pong/join_match/${arg1}/")
    if [ "$(grep -e '"success": true' <<< "${join_match_data}")" == "" ]; then
      echo "Failed to join match..."
      continue
    fi

    if [ "${match_id}" != "" ]; then
      kill %%
    fi

    echo "Successfully joined match!"
    match_id=${arg1}
    ping_match &
  elif [ "${command}" == "input" ]; then
    echo "Reading inputs.... (press 'q' to quit)"
    up=0
    down=0
    while [ 1 ]; do
      code=''
      read -rsn 1 code
      if [ "${code}" == $escape_char ]; then
        read -rsn 2 code
      fi
      input=''
      value="true"
      case $code in
        '[A') input='up' ; if [ $up == "1" ]; then value="false"; up=0; else up=1; fi ;;
        '[B') input='down' ; if [ $down == "1" ]; then value="false"; down=0; else down=1; fi ;;
        '[D') input='left' ;;
        '[C') input='right' ;;
      esac

      if [ "${code}" == "q" ]; then
        echo "Leaving input mode..."
        break
      fi

      if [ $down == 1 ] && [ $up == 1 ]; then
        post_request "/api/pong/set_player_input/${match_id}/" "{\"input\": \"up\", \"value\": false}" > /dev/null
        post_request "/api/pong/set_player_input/${match_id}/" "{\"input\": \"down\", \"value\": false}" > /dev/null
        down=0
        up=0
      else
        post_request "/api/pong/set_player_input/${match_id}/" "{\"input\": \"${input}\", \"value\": ${value}}" > /dev/null
      fi
    done
  elif [ "${command}" == "exit" ]; then
    break
  else
    echo "No such command. (type 'help' for a list of commands)"
  fi
done

echo "Goodbye!"
