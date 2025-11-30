import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { cosmetics } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

const createCosmeticSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['Frame', 'Banner', 'Badge', 'Title']),
  rarity: z.enum(['Common', 'Rare', 'Epic', 'Legendary']),
  price: z.number().min(0),
  imageUrl: z.string().url().optional(),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const items = await db.select()
      .from(cosmetics)
      .orderBy(cosmetics.createdAt);

    return NextResponse.json({
      items: items.map(item => ({
        ...item,
        price: Number(item.price),
      })),
    });
  } catch (error) {
    console.error('Error fetching cosmetics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const data = createCosmeticSchema.parse(body);

    const [cosmetic] = await db.insert(cosmetics).values({
      name: data.name,
      description: data.description,
      type: data.type,
      rarity: data.rarity,
      price: data.price.toString(),
      imageUrl: data.imageUrl,
      isActive: true,
    }).returning();

    return NextResponse.json({
      cosmetic: {
        ...cosmetic,
        price: Number(cosmetic.price),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating cosmetic:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

