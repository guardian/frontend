#!/bin/sh

# Always try to pull most recent image
docker push 642631414762.dkr.ecr.eu-west-1.amazonaws.com/frontend-dev:latest

# Run dev container
docker-compose run --rm --service-ports dev
