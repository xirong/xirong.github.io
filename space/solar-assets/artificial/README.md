# 官方人造卫星三维资产

本目录只提供模型与来源记录，不修改页面逻辑。模型均由 NASA 官方发布的 GLB 导入 Blender 5.2.1 LTS 后整理、归一化并重新导出。

## 页面使用

| 对象键 | 网页加载文件 | 官方原始模型与署名 |
| --- | --- | --- |
| `iss` | `iss.glb` | [International Space Station (ISS) (A)](https://science.nasa.gov/3d-resources/international-space-station-iss-a/)，NASA/Ames Research Center |
| `hubble` | `hubble.glb` | [Hubble Space Telescope (A)](https://science.nasa.gov/3d-resources/hubble-space-telescope-a/)，DigitalSpace Corporation；NASA 3D Resources 发布 |
| `webb` | `webb.glb` | [James Webb Space Telescope (B)](https://science.nasa.gov/3d-resources/james-webb-space-telescope-b/)，NASA/Christopher R. Meaney |

三个最终文件使用相同约定：

- 包围盒中心位于原点，实际网格顶点到该中心的最大距离为 1，误差小于 `1e-5`。
- 按 glTF 标准导出为 Y-up，即 Y 轴朝上。节点变换已烘焙，接入时按所需显示半径统一缩放即可；三者的自然朝向沿用各自官方源模型。
- 单个 GLB 自包含，不需要额外的纹理文件、Draco 解码器或其他压缩网格扩展。
- 保留官方材质槽及贴图。哈勃包含 5 张内嵌有效贴图；ISS 和 Webb 的这两份官方模型使用材质颜色，没有图像贴图。
- ISS 保留可选的 `KHR_materials_specular` 材质扩展。Three.js r128 不处理这项附加反射参数，但可读取核心 PBR 材质。网页灯光、环境和曝光仍会影响最终观感，不能把 Blender 截图视为浏览器像素级一致性的证明。

可以在自然天体场景就绪后异步加载这些文件。加载完成后挂到对应卫星对象下，不需要让主场景等待；加载失败时由页面保留其已有表示并提供适当反馈。

## 制作过程与真实性边界

原始资产保存在 `sources/`。`sources.json` 记录官方详情、下载链接、作者和原始文件 SHA-256；重建前会校验原始文件内容。

Blender 处理包括烘焙原节点变换、整理冗余的共面网格、限制大模型的细节数量、删除不参与成像的退化面与孤立顶点，以及重新计算中心和单位半径。没有用通用卫星外形替换这三种对象，也没有给源模型增加虚构的表面贴图。

空间站采用官方 A 版的轻量模型。调查时曾下载 B 版，但原始 B 版的对照渲染中已有一组与主站体分离的组件，因此没有将 B 版作为最终交付。A 版细节较简化，适合网页中的整体外形展示。

这些是 NASA 发布的可视化模型，不是最新飞行构型的测量复原。Webb B 版的官方页面沿用发射前介绍，模型也没有清晰表达当前实物的全部镜面分块细节；它适合展示望远镜、主镜和遮阳板的整体空间关系，不宜单靠该模型讲解每块镜面的精细结构。ISS 的舱段与太阳翼也不承诺对应某个指定日期的在轨状态。

天宫、北斗、GPS、通信与气象卫星没有在本目录中用 NASA 的其他型号冒充。Chandra 与 Kepler 不属于本次主场景资产范围。

## 使用与署名

[NASA 3D Resources 官方仓库](https://github.com/nasa/NASA-3D-Resources)说明这些资源可免费使用，并要求遵守 [NASA Images and Media Usage Guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/)。指南覆盖三维模型的多边形和纹理数据，允许教育、信息展示及个人网页使用，同时要求署名，不得暗示 NASA 为使用者背书。若原始页面另行标示第三方版权，应遵守该单独声明。

页面可采用的简短署名：

> 三维模型：NASA/Ames Research Center；DigitalSpace Corporation（NASA 3D Resources 发布）；NASA/Christopher R. Meaney。经 Blender 归一化并优化用于网页展示。

模型内的 NASA 标识不能作为本站品牌或背书。这里没有为 NASA 内容声明本站所有权，也没有把它们重新标成 CC BY 许可。

## 重建与验证

从仓库根目录运行，使用独立后台 Blender 进程，不操作已打开的 Blender 场景：

```bash
/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup \
  --python-exit-code 1 --python space/solar-assets/artificial/build_models.py

/Applications/Blender.app/Contents/MacOS/Blender --background --factory-startup \
  --python-exit-code 1 --python space/solar-assets/artificial/verify_models.py -- --render
```

`build-report.json` 记录实际文件大小、三角面数、哈希和归一化结果。`verification.json` 记录对最终 GLB 重新导入后的检查，验证中心、最大顶点半径、内嵌贴图及不存在外部依赖。`verification/` 中保存相同相机和灯光下的原始/优化模型外形对照图。

本目录的体积检查包含最终 GLB、原始 GLB、脚本、说明和验证图，要求合计不超过 10,000,000 字节。最终资产无需 Draco 解码，原始文件则保留官方压缩格式以便追溯。

这里完成的是 Blender 资产与几何检查。网页中的加载、大小、朝向、昼夜响应、选择操作和手机表现仍需在接入后的实际页面验证。
