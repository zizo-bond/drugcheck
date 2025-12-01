
import { InteractionData, InteractionType, InteractionSeverity } from '../types';

// Helper to capitalize words properly (English)
const titleCase = (str: string) => {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => {
      // Check if word starts with an English letter
      if (/^[a-zA-Z]/.test(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
      return word;
    })
    .join(' ')
    .trim();
};

const normalizeName = (name: string): string => {
  if (!name) return '';

  let clean = name;

  // 1. Remove Arabic characters (Unicode \u0600-\u06FF)
  clean = clean.replace(/[\u0600-\u06FF]+/g, '');

  // 2. Remove content in parentheses (e.g. Brand names or notes)
  clean = clean.replace(/\([^)]*\)/g, '');

  // 3. Remove text after " - " or " – " (often used for translations)
  clean = clean.split(/ [-–—] /)[0];
  clean = clean.split(' - ')[0];

  // 4. Clean up specific problematic characters
  clean = clean.replace(/\s*\/\s*/g, ' / '); // Standardize slashes
  clean = clean.replace(/[\[\]]/g, ''); // Remove brackets if any

  // 5. Remove trailing/leading special chars and spaces
  clean = clean.replace(/^[\s\-\/]+|[\s\-\/]+$/g, '');
  clean = clean.replace(/\s+/g, ' ').trim();

  return titleCase(clean);
};

export const processInteractions = (rawData: InteractionData[]): InteractionData[] => {
  const uniqueMap = new Map<string, InteractionData>();

  rawData.forEach((item) => {
    if (!item.drugA) return;

    // 1. Normalize Names
    const drugA = normalizeName(item.drugA);
    const drugB = item.drugB ? normalizeName(item.drugB) : undefined;
    const foodOrCondition = item.foodOrCondition ? normalizeName(item.foodOrCondition) : undefined;

    if (!drugA) return; // Skip if name became empty
    if (item.type === InteractionType.DRUG_DRUG && !drugB) return;
    if ((item.type === InteractionType.DRUG_FOOD || item.type === InteractionType.DRUG_DISEASE) && !foodOrCondition) return;

    // 2. Create a unique key for deduplication
    let key = '';
    if (item.type === InteractionType.DRUG_DRUG && drugB) {
      // Sort drugs alphabetically to catch "Aspirin + Warfarin" vs "Warfarin + Aspirin"
      const sortedDrugs = [drugA, drugB].sort();
      key = `${InteractionType.DRUG_DRUG}:${sortedDrugs[0]}:${sortedDrugs[1]}`;
    } else {
      const secondary = foodOrCondition || 'GENERAL';
      key = `${item.type}:${drugA}:${secondary}`;
    }

    // 3. Severity Weight for prioritization
    const severityWeight = {
      [InteractionSeverity.CONTRAINDICATED]: 4,
      [InteractionSeverity.HIGH]: 3,
      [InteractionSeverity.MODERATE]: 2,
      [InteractionSeverity.LOW]: 1,
      [InteractionSeverity.UNKNOWN]: 0,
    };

    const existing = uniqueMap.get(key);
    const currentWeight = severityWeight[item.severity] || 0;
    const existingWeight = existing ? (severityWeight[existing.severity] || 0) : -1;

    // Prioritize higher severity or longer description if severities are equal
    if (!existing || currentWeight > existingWeight) {
      uniqueMap.set(key, {
        ...item,
        drugA,
        drugB,
        foodOrCondition,
        mechanism: item.mechanism?.trim() || 'غير محدد',
        effect: item.effect?.trim() || 'غير محدد',
        management: item.management?.trim() || 'مراقبة المريض',
      });
    } else if (currentWeight === existingWeight) {
      const currentLength = (item.mechanism?.length || 0) + (item.effect?.length || 0);
      const existingLength = (existing.mechanism?.length || 0) + (existing.effect?.length || 0);

      if (currentLength > existingLength) {
        uniqueMap.set(key, {
          ...item,
          drugA,
          drugB,
          foodOrCondition,
        });
      }
    }
  });

  // 4. Convert map back to array and Sort Alphabetically
  const processedList = Array.from(uniqueMap.values()).sort((a, b) =>
    a.drugA.localeCompare(b.drugA, 'en')
  );

  // 5. Re-index IDs sequentially
  return processedList.map((item, index) => ({
    ...item,
    id: (index + 1).toString()
  }));
};

export const extractUniqueDrugs = (interactions: InteractionData[]): { id: string, name: string }[] => {
  const drugs = new Set<string>();
  interactions.forEach(i => {
    if (i.drugA) drugs.add(i.drugA);
    if (i.drugB) drugs.add(i.drugB);
  });

  return Array.from(drugs)
    .filter(name => name && name.length > 1)
    .sort((a, b) => a.localeCompare(b, 'en'))
    .map((name, index) => ({ id: `drug-${index}`, name }));
};
