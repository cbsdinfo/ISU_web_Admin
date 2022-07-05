<template>
    <div class="uploadWrap">
        <section class="preview">
            <div v-for="item in imageAry" :key="item.path" class="preview__wrap">
                <img :src="`${imgUrl}${item.path}`"/>
                <div class="deleteWrap"></div> 
                <i class="el-icon-delete" @click="deleteImg(item.path)"></i>
            </div>
        </section>
        <section v-if="uploadLimit>imageAry.length" class="addFileWrap">
            <div class="addContent">
                <label for="uploadInput">
                    <i class="el-icon-plus"></i>
                </label>
            </div>
            <input @change="uploadFile($event)" id="uploadInput" type="file" multiple class="inputFile">
        </section>
    </div>
</template>
<script>
    export default {
        props:{
            imagesPropAry:{
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
                imageAry:[]
            }
        },
        watch:{
            imagesPropAry(imgAry){
                // console.log("watch",imgAry);
                console.log();
                if(imgAry){
                    this.imageAry = JSON.parse(JSON.stringify(imgAry))
                }
            }
        },
        methods: {
            async uploadFile(event){
                let filsAry = event.target.files
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
                            this.$emit("successUploadImg",result)
                            result.forEach((resultItem) => {
                                this.imageAry.push({
                                    path:resultItem.filePath,
                                    id:resultItem.id
                                })
                            });
                        }
                    });
                }
            },
            deleteImg(imgPath){
                //這邊會用path是因為有些舊資料沒有存到id,只有path能辨識
                this.imageAry = this.imageAry.filter(item=>item.path!==imgPath)
                this.$emit("deleteImg",imgPath)
            },

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
            font-size: 40px;
            label{
                cursor: pointer;
            }
            // &:hover>.deleteWrap{
            //     background-color: gray;
            //     background: rgba(0,0,0,0.5);
            // }
            // &:hover>.el-icon-delete{
            //     display:block;
            // }
            // img{
            //     border-radius:10px;
            //     width: 100%;
            //     height: 100%;
            //     object-fit: cover;
            // }
            // .el-icon-delete{
            //     cursor: pointer;
            //     display: none;
            //     position: absolute;
            //     color: white;
            //     z-index: 2;
            //     top:50%;
            //     left: 50%;
            //     transform: translate(-50%, -50%);
            // }

            // .deleteWrap{
            //     border-radius:10px;
            //     width: 100%;
            //     height: 100%;
            //     position: absolute;
            //     top: 0px;
            //     z-index: 1;
            // }
        }
        input{
            display: none;
        }
    }
    .preview{
        &__wrap{
            position: relative;
            margin-right: 5px;
            margin-bottom: 5px;
            width: 100px;
            height: 100px;
            border: 1px solid black;
            border-radius:10px;
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
            .deleteWrap{
                border-radius:10px;
                width: 100%;
                height: 100%;
                position: absolute;
                top: 0px;
                z-index: 1;
            }
            .el-icon-delete{
                cursor: pointer;
                font-size: 20px;
                display: none;
                position: absolute;
                color: white;
                z-index: 2;
                top:50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
           
        }
    }
}
</style>