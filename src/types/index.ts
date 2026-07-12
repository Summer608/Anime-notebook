export interface AnimeItem {
  id: string;
  displayName: string;
  originalInput: string;
  genres: string[];
  coverUrl?: string;
  doubanUrl: string;
  createdAt: number;
  updatedAt: number;
}

export interface NamedSeason {
  suffix: string;
  label: string;
}

export interface NamedMovie {
  suffix: string;
  label: string;
}

export interface AnimeKnowledge {
  aliases: string[];
  fullName: string;
  genres: string[];
  seasons?: number[];
  namedSeasons?: NamedSeason[];
  movies?: boolean;
  namedMovies?: NamedMovie[];
  ovas?: boolean;
  finalSeason?: boolean;
}

export type SortOption = "oldest" | "manual";
export type ViewMode = "card" | "list";
