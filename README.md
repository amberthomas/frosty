# Frosty
## Getting Started
To make starting up as easy as possible, I wrote a Dockerfile in the setup directory. First install Docker (https://www.docker.com/get-started), then call start.sh, which is found in frosty/setup. It will generate the Docker image (be warned, this will take a while) and open the latest image. The image has the google-earth-api, GDAL, jupyter, and other data science/ML packages installed. The start script will also mount your frosty directory from your local machine in the 'work' folder of the image.

You will still need to call `earthengine authenticate` once in docker bash.
If this is your first time using the Google Earth API, you may need to request access to google earth on your Google account before that. Once it's installed you can deploy the python package with `import ee` and then call `ee.Initialize()` at the start of the script.
