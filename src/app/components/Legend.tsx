import React, { useRef } from "react";
import {
  motion,
  LayoutGroup,
  useAnimation,
  useTransform,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import VoronoiCircles from "./VoronoiCircles"; 
import { circlePolygon2, SPRING } from "../lib/utils";
import styles from "../lib/styles/VoronoiWrapper.module.scss";
import { FermentDataItem } from "../lib/types";

interface LegendProps {
  legendData: FermentDataItem[];
  handleLegendClick: (organism: FermentDataItem) => void;
  isFixed: boolean;
  isMobile: boolean;
  activeItem: string | null;
  isPlaying: boolean; 
  setIsFixed: (isFixed: boolean) => void; 
}

const Legend: React.FC<LegendProps> = ({
  legendData,
  handleLegendClick,
  isFixed,
  setIsFixed,
  activeItem,
  isMobile,
  isPlaying,
}) => {
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const scrollSettings = { target: ref };
  const { scrollYProgress } = useScroll({
    ...scrollSettings,
    offset: ["start start", "end start"],
  });

  const { scrollY } = useScroll({
    ...scrollSettings,
  });

  const backdropFilter = useTransform(scrollYProgress, [0, 1], ["0px", "20px"]);
  const legendHeight = useTransform(scrollYProgress, [0, 100], [80, 50]);
  const elementTop = ref.current ? ref.current.getBoundingClientRect().top : 0;

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const previous = scrollYProgress.getPrevious() || 0;

    const currentScrollY = scrollY.get();

    if (latest > previous && currentScrollY >= elementTop - 100 && !isFixed) {
      controls.start({
        position: "fixed",
        top: 0,
        zIndex: 1000,

        backdropFilter: "blur(15px)",
        borderRadius: "8px",
        opacity: 1,
      });

      setIsFixed(true);
    }
  });

  if (isMobile) {
    return (
      <div className={styles.legend}>
        {legendData.map((organism, i) => (
          <div key={`legend-item-${i}`} className={styles.fixedLegendItems}>
            <VoronoiCircles
              wh={["50px", "50px"]}
              data={organism}
              circlePolygon={circlePolygon2}
              legend={true}
              isPlaying={isPlaying}
              isMobile={true}
            />
            <span>{organism.ferment}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      style={{
        backdropFilter,
        height: legendHeight,
      }}
      transition={SPRING}
      animate={controls}
      className={styles.legend}
    >
      <LayoutGroup>
        {legendData.map((organism, i) => {
          const layoutId = `legend-item-${i}`;
          return (
            <motion.div
              key={layoutId}
              ref={ref}
              layout="position"
              layoutId={layoutId}
              onClick={() => handleLegendClick(organism)}
              animate={{ scale: isFixed ? 0.6 : 1 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 40 + i * 10,
                delay: 0.1,
                duration: 2,
              }}
              style={{
                opacity:
                  activeItem === null || activeItem === organism.ferment
                    ? 1
                    : 0.5,
                cursor: "pointer",
              }}
              className={
                !isFixed ? styles.legendItems : styles.fixedLegendItems
              }
            >
              <VoronoiCircles
                wh={["50px", "50px"]}
                data={organism}
                circlePolygon={circlePolygon2}
                legend={true}
                isPlaying={isPlaying}
                isMobile={isMobile}
              />
              <span style={{ letterSpacing: "normal" }}>
                {organism.ferment}
              </span>
            </motion.div>
          );
        })}
      </LayoutGroup>
    </motion.div>
  );
};

export default Legend;
