import { db } from '../src/lib/db';
import { cosmetics } from '../src/lib/db/schema';
import { eq } from 'drizzle-orm';

// Unique frame styles for each avatar frame - more transparent
const frameGradients: Record<string, string> = {
  'Classic Gold': 'linear-gradient(135deg, rgb(251 191 36 / 0.5) 0%, rgb(253 224 71 / 0.6) 33%, rgb(234 179 8 / 0.5) 66%, rgb(161 98 7 / 0.4) 100%)',
  'Neon Blue': 'linear-gradient(135deg, rgb(30 58 138 / 0.6) 0%, rgb(37 99 235 / 0.7) 33%, rgb(59 130 246 / 0.7) 66%, rgb(96 165 250 / 0.6) 100%)',
  'Emerald Green': 'linear-gradient(135deg, rgb(5 150 105 / 0.5) 0%, rgb(16 185 129 / 0.6) 33%, rgb(34 197 94 / 0.6) 66%, rgb(74 222 128 / 0.5) 100%)',
  'Royal Purple': 'linear-gradient(135deg, rgb(88 28 135 / 0.5) 0%, rgb(126 34 206 / 0.6) 33%, rgb(168 85 247 / 0.6) 66%, rgb(192 132 252 / 0.5) 100%)',
  'Ruby Red': 'linear-gradient(135deg, rgb(153 27 27 / 0.5) 0%, rgb(220 38 38 / 0.6) 33%, rgb(239 68 68 / 0.6) 66%, rgb(248 113 113 / 0.5) 100%)',
  'Silver Storm': 'linear-gradient(135deg, rgb(148 163 184 / 0.4) 0%, rgb(203 213 225 / 0.5) 33%, rgb(226 232 240 / 0.5) 66%, rgb(241 245 249 / 0.4) 100%)',
  'Golden Glow': 'linear-gradient(135deg, rgb(217 119 6 / 0.6) 0%, rgb(251 146 60 / 0.7) 25%, rgb(251 191 36 / 0.7) 50%, rgb(253 224 71 / 0.6) 75%, rgb(250 204 21 / 0.5) 100%)',
  'Crystal Clear': 'linear-gradient(135deg, rgb(165 180 252 / 0.4) 0%, rgb(199 210 254 / 0.5) 25%, rgb(224 231 255 / 0.5) 50%, rgb(199 210 254 / 0.5) 75%, rgb(165 180 252 / 0.4) 100%)',
  'Dark Night': 'linear-gradient(135deg, rgb(0 0 0 / 0.7) 0%, rgb(15 23 42 / 0.7) 25%, rgb(30 41 59 / 0.7) 50%, rgb(51 65 85 / 0.6) 75%, rgb(71 85 105 / 0.5) 100%)',
  'Sunset Orange': 'linear-gradient(135deg, rgb(180 83 9 / 0.5) 0%, rgb(217 119 6 / 0.6) 25%, rgb(249 115 22 / 0.6) 50%, rgb(251 146 60 / 0.6) 75%, rgb(253 186 116 / 0.5) 100%)',
};

async function updateFrameGradients() {
  try {
    console.log('Fetching all frames...');
    const frames = await db
      .select()
      .from(cosmetics)
      .where(eq(cosmetics.type, 'Frame'));

    console.log(`Found ${frames.length} frames`);

    for (const frame of frames) {
      const gradient = frameGradients[frame.name];
      
      if (gradient) {
        console.log(`Updating ${frame.name} with gradient and animation...`);
        
        // Parse existing metadata
        let metadata: any = {};
        if (frame.imageUrl) {
          try {
            metadata = JSON.parse(frame.imageUrl);
          } catch (e) {
            metadata = {};
          }
        }
        
        // Add border_gradient and border_width to metadata
        metadata.border_gradient = gradient;
        
        // Make each frame completely unique with different styles, animations, widths, and shadows
        if (frame.name === 'Classic Gold') {
          metadata.border_width = 4;
          metadata.border_style = 'solid';
          metadata.animation_type = 'glow';
          metadata.animation_speed = 5;
          metadata.shadow_color = 'rgba(251, 191, 36, 0.4)';
        } else if (frame.name === 'Neon Blue') {
          metadata.border_width = 3;
          metadata.border_style = 'dashed';
          metadata.animation_type = 'pulse';
          metadata.animation_speed = 4;
          metadata.shadow_color = 'rgba(59, 130, 246, 0.5)';
        } else if (frame.name === 'Emerald Green') {
          metadata.border_width = 5;
          metadata.border_style = 'dotted';
          metadata.animation_type = 'rotate';
          metadata.animation_speed = 3;
          metadata.shadow_color = 'rgba(34, 197, 94, 0.4)';
        } else if (frame.name === 'Royal Purple') {
          metadata.border_width = 4;
          metadata.border_style = 'double';
          metadata.animation_type = 'glow';
          metadata.animation_speed = 6;
          metadata.shadow_color = 'rgba(168, 85, 247, 0.6)';
        } else if (frame.name === 'Ruby Red') {
          metadata.border_width = 3;
          metadata.border_style = 'solid';
          metadata.animation_type = 'pulse';
          metadata.animation_speed = 5;
          metadata.shadow_color = 'rgba(239, 68, 68, 0.5)';
        } else if (frame.name === 'Silver Storm') {
          metadata.border_width = 2;
          metadata.border_style = 'dashed';
          metadata.animation_type = 'none';
          metadata.animation_speed = 0;
          metadata.shadow_color = 'rgba(203, 213, 225, 0.3)';
        } else if (frame.name === 'Golden Glow') {
          metadata.border_width = 5;
          metadata.border_style = 'solid';
          metadata.animation_type = 'glow';
          metadata.animation_speed = 7;
          metadata.shadow_color = 'rgba(251, 191, 36, 0.7)';
        } else if (frame.name === 'Crystal Clear') {
          metadata.border_width = 3;
          metadata.border_style = 'dotted';
          metadata.animation_type = 'rotate';
          metadata.animation_speed = 2;
          metadata.shadow_color = 'rgba(165, 180, 252, 0.4)';
        } else if (frame.name === 'Dark Night') {
          metadata.border_width = 4;
          metadata.border_style = 'double';
          metadata.animation_type = 'pulse';
          metadata.animation_speed = 3;
          metadata.shadow_color = 'rgba(51, 65, 85, 0.6)';
        } else if (frame.name === 'Sunset Orange') {
          metadata.border_width = 6;
          metadata.border_style = 'solid';
          metadata.animation_type = 'glow';
          metadata.animation_speed = 8;
          metadata.shadow_color = 'rgba(249, 115, 22, 0.5)';
        } else {
          metadata.border_width = 3;
          metadata.border_style = 'solid';
          metadata.animation_type = 'none';
          metadata.shadow_color = 'rgba(147, 51, 234, 0.3)';
        }
        
        // Update the frame
        await db
          .update(cosmetics)
          .set({
            imageUrl: JSON.stringify(metadata),
            updatedAt: new Date()
          })
          .where(eq(cosmetics.id, frame.id));
        
        console.log(`✓ Updated ${frame.name}`);
      } else {
        console.log(`⚠ No gradient found for ${frame.name}`);
      }
    }

    console.log('\n✅ All frames updated successfully!');
  } catch (error) {
    console.error('Error updating frames:', error);
    throw error;
  }
}

updateFrameGradients()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
