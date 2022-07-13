import dayjs from 'dayjs';
let dateTimeFormatToDate = value => {
    return dayjs(value).format("YYYY-MM-DD")
}
export { dateTimeFormatToDate }