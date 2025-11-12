import * as React from "react";
import AppHeaderActions from "./AppHeaderActions";

interface AppHeaderListProps {
  title: string;
  onSearch?: () => void;
  onAdd?: () => void;
  onFilter?: () => void;
}

export default function AppHeaderList({ title, onSearch, onAdd, onFilter }: AppHeaderListProps) {
  const actions = [];

  if (onSearch) actions.push({ icon: "magnify", onPress: onSearch });
  if (onFilter) actions.push({ icon: "filter-variant", onPress: onFilter });
  if (onAdd) actions.push({ icon: "plus", onPress: onAdd });

  return <AppHeaderActions title={title} actions={actions} showBack={false} />;
}
