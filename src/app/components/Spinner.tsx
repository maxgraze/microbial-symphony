import { motion, useAnimate } from "framer-motion";
import styles from "../lib/styles/TextSpinner.module.scss";
import { useEffect } from "react";

export default function TextSpinnerLoader() {
  const text = "JUST A MOMENT BEFORE WE BEGIN.";
  const characters = text.split("");

  const radius = 100;
  const fontSize = "17px";
  const letterSpacing = 11.5;

  const [scope, animate] = useAnimate();

  useEffect(() => {
    const animateLoader = async () => {
      const letterAnimation: any[] = [];
      characters.forEach((_, i) => {
        letterAnimation.push([
          `.letter-${i}`,
          { opacity: 0 },
          { duration: 0.3, at: i === 0 ? "+0.8" : "-0.28" },
        ]);
      });
      characters.forEach((_, i) => {
        letterAnimation.push([
          `.letter-${i}`,
          { opacity: 1 },
          { duration: 0.3, at: i === 0 ? "+0.8" : "-0.28" },
        ]);
      });
      animate(letterAnimation, {
        repeat: Infinity,
      });
      animate(
        scope.current,
        { rotate: 360 },
        { duration: 4, ease: "linear", repeat: Infinity }
      );
    };
    animateLoader();
  }, []);

  return (
    <div className={styles.container}>
      <motion.div
        ref={scope}
        className={styles.circle}
        style={{ width: radius * 2 }}
      >
        <p aria-label={text} />
        <p aria-hidden="true" className={styles.text}>
          {characters.map((ch, i) => (
            <motion.span
              key={i}
              className={`letter letter-${i}`}
              style={{
                transformOrigin: `0 ${radius}px`,
                transform: `rotate(${i * letterSpacing}deg)`,
                fontSize,
              }}
            >
              {ch}
            </motion.span>
          ))}
        </p>
      </motion.div>
    </div>
  );
}
