FROM gitpod/workspace-full:latest

USER root
RUN apt-get update && apt-get install -y && apt-get clean && rm -rf /var/cache/apt/* && rm -rf /var/lib/apt/lists/* && rm -rf /tmp/* && nvm i 12 && nvm alias default 12 && nvm use 12 && npm i yarn gulp eslint -g && yarn && yarn upgrade && yarn watch
# Install custom tools, runtime, etc. using apt-get
# For example, the command below would install "bastet" - a command line tetris clone:
#
# RUN apt-get update \
#    && apt-get install -y bastet \
#    && apt-get clean && rm -rf /var/cache/apt/* && rm -rf /var/lib/apt/lists/* && rm -rf /tmp/*
#
# More information: https://www.gitpod.io/docs/42_config_docker/
