import { useState } from 'react';
import { getArraySet } from '../pages/lib/array/set';
import { getStationPositions } from '../pages/lib/diagram/draw';
import { getMinutesFromTimeString } from '../pages/lib/diagram/time';
import { Station, Train } from '../pages/lib/diagram/types';

export type DiagramFigureProps = {
  className?: string;
  stations: Station[];
  trains: Train[];
};

export const DiagramFigure: React.FC<DiagramFigureProps> = ({ className, stations, trains }) => {
  const stationPositons = getStationPositions(stations, trains);
  const travelTime = stationPositons.reduce((_, stationPosition) => stationPosition.position, 0);

  const fontSize = 12;
  const [hourOffset, setHourOffset] = useState(0);
  const [widthUnit, setWidthUnit] = useState(8);
  const width = 24 * 60 * widthUnit;
  const [heightUnit, setHeightUnit] = useState(25);
  const height = travelTime * heightUnit;
  const paddingX = 120;
  const paddingY = 20;

  return (
    <section className={className}>
      <div className="mb-2 flex gap-2">
        <div className="flex items-center gap-2">
          <label htmlFor="width">Width</label>
          <input
            id="width"
            type="range"
            step={0.25}
            min={0.25}
            max={100}
            value={widthUnit}
            onChange={(e) => setWidthUnit(Number(e.target.value))}
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="height">Height</label>
          <input
            id="height"
            type="range"
            step={0.5}
            min={0.5}
            max={100}
            value={heightUnit}
            onChange={(e) => setHeightUnit(Number(e.target.value))}
          />
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="hour-offset">Hour Offset</label>
          <input
            id="hour-offset"
            type="range"
            step={1}
            min={0}
            max={24}
            value={hourOffset}
            onChange={(e) => setHourOffset(Number(e.target.value))}
          />
        </div>
      </div>
      <svg
        width={width + paddingX * 2}
        height={height + paddingY * 2}
        viewBox={`0 0 ${width + paddingX * 2} ${height + paddingY * 2}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform={`translate(${paddingX} ${paddingY})`}>
          {/* マスク */}
          <mask id="mask">
            <rect x={0} y={0} width={width} height={height} fill="white" />
          </mask>

          {/* 罫線 */}
          <g>
            <rect x={0} y={0} width={width} height={height} fill="white" stroke="#ccc" />
            {[...Array(25)]
              .map((_, i) => i + hourOffset)
              .map((hour, i, self) => (
                <g key={hour}>
                  <text
                    fontSize={fontSize}
                    color="#000"
                    x={(hour - hourOffset) * 60 * widthUnit - fontSize / 2 / 2}
                    y={-5}
                  >
                    {hour}
                  </text>
                  <line
                    x1={(hour - hourOffset) * 60 * widthUnit}
                    y1={0}
                    x2={(hour - hourOffset) * 60 * widthUnit}
                    y2={height}
                    stroke="#ccc"
                    strokeWidth={2}
                  />
                  {i < self.length - 1 &&
                    [10, 20, 30, 40, 50].map((minute) => (
                      <line
                        key={minute}
                        x1={((hour - hourOffset) * 60 + minute) * widthUnit}
                        y1={0}
                        x2={((hour - hourOffset) * 60 + minute) * widthUnit}
                        y2={height}
                        stroke="#ccc"
                        strokeDasharray={minute === 30 ? 0 : 2}
                      />
                    ))}
                </g>
              ))}
          </g>

          {/* 駅 */}
          {stationPositons.map((stationPosition) => (
            <g key={stationPosition.name}>
              <text fontSize={fontSize} color="#000" x={-100} y={stationPosition.position * heightUnit + fontSize / 2}>
                {stationPosition.name.slice(0, 8)}
              </text>
              <line
                x1={0}
                y1={stationPosition.position * heightUnit}
                x2={width}
                y2={stationPosition.position * heightUnit}
                stroke="#ccc"
                strokeWidth={stationPosition.strong ? 2 : 1}
                strokeDasharray={stationPosition.strong ? 0 : 2}
              />
            </g>
          ))}

          {/* 列車 */}
          <g mask="url(#mask)">
            {trains.map((train, i) => {
              const scheduleSet = getArraySet(train.schedules);

              return (
                <g key={i}>
                  {scheduleSet.map(([station1, station2], i) => {
                    const timePosition1 =
                      getMinutesFromTimeString(station1.departure || station1.arrival || '0:00') - hourOffset * 60;
                    const timePosition2 =
                      getMinutesFromTimeString(station2.arrival || station2.departure || '0:00') - hourOffset * 60;
                    const stationPositon1 = stationPositons.find(({ name }) => name === station1.station) ?? {
                      name: '',
                      position: 0,
                    };
                    const stationPositon2 = stationPositons.find(({ name }) => name === station2.station) ?? {
                      name: '',
                      position: 0,
                    };
                    const currentDuration = timePosition2 - timePosition1;
                    const normalDuration = stationPositon2.position - stationPositon1.position;
                    const duration =
                      'arrival' in station2
                        ? currentDuration
                        : currentDuration < normalDuration + 3 // arrival の設定がない場合、推測で arrival を出す
                        ? currentDuration
                        : normalDuration;

                    return (
                      <g key={i}>
                        {i === 0 && (
                          <text
                            fontSize={fontSize}
                            color="#000"
                            x={timePosition1 * widthUnit + widthUnit}
                            y={stationPositon1.position * heightUnit + fontSize}
                          >
                            {train.name}
                          </text>
                        )}
                        <line
                          x1={timePosition1 * widthUnit}
                          y1={stationPositon1.position * heightUnit}
                          x2={(duration + timePosition1) * widthUnit}
                          y2={stationPositon2.position * heightUnit}
                          stroke={train.type === '普通' ? '#000' : train.type === 'エアポート' ? 'blue' : 'red'}
                        />
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </g>
        </g>
      </svg>
    </section>
  );
};
