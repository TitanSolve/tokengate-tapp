import React, { useEffect, useState } from "react";
import { useWidgetApi } from '@matrix-widget-toolkit/react';
import { Tabs, Tab, Box } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { STATE_EVENT_ROOM_MEMBER } from "@matrix-widget-toolkit/api";
import { Tooltip } from "@mui/material";
import { useTheme } from "../context/ThemeContext";
import { Buffer } from "buffer";
import Home from "../pages/Home/index";
import API_URLS from "../config.ts";
import LoadingOverlay from "./LoadingOverlay/index";
import * as xrpl from "xrpl";

// Types definitions for the component
interface TrustLine {
  account: string;
  balance: string;
  currency: string;
  decodedCurrency: string;
  limit: string;
  limit_peer: string;
  quality_in: number;
  quality_out: number;
  no_ripple?: boolean;
  no_ripple_peer?: boolean;
}

interface WalletTrustLines {
  wallet: string;
  trustLines: TrustLine[];
  error?: string;
}

interface Member {
  name: string;
  userId: string;
  membership: string;
  walletAddress?: string;
  trustLines?: TrustLine[];
  trustLineError?: string | null;
}

interface RoomMemberContent {
  membership?: string;
  displayname?: string;
}

interface RoomEvent {
  content: RoomMemberContent;
  sender: string;
}

// Helper function to decode currency
const decodeCurrency = (currency: string): string => {
  try {
    // Return as is if it's a standard short currency code
    if (currency.length <= 3) return currency
    
    // Check for LP token format (some common patterns)
    if (currency.includes('/') || currency.includes('-LP') || currency.includes('LP-')) {
      return currency; // Already in a readable format
    }
    
    // Handle hex encoded currencies (standard 40-character format)
    const isHex = /^[A-Fa-f0-9]{40}$/.test(currency)
    if (isHex) {
      const buf = Buffer.from(currency, 'hex')
      const ascii = buf.toString('ascii').replace(/\0/g, '').trim()
      const isPrintable = /^[\x20-\x7E]+$/.test(ascii)
      return isPrintable ? ascii : currency
    }
    
    // Check for LP token pairs in hex format
    // This is a simplified approach - adjust based on actual token formats
    if (/^[A-Fa-f0-9]+$/.test(currency)) {
      // Try to decode in 20-byte chunks (common for LP tokens)
      if (currency.length >= 80) { // Potentially two 40-char hex strings
        const firstPart = currency.substring(0, 40);
        const secondPart = currency.substring(40, 80);
        
        // Try to decode each part
        const firstToken = decodeCurrency(firstPart);
        const secondToken = decodeCurrency(secondPart);
        
        if (firstToken !== firstPart || secondToken !== secondPart) {
          return `${firstToken}/${secondToken}-LP`;
        }
      }
    }
    
    // If we can't identify a specific format, return as is
    return currency;
  } catch (e) {
    console.error('Error decoding currency:', e);
    return currency;
  }
}

async function getTrustLinesAsArray(wallets: string[]): Promise<WalletTrustLines[]> {
  const client = new xrpl.Client(API_URLS.xrplMainnetUrl || 'wss://xrplcluster.com') // mainnet with fallback URL
  await client.connect();

  const trustLinesArray: WalletTrustLines[] = []

  for (const address of wallets) {
    try {
      const response = await client.request({
        command: "account_lines",
        account: address,
      })
      const decodedLines = response.result.lines.map((line: any) => ({
        ...line,
        currency: line.currency,
        decodedCurrency: decodeCurrency(line.currency)
      }))
      trustLinesArray.push({
        wallet: address,
        trustLines: decodedLines
      })
    } catch (err: any) {
      trustLinesArray.push({
        wallet: address,
        error: err.data?.error_message || err.message,
        trustLines: []
      })
    }
  }
  await client.disconnect()
  return trustLinesArray;
}

const MatrixClientProvider: React.FC = () => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const widgetApi = useWidgetApi();

  const [loading, setLoading] = useState<boolean>(true);
  const [membersList, setMembersList] = useState<Member[]>([]);
  const { theme, toggleTheme } = useTheme();
  const [myOwnWalletAddress, setMyWalletAddress] = useState<string>("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const events = await widgetApi.receiveStateEvents<RoomEvent>(STATE_EVENT_ROOM_MEMBER);
        
        // Filter out users who aren't actual members (just invited)
        const usersList = events
          .filter(item => {
            // Only include users with membership state 'join' or having displayname
            const content = item.content as RoomMemberContent;
            return content.membership === 'join' && content.displayname;
          })
          .map(item => {
            const content = item.content as RoomMemberContent;
            return {
              name: content.displayname || '',
              userId: item.sender,
              membership: content.membership || ''
            };
          });

        // Only get trustlines for valid members
        const validUserIds = usersList.map(member => member.userId.split(":")[0].replace("@", ""));
        console.log("Valid user IDs:", validUserIds);
        
        // Get trustlines data
        const trustLinesArray = await getTrustLinesAsArray(validUserIds);
        console.log("Trust lines array:", trustLinesArray);
        
        // Find the current user
        const own = usersList.find((u) => u.name === widgetApi.widgetParameters.displayName);
        const ownWalletAddress = own?.userId?.split(":")[0].replace("@", "") || "";
        setMyWalletAddress(ownWalletAddress);

        // Map trustlines to users, ensuring correct wallet matching
        const usersWithTrustLines = usersList.map(user => {
          const walletAddress = user.userId.split(":")[0].replace("@", "")
          // Find exact match for this wallet address
          const trustData = trustLinesArray.find(t => t.wallet === walletAddress)
          
          console.log(`User ${user.name}, wallet ${walletAddress}, found trustData:`, !!trustData);
          
          return {
            ...user,
            walletAddress, // Add wallet address to user object for transparency
            trustLines: trustData?.trustLines || [],
            trustLineError: trustData?.error || null
          }
        })
        setMembersList(usersWithTrustLines);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [widgetApi]);

  const panelVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  return (
    <>
      {loading ? (
        <LoadingOverlay message="Loading..." />
      ) : (
        <Box sx={{
          width: "100%",
          borderRadius: 2,
          boxShadow: 1,
          bgcolor: "background.paper",
          transition: "background-color 0.3s ease",
        }}
          className="dark:bg-[#15191E] dark:text-white bg-white text-black"
        >
          {/* Toggle Button */}
          <Tooltip title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`} arrow>
            <button
              onClick={toggleTheme}
              className="fixed top-4 right-4 z-50 p-2 md:p-3 rounded-full bg-gray-100 dark:bg-[#15191E] text-gray-800 dark:text-white shadow-lg hover:scale-105 active:scale-95 transition-all duration-300 ease-in-out border border-gray-300 dark:border-gray-700 backdrop-blur-md"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>
          </Tooltip>

          <Tabs
            value={selectedIndex}
            onChange={(_, newIndex) => setSelectedIndex(newIndex)}
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab
              label="Home"
              className="text-black dark:text-white"
            />
          </Tabs>
          <Box sx={{ p: 2, position: "relative", overflow: "hidden" }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedIndex}
                variants={panelVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <div style={{ display: selectedIndex === 0 ? "block" : "none" }}>
                  <Home myWalletAddress={myOwnWalletAddress} membersList={membersList} wgtParameters={widgetApi.widgetParameters} />
                </div>
              </motion.div>
            </AnimatePresence>
          </Box>
        </Box>
      )}
    </>
  );
};

export default MatrixClientProvider;
