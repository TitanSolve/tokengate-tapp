// /NFTAdmin/hooks/useNFTAdminLogic.ts

import { useState, useEffect, useCallback } from "react";
import { useWidgetApi } from "@matrix-widget-toolkit/react";
import {
  ConditionTree,
  LockCondition,
  LockGroup,
  TraitCondition,
  RoomSettings,
} from "../types";
import API_URLS from "../../config.ts";
import { trimRoomId } from "../utils";

export const useNFTAdminLogic = () => {
  const widgetApi = useWidgetApi();
  const apiUrl = API_URLS.backendUrl;
  const secretKey = process.env.ENCRYPTION_KEY || "default_secret_key";

  const [savedConditionTree, setSavedConditionTree] =
    useState<ConditionTree | null>(null);
  const [editingBasic, setEditingBasic] = useState<LockCondition | null>(null);
  const [editingQuantity, setEditingQuantity] = useState<ConditionTree | null>(
    null
  );
  const [editingTraits, setEditingTraits] = useState<TraitCondition | null>(
    null
  );
  const [kickMessage, setKickMessage] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);

  const fetchConditionTree = async (): Promise<RoomSettings | null> => {
    const rawRoomId = widgetApi.widgetParameters.roomId;
    if (!rawRoomId) return null;
    const trimmedRoomId = trimRoomId(rawRoomId);
    try {
      const requestBody = {
        roomId: encodeURIComponent(trimmedRoomId),
      };
      const backendUrl = `${apiUrl}/api/admin/settings`;
      console.log("Fetching settings from:", backendUrl);

      const response = await fetch(`${apiUrl}/api/admin/settings`, {
        method: "POST",
        headers: {
          Authorization: "Bearer 1234567890QWERTYUIOP",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) throw new Error("Failed to fetch settings");
      const data = await response.json();
      console.log('data:', data);
      if (!data.tree) {
        console.warn("Fetched settings missing tree:", data);
        return null;
      }

      return { tree: data.tree, kickMessage: data.kickMessage || "" };
    } catch (error) {
      console.error("Fetch error:", error);
      return null;
    }
  };

  const initializeTree = useCallback(async () => {
    try{
      console.log("Starting initialization...");
      const defaultSettings: RoomSettings = {
        tree: {
          type: "group",
          id: `group-${Date.now()}`,
          operator: "AND",
          children: [],
        },
        kickMessage: "",
      };
      console.log("Fetching condition tree...");
      const fetchedSettings = await fetchConditionTree();
      console.log("Fetched settings:", fetchedSettings);
      const settingsToUse = fetchedSettings ?? defaultSettings;

      if (!settingsToUse.tree) {
        console.error("Tree is undefined, using default");
        settingsToUse.tree = defaultSettings.tree;
      }

      console.log("Using settings:", settingsToUse, settingsToUse.tree);
      // const settingsToUseString: string = String(settingsToUse.tree);
      // console.log("settingsToUseString:", settingsToUseString, typeof settingsToUseString);      
      const settingsJSON = settingsToUse.tree;
      console.log("settingsJSON:", settingsJSON, typeof settingsJSON);
      let treeType: string | undefined = "";
      if( typeof settingsJSON === 'string') {
        try {
          console.log("Parsing settingsJSON as JSON");
          const parsedSettings = JSON.parse(settingsJSON);
          console.log("Parsed settings:", parsedSettings, typeof parsedSettings);
          setSavedConditionTree(parsedSettings);
          treeType = parsedSettings.type as string | undefined;
        } catch (error) {
          console.error("Error parsing settingsJSON as JSON:", error);
        }
      }
      else if (typeof settingsJSON === 'object') {
        setSavedConditionTree(settingsJSON);
        treeType = settingsJSON.type as string | undefined;
      }

      console.log("settingsToUse:", settingsToUse, typeof settingsToUse, settingsToUse.kickMessage);
      console.log("Setting savedConditionTree to:", settingsToUse.kickMessage);
      setKickMessage(settingsToUse.kickMessage);

      
      console.log("Tree type:", treeType, typeof treeType);
      switch (treeType) {
        case "lock":
          console.log("Initializing basic condition form with:", settingsJSON, typeof settingsJSON);
          if( typeof settingsJSON === 'string') {
            const parsedSettings = JSON.parse(settingsJSON);
            setEditingBasic(parsedSettings as LockCondition);
          }
          else if (typeof settingsJSON === 'object') {
            setEditingBasic(settingsJSON as LockCondition);
          }          
          setActiveTab("basic");
          break;
        case "group":
          setEditingQuantity(settingsJSON as LockGroup);
          setActiveTab("quantity");
          break;
        case "trait":
          setEditingTraits(settingsJSON as TraitCondition);
          setActiveTab("traits");
          break;
        default:
          console.warn(
            "Unknown condition type, defaulting to quantity:",
            treeType
          );
          setEditingQuantity(defaultSettings.tree);
          setActiveTab("quantity");
          break;
      }
    } catch (error) {
      console.error("Error initializing tree:", error);
    }
  }, [widgetApi]);

  useEffect(() => {
    console.log("Initializing NFT Admin Logic...");
    initializeTree();

    // Fetch room name for display
    const fetchRoomName = async () => {
      try {
        const rawRoomId = widgetApi.widgetParameters.roomId;
        if (!rawRoomId) return;

        const roomEvents = await widgetApi.receiveStateEvents("m.room.name");
        if (roomEvents && roomEvents.length > 0) {
          // Properly type the content to access the name property safely
          const content = roomEvents[0].content as { name?: string };
          setDisplayName(content.name || "Untitled Room");
        }
      } catch (error) {
        console.error("Error fetching roomname:", error);
      }
    };

    fetchRoomName();
    // Include initializeTree and widgetApi in the dependency array
  }, [widgetApi, initializeTree]);

  const getDefaultCondition = (tab: string): ConditionTree => {
    switch (tab) {
      case "basic":
        return {
          type: "lock",
          id: `lock-${Date.now()}`,
          issuer: "",
          taxon: "",
          nftCount: 1,
          nftImageUrl: null,
        };
      case "quantity":
        return {
          type: "group",
          id: `group-${Date.now()}`,
          operator: "AND",
          children: [],
        };
      case "traits":
        return {
          type: "trait",
          id: `trait-${Date.now()}`,
          issuer: "",
          taxon: "",
          nftImageUrl: null,
          traits: {},
        };
      default:
        throw new Error("Invalid tab");
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleTreeChange = (updatedTree: ConditionTree) => {
    console.log("Handling tree change:", updatedTree);
    console.log("EditingBasic before change:", editingBasic);
    setHasUnsavedChanges(true);

    switch (updatedTree.type) {
      case "lock":
        setEditingBasic(updatedTree as LockCondition);
        break;
      case "group":
        setEditingQuantity(updatedTree as LockGroup);
        break;
      case "trait":
        setEditingTraits(updatedTree as TraitCondition);
        break;
    }
  };

  // We're not using the operator parameter for adding conditions, so we can remove it
  const addConditionToGroup = (groupId: string) => {
    if (!editingQuantity) return;

    // Explicitly type the new condition to match LockCondition
    const newCondition: LockCondition = {
      type: "lock",
      id: `lock-${Date.now()}`,
      issuer: "",
      taxon: "",
      nftCount: 1,
      nftImageUrl: null,
    };

    const updatedTree = JSON.parse(JSON.stringify(editingQuantity));
    const addConditionToGroup = (group: LockGroup) => {
      if (group.id === groupId) {
        group.children.push(newCondition);
        return true;
      }

      for (const child of group.children) {
        if (child.type === "group") {
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

  const addSubgroup = (parentId: string, operator: "AND" | "OR") => {
    if (!editingQuantity) return;

    // Explicitly type the new group to match LockGroup
    const newGroup: LockGroup = {
      type: "group",
      id: `group-${Date.now()}`,
      operator,
      children: [],
    };

    const updatedTree = JSON.parse(JSON.stringify(editingQuantity));
    const addGroupToParent = (group: LockGroup) => {
      if (group.id === parentId) {
        group.children.push(newGroup);
        return true;
      }

      for (const child of group.children) {
        if (child.type === "group") {
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
    console.log("saveConditionTree called with roomId:", rawRoomId);
    if (!rawRoomId) {
      setSaveError("Room ID not found");
      return;
    }

    let treeToSave: ConditionTree;
    switch (activeTab) {
      case "basic":
        treeToSave = editingBasic || getDefaultCondition("basic");
        break;
      case "quantity":
        treeToSave = editingQuantity || getDefaultCondition("quantity");
        break;
      case "traits":
        treeToSave = editingTraits || getDefaultCondition("traits");
        break;
      default:
        setSaveError("Invalid tab");
        return;
    }

    const trimmedRoomId = trimRoomId(rawRoomId);
    // const encryptedSettings = encryptData(
    //   JSON.stringify({
    //     tree: treeToSave,
    //     kick_message: kickMessage,
    //   }),
    //   secretKey
    // );
    // console.log("trimming roomId:", trimmedRoomId);
    const userId = widgetApi.widgetParameters.userId || "";
    console.log("userId:", userId);
    const requestBody = {
      roomId: trimmedRoomId,
      conditionTree: treeToSave,
      accessToken: secretKey,
      userId: userId,
      kickMessage: kickMessage,
    };
    console.log("Request body for saving settings:", requestBody);
    try {
      const response = await fetch(`${apiUrl}/api/admin/saveSettings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer 1234567890QWERTYUIOP",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      setSavedConditionTree(treeToSave);
      setHasUnsavedChanges(false);
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    } catch (error) {
      console.error("Save error:", error);
      setSaveError("Failed to save settings");
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
