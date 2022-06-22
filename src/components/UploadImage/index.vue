<template>
    <div class="uploadWrap">
        <div class="addFileWrap" v-for="(item,index) in imageAry" :key="index">
            <div class="addContent" :for="'openFile'+`${index}`">
                <label :for="'openFile'+`${index}`"><i v-if="!item.path" class="el-icon-plus"></i></label>
                <template v-if="item.path">
                    <img :src="`${imgUrl}${item.path}`"/>
                    <div class="deleteWrap"></div> 
                    <i class="el-icon-delete" @click="deleteImg(index)"></i>
                </template>
              
            </div>
            <input @change="uploadFile($event,index)"
                :id="'openFile'+`${index}`" type="file" multiple :disabled="!!item.path"
                class="inputFile"
            >
        </div>
    </div>
</template>
<script>
    export default {
        props:{
            submitFlag:{
                type:Boolean,
                default:false
            },
            imagePathAry:{
                type:Array,
            },
            uploadLimit:{
                type:Number,
                default:99
            }

        },
        data(){
            return {
                imgUrl: process.env.VUE_APP_BASE_IMG_URL,
                imageAry:[{path:""}]
            }
        },
        watch:{
            submitFlag(val){
                if(val){
                    this.emitFilePath()
                }
            },
            imagePathAry(imgPath){
                this.imageAry = JSON.parse(JSON.stringify(imgPath))
                if(this.imageAry.length<this.uploadLimit){
                    this.imageAry.push({path:""})
                }
            }
        },
        methods: {
            async uploadFile(event,targetIndex){
                let filsAry = event.target.files
                console.log("filsAry",filsAry);
                // const compressData = await this.$api.files.compressFile(filsAry[0], 250);
                // console.log(compressData);

                if(filsAry.length>0){
                    const formData = new FormData();
                    for (const key in filsAry) {
                        let imgFile = filsAry[key]
                        formData.append("files", imgFile);
                        // let imgFile = filsAry[key]
                        // const compressData = await this.$api.files.compressFile(filsAry[key], 2);
                        // formData.append("files", compressData);
                    }
                    this.$api.files.Upload(formData).then((res) => {
                        const { code, result } = res;
                        if (code === 200) {
                            result.forEach((element,index) => {
                                // console.log(element);
                                // console.log(targetIndex,index)
                                if(index===0){
                                    this.imageAry.splice(targetIndex,1,{
                                        path:element.filePath,
                                    }) 
                                }else{
                                    let spliceIndex = targetIndex+index
                                    this.imageAry.splice(spliceIndex,0,{
                                        path:element.filePath,
                                    })
                                }
                            });
                            if(this.imageAry.length<this.uploadLimit){
                                this.imageAry.push({path:""})
                            }
                         
                        }
                    });
                }
            },
            deleteImg(index){
                this.imageAry.splice(index,1)
                if(this.imageAry.length<this.uploadLimit){
                    this.imageAry.push({path:""})
                }
            },
            emitFilePath(){
                console.log("emitFilePath");
                let imgPathAry = JSON.parse(JSON.stringify(this.imageAry))
                if(imgPathAry[imgPathAry.length-1].path===''){
                    imgPathAry.splice(imgPathAry.length-1,1)
                }
                this.$emit("handleSubmit",imgPathAry)
            }

        },
    }
</script>
<style lang="scss" scoped>
.uploadWrap{
    display: flex;
    flex-wrap: wrap;
    .addFileWrap{   
        position: relative;
        margin-right: 5px;
        margin-bottom: 5px;
        // cursor: pointer;
        width: 100px;
        height: 100px;
        border: 1px solid black;
        border-radius:10px;
        .addContent{
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 100%;
            // cursor: pointer;
            font-size: 40px;
            label{
                cursor: pointer;
            }
            &:hover>.deleteWrap{
                background-color: gray;
                background: rgba(0,0,0,0.5);
            }
            &:hover>.el-icon-delete{
                display:block;
            }
            img{
                border-radius:10px;
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .el-icon-delete{
                cursor: pointer;
                display: none;
                position: absolute;
                color: white;
                z-index: 2;
                top:50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }

            .deleteWrap{
                // &:hover{
                //     background-color: gray;
                //     background: rgba(0,0,0,0.5);
                //     // ::before{

                //     // }
                // }
                // &:hover+.el-icon-delete{
                //     display: block;
                // }
                border-radius:10px;
                width: 100%;
                height: 100%;
                position: absolute;
                top: 0px;
                
                z-index: 1;
            }
        }
        input{
            display: none;
        }
    }
}
</style>