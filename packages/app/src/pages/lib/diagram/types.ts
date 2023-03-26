export type Station = {
  name: string;
  strong?: boolean;
};

export type Train = {
  name: string;
  type?: string;
  schedules: TrainSchedule[];
};

export type TrainSchedule = {
  station: string;
  arrival?: string;
  departure?: string;
};

export type StationPosition = {
  name: string;
  strong?: boolean;
  position: number;
};
