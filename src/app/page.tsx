"use client";
import styles from "./lib/styles/VoronoiWrapper.module.scss";
import "./page.module.css";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FermentData,
  circlePolygon,
  circlePolygon2,
  legendData,
  PlayerContext,
  soysauce,
  SPRING,
} from "./lib/utils";
import dynamic from "next/dynamic";
import { explanation } from "./lib/motivation";
import ReactMarkdown from "react-markdown";
import VoronoiCircles from "./components/VoronoiCircles";
import { Drawer, Button } from "antd";
import Circles from "./components/Circles";
import {
  motion,
  AnimatePresence,
  useInView,
  useScroll,
  useAnimation,
  useTransform,
  useMotionValueEvent,
  useAnimate,
  LayoutGroup,
} from "framer-motion";
import React from "react";

const Sonification = dynamic(() => import("./components/Sonification"), {
  ssr: false, // Disable server-side rendering for Sonification
});

export default function Home() {
  const [players, setPlayers] = useState<any>({});
  const [data, setData] = useState<FermentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true); //change to false
  const [showDrawer, setShowDrawer] = useState(false);

  const [isFixed, setIsFixed] = useState(false); // State to toggle fixed positioning
  const [isDOMReady, setDOMReady] = useState(false);
  const controls = useAnimation();
  const id = React.useId();
  useEffect(() => {
    // This simply waits for the next tick of the event loop, after the DOM updates.
    requestAnimationFrame(() => setDOMReady(true));
  }, []);
  const ref = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const scrollSettings = isDOMReady ? { target: ref } : { target: undefined };
  const value = useMemo(
    () => ({
      players,
      setPlayers,
    }),
    [players]
  );

  const { scrollYProgress } = useScroll({
    ...scrollSettings,
    offset: ["start start", "end start"],
    // Potentially other settings that are conditional
  });

  const { scrollY } = useScroll({
    ...scrollSettings,
    // Additional settings
  });
  const backdropFilter = useTransform(scrollYProgress, [0, 1], ["0px", "20px"]);
  const legendHeight = useTransform(scrollYProgress, [0, 100], [120, 50]);

  const variants = {
    initial: {
      scale: 1,
      // position: "relative",
      top: "0px",
      zIndex: "auto",
      width: "initial",
    },
    sticky: {
      scale: 0.6,
      opacity: 1,
      backgroundColor: "rgba(255, 255, 255, 0.5)",
      // backdropFilter: backdropFilter,
    },
  };

  const childVariants = {
    visible: {
      y: -20, // Adjust based on how far you want to move them up
      opacity: 1,
      transition: {
        y: { stiffness: 1000, velocity: -100 },
      },
    },
    initial: {
      y: 0,
      opacity: 0.5,
    },
  };

  const animateTo = {
    y: -10, // Adjust the movement distance as needed
    transition: { type: "spring", stiffness: 100, damping: 10 },
  };

  const elementTop = ref.current ? ref.current.getBoundingClientRect().top : 0;

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const previous = scrollYProgress.getPrevious() || 0;

    const currentScrollY = scrollY.get(); // Use get() instead of .current

    if (latest > previous && currentScrollY >= elementTop - 100 && !isFixed) {
      controls.start({
        position: "fixed",
        top: -10,
        zIndex: 1000,
        scale: 0.6,
        // display: "flex",
        // alignItems: "center",
        // justifyContent: "center",
        // y: 0,
        // backgroundColor: "#e3e3e7",
        backdropFilter: "blur(15px)",
        borderRadius: "8px",
        transition: SPRING,

        //   // transition: { duration: 1 },
        //   // delay: stagger(0.05),
        //   // at: "-0.1",
      });

      setIsFixed(true);
    }
    //   if (previous > latest && currentScrollY >= elementTop && isFixed)
    //     controls.start({
    //       y: 0, // Ensure y is reset to initial value for consistent behavior
    //       position: "relative",
    //       top: "0px", // Explicitly set to "0px" or remove this line if "initial" doesn't work as expected
    //       zIndex: "auto",
    //       width: "initial",
    //       scale: 1,
    //       transition: { duration: 1 },
    //     });
    //   setIsFixed(false);

    //   console.log("scrollY", scrollY);
  });

  // console.log("elementTop", elementTop);
  // useEffect(() => {
  //   const initialTop = ref.current ? ref.current.offsetTop : 0;

  //   const calculateProgress = () => {
  //     const elementScroll = elementTop - window.scrollY;
  //     const shouldBeFixed = elementScroll <= 0;

  //     if (shouldBeFixed !== isFixed) {
  //       setIsFixed(shouldBeFixed);
  //       if (shouldBeFixed) {
  //         controls.start({
  //           position: "fixed",
  //           top: -10,
  //           zIndex: 1000,
  //           width: "100%",
  //           scale: 0.6,
  //           transition: { duration: 1 },
  //         });
  //       }
  //     }
  //     // else {
  //     //   console.log("else");
  //     //   controls.start({
  //     //     y: 0, // Ensure y is reset to initial value for consistent behavior
  //     //     position: "relative",
  //     //     top: "0px", // Explicitly set to "0px" or remove this line if "initial" doesn't work as expected
  //     //     zIndex: "auto",
  //     //     width: "initial",
  //     //     scale: 1,
  //     //     transition: { duration: 1 },
  //     //   });
  //     // }
  //   };

  //   // This subscribes to changes and calls calculateProgress accordingly.
  //   const unsubscribe = scrollYProgress.on("change", calculateProgress);

  //   // Cleanup function to unsubscribe from scrollYProgress changes.
  //   return () => unsubscribe();
  // }, [scrollYProgress, controls, isFixed]);

  // useEffect(() => {
  //   scrollYProgress.on("change", (value) => {
  //     console.log(value); // Now logging the numerical value
  //     if (value >= 1) {
  //       console.log(value);
  //       // Adjust this condition based on when you want the stickiness to trigger
  //       controls.start({ y: 0, position: "fixed", top: 0 });
  //     } else {
  //       controls.start({ y: 0, position: "relative" });
  //     }
  //   });
  // }, [scrollYProgress, controls]);

  // Define animation variants for sticky and initial state

  function checkMobile() {
    setIsMobile(window.innerWidth <= 768);
  }
  useEffect(() => {
    checkMobile();
    setShowDrawer(true);

    window.addEventListener("resize", checkMobile);

    fetch("data/groupedByFerment.json")
      .then((response) => response.json())
      .then((data) => setData(data))
      .then(() => setIsLoading(false));

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);
  const handleEnableSound = () => {
    setIsPlaying(true);
    setShowDrawer(false);
  };

  const handleDisableSound = () => {
    setIsPlaying(false);
    setShowDrawer(false);
  };

  console.log(isFixed);
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isMobile ? (
    <div
      style={{
        fontFamily: "Figtree",
        fontSize: "2em",
        margin: "60px 40px",
        lineHeight: "1.66em",
      }}
    >
      Sorry! This experience is currently only available on desktop.
    </div>
  ) : (
    <main>
      {/* <Drawer
        title="Sound Preference"
        placement="bottom"
        closable={false}
        onClose={() => setShowDrawer(false)}
        open={showDrawer}
        height={200}
      >
        <p>
          By allowing sound, you can <i>hear</i> the combination of the
          microorganisms in common ferments. <br />
          <br />
          With a soundless experience, you can still view a simplied microbial
          landscape of your favorite ferments.
        </p>
        <div
          style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}
        >
          <Button
            type="primary"
            onClick={handleEnableSound}
            style={{ marginRight: 8 }}
          >
            With Sound
          </Button>
          <Button onClick={handleDisableSound}>Without Sound</Button>
        </div>
      </Drawer> */}
      <PlayerContext.Provider value={value}>
        <Sonification />

        <motion.div ref={pageRef} layoutRoot className={styles.container}>
          <div className={styles.display}>
            <h1
              style={{
                fontFamily: "Margo Condensed",
                fontSize: "8em",
                paddingBottom: "20px",
              }}
            >
              Microbial Symphony
            </h1>
            <p
              style={{
                fontSize: "1.3em",
                marginTop: " 20px",
              }}
            >
              {" "}
              Uncover the symphony of microorganisms hidden within your favorite
              foods.
            </p>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "40px",
            }}
          >
            <p
              style={{
                fontSize: "1em",

                marginTop: " 20px",
              }}
            >
              {" "}
              Hover over a circle.
            </p>
            {/* <motion.div
              className={styles.legend}
              animate={{}}
              transition={SPRING}
            > */}
            <motion.div
              // ref={ref}
              // variants={variants}
              // initial="initial"

              layout="position"
              // className={isFixed ? styles.sticky : styles.initial}

              style={{
                backdropFilter,
                height: legendHeight,
                // position: "sticky",
                // position: "relative",
                // top: -10,
                // zIndex: 1000,
                width: "100%",
                // scale: 0.6,
              }}
              // id="nav"
              animate={controls}
              // className={`${isFixed ? styles.stickyNav : styles.relative}`}
              className={styles.legend}
            >
              <LayoutGroup>
                {legendData.map((organism, i) => {
                  const layoutId = `${id}-${i}`;
                  return (
                    <motion.div
                      ref={ref}
                      layout="size"
                      // variants={childVariants}
                      layoutId={layoutId}
                      key={layoutId}
                      animate={animateTo}
                      // transition={SPRING}
                      // transition={{
                      //   type: "spring",
                      //   stiffness: 400,
                      //   damping: 40 + i * 5,
                      // }}
                      className={
                        !isFixed ? styles.legendItems : styles.fixedLegendItems
                      }
                    >
                      <VoronoiCircles
                        wh={["50px", "50px"]}
                        data={organism}
                        key={layoutId}
                        isFixed={isFixed}
                        circlePolygon={circlePolygon2}
                        legend={true}
                        isPlaying={isPlaying}
                        setIsPlaying={setIsPlaying}
                      />
                      <span>
                        {organism.ferment}
                        {/* {organism.ferment.split(" ").slice(0, 2).join(" ")} */}
                        {/* <br /> */}
                        {/* {organism.ferment.split(" ").slice(2).join(" ")} */}
                      </span>
                    </motion.div>
                  );
                })}
              </LayoutGroup>
            </motion.div>
            <p
              style={{
                fontSize: "1em",
              }}
            >
              {" "}
              These five microorganisms are the most prevelant types in
              fermentations.
              <br />
              They are our unseen collaborators of fermentation and flavor.
            </p>
          </div>
          <div className={styles.soysauceDiv}>
            <h1
              style={{
                fontSize: "2em",
              }}
            >
              What does soy sauce sound like?
            </h1>
            <div
              style={{
                display: "flex",
                /* width: 40%, */
                alignItems: "center",
                justifyContent: "center",
                gap: "40px",
              }}
            >
              {soysauce && (
                <div
                  style={{
                    transform: "scale(1.4)",
                  }}
                >
                  <VoronoiCircles
                    wh={["100px", "100px"]}
                    key={"example-1"}
                    data={soysauce}
                    circlePolygon={circlePolygon}
                    isPlaying={isPlaying}
                    setIsPlaying={setIsPlaying}
                  />
                </div>
              )}
              <p style={{ width: "30%", letterSpacing: " 0.1em" }}>
                It&apos;s three main microorganism types,
                <span className={`${styles.pill} ${styles.yeast}`}>yeast,</span>
                <span className={`${styles.pill} ${styles.mold}`}>mold</span>
                and
                <span className={`${styles.pill} ${styles.bacilli}`}>
                  bacilli,{" "}
                </span>
                come together to create the rich, salty, umami taste-harmony we
                know as soy sauce.
              </p>
            </div>
          </div>
        </motion.div>
        <h1
          style={{
            textAlign: "center",
            marginBottom: "40px",

            fontSize: "2em",
          }}
        >
          Explore the melody of other ferments below.
        </h1>
        <div className={styles.voronoiGrid}>
          {data &&
            data.map((data, i) => (
              <>
                <div key={i} className={styles.voronoiCell}>
                  <VoronoiCircles
                    wh={["100px", "100px"]}
                    data={data}
                    key={i.toString()}
                    circlePolygon={circlePolygon}
                    isPlaying={isPlaying}
                    setIsPlaying={setIsPlaying}
                  />
                  <span>{(data as any).ferment}</span>
                </div>
              </>
            ))}
        </div>
      </PlayerContext.Provider>
      <div>
        <h1 style={{ fontFamily: "Margo Condensed" }}>Motivation</h1>
        <div style={{ lineHeight: "1.66em", width: "50%", fontSize: "16px" }}>
          <ReactMarkdown
            components={{
              a: ({ node, ...props }) => (
                <a
                  className={styles.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  {...props}
                />
              ),
            }}
          >
            {explanation}
          </ReactMarkdown>
        </div>
      </div>
      <div style={{ float: "right", fontSize: "10px" }}>
        © 2023 <a href="http://www.datagrazing.com">Max Graze</a>
      </div>
    </main>
  );
}
