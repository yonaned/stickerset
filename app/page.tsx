"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import dynamic from "next/dynamic";
import pako from "pako";

const Lottie = dynamic(() => import("react-lottie-player"), { ssr: false });

const BOT_TOKEN = "7761265601:AAEUF4M3tv_q7O5SzpSrmpqzk55i7jxrBEE";
const STICKER_SET_NAME = "StealthMoon";

type Sticker = {
  type: "static" | "animated" | "video";
  filePath: string;
  lottieJson?: any; // Stores the converted JSON for Lottie
};

export default function Home() {
  const [stickers, setStickers] = useState<Sticker[]>([]);

  useEffect(() => {
    async function fetchStickers() {
      try {
        const response = await axios.get(
          `https://api.telegram.org/bot${BOT_TOKEN}/getStickerSet?name=${STICKER_SET_NAME}`
        );

        if (response.data.ok) {
          const stickerList = response.data.result.stickers;
          const stickerFiles: Sticker[] = [];

          for (const sticker of stickerList) {
            const fileResponse = await axios.get(
              `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${sticker.file_id}`
            );

            if (fileResponse.data.ok) {
              const filePath = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileResponse.data.result.file_path}`;

              if (sticker.is_animated) {
                // Convert .tgs to Lottie JSON
                const lottieJson = await convertTgsToLottie(filePath);
                stickerFiles.push({ type: "animated", filePath, lottieJson });
              } else {
                stickerFiles.push({
                  type: sticker.is_video ? "video" : "static",
                  filePath,
                });
              }
            }
          }

          setStickers(stickerFiles);
        } else {
          console.error("Failed to fetch stickers:", response.data);
        }
      } catch (error) {
        console.error("Error fetching stickers:", error);
      }
    }

    fetchStickers();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">StealthMoon Stickers</h1>
      <div className="grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-5">
        {stickers.map((sticker, index) => (
          <div key={index} className="w-24 h-24 flex items-center justify-center bg-white rounded-lg shadow-md p-2">
            {sticker.type === "static" && (
              <img src={sticker.filePath} alt="Sticker" className="max-w-full max-h-full" />
            )}
            {sticker.type === "animated" && sticker.lottieJson && (
              <Lottie play loop animationData={sticker.lottieJson} className="w-20 h-20" />
            )}
            {sticker.type === "video" && (
              <video autoPlay loop muted playsInline className="w-20 h-20">
                <source src={sticker.filePath} type="video/webm" />
              </video>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Function to fetch and convert .tgs to Lottie JSON
async function convertTgsToLottie(tgsUrl: string): Promise<any> {
  try {
    const response = await axios.get(tgsUrl, { responseType: "arraybuffer" });
    const decompressed = pako.inflate(new Uint8Array(response.data), { to: "string" });
    return JSON.parse(decompressed);
  } catch (error) {
    console.error("Error converting .tgs to Lottie JSON:", error);
    return null;
  }
}
