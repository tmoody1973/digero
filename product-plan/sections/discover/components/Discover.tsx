import { useState } from 'react'
import type { DiscoverProps, Category } from '../types'
import { VideoCard } from './VideoCard'
import { ChannelCard } from './ChannelCard'
import { CategoryChip } from './CategoryChip'

export function Discover({
  channels,
  feedVideos,
  categories,
  viewMode = 'feed',
  onViewModeChange,
  searchQuery = '',
  onSearch,
  onViewChannel,
  onFollow,
  onUnfollow,
  onWatchVideo,
  onSaveRecipe,
  onSelectCategory
}: DiscoverProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [channelFilter, setChannelFilter] = useState<'all' | 'following' | 'featured'>('all')

  const followedChannels = channels.filter(c => c.isFollowing)
  const featuredChannels = channels.filter(c => c.isFeatured)
  const suggestedChannels = channels.filter(c => !c.isFollowing)

  // Filter channels based on search, category, and filter
  const filteredChannels = channels.filter(channel => {
    const matchesSearch = !searchQuery ||
      channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      channel.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = !selectedCategory || channel.category === categories.find(c => c.id === selectedCategory)?.name

    const matchesFilter =
      channelFilter === 'all' ||
      (channelFilter === 'following' && channel.isFollowing) ||
      (channelFilter === 'featured' && channel.isFeatured)

    return matchesSearch && matchesCategory && matchesFilter
  })

  const handleCategorySelect = (category: Category) => {
    const newSelection = selectedCategory === category.id ? null : category.id
    setSelectedCategory(newSelection)
    onSelectCategory?.(category.id)
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-stone-900/80 backdrop-blur-lg border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-4xl mx-auto px-4">
          {/* Title and Search */}
          <div className="py-4">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-stone-900 dark:text-white">Discover</h1>
              <span className="text-sm text-stone-500 dark:text-stone-400">
                {followedChannels.length} following
              </span>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearch?.(e.target.value)}
                placeholder="Search channels..."
                className="w-full pl-10 pr-4 py-2.5 bg-stone-100 dark:bg-stone-800 border-0 rounded-xl text-stone-900 dark:text-white placeholder:text-stone-400 focus:ring-2 focus:ring-orange-500 transition-all"
              />
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 pb-3">
            <button
              onClick={() => onViewModeChange?.('feed')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                viewMode === 'feed'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Video Feed
              </span>
            </button>
            <button
              onClick={() => onViewModeChange?.('channels')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all ${
                viewMode === 'channels'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Channels
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {viewMode === 'feed' ? (
          /* Video Feed View */
          <div className="space-y-6">
            {feedVideos.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-stone-900 dark:text-white text-lg mb-2">No videos yet</h3>
                <p className="text-stone-500 dark:text-stone-400 mb-4">
                  Follow some channels to see their latest videos here
                </p>
                <button
                  onClick={() => onViewModeChange?.('channels')}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors"
                >
                  Browse Channels
                </button>
              </div>
            ) : (
              <div className="grid gap-6">
                {feedVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onWatch={() => onWatchVideo?.(video.id)}
                    onSave={() => onSaveRecipe?.(video.id)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Channels View */
          <div className="space-y-8">
            {/* Category Chips */}
            <div className="overflow-x-auto -mx-4 px-4 pb-2">
              <div className="flex gap-2 min-w-max">
                {categories.map((category) => (
                  <CategoryChip
                    key={category.id}
                    category={category}
                    isSelected={selectedCategory === category.id}
                    onSelect={() => handleCategorySelect(category)}
                  />
                ))}
              </div>
            </div>

            {/* Channel Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800 rounded-lg w-fit">
              {[
                { id: 'all', label: 'All' },
                { id: 'following', label: `Following (${followedChannels.length})` },
                { id: 'featured', label: 'Featured' }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setChannelFilter(filter.id as typeof channelFilter)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    channelFilter === filter.id
                      ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-sm'
                      : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Featured Channels Section (only when not filtered) */}
            {channelFilter === 'all' && !selectedCategory && !searchQuery && (
              <section>
                <h2 className="text-lg font-bold text-stone-900 dark:text-white mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  Featured Creators
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {featuredChannels.slice(0, 4).map((channel) => (
                    <ChannelCard
                      key={channel.id}
                      channel={channel}
                      onView={() => onViewChannel?.(channel.id)}
                      onFollow={() => onFollow?.(channel.id)}
                      onUnfollow={() => onUnfollow?.(channel.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Channels Grid */}
            <section>
              {channelFilter !== 'all' || selectedCategory || searchQuery ? (
                <>
                  <h2 className="text-lg font-bold text-stone-900 dark:text-white mb-4">
                    {filteredChannels.length} {filteredChannels.length === 1 ? 'Channel' : 'Channels'}
                    {selectedCategory && ` in ${categories.find(c => c.id === selectedCategory)?.name}`}
                  </h2>
                  {filteredChannels.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-stone-500 dark:text-stone-400">No channels found</p>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {filteredChannels.map((channel) => (
                        <ChannelCard
                          key={channel.id}
                          channel={channel}
                          onView={() => onViewChannel?.(channel.id)}
                          onFollow={() => onFollow?.(channel.id)}
                          onUnfollow={() => onUnfollow?.(channel.id)}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Suggested for You */}
                  <h2 className="text-lg font-bold text-stone-900 dark:text-white mb-4">
                    Suggested for You
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {suggestedChannels.map((channel) => (
                      <ChannelCard
                        key={channel.id}
                        channel={channel}
                        onView={() => onViewChannel?.(channel.id)}
                        onFollow={() => onFollow?.(channel.id)}
                        onUnfollow={() => onUnfollow?.(channel.id)}
                      />
                    ))}
                  </div>
                </>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
