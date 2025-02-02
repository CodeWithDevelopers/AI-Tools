import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';
import crypto from 'crypto';
import Cache from 'memory-cache';

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        // Enhanced validation
        if (!file) {
            return errorResponse('No file provided', 400);
        }

        if (!file.type || !file.type.includes('pdf')) {
            return errorResponse('Invalid file type. Please upload a PDF file', 400);
        }

        if (file.size > MAX_FILE_SIZE) {
            return errorResponse(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`, 400);
        }

        const buffer = await file.arrayBuffer();
        const fileHash = generateFileHash(buffer);

        // Check cache
        const cachedData = Cache.get(fileHash);
        if (cachedData) {
            return successResponse({ ...cachedData, fromCache: true });
        }

        // Process PDF
        const data = await pdfParse(Buffer.from(buffer));
        const text = cleanText(data.text);
        
        if (!text || text.trim().length === 0) {
            return errorResponse('No readable text found in the PDF', 400);
        }

        // Process document content
        const processedData = processDocument(text);
        
        const responseData = {
            ...processedData,
            fileHash,
            metadata: {
                title: data.info?.Title || 'Untitled',
                author: data.info?.Author || 'Unknown',
                creationDate: data.info?.CreationDate,
                keywords: data.info?.Keywords || '',
                pageCount: data.numpages,
                version: data.info?.PDFFormatVersion,
                producer: data.info?.Producer,
                fileSize: Math.round(file.size / 1024) + ' KB'
            },
            statistics: {
                wordCount: text.split(/\s+/).length,
                characterCount: text.length,
                sentenceCount: text.split(/[.!?]+/).length - 1
            }
        };

        // Cache the processed data
        Cache.put(fileHash, responseData, CACHE_DURATION);
        return successResponse(responseData);
    } catch (error) {
        console.error('Error processing PDF:', error);
        return errorResponse(
            error.message || 'Error processing PDF. Please try again.',
            error.status || 500
        );
    }
}

export async function PUT(request) {
    try {
        const { query, fileHash } = await request.json();
        if (!query || !fileHash) {
            return errorResponse('Query and fileHash are required', 400);
        }

        const cachedData = Cache.get(fileHash);
        if (!cachedData) {
            return errorResponse('File not found. Please upload the PDF first.', 400);
        }

        const relevantContent = findRelevantContent(cachedData.text, query);
        return successResponse({ answer: relevantContent });
    } catch (error) {
        return errorResponse('Error processing query', 500);
    }
}

// === Helper Functions === //
function cleanText(text) {
    return text
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s.,!?-]/g, '')
        .trim();
}

function processDocument(text) {
    try {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const summary = generateSummary(sentences);
        const bulletPoints = extractKeyPoints(sentences);
        const topics = extractTopicsSimple(text);

        return {
            summary,
            bulletPoints,
            topics,
            text
        };
    } catch (error) {
        console.error('Error in processDocument:', error);
        throw new Error('Failed to process document content');
    }
}

function generateSummary(sentences) {
    // Take first few sentences as summary (simple approach)
    return sentences.slice(0, 3).join('. ') + '.';
}

function extractKeyPoints(sentences) {
    // Extract key points based on sentence importance (length and position)
    return sentences
        .filter((s, i) => {
            const words = s.trim().split(/\s+/);
            return (
                words.length > 5 && // Longer sentences
                words.length < 30 && // Not too long
                (i < sentences.length * 0.3 || i > sentences.length * 0.7) // From start or end
            );
        })
        .slice(0, 5) // Take top 5 points
        .map(s => s.trim());
}

function extractTopicsSimple(text) {
    // Simple keyword extraction based on word frequency
    const words = text.toLowerCase().split(/\s+/);
    const wordFreq = {};
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by']);
    
    words.forEach(word => {
        if (word.length > 3 && !stopWords.has(word)) {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
        }
    });

    return Object.entries(wordFreq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([word]) => word);
}

function findRelevantContent(text, query) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    const queryWords = query.toLowerCase().split(/\s+/);
    
    // Score sentences based on query word matches
    const scoredSentences = sentences.map(sentence => {
        const sentenceLower = sentence.toLowerCase();
        const matchCount = queryWords.filter(word => sentenceLower.includes(word)).length;
        return { sentence, score: matchCount };
    });

    // Get most relevant sentences
    const relevantSentences = scoredSentences
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 2)
        .map(({ sentence }) => sentence);

    return relevantSentences.length > 0
        ? relevantSentences.join(' ')
        : 'No relevant information found for your query.';
}

function generateFileHash(buffer) {
    return crypto.createHash('md5').update(Buffer.from(buffer)).digest('hex');
}

function successResponse(data, status = 200) {
    return NextResponse.json(data, { status });
}

function errorResponse(message, status = 400) {
    return NextResponse.json({ error: message }, { status });
}
