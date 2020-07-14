import * as React from "react";
import { GenerateConfig } from "wcx-picker/lib/generate";
import { Locale } from "wcx-picker/lib/interface";
import { Select, Radio, Button } from "antd";
import { CalendarMode } from "./generateCalendar";
import moment from "moment";
const YearSelectOffset = 10;
const YearSelectTotal = 20;

interface SharedProps<DateType> {
  prefixCls: string;
  value: DateType;
  validRange?: [DateType, DateType];
  generateConfig: GenerateConfig<DateType>;
  locale: Locale;
  fullscreen: boolean;
  divRef: React.RefObject<HTMLDivElement>;
  onChange: (year: DateType) => void;
}

function YearSelect<DateType>(props: SharedProps<DateType>) {
  const {
    fullscreen,
    validRange,
    generateConfig,
    locale,
    prefixCls,
    value,
    onChange,
    divRef
  } = props;

  const year = generateConfig.getYear(value);

  let start = year - YearSelectOffset;
  let end = start + YearSelectTotal;

  if (validRange) {
    start = generateConfig.getYear(validRange[0]);
    end = generateConfig.getYear(validRange[1]) + 1;
  }

  const suffix = locale && locale.year === "年" ? "年" : "";
  const options: { label: string; value: number }[] = [];
  for (let index = start; index < end; index++) {
    options.push({ label: `${index}${suffix}`, value: index });
  }

  return (
    <Select
      size={fullscreen ? undefined : "small"}
      options={options}
      value={year}
      className={`${prefixCls}-year-select`}
      onChange={numYear => {
        let newDate = generateConfig.setYear(value, numYear);

        if (validRange) {
          const [startDate, endDate] = validRange;
          const newYear = generateConfig.getYear(newDate);
          const newMonth = generateConfig.getMonth(newDate);
          if (
            newYear === generateConfig.getYear(endDate) &&
            newMonth > generateConfig.getMonth(endDate)
          ) {
            newDate = generateConfig.setMonth(
              newDate,
              generateConfig.getMonth(endDate)
            );
          }
          if (
            newYear === generateConfig.getYear(startDate) &&
            newMonth < generateConfig.getMonth(startDate)
          ) {
            newDate = generateConfig.setMonth(
              newDate,
              generateConfig.getMonth(startDate)
            );
          }
        }

        onChange(newDate);
      }}
      getPopupContainer={() => divRef!.current!}
    />
  );
}

function MonthSelect<DateType>(props: SharedProps<DateType>) {
  const {
    prefixCls,
    fullscreen,
    validRange,
    value,
    generateConfig,
    locale,
    onChange,
    divRef
  } = props;
  const month = generateConfig.getMonth(value);

  let start = 0;
  let end = 12;

  if (validRange) {
    const [rangeStart, rangeEnd] = validRange;
    const currentYear = generateConfig.getYear(value);
    if (generateConfig.getYear(rangeEnd) === currentYear) {
      end = generateConfig.getMonth(rangeEnd);
    }
    if (generateConfig.getYear(rangeStart) === currentYear) {
      start = generateConfig.getMonth(rangeStart);
    }
  }

  const months =
    locale.shortMonths || generateConfig.locale.getShortMonths!(locale.locale);
  const options: { label: string; value: number }[] = [];
  for (let index = start; index < end; index += 1) {
    options.push({
      label: months[index],
      value: index
    });
  }

  return (
    <Select
      size={fullscreen ? undefined : "small"}
      className={`${prefixCls}-month-select`}
      value={month}
      options={options}
      onChange={newMonth => {
        console.log(value, "newMonth", newMonth);
        onChange(generateConfig.setMonth(value, newMonth));
      }}
      getPopupContainer={() => divRef!.current!}
    />
  );
}

interface ModeSwitchProps<DateType>
  extends Omit<SharedProps<DateType>, "onChange"> {
  mode: CalendarMode;
  onModeChange: (type: CalendarMode) => void;
}
function ModeSwitchMonth<DateType>(props: SharedProps<DateType>) {
  const {
    prefixCls,
    fullscreen,
    value: dateValue,
    generateConfig,
    onChange,
    divRef
  } = props;
  const month = generateConfig.getMonth(dateValue);
  const currentData = moment(dateValue).format("YYYY年MM月");
  const options = [
    { label: "上个月", value: -1 },
    { label: "当前", value: 0 },
    { label: "下个月", value: 1 }
  ];
  function onChangeMonth(value: number) {
    return (e: any) => {
      let changeDate = dateValue;
      if (value === 0) {
        changeDate = generateConfig.getNow();
      } else {
        const newMonth = month + value * 1;
        changeDate = generateConfig.setMonth(dateValue, newMonth);
      }
      onChange(changeDate);
    };
  }
  return (
    <div
      className={`${prefixCls}-header`}
      style={{ justifyContent: "space-between" }}
      ref={divRef}
    >
      <p>{currentData}</p>
      <div className={`${prefixCls}-mode-switch`}>
        {options.map(({ label, value }) => {
          return (
            <Button
              style={{ borderRadius: 0 }}
              onClick={onChangeMonth(value)}
              size={fullscreen ? undefined : "small"}
            >
              {label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
function ModeSwitch<DateType>(props: ModeSwitchProps<DateType>) {
  const { prefixCls, locale, mode, fullscreen, onModeChange } = props;
  const {
    // @ts-ignore
    Calendar: { lang: { month, year } = {} } = {},
    month: monthText,
    year: yearText
  } = locale || {};
  const monthLabel = month || monthText;
  const yearLabel = year || yearText;
  return (
    <Radio.Group
      onChange={({ target: { value } }) => {
        onModeChange(value);
      }}
      value={mode}
      size={fullscreen ? undefined : "small"}
      className={`${prefixCls}-mode-switch`}
    >
      <Radio.Button value="month">{monthLabel}</Radio.Button>
      <Radio.Button value="year">{yearLabel}</Radio.Button>
    </Radio.Group>
  );
}

export interface CalendarHeaderProps<DateType> {
  prefixCls: string;
  value: DateType;
  validRange?: [DateType, DateType];
  generateConfig: GenerateConfig<DateType>;
  locale: Locale;
  mode: CalendarMode;
  fullscreen: boolean;
  onlySwitcMonth: boolean;
  onChange: (date: DateType) => void;
  onModeChange: (mode: CalendarMode) => void;
}
function CalendarHeader<DateType>(props: CalendarHeaderProps<DateType>) {
  const {
    prefixCls,
    fullscreen,
    mode,
    onChange,
    onModeChange,
    onlySwitcMonth
  } = props;
  const divRef = React.useRef<HTMLDivElement>(null);

  const sharedProps = {
    ...props,
    onChange,
    fullscreen,
    divRef
  };
  return (
    <React.Fragment>
      {onlySwitcMonth ? (
        <ModeSwitchMonth {...sharedProps} />
      ) : (
        <div className={`${prefixCls}-header`} ref={divRef}>
          <YearSelect {...sharedProps} />
          {mode === "month" && <MonthSelect {...sharedProps} />}
          <ModeSwitch {...sharedProps} onModeChange={onModeChange} />
        </div>
      )}
    </React.Fragment>
  );
}

export default CalendarHeader;
