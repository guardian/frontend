#How to build a docker image for the dev environment

Prerequisites: 
- AWS CLI installed
- Valid AWS Credentials (See Janus to obtain new ones)


1. Retrieve the docker login command that you can use to authenticate your Docker client to your registry:
    - `aws ecr get-login --region eu-west-1 --profile frontend`

2. Run the docker login command that was returned in the previous step.

3. Build your Docker image using the following command.
    - `docker build -t frontend-dev -f Dockerfile-dev .`

4. Flatten image to reduce its size. (This will get rid of image layers)
    - `ID=$(docker run -d frontend-dev /bin/bash)`
    - `docker export $ID | docker import - frontend-dev:latest`

5. After the build completes, tag your image so you can push the image to this repository:
    - `docker tag frontend-dev:latest 642631414762.dkr.ecr.eu-west-1.amazonaws.com/frontend-dev:latest`

6. Run the following command to push this image to your newly created AWS repository:
    - `docker push 642631414762.dkr.ecr.eu-west-1.amazonaws.com/frontend-dev:latest`
