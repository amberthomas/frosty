#!/bin/bash


read -p "Have you already created the image? " img_bool
if [[ $img_bool =~ [Nn]$ ]]
then
read -p "What do you want to name the image? " name
docker build -t $name ${0%/*}

else
read -p "What is the image name? " name
fi

cd ${0%/*}
cd ..
dir=$(pwd)

echo "To run notebook just use http://localhost:8888/?token=<token>"
echo
docker run -ti -p 8888:8888 -v $dir:/home/jovyan/work/ $name:latest bash


