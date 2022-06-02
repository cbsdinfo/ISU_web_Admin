## 寫在前面
此組件僅提供一個創建TreeTable的解決思路

## prop說明
#### *data*
  **必填**

  原始數據,要求是一個數組或者對象
  ```javascript
    [{
      key1: value1,
      key2: value2,
      children: [{
        key1: value1
      },
      {
        key1: value1
      }]
    },
    {
      key1: value1
    }]
  ```
  或者
 ```javascript
    {
      key1: value1,
      key2: value2,
      children: [{
        key1: value1
      },
      {
        key1: value1
      }]
    }
  ```

#### columns
  列屬性,要求是一個數組

  1. text: 顯示在表頭的文字
  2. value: 對應data的key。treeTable將顯示相應的value
  3. width: 每列的寬度，為一個數字(可選)
  
  如果你想要每個字段都有自定義的樣式或者嵌套其他組件，columns可不提供，直接像在el-table一樣寫即可，如果沒有自定義內容，提供columns將更加的便捷方便
  
  如果你有幾個字段是需要自定義的，幾個不需要，那麼可以將不需要自定義的字段放入columns，將需要自定義的內容放入到slot中，詳情見後文
  ```javascript
  [{
    value:string,
    text:string,
    width:number
  },{
    value:string,
    text:string,
    width:number
  }]
  ```

#### expandAll
  是否預設全部展開，boolean值，預設為false

#### evalFunc
  解析函數，function，非必須

  如果不提供，將使用預設的[evalFunc](./eval.js)

  如果提供了evalFunc,那麼會用提供的evalFunc去解析data，並返回treeTable渲染所需要的值。如何編寫一個evalFunc，請參考[*eval.js*](https://github.com/PanJiaChen/vue-element-admin/blob/master/src/components/TreeTable/eval.js)或[*customEval.js*](https://github.com/PanJiaChen/vue-element-admin/blob/master/src/views/example/table/treeTable/customEval.js)

#### evalArgs
  解析函數的參數，是一個數組

  **請注意，自定義的解析函數參數第一個為this.data，第二個參數為， this.expandAll,你不需要在evalArgs填寫。一定記住，這兩個參數是強制性的，並且位置不可顛倒** *this.data為需要解析的數據，this.expandAll為是否預設展開*

  如你的解析函數需要的參數為`(this.data, this.expandAll,1,2,3,4)`，那麼你只需要將`[1,2,3,4]`賦值給`evalArgs`就可以了
  
  如果你的解析函數參數只有`(this.data, this.expandAll)`,那麼就可以不用填寫evalArgs了
  
  具體可參考[*customEval.js*](https://github.com/PanJiaChen/vue-element-admin/blob/master/src/views/example/table/treeTable/customEval.js)的函數參數和[customTreeTable](https://github.com/PanJiaChen/vue-element-admin/blob/master/src/views/example/table/treeTable/customTreeTable.vue)的`evalArgs`屬性值

 ## slot
 這是一個自定義列的插槽。
 
 預設情況下，treeTable只有一行行展示數據的功能。但是一般情況下，我們會要給行加上一個操作按鈕或者根據當行數據展示不同的樣式，這時我們就需要自定義列了。請參考[customTreeTable](https://github.com/PanJiaChen/vue-element-admin/blob/master/src/views/example/table/treeTable/customTreeTable.vue)，[實例效果](http://panjiachen.github.io/vue-element-admin/#/example/table/custom-tree-table)
 
 `slot`和`columns屬性`可同時存在,columns裡面的數據列會在slot自定義列的左邊展示

 ## 其他
  如果有其他的需求，請參考[el-table](http://element-cn.eleme.io/#/en-US/component/table)的api自行修改index.vue
