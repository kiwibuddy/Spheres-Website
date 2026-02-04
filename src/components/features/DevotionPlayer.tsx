'use client'

import dynamic from 'next/dynamic'
import type { FC } from 'react'

const ReactPlayer = dynamic(() => import('react-player/youtube'), { ssr: false })

export interface DevotionPlayerProps {
  youtubeUrl: string
  devotionId: number
  onProgress: (percentage: number) => void
}

export const DevotionPlayer: FC<DevotionPlayerProps> = ({ youtubeUrl, devotionId, onProgress }) => {
  const handleProgress = (state: { played: number }) => {
    const percentage = Math.floor(state.played * 100)
    onProgress(percentage)
  }

  if (!youtubeUrl) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black/80 text-white">
        No video available
      </div>
    )
  }

  return (
    <div className="relative h-full w-full [&_iframe]:absolute [&_iframe]:left-0 [&_iframe]:top-0 [&_iframe]:h-full [&_iframe]:w-full">
      <ReactPlayer
        url={youtubeUrl}
        controls
        width="100%"
        height="100%"
        onProgress={handleProgress}
        progressInterval={10000}
      />
    </div>
  )
}
