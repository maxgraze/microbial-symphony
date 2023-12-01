import Image from "next/image";
import styles from "./page.module.css";
import Sonification from "./components/Sonification";
import VoronoiWrapper from "./components/VoronoiWrapper";

export default function Home() {
  return (
    <main>
      <div>
        {/* <Sonification /> */}
        <VoronoiWrapper />
      </div>
    </main>
  );
}
