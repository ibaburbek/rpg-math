-- =======================================================================
-- MATHQUEST CANONICAL SUPABASE DATABASE SCHEMA & RPC FUNCTIONS
-- Source of Truth for Database Setup & Row Level Security
-- =======================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. PROFILES (Teachers, Staff, Students)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  role text not null check (role in ('teacher', 'student', 'admin')),
  display_name text not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 2. CLASSROOMS
create table if not exists public.classrooms (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  grade_range text not null,
  join_code text unique not null,
  status text default 'active' check (status in ('active', 'archived')) not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 3. STUDENTS
create table if not exists public.students (
  id uuid default uuid_generate_v4() primary key,
  auth_user_id uuid references auth.users(id) on delete cascade not null,
  classroom_id uuid references public.classrooms(id) on delete cascade not null,
  display_name text not null,
  character_id text default 'forest_explorer' not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null,
  unique (auth_user_id, classroom_id)
);

-- 4. PROBLEMS (Question bank created by teachers)
create table if not exists public.problems (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  statement text not null,
  image_path text,
  grade integer not null,
  subject text default 'Математика' not null,
  topic text not null,
  difficulty text check (difficulty in ('easy', 'medium', 'hard')) not null,
  answer_type text check (answer_type in ('numeric', 'text', 'multiple_choice', 'math_expression')) not null,
  answer_options jsonb, -- array of strings for multiple_choice
  explanation text,
  hint text,
  grading_mode text check (grading_mode in ('auto', 'manual')) not null,
  max_score integer default 10 not null,
  xp_reward integer default 50 not null,
  coin_reward integer default 10 not null,
  status text default 'published' check (status in ('draft', 'published', 'archived')) not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 5. PROBLEM ANSWER KEYS (Private answers; restricted to teachers and server RPCs)
create table if not exists public.problem_answer_keys (
  problem_id uuid references public.problems(id) on delete cascade primary key,
  correct_answer text not null,
  accepted_answers jsonb, -- array of accepted alternate strings
  numeric_tolerance double precision,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 6. ASSIGNMENTS
create table if not exists public.assignments (
  id uuid default uuid_generate_v4() primary key,
  owner_id uuid references public.profiles(id) on delete cascade not null,
  classroom_id uuid references public.classrooms(id) on delete cascade not null,
  title text not null,
  instructions text,
  due_at timestamptz,
  status text default 'published' check (status in ('draft', 'published', 'closed')) not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 7. ASSIGNMENT PROBLEMS (Problems bundled into an assignment)
create table if not exists public.assignment_problems (
  id uuid default uuid_generate_v4() primary key,
  assignment_id uuid references public.assignments(id) on delete cascade not null,
  problem_id uuid references public.problems(id) on delete cascade not null,
  position integer default 0 not null,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  unique (assignment_id, problem_id)
);

-- 8. SUBMISSIONS
create table if not exists public.submissions (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.students(id) on delete cascade not null,
  assignment_problem_id uuid references public.assignment_problems(id) on delete cascade not null,
  answer text not null,
  is_correct boolean,
  score integer,
  teacher_feedback text,
  status text check (status in ('pending', 'graded')) not null,
  attempt_number integer default 1 not null,
  submitted_at timestamptz default timezone('utc'::text, now()) not null,
  graded_by uuid references public.profiles(id) on delete set null,
  graded_at timestamptz
);

-- 9. STUDENT STATS (Total XP and Coins; strictly server-managed)
create table if not exists public.student_stats (
  student_id uuid references public.students(id) on delete cascade primary key,
  total_xp integer default 0 not null check (total_xp >= 0),
  coins integer default 0 not null check (coins >= 0),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 10. REWARD LEDGER (Idempotent tracking of granted XP and Coins)
create table if not exists public.reward_ledger (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.students(id) on delete cascade not null,
  assignment_problem_id uuid references public.assignment_problems(id) on delete cascade not null,
  submission_id uuid references public.submissions(id) on delete cascade not null,
  xp_amount integer default 0 not null check (xp_amount >= 0),
  coin_amount integer default 0 not null check (coin_amount >= 0),
  created_at timestamptz default timezone('utc'::text, now()) not null,
  unique (student_id, assignment_problem_id)
);

-- 11. INVENTORY (Game catalog items)
create table if not exists public.inventory (
  id text primary key,
  code text unique not null,
  name text not null,
  description text,
  category text check (category in ('outfit', 'hat', 'furniture', 'plant', 'wall', 'flooring')) not null,
  price_coins integer default 0 not null check (price_coins >= 0),
  unlock_level integer default 1 not null check (unlock_level >= 1),
  asset_path text not null,
  is_active boolean default true not null,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 12. STUDENT ITEMS (Items owned by students)
create table if not exists public.student_items (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.students(id) on delete cascade not null,
  inventory_id text references public.inventory(id) on delete cascade not null,
  acquired_at timestamptz default timezone('utc'::text, now()) not null,
  is_equipped boolean default false not null,
  placement text,
  unique (student_id, inventory_id)
);

-- 13. ROOMS (Virtual home customization)
create table if not exists public.rooms (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.students(id) on delete cascade unique not null,
  room_data jsonb default '{"wall": null, "floor": null, "desk": null, "plant": null, "bed": null}'::jsonb not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- =======================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =======================================================================

alter table public.profiles enable row level security;
alter table public.classrooms enable row level security;
alter table public.students enable row level security;
alter table public.problems enable row level security;
alter table public.problem_answer_keys enable row level security;
alter table public.assignments enable row level security;
alter table public.assignment_problems enable row level security;
alter table public.submissions enable row level security;
alter table public.student_stats enable row level security;
alter table public.reward_ledger enable row level security;
alter table public.inventory enable row level security;
alter table public.student_items enable row level security;
alter table public.rooms enable row level security;

-- Profiles: Users can read and update their own profile
create policy "Read own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Insert profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Classrooms: Teachers can manage their own classrooms
create policy "Teacher view their classrooms" on public.classrooms
  for select using (owner_id = auth.uid());

create policy "Teacher insert classroom" on public.classrooms
  for insert with check (owner_id = auth.uid());

create policy "Teacher update classroom" on public.classrooms
  for update using (owner_id = auth.uid());

-- Students:
create policy "Teacher can view students in their classrooms" on public.students
  for select using (classroom_id in (select id from public.classrooms where owner_id = auth.uid()));

create policy "Student can view their own student profile" on public.students
  for select using (auth_user_id = auth.uid());

-- Problems:
create policy "Teacher can manage their problems" on public.problems
  for all using (owner_id = auth.uid());

create policy "Students can view problems assigned to their classroom" on public.problems
  for select using (
    id in (
      select ap.problem_id
      from public.assignment_problems ap
      join public.assignments a on a.id = ap.assignment_id
      join public.students s on s.classroom_id = a.classroom_id
      where s.auth_user_id = auth.uid() and a.status = 'published'
    )
  );

-- Problem Answer Keys: ONLY teachers who own the problem can view/modify
create policy "Teacher owns answer key" on public.problem_answer_keys
  for all using (
    problem_id in (select id from public.problems where owner_id = auth.uid())
  );

-- Assignments:
create policy "Teacher can manage assignments" on public.assignments
  for all using (owner_id = auth.uid());

create policy "Students can view published assignments" on public.assignments
  for select using (
    classroom_id in (select classroom_id from public.students where auth_user_id = auth.uid())
    and status = 'published'
  );

-- Assignment Problems:
create policy "Teacher can manage assignment problems" on public.assignment_problems
  for all using (
    assignment_id in (select id from public.assignments where owner_id = auth.uid())
  );

create policy "Students can view assignment problems" on public.assignment_problems
  for select using (
    assignment_id in (
      select a.id from public.assignments a
      join public.students s on s.classroom_id = a.classroom_id
      where s.auth_user_id = auth.uid() and a.status = 'published'
    )
  );

-- Submissions:
create policy "Teacher can view and grade classroom submissions" on public.submissions
  for all using (
    student_id in (
      select s.id from public.students s
      join public.classrooms c on c.id = s.classroom_id
      where c.owner_id = auth.uid()
    )
  );

create policy "Student can view own submissions" on public.submissions
  for select using (
    student_id in (select id from public.students where auth_user_id = auth.uid())
  );

-- Student Stats: Read-only for student and classroom teacher; mutations via RPC only
create policy "Student can view own stats" on public.student_stats
  for select using (
    student_id in (select id from public.students where auth_user_id = auth.uid())
  );

create policy "Teacher can view students stats" on public.student_stats
  for select using (
    student_id in (
      select s.id from public.students s
      join public.classrooms c on c.id = s.classroom_id
      where c.owner_id = auth.uid()
    )
  );

-- Reward Ledger: Read-only for student and teacher
create policy "Student can view own reward ledger" on public.reward_ledger
  for select using (
    student_id in (select id from public.students where auth_user_id = auth.uid())
  );

-- Inventory: Public read for all authenticated users
create policy "Public read inventory" on public.inventory
  for select using (is_active = true);

-- Student Items & Rooms:
create policy "Student manages own items" on public.student_items
  for all using (
    student_id in (select id from public.students where auth_user_id = auth.uid())
  );

create policy "Student manages own room" on public.rooms
  for all using (
    student_id in (select id from public.students where auth_user_id = auth.uid())
  );

-- =======================================================================
-- RPC FUNCTIONS (SERVER-SIDE SECURE OPERATIONS)
-- =======================================================================

-- 1. Student Joining RPC
create or replace function public.join_classroom(
  p_join_code text,
  p_display_name text,
  p_character_id text
)
returns public.students
language plpgsql
security definer
as $$
declare
  v_classroom public.classrooms%rowtype;
  v_student public.students%rowtype;
  v_auth_uid uuid;
begin
  v_auth_uid := auth.uid();
  if v_auth_uid is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_classroom
  from public.classrooms
  where upper(join_code) = upper(trim(p_join_code))
    and status = 'active'
  limit 1;

  if not found then
    raise exception 'Invalid classroom join code';
  end if;

  -- Upsert student record
  insert into public.students (auth_user_id, classroom_id, display_name, character_id)
  values (v_auth_uid, v_classroom.id, trim(p_display_name), coalesce(p_character_id, 'forest_explorer'))
  on conflict (auth_user_id, classroom_id)
  do update set
    display_name = trim(p_display_name),
    character_id = coalesce(p_character_id, public.students.character_id),
    updated_at = timezone('utc'::text, now())
  returning * into v_student;

  -- Ensure student stats record exists (welcome starter: 50 coins)
  insert into public.student_stats (student_id, total_xp, coins)
  values (v_student.id, 0, 50)
  on conflict (student_id) do nothing;

  -- Ensure student room record exists
  insert into public.rooms (student_id, room_data)
  values (v_student.id, '{"wall": null, "floor": null, "desk": null, "plant": null, "bed": null}'::jsonb)
  on conflict (student_id) do nothing;

  return v_student;
end;
$$;

-- 2. Secure Submit Assignment Problem & Auto-Grading RPC
create or replace function public.submit_assignment_problem(
  p_assignment_problem_id uuid,
  p_answer text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_auth_uid uuid;
  v_student public.students%rowtype;
  v_ap public.assignment_problems%rowtype;
  v_problem public.problems%rowtype;
  v_key public.problem_answer_keys%rowtype;
  v_assignment public.assignments%rowtype;
  v_submission public.submissions%rowtype;
  v_is_correct boolean := null;
  v_score integer := 0;
  v_status text := 'pending';
  v_norm_submitted text;
  v_norm_correct text;
  v_num_sub numeric;
  v_num_cor numeric;
  v_already_rewarded boolean;
  v_xp_granted integer := 0;
  v_coins_granted integer := 0;
begin
  v_auth_uid := auth.uid();
  if v_auth_uid is null then
    raise exception 'Not authenticated';
  end if;

  -- Find assignment problem & problem
  select * into v_ap from public.assignment_problems where id = p_assignment_problem_id;
  if not found then
    raise exception 'Assignment problem not found';
  end if;

  select * into v_assignment from public.assignments where id = v_ap.assignment_id;
  select * into v_problem from public.problems where id = v_ap.problem_id;

  -- Validate student belongs to this classroom
  select * into v_student from public.students
  where auth_user_id = v_auth_uid and classroom_id = v_assignment.classroom_id;
  if not found then
    raise exception 'Student not enrolled in this classroom';
  end if;

  -- Read answer key securely (bypassing student RLS)
  select * into v_key from public.problem_answer_keys where problem_id = v_problem.id;

  if v_problem.grading_mode = 'auto' and v_key.correct_answer is not null then
    v_norm_submitted := lower(trim(p_answer));
    v_norm_correct := lower(trim(v_key.correct_answer));

    if v_problem.answer_type = 'numeric' then
      begin
        v_num_sub := v_norm_submitted::numeric;
        v_num_cor := v_norm_correct::numeric;
        if abs(v_num_sub - v_num_cor) <= coalesce(v_key.numeric_tolerance, 0.0001) then
          v_is_correct := true;
        else
          v_is_correct := false;
        end if;
      exception when others then
        v_is_correct := (v_norm_submitted = v_norm_correct);
      end;
    else
      if v_norm_submitted = v_norm_correct then
        v_is_correct := true;
      else
        -- Check accepted answers if any
        v_is_correct := false;
        if v_key.accepted_answers is not null then
          select true into v_is_correct
          from jsonb_array_elements_text(v_key.accepted_answers) elem
          where lower(trim(elem)) = v_norm_submitted
          limit 1;
        end if;
      end if;
    end if;

    v_status := 'graded';
    if v_is_correct is true then
      v_score := v_problem.max_score;
    else
      v_score := 0;
    end if;
  else
    v_status := 'pending';
    v_is_correct := null;
    v_score := null;
  end if;

  -- Insert or update submission
  insert into public.submissions (
    student_id,
    assignment_problem_id,
    answer,
    is_correct,
    score,
    status,
    submitted_at
  )
  values (
    v_student.id,
    p_assignment_problem_id,
    p_answer,
    v_is_correct,
    v_score,
    v_status,
    timezone('utc'::text, now())
  )
  returning * into v_submission;

  -- Award rewards if auto-graded and correct, preventing duplicates
  if v_is_correct is true then
    select exists(
      select 1 from public.reward_ledger
      where student_id = v_student.id and assignment_problem_id = p_assignment_problem_id
    ) into v_already_rewarded;

    if not v_already_rewarded then
      v_xp_granted := v_problem.xp_reward;
      v_coins_granted := v_problem.coin_reward;

      insert into public.reward_ledger (
        student_id,
        assignment_problem_id,
        submission_id,
        xp_amount,
        coin_amount
      )
      values (
        v_student.id,
        p_assignment_problem_id,
        v_submission.id,
        v_xp_granted,
        v_coins_granted
      );

      update public.student_stats
      set total_xp = total_xp + v_xp_granted,
          coins = coins + v_coins_granted,
          updated_at = timezone('utc'::text, now())
      where student_id = v_student.id;
    end if;
  end if;

  return jsonb_build_object(
    'submission_id', v_submission.id,
    'status', v_status,
    'is_correct', v_is_correct,
    'score', v_score,
    'xp_awarded', v_xp_granted,
    'coins_awarded', v_coins_granted,
    'explanation', case when v_is_correct is true then v_problem.explanation else null end
  );
end;
$$;

-- 3. Teacher Manual Review & Grading RPC
create or replace function public.grade_submission(
  p_submission_id uuid,
  p_score integer,
  p_feedback text
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_auth_uid uuid;
  v_sub public.submissions%rowtype;
  v_ap public.assignment_problems%rowtype;
  v_problem public.problems%rowtype;
  v_classroom public.classrooms%rowtype;
  v_is_correct boolean;
  v_already_rewarded boolean;
  v_xp_granted integer := 0;
  v_coins_granted integer := 0;
begin
  v_auth_uid := auth.uid();

  select * into v_sub from public.submissions where id = p_submission_id;
  if not found then
    raise exception 'Submission not found';
  end if;

  select * into v_ap from public.assignment_problems where id = v_sub.assignment_problem_id;
  select * into v_problem from public.problems where id = v_ap.problem_id;

  -- Ensure caller is the teacher who owns the classroom
  select c.* into v_classroom
  from public.students s
  join public.classrooms c on c.id = s.classroom_id
  where s.id = v_sub.student_id and c.owner_id = v_auth_uid;

  if not found then
    raise exception 'Unauthorized to grade this submission';
  end if;

  v_is_correct := (p_score > 0);

  update public.submissions
  set score = p_score,
      teacher_feedback = p_feedback,
      is_correct = v_is_correct,
      status = 'graded',
      graded_by = v_auth_uid,
      graded_at = timezone('utc'::text, now())
  where id = p_submission_id;

  -- Grant reward if scored positively and not already awarded
  if v_is_correct is true then
    select exists(
      select 1 from public.reward_ledger
      where student_id = v_sub.student_id and assignment_problem_id = v_sub.assignment_problem_id
    ) into v_already_rewarded;

    if not v_already_rewarded then
      -- Proportional reward based on score ratio
      v_xp_granted := round((p_score::numeric / greatest(v_problem.max_score, 1)::numeric) * v_problem.xp_reward);
      v_coins_granted := round((p_score::numeric / greatest(v_problem.max_score, 1)::numeric) * v_problem.coin_reward);

      insert into public.reward_ledger (
        student_id,
        assignment_problem_id,
        submission_id,
        xp_amount,
        coin_amount
      )
      values (
        v_sub.student_id,
        v_sub.assignment_problem_id,
        p_submission_id,
        v_xp_granted,
        v_coins_granted
      );

      update public.student_stats
      set total_xp = total_xp + v_xp_granted,
          coins = coins + v_coins_granted,
          updated_at = timezone('utc'::text, now())
      where student_id = v_sub.student_id;
    end if;
  end if;

  return jsonb_build_object(
    'success', true,
    'submission_id', p_submission_id,
    'xp_awarded', v_xp_granted,
    'coins_awarded', v_coins_granted
  );
end;
$$;
