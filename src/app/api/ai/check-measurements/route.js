import { NextResponse } from 'next/server';

const MODEL_URL = process.env.MEASUREMENT_MODEL_URL;

export async function POST(request) {
    try {
        const { garment_type, measurements } = await request.json();

        const response = await fetch(`${MODEL_URL}/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ garment_type, measurements })
        });

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        // If model is down, never block the tailor
        console.error('Model error:', error);
        return NextResponse.json({
            status: 'error',
            flags: [],
            flag_count: 0
        });
    }
}