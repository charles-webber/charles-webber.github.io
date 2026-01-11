import os
import re
import requests
import json
import urllib.parse

POSTS_DIR = r"S:\Blog\source\_posts"
PICGO_URL = "http://127.0.0.1:36677/upload"

def upload_to_picgo(file_path):
    # Normalize path: unquote and check existence
    unquoted = urllib.parse.unquote(file_path)
    if os.path.exists(unquoted):
        file_path = unquoted
    elif not os.path.exists(file_path):
        print(f"File strictly not found: {file_path}")
        return None
    
    try:
        # Standardize to backslashes for Windows
        abs_path = os.path.abspath(file_path)
        payload = {"list": [abs_path]}
        response = requests.post(PICGO_URL, data=json.dumps(payload), timeout=30)
        if response.status_code == 200:
            res_data = response.json()
            if res_data.get("success"):
                return res_data.get("result")[0]
            else:
                print(f"PicGo upload failed for {abs_path}: {res_data}")
        else:
            print(f"PicGo server error: {response.status_code}")
    except Exception as e:
        print(f"Error uploading {file_path}: {e}")
    return None

def process_file(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    pattern = r"!\[(.*?)\]\(([C-Z]:[/\\][^\)]+)\)"
    matches = re.findall(pattern, content)
    
    if not matches:
        return

    print(f"--- Processing {os.path.basename(file_path)} ---")
    
    new_content = content
    changes = 0
    for alt, local_path in matches:
        web_url = upload_to_picgo(local_path)
        
        if web_url:
            print(f"Migrated: {os.path.basename(local_path)} -> {web_url}")
            new_content = new_content.replace(f"({local_path})", f"({web_url})")
            changes += 1
    
    if changes > 0:
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"Successfully updated {changes} images in {os.path.basename(file_path)}")

def main():
    if not os.path.exists(POSTS_DIR):
        print(f"Posts directory not found: {POSTS_DIR}")
        return
        
    for filename in os.listdir(POSTS_DIR):
        if filename.endswith(".md"):
            process_file(os.path.join(POSTS_DIR, filename))

if __name__ == "__main__":
    main()
