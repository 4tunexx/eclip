#!/usr/bin/env node

const { Pool } = require('pg');

async function checkRankThresholds() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    const result = await pool.query(
      `SELECT tier, division, min_esr, max_esr, color FROM esr_thresholds ORDER BY min_esr ASC, division ASC`,
    );

    const expectedTotal = 15;

    if (result.rows.length !== expectedTotal) {
      console.log(`⚠️ Expected ${expectedTotal} thresholds, found ${result.rows.length}. Reseeding...`);

      const thresholds = [
        { tier: 'Beginner', division: 1, min_esr: 0, max_esr: 166, color: '#808080' },
        { tier: 'Beginner', division: 2, min_esr: 167, max_esr: 333, color: '#808080' },
        { tier: 'Beginner', division: 3, min_esr: 334, max_esr: 500, color: '#808080' },
        { tier: 'Rookie', division: 1, min_esr: 500, max_esr: 666, color: '#90EE90' },
        { tier: 'Rookie', division: 2, min_esr: 667, max_esr: 833, color: '#90EE90' },
        { tier: 'Rookie', division: 3, min_esr: 834, max_esr: 1000, color: '#90EE90' },
        { tier: 'Pro', division: 1, min_esr: 1000, max_esr: 1333, color: '#4169E1' },
        { tier: 'Pro', division: 2, min_esr: 1334, max_esr: 1666, color: '#4169E1' },
        { tier: 'Pro', division: 3, min_esr: 1667, max_esr: 2000, color: '#4169E1' },
        { tier: 'Ace', division: 1, min_esr: 2000, max_esr: 2500, color: '#FFD700' },
        { tier: 'Ace', division: 2, min_esr: 2501, max_esr: 3000, color: '#FFD700' },
        { tier: 'Ace', division: 3, min_esr: 3001, max_esr: 3500, color: '#FFD700' },
        { tier: 'Legend', division: 1, min_esr: 3500, max_esr: 4000, color: '#FF1493' },
        { tier: 'Legend', division: 2, min_esr: 4001, max_esr: 4500, color: '#FF1493' },
        { tier: 'Legend', division: 3, min_esr: 4501, max_esr: 5000, color: '#FF1493' },
      ];

      await pool.query('TRUNCATE TABLE esr_thresholds RESTART IDENTITY');

      for (const t of thresholds) {
        await pool.query(
          `INSERT INTO esr_thresholds (tier, division, min_esr, max_esr, color)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (tier, division) DO UPDATE SET min_esr = $3, max_esr = $4, color = $5`,
          [t.tier, t.division, t.min_esr, t.max_esr, t.color],
        );
        console.log(`  ✅ ${t.tier} Div ${t.division}: ${t.min_esr}-${t.max_esr}`);
      }
    } else {
      console.log('✅ ESR Thresholds found:');
      result.rows.forEach((row) => {
        console.log(`  ${row.tier} Div ${row.division}: ${row.min_esr}-${row.max_esr} (${row.color})`);
      });
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
  }
}

checkRankThresholds();
