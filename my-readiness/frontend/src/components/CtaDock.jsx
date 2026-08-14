import { createContext, useContext, useState } from "react";
import { createPortal } from "react-dom";

const CtaDockContext = createContext(null);

export function CtaDockHost({ children }) {
  const [node, setNode] = useState(null);

  return (
    <CtaDockContext.Provider value={node}>
      {children}
      <div ref={setNode} className="cta-dock" />
    </CtaDockContext.Provider>
  );
}

export function CtaDock({ children }) {
  const node = useContext(CtaDockContext);
  if (!node || !children) return null;
  return createPortal(children, node);
}
