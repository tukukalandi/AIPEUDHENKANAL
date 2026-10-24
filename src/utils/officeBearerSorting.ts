import { OfficeBearer } from '../types';

export type WingCategory = 'group-c' | 'postman-mts' | 'gds' | 'other';

export interface WingGroupInfo {
  id: WingCategory;
  name: string;
  badge: string;
  shortTitle: string;
  gradient: string;
  borderColor: string;
  description: string;
}

export const WING_DEFINITIONS: Record<WingCategory, WingGroupInfo> = {
  'group-c': {
    id: 'group-c',
    name: "AIPEU Group 'C' - Dhenkanal Division",
    badge: "1. GROUP 'C' WING",
    shortTitle: "Group 'C'",
    gradient: 'from-blue-600 via-indigo-600 to-sky-600',
    borderColor: 'border-blue-500/40',
    description: 'Executive leadership representing Postal Assistants, Sorting Assistants & PA cadres',
  },
  'postman-mts': {
    id: 'postman-mts',
    name: "AIPEU Postmen, MTS & Group 'D' - Dhenkanal Division",
    badge: "2. POSTMAN & MTS WING",
    shortTitle: 'Postman & MTS',
    gradient: 'from-purple-600 via-violet-600 to-indigo-700',
    borderColor: 'border-purple-500/40',
    description: 'Executive leadership representing Postmen, Mail Guards, MTS & Group D staff',
  },
  gds: {
    id: 'gds',
    name: 'All India Gramin Dak Sevaks Union (AIGDSU) - Dhenkanal Division',
    badge: '3. GDS (AIGDSU) WING',
    shortTitle: 'GDS (AIGDSU)',
    gradient: 'from-amber-600 via-orange-600 to-red-600',
    borderColor: 'border-orange-500/40',
    description: 'Executive leadership representing BPMs, ABPMs, Dak Sevaks & GDS staff',
  },
  other: {
    id: 'other',
    name: 'Sub-Committees & Circle Representatives',
    badge: '4. SUB-COMMITTEES & CIRCLE',
    shortTitle: 'Other Wings',
    gradient: 'from-pink-600 via-rose-600 to-teal-700',
    borderColor: 'border-pink-500/40',
    description: 'Women Sub-Committee, Pensioners Association & Circle-level representatives',
  },
};

/**
 * Identifies the cadre wing/branch category for an office bearer.
 * Priority: Group C -> Postman/MTS -> GDS -> Other
 */
export function getWingCategory(bearer: OfficeBearer): WingCategory {
  const branch = (bearer.branch || '').toLowerCase();
  const desig = (bearer.designation || '').toLowerCase();

  // 1. Group 'C'
  if (
    branch.includes("group 'c'") ||
    branch.includes('group-c') ||
    branch.includes('group c') ||
    (branch.includes('aipeu') && branch.includes('c,') && !branch.includes('postm'))
  ) {
    return 'group-c';
  }

  // 2. Postman & MTS (and Group D)
  if (
    branch.includes('postm') ||
    branch.includes('mts') ||
    branch.includes("group 'd'") ||
    branch.includes('group-d') ||
    branch.includes('group d') ||
    desig.includes('postman') ||
    desig.includes('mts')
  ) {
    return 'postman-mts';
  }

  // 3. GDS (AIGDSU)
  if (
    branch.includes('gds') ||
    branch.includes('aigdsu') ||
    branch.includes('gramin') ||
    desig.includes('gds') ||
    desig.includes('bpm') ||
    desig.includes('abpm')
  ) {
    return 'gds';
  }

  return 'other';
}

/**
 * Returns wing rank number according to user specification:
 * 1. First Group C
 * 2. Then Postman & MTS
 * 3. Then GDS
 * 4. Other sub-committees
 */
export function getWingRank(bearer: OfficeBearer): number {
  const cat = getWingCategory(bearer);
  switch (cat) {
    case 'group-c':
      return 1;
    case 'postman-mts':
      return 2;
    case 'gds':
      return 3;
    case 'other':
    default:
      return 4;
  }
}

/**
 * Returns role rank within each wing according to user specification:
 * 1. Divisional Secretary first
 * 2. Then Divisional President
 * 3. Then Other Members (Financial Secretary, Assistant Secretary, Convener, Executive members)
 */
export function getRoleRank(bearer: OfficeBearer): number {
  const desig = (bearer.designation || '').toLowerCase().trim();
  const roleType = bearer.roleType;

  const isAssistant =
    desig.includes('assistant') || desig.includes('asst') || desig.includes('sahayak');
  const isEx =
    desig.includes('ex-') ||
    desig.includes('former') ||
    desig.includes('past') ||
    desig.includes('retired');

  // 1. Divisional Secretary first
  const isSecretary =
    desig.includes('divisional secretary') ||
    (desig.includes('secretary') &&
      !desig.includes('financial') &&
      !desig.includes('finance') &&
      !desig.includes('treasurer')) ||
    roleType === 'secretary';

  if (!isAssistant && !isEx && isSecretary) {
    return 1;
  }

  // 2. Divisional President second
  const isPresident = desig.includes('president') || roleType === 'president';
  if (!isEx && isPresident) {
    return 2;
  }

  // 3. Financial Secretary / Treasurer
  if (
    desig.includes('financial secretary') ||
    desig.includes('treasurer') ||
    roleType === 'treasurer'
  ) {
    return 3;
  }

  // 4. Assistant Divisional Secretary / Vice President / Convener
  if (isAssistant || desig.includes('vice president') || desig.includes('convener')) {
    return 4;
  }

  // 5. Other Executive & Council Members
  return 5;
}

/**
 * Master sort function that orders Office Bearers strictly according to union protocol:
 * 1. Wing Hierarchy: Group C -> Postman & MTS -> GDS -> Other Wings
 * 2. Role Hierarchy within Wing: Divisional Secretary -> Divisional President -> Other Members
 * 3. Secondary stable order: Comrade Name
 */
export function sortOfficeBearers(bearers: OfficeBearer[]): OfficeBearer[] {
  return [...bearers].sort((a, b) => {
    // 1. Wing Rank
    const wingDiff = getWingRank(a) - getWingRank(b);
    if (wingDiff !== 0) return wingDiff;

    // 2. Role Rank (Divisional Secretary -> Divisional President -> Others)
    const roleDiff = getRoleRank(a) - getRoleRank(b);
    if (roleDiff !== 0) return roleDiff;

    // 3. Alphabetical Comrade Name
    return (a.name || '').localeCompare(b.name || '');
  });
}

/**
 * Groups office bearers into an ordered dictionary matching the user's hierarchy:
 * Group C -> Postman & MTS -> GDS -> Other Wings
 */
export function groupOfficeBearersByWing(bearers: OfficeBearer[]): Array<{
  category: WingCategory;
  info: WingGroupInfo;
  members: OfficeBearer[];
}> {
  const sorted = sortOfficeBearers(bearers);
  const groups: Record<WingCategory, OfficeBearer[]> = {
    'group-c': [],
    'postman-mts': [],
    gds: [],
    other: [],
  };

  sorted.forEach((bearer) => {
    const cat = getWingCategory(bearer);
    groups[cat].push(bearer);
  });

  const categories: WingCategory[] = ['group-c', 'postman-mts', 'gds', 'other'];

  return categories
    .map((cat) => ({
      category: cat,
      info: WING_DEFINITIONS[cat],
      members: groups[cat],
    }))
    .filter((g) => g.members.length > 0);
}
