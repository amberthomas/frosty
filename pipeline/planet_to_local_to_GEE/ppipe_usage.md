# Using ppipe for batch Planet Downloads & GEE uploads
There is a tool called `ppipe` that can be used for batch downloads and uploads to google earthengine. It is still under activate development at this time and I ran into several issues running it. Still, even with those problems, the utility of what it has to offer can't be ignored. So here is my quick guide to using it. For more information about set up and requirements I would look to the git page as your primary source (https://github.com/samapriya/Planet-GEE-Pipeline-CLI) and this medium article (*Updated Data Pipelines*) as a secondary (https://medium.com/@samapriyaroy/updates-data-pipelines-pip-install-ppipe-55981a65b1db). For reference, I ran this using Python 3.6 and Ubuntu 18.04

Installation is relatively painless with `pip install ppipe`.

After you install, you need to log into GEE and Planet.

#### Hiccup 1

The article and git page recommends `ppipe planetkey --type “quiet" --key "you api key"`. This did not work for me, but it might for you so give it a try. Here are my setup steps. They assume that you have already installed the necessary packages for GEE and Planet API. If you have not, his first article's setup section is good for it. I included those intructions below, but here is the article for reference, remember **SKIP all steps pertaining to ppipe Installation and just use pip** (https://medium.com/planet-stories/planet-people-and-pixels-a-data-pipeline-to-link-planet-api-to-google-earth-engine-1166606445a8).

Install Planet & GDAL:
```
pip install planet
sudo add-apt-repository ppa:ubuntugis/ppa && sudo apt-get update
sudo apt-get install gdal-bin

```
Install GEE:
```
pip install google-api-python-client
pip install --upgrade oauth2client
pip install earthengine-api
```
To get started you now need to authenticate. To connect to planet just do `ppipe planetkey` and enter you email and password for you planet account. Next call `earthengine authenticate` to connect to GEE. To verify this is done correctly, make sure you get a response from `ppipe quota` and `ppipe pquota`.


Now I recommend looking at the *Updated Data Pipelines* for reference on making a saved search on the Planet Explorer, but here is an example call.
```
ppipe savedsearch --name "alaska_test1_region/test_area_2018_summer" --asset "analytic_xml,analytic" --local "/home/alt3/Documents/frosty_data/test2" --limit 10
```
If you don't encounter errors, I wrote a little shell script to sort your assets in your local folder into separate folders. This will be necessary for later functions. The call is `./sort_assets.sh <path to local folder>` or using the example above `./sort_assets.sh /home/alt3/Documents/frosty_data/test2`.

#### Hiccup 2
This was a dumb problem and completely on me. For the input assets `--asset "analytic_xml,analytic"` there can be **NO SPACES** in between the elements of the list. At this point any white space breaks it.

#### Hiccup 3
After the selupload update, there are some steps not covered in the medium article. First you need to call the function `ppipe update` to get the required packages. At the time of writing this, I got this error on Ubuntu:

```
Traceback (most recent call last):
  File "sel-latest-linux.py", line 34, in <module>
    geckodown(directory=directory)
  File "sel-latest-linux.py", line 15, in geckodown
    container="https://github.com/mozilla/geckodriver/releases/download/"+vr+"/"+str(article.text)
NameError: name 'article' is not defined
Updated selenium driver for Linux64
```

I actually needed to go into `/python3.6/site-packages/ppipe/sel-latest-linux.py` and change things like so:

```
def geckodown(directory):
    source=requests.get("https://github.com/mozilla/geckodriver/releases/latest").text
    soup=BeautifulSoup(source.encode("utf-8"),'lxml')
    vr=str(soup.title.text.encode("utf-8")).split(' ')[1]
    #CHANGE HERE !!!!!!!!!
    amber_patch_article = "geckodriver-"+vr+'-'+comb
    #container="https://github.com/mozilla/geckodriver/releases/download/"+vr+"/geckodriver-"+vr+'-'+comb
    container="https://github.com/mozilla/geckodriver/releases/download/"+vr+"/" + amber_patch_article
    #CHANGE HERE !!!!!!!!!
    #container="https://github.com/mozilla/geckodriver/releases/download/"+vr+"/"+str(article.text)
    print("Downloading from: "+str(container))
    try:
        url = container
        dest = directory
        obj = SmartDL(url, dest)
        obj.start()
        path=obj.get_dest()
        #CHANGE HERE !!!!!!!!!
        filepath=os.path.join(directory,amber_patch_article)
```
At this point  `ppipe update` should work correctly.

Next you need to parse the metadata.
```
ppipe metadata --asset 'PSO' --mf '/home/alt3/Documents/frosty_data/test2/xml' --mfile '/home/alt3/Documents/frosty_data/test2/test_upload.csv'
```
Please note that you **must** define the full path for --mfile at the time of writing this.

#### Hiccup 4
Unfortunately I got the error below and just had to go into  `site-packages/ppipe/cli_metadata.py` and change all the `with open(mfile,'wb') as csvfile:` to `with open(mfile,'w') as csvfile:`, but maybe I just needed to update a package or something.

```
Traceback (most recent call last):
  File "/home/alt3/anaconda3/envs/frosty3/bin/ppipe", line 10, in <module>
    sys.exit(main())
  File "/home/alt3/anaconda3/envs/frosty3/lib/python3.6/site-packages/ppipe/ppipe.py", line 279, in main
    args.func(args)
  File "/home/alt3/anaconda3/envs/frosty3/lib/python3.6/site-packages/ppipe/ppipe.py", line 100, in metadata_from_parser
    metadata(asset=args.asset,mf=args.mf,mfile=args.mfile,errorlog=args.errorlog,directory=args.dir)
  File "/home/alt3/anaconda3/envs/frosty3/lib/python3.6/site-packages/ppipe/cli_metadata.py", line 41, in metadata
    writer.writeheader()
  File "/home/alt3/anaconda3/envs/frosty3/lib/python3.6/csv.py", line 144, in writeheader
    self.writerow(header)
  File "/home/alt3/anaconda3/envs/frosty3/lib/python3.6/csv.py", line 155, in writerow
    return self.writer.writerow(self._dict_to_list(rowdict))
TypeError: a bytes-like object is required, not 'str'
```

Next we upload to GEE. Please note. I have used selenium in other apps before. It is SLOW. If you are worried something is hanging, it might honestly be that. So give it a few minutes before you despair.

```
ppipe selupload --source "/home/alt3/Documents/frosty_data/test2/tif" --dest "users/amberthomas/test_upload" --manifest "PSO" --user "amber3thomas@gmail.com" --metadata "/home/alt3/Documents/frosty_data/test2/test_upload.csv"
```
#### Hiccup 5
You might get a long list of `No metadata exists for image <image name>`.

This is a sign that the metadata has some sort of suffix that needs to be clipped. I solved by going into `cli_metadata.py` and finding the function that would be reading in my metadata and removing the metadata suffix. Example below for code near line 88. The line will be different depending on the asset type.

```python
id_no = filename.split('.')[0].replace('_metadata', '')
   writer.writerow([id_no,epoch,productType,orbit,provider,instrument,satellite_id,tile_id,bands,epsg_code,resampling_kernel....
```
