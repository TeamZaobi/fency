import json
import os
from datetime import datetime

def merge_metadata():
    print("🔄 Starting metadata merge...")
    
    # Paths
    local_path = 'metadata.json'
    remote_path = 'aliyun_snapshot/metadata.json'
    
    if not os.path.exists(local_path) or not os.path.exists(remote_path):
        print("❌ Error: One of the metadata files is missing.")
        return

    try:
        with open(local_path, 'r', encoding='utf-8') as f:
            local_data = json.load(f)
        
        with open(remote_path, 'r', encoding='utf-8') as f:
            remote_data = json.load(f)
            
        print(f"📄 Local entries: {len(local_data.get('pages', []))}")
        print(f"📄 Remote entries: {len(remote_data.get('pages', []))}")
        
        # Dictionary to hold merged pages, keyed by ID for deduplication
        merged_pages_map = {}
        
        # 1. Add Remote entries first (base)
        for page in remote_data.get('pages', []):
            pid = page.get('id')
            if pid:
                merged_pages_map[pid] = page
                
        # 2. Overwrite/Add Local entries (priority)
        for page in local_data.get('pages', []):
            pid = page.get('id')
            if pid:
                merged_pages_map[pid] = page
                
        # Convert back to list
        merged_pages = list(merged_pages_map.values())
        
        # Sort by publish-date descending (newest first)
        def get_date(p):
            return p.get('publish-date', '1970-01-01')
            
        merged_pages.sort(key=get_date, reverse=True)
        
        # Update the data object
        local_data['pages'] = merged_pages
        local_data['lastUpdated'] = datetime.now().isoformat()
        
        print(f"✅ Merged entries: {len(merged_pages)}")
        
        # Write back to local metadata.json
        with open(local_path, 'w', encoding='utf-8') as f:
            json.dump(local_data, f, ensure_ascii=False, indent=2)
            
        print("💾 Successfully saved merged metadata.json")
        
    except Exception as e:
        print(f"❌ Error merging metadata: {e}")

if __name__ == "__main__":
    merge_metadata()
