# 崔琪个人简历网站

基于 React + Vite 的单页个人简历网站，采用美拉德色系与地质档案式编辑设计。

## 本地运行

```bash
pnpm install
pnpm dev
```

浏览终端显示的本地地址即可查看网站。

## 验证

```bash
pnpm test --run
pnpm build
```

## 常用修改位置

- 个人介绍、项目与能力文案：`src/resumeData.js`
- 页面区块和导航：`src/App.jsx`
- 色彩、排版与响应式：`src/styles.css`
- 头像、项目图片和 Hero 视频：`public/media/`
- 素材来源：`public/media/SOURCES.md`

替换媒体时请保留现有文件名，或同步更新 `src/App.jsx` 与 `src/resumeData.js` 中的路径。首版图库素材是主题视觉，不代表项目现场实拍。
