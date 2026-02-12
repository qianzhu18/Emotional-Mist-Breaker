export type FogTag = "fear" | "obligation" | "guilt";

export type FogType = FogTag | "combo";

export type SenderType = "user_ai" | "opponent_ai";

export type BattleMode = "fast" | "real";

export interface OpponentAI {
  name: string;
  traits: string[];
  system_prompt: string;
}

export interface LevelVisual {
  chapter: string;
  theme_name: string;
  palette: {
    primary: string;
    secondary: string;
    tertiary: string;
    neutral: string;
    bubble_opponent: string;
    bubble_user: string;
  };
  artwork: {
    portrait: string;
    cover: string;
    scene: string;
  };
}

export interface LevelConfig {
  id: number;
  title: string;
  description: string;
  difficulty: 1 | 2 | 3;
  fog_type: FogType;
  unlock_requirement: {
    prev_level: number;
    min_score: number;
  } | null;
  rounds: number;
  background: string;
  learning_focus: string[];
  opponent_ai: OpponentAI;
  visual: LevelVisual;
}

export interface Message {
  sender: SenderType;
  text: string;
  fog_tag?: FogTag | null;
  timestamp: string;
}

export interface ScoreBreakdown {
  boundary: number;
  questioning: number;
  stability: number;
  action: number;
  empathy: number;
}

export interface KeyMoment {
  type: "best" | "worst";
  opponent_line: string;
  user_response: string;
  comment: string;
}

export interface LearningTechnique {
  fog_type: FogTag;
  trigger_line: string;
  pattern_name: string;
  risk: string;
  counter_strategy: string;
}

export interface LearningScenario {
  scene: string;
  recommended_response: string;
}

export interface LearningSheet {
  summary: string;
  manipulations: LearningTechnique[];
  learned_points: string[];
  applicable_scenarios: LearningScenario[];
  strengths: string[];
  weaknesses: string[];
  next_actions: string[];
}

export interface BattleReport {
  total_score: number;
  grade: "S" | "A" | "B" | "C" | "D";
  breakdown: ScoreBreakdown;
  fog_analysis: {
    fear_count: number;
    obligation_count: number;
    guilt_count: number;
  };
  key_moments: KeyMoment[];
  exp_gained: number;
  learning_sheet: LearningSheet;
}

export interface UserRecord {
  id: string;
  secondme_user_id: string;
  access_token: string;
  ai_id: string;
  ai_name: string;
  ai_personality: string;
  ai_avatar: string;
  experience: number;
  level: number;
  created_at: string;
}

export interface UserProgressRecord {
  user_id: string;
  unlocked_levels: number[];
  level_best_scores: Record<string, number>;
  updated_at: string;
}

export interface ConversationRecord {
  id: string;
  user_id: string;
  level_id: number;
  messages: Message[];
  current_round: number;
  max_rounds: number;
  status: "active" | "completed";
  total_score?: number;
  grade?: BattleReport["grade"];
  score_breakdown?: ScoreBreakdown;
  fog_analysis?: BattleReport["fog_analysis"];
  exp_gained?: number;
  key_moments?: KeyMoment[];
  learning_sheet?: LearningSheet;
  created_at: string;
}
