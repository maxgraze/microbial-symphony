import React from "react";
import { Drawer, Button } from "antd";
import styles from "../lib/styles/VoronoiWrapper.module.scss";

interface SoundPreferenceDrawerProps {
  isOpen: boolean;
  isMobile: boolean;
  onClose: () => void;
  onEnableSound: () => void;
  onDisableSound: () => void;
}

const SoundPreferenceDrawer: React.FC<SoundPreferenceDrawerProps> = ({
  isOpen,
  onClose,
  onEnableSound,
  onDisableSound,
  isMobile,
}) => {
  return (
    <Drawer
      title="Sound Preference"
      placement="bottom"
      closable={false}
      onClose={onClose}
      open={isOpen}
      height={isMobile ? 250 : 200}
    >
      <p>
        By allowing sound, you can <i>hear</i> the combination of the
        microorganisms in common ferments. <br />
        <br />
        With a soundless experience, you can still view a simplified microbial
        landscape of your favorite ferments.
      </p>
      <div className={styles.soundPreference}>
        <Button
          type="primary"
          onClick={onEnableSound}
          style={{ marginRight: 8 }}
        >
          With Sound
        </Button>
        <Button onClick={onDisableSound}>Without Sound</Button>
      </div>
    </Drawer>
  );
};

export default SoundPreferenceDrawer;
