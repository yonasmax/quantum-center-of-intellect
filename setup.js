import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://lookscjdmgoumfxjzzpy.supabase.co',
  'sb_secret_iwM4yX8HWF_r50G1rvNHTQ_vvLoOXgT'
);

console.log('Testing connection...');
const { error: testErr } = await supabase.from('profiles').select('*').limit(1);
if (testErr) {
  console.error('CONNECTION FAILED:', testErr.message);
  process.exit(1);
}
console.log('OK - connected\n');

console.log('Inserting profiles...');
const { error: pErr } = await supabase.from('profiles').upsert([
  { id: 'yonasmolla3@gmail.com', email: 'yonasmolla3@gmail.com', full_name: 'Yonas M.', role: 'admin' },
  { id: 'tamrat@quantum.et', email: 'tamrat@quantum.et', full_name: 'Tamrat M.', role: 'teacher' },
  { id: 'selam@quantum.et', email: 'selam@quantum.et', full_name: 'Selam M.', role: 'student' },
  { id: 'birhanu@quantum.et', email: 'birhanu@quantum.et', full_name: 'Birhanu M.', role: 'student' }
]);
console.log(pErr ? 'FAIL: ' + pErr.message : 'OK - 4 profiles');

console.log('Inserting teacher assignments...');
const { error: aErr } = await supabase.from('teacher_assignments').upsert([
  { teacher_id: 'tamrat@quantum.et', subject: 'Chemistry', grade: 'Grade 9' },
  { teacher_id: 'tamrat@quantum.et', subject: 'Chemistry', grade: 'Grade 10' }
]);
console.log(aErr ? 'FAIL: ' + aErr.message : 'OK - 2 assignments');

console.log('Inserting student enrollments...');
const { error: eErr } = await supabase.from('student_enrollments').upsert([
  { student_id: 'selam@quantum.et', subject: 'Chemistry', grade: 'Grade 9' },
  { student_id: 'birhanu@quantum.et', subject: 'Chemistry', grade: 'Grade 9' }
]);
console.log(eErr ? 'FAIL: ' + eErr.message : 'OK - 2 enrollments');

console.log('\nDONE');