import re

# Read the file
with open(r'c:\Users\CW\Desktop\drugcheck\44.txt', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract each interaction object
pattern = r'\{\s*id:\s*[\'"](\d+)[\'"]\s*,\s*drugA:\s*[\'"]([^\'"]+)[\'"]\s*,\s*(?:drugB:\s*[\'"]([^\'"]+)[\'"]\s*,\s*)?(?:foodOrCondition:\s*[\'"]([^\'"]+)[\'"]\s*,\s*)?type:\s*InteractionType\.(\w+)\s*,\s*severity:\s*InteractionSeverity\.(\w+)\s*,\s*mechanism:\s*[\'"]([^\'"]+)[\'"]\s*,\s*effect:\s*[\'"]([^\'"]+)[\'"]\s*,\s*management:\s*[\'"]([^\'"]+)[\'"]\s*\}'

interactions = re.findall(pattern, content, re.DOTALL)

print(f'Found {len(interactions)} interactions')

# Convert to new format
output_lines = []
output_lines.append("// =============================================================================")
output_lines.append("// ============ IMPORTED FROM 44.txt (Arabic only - temporary) ================")
output_lines.append("// =============================================================================")
output_lines.append("")

for idx, match in enumerate(interactions, 1):
    int_id, drugA, drugB, foodOrCond, int_type, severity, mech, eff, man = match
    
    # Escape single quotes
    drugA = drugA.replace("'", "\\'")
    if drugB:
        drugB = drugB.replace("'", "\\'")
    if foodOrCond:
        foodOrCond = foodOrCond.replace("'", "\\'")
    mech = mech.replace("'", "\\'")
    eff = eff.replace("'", "\\'")
    man = man.replace("'", "\\'")
    
    # Determine drug2
    drug2 = drugB if drugB else foodOrCond
    
    if drug2:
        call = f"""add('{drugA}', '{drug2}', InteractionType.{int_type}, InteractionSeverity.{severity},
  '{mech}',
  '{mech}',
  '{eff}',
  '{eff}',
  '{man}',
  '{man}'
);"""
        output_lines.append(call)
        output_lines.append("")
    
    if idx % 100 == 0:
        print(f'Processed {idx}/{len(interactions)}...')

# Write output
with open(r'c:\Users\CW\Desktop\drugcheck\converted_interactions.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(output_lines))

print(f'Successfully converted {len(interactions)} interactions!')
print('Output saved to: converted_interactions.txt')
