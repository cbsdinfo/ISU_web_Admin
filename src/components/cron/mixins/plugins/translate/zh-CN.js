const ZHCN = {
  common: {
    inputPlaceholder: 'Corn表達式',
    every: '每',
    specified: '固定的',
    fromThe: '從第',
    start: '開始',
    between: '在',
    and: '到',
    end: '之間的',
    current: '本',
    nearest: '最近的',
    placeholderMulti: '請選擇(支持多選)',
    help: '幫助',
    placeholder: '請選擇',
    use: '使用',
    valTip: '值為',
    symbolTip: '通配符支持',
    wordNumError: '格式不正確，必須有6或7位',
    nth: '第',
    index: '個'
  },
  second: {
    title: '秒',
    val: '0 1 2 ... 59'
  },
  minute: {
    title: '分',
    val: '0 1 2 ... 59'
  },
  hour: {
    title: '時',
    val: '0 1 2 ... 23'
  },
  dayOfMonth: {
    title: '日',
    val: '1 2 ... 31',
    timeUnit: '日'
  },
  month: {
    title: '月',
    val: '1 2 ... 12，或12個月的縮寫(JAN ... DEC) '
  },
  dayOfWeek: {
    title: '周',
    val: '1 2 ... 7或星期的縮寫(SUN ... SAT)',
    timeUnit: '日'
  },
  year: {
    title: '年',
    val: '2020 ... 2099'
  },
  custom: {
    unspecified: '不固定',
    latestWorkday: '最後一個工作日',
    lastTh: '倒數第',
    workDay: '工作日',
    empty: '不配置',
    lastOne: '最後一個'
  },
  cases: [
    {
      label: '每秒',
      value: '* * * * * ?'
    },
    {
      label: '每30分鐘',
      value: '0 */30 * * * ?'
    },
    {
      label: '在每小時的第15,30,45分鐘',
      value: '0 15,30,45 * * * ?'
    },
    {
      label: '每個偶數小時',
      value: '0 0 0/2 * * ?'
    },
    {
      label: '每個奇數小時',
      value: '0 0 1/2 * * ?'
    },
    {
      label: '每天凌晨12點(12am)',
      value: '0 0 0 * * ?'
    },
    {
      label: '每天中午12點(12pm)',
      value: '0 0 12 * * ?'
    },
    {
      label: '每周一12點',
      value: '0 0 12 * * MON'
    },
    {
      label: '每周一至周五12點',
      value: '0 0 12 * * MON-FRI'
    },
    {
      label: '每月1號開始每隔4天的中午12點',
      value: '0 0 12 1/4 * ?'
    },
    {
      label: '每月最後一天的中午12點',
      value: '0 0 12 L * ?'
    },
    {
      label: '每月最後一天前兩天(倒數第三天)中午12點',
      value: '0 0 12 L-2 * ?'
    },
    {
      label: '每月最後一個工作日的12點',
      value: '0 0 12 LW * ?'
    },
    {
      label: '最接近每月1號的那個工作日的12點',
      value: '0 0 12 1W * ?'
    },
    {
      label: '每月最後一個星期天12點',
      value: '0 0 12 ? * 1L'
    },
    {
      label: '每月第一個星期五的12點',
      value: '0 0 12 ? * 6#1'
    },
    {
      label: '1月和6月的每天中午12點',
      value: '0 0 12 * JAN,JUN ?'
    }
  ],
  daysOfWeek: [
    {
      label: '星期天',
      value: 1
    },
    {
      label: '星期一',
      value: 2
    },
    {
      label: '星期二',
      value: 3
    },
    {
      label: '星期三',
      value: 4
    },
    {
      label: '星期四',
      value: 5
    },
    {
      label: '星期五',
      value: 6
    },
    {
      label: '星期六',
      value: 7
    }
  ]
}
export default ZHCN
