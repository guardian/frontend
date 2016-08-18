#!/bin/sh

function showHelp {
    echo ""
    echo "Usage: ./dev.sh [OPTIONS]"
    echo ""
    echo "Run the Guardian frontend dev environment in a Docker container"
    echo ""
    echo "Options:"
    echo "  -h, --help      Print usage"
    echo "  -w, --watch     Run container and then 'make watch'"
    echo "  -p, --port      Specify port mapping. Can be used multiple times. Format: 'host:container'. Ex: '-p 80:9000'".
    echo "  -n, --nopull    Do not try to pull newest Docker image. Use in offline mode for example."
    echo ""
}

function pullLatestImage {
    ecrLoginCmd=$(aws ecr get-login --profile frontend) 
    if [ $? -eq 255  ] 
    then
        echo "Please use Janus to get credentials"
        exit 1;
    fi
    $ecrLoginCmd
    docker pull 642631414762.dkr.ecr.eu-west-1.amazonaws.com/frontend-dev:latest
}

#Script starts here

#Defaults
shouldPullLatestImage=1
serviceToRun="dev"
ports=""

# Handle arguments
while [[ $# -gt 0 ]]
do
key="$1"
case $key in
    -h|--help)
    showHelp
    exit 0
    ;;
    -w|--watch)
    serviceToRun="watch"
    ;;
    -n|--nopull)
    shouldPullLatestImage=0
    ;;
    -p|--port)
    ports="$ports -p $2"
    shift
    ;;
    *)
    # unknown option
    ;;
esac
shift # past argument or value
done

#Pull most recent image
if [ $shouldPullLatestImage -eq 1 ]
then
    pullLatestImage
fi

# Run dev container
if [ -z "$ports" ] #Ports option is empty
then
    ports="--service-ports" #Publish all service's port as defined in docker-compose file
fi

docker-compose run --rm $ports $serviceToRun
