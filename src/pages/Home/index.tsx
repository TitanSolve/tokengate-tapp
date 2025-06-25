import React from "react";
import "./Home.css";
import { useTheme } from "../../context/ThemeContext";

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

interface Member {
  name: string;
  userId: string;
  membership: string;
  walletAddress?: string;
  trustLines?: TrustLine[];
  trustLineError?: string | null;
}

interface HomeProps {
  myWalletAddress: string;
  membersList: Member[];
  wgtParameters: any; // Using any for widget parameters as the structure might be complex
}

const Home: React.FC<HomeProps> = ({ myWalletAddress, membersList, wgtParameters }) => {
    const { theme } = useTheme();
    return (
        <div className="home-container dark:text-white text-black">
            <h1 className="home-title dark:text-white text-black">Community Trustlines</h1>
            
            <div className="wallet-info dark:bg-gray-800 bg-gray-100">
                <h3>My Wallet Address:</h3>
                <p className="wallet-address dark:bg-gray-700 dark:text-gray-200 bg-gray-200 text-gray-800">{myWalletAddress}</p>
            </div>
            
            <div className="members-section">
                <h2 className="dark:border-gray-700">Members</h2>
                <div className="members-list">
                    {membersList && membersList.map((member, index) => (
                        <div key={index} className="member-card dark:bg-gray-800 dark:border-gray-700">
                            <div className="member-header">
                                <h3 className="dark:text-white">{member.name}</h3>
                                <span className="user-id dark:text-gray-400">{member.userId}</span>
                            </div>
                            
                            {member.trustLines && member.trustLines.length > 0 && (
                                <div className="trust-lines">
                                    <h4 className="dark:text-gray-300">Trust Lines:</h4>
                                    <div className="trust-lines-grid">
                                        {member.trustLines.map((trustLine, idx) => (
                                            <div key={idx} className="trust-line-item dark:bg-gray-700">
                                                <span className="currency dark:text-blue-300">{trustLine.decodedCurrency || trustLine.currency}</span>
                                                <span className="balance dark:text-green-300">{parseFloat(trustLine.balance).toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {member.trustLineError && (
                                <p className="error-message">Error: {member.trustLineError}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="parameters-section dark:bg-gray-800 bg-gray-100">
                <h3>Widget Parameters</h3>
                <pre className="parameters-json dark:bg-gray-700 dark:text-gray-200 bg-gray-50 text-gray-800">{JSON.stringify(wgtParameters, null, 2)}</pre>
            </div>
        </div>
    );
};

export default Home;
