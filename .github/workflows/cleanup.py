import os, json, datetime

def main():
    ## Delete GH Pages Trigger ##
    os.system('rm -rf _trigger')

    ## Delete Stale Previews ##
    #Loop through sites
    for site in os.listdir('./files'):
        path = f'./files/{site}'
        #Loop through files in site folder
        for file in os.listdir(path):
            #Find JSON files
            if file.endswith('.json'):
                #If found, check expire date
                filename = f'./files/{site}/{file}'
                with open(filename) as json_file:
                    data = json.load(json_file)
                    if data['expire_date']:
                        exp_date = datetime.datetime.strptime(data['expire_date'], "%d %b %Y %H:%M:%S GMT")#%Y-%m-%d %H:%M:%S.%f
                        if exp_date and exp_date < datetime.datetime.now():
                            #Delete if expired
                            os.system(f"rm -rf {filename}")
                            os.system(f"rm -rf {filename.replace('.json', '.js')}")
                    json_file.close()
        #Delete site folder if empty
        if len(os.listdir(path)) == 0:
            os.system(f"rm -rf {path}")
main()