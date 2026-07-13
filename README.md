# 统信应用商城

一个静态 UOS 应用下载商城，由 GitHub Pages 托管。

- 商城地址：https://6408396-star.github.io/uos-app-market/
- GitHub 仓库：https://github.com/6408396-star/uos-app-market

## UOS 桌面商城

- 安装包：`releases/uos-app-market_1.0.0_all.deb`
- 图示安装说明：`guides/uos-app-market-install-guide.docx`
- 推荐安装：双击 `.deb`，在系统软件包安装器中点击“安装”。
- 命令安装：`sudo apt install ./uos-app-market_1.0.0_all.deb`

商城会自动下载并校验应用安装包，然后调用 UOS 系统软件包安装器。系统级安装仍需完成一次管理员授权，商城不读取或保存密码。

## 本地预览

```powershell
python -m http.server 4173
```

打开 `http://127.0.0.1:4173/`。

## 添加应用

1. 将应用图标和截图放进 `assets/`。
2. 在 `apps.json` 的 `apps` 数组中增加应用资料。
3. 将 `.deb` 上传到 GitHub Releases 或公开下载目录，并把地址填入 `downloadUrl`。
4. 提交到 `main` 分支，GitHub Pages 会自动更新。

## 发布

仓库的 GitHub Pages 来源设置为 `main` 分支根目录。
