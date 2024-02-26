import React from "react";
import styles from "../lib/styles/Tooltip.module.scss";

interface ITooltipProps {
  config:
    | {
        x: number;
        y: number;
        data: any;
      }
    | undefined;
}

const Tooltip = (props: ITooltipProps) => {
  const { config } = props;

  return (
    <>
      {config && (
        <div
          className={styles.tooltipContainer}
          style={{
            left: config.x,
            top: config.y,
          }}
        >
          <span className={`${styles.text}, ${styles.metricName}`}>
            {/* {config.data} */}
          </span>
          <br />
          <span className={styles.smallEmphasis}></span>
          <br />
        </div>
      )}
    </>
  );
};
export default Tooltip;
