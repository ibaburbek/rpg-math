export interface CharacterDefinition {
  id: string;
  nameKz: string;
  nameEn: string;
  titleKz: string;
  descriptionKz: string;
  avatarBg: string;
  accentColor: string;
  iconName: string; // lucide icon identifier
  roleLore: string;
}

export const CHARACTERS: CharacterDefinition[] = [
  {
    id: 'forest_explorer',
    nameKz: 'Орман Зерттеушісі',
    nameEn: 'Forest Explorer',
    titleKz: 'Табиғат геометриясының шебері',
    descriptionKz: 'Орман жапырақтары мен бұтақтарынан геометриялық заңдылықтар мен сызықтарды табады.',
    avatarBg: 'bg-emerald-100 border-emerald-300 text-emerald-700',
    accentColor: '#059669',
    iconName: 'Compass',
    roleLore: 'Жасыл желекті өлкелерді зерттеп, карта сызу арқылы математикалық өлшемдерді меңгереді.',
  },
  {
    id: 'little_inventor',
    nameKz: 'Жас Өнертапқыш',
    nameEn: 'Little Inventor',
    titleKz: 'Механика мен есептеу шебері',
    descriptionKz: 'Бөлшектерді жинақтап, формулалар арқылы ғажайып механизмдер құрастырады.',
    avatarBg: 'bg-amber-100 border-amber-300 text-amber-700',
    accentColor: '#d97706',
    iconName: 'Wrench',
    roleLore: 'Күрделі сандарды бөлшектеп, тетіктерді дәл есеппен үйлестіреді.',
  },
  {
    id: 'star_mage',
    nameKz: 'Жұлдыз Сиқыршысы',
    nameEn: 'Star Mage',
    titleKz: 'Астрономиялық есептер данасы',
    descriptionKz: 'Жұлдыздар шоғырының қашықтығы мен бұрыштарын көз ілеспес жылдамдықпен шешеді.',
    avatarBg: 'bg-indigo-100 border-indigo-300 text-indigo-700',
    accentColor: '#4f46e5',
    iconName: 'Sparkles',
    roleLore: 'Аспан әлемінің шексіз сандарын сиқырлы формулаларға бағындырады.',
  },
  {
    id: 'trail_scout',
    nameKz: 'Жол Бастаушы',
    nameEn: 'Trail Scout',
    titleKz: 'Жылдамдық пен бағдар шебері',
    descriptionKz: 'Қашықтық пен уақыт есептерін лезде шешіп, ең қысқа тиімді жолды табады.',
    avatarBg: 'bg-teal-100 border-teal-300 text-teal-700',
    accentColor: '#0d9488',
    iconName: 'MapPin',
    roleLore: 'Кез келген лабиринттің шешімін координаттар жүйесі арқылы анықтайды.',
  },
  {
    id: 'tech_builder',
    nameKz: 'Техно-Құрастырушы',
    nameEn: 'Tech Builder',
    titleKz: 'Алгоритмдер мен модельдер сәулетшісі',
    descriptionKz: 'Кеңістіктік фигуралар мен 3D модельдерді дәлдікпен жобалайды.',
    avatarBg: 'bg-cyan-100 border-cyan-300 text-cyan-700',
    accentColor: '#0891b2',
    iconName: 'Cpu',
    roleLore: 'Кеңістік көлемі мен ауданын есептеп, берік виртуалды нысандар тұрғызады.',
  },
  {
    id: 'rune_keeper',
    nameKz: 'Руна Сақтаушысы',
    nameEn: 'Rune Keeper',
    titleKz: 'Ежелгі логика мен символдар ұстасы',
    descriptionKz: 'Математикалық жұмбақтар мен белгісіз x айнымалыларын ашуға маманданған.',
    avatarBg: 'bg-violet-100 border-violet-300 text-violet-700',
    accentColor: '#7c3aed',
    iconName: 'Shield',
    roleLore: 'Теңдеулердің жасырын құпиясын ашып, логикалық сабақтастықты қорғайды.',
  },
];

export function getCharacterById(id: string): CharacterDefinition {
  return CHARACTERS.find((c) => c.id === id) || CHARACTERS[0];
}
