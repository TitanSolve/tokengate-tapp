// NFTAdmin/types.ts
export type ConditionTree = LockCondition | LockGroup | TraitCondition;

export interface LockCondition {
  type: 'lock';
  id: string;
  issuer: string;
  taxon: string;
  nftCount: number;
  nftImageUrl: string | null;
}

export interface LockGroup {
  type: 'group';
  id: string;
  operator: 'AND' | 'OR';
  children: ConditionTree[];
}

export interface TraitCondition {
  type: 'trait';
  id: string;
  issuer: string;
  taxon: string;
  nftImageUrl: string | null;
  traits: Record<string, string>;
}

export interface RoomSettings {
  tree: ConditionTree;
  kickMessage: string;
}