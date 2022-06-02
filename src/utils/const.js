export const statusOptions = [
  {
    key: -1,
    display_name: "草稿",
  },
  {
    key: 0,
    display_name: "正在運行",
  },
  {
    key: 1,
    display_name: "完成",
  },
  {
    key: 2,
    display_name: "未知",
  },
  {
    key: 3,
    display_name: "沒有通過",
  },
  {
    key: 4,
    display_name: "駁回",
  },
]

/**
 * 代碼生成器中定義的編輯類型
 */
export const  typeLists= [
  {
    label: '文本框',
    value: 'text'
  },
  {
    label: '多行文本框',
    value: 'textarea'
  },
  {
    label: '開關', //用於修改bool類型的switch
    value: 'switch'
  },
  {
    label: '下拉列表',  //靜態數據
    value: 'select'
  },
  {
    label: '動態下拉列表', //動態選擇，數據時從接口中獲取
    value: 'selectDynamic'
  },
  {
    label: '日期',
    value: 'date'
  },
  {
    label: '日期時間',
    value: 'datetime'
  },
  {
    label: 'checkbox',
    value: 'checkbox'
  },
  {
    label: 'mail',
    value: 'mail'
  },
  {
    label: 'number',
    value: 'number'
  },
  {
    label: 'decimal',
    value: 'decimal'
  },
  {
    label: 'phone',
    value: 'phone'
  },
  {
    label: 'img',
    value: 'img'
  },
  {
    label: 'excel',
    value: 'excel'
  },
  {
    label: 'file',
    value: 'file'
  }
]
