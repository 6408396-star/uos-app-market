# 统信应用商城

一个静态 UOS 应用下载商城，由 GitHub Pages 托管。

- 商城地址：https://6408396-star.github.io/uos-app-market/
- GitHub 仓库：https://github.com/6408396-star/uos-app-market

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
