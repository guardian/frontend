#!/bin/sh

# Always try to pull most recent image
ecrLogin=$(aws ecr get-login --profile frontend) 
if [ $? -eq 255  ] 
then
    echo "Please use Janus to get credentials"
    exit 1;
fi
$ecrLogin
docker pull 642631414762.dkr.ecr.eu-west-1.amazonaws.com/frontend-dev:latest

# Run dev container
docker-compose run --rm --service-ports dev
