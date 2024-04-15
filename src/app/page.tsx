"use client";
import styles from "./lib/styles/VoronoiWrapper.module.scss";
import "./page.module.css";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  circlePolygon,
  legendData,
  PlayerContext,
  soysauce,
  containerVariants,
  childVariants,
} from "./lib/utils";
import { FermentData, FermentDataItem } from "./lib/types";
import dynamic from "next/dynamic";
import { explanation } from "./lib/motivation";
import ReactMarkdown from "react-markdown";
import VoronoiCircles from "./components/VoronoiCircles";
import { motion, AnimatePresence } from "framer-motion";
import React from "react";
import SoundPreferenceDrawer from "./components/SoundPreferenceDrawer";
import Legend from "./components/Legend";

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
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [displayData, setDisplayData] = useState<FermentData[]>([]);
  const filteredData = useMemo(() => {
    if (!activeItem) return data; // No item selected, return full dataset

    const targetOrganism =
      activeItem.toLowerCase() === "other microorganism"
        ? "other"
        : activeItem.toLowerCase();

    return data.filter((item: any) =>
      item.children.some(
        (child: { type: string }) => child.type.toLowerCase() === targetOrganism
      )
    );
  }, [activeItem, data]);
  useEffect(() => {
    setDisplayData(filteredData);
  }, [filteredData]);

  const handleLegendClick = (legendItem: FermentDataItem) => {
    const newActiveItem =
      legendItem.ferment === activeItem ? null : legendItem.ferment;
    setActiveItem(newActiveItem);
  };

  const id = React.useId();
  useEffect(() => {
    // This simply waits for the next tick of the event loop, after the DOM updates.
    requestAnimationFrame(() => setDOMReady(true));
  }, []);
  const pageRef = useRef<HTMLDivElement>(null);

  function checkMobile() {
    setIsMobile(window.innerWidth <= 768);
  }
  useEffect(() => {
    checkMobile();
    setShowDrawer(true);

    window.addEventListener("resize", checkMobile);

    const fetchData = async () => {
      const response = await fetch("data/groupedByFerment.json");
      const jsonData = await response.json();
      setData(jsonData);
      setDisplayData(jsonData);
      setIsLoading(false);
    };

    fetchData();
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
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "100px",
        }}
      >
        The moment that it takes to you read this sentence...
      </div>
    );
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
    <main className={styles.container}>
      <SoundPreferenceDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        onEnableSound={handleEnableSound}
        onDisableSound={handleDisableSound}
      />
      <PlayerContext.Provider
        value={{ players, setPlayers, isPlaying, setIsPlaying }}
      >
        <Sonification />

        <motion.div ref={pageRef} layout={true}>
          <div className={styles.display}>
            <h1
              style={{
                fontFamily: "Margo Condensed",
                fontSize: "8em",
                paddingBottom: "20px",
                letterSpacing: ".4rem",
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
                fontStyle: "italic",
                marginTop: " 20px",
              }}
            >
              {" "}
              Hover over a circle.
            </p>

            <Legend
              legendData={legendData}
              handleLegendClick={handleLegendClick}
              isFixed={isFixed}
              activeItem={activeItem}
              isPlaying={isPlaying} // Assuming isPlaying is defined in the parent component
              setIsPlaying={setIsPlaying} // Assuming setIsPlaying is defined in the parent component
              setIsFixed={setIsFixed} // Assuming setIsPlaying is defined in the parent component
            />
            <p
              style={{
                fontSize: "1em",
                marginTop: "100px",
                width: "50%",
              }}
            >
              {" "}
              <b>
                These five microorganisms are the most prevelant types in
                fermentation.{" "}
              </b>
              <br />
              <br /> Imagine you are sitting alongside the Seine canal in Paris,
              enjoying an aperatif in the gentle warmth of the sun: you picked
              out a crusty baguette, risen with{" "}
              <span className={`${styles.pill} ${styles.yeast}`}>yeast,</span>
              topped it with rich brie—its creamy tang courtesy of
              <span className={`${styles.pill} ${styles.lactic_acid_bacteria}`}>
                lactic acid bacteria,
              </span>{" "}
              and protective layer of{" "}
              <span className={`${styles.pill} ${styles.mold}`}>mold</span>
              Alongside, you savor cornichons, their satisfying crunch and
              tartness, brought to you by
              <span className={`${styles.pill} ${styles.acetic_acid_bacteria}`}>
                acetic acid bacteria.
              </span>
              <br />
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
        <AnimatePresence>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit="hidden"
            layout
            className={styles.voronoiGrid}
          >
            {displayData &&
              displayData.map((data, i) => (
                <motion.div
                  variants={childVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  layout="position"
                  key={(data as any).ferment}
                  className={styles.voronoiCell}
                >
                  <VoronoiCircles
                    wh={["100px", "100px"]}
                    data={data}
                    key={(data as any).ferment}
                    circlePolygon={circlePolygon}
                    isPlaying={isPlaying}
                    setIsPlaying={setIsPlaying}
                  />
                  <span style={{ textAlign: "center", lineHeight: 1.3 }}>
                    {(data as any).ferment
                      .split(/(\([^)]+\))/)
                      .map((part: string, index: number) => (
                        <React.Fragment key={index}>
                          {index !== 0 && /\(/.test(part) && <br />}
                          {part}
                        </React.Fragment>
                      ))}
                  </span>
                </motion.div>
              ))}
          </motion.div>
        </AnimatePresence>
      </PlayerContext.Provider>
      <div className={styles.motivation}>
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
      <div>
        © 2023 &nbsp; <a href="http://www.datagrazing.com"> Max Graze</a>
      </div>
    </main>
  );
}
