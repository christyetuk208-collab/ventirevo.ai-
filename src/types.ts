export type ThemeMode = 'dark' | 'light' | 'system';

export type UserRole = 'owner' | 'admin' | 'member';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type BusinessType = 'new' | 'existing';
export type BusinessModel = 'online' | 'physical' | 'hybrid';
export type BusinessStage = 'ideation' | 'validation' | 'pre_revenue' | 'early_revenue' | 'scaling';

export interface Business {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  type: BusinessType;
  stage: BusinessStage;
  status: 'active' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface BusinessProfile {
  id: string;
  business_id: string;
  is_new: boolean;
  country: string;
  city: string;
  industry: string;
  starting_capital: number;
  currency: string;
  skills: string[];
  experience: string;
  available_time_hours_per_week: number;
  business_interests: string[];
  business_model: BusinessModel;
  products_services: string;
  current_pricing: string;
  target_customers: string;
  main_problem: string;
  main_goal: string;
  updated_at: string;
}

export type GoalMetricType = 'revenue' | 'customers' | 'product_launch' | 'validation' | 'operational' | 'other';
export type GoalStatus = 'in_progress' | 'completed' | 'paused' | 'cancelled';

export interface BusinessGoal {
  id: string;
  business_id: string;
  title: string;
  metric_type: GoalMetricType;
  target_value: number;
  current_value: number;
  unit: string;
  deadline?: string;
  status: GoalStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type ProblemSeverity = 'critical' | 'high' | 'medium' | 'low';
export type ProblemCategory = 'acquisition' | 'conversion' | 'retention' | 'pricing' | 'product_fit' | 'operations' | 'cashflow' | 'strategy';
export type ProblemStatus = 'unsolved' | 'diagnosing' | 'in_remediation' | 'resolved';

export interface BusinessProblem {
  id: string;
  business_id: string;
  title: string;
  severity: ProblemSeverity;
  category: ProblemCategory;
  description: string;
  root_causes?: string[];
  recommended_actions?: string[];
  status: ProblemStatus;
  diagnosis?: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessOpportunity {
  id: string;
  business_id: string;
  title: string;
  description: string;
  problem_solved?: string;
  target_customer?: string;
  why_it_fits?: string;
  demand_evidence?: string;
  competition_level: 'low' | 'medium' | 'high';
  competition_details?: string;
  startup_requirements?: string[];
  risks_and_obstacles?: string[];
  business_model_details?: string;
  demand_score: number; // 1 - 100
  founder_fit_score: number; // 1 - 100
  capital_required: number;
  speed_to_first_customer_days: number;
  risk_level: 'low' | 'medium' | 'high';
  profit_margin_pct?: number; // 1 - 100%
  scalability_score: number; // 1 - 100
  overall_leverage_score: number; // 1 - 100
  status: 'discovered' | 'evaluating' | 'pursuing' | 'deprioritized' | 'archived';
  key_hypotheses: string[];
  next_action?: string;
  created_at: string;
}

export interface CompetitorAnalysis {
  id: string;
  business_id: string;
  name: string;
  website_url?: string;
  value_proposition: string;
  pricing_model: string;
  target_segment: string;
  strengths: string[];
  weaknesses: string[];
  market_quadrant?: 'budget_leader' | 'premium_specialist' | 'general_incumbent' | 'nimble_disruptor';
  x_position?: number; // 0-100 (e.g. Price: Low to High)
  y_position?: number; // 0-100 (e.g. Specialization: Generic to Specialized)
  counter_strategy: string;
  created_at: string;
}

export interface CustomerProfileICP {
  id: string;
  business_id: string;
  persona_name: string;
  title_role: string;
  demographics: string;
  industry_vertical: string;
  acute_pain_points: string[];
  desired_outcomes: string[];
  purchasing_triggers: string[];
  high_converting_hooks: string[];
  retention_tactics: string[];
  journey_stages?: Array<{
    stage: 'Awareness' | 'Consideration' | 'Decision' | 'Retention' | 'Advocacy';
    touchpoint: string;
    action_trigger: string;
  }>;
  created_at: string;
}

export interface TaskLearningRecord {
  id: string;
  task_id: string;
  business_id: string;
  task_title: string;
  expected_outcome: string;
  actual_result: string;
  metric_delta?: string;
  key_learning: string;
  promoted_to_memory: boolean;
  created_business_memory_id?: string;
  created_at: string;
}

export interface DiagnosticSession {
  id: string;
  business_id: string;
  category: ProblemCategory;
  symptom: string;
  five_whys: string[];
  root_cause: string;
  severity: ProblemSeverity;
  prescribed_action: string;
  leverage_score: number;
  generated_task_id?: string;
  created_at: string;
}

export interface GrowthPlan {
  id: string;
  business_id: string;
  title: string;
  objective: string;
  status: 'active' | 'completed' | 'draft' | 'archived';
  timeframe_weeks: number;
  progress_pct: number;
  created_at: string;
  updated_at: string;
}

export type TaskPriority = 'highest_leverage' | 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done';
export type TaskCategory = 'customer_discovery' | 'offer_improvement' | 'marketing' | 'sales' | 'operations' | 'diagnostics';

export interface GrowthTask {
  id: string;
  growth_plan_id: string;
  business_id: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  leverage_score: number; // 1 - 100
  estimated_hours: number;
  due_date?: string;
  outcome_notes?: string;
  metrics_impact?: string;
  completed_at?: string;
  created_at: string;
}

export type MemoryCategory =
  | 'business_fundamentals'
  | 'products_and_services'
  | 'customer_profiles'
  | 'pricing_and_unit_economics'
  | 'strategic_goals'
  | 'important_decisions'
  | 'validated_findings'
  | 'active_problems'
  | 'operational_learnings';

export type InformationReliability = 'verified_fact' | 'user_provided' | 'estimate' | 'assumption' | 'hypothesis';
export type BusinessMemoryReliability = InformationReliability;

export interface BusinessMemory {
  id: string;
  business_id: string;
  category: MemoryCategory;
  key: string;
  value: string;
  reliability: InformationReliability;
  source?: string;
  confidence_pct: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AIConversation {
  id: string;
  business_id: string;
  user_id: string;
  title: string;
  model_used: string;
  created_at: string;
  updated_at: string;
}

export interface AICitation {
  id: string;
  title: string;
  source: string;
  type: 'business_memory' | 'user_profile' | 'verified_metric' | 'external_research' | 'model_assumption';
  excerpt: string;
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: AICitation[];
  verified_facts?: string[];
  user_provided_info?: string[];
  estimates?: string[];
  assumptions?: string[];
  hypotheses?: string[];
  recommended_next_action?: {
    title: string;
    action_type: TaskCategory;
    leverage_score: number;
    description: string;
  };
  tokens_used?: number;
  created_at: string;
}

export interface ResearchSession {
  id: string;
  business_id: string;
  topic: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  summary: string;
  findings: Array<{
    claim: string;
    reliability: InformationReliability;
    evidence: string;
  }>;
  created_at: string;
}

export interface ResearchSource {
  id: string;
  research_session_id: string;
  title: string;
  url?: string;
  snippet: string;
  reliability_score: number;
  verified: boolean;
  created_at: string;
}

export interface UploadRecord {
  id: string;
  business_id: string;
  user_id: string;
  file_name: string;
  file_type: string;
  file_size_bytes: number;
  data_url?: string; // Stored securely base64 / blob
  processed_status: 'uploaded' | 'analyzing' | 'indexed' | 'failed';
  lens?: 'landing_page_audit' | 'offer_audit' | 'financial_pl' | 'competitor_collateral' | 'customer_feedback' | 'general_business';
  summary?: string;
  findings?: Array<{
    category: string;
    observation: string;
    flaw_or_vulnerability?: string;
    leverage_recommendation?: string;
    confidence: 'verified_fact' | 'user_provided' | 'estimate' | 'hypothesis';
  }>;
  actionable_tasks?: string[];
  extracted_memory_candidates?: string[];
  created_at: string;
}

export type MarketingContentType =
  | 'offer'
  | 'ad'
  | 'campaign'
  | 'social_post'
  | 'caption'
  | 'sales_message'
  | 'followup_message'
  | 'email_campaign'
  | 'landing_page_copy';

export interface MarketingAsset {
  id: string;
  business_id: string;
  user_id: string;
  content_type: MarketingContentType;
  title: string;
  content: string;
  channel?: 'linkedin' | 'x_twitter' | 'meta_ads' | 'google_ads' | 'cold_email' | 'newsletter' | 'landing_page' | 'direct_dm';
  target_audience?: string;
  headline?: string;
  body?: string;
  call_to_action?: string;
  tags: string[];
  requires_approval: boolean;
  approval_status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'converted_to_task';
  associated_task_id?: string;
  version: number;
  created_at: string;
  updated_at: string;
}

export type ApprovalActionType =
  | 'send_message'
  | 'publish_content'
  | 'spend_budget'
  | 'account_modification';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'executed';
export type RiskLevel = 'low' | 'medium' | 'high' | 'financial';

export interface ApprovalAction {
  id: string;
  business_id: string;
  user_id: string;
  action_type: ApprovalActionType;
  title: string;
  description: string;
  risk_level: RiskLevel;
  status: ApprovalStatus;
  channel_or_target: string;
  payload: {
    content?: string;
    recipient?: string;
    financial_amount_usd?: number;
    platform?: string;
    scheduled_for?: string;
    metadata?: Record<string, any>;
  };
  proposed_by: string; // e.g. "Venturevo Studio AI"
  approved_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  executed_at?: string;
  created_at: string;
}

export type SubscriptionTier = 'free' | 'pro' | 'max';
export type SubscriptionState = 'FREE' | 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED';
export type BillingCycle = 'monthly' | 'annual';

export interface PlanLimits {
  tier: SubscriptionTier;
  name: string;
  monthly_price_usd: number;
  annual_price_usd: number;
  max_businesses: number;
  max_ai_requests_per_month: number;
  max_research_sessions_per_month: number;
  max_file_uploads_per_month: number;
  max_file_size_mb: number;
  max_memory_items: number;
  max_active_tasks: number;
  max_content_generations_per_month: number;
  marketing_studio_access: boolean;
  customer_growth_access: boolean;
  team_seats: number;
  role_based_access: boolean;
  priority_processing: boolean;
}

export interface LocalizedCurrency {
  code: string;
  symbol: string;
  rate_multiplier: number; // vs USD
  name: string;
  is_custom_override?: boolean;
}

export interface Subscription {
  id: string;
  user_id: string;
  tier: SubscriptionTier;
  state: SubscriptionState;
  billing_cycle: BillingCycle;
  currency: string;
  amount_paid: number;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  payment_method_last4?: string;
  payment_method_brand?: string;
  trial_ends_at?: string;
  created_at: string;
  updated_at: string;
}

export interface InvoiceRecord {
  id: string;
  user_id: string;
  subscription_id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: 'paid' | 'open' | 'failed' | 'refunded';
  tier: SubscriptionTier;
  billing_cycle: BillingCycle;
  paid_at?: string;
  pdf_url?: string;
  created_at: string;
}

export interface UserUsageQuota {
  tier: SubscriptionTier;
  ai_requests_used: number;
  ai_requests_limit: number;
  research_used: number;
  research_limit: number;
  files_used: number;
  files_limit: number;
  businesses_used: number;
  businesses_limit: number;
  memory_used: number;
  memory_limit: number;
  content_used: number;
  content_limit: number;
  period_resets_at: string;
}

export interface ReferralRecord {
  id: string;
  referrer_user_id: string;
  referrer_name: string;
  referred_email: string;
  referral_code: string;
  status: 'pending' | 'signed_up' | 'qualified' | 'rewarded';
  reward_type: 'credit_usd' | 'free_month_pro' | 'bonus_ai_quota';
  reward_value: number | string;
  reward_granted: boolean;
  is_fraud_flagged: boolean;
  fraud_reason?: string;
  signup_ip?: string;
  created_at: string;
  qualified_at?: string;
  rewarded_at?: string;
}

export interface GeneratedContent {
  id: string;
  business_id: string;
  content_type: 'offer_copy' | 'sales_script' | 'growth_plan' | 'customer_persona' | 'diagnostic_report';
  title: string;
  content: string;
  created_at: string;
}

export interface UsageRecord {
  id: string;
  user_id: string;
  business_id: string;
  request_type: 'chat' | 'diagnosis' | 'task_generation' | 'research' | 'studio_marketing' | 'file_analysis';
  provider: 'gemini' | 'openai' | 'rule_engine';
  model: string;
  tokens_in: number;
  tokens_out: number;
  cost_est_usd: number;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  ip_address?: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'insight' | 'task_reminder' | 'security' | 'milestone' | 'system' | 'approval_required' | 'billing' | 'referral';
  is_read: boolean;
  link?: string;
  created_at: string;
}

export interface SystemErrorLog {
  id: string;
  error_type: string;
  endpoint: string;
  message: string;
  status_code: number;
  occurred_at: string;
}

export interface AdminMetrics {
  total_users: number;
  active_subscriptions: number;
  plan_distribution: {
    free: number;
    pro: number;
    max: number;
  };
  verified_revenue_usd: number;
  ai_usage: {
    total_requests: number;
    total_tokens: number;
    total_cost_usd: number;
    by_provider: Record<string, number>;
    by_request_type: Record<string, number>;
  };
  feature_usage: {
    research: number;
    studio: number;
    files: number;
    diagnostics: number;
    opportunities: number;
    growth_plans: number;
    tasks: number;
    location_analyses: number;
  };
  subscription_status: {
    active: number;
    trialing: number;
    past_due: number;
    canceled: number;
  };
  system_health: {
    status: 'healthy' | 'degraded' | 'maintenance';
    uptime_seconds: number;
    api_latency_ms: number;
    memory_usage_mb: number;
  };
  recent_errors: SystemErrorLog[];
}

export interface FeatureFlagConfig {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'ai' | 'monetization' | 'experimental' | 'security';
  updated_at: string;
}

export interface AgentContact {
  id: string;
  name: string;
  phone: string;
  whatsapp_number: string;
  whatsapp_link: string;
  agency_name: string;
  rating: number;
  reviews_count: number;
  verified: boolean;
  road_name: string;
  city: string;
  available_shops_count: number;
  average_rent_range: string;
  specialty: string;
}

export interface StartupFinancingGuide {
  total_startup_capital_ngn: number;
  total_startup_capital_usd: number;
  thrift_esusu_plan: string;
  personal_bootstrap_strategy: string;
  family_angel_script: string;
  recommended_loan_apps: {
    name: string;
    max_amount: string;
    speed: string;
    interest: string;
    best_for: string;
  }[];
  supplier_credit_hack: string;
}

export interface RoadStudyCondition {
  power_status: string; // e.g. "Frequent Outages / Band D (2-4 hrs/day)" or "Reliable Grid / Band A"
  solar_necessity_score: number; // 1-10
  foot_traffic_volume: string; // e.g. "Extremely Dense (20,000+ daily pedestrians)"
  vehicle_traffic_flow: string; // e.g. "Continuous Keke/Danfo & Private vehicle corridor"
  market_and_anchors: string[]; // Nearby markets, schools, banks, hospitals
  existing_crowded_businesses: string[]; // What EVERYONE is already doing (barbers, POS, pepper soup)
  people_lacking_gaps: string[]; // What people are DESPERATELY LACKING here
  best_road_side: string; // "Right side heading toward Market Roundabout (High morning foot traffic & afternoon shade)"
}

export interface DailySalesLog {
  id: string;
  user_id: string;
  date: string;
  road_name: string;
  business_name: string;
  revenue: number;
  expenses: number;
  net_profit: number;
  customers_served: number;
  challenge_faced: string;
  coach_encouragement: string;
  coach_action_for_tomorrow: string;
  created_at: string;
}

export interface BillionaireDailyAction {
  day_number: number;
  title: string;
  objective: string;
  step_by_step: string[];
  target_metric: string;
  completed: boolean;
  completed_at?: string;
}

export interface RoadBusinessIdea {
  id: string;
  title: string;
  sector: string;
  target_audience: string;
  estimated_monthly_revenue_local: string;
  estimated_monthly_revenue_usd: string;
  startup_capex_local: string;
  startup_capex_usd: string;
  net_profit_margin_pct: number;
  breakeven_months: number;
  traffic_synergy_reason: string;
  why_it_will_blow_2_lines: string; // 2 short punchy lines explaining why it will blow on this road
  high_margin_products: string[];
  key_risks_and_mitigation: string;
}

export interface AgentLeasingProtocol {
  overview: string;
  fee_structure_guide: string[];
  inspection_checklist: string[];
  verification_steps: string[];
  red_flags_to_avoid: string[];
  safety_warning: string;
  sample_agent_brief: string;
  best_side_of_road_tip: string;
}

export interface BillionaireScalingRoadmap {
  phase_1_launch: {
    duration: string;
    target_metric: string;
    actions: string[];
  };
  phase_2_multi_unit: {
    duration: string;
    target_metric: string;
    actions: string[];
  };
  phase_3_supply_chain: {
    duration: string;
    target_metric: string;
    actions: string[];
  };
  phase_4_enterprise_conglomerate: {
    duration: string;
    target_metric: string;
    actions: string[];
  };
}

export interface RoadLocationReport {
  id: string;
  road_name: string;
  city: string;
  state_or_region: string;
  country: string;
  commercial_vibe: string;
  traffic_density: 'Extremely High' | 'High' | 'Moderate' | 'Seasonal';
  purchasing_power_tier: 'Low' | 'Middle-Class' | 'Affluent / Premium' | 'Mixed Commercial';
  anchor_commercial_magnets: string[];
  road_study: RoadStudyCondition;
  recommended_businesses: RoadBusinessIdea[];
  agents: AgentContact[];
  financing_guide: StartupFinancingGuide;
  agent_leasing_protocol: AgentLeasingProtocol;
  scaling_roadmap: BillionaireScalingRoadmap;
  daily_actions: BillionaireDailyAction[];
  highest_leverage_next_action: string;
  created_at: string;
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'ai' | 'monetization' | 'security' | 'general';
  updated_at: string;
}

export type ActiveView =
  | 'dashboard'
  | 'chat'
  | 'location_intelligence'
  | 'studio'
  | 'files'
  | 'approvals'
  | 'billing'
  | 'referrals'
  | 'admin'
  | 'legal'
  | 'start_business'
  | 'opportunities'
  | 'competitors'
  | 'customer_growth'
  | 'research'
  | 'growth'
  | 'diagnostics'
  | 'memory'
  | 'profile'
  | 'settings';
