module.exports = {
  pluginOptions: {
    electronBuilder: {
      // List native deps here if they don't work
      externals: ["custom-electron-titlebar"],
      nodeModulesPath: ["../../node_modules", "./node_modules"],
      win: {
        icon: "./assets/logo.png",
      },
    },
  },
};
