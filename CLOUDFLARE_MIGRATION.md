# Cloudflare Stream Migration Complete

This document summarizes the complete migration from Mux to Cloudflare Stream across all three project components.

## Overview
Successfully replaced Mux video streaming with Cloudflare Stream throughout:
- ✅ Backend API (Node.js/Express)
- ✅ Mobile App (React Native/Expo)
- ✅ Admin Dashboard (React/Vite)

## Backend Changes

### New Files Created
1. **`/backend/src/config/cloudflareStream.ts`** - Complete Cloudflare Stream API client
   - `requestUploadURL()` - Get upload URL and video ID
   - `getVideoDetails()` - Fetch video metadata
   - `deleteVideo()` - Remove video from Cloudflare
   - `listVideos()` - List all videos
   - `getPlaybackURL()` - Get HLS manifest URL
   - `getEmbedHTML()` - Get iframe embed code

### Modified Files

#### Models
- **`/backend/src/models/Movie.ts`**
  - Replaced `muxPlaybackId` and `muxAssetId` with single `cloudflareVideoId` field
  
- **`/backend/src/models/Series.ts`**
  - Replaced `muxPlaybackId` and `muxAssetId` in episode interface with `cloudflareVideoId`

#### Routes
- **`/backend/src/routes/adminRoutes.ts`**
  - Changed endpoint: `/mux-upload-url` → `/cloudflare-upload-url`
  - Updated validation to expect `cloudflareVideoId` instead of mux fields

#### Controllers
- **`/backend/src/controllers/adminController.ts`**
  - `getCloudflareUploadUrl()` - NEW: Replaces getMuxUploadUrl
  - `checkMediaIntegrations()` - Updated to check Cloudflare connectivity
  - `createMovie()` - Uses cloudflareVideoId validation
  - `deleteMovie()` - Calls Cloudflare delete API
  - `addEpisode()` - Validates Cloudflare video ID
  - `deleteSeries()` - Deletes videos from Cloudflare
  - `deleteEpisode()` - Removes video from Cloudflare

- **`/backend/src/controllers/contentController.ts`**
  - Removed all `.select('-muxAssetId')` calls (field no longer exists)
  - Updated premium content responses to hide `cloudflareVideoId` instead of mux fields

- **`/backend/src/controllers/userController.ts`**
  - Removed muxAssetId select exclusion from My List populate

### Environment Variables Required
Add to `/backend/.env`:
```env
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
```

## Mobile App Changes

### Modified Files
- **`/mobile/src/screens/VideoPlayerScreen.tsx`**
  - Replaced Mux Player web component with Cloudflare Stream iframe
  - Changed params: `playbackId`/`playbackToken` → `cloudflareVideoId`
  - Updated HTML to use Cloudflare Stream iframe embed
  - Implemented Cloudflare Stream postMessage API for player control
  - Supports: play/pause, seek (±10s), progress tracking, auto-resume

- **`/mobile/src/screens/MovieDetailScreen.tsx`**
  - Updated navigation to pass `cloudflareVideoId` instead of `muxPlaybackId`
  - Changed field check from `muxPlaybackId` to `cloudflareVideoId`

- **`/mobile/src/screens/SeriesDetailScreen.tsx`**
  - Updated episode playback to use `cloudflareVideoId`
  - Changed navigation params for VideoPlayer

### Video Player Features Maintained
- ✅ Double-tap left/right to seek ±10 seconds
- ✅ Center tap to play/pause
- ✅ Auto-hide controls after 4 seconds
- ✅ Resume from last watched position
- ✅ Progress tracking with backend sync
- ✅ Landscape orientation lock

## Admin Dashboard Changes

### Modified Files
- **`/admin/src/pages/Content.tsx`**
  - Updated `MoviePayload` interface: removed `muxPlaybackId`/`muxAssetId`, added `cloudflareVideoId`
  - Updated form validation to check for `cloudflareVideoId`
  - Replaced Mux ID input fields with single "Cloudflare Video ID" field
  - Added helper text: "Get this from Cloudflare Stream upload"

- **`/admin/src/pages/Series.tsx`**
  - Updated episode form state to use `cloudflareVideoId`
  - Replaced Mux ID fields with single Cloudflare Video ID input
  - Updated validation logic for episode creation
  - Fixed duplicate field issues from automated replacement

## Data Migration Required

### Database Updates Needed
Run these MongoDB commands to migrate existing data:

```javascript
// For Movies
db.movies.updateMany(
  { muxPlaybackId: { $exists: true } },
  [
    {
      $set: {
        cloudflareVideoId: "$muxPlaybackId"  // Or map to actual Cloudflare IDs
      }
    },
    {
      $unset: ["muxPlaybackId", "muxAssetId"]
    }
  ]
);

// For Series Episodes
db.series.updateMany(
  {},
  [
    {
      $set: {
        "seasons": {
          $map: {
            input: "$seasons",
            as: "season",
            in: {
              $mergeObjects: [
                "$$season",
                {
                  episodes: {
                    $map: {
                      input: "$$season.episodes",
                      as: "episode",
                      in: {
                        $mergeObjects: [
                          {
                            $unsetField: {
                              field: "muxAssetId",
                              input: {
                                $unsetField: {
                                  field: "muxPlaybackId",
                                  input: "$$episode"
                                }
                              }
                            }
                          },
                          {
                            cloudflareVideoId: "$$episode.muxPlaybackId"
                          }
                        ]
                      }
                    }
                  }
                }
              ]
            }
          }
        }
      }
    }
  ]
);
```

**Note:** The above mapping assumes reusing Mux IDs as placeholders. You'll need to:
1. Upload all videos to Cloudflare Stream
2. Get the new Cloudflare Video IDs
3. Map old Mux IDs to new Cloudflare IDs
4. Run proper migration scripts with the mapping

## Video Upload Workflow (Updated)

### 1. Get Upload URL
```bash
curl -X GET http://localhost:5000/api/admin/cloudflare-upload-url \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Response:
```json
{
  "success": true,
  "data": {
    "uploadURL": "https://upload.cloudflarestream.com/...",
    "videoId": "abc123xyz..."
  }
}
```

### 2. Upload Video
```bash
curl -X POST "UPLOAD_URL_FROM_STEP_1" \
  -F file=@/path/to/video.mp4
```

### 3. Create Movie/Episode
Use the `videoId` from step 1 as `cloudflareVideoId` when creating content.

## Testing Checklist

### Backend
- [ ] Health check returns Cloudflare status
- [ ] Upload URL generation works
- [ ] Movie creation validates Cloudflare video ID
- [ ] Episode addition validates video ID
- [ ] Video deletion removes from Cloudflare
- [ ] Content queries return cloudflareVideoId

### Mobile
- [ ] Videos play using Cloudflare Stream
- [ ] Seek forward/backward works
- [ ] Play/pause controls work
- [ ] Progress saves correctly
- [ ] Resume from last position works
- [ ] Controls auto-hide after 4 seconds

### Admin
- [ ] Movie form accepts cloudflareVideoId
- [ ] Episode form accepts cloudflareVideoId
- [ ] Field validation works
- [ ] Create/update operations succeed

## Removed Dependencies

### Can be uninstalled from backend:
```bash
cd backend
npm uninstall @mux/mux-node
```

### Unused files (can be deleted):
- `/backend/src/config/mux.ts`

## API Endpoint Changes

| Old Endpoint | New Endpoint | Method |
|--------------|--------------|--------|
| `/api/admin/mux-upload-url` | `/api/admin/cloudflare-upload-url` | GET |

## Field Name Changes

| Component | Old Fields | New Field |
|-----------|-----------|-----------|
| Movie model | `muxPlaybackId`, `muxAssetId` | `cloudflareVideoId` |
| Series Episode | `muxPlaybackId`, `muxAssetId` | `cloudflareVideoId` |
| Admin forms | Mux Playback ID, Mux Asset ID | Cloudflare Video ID |
| Mobile player | `playbackId`, `playbackToken` | `cloudflareVideoId` |

## Benefits of Migration

1. **Simplified Architecture** - Single video ID instead of playback/asset pair
2. **Better Performance** - Cloudflare's global CDN
3. **Cost Optimization** - Based on your pricing comparison
4. **Easier Management** - Unified video ID system
5. **Same Features** - All player functionality maintained

## Rollback Plan

If needed to revert:
1. Restore `/backend/src/config/mux.ts`
2. Revert model changes (git)
3. Revert controller changes (git)
4. Restore mobile player HTML to mux-player
5. Restore admin form fields
6. Restore database from backup

## Support Resources

- Cloudflare Stream API: https://developers.cloudflare.com/stream/
- Stream Player API: https://developers.cloudflare.com/stream/viewing-videos/using-the-stream-player/
- Upload API: https://developers.cloudflare.com/stream/uploading-videos/direct-creator-uploads/

---

**Migration Completed:** [Current Date]
**Tested:** Pending full integration testing
**Status:** ✅ Code changes complete, awaiting data migration and testing
