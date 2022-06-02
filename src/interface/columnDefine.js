/**
 * @description: 通用表格列定義
 * @author: liyubao | xufuxing
 * @version: 1.0
 */

 const ColumnDefine = class  {
  /**
   * 字段名
   */
   columnName='';

  /**
   * 中文顯示名稱
   */
   comment ='';

  /**
   * 是否可編輯
   */

   isEdit=false;
  /**
   * 是否可顯示
   */

   isList =false;

  /**
   * 編輯類型，如:select/switch/text等
   * 該屬性作為判定字段編輯方式的首要條件
   */
   editType ='';

  /**
   * 下拉列表的來源字典編碼
   */
   dataSource ='';

   /**
   * 實體類型，如:string/int
   * 當editType為空時，該屬性作為判定字段編輯方式的條件
   */
   entityType ='';

  /**
   * 對應的數據字段類型
   */
   columnType ='';

  /**
   * 實體名稱
   */
   entityName ='';

  /**
   * 創建一個初始的實體
   */
  static create() {
   return Object.create(this.prototype);
 }


 /**
  * 
  * @param columnName 字段名
  * @param comment 中文顯示名稱
  * @param isEdit 是否可編輯
  * @param isList 是否可顯示
  * @param editType 編輯類型，如:select/switch/text等
  * @param dataSource 下拉列表的來源字典編碼
  * @param entityType 實體類型，如:string/int
  * @param columnType 對應的數據字段類型
  * @param entityName 實體名稱
  */
	constructor(columnName, comment, isEdit, isList, editType, dataSource, entityType, columnType, entityName) {
		this.columnName = columnName;
		this.comment = comment;
		this.isEdit = isEdit;
		this.isList = isList;
		this.editType = editType;
		this.dataSource = dataSource;
		this.entityType = entityType;
		this.columnType = columnType;
		this.entityName = entityName;
	}



}

export default ColumnDefine
