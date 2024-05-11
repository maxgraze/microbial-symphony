"use client";
import styles from "./lib/styles/VoronoiWrapper.module.scss";
import "./page.module.css";
import { useEffect, useMemo, useRef, useState, useReducer } from "react";
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
import useFetchData from "./lib/hooks/useFetchData";
import useCheckMobile from "./lib/hooks/useCheckMobile";
import { initialState, reducer } from "./lib/PlayerContext";
import {
  DetailedDescription,
  Introduction,
  MicroorganismInfo,
} from "./components/Text";

const Sonification = dynamic(() => import("./components/Sonification"), {
  ssr: false, // Disable server-side rendering for Sonification
});

export default function Home() {
  const isMobile = useCheckMobile();

  // if (isMobile)
  //   <div
  //     style={{
  //       fontFamily: "Figtree",
  //       fontSize: "2em",
  //       margin: "60px 40px",
  //       lineHeight: "1.66em",
  //     }}
  //   >
  //     Sorry! This experience is currently only available on desktop.
  //   </div>;

  const [players, setPlayers] = useState<any>({});
  const [isPlaying, setIsPlaying] = useState(true); //change to false
  const [isFixed, setIsFixed] = useState(false); // State to toggle fixed positioning
  const { data, isLoading } = useFetchData();
  const [state, dispatch] = useReducer(reducer, initialState);

  const { activeItem, displayData } = state;

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

  const handleLegendClick = (legendItem: FermentDataItem) => {
    const newActiveItem =
      legendItem.ferment === activeItem ? null : legendItem.ferment;
    dispatch({ type: "SET_ACTIVE_ITEM", payload: newActiveItem });
  };

  useEffect(() => {
    dispatch({ type: "SET_DISPLAY_DATA", payload: filteredData });
  }, [filteredData, dispatch]);

  useEffect(() => {
    requestAnimationFrame(() => {
      dispatch({ type: "DOM_READY", payload: true });
    });
  }, [dispatch]);

  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch({ type: "TOGGLE_DRAWER" });
  }, []);

  const handleCloseDrawer = () => {
    dispatch({ type: "TOGGLE_DRAWER" });
  };

  const handleEnableSound = async () => {
    setIsPlaying(true);
    dispatch({ type: "TOGGLE_DRAWER" });

    // setAudioReady(true);
  };

  const handleDisableSound = () => {
    setIsPlaying(false);
    dispatch({ type: "TOGGLE_DRAWER" });
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

  return (
    <main className={styles.container}>
      <SoundPreferenceDrawer
        isOpen={state.showDrawer}
        onClose={handleCloseDrawer}
        onEnableSound={handleEnableSound}
        onDisableSound={handleDisableSound}
      />
      <PlayerContext.Provider
        value={{ players, setPlayers, isPlaying, setIsPlaying }}
      >
        <Sonification />

        <motion.div ref={pageRef} layout={true}>
          <Introduction />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "40px",
            }}
          >
            <MicroorganismInfo isMobile={isMobile} />
            <Legend
              legendData={legendData}
              handleLegendClick={handleLegendClick}
              isFixed={isFixed}
              isMobile={isMobile}
              activeItem={activeItem}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
              setIsFixed={setIsFixed}
            />
            <DetailedDescription isMobile={isMobile} />
          </div>
          <div className={styles.soysauceDiv}>
            <h1
              style={{
                fontSize: "2em",
              }}
            >
              What does soy sauce sound like?
            </h1>
            <div>
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
                    isMobile={isMobile}
                  />
                </div>
              )}
              <p>
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
                    isMobile={isMobile}
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
        <div>
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
      <div style={{ float: isMobile ? "right" : undefined }}>
        © 2024 &nbsp; <a href="http://www.datagrazing.com"> Max Graze</a>
      </div>
    </main>
  );
}
