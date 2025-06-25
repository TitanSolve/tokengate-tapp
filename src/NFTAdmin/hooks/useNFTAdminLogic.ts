// /NFTAdmin/hooks/useNFTAdminLogic.ts

import { useState, useEffect } from 'react';
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
  const [displayName, setDisplayName] = useState<string | null>(null);

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
    
    // Fetch room name for display
    const fetchRoomName = async () => {
      try {
        const rawRoomId = widgetApi.widgetParameters.roomId;
        if (!rawRoomId) return;
        
        const roomEvents = await widgetApi.receiveStateEvents('m.room.name');
        if (roomEvents && roomEvents.length > 0) {
          // Properly type the content to access the name property safely
          const content = roomEvents[0].content as { name?: string };
          setDisplayName(content.name || 'Untitled Room');
        }
      } catch (error) {
        console.error('Error fetching room name:', error);
      }
    };
    
    fetchRoomName();
    // Include initializeTree and widgetApi in the dependency array
  }, [widgetApi, initializeTree]);

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

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleTreeChange = (updatedTree: ConditionTree) => {
    setHasUnsavedChanges(true);
    
    switch (updatedTree.type) {
      case 'lock':
        setEditingBasic(updatedTree as LockCondition);
        break;
      case 'group':
        setEditingQuantity(updatedTree as LockGroup);
        break;
      case 'trait':
        setEditingTraits(updatedTree as TraitCondition);
        break;
    }
  };

  // We're not using the operator parameter for adding conditions, so we can remove it
  const addConditionToGroup = (groupId: string) => {
    if (!editingQuantity) return;
    
    // Explicitly type the new condition to match LockCondition
    const newCondition: LockCondition = { 
      type: 'lock', 
      id: `lock-${Date.now()}`, 
      issuer: '', 
      taxon: '', 
      nftCount: 1, 
      nftImageUrl: null 
    };
    
    const updatedTree = JSON.parse(JSON.stringify(editingQuantity));
    const addConditionToGroup = (group: LockGroup) => {
      if (group.id === groupId) {
        group.children.push(newCondition);
        return true;
      }
      
      for (const child of group.children) {
        if (child.type === 'group') {
          if (addConditionToGroup(child as LockGroup)) {
            return true;
          }
        }
      }
      
      return false;
    };
    
    addConditionToGroup(updatedTree as LockGroup);
    setEditingQuantity(updatedTree);
    setHasUnsavedChanges(true);
  };

  const addSubgroup = (parentId: string, operator: 'AND' | 'OR') => {
    if (!editingQuantity) return;
    
    // Explicitly type the new group to match LockGroup
    const newGroup: LockGroup = { 
      type: 'group', 
      id: `group-${Date.now()}`, 
      operator, 
      children: [] 
    };
    
    const updatedTree = JSON.parse(JSON.stringify(editingQuantity));
    const addGroupToParent = (group: LockGroup) => {
      if (group.id === parentId) {
        group.children.push(newGroup);
        return true;
      }
      
      for (const child of group.children) {
        if (child.type === 'group') {
          if (addGroupToParent(child as LockGroup)) {
            return true;
          }
        }
      }
      
      return false;
    };
    
    addGroupToParent(updatedTree as LockGroup);
    setEditingQuantity(updatedTree);
    setHasUnsavedChanges(true);
  };

  const saveConditionTree = async () => {
    const rawRoomId = widgetApi.widgetParameters.roomId;
    if (!rawRoomId) {
      setSaveError('Room ID not found');
      return;
    }

    let treeToSave: ConditionTree;
    switch (activeTab) {
      case 'basic':
        treeToSave = editingBasic || getDefaultCondition('basic');
        break;
      case 'quantity':
        treeToSave = editingQuantity || getDefaultCondition('quantity');
        break;
      case 'traits':
        treeToSave = editingTraits || getDefaultCondition('traits');
        break;
      default:
        setSaveError('Invalid tab');
        return;
    }

    const trimmedRoomId = trimRoomId(rawRoomId);
    const encryptedSettings = encryptData(
      JSON.stringify({
        tree: treeToSave,
        kick_message: kickMessage
      }),
      secretKey
    );

    try {
      const response = await fetch(`${apiUrl}/api/admin/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer 1234567890QWERTYUIOP'
        },
        body: JSON.stringify({
          roomId: trimmedRoomId,
          settings: encryptedSettings
        })
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      setSavedConditionTree(treeToSave);
      setHasUnsavedChanges(false);
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    } catch (error) {
      console.error('Save error:', error);
      setSaveError('Failed to save settings');
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
    displayName,
    handleTabChange,
    handleTreeChange,
    saveConditionTree,
    addConditionToGroup,
    addSubgroup,
    setKickMessage,
  };
};
