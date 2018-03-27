#!/bin/bash

# Vars
folder="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
badger=$folder/bin/analyzeBadger.js
phantom=$folder/bin/analyzePhantom.js
group=$folder/bin/analyzeGroup.js
campaigns="brasil chile colombia paraguay"

# Env Vars
export TZ=UTC
export config=config/analyzerDevelopment.json
export DEBUG=* 

# Commands
TZ=UTC DEBUG=* bin/queueMany.js 
TZ=UTC amount=6 concurrency=3 npm run badger
TZ=UTC amount=6 concurrency=3 npm run phantom

for i in $campaigns; do
  echo -e "Running badger for $i"
  echo -e "---------------------"
  sleep 1
  $badger --campaign gob.$i

  echo -e "Running phantom for $i"
  echo -e "----------------------"
  sleep 1
  $phantom --campaign gob.$i

  echo -e "Running group for $i"
  echo -e "--------------------"
  sleep 1
  $group --campaign gob.$i
done
