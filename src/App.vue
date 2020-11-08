<template>
  <div id="app">
    <h1>Video Compressor</h1>
    <div style="margin-top: 15px; width: 100%">
      <el-form :inline="true" :model="videoPathForm" class="demo-form-inline">
        <el-form-item>
          <el-input
            v-model="videoPathForm.videoPathUrl"
            readonly=""
            placeholder="Choose a video"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button @click="chooseFilePath">Choose a video</el-button>
        </el-form-item>
      </el-form>
      <el-button v-if="!isCompressing" type="primary" @click="compressVideo"
        >Compress</el-button
      >
      <el-button v-else type="danger" @click="cancelCompressing"
        >Cancel</el-button
      >
    </div>
    <div class="footer">
      <el-row :gutter="10">
        <el-col :xs="8" :sm="6" :md="4" :lg="3" :xl="1"
          ><div class="grid-content"></div
        ></el-col>
        <el-col :xs="4" :sm="6" :md="8" :lg="9" :xl="11"
          ><div class="grid-content" style="color: black">
            <span v-if="task.length > 0">Status: {{ task }}</span>
          </div></el-col
        >
        <el-col :xs="4" :sm="6" :md="8" :lg="9" :xl="11"
          ><div class="grid-content" style="color: black">
            <span v-if="eta.length > 1">ETA: {{ eta }}</span>
          </div></el-col
        >
        <el-col :xs="8" :sm="6" :md="4" :lg="3" :xl="1"
          ><div class="grid-content">
            <el-progress
              :text-inside="true"
              :stroke-width="26"
              :percentage="percentCompleted"
            ></el-progress></div
        ></el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
const { Titlebar, Color } = window.require("custom-electron-titlebar");
const { ipcRenderer } = window.require("electron");

export default {
  name: "App",
  data() {
    return {
      videoPathForm: {
        videoPathUrl: "",
      },
      percentCompleted: 0,
      isCompressing: false,
      eta: "",
      task: "",
    };
  },
  mounted() {
    new Titlebar({
      backgroundColor: Color.fromHex("#262626"),
    });

    ipcRenderer.on("filePathResponse", (event, arg) => {
      this.videoPathForm.videoPathUrl = arg;
    });
    ipcRenderer.on("handbrakeProgress", (event, arg) => {
      this.percentCompleted = arg.percentComplete;
      this.eta = arg.eta;
      this.task = arg.task;

      if (this.percentCompleted != 0 && this.percentCompleted != 100) {
        this.isCompressing = true;
      } else {
        this.isCompressing = false;
      }
    });
    ipcRenderer.on("handbrakeSuccessfullyCompleted", (event, path) => {
      this.$confirm(
        "Compression successfully completed. Want to open file path?",
        "Success",
        {
          confirmButtonText: "OK",
          cancelButtonText: "Cancel",
          type: "success",
        }
      ).then(() => {
        ipcRenderer.send("focusPath", path);
        this.$message({
          type: "success",
          message: "File path opened.",
        });
      });
    });
  },
  methods: {
    chooseFilePath() {
      ipcRenderer.send("chooseFilePath");
    },
    compressVideo() {
      if (this.videoPathForm.videoPathUrl.length > 0)
        ipcRenderer.send("compressVideo", this.videoPathForm.videoPathUrl);
      else {
        this.$notify.error({
          title: "Error",
          message: "You have to choose a file to compress.",
        });
      }
    },
    cancelCompressing() {
      this.$confirm(
        "This will cancel your compressing process. Are you sure to cancel?",
        "Warning",
        {
          confirmButtonText: "I'm sure, cancel compressing.",
          cancelButtonText: "No, I'm not sure.",
          type: "warning",
        }
      )
        .then(() => {
          ipcRenderer.send("cancelCompressing");
          this.isCompressing = false;
          this.percentCompleted = 0;
          this.eta = "";
          this.task = "";
          this.$message({
            type: "success",
            message: "Cancelled compressing.",
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "Processing wasn't cancelled.",
          });
        });
    },
  },
};
</script>

<style>
* {
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", Avenir, Arial, sans-serif;
}
#app {
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", Avenir, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.el-input {
  width: 500px;
}
.footer {
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100%;
  color: white;
  text-align: center;
  border-top: 0.5px solid #e0e0e0;
  padding-top: 10px;
}
.el-col {
  border-radius: 4px;
}

.grid-content {
  border-radius: 4px;
  min-height: 36px;
  bottom: 0;
  justify-content: center;
  align-items: center;
}
body {
  user-select: none;
}
input,
button,
textarea,
:focus {
  outline: none;
}
</style>
