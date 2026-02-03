import type { ChannelDetailProps } from '../types'

function formatSubscriberCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M subscribers`
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(0)}K subscribers`
  }
  return `${count} subscribers`
}

function formatViewCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(0)}K`
  }
  return count.toString()
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

export function ChannelDetail({
  channel,
  onFollow,
  onUnfollow,
  onWatchVideo,
  onSaveRecipe,
  onBack
}: ChannelDetailProps) {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      {/* Header with Banner */}
      <div className="relative">
        {/* Banner - Gradient background */}
        <div className="h-32 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600" />

        {/* Back Button */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 w-10 h-10 bg-black/30 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/40 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Channel Info Card - Overlapping */}
        <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-10">
          <div className="bg-white dark:bg-stone-900 rounded-2xl shadow-xl p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {channel.name.charAt(0)}
              </div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                  <h1 className="text-2xl font-bold text-stone-900 dark:text-white">
                    {channel.name}
                  </h1>
                  {channel.isFeatured && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-full">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      Featured
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-center sm:justify-start gap-4 mt-2 text-sm text-stone-500 dark:text-stone-400">
                  <span>{formatSubscriberCount(channel.subscriberCount)}</span>
                  <span>•</span>
                  <span>{channel.recentVideos.length} videos</span>
                  <span>•</span>
                  <span className="text-green-600 dark:text-green-400">{channel.category}</span>
                </div>

                <p className="text-stone-600 dark:text-stone-400 mt-3 max-w-xl">
                  {channel.description}
                </p>

                {/* Follow Button */}
                <div className="mt-4">
                  <button
                    onClick={channel.isFollowing ? onUnfollow : onFollow}
                    className={`px-8 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      channel.isFollowing
                        ? 'bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400'
                        : 'bg-orange-500 text-white hover:bg-orange-600 shadow-md'
                    }`}
                  >
                    {channel.isFollowing ? (
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Following
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Follow
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Videos Section */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-lg font-bold text-stone-900 dark:text-white mb-4">
          Latest Videos
        </h2>

        {channel.recentVideos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-stone-500 dark:text-stone-400">No videos yet</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {channel.recentVideos.map((video) => (
              <div key={video.id} className="group">
                {/* Thumbnail */}
                <div
                  className="relative aspect-video rounded-xl overflow-hidden cursor-pointer mb-3"
                  onClick={() => onWatchVideo?.(video.id)}
                >
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* Duration */}
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-medium px-1.5 py-0.5 rounded">
                    {video.duration}
                  </div>

                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                      <svg className="w-5 h-5 text-stone-900 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onSaveRecipe?.(video.id)
                    }}
                    className="absolute top-2 right-2 w-8 h-8 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                    title="Save as Recipe"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                {/* Video Info */}
                <h3
                  className="font-semibold text-stone-900 dark:text-white text-sm line-clamp-2 cursor-pointer hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                  onClick={() => onWatchVideo?.(video.id)}
                >
                  {video.title}
                </h3>
                <p className="text-stone-400 dark:text-stone-500 text-xs mt-1">
                  {formatViewCount(video.viewCount)} views • {formatTimeAgo(video.publishedAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
