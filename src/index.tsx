import { Moment } from "moment";
import momentGenerateConfig from "wcx-picker/lib/generate/moment";
import generateCalendar from "./generateCalendar";
const Calendar = generateCalendar<Moment>(momentGenerateConfig);

export default Calendar;
