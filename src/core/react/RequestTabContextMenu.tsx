import React, { useEffect } from "react";
import { ChevronsRight, PanelsTopLeft, Play, Star, X } from "lucide-react";

interface RequestTab {
  id: string;
}

type CloseAction = "close" | "closeOthers" | "closeToRight";

interface RequestTabContextMenuProps {
  tabs: RequestTab[];
  tabId: string;
  x: number;
  y: number;
  onClose: () => void;
  onAction: (action: CloseAction, ids: string[]) => void;
  isFavorite: boolean;
  onFavorite: () => void;
  onAddToRunner: () => void;
}

export function RequestTabContextMenu({
  tabs,
  tabId,
  x,
  y,
  onClose,
  onAction,
  isFavorite,
  onFavorite,
  onAddToRunner,
}: RequestTabContextMenuProps) {
  useEffect(() => {
    const dismiss = () => onClose();
    const dismissOnKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    document.addEventListener("click", dismiss);
    window.addEventListener("keydown", dismissOnKey);
    return () => {
      document.removeEventListener("click", dismiss);
      window.removeEventListener("keydown", dismissOnKey);
    };
  }, [onClose]);

  const index = tabs.findIndex((tab) => tab.id === tabId);
  if (index < 0) return null;
  const rightIds = tabs.slice(index + 1).map((tab) => tab.id);
  const otherIds = tabs.filter((tab) => tab.id !== tabId).map((tab) => tab.id);

  return (
    <div
      className="tab-context-menu"
      role="menu"
      aria-label="Request tab actions"
      style={{ left: x, top: y }}
      onClick={(event) => event.stopPropagation()}
    >
      <button type="button" role="menuitem" onClick={onFavorite}>
        <Star size={14} fill={isFavorite ? "currentColor" : "none"} />
        {isFavorite ? "Remove from favourites" : "Add to favourites"}
      </button>
      <button type="button" role="menuitem" onClick={onAddToRunner}>
        <Play size={14} />
        Add to runner
      </button>
      <button
        type="button"
        role="menuitem"
        onClick={() => onAction("close", [tabId])}
      >
        <X size={14} />
        Close
      </button>
      <button
        type="button"
        role="menuitem"
        disabled={!otherIds.length}
        onClick={() => onAction("closeOthers", otherIds)}
      >
        <PanelsTopLeft size={14} />
        Close others
      </button>
      <button
        type="button"
        role="menuitem"
        disabled={!rightIds.length}
        onClick={() => onAction("closeToRight", rightIds)}
      >
        <ChevronsRight size={14} />
        Close to the right
      </button>
    </div>
  );
}
