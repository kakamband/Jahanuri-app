import React, { createContext, useContext } from "react";
import { useQuery } from "react-apollo-hooks";
import { Me } from "../types/api";
import { ME } from "../screens/MyProfileScreen/MyProfileScreenQueries";

export const MeContext = createContext(null);

export const MeProvider = ({ children }) => {
  const { data, loading, refetch } = useQuery<Me>(ME);
  const me = data ? data.me : null;
  console.log(me);
  return (
    <MeContext.Provider value={{ me, loading, refetch }}>
      {children}
    </MeContext.Provider>
  );
};
export const useMe = () => {
  const { me, loading, refetch } = useContext(MeContext);
  return { me, loading, refetch };
};
