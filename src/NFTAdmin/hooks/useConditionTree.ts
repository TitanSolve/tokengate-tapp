// /NFTAdmin/hooks/useConditionTree.ts

import { useState, useCallback } from 'react';
import { ConditionTree, LockCondition, LockGroup, TraitCondition } from '../types';

export const useConditionTree = (initialTree: ConditionTree) => {
  const [tree, setTree] = useState<ConditionTree>(initialTree);

  const updateNodeInTree = useCallback((id: string, updatedNode: ConditionTree): ConditionTree => {
    if (tree.id === id) {
      return updatedNode;
    }

    if (tree.type === 'group') {
      const group = tree as LockGroup;
      const updatedChildren = group.children.map(child => {
        if (child.id === id) {
          return updatedNode;
        }
        if (child.type === 'group') {
          return updateNodeInTree(id, child);
        }
        return child;
      });

      return {
        ...group,
        children: updatedChildren,
      };
    }

    return tree;
  }, [tree]);

  const updateNode = useCallback((id: string, updates: Partial<LockCondition | LockGroup | TraitCondition>) => {
    const updateNode = (node: ConditionTree): ConditionTree => {
      if (node.id === id) {
        if (node.type === 'group') {
          return { ...(node as LockGroup), ...(updates as Partial<LockGroup>) };
        } else if (node.type === 'lock') {
          return { ...(node as LockCondition), ...(updates as Partial<LockCondition>) };
        } else {
          return { ...(node as TraitCondition), ...(updates as Partial<TraitCondition>) };
        }
      }

      if (node.type === 'group') {
        const group = node as LockGroup;
        return {
          ...group,
          children: group.children.map(child => updateNode(child)),
        };
      }

      return node;
    };

    setTree(updateNode(tree));
  }, [tree]);

  const removeNode = useCallback((id: string) => {
    const removeFromTree = (node: ConditionTree): ConditionTree | null => {
      if (node.id === id) {
        return null;
      }

      if (node.type === 'group') {
        const group = node as LockGroup;
        const filteredChildren = group.children
          .map(child => removeFromTree(child))
          .filter(Boolean) as ConditionTree[];

        return {
          ...group,
          children: filteredChildren,
        };
      }

      return node;
    };

    const updated = removeFromTree(tree);
    if (updated) {
      setTree(updated);
    }
  }, [tree]);

  const toggleOperator = useCallback((id: string) => {
    const toggle = (node: ConditionTree): ConditionTree => {
      if (node.id === id && node.type === 'group') {
        const group = node as LockGroup;
        return {
          ...group,
          operator: group.operator === 'AND' ? 'OR' : 'AND',
        };
      }

      if (node.type === 'group') {
        const group = node as LockGroup;
        return {
          ...group,
          children: group.children.map(child => toggle(child)),
        };
      }

      return node;
    };

    setTree(toggle(tree));
  }, [tree]);

  return {
    tree,
    setTree,
    updateNode,
    removeNode,
    toggleOperator,
  };
};
