import { NextResponse } from 'next/server';
import { getSubtitles } from 'youtube-captions-scraper';
import { google } from 'googleapis';
import Cache from 'memory-cache';

const CACHE_DURATION = 24 * 60 * 60 * 1000; // Cache results for 24 hours
const youtube = google.youtube('v3');
const API_KEY = process.env.YOUTUBE_API_KEY || 'AIzaSyBeJCbTOgEvA0-gm68UqSTSM7w1VOGlpGU';

export async function POST(request) {
    try {
        const { videoUrl } = await request.json();

        if (!videoUrl) return errorResponse('YouTube video URL is required.', 400);

        // Extract Video ID
        const videoId = extractVideoId(videoUrl);
        if (!videoId) return errorResponse('Invalid YouTube URL.', 400);

        // Check cache
        const cachedData = Cache.get(videoId);
        if (cachedData) return successResponse(cachedData);

        // Fetch video info and subtitles
        const videoData = await fetchVideoData(videoId);
        if (!videoData) return errorResponse('Could not fetch video information.', 400);

        // Process transcript
        const processedData = processTranscript(videoData.transcript);

        const responseData = {
            videoId,
            title: videoData.title,
            description: videoData.description,
            transcript: videoData.transcript,
            summary: processedData.summary,
            bulletPoints: processedData.bulletPoints,
            message: 'Video processed successfully.'
        };

        // Cache the response
        Cache.put(videoId, responseData, CACHE_DURATION);

        return successResponse(responseData);
    } catch (error) {
        console.error('Error processing video:', error);
        return errorResponse('Server error while processing video.', 500);
    }
}

export async function PUT(request) {
    try {
        const { query, videoId } = await request.json();

        if (!videoId) return errorResponse('Video ID is required.', 400);
        if (!query) return errorResponse('Query text is required.', 400);

        const cachedData = Cache.get(videoId);
        if (!cachedData || !cachedData.transcript) {
            return errorResponse('Please process the video first.', 400);
        }

        // Find relevant content from transcript
        const answer = findRelevantContent(cachedData.transcript, query);
        return successResponse({ response: answer });
    } catch (error) {
        console.error('Error processing query:', error);
        return errorResponse('Error processing your query.', 500);
    }
}

// ====== 📌 Helper Functions ======

// ✅ Fetch Video Data (Info + Subtitles)
async function fetchVideoData(videoId) {
    try {
        // Get video details using YouTube API
        const videoInfo = await youtube.videos.list({
            key: API_KEY,
            part: ['snippet'],
            id: [videoId]
        });

        if (!videoInfo.data.items || videoInfo.data.items.length === 0) {
            throw new Error('Video not found');
        }

        const videoDetails = videoInfo.data.items[0].snippet;
        
        // Get captions using youtube-captions-scraper
        let transcript;
        try {
            // Try English first
            transcript = await getSubtitles({
                videoID: videoId,
                lang: 'en'
            });
        } catch (error) {
            try {
                // Try auto-generated English
                transcript = await getSubtitles({
                    videoID: videoId,
                    lang: 'a.en'
                });
            } catch (error) {
                // Try US English as last resort
                transcript = await getSubtitles({
                    videoID: videoId,
                    lang: 'en-US'
                });
            }
        }

        if (!transcript || transcript.length === 0) {
            throw new Error('No captions available');
        }

        // Format transcript
        const formattedTranscript = transcript.map(item => ({
            offset: parseFloat(item.start),
            text: item.text
        }));

        return {
            title: videoDetails.title,
            description: videoDetails.description || '',
            transcript: formattedTranscript
        };
    } catch (error) {
        console.error('Error fetching video data:', error);
        if (error.message.includes('Could not find captions')) {
            throw new Error('No captions available for this video');
        }
        throw error;
    }
}

// ✅ Process Transcript for Summary & Bullet Points
function processTranscript(transcript) {
    const fullText = transcript.map(item => item.text.trim()).join(' ').replace(/\s+/g, ' ');
    const sentences = fullText.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20);

    const summary = sentences.slice(0, 5).join('. ') + '.';

    const bulletPoints = sentences
        .filter(sentence => {
            const words = sentence.split(/\s+/);
            return words.length >= 8 && words.length <= 30 &&
                   !sentence.toLowerCase().includes('subscribe') &&
                   !sentence.toLowerCase().includes('like this video');
        })
        .slice(0, 8)
        .map(sentence => sentence + '.');

    return { summary, bulletPoints };
}

// ✅ Find Relevant Content for Query
function findRelevantContent(transcript, query) {
    const queryWords = query.toLowerCase().split(/\s+/);
    const chunks = [];
    let currentChunk = { text: '', timestamp: '' };

    transcript.forEach((item, index) => {
        currentChunk.text += item.text + ' ';
        if (index === 0) currentChunk.timestamp = formatTime(item.offset);

        if ((index + 1) % 5 === 0) {
            chunks.push({ ...currentChunk });
            currentChunk = { text: '', timestamp: '' };
        }
    });

    if (currentChunk.text) chunks.push(currentChunk);

    const scoredChunks = chunks.map(chunk => {
        const chunkWords = chunk.text.toLowerCase().split(/\s+/);
        let score = 0;

        queryWords.forEach(queryWord => {
            if (chunkWords.includes(queryWord)) score += 1;
        });

        return { ...chunk, score: score / queryWords.length };
    });

    const relevantChunks = scoredChunks
        .filter(chunk => chunk.score > 0.2)
        .sort((a, b) => b.score - a.score)
        .slice(0, 2);

    if (relevantChunks.length === 0) return "No relevant content found.";

    return relevantChunks.map(chunk => `[${chunk.timestamp}] ${chunk.text.trim()}`).join('\n\n');
}

// ✅ Format Time
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// ✅ Extract Video ID
function extractVideoId(url) {
    try {
        const urlObj = new URL(url);
        const searchParams = new URLSearchParams(urlObj.search);

        if (urlObj.hostname === 'youtu.be') return urlObj.pathname.slice(1);
        if (urlObj.hostname.includes('youtube.com')) return searchParams.get('v');

        return null;
    } catch {
        return null;
    }
}

// ✅ Response Handlers
function successResponse(data, status = 200) {
    return new NextResponse(JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' }
    });
}

function errorResponse(message, status = 400) {
    return new NextResponse(JSON.stringify({ error: message }), {
        status,
        headers: { 'Content-Type': 'application/json' }
    });
}
