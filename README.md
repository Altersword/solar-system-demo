# 太阳系天体模型

一个基于 Three.js 的太阳系运行可视化 demo。项目目标是用网页前端展示太阳、八大行星及部分主要卫星的运行关系，并提供时间倍速、轨道显示、标签显示、天体信息面板和本地音乐播放功能。

## 功能

- 太阳、八大行星和主要卫星的 3D 可视化
- 基于开普勒轨道元素的轨道位置计算
- 行星自转、轴倾角、轨道倾角和卫星公转
- 观赏比例 / 真实距离感两种显示模式
- 轨道线、天体标签、点击查看天体信息
- 程序化生成行星纹理、太阳辉光、地球/金星大气效果
- 本地音乐播放器，支持加载 `music` 目录中的音频，也支持手动上传音频

## 项目结构

```text
.
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── planetData.js
│   ├── orbitalMechanics.js
│   ├── solarSystem.js
│   ├── musicPlayer.js
│   └── main.js
└── music/
```

## 本地运行

在项目根目录启动一个静态服务器：

```bash
python -m http.server 4173
```

然后打开：

```text
http://127.0.0.1:4173/
```

## 音乐文件

仓库中不包含任何音乐音频文件，`music` 文件夹仅保留一个占位文件，方便本地放置音频。

浏览器不能直接读取系统绝对路径。如果需要使用内置播放列表，请在本地项目根目录下的 `music` 文件夹中自行放入合法拥有的音频文件，并保持以下文件名：

```text
First Step.mp3
Cornfield Chase.mp3
Flying Drone.mp3
Dust.mp3
Day One.mp3
The Wormhole.mp3
Mountains.mp3
Organ Variation.mp3
Tick-Tock.mp3
No Time For Caution.mp3
S.T.A.Y.mp3
```

这些音频文件已被 `.gitignore` 排除，不会随项目提交到公开仓库。也可以不放置本地文件，直接使用播放器的“上传”按钮临时加载自己的音频。

## 技术说明

- 渲染层使用 Three.js r128。
- `planetData.js` 保存真实天文数据和显示缩放配置。
- `orbitalMechanics.js` 负责开普勒方程求解和三维轨道位置计算。
- `solarSystem.js` 负责创建天体、轨道、标签、光照、点击拾取和信息面板。
- `musicPlayer.js` 负责本地音频播放列表、进度、音量和上一首/下一首控制。

## 已知限制

- 行星纹理为程序化近似纹理，不是 NASA 实拍贴图。
- 为了可视化，行星半径和轨道距离经过不同尺度压缩，不是同一真实比例。
- 当前模型是近似开普勒二体轨道，不包含行星间摄动、岁差、真实历表和相对论效应。
- 音乐不会自动播放，需要用户点击播放按钮，这是浏览器自动播放策略限制。
