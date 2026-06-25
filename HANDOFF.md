# DY-TEAM-CHANG 项目交接文档

## 项目概况

- **源码位置**: `D:\lebaichangstuido\cherry-studio`
- **技术栈**: TypeScript + Electron 41.8.0 + Vite (pnpm monorepo)
- **Node.js**: v24.16.0, pnpm 11.8.0
- **远程仓库**: `https://github.com/wochuihuolg/mingchang-studio.git`

## 已完成的工作

### 1. 品牌改名
- 名称全线改为 `DY-TEAM-CHANG`
- appId: `com.dyteamchang.app`
- 可执行文件名: `dy-team-chang.exe`
- 协议: `dy-team-chang://`
- 所有代码中的 "Cherry Studio" / "mingchang" 都已替换

### 2. 打包修复
- **asarUnpack** 规则加了很多缺失依赖的 unpack（`font-list`, `whatwg-url`, `tr46`, `punycode`, `iconv-lite`, `ms`, `es-errors`, `gopd`, `call-bind` 等 17 个包）
- **dependencies** 里加了对应这些包作为直接依赖
- **electron-builder.yml** 加了 `signAndEditExecutable: false` 跳过签名
- 已知 `win.signtoolOptions.sign` 指向 `scripts/win-sign.js`（非个人开发者忽略即可）

### 3. Logo 替换
- `build/logo.png`, `build/icon.png`, `build/tray_icon*.png` — 应用图标
- `src/renderer/assets/images/logo.png` — 侧边栏左上角 logo

### 4. 启动台菜单精简
- 默认只保留: **助手**、**绘图**、**设置** 三个入口
- 去掉了: 智能体、翻译、助手库、小程序、openclaw
- 相关文件: `src/shared/data/preference/preferenceSchemas.ts` (第750行)

### 5. 设置按钮
- 已添加到侧边栏默认菜单
- 路由: `/settings`
- 涉及文件: `preferenceSchemas.ts`, `preferenceTypes.ts`, `label.ts`, `Sidebar.tsx`

## 待处理问题

### 1. 上传图片功能失效
- **根因推测**: 输入框根据选中模型是否支持 vision 来决定是否显示上传按钮
- 如果当前选中的模型没有 `image-recognition` 能力，上传图片按钮会被隐藏
- **排查方向**: 检查 `src/shared/utils/model.ts` 的 `isVisionModel` 函数和 `Inputbar.tsx` 的 `canAddImageFile` 逻辑

### 2. 版本号后缀
- 需要在左上角标题后追加版本号显示，如 `DY-TEAM-CHANG 2.0.x`
- 改动点: `src/renderer/components/app/Sidebar.tsx` 第174行 `title: 'DY-TEAM-CHANG'`
- 方案: 从 `package.json` 读 `version` 字段拼接

### 4. 去掉小程序/插件相关代码（待定）

## 打包命令

```powershell
cd D:\lebaichangstuido\cherry-studio
cmd /c "pnpm install"
cmd /c "pnpm build:win:x64"
```

测试文件: `dist\win-unpacked\DY-TEAM-CHANG.exe`

## Chat 窗口文件

把新任务放到新的 chat 窗口,复制以下内容作为开场白:

---

打开 D:\lebaichangstuido\cherry-studio 项目，这是 DY-TEAM-CHANG 客户端。查看交接文档 D:\lebaichangstuido\cherry-studio\HANDOFF.md 了解当前状态，然后处理以下任务：

1. 侧面左上角名称后面追加版本号后缀，如 `DY-TEAM-CHANG 2.0.x`（从 package.json 动态读取 version）
2. 排查上传图片功能失效问题（选中模型后上传按钮不显示）
3. 接入 Gemini-3-Pro-Image-preview 图像生成模型
4. 去掉小程序、插件等不需要的功能模块

注意：打包功能已能正常运行，不要改 electron-builder.yml 和 package.json 的打包相关配置。
