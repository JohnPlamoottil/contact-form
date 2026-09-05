import { Router } from 'express';
import { PlaybackHistory, Song } from '../models';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import type { Response } from 'express';

const router = Router();

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '50' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [entries, total] = await Promise.all([
      PlaybackHistory.find({ userId: req.userId })
        .sort({ playedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('songId'),
      PlaybackHistory.countDocuments({ userId: req.userId }),
    ]);

    res.json({
      data: {
        items: entries.map(entry => ({
          id: entry._id.toString(),
          songId: entry.songId._id.toString(),
          song: {
            id: entry.songId._id.toString(),
            title: entry.songId.title,
            artist: entry.songId.artist,
            album: entry.songId.album,
            genre: entry.songId.genre,
            year: entry.songId.year,
            trackNumber: entry.songId.trackNumber,
            duration: entry.songId.duration,
            artworkUrl: entry.songId.artworkUrl,
            mimeType: entry.songId.mimeType,
            fileSize: entry.songId.fileSize,
            favorite: entry.songId.favorite,
            playCount: entry.songId.playCount,
            uploadedAt: entry.songId.uploadedAt.toISOString(),
            lastPlayedAt: entry.songId.lastPlayedAt?.toISOString() || null,
          },
          playedAt: entry.playedAt.toISOString(),
        })),
        total,
        page: pageNum,
        limit: limitNum,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { songId } = req.body;
    if (!songId) {
      return res.status(400).json({ error: 'songId required' });
    }

    const song = await Song.findOne({ _id: songId, userId: req.userId });
    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    song.lastPlayedAt = new Date();
    song.playCount = (song.playCount || 0) + 1;
    await song.save();

    const entry = new PlaybackHistory({
      userId: req.userId,
      songId,
      playedAt: new Date(),
    });

    await entry.save();

    res.status(201).json({
      data: {
        id: entry._id.toString(),
        songId: entry.songId.toString(),
        playedAt: entry.playedAt.toISOString(),
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record playback' });
  }
});

export default router;
