const baseUrl = process.env.VUE_APP_BASE_API
export const basicComponents = [
  {
    type: 'input',
    icon: 'icon-input',
    name: '單行文本',
    options: {
      width: '100%',
      defaultValue: '',
      required: false,
      dataType: 'string',
      pattern: '',
      placeholder: '',
      disabled: false
    }
  },
  {
    type: 'textarea',
    icon: 'icon-diy-com-textarea',
    name: '多行文本',
    options: {
      width: '100%',
      defaultValue: '',
      required: false,
      disabled: false,
      pattern: '',
      placeholder: ''
    }
  },
  {
    type: 'number',
    icon: 'icon-number',
    name: '計數器',
    options: {
      width: '',
      required: false,
      defaultValue: 0,
      min: '',
      max: '',
      step: 1,
      disabled: false,
      controlsPosition: ''
    }
  },
  {
    type: 'radio',
    icon: 'icon-radio-active',
    name: '單選框組',
    options: {
      inline: true,
      defaultValue: '',
      showLabel: false,
      options: [
        {
          value: 'Option 1',
          label: '選項 1'
        },
        {
          value: 'Option 2',
          label: '選項 2'
        },
        {
          value: 'Option 3',
          label: '選項 3'
        }
      ],
      required: false,
      width: '',
      remote: false,
      remoteOptions: [],
      props: {
        value: 'value',
        label: 'label'
      },
      remoteFunc: '',
      disabled: false
    }
  },
  {
    type: 'checkbox',
    icon: 'icon-check-box',
    name: '多選框組',
    options: {
      inline: true,
      defaultValue: [],
      showLabel: false,
      options: [
        {
          value: 'Option 1'
        },
        {
          value: 'Option 2'
        },
        {
          value: 'Option 3'
        }
      ],
      required: false,
      width: '',
      remote: false,
      remoteOptions: [],
      props: {
        value: 'value',
        label: 'label'
      },
      remoteFunc: '',
      disabled: false
    }
  },
  {
    type: 'time',
    icon: 'icon-time',
    name: '時間選擇器',
    options: {
      defaultValue: '21:19:56',
      readonly: false,
      disabled: false,
      editable: true,
      clearable: true,
      placeholder: '',
      startPlaceholder: '',
      endPlaceholder: '',
      isRange: false,
      arrowControl: true,
      format: 'HH:mm:ss',
      required: false,
      width: ''
    }
  },
  {
    type: 'date',
    icon: 'icon-date',
    name: '日期選擇器',
    options: {
      defaultValue: '',
      readonly: false,
      disabled: false,
      editable: true,
      clearable: true,
      placeholder: '',
      startPlaceholder: '',
      endPlaceholder: '',
      type: 'date',
      format: 'yyyy-MM-dd',
      timestamp: false,
      required: false,
      width: ''
    }
  },
  {
    type: 'text',
    icon: 'icon-wenzishezhi-',
    name: '文字',
    options: {
      defaultValue: 'This is a text',
      customClass: ''
    }
  },
  {
    type: 'imgupload',
    icon: 'icon-tupian',
    name: '圖片/文件',
    options: {
      defaultValue: [],
      required: false,
      size: {
        width: 100,
        height: 100
      },
      width: '',
      tokenFunc: 'funcGetToken',
      token: '',
      // domain: 'http://pfp81ptt6.bkt.clouddn.com/',
      disabled: false,
      length: 8,
      multiple: false,
      isQiniu: false,
      isDelete: false,
      min: 0,
      isEdit: false,
      action: `${baseUrl}/Files/Upload`
    }
  },
  {
    type: 'select',
    icon: 'icon-select',
    name: '下拉選擇框',
    options: {
      defaultValue: '',
      multiple: false,
      disabled: false,
      clearable: false,
      placeholder: '',
      required: false,
      showLabel: false,
      width: '',
      options: [
        {
          value: 'Option 1'
        },
        {
          value: 'Option 2'
        }, {
          value: 'Option 3'
        }
      ],
      remote: false,
      filterable: false,
      remoteOptions: [],
      props: {
        value: 'value',
        label: 'label'
      },
      remoteFunc: ''
    }
  },
  {
    type: 'grid',
    icon: 'icon-grid-',
    name: '柵格布局',
    columns: [
      {
        span: 12,
        list: []
      },
      {
        span: 12,
        list: []
      }
    ],
    options: {
      gutter: 0,
      justify: 'start',
      align: 'top'
    }
  }
  // {
  //   type: 'color',
  //   icon: 'icon-color',
  //   options: {
  //     defaultValue: '',
  //     disabled: false,
  //     showAlpha: false,
  //     required: false
  //   }
  // },
  // {
  //   type: 'switch',
  //   icon: 'icon-switch',
  //   options: {
  //     defaultValue: false,
  //     required: false,
  //     disabled: false
  //   }
  // },
  // {
  //   type: 'slider',
  //   icon: 'icon-slider',
  //   options: {
  //     defaultValue: 0,
  //     disabled: false,
  //     required: false,
  //     min: 0,
  //     max: 100,
  //     step: 1,
  //     showInput: false,
  //     range: false,
  //     width: ''
  //   }
  // },
  // {
  //   type: 'rate',
  //   icon: 'icon-pingfen1',
  //   options: {
  //     defaultValue: null,
  //     max: 5,
  //     disabled: false,
  //     allowHalf: false,
  //     required: false
  //   }
  // }
]

export const advanceComponents = [
  // {
  //   type: 'blank',
  //   icon: 'icon-zidingyishuju',
  //   options: {
  //     defaultType: 'String'
  //   }
  // },
  // {
  //   type: 'imgupload',
  //   icon: 'icon-tupian',
  //   options: {
  //     defaultValue: [],
  //     size: {
  //       width: 100,
  //       height: 100
  //     },
  //     width: '',
  //     tokenFunc: 'funcGetToken',
  //     token: '',
  //     domain: 'http://pfp81ptt6.bkt.clouddn.com/',
  //     disabled: false,
  //     length: 8,
  //     multiple: false,
  //     isQiniu: false,
  //     isDelete: false,
  //     min: 0,
  //     isEdit: false,
  //     action: 'https://jsonplaceholder.typicode.com/photos/'
  //   }
  // },
  // {
  //   type: 'editor',
  //   icon: 'icon-fuwenbenkuang',
  //   options: {
  //     defaultValue: '',
  //     width: ''
  //   }
  // },
  // {
  //   type: 'cascader',
  //   icon: 'icon-jilianxuanze',
  //   options: {
  //     defaultValue: [],
  //     width: '',
  //     placeholder: '',
  //     disabled: false,
  //     clearable: false,
  //     remote: true,
  //     remoteOptions: [],
  //     props: {
  //       value: 'value',
  //       label: 'label',
  //       children: 'children'
  //     },
  //     remoteFunc: ''
  //   }
  // }
]

export const layoutComponents = [
  {
    type: 'grid',
    icon: 'icon-grid-',
    name: '柵格布局',
    columns: [
      {
        span: 12,
        list: []
      },
      {
        span: 12,
        list: []
      }
    ],
    options: {
      gutter: 0,
      justify: 'start',
      align: 'top'
    }
  }
]
