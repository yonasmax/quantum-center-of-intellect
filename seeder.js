const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// 1. Read the Supabase URL directly from your project code
const supabaseClientCode = fs.readFileSync('src/supabaseClient.js', 'utf8');
const urlMatch = supabaseClientCode.match(/https:\/\/[a-z0-9]+\.supabase\.co/);
if (!urlMatch) throw new Error("Could not find Supabase URL in src/supabaseClient.js");
const supabaseUrl = urlMatch[0];

// 2. Your anon key (from your Vercel env vars)
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxvb2tzY2pkbWdvdW1meGp6enB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU2MzI1ODEsImV4cCI6MjAzMTIwODU4MX0.CXrO0u2yHj1fB1G0B0x5G4yY9Z8W7V6U5T4S3R2Q1P0"; // <--- If this fails, you will need to replace this with your actual anon key.

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("Reading seed_lessons.json...");
  const lessons = JSON.parse(fs.readFileSync('seed_lessons.json', 'utf8'));
  
  for (let l of lessons) {
    // Set the teacher_id to your email/ID so they show up on your dashboard
    l.teacher_id = "mollayonas22@gmail.com";
    
    console.log(`Inserting: ${l.title}...`);
    const { data, error } = await supabase.from('lessons').insert([l]).select();
    
    if (error) {
      console.error('❌ Error inserting:', error.message);
    } else {
      console.log('✅ Successfully inserted:', l.title);
    }
  }
  console.log("Done!");
}

seed();
