"use client";
import styles from "./lib/styles/VoronoiWrapper.module.scss";
import "./page.module.css";
import { useEffect, useState } from "react";
import VoronoiCircles from "./components/VoronoiCircles";
import {
  FermentData,
  circularPolygon,
  legendData,
  PlayerContext,
} from "./lib/utils";
import dynamic from "next/dynamic";
import { explanation } from "./lib/motivation";
import ReactMarkdown from "react-markdown";

const Sonification = dynamic(() => import("./components/Sonification"), {
  ssr: false,
});

export default function Home() {
  const [players, setPlayers] = useState<any>({});
  const [data, setData] = useState<FermentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  function checkMobile() {
    setIsMobile(window.innerWidth <= 768);
  }
  useEffect(() => {
    checkMobile();

    window.addEventListener("resize", checkMobile);

    fetch("data/groupedByFerment.json")
      .then((response) => response.json())
      .then((data) => setData(data))
      .then(() => setIsLoading(false));

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

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
  const cellWidth2 = (width2 - margin.left - margin.right) / columns2;
  const cellHeight2 = (height2 - margin.top - margin.bottom) / columns2;

  let circlePolygon2 = circularPolygon(
    [cellWidth2 / 2, cellHeight2 / 2],
    Math.min(cellWidth2, cellHeight2) / 2,
    100
  );

  const value = { players, setPlayers };
  return (
    <main>
      <div className={styles.container}>
        <PlayerContext.Provider value={value}>
          <div>
            {/* <div style={{ display: "flex" }}> */}
            <h1
              style={{
                fontFamily: "Margo Condensed",
                fontSize: "3.5em",
                marginTop: "60px",
                marginBottom: "40px",
              }}
            >
              Microbial Symphony
            </h1>
            <div
              style={{
                alignItems: "center",
                paddingRight: "20px",
                display: "flex",
              }}
            >
              <div
                style={{
                  paddingRight: "20px",
                }}
              >
                <h2
                  style={{
                    fontFamily: "Figtree",
                    fontSize: "1.5em",
                    marginTop: "60px",
                    // marginBottom: "40px",
                    // paddingRight: "600px",
                  }}
                >
                  Uncover the symphony of microorganisms hidden within your
                  favorite foods by hovering over a circle.
                </h2>
                <p
                  style={{
                    fontFamily: "Figtree",
                    marginBottom: "40px",
                    lineHeight: "1.66em",
                    // paddingRight: "600px",
                  }}
                >
                  As complex fungi, yeast & molds are attributed more complex
                  sounds over their bacteria counterparts, lactic acid, bacilli,
                  and acetic acid. Together, these five constitute the core
                  fermentation microorganisms.
                </p>
              </div>
              <Sonification />
              <div className={styles.legend}>
                {/* <span className={styles.legendText}>Legend</span> */}
                <div>
                  {legendData &&
                    legendData.map((organism, i) => (
                      <div key={i} className={styles.legendItems}>
                        <VoronoiCircles
                          data={organism}
                          circlePolygon={circlePolygon2}
                          legend={true}
                        />
                        <span>{organism.ferment}</span>
                      </div>
                    ))}
                </div>
              </div>
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
                  />
                </div>
              ))}
          </div>
        </PlayerContext.Provider>
        <div>
          <h1 style={{ fontFamily: "Margo Condensed" }}>Motivation</h1>
          <p style={{ lineHeight: "1.66em", width: "50%", fontSize: "16px" }}>
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
          </p>
        </div>
        <div style={{ float: "right", fontSize: "10px" }}>
          © 2023 <a href="datagrazing.com">Max Graze</a>
        </div>
      </div>
    </main>
  );
}
