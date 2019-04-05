# should setup a docker image that will let you run GEE and GDAL in an
# isolated env, remember to mount the repo
# base image should take care of all datascience packages needed

FROM jupyter/tensorflow-notebook 
LABEL maintainer="Jupyter Project <jupyter@googlegroups.com>"

USER root


RUN apt-get update
RUN apt-get upgrade -y

# Add unstable repo to allow us to access latest GDAL builds
RUN apt-get install software-properties-common -y
RUN add-apt-repository ppa:ubuntugis/ubuntugis-unstable
RUN apt-get update

# Install GDAL dependencies
RUN apt-get install libgdal-dev -y

# Update C env vars so compiler can find gdal
ENV CPLUS_INCLUDE_PATH=/usr/include/gdal
ENV C_INCLUDE_PATH=/usr/include/gdal

# This will install latest version of GDAL
RUN pip install GDAL>=2.2.4


# install google-earth-python-api on 3.7 env
RUN pip install google-api-python-client
RUN pip install --upgrade oauth2client
RUN pip install earthengine-api

# Code Editor
RUN apt-get install vim -y

RUN echo 'Image complete, remember to authenticate GEE before running'


USER $NB_UID

