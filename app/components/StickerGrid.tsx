
// app/components/StickerGrid.tsx
'use client';

import React, { useEffect, useState } from 'react';
import TgsPlayer from './TgsPlayer';

interface TelegramSticker {
  file_id: string;
  file_unique_id: string;
  type: string;
  thumb?: {
    file_id: string;
    file_unique_id: string;
    width: number;
    height: number;
    file_size?: number;
  };
  emoji?: string;
  set_name: string;
  file_size?: number;
}

interface TelegramResponse {
  ok: boolean;
  result: {
    name: string;
    title: string;
    sticker_type: string;
    stickers: TelegramSticker[];
  };
}

async function getStickers(botToken: string): Promise<TelegramResponse> {
  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/getStickerSet?name=Duck`,
    { next: { revalidate: 3600 } }
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch stickers');
  }
  
  return response.json();
}

export default function StickerGrid() {
  const [stickers, setStickers] = useState<TelegramSticker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStickers = async () => {
      try {
        const botToken = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
        if (!botToken) {
          throw new Error('Telegram bot token not configured');
        }

        const data = await getStickers(botToken);
        if (data.ok) {
          setStickers(data.result.stickers);
        } else {
          throw new Error('Failed to fetch stickers');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching stickers');
      } finally {
        setLoading(false);
      }
    };

    fetchStickers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Duck Sticker Collection</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {stickers.map((sticker) => {
          const tgsUrl = `https://api.telegram.org/file/bot${process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN}/${sticker.file_id}`;
          
          return (
            <div
              key={sticker.file_unique_id}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="aspect-square relative">
                <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded">
                  <TgsPlayer
                    source={tgsUrl}
                    className="w-full h-full"
                    autoplay
                    loop
                  />
                </div>
              </div>
              <div className="mt-2 text-center">
                <span className="text-lg">{sticker.emoji}</span>
                <p className="text-sm text-gray-600 truncate">{sticker.file_unique_id}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}