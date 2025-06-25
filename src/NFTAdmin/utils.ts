/// NFTAdmin/utils.ts

import CryptoJS from 'crypto-js';
import { ConditionTree, LockCondition, LockGroup, TraitCondition } from './types';

export const encryptData = (data: string, secretKey: string) => {
  return CryptoJS.AES.encrypt(data, secretKey).toString();
};

export const trimRoomId = (roomId: string): string => {
  let trimmed = roomId;
  if (trimmed.startsWith('!')) {
    trimmed = trimmed.substring(1);
  }
  const suffix = ':synapse.textrp.io';
  const encodedSuffix = '%3Asynapse.textrp.io';
  if (trimmed.endsWith(suffix)) {
    trimmed = trimmed.substring(0, trimmed.length - suffix.length);
  } else if (trimmed.endsWith(encodedSuffix)) {
    trimmed = trimmed.substring(0, trimmed.length - encodedSuffix.length);
  }
  return trimmed;
};

export const describeConditionTree = (tree: ConditionTree, depth: number = 0): string => {
  const shortenAddress = (address: string) =>
    address.length > 9 ? `${address.slice(0, 6)}...${address.slice(-3)}` : address;

  if (tree.type === 'lock') {
    const { issuer, taxon, nftCount } = tree as LockCondition;
    if (!issuer || !taxon) return 'an incomplete NFT requirement';
    return `<b>${nftCount || 1}</b> NFT${nftCount !== 1 ? 's' : ''} from ${shortenAddress(issuer)} (taxon ${taxon})`;
  }

  if (tree.type === 'trait') {
    const { issuer, taxon, traits } = tree as TraitCondition;
    if (!issuer || !taxon) return 'an incomplete trait-based NFT requirement';
    const traitList = Object.entries(traits)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    return `NFT from ${shortenAddress(issuer)} (taxon ${taxon}) with traits: ${traitList || 'none specified'}`;
  }

  const { operator, children } = tree as LockGroup;
  if (!children || children.length === 0) return 'nothing set yet';

  const childDescriptions = children.map(child => describeConditionTree(child, depth + 1));
  const joiner = operator === 'AND' ? 'and' : 'or';
  const items = children.length > 2
    ? `${childDescriptions.slice(0, -1).join(', ')}, ${joiner} ${childDescriptions.slice(-1)}`
    : childDescriptions.join(` ${joiner} `);

  if (depth === 0) {
    if (operator === 'AND') {
      return children.length === 2
        ? `To access this chat, users must hold both ${items}`
        : `To access this chat, users must hold all of the following: ${items}`;
    } else {
      return `To access this chat, users can hold any of the following: ${items}`;
    }
  } else {
    return `(${items})`;
  }
};

export const hasInvalidNftCount = (tree: ConditionTree): boolean => {
  if (tree.type === 'lock') {
    const condition = tree as LockCondition;
    return condition.nftCount < 1 || condition.nftCount === undefined || condition.nftCount === null;
  }
  if (tree.type === 'group') {
    const group = tree as LockGroup;
    return group.children.some(child => hasInvalidNftCount(child));
  }
  return false;
};
