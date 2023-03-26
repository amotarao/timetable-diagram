// https://chat.openai.com/chat/30004e01-a1d1-4966-b2f3-e099ac3aa8b4

import { TrainSchedule } from './types';

export const calculateTravelTime = (schedules: TrainSchedule[]): number => {
  const departureTimes: string[] = [];
  const arrivalTimes: string[] = [];

  // 出発時刻と到着時刻を配列に追加
  schedules.forEach((schedule) => {
    if (schedule.departure !== undefined) {
      departureTimes.push(schedule.departure);
    }
    if (schedule.arrival !== undefined) {
      arrivalTimes.push(schedule.arrival);
    }
  });

  // 最初の出発時刻と最後の到着時刻を取得
  const firstDeparture = departureTimes[0];
  const lastArrival = arrivalTimes[arrivalTimes.length - 1];

  if (!firstDeparture || !lastArrival) {
    throw new Error('出発時刻または到着時刻が見つかりませんでした');
  }

  // 所要時間を計算
  const departureTimeInMinutes = getMinutesFromTimeString(firstDeparture);
  const arrivalTimeInMinutes = getMinutesFromTimeString(lastArrival);
  const travelTimeInMinutes = arrivalTimeInMinutes - departureTimeInMinutes;

  // 分単位の所要時間を返す
  return travelTimeInMinutes;
};

// 時刻の文字列から分単位の数値を取得する関数
export const getMinutesFromTimeString = (timeString: string): number => {
  const [hours, minutes] = timeString.split(':').map(Number);

  if (hours === undefined || minutes === undefined) {
    throw new Error('時間または分が不正な値です');
  }

  return hours * 60 + minutes;
};
