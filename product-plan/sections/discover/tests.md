# Discover Tests

Test specifications for the Discover section.

## User Flow Tests

### Follow a Channel

1. Switch to "Channels" view
2. Browse or search for a channel
3. Tap "Follow" button on a channel card
4. **Assert:** Button changes to "Following"
5. Switch to "Feed" view
6. **Assert:** Videos from followed channel appear

### Unfollow a Channel

1. Find a followed channel
2. Tap "Following" button
3. **Assert:** Button changes back to "Follow"
4. **Assert:** Channel's videos removed from feed

### Save Recipe from Video

1. In Feed view, hover/tap a video card
2. Click save button (bookmark icon)
3. **Assert:** Recipe preview modal opens
4. **Assert:** AI-extracted recipe shows title, ingredients preview, instructions
5. Click "Save Recipe"
6. **Assert:** Recipe saved to library

### View Channel Detail

1. Tap a channel card
2. **Assert:** Channel page shows avatar, name, description
3. **Assert:** Recent videos display
4. **Assert:** Follow/unfollow button works

### Filter by Category

1. In Channels view, tap a category chip
2. **Assert:** Only channels in that category display
3. Tap the same chip again
4. **Assert:** Filter cleared, all channels display

## Empty State Tests

### No Followed Channels (Feed)

1. With no followed channels, view Feed
2. **Assert:** Empty state shows with CTA to browse channels

### No Search Results

1. Search for "xyznonexistent"
2. **Assert:** "No channels found" message displays

## Edge Cases

- Channel with no videos should show empty state
- Long channel names should truncate
- View counts should format correctly (1.2M, 500K, etc.)
