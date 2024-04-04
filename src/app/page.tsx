"use client";
import styles from "./lib/styles/VoronoiWrapper.module.scss";
import "./page.module.css";
import { useEffect, useRef, useState } from "react";
import {
  FermentData,
  circularPolygon,
  legendData,
  PlayerContext,
  useSticky,
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
  useScroll,
  useAnimation,
  useTransform,
} from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";

const Sonification = dynamic(() => import("./components/Sonification"), {
  ssr: false, // Disable server-side rendering for Sonification
});

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const [players, setPlayers] = useState<any>({});
  const [data, setData] = useState<FermentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [style, setStyle] = useState(false);

  const controls = useAnimation();

  // const container = useSticky<HTMLDivElement>();

  const [isSticky, setIsSticky] = useState(false);
  const logoRef = useRef<HTMLDivElement>(null);

  console.log("Before useEffect:", logoRef.current);

  useEffect(() => {
    setTimeout(() => {
      if (logoRef.current) {
        console.log("Ref is now available", logoRef.current);
        let logoTl = gsap.timeline({
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: () => window.innerHeight * 1.2,
            scrub: 0.6,
            markers: true, // Add this for debugging
          },
        });

        logoTl.fromTo(
          logoRef.current,
          {
            top: "20vw",
            yPercent: -50,
            scale: 1.7,
          },
          {
            top: "2vw",
            yPercent: 0,
            scale: 1,
            duration: 0.8,
          }
        );
      }

      // return () => {
      //   ScrollTrigger.getAll().forEach((trigger) => trigger.kill()); // Clean up triggers
      // };
    }, 500);
  }, []);

  // const { scrollYProgress } = useScroll(); // Tracks the scroll position
  // const y = useTransform(scrollYProgress, [0, 200], [0, -200]);

  // const variants = {
  //   initial: {
  //     scale: 1,
  //     opacity: 0.5,
  //     transition: { duration: 0.5 },
  //   },
  //   sticky: {
  //     scale: 0.8,
  //     opacity: 1,
  //     transition: { duration: 0.5 },
  //   },
  // };

  // useEffect(() => {
  //   const handleScroll = () => {
  //     const threshold = 100; // Set a threshold for the sticky effect
  //     setIsSticky(window.scrollY > threshold);
  //   };

  //   window.addEventListener("scroll", handleScroll);
  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, []);

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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const margin = { top: 10, right: 10, bottom: 10, left: 10 };

  const height = 1000;
  const width = 1000;
  const columns = 12;
  const cellWidth = (width - margin.left - margin.right) / columns;
  const cellHeight = (height - margin.top - margin.bottom) / columns;

  let circlePolygon = circularPolygon(
    [cellWidth / 2, cellHeight / 2],
    Math.min(cellWidth, cellHeight) / 2,
    100
  );
  const height2 = 200;
  const width2 = 200;
  const columns2 = 5;
  const cellWidth2 = width2 / columns2;
  const cellHeight2 = height2 / columns2;

  let circlePolygon2 = circularPolygon(
    [cellWidth2 / 2, cellHeight2 / 2],
    Math.min(cellWidth2, cellHeight2) / 2,
    100
  );

  const value = { players, setPlayers };
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
        <div className={styles.container}>
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
                marginTop: " 20px",
              }}
            >
              {" "}
              Uncover the symphony of microorganisms hidden within your favorite
              foods by hovering over a circle.
            </p>
          </div>
          <Sonification />
          <div ref={logoRef} className={styles.stickyNav}>
            <div

            // className={` ${isSticky ? styles.stickyNav : ""}`}
            // initial={{ scale: 1 }}
            // animate={{ scale: isShrunk ? 0.5 : 1 }}
            // transition={{ duration: 0.3 }}
            >
              <div className={styles.legend}>
                {legendData.map((organism, i) => (
                  <div key={organism.ferment} className={styles.legendItems}>
                    <VoronoiCircles
                      data={organism}
                      circlePolygon={circlePolygon2}
                      legend={true}
                      isPlaying={isPlaying}
                      setIsPlaying={setIsPlaying}
                    />
                    <span>
                      {organism.ferment.split(" ").slice(0, 2).join(" ")}
                      <br />
                      {organism.ferment.split(" ").slice(2).join(" ")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <h1
              style={{
                // fontFamily: "Margo Condensed",
                fontSize: "2em",
                paddingBottom: "20px",
                paddingTop: "20px",
              }}
            >
              What does a baguette sound like?
            </h1>
            {/* <div className={styles.navCircles}>
              {legendData &&
                legendData.map((organism, i) => (
                  <div key={organism.ferment} className={styles.navCircles}>
                    <Circles
                      data={organism}
                      i={i}
                      isPlaying={isPlaying}
                      setIsPlaying={setIsPlaying}
                    />
                    <span>
                      {organism.ferment.split(" ").slice(0, 2).join(" ")}
                      <br />
                      {organism.ferment.split(" ").slice(2).join(" ")}
                    </span>{" "}
                  </div>
                ))}
            </div> */}
          </div>
        </div>
        <div className={styles.voronoiGrid}>
          {data &&
            data.map((data, i) => (
              <div key={i} className={styles.voronoiCell}>
                <VoronoiCircles
                  data={data}
                  key={i}
                  circlePolygon={circlePolygon}
                  isPlaying={isPlaying}
                  setIsPlaying={setIsPlaying}
                />
              </div>
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
