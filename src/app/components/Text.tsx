import styles from "../lib/styles/VoronoiWrapper.module.scss";

export const Introduction = () => (
  <div className={styles.display}>
    <h1>Microbial Symphony</h1>
    <p style={{ fontSize: "1.3em", marginTop: "20px" }}>
      Uncover the symphony of microorganisms hidden within your favorite foods.
    </p>
  </div>
);

export const MicroorganismInfo = ({ isMobile }: any) => (
  <div
    style={{
      fontSize: "1em",
      fontStyle: "italic",
      marginTop: "20px",
      textAlign: isMobile && "center",
    }}
  >
    {isMobile ? "Click a circle to toggle the sound" : "Hover over a circle."}
  </div>
);

export const DetailedDescription = ({ isMobile }: any) => (
  <p
    style={{
      fontSize: "1em",
      marginTop: isMobile ? "0" : "100px",
      width: isMobile ? "90%" : "50%",
    }}
  >
    <b>
      These five microorganisms are the most prevalent types in fermentation.
    </b>
    <br />
    <br />
    Imagine you are sitting alongside the Seine canal in Paris, enjoying an
    aperitif in the gentle warmth of the sun: you picked out a crusty baguette,
    risen with <span className={`${styles.pill} ${styles.yeast}`}>yeast,</span>
    topped it with rich brie—its creamy tang courtesy of
    <span className={`${styles.pill} ${styles.lactic_acid_bacteria}`}>
      lactic acid bacteria,
    </span>
    and protective layer of
    <span className={`${styles.pill} ${styles.mold}`}>mold.</span>
    Alongside, you savor cornichons, their satisfying crunch and tartness,
    brought to you by
    <span className={`${styles.pill} ${styles.acetic_acid_bacteria}`}>
      acetic acid bacteria.
    </span>
    <br />
    <br />
    They are our unseen collaborators of fermentation and flavor.
  </p>
);
