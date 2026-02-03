import type { Channel } from '../types'

interface ChannelCardProps {
  channel: Channel
  onView?: () => void
  onFollow?: () => void
  onUnfollow?: () => void
}

function formatSubscriberCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(0)}K`
  }
  return count.toString()
}

export function ChannelCard({ channel, onView, onFollow, onUnfollow }: ChannelCardProps) {
  return (
    <div
      className="group bg-white dark:bg-stone-800 rounded-2xl border border-stone-200 dark:border-stone-700 overflow-hidden hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-lg transition-all cursor-pointer"
      onClick={onView}
    >
      {/* Recent Videos Thumbnails - 3 stacked */}
      <div className="relative h-24 bg-stone-100 dark:bg-stone-900">
        <div className="absolute inset-0 flex gap-0.5">
          {channel.recentVideos.slice(0, 3).map((video, idx) => (
            <div
              key={video.id}
              className="flex-1 relative overflow-hidden"
              style={{ opacity: 1 - idx * 0.15 }}
            >
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover"
              />
              {idx === 0 && (
                <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-medium px-1 py-0.5 rounded">
                  {video.duration}
                </div>
              )}
            </div>
          ))}
          {channel.recentVideos.length < 3 && (
            Array(3 - channel.recentVideos.length).fill(0).map((_, idx) => (
              <div key={`empty-${idx}`} className="flex-1 bg-stone-200 dark:bg-stone-800" />
            ))
          )}
        </div>

        {/* Featured Badge */}
        {channel.isFeatured && (
          <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
            Featured
          </div>
        )}
      </div>

      {/* Channel Info */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
            {channel.name.charAt(0)}
          </div>

          {/* Name and Stats */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-stone-900 dark:text-white truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
              {channel.name}
            </h3>
            <p className="text-stone-500 dark:text-stone-400 text-sm">
              {formatSubscriberCount(channel.subscriberCount)} subscribers
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-stone-600 dark:text-stone-400 text-sm mt-3 line-clamp-2">
          {channel.description}
        </p>

        {/* Category Tag */}
        <div className="mt-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-700 px-2 py-1 rounded-full">
            {channel.category}
          </span>

          {/* Follow Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              channel.isFollowing ? onUnfollow?.() : onFollow?.()
            }}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              channel.isFollowing
                ? 'bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400'
                : 'bg-orange-500 text-white hover:bg-orange-600 shadow-sm'
            }`}
          >
            {channel.isFollowing ? 'Following' : 'Follow'}
          </button>
        </div>
      </div>
    </div>
  )
}
