# 极简界面 · Minimal UI

为 DeepSeek Harness 提供更安静、聚焦阅读的界面：收紧侧栏与排版、减少常驻按钮，并将常用会话信息集中到工具栏。

## 功能

- 调整侧栏、对话区、输入框、表格和代码的排版；常用操作在悬停或键盘聚焦时显示。
- 在输入工具栏显示生成速度、缓存命中率和上下文占用，支持查看明细。
- 为侧栏增加主题切换；右侧开始页的第三方工具入口可收进「更多工具」。
- 给任务面板增加关闭按钮；折叠已修改文件列表，保留展开操作。
- 失败或中断的最后一条用户消息可以回填到输入框编辑。回填不会删除原消息，也不会自动发送。

## 兼容性

当前源码针对 **DSH 0.2.2-rc.1 的 Web 界面**制作，开发环境为 Windows 桌面客户端。本地版本的界面已由使用者在自己的 DSH 中验收；公开版的独立安装验证尚未完成。插件依赖部分宿主内部布局和 CSS 类名，其他 DSH 版本及平台尚未验证；包的兼容声明目前限定为该版本。

插件会改变界面布局，也可能与修改相同区域的其他插件产生冲突。如果此前安装过本项目的本地开发版，请先禁用旧版，避免两份插件同时调整同一界面。

## 安装

可在已安装 DSH CLI 的环境中通过 GitHub 源码安装。例如，将下面命令中的 `web` 换成希望安装到的 profile 名称：

```sh
dsh plugin --profile web add github:superltmajor-pixel/dsh-minimal-ui
```

这条命令会修改所选 profile。源码直接提供 JavaScript，不需要额外构建；GitHub 安装路径尚未在干净环境验证。

在所选 profile 的插件管理界面中启用或停用「极简界面」。已经更改的主题、草稿或当前布局状态不会因停用而自动撤销。命令行移除示例：

```sh
dsh plugin --profile web remove dsh-minimal-ui
```

## 开发与检查

在源码目录安装 Node.js 后，可运行 `npm test`。这些检查覆盖包配置、加载接线、统计计算、菜单回退、主题切换和任务面板行为；它们使用模拟宿主，不能替代实际界面和干净安装验证。

## 数据与权限

插件在客户端读取宿主提供的当前会话状态和任务列表，以显示统计、任务和可用操作；为处理失败或中断消息的编辑，它会观察页面中的消息节点，点击编辑时读取最后一条用户消息的显示文本并回填宿主输入框。它也会读取标题栏状态文字，用于补充提示。

回填后的草稿可能由宿主保存；点击主题切换会通过宿主设置保存主题偏好。插件初始化失败时会向浏览器控制台写入错误摘要，日志可能包含环境信息。常规启动和渲染不输出诊断日志。

对插件源码的检查未发现直接发起网络请求或独立持久化会话数据的代码；尚未进行运行时网络流量验证。宿主及其他插件的数据处理、网络行为和日志由它们各自决定。

## 许可证

本项目采用 [MIT License](LICENSE)。运行时调用的宿主软件、系统字体及其他独立组件适用其各自的许可证；本仓库不分发系统字体。

## English

Minimal UI is a reading-focused interface plugin for DeepSeek Harness. The current source targets the DSH 0.2.2-rc.1 Web UI and was developed on Windows; other versions and platforms have not been verified. It uses host-provided conversation state and tasks, and reads the last displayed user message when the edit action is used. The host may persist drafts and theme changes. No direct network requests or separate conversation storage were found in the plugin source; runtime network traffic has not been checked. See [MIT License](LICENSE).
