import dayjs from "dayjs";
import "dayjs/locale/ko";
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);

dayjs.locale("ko");
dayjs.tz.setDefault("Asia/Seoul");

export { dayjs };

export const formatDate = (
  date: string | Date,
  format = "YYYY-MM-DD HH:mm:ss"
) => {
  return dayjs(date).format(format);
};

export const formatRelativeTime = (date: string | Date) => {
  return dayjs(date).fromNow();
};

export const formatDateOnly = (date: string | Date) => {
  return dayjs(date).format("YYYY-MM-DD");
};

export const formatTimeOnly = (date: string | Date) => {
  return dayjs(date).format("HH:mm:ss");
};

export const isToday = (date: string | Date) => {
  return dayjs(date).isSame(dayjs(), "day");
};

export const isYesterday = (date: string | Date) => {
  return dayjs(date).isSame(dayjs().subtract(1, "day"), "day");
};
