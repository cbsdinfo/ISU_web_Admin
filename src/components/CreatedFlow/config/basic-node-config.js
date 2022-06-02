export const tools = [
  {
    type: 'drag',
    icon: 'el-icon-rank',
    defaultIcon: 'el-icon-rank',
    name: '拖拽'
  },
  {
    type: 'connection',
    icon: 'el-icon-share',
    defaultIcon: 'el-icon-share',
    name: '連線'
  },
  // {
  //   type: 'zoom-in',
  //   icon: 'el-icon-zoom-in',
  //   name: '放大'
  // },
  // {
  //   type: 'zoom-out',
  //   icon: 'el-icon-zoom-out',
  //   name: '縮小'
  // }
]

export const commonNodes = [
  {
    type: 'start round mix',
    name: '開始',
    icon: 'iconfont icon-StartOP',
    defaultIcon: 'iconfont icon-StartOP',
    belongto: 'commonNodes'
  },
  {
    type: 'end round',
    name: '結束',
    icon: 'iconfont icon-End',
    defaultIcon: 'iconfont icon-End',
    belongto: 'commonNodes'
  },
  {
    type: 'node',
    name: '任務節點',
    icon: 'el-icon-s-tools',
    defaultIcon: 'el-icon-s-tools',
    belongto: 'commonNodes'
  },
  {
    type: 'fork',
    name: '會簽開始',
    icon: 'iconfont icon-fork',
    defaultIcon: 'iconfont icon-fork',
    belongto: 'commonNodes'
  },
  {
    type: 'join',
    name: '會簽結束',
    icon: 'iconfont icon-gaibanxianxingtubiao-',
    defaultIcon: 'iconfont icon-gaibanxianxingtubiao-',
    belongto: 'commonNodes'
  }
]

export const highNodes = [
  {
    type: 'child-flow',
    name: '子流程',
    icon: 'ChildFlowIcon',
    defaultIcon: 'ChildFlowIcon',
    belongto: 'highNodes'
  }
]

export const laneNodes = [
  {
    type: 'x-lane',
    name: '橫向泳道',
    icon: 'iconfont icon-icon',
    defaultIcon: 'iconfont icon-icon',
    belongto: 'laneNodes'
  },
  {
    type: 'y-lane',
    name: '縱向泳道',
    icon: 'iconfont icon-icon',
    defaultIcon: 'iconfont icon-icon',
    belongto: 'laneNodes'
  }
]
