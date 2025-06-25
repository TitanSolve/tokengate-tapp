import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// Creating the context with a default undefined value, properly typed
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (typeof window !== "undefined") {
            return (localStorage.getItem("theme") as 'light' | 'dark') || "light";
        }
        return "light";
    });

    useEffect(() => {
        document.documentElement.classList.remove("light", "dark");
        document.documentElement.classList.add(theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
