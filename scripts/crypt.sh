#!/bin/bash -e -o pipefail

source ~/.bash_profile

#----------------- USAGE MESSAGES ---------------#
USAGE_MESSAGE_GENERAL="
DESCR: Helper script to encrypt/decrypt data/configs using my nodejs ./common/utils/crypt.js utility

USAGE:
     sh crypt.sh [--help] [OPTIONS] <COMMAND> [--help] [OPTIONS]

OPTIONS:
     [--help]
     --password

COMMANDS:
     help
     encrypt [--help] [OPTIONS]
     decrypt [--help] [OPTIONS]
"
USAGE_MESSAGE_ENCRYPT="
DESCR: Helper script to encrypt data/configs using my nodejs ./common/utils/crypt.js utility

USAGE: bash crypt.sh [OPTIONS] encrypt [OPTIONS]

OPTIONS:
     [--help]
     --text 'my-secret-text-no-spaces'
"
USAGE_MESSAGE_DECRYPT="
DESCR: Helper script to decrypt data/configs using my nodejs ./common/utils/crypt.js utility

USAGE: bash crypt.sh [OPTIONS] decrypt [OPTIONS]

OPTIONS:
     [--help]
     --text 'my-encrypted-text'
"

#----------------- CHECK GENERAL HELP ---------------#
if [ "$1" == "help" ] || [ "$1" == "" ]; then
     echo "$USAGE_MESSAGE_GENERAL"
     exit 0;
fi

#----------------- GET GENERAL OPTIONS ---------------#
while [[ $1 == --* ]]; do
     if [ "$1" == "--help" ]; then
          echo "$USAGE_MESSAGE_GENERAL"
          exit 0;
     elif [ "$1" == "--password" ]; then
          shift
          if [[ $1 == --* ]]; then echo "Missing value for option --password"; exit 1; fi
          PASSWORD=$1
          shift
      else
          echo "$1 is not a recognized option."
          exit 1;
     fi
done

#----------------- CHECK REQUIRED GENERAL OPTIONS -----------#
if [ -z $PASSWORD ]; then
     echo "Missing required general option --password"
     exit 1;
fi

#----------------- GET COMMANDS ----------------------------#
case $1 in
     encrypt)
          shift
          #----------------- CHECK COMMAND HELP -----------#
          if [ "$1" == "help" ]  || [ "$1" == "" ]; then
               echo "$USAGE_MESSAGE_ENCRYPT"
               exit 0;
          fi
					#----------------- GET COMMAND OPTIONS -----------#
          while [[ $1 == --* ]]; do
               if [ "$1" == "--help" ]; then
                    echo "$USAGE_MESSAGE_ENCRYPT"
                    exit 0;
               elif [ "$1" == "--text" ]; then
                    shift
                    if [[ $1 == --* ]]; then echo "Missing value for option --text"; exit 1; fi
                    TEXT=$1
                    shift
               else
                    echo "$1 is not a recognized option."
                    exit 1;
               fi
          done
					#----------------- CHECK REQUIRED COMMAND OPTIONS -----------#
          if [ -z $TEXT ]; then
               echo "Missing required general option --text"
               exit 1;
          fi
          ENCRYPTED_TEXT=$(node -p 'let c=require("./common/utils/crypto.js"); c.encrypt("'${PASSWORD}'","'${TEXT}'");')
          echo ${ENCRYPTED_TEXT}
          ;;
     decrypt)
          shift
          #----------------- CHECK COMMAND HELP -----------#
          if [ "$1" == "help" ]  || [ "$1" == "" ]; then
               echo "$USAGE_MESSAGE_DECRYPT"
               exit 0;
          fi
					#----------------- GET COMMAND OPTIONS -----------#
          while [[ $1 == --* ]]; do
               if [ "$1" == "--help" ]; then
                    echo "$USAGE_MESSAGE_DECRYPT"
                    exit 0;
               elif [ "$1" == "--text" ]; then
                    shift
                    if [[ $1 == --* ]]; then echo "Missing value for option --text"; exit 1; fi
                    ENCRYPTED_TEXT=$1
                    shift
               else
                    echo "$1 is not a recognized option."
                    exit 1;
               fi
          done
					#----------------- CHECK REQUIRED COMMAND OPTIONS -----------#
          if [ -z $ENCRYPTED_TEXT ]; then
               echo "Missing required general option --text"
               exit 1;
          fi
          TEXT=$(node -p 'let c=require("./common/utils/crypto.js"); c.decrypt("'${PASSWORD}'","'${ENCRYPTED_TEXT}'");')
          echo ${TEXT}
          ;;
     *)
          echo "$1 - COMMAND NOT RECOGNIZED."
          echo "$USAGE_MESSAGE_GENERAL"
          exit 1;
          ;;
esac