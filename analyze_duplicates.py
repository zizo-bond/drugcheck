import re
import json
from collections import Counter

def analyze_database():
    with open('c:/Users/CW/Desktop/drugcheck/data/database.ts', 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to find add() calls
    # add('DrugA', 'DrugB', Type, Severity, 'MechAr', 'MechEn', 'EffAr', 'EffEn', 'ManAr', 'ManEn');
    # We are looking for cases where MechAr == MechEn OR EffAr == EffEn OR ManAr == ManEn
    
    # This regex is a bit complex because of multi-line and potential variations.
    # We'll try to capture the arguments.
    
    pattern = re.compile(r"add\s*\(\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*[^,]+,\s*[^,]+,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*\)", re.DOTALL)
    
    matches = pattern.findall(content)
    
    print(f"Found {len(matches)} interactions.")
    
    mechanisms = Counter()
    effects = Counter()
    managements = Counter()
    
    for m in matches:
        drugA, drugB, mechAr, mechEn, effAr, effEn, manAr, manEn = m
        
        # Check if English equals Arabic (indicating it needs translation)
        # We strip whitespace to be sure
        if mechAr.strip() == mechEn.strip() and mechAr.strip():
            mechanisms[mechAr.strip()] += 1
            
        if effAr.strip() == effEn.strip() and effAr.strip():
            effects[effAr.strip()] += 1
            
        if manAr.strip() == manEn.strip() and manAr.strip():
            managements[manAr.strip()] += 1

    report = {
        "mechanisms": dict(mechanisms.most_common()),
        "effects": dict(effects.most_common()),
        "managements": dict(managements.most_common())
    }
    
    with open('c:/Users/CW/Desktop/drugcheck/analysis_report.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
        
    print("Analysis complete. Report saved to analysis_report.json")

if __name__ == "__main__":
    analyze_database()
