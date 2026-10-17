const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// 1. Read the Supabase URL directly from your project code
const supabaseClientCode = fs.readFileSync('src/supabaseClient.js', 'utf8');
const urlMatch = supabaseClientCode.match(/https:\/\/[a-z0-9]+\.supabase\.co/);
const supabaseUrl = urlMatch[0];

// 2. Your anon key
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxvb2tzY2pkbWdvdW1meGp6enB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTU2MzI1ODEsImV4cCI6MjAzMTIwODU4MX0.CXrO0u2yHj1fB1G0B0x5G4yY9Z8W7V6U5T4S3R2Q1P0"; 

const supabase = createClient(supabaseUrl, supabaseKey);

async function publishAll() {
  console.log('Publishing all lessons...');
  const { data, error } = await supabase.from('lessons').update({ is_published: true }).neq('is_published', true).select();
  
  if (error) {
    console.error('❌ Error:', error.message);
  } else {
    console.log(`✅ Successfully published ${data.length} lessons!`);
  }
}
publishAll();
