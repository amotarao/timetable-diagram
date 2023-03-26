import { getArraySet } from '../array/set';
import { getMinutesFromTimeString } from './time';
import { Station, StationPosition, Train } from './types';

export const getStationPositions = (stations: Station[], trains: Train[]): StationPosition[] => {
  const sections: {
    station1: string;
    station2: string;
    minutes: number[];
    minute: number;
  }[] = getArraySet(stations).map(([station1, station2]) => ({
    station1: station1.name,
    station2: station2.name,
    minutes: [],
    minute: 0,
  }));

  trains.forEach((train) => {
    getArraySet(train.schedules).forEach(([schedule1, schedule2]) => {
      const targetSection = sections.find(
        (section) => section.station1 === schedule1.station && section.station2 === schedule2.station
      );
      if (!targetSection) {
        return;
      }
      const time1 = schedule1.departure || schedule1.arrival;
      const time2 = schedule2.arrival || schedule2.departure;
      if (!time1 || !time2) {
        return;
      }
      const minute = getMinutesFromTimeString(time2) - getMinutesFromTimeString(time1);
      targetSection.minutes.push(minute < 0 ? minute + 60 * 24 : minute);
    });
  });

  sections.forEach((section) => {
    const minMinute = Math.min(...section.minutes);
    section.minute =
      section.minutes.reduce((prev, current) => prev + (current <= minMinute + 2 ? current : minMinute + 1), 0) /
      section.minutes.length;
  });

  return stations.map((station, i) => {
    return {
      ...station,
      position: i === 0 ? 0 : sections.slice(0, i).reduce((prev, current) => prev + current.minute, 0),
    };
  });
};
