/* eslint-disable react/prop-types */
import { useEffect, useRef, useState, memo, useMemo, useCallback } from 'react';
import { useTimelineContext } from 'renderer/context/TimelineContext';
import { useIndexContext } from 'renderer/context/IndexContext';
import styles from './Timeline.module.scss';

function isToday(date) {
  const today = new Date();

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

const getLocalDateString = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate())
    .toISOString()
    .substring(0, 10);

const countEntriesByDate = (entryMap, targetDate) => {
  const targetDateString = getLocalDateString(targetDate);

  return Array.from(entryMap.values()).reduce((count, entry) => {
    const createdAtDate = new Date(entry.createdAt);

    if (Number.isNaN(createdAtDate.getTime())) {
      return count;
    }

    return getLocalDateString(createdAtDate) === targetDateString
      ? count + 1
      : count;
  }, 0);
};

const renderCount = (count) => {
  const maxDots = Math.min(count, 48);

  return (
    <div className={styles.counts}>
      {Array.from({ length: maxDots }, (_, dotIndex) => (
        <div className={styles.count} key={`count-${dotIndex}`} />
      ))}
    </div>
  );
};

const DayComponent = memo(({ date, scrollToDate }) => {
  const { index } = useIndexContext();
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const dayName = dayNames[date.getDay()];
  const dayNumber = date.getDate();
  const count = countEntriesByDate(index, date);
  const isWeekend = dayName === 'S';

  return (
    <button
      type="button"
      onClick={() => scrollToDate(date)}
      className={`${styles.day} ${isToday(date) ? styles.today : ''} ${
        isWeekend ? styles.monday : ''
      }`}
    >
      {renderCount(count)}
      <div className={styles.dayLine} />
      <div className={styles.dayName}>{dayName}</div>
      <div className={styles.dayNumber}>{dayNumber}</div>
    </button>
  );
});

const buildDays = (startDate, endDate, scrollToDate) => {
  const dayCount =
    Math.floor(
      (endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000),
    ) + 1;

  return Array.from({ length: dayCount }, (_, dayOffset) => {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + dayOffset);

    return (
      <DayComponent
        key={currentDate.toISOString()}
        date={currentDate}
        scrollToDate={scrollToDate}
      />
    );
  }).reverse();
};

const WeekComponent = memo(({ startDate, endDate, scrollToDate }) => {
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const monthName = monthNames[startDate.getMonth()];
  const year = startDate.getFullYear();
  const days = buildDays(startDate, endDate, scrollToDate);

  return (
    <div className={styles.week}>
      <div className={styles.text}>
        {monthName.substring(0, 3)} {year}
      </div>
      {days}
      <div className={styles.line} />
    </div>
  );
});

const Timeline = memo(() => {
  const scrollRef = useRef(null);
  const scrubRef = useRef(null);
  const { index } = useIndexContext();
  const { visibleIndex, scrollToIndex, closestDate, setClosestDate } =
    useTimelineContext();
  const [parentEntries, setParentEntries] = useState([]);
  const [oldestDate, setOldestDate] = useState(new Date());

  useEffect(() => {
    if (!index) {
      return;
    }

    const onlyParentEntries = Array.from(index).filter(
      ([, metadata]) => !metadata.isReply,
    );

    const lastEntry = onlyParentEntries.at(-1);

    if (lastEntry) {
      const [, lastEntryMetadata] = lastEntry;
      setOldestDate(new Date(lastEntryMetadata.createdAt));
    }

    setParentEntries(onlyParentEntries);
  }, [index]);

  useEffect(() => {
    if (!parentEntries.length || visibleIndex === 0) {
      return;
    }

    const currentEntry = parentEntries[visibleIndex - 1]?.[1];

    if (!currentEntry) {
      return;
    }

    setClosestDate(currentEntry.createdAt);
  }, [parentEntries, setClosestDate, visibleIndex]);

  const scrollToDate = useCallback(
    (targetDate) => {
      const closestEntryIndex = parentEntries.reduce(
        (closest, post, postIndex) => {
          const postDate = new Date(post[1].createdAt);
          const diff = Math.abs(targetDate - postDate);

          if (diff < closest.smallestDiff) {
            return { smallestDiff: diff, index: postIndex };
          }

          return closest;
        },
        { smallestDiff: Infinity, index: -1 },
      ).index;

      scrollToIndex(closestEntryIndex);
    },
    [parentEntries, scrollToIndex],
  );

  const getWeeks = useCallback(() => {
    const weeks = [];
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    let weekEnd = new Date(now);

    while (now.getDay() !== 1) {
      now.setDate(now.getDate() - 1);
    }

    let weekStart = new Date(now);
    weeks.push({ start: weekStart, end: weekEnd });

    const oldestDatePadded = new Date(oldestDate);
    oldestDatePadded.setDate(oldestDatePadded.getDate() - 40);

    while (weekStart > oldestDatePadded) {
      weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() - 1);
      weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 6);
      weeks.push({ start: new Date(weekStart), end: new Date(weekEnd) });
    }

    return weeks;
  }, [oldestDate]);

  const weeks = useMemo(
    () =>
      getWeeks().map((week) => (
        <WeekComponent
          key={`${week.start.toISOString()}-${week.end.toISOString()}`}
          startDate={week.start}
          endDate={week.end}
          scrollToDate={scrollToDate}
        />
      )),
    [getWeeks, scrollToDate],
  );

  useEffect(() => {
    if (!scrubRef.current || !scrollRef.current) {
      return;
    }

    const oneDay = 24 * 60 * 60 * 1000;
    const now = new Date();
    const past = new Date(closestDate);
    const diffInMilliseconds = Math.abs(now - past);
    const diffInDays = Math.round(diffInMilliseconds / oneDay);
    const distanceFromTop = 22 * diffInDays + 10;
    const scrollOffset = distanceFromTop > 400 ? distanceFromTop - 300 : 0;

    scrollRef.current.scroll({
      top: scrollOffset,
      behavior: 'smooth',
    });

    scrubRef.current.style.top = `${distanceFromTop}px`;
  }, [closestDate]);

  return (
    <div ref={scrollRef} className={styles.timeline}>
      {weeks}
      <div ref={scrubRef} className={styles.scrubber} />
    </div>
  );
});

export default Timeline;
