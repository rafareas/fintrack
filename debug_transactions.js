import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

// Load env from .env or .env.local
const env = fs.readFileSync('.env.local', 'utf8');
const lines = env.split('\n');
const supabaseUrl = lines.find(l => l.startsWith('VITE_SUPABASE_URL'))?.split('=')[1];
const supabaseKey = lines.find(l => l.startsWith('VITE_SUPABASE_ANON_KEY'))?.split('=')[1];

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTransactions() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching transactions:', error);
    return;
  }

  console.log('Last 5 transactions:');
  data.forEach(t => {
    console.log(`- ID: ${t.id}, Desc: ${t.description}, Category: ${t.category}, Type: ${t.type}`);
  });
}

checkTransactions();
