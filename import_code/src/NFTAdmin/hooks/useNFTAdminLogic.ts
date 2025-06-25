// /NFTAdmin/hooks/useNFTAdminLogic.ts

import { useState, useEffect, useCallback } from 'react';
import { useWidgetApi } from '@matrix-widget-toolkit/react';
import { ConditionTree, LockCondition, LockGroup, TraitCondition, RoomSettings } from '../types';
import { encryptData, trimRoomId } from '../utils';

export const useNFTAdminLogic = () => {
  const widgetApi = useWidgetApi();
  const apiUrl = 'https://15c32806-20be-45c8-b3ea-1f0a3e72dfb5-00-2ojqtwmdtbb4m.kirk.replit.dev';
  const secretKey = process.env.ENCRYPTION_KEY || 'default_secret_key';

  const [savedConditionTree, setSavedConditionTree] = useState<ConditionTree | null>(null);
  const [editingBasic, setEditingBasic] = useState<LockCondition | null>(null);
  const [editingQuantity, setEditingQuantity] = useState<ConditionTree | null>(null);
  const [editingTraits, setEditingTraits] = useState<TraitCondition | null>(null);
  const [kickMessage, setKickMessage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('basic');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchConditionTree = async (): Promise<RoomSettings | null> => {
    const rawRoomId = widgetApi.widgetParameters.roomId;
    if (!rawRoomId) return null;
    const trimmedRoomId = trimRoomId(rawRoomId);
    try {
      const response = await fetch(`${apiUrl}/api/admin/settings?roomId=${encodeURIComponent(trimmedRoomId)}`, {
        headers: { Authorization: 'Bearer 1234567890QWERTYUIOP' },
      });
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      if (!data.tree) {
        console.warn('Fetched settings missing tree:', data);
        return null;
      }
      return { tree: data.tree, kickMessage: data.kick_message || '' };
    } catch (error) {
      console.error('Fetch error:', error);
      return null;
    }
  };

  const initializeTree = async () => {
    console.log('Starting initialization...');
    const defaultSettings: RoomSettings = {
      tree: { type: 'group', id: `group-${Date.now()}`, operator: 'AND', children: [] },
      kickMessage: '',
    };
    console.log('Fetching condition tree...');
    const fetchedSettings = await fetchConditionTree();
    console.log('Fetched settings:', fetchedSettings);
    const settingsToUse = fetchedSettings ?? defaultSettings;

    if (!settingsToUse.tree) {
      console.error('Tree is undefined, using default');
      settingsToUse.tree = defaultSettings.tree;
    }
    console.log('Setting savedConditionTree to:', settingsToUse.tree);
    setSavedConditionTree(settingsToUse.tree);
    setKickMessage(settingsToUse.kickMessage);

    const treeType = (settingsToUse.tree as any).type as string | undefined;
    switch (treeType) {
      case 'lock':
        setEditingBasic(settingsToUse.tree as LockCondition);
        setActiveTab('basic');
        break;
      case 'group':
        setEditingQuantity(settingsToUse.tree as LockGroup);
        setActiveTab('quantity');
        break;
      case 'trait':
        setEditingTraits(settingsToUse.tree as TraitCondition);
        setActiveTab('traits');
        break;
      default:
        console.warn('Unknown condition type, defaulting to quantity:', treeType);
        setEditingQuantity(defaultSettings.tree);
        setActiveTab('quantity');
        break;
    }
  };

  useEffect(() => {
    initializeTree();
  }, []);

  const getDefaultCondition = (tab: string): ConditionTree => {
    switch (tab) {
      case 'basic':
        return { type: 'lock', id: `lock-${Date.now()}`, issuer: '', taxon: '', nftCount: 1, nftImageUrl: null };
      case 'quantity':
        return { type: 'group', id: `group-${Date.now()}`, operator: 'AND', children: [] };
      case 'traits':
        return { type: 'trait', id: `trait-${Date.now()}`, issuer: '', taxon: '', nftImageUrl: null, traits: {} };
      default:
        throw new Error('Invalid tab');
    }
  };

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    if (newTab === 'basic' && editingBasic === null) {
      setEditingBasic(getDefaultCondition('basic') as LockCondition);
    } else if (newTab === 'quantity' && editingQuantity === null) {
      setEditingQuantity(getDefaultCondition('quantity'));
    } else if (newTab === 'traits' && editingTraits === null) {
      setEditingTraits(getDefaultCondition('traits') as TraitCondition);
    }
  };

  const handleTreeChange = useCallback((newTree: ConditionTree | null) => {
    if (newTree) { // Check if newTree is not null
      if (activeTab === 'basic') {
        setEditingBasic(newTree as LockCondition);
      } else if (activeTab === 'quantity') {
        setEditingQuantity(newTree);
      } else if (activeTab === 'traits') {
        setEditingTraits(newTree as TraitCondition);
      }
      setHasUnsavedChanges(true);
    }
  }, [activeTab]);

  const addConditionToGroup = useCallback(() => {
    if (activeTab !== 'quantity' || !editingQuantity || editingQuantity.type !== 'group') return;
    const newCondition: LockCondition = {
      type: 'lock',
      id: `lock-${Date.now()}`,
      issuer: '',
      taxon: '',
      nftCount: 1,
      nftImageUrl: null,
    };
    setEditingQuantity({
      ...editingQuantity,
      children: [...editingQuantity.children, newCondition],
    });
    setHasUnsavedChanges(true);
  }, [editingQuantity, activeTab]);

  const addSubgroup = useCallback(() => {
    if (activeTab !== 'quantity' || !editingQuantity || editingQuantity.type !== 'group') return;
    const newSubgroup: LockGroup = {
      type: 'group',
      id: `group-${Date.now()}`,
      operator: 'AND',
      children: [],
    };
    setEditingQuantity({
      ...editingQuantity,
      children: [...editingQuantity.children, newSubgroup],
    });
    setHasUnsavedChanges(true);
  }, [editingQuantity, activeTab]);

  const saveConditionTree = async () => {
    let conditionToSave: ConditionTree | null = null;
    switch (activeTab) {
      case 'basic':
        conditionToSave = editingBasic;
        break;
      case 'quantity':
        conditionToSave = editingQuantity;
        break;
      case 'traits':
        conditionToSave = editingTraits;
        break;
    }

    if (!conditionToSave) {
      setSaveError('No condition to save.');
      setTimeout(() => setSaveError(null), 3000);
      return;
    }

    const rawRoomId = widgetApi.widgetParameters.roomId;
    const userId = widgetApi.widgetParameters.userId;
    if (!rawRoomId || !userId) {
      setSaveError('Missing room or user information.');
      setTimeout(() => setSaveError(null), 3000);
      return;
    }
    const trimmedRoomId = trimRoomId(rawRoomId);
    const encryptedAccessToken = encryptData('mock-token', secretKey);

    const payload = {
      room_id: trimmedRoomId,
      condition_tree: conditionToSave,
      accessToken: encryptedAccessToken,
      userId,
      kick_message: kickMessage,
    };

    try {
      const response = await fetch(`${apiUrl}/api/admin/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer 1234567890QWERTYUIOP',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to save settings');
      setSavedConditionTree(conditionToSave);
      setHasUnsavedChanges(false);
      setSavedMessage(true);
      setSaveError(null);
      setTimeout(() => setSavedMessage(false), 2000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save settings.');
      setTimeout(() => setSaveError(null), 3000);
    }
  };

  return {
    savedConditionTree,
    editingBasic,
    editingQuantity,
    editingTraits,
    activeTab,
    kickMessage,
    hasUnsavedChanges,
    savedMessage,
    saveError,
    displayName: widgetApi.widgetParameters.displayName ?? 'User',
    handleTabChange,
    handleTreeChange,
    saveConditionTree,
    addConditionToGroup,
    addSubgroup,
    setKickMessage,
  };
};