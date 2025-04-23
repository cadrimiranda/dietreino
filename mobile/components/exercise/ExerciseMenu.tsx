import {
  Icon,
  MenuItem,
  OverflowMenu,
  TopNavigationAction,
} from "@ui-kitten/components";
import { useCallback } from "react";

type ExerciseMenuProps = {
  setMenuVisible: (visible: boolean) => void;
  menuVisible: boolean;
  onShowHistory: () => void;
};

const ExerciseMenu = ({
  setMenuVisible,
  menuVisible,
  onShowHistory,
}: ExerciseMenuProps) => {
  const renderMenuAction = useCallback(
    () => (
      <TopNavigationAction
        icon={(props) => <Icon {...props} name="more-vertical" />}
        onPress={() => setMenuVisible(true)}
      />
    ),
    [setMenuVisible]
  );

  return (
    <OverflowMenu
      anchor={renderMenuAction}
      visible={menuVisible}
      onBackdropPress={() => setMenuVisible(false)}
      placement="bottom end"
      backdropStyle={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <MenuItem
        accessoryLeft={(props) => <Icon {...props} name="bar-chart" />}
        title="Ver histórico"
        onPress={() => {
          onShowHistory();
          setMenuVisible(false);
        }}
      />
    </OverflowMenu>
  );
};

export default ExerciseMenu;
