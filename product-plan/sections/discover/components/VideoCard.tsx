import type { FeedVideo } from '../types'

interface VideoCardProps {
  video: FeedVideo
  onWatch?: () => void
  onSave?: () => void
}

function formatViewCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M views`
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(0)}K views`
  }
  return `${count} views`
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}

export function VideoCard({ video, onWatch, onSave }: VideoCardProps) {
  return (
    <div className="group">
      {/* Thumbnail Container */}
      <div
        className="relative aspect-video rounded-xl overflow-hidden cursor-pointer mb-3"
        onClick={onWatch}
      >
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 rounded">
          {video.duration}
        </div>

        {/* Play Overlay on Hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
            <svg className="w-6 h-6 text-stone-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        {/* Save Recipe Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onSave?.()
          }}
          className="absolute top-2 right-2 w-9 h-9 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110"
          title="Save as Recipe"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Video Info */}
      <div className="flex gap-3">
        {/* Channel Avatar */}
        <button
          className="flex-shrink-0 w-9 h-9 rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden hover:ring-2 hover:ring-orange-500 transition-all"
          onClick={(e) => {
            e.stopPropagation()
            // Could navigate to channel
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold text-sm">
            {video.channelName.charAt(0)}
          </div>
        </button>

        {/* Title and Meta */}
        <div className="flex-1 min-w-0">
          <h3
            className="font-semibold text-stone-900 dark:text-white text-sm leading-tight line-clamp-2 cursor-pointer hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            onClick={onWatch}
          >
            {video.title}
          </h3>
          <p className="text-stone-500 dark:text-stone-400 text-xs mt-1">
            {video.channelName}
          </p>
          <p className="text-stone-400 dark:text-stone-500 text-xs">
            {formatViewCount(video.viewCount)} • {formatTimeAgo(video.publishedAt)}
          </p>
        </div>
      </div>
    </div>
  )
}
