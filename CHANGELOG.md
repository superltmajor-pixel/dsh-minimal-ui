# 更新日志

本文件记录「极简界面」的对外发布变更。格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循[语义化版本](https://semver.org/lang/zh-CN/)。

## [未发布]

## [0.10.51] - 2026-11-14

### 修复

- `+` 菜单里的 `/permission`（权限）与 `/model`（模型）选择器弹出时是半透明面板、正文文字透上来：为这两个弹层（宿主共享 `MenuSurface` 材质）强制不透明底色并关闭背景模糊。

## [0.10.50] - 2026-11-14

### 修复

- 侧栏底部的主题切换按钮与「新版本」更新徽标在更新可用时重叠：徽标异步挂载后按钮未重新定位，现改为监听触发行尺寸与徽标挂载/移除，自动落在指示器左侧。

## [0.10.49] - 2026-11-12

### 修复

- 修复折叠状态下点加号偶尔打不开菜单：宿主会在控件点击时主动聚焦编辑器，此前被「丢弃挂载自动聚焦」的逻辑误判并 `blur()`，导致菜单有时不出现。

### 变更

- 点加号只打开菜单，不再展开输入框；展开仅由点击输入框的空白区域或键盘聚焦触发。

## [0.10.48] - 2026-11-12

### 修复

- 折叠状态下的加号偶发无响应：临时改为点击时先展开、再交给宿主开菜单。**该行为已在 0.10.49 推翻，请使用 0.10.49 及以上。**

## [0.10.47] - 2026-11-12

### 新增

- 空输入框默认折叠成一条空白栏，只常驻 `+` 与模型选择。
- 点击空白栏或键盘聚焦即可展开；输入后保持展开，点击空白处或框外收回。
- 展开状态下点击统计、权限、模型等按钮只弹详情，不再折回输入框。

### 变更

- 占位提示与光标默认隐藏，鼠标进入输入框才显示；丢弃宿主挂载时的自动聚焦。

### 修复

- 折叠态隐藏权限/Plan/左侧插槽图标、统计栏与发送箭头，保留运行中的停止按钮。

## [0.10.36] - 2026-11-11

### 修复

- 适配 DSH 0.2.2-rc.2：Markdown 表格容器类名改为 `_tableScroll_13jw0_199`，改用 `[class*="tableScroll"]` 匹配，不再依赖哈希类名。

## [0.10.35] - 2026-11-11

### 变更

- 适配 DSH 0.2.2-rc.2；`engines.dsh` 放宽为 `>=0.2.2-rc.1 <0.2.3-0`。

## [0.10.34] - 2026-11-10

### 新增

- 设置弹窗支持拖动（全部在自定义插件内实现，未修改官方源码）。

### 变更

- README 重写为「Less is more」理念版，并加入演示 GIF。

## [0.10.33] - 2026-11-08

### 新增

- 首个公开版本：更安静的排版与侧栏，图标化底栏与工具统计，任务面板与「已编辑文件」折叠，开始页整理等。

[未发布]: https://github.com/superltmajor-pixel/dsh-minimal-ui/compare/v0.10.49...HEAD
[0.10.49]: https://github.com/superltmajor-pixel/dsh-minimal-ui/compare/v0.10.48...v0.10.49
[0.10.48]: https://github.com/superltmajor-pixel/dsh-minimal-ui/compare/v0.10.47...v0.10.48
[0.10.47]: https://github.com/superltmajor-pixel/dsh-minimal-ui/compare/v0.10.36...v0.10.47
[0.10.36]: https://github.com/superltmajor-pixel/dsh-minimal-ui/compare/v0.10.35...v0.10.36
[0.10.35]: https://github.com/superltmajor-pixel/dsh-minimal-ui/compare/v0.10.34...v0.10.35
[0.10.34]: https://github.com/superltmajor-pixel/dsh-minimal-ui/compare/v0.10.33...v0.10.34
[0.10.33]: https://github.com/superltmajor-pixel/dsh-minimal-ui/releases/tag/v0.10.33
