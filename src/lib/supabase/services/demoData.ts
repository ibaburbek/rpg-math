import {
  Classroom,
  Problem,
  ProblemAnswerKey,
  Assignment,
  AssignmentProblem,
  Student,
  StudentStats,
  Submission,
  RewardLedger,
  StudentItem,
  Room,
} from '@/src/types/database';

export const DEMO_TEACHER_ID = '11111111-1111-1111-1111-111111111111';
export const DEMO_STUDENT_ID = '22222222-2222-2222-2222-222222222222';
export const DEMO_CLASSROOM_ID = '33333333-3333-3333-3333-333333333333';

export const initialClassrooms: Classroom[] = [
  {
    id: DEMO_CLASSROOM_ID,
    owner_id: DEMO_TEACHER_ID,
    name: '6-«А» Математика сыныбы',
    grade_range: '6',
    join_code: 'MATH6A',
    status: 'active',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '33333333-3333-3333-3333-444444444444',
    owner_id: DEMO_TEACHER_ID,
    name: '5-«Б» Логика мен есеп',
    grade_range: '5',
    join_code: 'LOGIC5',
    status: 'active',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const initialProblems: Problem[] = [
  {
    id: 'p-001',
    owner_id: DEMO_TEACHER_ID,
    title: 'Жай бөлшектерді қосу',
    statement: '3/8 және 1/4 бөлшектерінің қосындысын табыңыз. Жауапты қысқартылмайтын бөлшек ретінде (мысалы 5/8) немесе ондық бөлшекпен (0.625) жазыңыз.',
    image_path: null,
    grade: 6,
    subject: 'Математика',
    topic: 'Жай бөлшектер',
    difficulty: 'easy',
    answer_type: 'numeric',
    answer_options: null,
    explanation: '3/8 + 1/4 = 3/8 + 2/8 = 5/8 = 0.625. Ортақ бөлім 8 болады.',
    hint: 'Бөлімдерін бірдей санға (8-ге) келтіріңіз.',
    grading_mode: 'auto',
    max_score: 10,
    xp_reward: 60,
    coin_reward: 15,
    status: 'published',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'p-002',
    owner_id: DEMO_TEACHER_ID,
    title: 'Тіктөртбұрыштың ауданы мен периметрі',
    statement: 'Тіктөртбұрыштың ені 6 см, ал ұзындығы одан 2 есе артық. Тіктөртбұрыштың ауданын (см²) табыңыз.',
    image_path: null,
    grade: 5,
    subject: 'Математика',
    topic: 'Геометрия негіздері',
    difficulty: 'medium',
    answer_type: 'multiple_choice',
    answer_options: ['36', '72', '48', '144'],
    explanation: 'Ұзындығы: 6 * 2 = 12 см. Ауданы: S = 6 * 12 = 72 см².',
    hint: 'Алдымен ұзындығын тауып алып, ұзындығы мен енін көбейтіңіз.',
    grading_mode: 'auto',
    max_score: 10,
    xp_reward: 80,
    coin_reward: 20,
    status: 'published',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'p-003',
    owner_id: DEMO_TEACHER_ID,
    title: 'Сызықтық теңдеуді шешу',
    statement: 'Теңдеуді шешіңіз: 4x - 7 = 25. x-тің мәнін табыңыз.',
    image_path: null,
    grade: 6,
    subject: 'Математика',
    topic: 'Бір айнымалысы бар теңдеулер',
    difficulty: 'easy',
    answer_type: 'numeric',
    answer_options: null,
    explanation: '4x = 25 + 7 => 4x = 32 => x = 8.',
    hint: '-7 санын теңдіктің оң жағына таңбасын өзгертіп көшіріңіз.',
    grading_mode: 'auto',
    max_score: 10,
    xp_reward: 70,
    coin_reward: 18,
    status: 'published',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'p-004',
    owner_id: DEMO_TEACHER_ID,
    title: 'Жылдамдық пен қашықтық есебі',
    statement: 'Екі ауылдан бір-біріне қарама-қарсы бағытта екі салт атты шықты. Біреуінің жылдамдығы 12 км/сағ, екіншісінікі 15 км/сағ. Олар 2 сағаттан кейін кездесті. Екі ауылдың арақашықтығын табу жолын толық сипаттап жазыңыз.',
    image_path: null,
    grade: 5,
    subject: 'Математика',
    topic: 'Қозғалысқа берілген есептер',
    difficulty: 'hard',
    answer_type: 'text',
    answer_options: null,
    explanation: 'Жақындау жылдамдығы: 12 + 15 = 27 км/сағ. Қашықтық: 27 * 2 = 54 км.',
    hint: 'Жақындау жылдамдығын тауып, уақытқа көбейтіңіз.',
    grading_mode: 'manual',
    max_score: 15,
    xp_reward: 120,
    coin_reward: 35,
    status: 'published',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const initialAnswerKeys: Record<string, ProblemAnswerKey> = {
  'p-001': {
    problem_id: 'p-001',
    correct_answer: '0.625',
    accepted_answers: ['5/8', '0,625', '5 / 8'],
    numeric_tolerance: 0.001,
    updated_at: new Date().toISOString(),
  },
  'p-002': {
    problem_id: 'p-002',
    correct_answer: '72',
    accepted_answers: ['72 см²', '72 см2'],
    numeric_tolerance: null,
    updated_at: new Date().toISOString(),
  },
  'p-003': {
    problem_id: 'p-003',
    correct_answer: '8',
    accepted_answers: ['8.0', 'x=8', 'x = 8'],
    numeric_tolerance: 0.001,
    updated_at: new Date().toISOString(),
  },
  'p-004': {
    problem_id: 'p-004',
    correct_answer: '54',
    accepted_answers: ['54 км', '54км'],
    numeric_tolerance: null,
    updated_at: new Date().toISOString(),
  },
};

export const initialAssignments: Assignment[] = [
  {
    id: 'asg-001',
    owner_id: DEMO_TEACHER_ID,
    classroom_id: DEMO_CLASSROOM_ID,
    title: '1-Квест: Бөлшектер мен фигуралар патшалығы',
    instructions: 'Барлық есептерді ретімен шығарып, кейіпкеріңізге жаңа деңгей мен монеталар жинаңыз!',
    due_at: new Date(Date.now() + 86400000 * 5).toISOString(),
    status: 'published',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const initialAssignmentProblems: AssignmentProblem[] = [
  {
    id: 'ap-001',
    assignment_id: 'asg-001',
    problem_id: 'p-001',
    position: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ap-002',
    assignment_id: 'asg-001',
    problem_id: 'p-002',
    position: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ap-003',
    assignment_id: 'asg-001',
    problem_id: 'p-003',
    position: 3,
    created_at: new Date().toISOString(),
  },
  {
    id: 'ap-004',
    assignment_id: 'asg-001',
    problem_id: 'p-004',
    position: 4,
    created_at: new Date().toISOString(),
  },
];

export const initialStudents: Student[] = [
  {
    id: DEMO_STUDENT_ID,
    auth_user_id: 'auth-user-student-1',
    classroom_id: DEMO_CLASSROOM_ID,
    display_name: 'Арсен Сапаров',
    character_id: 'forest_explorer',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 's-002',
    auth_user_id: 'auth-user-student-2',
    classroom_id: DEMO_CLASSROOM_ID,
    display_name: 'Әмина Қасымова',
    character_id: 'star_mage',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 's-003',
    auth_user_id: 'auth-user-student-3',
    classroom_id: DEMO_CLASSROOM_ID,
    display_name: 'Дәурен Серікбай',
    character_id: 'little_inventor',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const initialStudentStats: Record<string, StudentStats> = {
  [DEMO_STUDENT_ID]: {
    student_id: DEMO_STUDENT_ID,
    total_xp: 160, // Level 2 (100 xp needed for lvl 2, 300 for lvl 3)
    coins: 75,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
  },
  's-002': {
    student_id: 's-002',
    total_xp: 320, // Level 3
    coins: 140,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
  },
  's-003': {
    student_id: 's-003',
    total_xp: 90, // Level 1
    coins: 50,
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date().toISOString(),
  },
};

export const initialSubmissions: Submission[] = [
  {
    id: 'sub-001',
    student_id: DEMO_STUDENT_ID,
    assignment_problem_id: 'ap-001',
    answer: '0.625',
    is_correct: true,
    score: 10,
    teacher_feedback: 'Керемет! Жай бөлшекті ондық бөлшекке дұрыс айналдырдың.',
    status: 'graded',
    attempt_number: 1,
    submitted_at: new Date(Date.now() - 40000000).toISOString(),
    graded_by: DEMO_TEACHER_ID,
    graded_at: new Date(Date.now() - 39000000).toISOString(),
  },
  {
    id: 'sub-002',
    student_id: DEMO_STUDENT_ID,
    assignment_problem_id: 'ap-004',
    answer: 'Жақындау жылдамдығы 12 + 15 = 27 км/сағ. Олар 2 сағат жүргендіктен, 27 * 2 = 54 км қашықтық болады.',
    is_correct: null,
    score: null,
    teacher_feedback: null,
    status: 'pending',
    attempt_number: 1,
    submitted_at: new Date(Date.now() - 10000000).toISOString(),
    graded_by: null,
    graded_at: null,
  },
];

export const initialRewardLedger: RewardLedger[] = [
  {
    id: 'rew-001',
    student_id: DEMO_STUDENT_ID,
    assignment_problem_id: 'ap-001',
    submission_id: 'sub-001',
    xp_amount: 60,
    coin_amount: 15,
    created_at: new Date(Date.now() - 39000000).toISOString(),
  },
];

export const initialStudentItems: StudentItem[] = [
  {
    id: 'si-001',
    student_id: DEMO_STUDENT_ID,
    inventory_id: 'item_desk_wood',
    acquired_at: new Date(Date.now() - 86400000).toISOString(),
    is_equipped: true,
    placement: 'desk',
  },
  {
    id: 'si-002',
    student_id: DEMO_STUDENT_ID,
    inventory_id: 'item_plant_bonsai',
    acquired_at: new Date(Date.now() - 86400000).toISOString(),
    is_equipped: true,
    placement: 'plant',
  },
];

export const initialRooms: Record<string, Room> = {
  [DEMO_STUDENT_ID]: {
    id: 'room-001',
    student_id: DEMO_STUDENT_ID,
    room_data: {
      wall: 'item_wall_clock',
      floor: 'item_floor_mosaic',
      desk: 'item_desk_wood',
      plant: 'item_plant_bonsai',
      bed: null,
      theme: 'sage_warm',
    },
    updated_at: new Date().toISOString(),
  },
};
