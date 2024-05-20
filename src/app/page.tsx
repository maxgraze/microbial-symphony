"use client";
import styles from "./lib/styles/VoronoiWrapper.module.scss";
import "./page.module.css";
import { useEffect, useMemo, useRef, useState, useContext } from "react";
import {
  circlePolygon,
  legendData,
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
import { PlayerContext } from "./lib/PlayerContext";

import {
  DetailedDescription,
  Introduction,
  MicroorganismInfo,
} from "./components/Text";
import * as Tone from "tone";

const Sonification = dynamic(() => import("./components/Sonification"), {
  ssr: false, // Disable server-side rendering for Sonification
});

export default function Home() {
  const isMobile = useCheckMobile();

  const [isFixed, setIsFixed] = useState(false); // State to toggle fixed positioning
  const { data } = useFetchData();
  const { state, dispatch } = useContext(PlayerContext);

  const { activeItem, displayData, isPlaying } = state;

  const filteredData = useMemo(() => {
    if (!activeItem) return data;

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
    // Simulate data loading
    setTimeout(() => {
      dispatch({ type: "SET_LOADING", payload: false });
    }, 2000);

    dispatch({ type: "OPEN_DRAWER" });
  }, [dispatch]);

  useEffect(() => {
    dispatch({ type: "OPEN_DRAWER" });
  }, [dispatch]);
  const pageRef = useRef<HTMLDivElement>(null);

  const closeDrawer = () => dispatch({ type: "CLOSE_DRAWER" });

  const handleEnableSound = async () => {
    if (Tone.context.state !== "running") {
      try {
        await Tone.start();
        console.log("Audio is ready");
      } catch (error) {
        console.error("Failed to start audio:", error);
      }
    }
    dispatch({ type: "TOGGLE_PLAYING", payload: true });
    closeDrawer();
  };

  const handleDisableSound = () => {
    dispatch({ type: "TOGGLE_PLAYING", payload: false });
    closeDrawer();
  };

  useEffect(() => {
    if (state.isPlaying) {
      Tone.Transport.start();
    } else {
      console.log(state.isPlaying);
      Tone.Transport.stop();
    }
  }, [state.isPlaying]);

  if (state.isLoading) {
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
        isMobile={isMobile}
        onClose={closeDrawer}
        onEnableSound={handleEnableSound}
        onDisableSound={handleDisableSound}
      />

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
                  isMobile={isMobile}
                />
              </div>
            )}
            <p>
              <span className={`${styles.pill} ${styles.yeast}`}>Yeast,</span>
              <span className={`${styles.pill} ${styles.mold}`}>mold</span>
              and
              <span className={`${styles.pill} ${styles.bacilli}`}>
                bacilli{" "}
              </span>
              come together to create this rich, salty, umami taste-harmony we
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
