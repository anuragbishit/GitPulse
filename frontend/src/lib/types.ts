/**
 * Mirrors the FastAPI response shapes exactly. If a field isn't here,
 * the backend doesn't return it — don't invent one.
 */

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
}

export interface Profile {
  login: string;
  name: string;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  /** Optional on GitHub — "" when the profile doesn't set it. Skip the row, don't render a blank. */
  company: string;
  location: string;
  blog: string;
  email: string;
  twitter_username: string;
  created_at: string | null;
  public_gists: number;
}

export interface GitHubUserSearchResult {
  login: string;
  avatar_url: string;
  html_url: string;
  type?: string;
  score?: number;
}

export interface GitHubUserSearchResponse {
  items: GitHubUserSearchResult[];
}

export interface GitHubUser {
  github_id: number | null;
  login: string;
  /** Display name. Empty when the profile has none set — fall back to login. */
  name?: string;
  avatar_url: string;
  html_url: string;
  captured_at: string;
  is_initial?: boolean;
  previous_logins?: string[];
}

export type FollowerEventType = "followed" | "unfollowed";

export interface FollowerEvent {
  github_id: number | null;
  login: string;
  name?: string;
  avatar_url: string;
  html_url: string;
  event_type: FollowerEventType;
  event_at: string;
}

export interface FollowerStats {
  total_followers: number;
  total_followed_events: number;
  total_unfollowed_events: number;
}

export interface FollowerGrowthPoint {
  date: string;
  followed: number;
  unfollowed: number;
  net: number;
}

export interface FollowerGrowth {
  days: number;
  points: FollowerGrowthPoint[];
  followed: number;
  unfollowed: number;
  net: number;
  re_followed: number;
  retention_rate: number;
}

export interface Repo {
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  homepage: string;
  is_fork: boolean;
  is_archived: boolean;
  is_private: boolean;
  language: string;
  languages: Record<string, number>;
  topics: string[];
  stars: number;
  forks: number;
  watchers: number;
  open_issues: number;
  size: number;
  created_at: string;
  updated_at: string;
  /** Last commit push. This — not updated_at — is what "last updated" means. */
  pushed_at: string;
  /** Total commits on the default branch — what GitHub shows on the repo page. */
  commits_total: number;
  /** Last 52 weeks only. A finished repo can have hundreds of commits and 0 here. */
  commits_last_year: number;
  branches: number;
  /** GitHub's rolling 14-day window. */
  traffic_views_total: number;
  traffic_views_unique: number;
  traffic_clones_total: number;
  traffic_clones_unique: number;
  /** Accumulated day-by-day in our DB — keeps growing past GitHub's 14 days. */
  views_all_time: number;
  views_uniques_all_time: number;
  clones_all_time: number;
  clones_uniques_all_time: number;
  traffic_days_recorded: number;
  referrers: { referrer: string; count: number; uniques: number }[];
  popular_paths: { path: string; title: string; count: number; uniques: number }[];
  stars_since_last_sync: number;
  synced_at: string;
}

export interface RepoAnalysis {
  repository: string;
  score: number;
  label: "Strong signal" | "Promising" | "Needs attention";
  strengths: string[];
  risks: string[];
  actions: string[];
  generated_at: string;
}

export type RepoSummary = Pick<
  Repo,
  | "name"
  | "stars"
  | "forks"
  | "language"
  | "html_url"
  | "description"
  | "is_private"
  | "watchers"
  | "commits_total"
  | "commits_last_year"
  | "branches"
  | "pushed_at"
  | "traffic_views_total"
  | "traffic_views_unique"
  | "views_all_time"
>;

export interface TrafficDay {
  repo: string;
  date: string;
  views: number;
  views_uniques: number;
  clones: number;
  clones_uniques: number;
}

export interface ReposOverview {
  total_repos: number;
  public_repos: number;
  private_repos: number;
  total_stars: number;
  total_forks: number;
  total_watchers: number;
  total_branches: number;
  total_views: number;
  total_views_unique: number;
  total_clones: number;
  total_clones_unique: number;
  /** All-time commits across every repo. */
  total_commits: number;
  /** Last 52 weeks only. */
  total_commits_year: number;
  /** How many distinct days of traffic we have on record. */
  traffic_days_recorded: number;
  top_languages: { name: string; bytes: number; count: number }[];
  most_starred: RepoSummary[];
  most_viewed: RepoSummary[];
  synced_at: string | null;
}

export interface StarPoint {
  stars: number;
  captured_at: string;
}

export interface ContributionDay {
  contributionCount: number;
  date: string;
  weekday: number;
}

export interface ContributionWeek {
  contributionDays: ContributionDay[];
}

export interface ContributionYear {
  username: string;
  year: number;
  synced_at: string;
  total_contributions: number;
  total_commits: number;
  total_issues: number;
  total_prs: number;
  total_reviews: number;
  restricted: number;
  weeks: ContributionWeek[];
}

export type ContributionYearSummary = Omit<ContributionYear, "weeks" | "restricted" | "username">;

export interface ContributionsSummary {
  years: ContributionYearSummary[];
  total_all_time: number;
  synced_at: string | null;
  /**
   * The full document for the most recent year, when the summary was requested
   * with `with_latest`. Present so the dashboard's heatmap does not need a second,
   * strictly sequential request — see useContributions.
   */
  latest?: ContributionYear | null;
}

export interface SyncStatus {
  /** ISO timestamp of the last completed sync, from any source. null before the first. */
  last_sync_at: string | null;
}

export interface SyncRun {
  run_id: string;
  status: "running" | "success" | "failed";
  started_at: string;
  finished_at?: string;
  duration_ms?: number;
  result?: {
    total_followers: number;
    new_followers: number;
    lost_followers: number;
    total_repos: number;
    total_contributions: number;
  };
  error?: string;
}

export interface SyncResult {
  run_id: string;
  synced_at: string;
  total_followers: number;
  new_followers: number;
  lost_followers: number;
  renamed: number;
  total_following: number;
  total_repos: number;
  total_contributions: number;
}

export interface AiInsightItem {
  type: "positive" | "warning" | "info" | "recommendation";
  title: string;
  description: string;
}

export interface AiInsights {
  user: string;
  retention_rate: number;
  follower_ratio: number;
  total_followers: number;
  total_following: number;
  lost_followers_count: number;
  insights: AiInsightItem[];
  generated_at: string;
}

export interface GrowthProjection {
  days: number;
  projected_followers: number;
}

export interface GrowthForecast {
  current_followers: number;
  daily_net_average: number;
  baseline_daily_net_average: number;
  trend: "accelerating" | "slowing" | "steady";
  projections: GrowthProjection[];
  data_points: number;
  generated_at: string;
}

export interface AudienceQuality {
  user: string;
  score: number;
  status: "Strong" | "Healthy" | "Watchlist" | "At risk";
  retention_rate: number;
  net_growth: number;
  total_followers: number;
  total_following: number;
  follower_ratio: number;
  recommendations: string[];
  generated_at: string;
}

export interface RepositoryOpportunity {
  name: string;
  score: number;
  quality: "Strong" | "Promising" | "Early";
  stars: number;
  views_all_time: number;
  forks: number;
  commits_last_year: number;
  description: string;
}

export interface RepositoryOpportunityRadar {
  top_pick: RepositoryOpportunity | null;
  opportunities: RepositoryOpportunity[];
  generated_at: string;
}

export interface SmartAlert {
  severity: "positive" | "warning";
  kind: "audience" | "retention" | "repository" | "sync";
  title: string;
  description: string;
}

export interface SmartAlerts {
  alerts: SmartAlert[];
  generated_at: string;
}
