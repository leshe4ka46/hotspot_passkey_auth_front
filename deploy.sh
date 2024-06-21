#!/bin/bash

apt update
apt install ssh
echo "${{secrets.SSH_KEY}}" > /key.key
chmod 600 /key.key
scp -P ${{secrets.SSH_PORT}} -i /key.key -r ./build/* ${{secrets.SSH_USER}}@${{secrets.SSH_HOST}}:${{secrets.SSH_DIR}}
rm -rf /key.key