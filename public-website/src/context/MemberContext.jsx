import { createContext, useContext, useState } from "react";

const MemberContext = createContext();

export function MemberProvider({ children }) {
  const [memberData, setMemberData] = useState(
    () => JSON.parse(localStorage.getItem("member")) || null
  );

  const login = (data) => {
    localStorage.setItem("member", JSON.stringify(data));
    setMemberData(data);
  };

  const logout = () => {
    localStorage.removeItem("member");
    setMemberData(null);
  };

  // Expose the inner member profile (robust fallback to raw object if .member is missing)
  const member = memberData ? (memberData.member || memberData) : null;

  return (
    <MemberContext.Provider value={{ member, login, logout }}>
      {children}
    </MemberContext.Provider>
  );
}

export const useMember = () => useContext(MemberContext);